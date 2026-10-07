import { useEffect, useRef, type RefObject } from 'react'

/* ==========================================================================
   方格粒子场
   一张 canvas 上只有一套网格：字标所在的矩形被切成整数格，整块画布复用同一
   套格子索引（字标占 0..w-1 列 / 0..h-1 行，其余格子向负数与更大值延伸）。
   每个格子的边都四舍五入到同一个设备像素栅格，所以格子彼此严丝合缝、没有
   半像素缝，字与场本来就是同一张纸上的同一批格子。

   场永远在动：两层漂移噪声 + 每格相位不同的呼吸 + 自主游走的精灵（它自己会
   打戳）。站内播放器的 32 段频谱从底部升起，低频落在中间、高频散在两侧，
   节拍再额外把指针辉光撑开；没放歌时走播放器的自走频谱，场照旧呼吸。

   字标的刻法有十种，点一次换一种（见 lib/etch.ts）。

   页脚那份是同一套格子、另一种用法：只刻那一行字，不铺场，墨取最淡的一档，
   指针滑过时字上的格子被顺着走向拖开一段（见 watermark / drag 两个开关）。
   ========================================================================== */

import { BANDS, beat, readBands } from '../lib/audio'
import { buildEtch, type Etch } from '../lib/etch'

/* 与站内显示字体同源，字标才和其余标题是一套字。文楷的字体包按 unicode-range
   分片，字标这两个字所在的片要显式 load 一次才会下来，见下面的 rebuild。 */
const STACK =
  '"LXGW WenKai", "Songti SC", "Source Han Serif SC", "Noto Serif SC", "SimSun", Georgia, "Times New Roman", serif'

/** 字形超采样倍数：先放大渲染再按格取平均，细笔画才不会被阈值整段抹掉 */
const SS = 4
/** 字形覆盖率阈值 */
const CUT = 0.4
/** 字标的目标格行数：决定像素字的粗细，与 Omarchy 的 19 行同量级 */
const GLYPH_ROWS = 24
/** 格边长上下限（CSS px）：太小场过密，太大字糊 */
const CELL_MIN = 10
const CELL_MAX = 30
/** 刻写一次用时 */
const ETCH_MS = 900

/** 经典 8×8 有序抖动矩阵，取值 0..63 */
const BAYER = [
  0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60,
  28, 52, 20, 62, 30, 54, 22, 3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15, 47,
  7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21,
]

const NOISE_SIZE = 128
/** 多少个格子对应噪声的一个单位：决定漂移斑块的大小 */
const CELLS_PER_NOISE = 9
/** 指针辉光的半径，单位是格 */
const CURSOR_CELLS = 12

/** 最响的那一段能爬到场高的多少 */
const SPECTRUM_REACH = 0.92
/** 一列能有多密、以及多少列穿主墨 */
const SPECTRUM_DENSITY = 0.7
const SPECTRUM_HEAT = 0.5
/** 低于此值的频段算静息，该列不再额外起跳 */
const SPECTRUM_FLOOR = 0.08

/** 精灵的辉光相对指针的强度 */
const SPRITE_STRENGTH = 0.7
/** 精灵第一次打戳前的等待，以及两次打戳之间 */
const SPRITE_FIRST_WAIT = [1, 2] as const
const SPRITE_STAMP_WAIT = [2, 3] as const
const SPRITE_CHARGE_GLOW = 0.4
/** 精灵给戳蓄力的程度：一次轻点而已，不会是长按那种大开 */
const SPRITE_STAMP_CHARGE = [0, 0.2] as const

/** 一次按住多久算蓄满，以及戳的初始半径与增长 */
const CHARGE_TIME = 1.1
const CHARGE_FROM = 0.45
const CHARGE_GROWTH = 1.6

/** 一次节拍给辉光半径加多少，以及它衰减多快 */
const BEAT_REACH = 0.8
const BEAT_DECAY = 0.84

/** 顺着指针走向推出去多远：以「指针一帧挪了多远」为基准再乘这个系数。
    取 1 上下，粒子就几乎是跟着指针一起走、只慢一帧。 */
const WARP_DRAG = 1
/** 单帧位移上限（设备像素）：一次大跳不该把字扯散 */
const WARP_DRAG_MAX = 24
/** 拖拽跟随的松紧：越小越黏，指针停下后收得越慢 */
const WARP_EASE = 0.3
const WARP_RELEASE = 0.82

/** 文字附近收敛指针辉光的距离与曲线 */
const HUSH_REACH = 96
const CLEAR_CURVE = 3

/**
 * 点按印记：15×15 的环。点按后从一格一像素长到好几格，边扩散边
 * 透过抖动溶解；每次的节奏与终态都略微抖动，所以没有两个戳完全一样。
 */
const STAMP_SIZE = 15
const STAMP_ROWS = [
  '000011111110000',
  '000111111111000',
  '001110000011100',
  '011100000001110',
  '011000000000110',
  '111000000000011',
  '110000000000011',
  '110000000000011',
  '110000000000011',
  '111000000000011',
  '011000000000110',
  '011100000001110',
  '001110000011100',
  '000111111111000',
  '000011111110000',
]

/** 字标每行取哪一档墨，自上而下由峰档一路淡到最淡档，与 Omarchy 的 19 行
 * 分档完全一致（5 crest → 2 hover → 4 lit → 3 mid → 5 dim）。浅色纸上
 * "越重越近"，所以顶行最重、底部收到最淡，像一次印刷后墨色自上而下收干。
 * 字标行数与档数不同时按比例取档。
 */
const ROW_BANDS = [
  'crest',
  'crest',
  'crest',
  'crest',
  'crest',
  'hover',
  'hover',
  'lit',
  'lit',
  'lit',
  'lit',
  'mid',
  'mid',
  'mid',
  'dim',
  'dim',
  'dim',
  'dim',
  'dim',
] as const

type Ink = 'dim' | 'mid' | 'lit' | 'hover' | 'crest'
type Palette = Record<'bg' | Ink, string>

/** 场的六档色全部来自主题令牌，换主题只需改 CSS */
function readPalette(): Palette {
  const style = getComputedStyle(document.documentElement)
  const token = (name: string, fallback: string) => style.getPropertyValue(name).trim() || fallback
  return {
    bg: token('--field-bg', '#e9eefb'),
    dim: token('--field-dim', '#9faae6'),
    mid: token('--field-mid', '#7b85dd'),
    lit: token('--field-lit', '#565dd4'),
    hover: token('--field-hover', '#383cc0'),
    crest: token('--field-crest', '#1e2278'),
  }
}

/** 一个 CSS 颜色拆成 [r, g, b]，拆不动就返回 null */
function parse(css: string): [number, number, number] | null {
  const hex = /^#([0-9a-f]{6})$/i.exec(css.trim())
  if (hex) {
    const n = parseInt(hex[1], 16)
    return [n >> 16, (n >> 8) & 255, n & 255]
  }
  const rgb = /^rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/i.exec(css.trim())
  return rgb ? [+rgb[1], +rgb[2], +rgb[3]] : null
}

/** 两个 CSS 颜色之间取一段 */
function mix(from: string, to: string, t: number): string {
  if (t <= 0) return from
  if (t >= 1) return to
  const a = parse(from)
  const b = parse(to)
  if (!a || !b) return t < 0.5 ? from : to
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * t))
  return `rgb(${c[0]},${c[1]},${c[2]})`
}

/** 一张 128×128 的软斑噪声，作为场漂移的底 */
function buildNoise(seed: number) {
  const size = NOISE_SIZE
  let state = seed >>> 0
  const random = () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 4294967296
  }

  let field = new Float32Array(size * size)
  for (let i = 0; i < field.length; i++) field[i] = random()

  // 两遍盒式模糊把白噪声揉成软斑
  for (let pass = 0; pass < 2; pass++) {
    const next = new Float32Array(size * size)
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        let sum = 0
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const sx = (x + dx + size) % size
            const sy = (y + dy + size) % size
            sum += field[sy * size + sx]
          }
        }
        next[y * size + x] = sum / 9
      }
    }
    field = next
  }

  // 模糊会压缩动态范围，拉回满幅
  let min = Infinity
  let max = -Infinity
  for (const v of field) {
    if (v < min) min = v
    if (v > max) max = v
  }
  const span = max - min || 1
  for (let i = 0; i < field.length; i++) field[i] = (field[i] - min) / span

  return field
}

/** 一张 64×64 的固定阈值偏移瓦片，平铺到整张网格上 */
function buildJitter(seed: number) {
  let state = seed >>> 0
  const tile = new Float32Array(64 * 64)
  for (let i = 0; i < tile.length; i++) {
    state = (state * 1664525 + 1013904223) >>> 0
    tile[i] = state / 4294967296
  }
  return tile
}

/** 双线性 + smoothstep 地取噪声 */
function sample(field: Float32Array, x: number, y: number) {
  const size = NOISE_SIZE
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const fx = x - xi
  const fy = y - yi
  const x0 = ((xi % size) + size) % size
  const y0 = ((yi % size) + size) % size
  const x1 = (x0 + 1) % size
  const y1 = (y0 + 1) % size
  const sx = fx * fx * (3 - 2 * fx)
  const sy = fy * fy * (3 - 2 * fy)
  const a = field[y0 * size + x0]
  const b = field[y0 * size + x1]
  const c = field[y1 * size + x0]
  const d = field[y1 * size + x1]
  return (a * (1 - sx) + b * sx) * (1 - sy) + (c * (1 - sx) + d * sx) * sy
}

type Glyph = {
  /** 逐格的墨迹遮罩，1 为有墨 */
  mask: Uint8Array
  /** 遮罩的格宽与格高（已裁到墨迹外框） */
  w: number
  h: number
}

/** 把字形采样成点阵遮罩：墨迹恰好填满 rows 行，再裁到外框以便光学居中 */
function rasterizeGlyph(text: string, rows: number): Glyph {
  const none: Glyph = { mask: new Uint8Array(0), w: 0, h: 0 }
  if (typeof document === 'undefined' || !text) return none

  const probe = document.createElement('canvas').getContext('2d')
  if (!probe) return none
  probe.font = `bold 100px ${STACK}`
  const base = probe.measureText(text)
  const inkH = (base.actualBoundingBoxAscent || 72) + (base.actualBoundingBoxDescent || 0)
  if (!(inkH > 0)) return none
  const ratio = Math.max(0.08, base.width / inkH)
  const w = Math.max(2, Math.round(rows * ratio))

  const cv = document.createElement('canvas')
  cv.width = w * SS
  cv.height = rows * SS
  const ctx = cv.getContext('2d')
  if (!ctx) return none

  const size = (100 * rows * SS) / inkH
  ctx.font = `bold ${size}px ${STACK}`
  ctx.fillStyle = '#000'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'

  const m = ctx.measureText(text)
  const asc = m.actualBoundingBoxAscent
  const desc = m.actualBoundingBoxDescent
  const ink = asc + desc || rows * SS
  ctx.fillText(text, (w * SS) / 2, (rows * SS - ink) / 2 + asc)

  const data = ctx.getImageData(0, 0, cv.width, cv.height).data
  const raw = new Uint8Array(w * rows)
  for (let gy = 0; gy < rows; gy++) {
    for (let gx = 0; gx < w; gx++) {
      let sum = 0
      for (let sy = 0; sy < SS; sy++) {
        const rowBase = (gy * SS + sy) * cv.width
        for (let sx = 0; sx < SS; sx++) sum += data[(rowBase + gx * SS + sx) * 4 + 3]
      }
      if (sum / (SS * SS) > CUT * 255) raw[gy * w + gx] = 1
    }
  }

  let top = rows
  let bottom = -1
  let left = w
  let right = -1
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < w; x++) {
      if (!raw[y * w + x]) continue
      if (y < top) top = y
      if (y > bottom) bottom = y
      if (x < left) left = x
      if (x > right) right = x
    }
  }
  if (bottom < 0) return none

  const h = bottom - top + 1
  const cw = right - left + 1
  const mask = new Uint8Array(cw * h)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < cw; x++) mask[y * cw + x] = raw[(y + top) * w + x + left]
  }
  return { mask, w: cw, h }
}

type Ping = {
  x: number
  y: number
  born: number
  /** 起手与绽放时，一个印记像素占几格 */
  from: number
  to: number
  /** 绽放并溶解所用的秒数 */
  life: number
}

const between = ([lo, hi]: readonly [number, number]) => lo + Math.random() * (hi - lo)

export default function PixelField({
  text,
  runId,
  anchorRef,
  reduced = false,
  fieldClass = 'hero-field',
  canvasClass = 'hero-canvas',
  etchOnEnter = false,
  drag = false,
  watermark = false,
}: {
  text: string
  /** 变一次就把字标重刻一遍 */
  runId: number
  /** 字标占位块：整张网格的锚点 */
  anchorRef: RefObject<HTMLElement | null>
  reduced?: boolean
  /** 场所在的外壳与画布：首屏与页脚各有一套同形的样式 */
  fieldClass?: string
  canvasClass?: string
  /** 首屏一进场就刻；页脚在首屏之外，等它真的进了视口再刻 */
  etchOnEnter?: boolean
  /** 指针滑过时，附近的粒子顺着走的方向被拖开一段，停下再松开。首屏只留辉光，不挪位置 */
  drag?: boolean
  /** 水印：只要那一行字，不铺周围的场，墨一律取最淡的一档，也不落戳 */
  watermark?: boolean
}) {
  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const textRef = useRef(text)
  const reducedRef = useRef(reduced)
  const runIdRef = useRef(runId)
  /** 本次刻写的起始时刻 */
  const etchRef = useRef(0)
  const rebuildRef = useRef<() => void>(() => {})
  const restartRef = useRef<() => void>(() => {})
  const repaintRef = useRef<() => void>(() => {})

  textRef.current = text
  reducedRef.current = reduced

  useEffect(() => {
    runIdRef.current = runId
    etchRef.current = performance.now()
    restartRef.current()
  }, [runId])

  useEffect(() => {
    rebuildRef.current()
  }, [text])

  useEffect(() => {
    const host = hostRef.current
    const canvas = canvasRef.current
    if (!host || !canvas) return
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const noise = buildNoise(0x4a4ee0)
    const jitter = buildJitter(0x161a3a)

    let palette = readPalette()

    /** 字标每行静息时的墨色，按当前主题的六档算出 */
    let restInks: string[] = []
    /* 水印整字只取最淡的一档：底下要压四栏文字，任何一档重墨都会把字读糊 */
    const buildRestInks = (h: number) => {
      restInks = []
      for (let row = 0; row < h; row++) {
        if (watermark) {
          restInks.push(palette.dim)
          continue
        }
        const raw = Math.floor((row / h) * ROW_BANDS.length)
        restInks.push(palette[ROW_BANDS[raw]])
      }
    }

    // 设备像素几何，随尺寸重算。一切都画在整设备像素上，格子边缘才锐利。
    let dpr = 1
    let width = 0
    let height = 0
    let cols = 0
    let rows = 0
    // 一套网格，锚在字标上：字标占 0..w-1 列 / 0..h-1 行，其余格子向负数
    // 与更大值延伸。每个格边都四舍五入到同一条栅格线，所以处处严丝合缝。
    let wmX = 0
    let wmY = 0
    let wmCW = 10
    let wmCH = 10
    let cMin = 0
    let rMin = 0
    let glyph: Glyph = { mask: new Uint8Array(0), w: 0, h: 0 }
    let ramp = new Float32Array(0)

    /** 本次的刻写表：与字标同尺寸，进度阈值逐格一张 */
    let etchRun: Etch | null = null
    let etchFor = { runId: -1, w: 0, h: 0 }
    /** 尺寸没变、runId 没变就沿用上一张，免得 resize 把刻法洗掉 */
    const refreshEtch = () => {
      const id = runIdRef.current
      if (etchRun && etchFor.runId === id && etchFor.w === glyph.w && etchFor.h === glyph.h) return
      etchRun = buildEtch(glyph.w, glyph.h, id, etchRun?.id)
      etchFor = { runId: id, w: glyph.w, h: glyph.h }
    }

    /** 场要让开的元素：站头控件，以及标了 data-hero-quiet 的带状信息 */
    const quiet = [
      ...document.querySelectorAll<HTMLElement>('header a, header button'),
      ...document.querySelectorAll<HTMLElement>('[data-hero-quiet]'),
    ]

    const pointer = { x: -1e4, y: -1e4 }
    /** 指针上一帧落在哪儿、这两帧把它拽了多远——拖拽由这个差量给出 */
    let lastPX = -1e4
    let lastPY = -1e4
    let dragX = 0
    let dragY = 0
    /** 自主游走的精灵：在哪、这一帧多亮 */
    const sprite = { x: -1e4, y: -1e4, strength: 0 }
    let visible = true
    let strength = 0
    let targetStrength = 0
    let pings: Ping[] = []
    let holding: { x: number; y: number; start: number } | null = null
    let spriteHold: { x: number; y: number; start: number; charge: number } | null = null
    let spriteStampAt = Infinity

    const launch = (x: number, y: number, charge: number, now: number) => {
      const from = CHARGE_FROM + CHARGE_GROWTH * charge
      pings = [
        ...pings.slice(-3),
        {
          x,
          y,
          born: now,
          from,
          to: (from + 1 + 3.2 * charge) * (0.92 + Math.random() * 0.16),
          life: (0.65 + 0.55 * charge) * (0.92 + Math.random() * 0.16),
        },
      ]
    }

    /** 0..1：一次按住蓄了多少力 */
    const chargeOf = (now: number, start: number) =>
      Math.min((now - start) / 1000 / CHARGE_TIME, 1)

    const measure = () => {
      const box = host.getBoundingClientRect()
      if (box.width < 1 || box.height < 1) return false

      dpr = Math.min(window.devicePixelRatio || 1, 2)
      const nextWidth = Math.round(box.width * dpr)
      const nextHeight = Math.round(box.height * dpr)
      // 改 canvas.width 会清空缓冲，所以只在尺寸真的变了才改：拖拽缩放会
      // 连续触发，每一次无谓的重置都会闪一下空底。
      if (nextWidth !== width || nextHeight !== height) {
        width = nextWidth
        height = nextHeight
        canvas.width = width
        canvas.height = height
      }
      canvas.style.width = `${box.width}px`
      canvas.style.height = `${box.height}px`

      // 字标占位块：先定格边长，再把字形按这个边长采样成点阵
      const slot = anchorRef.current
      const slotBox = slot?.getBoundingClientRect()
      if (!slotBox || slotBox.width < 1 || slotBox.height < 1) return false

      const cellCss = Math.min(
        CELL_MAX,
        Math.max(CELL_MIN, slotBox.height / GLYPH_ROWS),
      )
      const wantRows = Math.max(6, Math.round(slotBox.height / cellCss))
      glyph = rasterizeGlyph(textRef.current, wantRows)
      if (!glyph.w) return false
      buildRestInks(glyph.h)
      refreshEtch()

      // 格子取正：宽高共用同一个边长，格子永远是方的
      const cell = Math.min(slotBox.height / glyph.h, slotBox.width / glyph.w)
      wmCW = cell * dpr
      wmCH = cell * dpr
      wmX = (slotBox.left - box.left) * dpr + ((slotBox.width - glyph.w * cell) * dpr) / 2
      wmY = (slotBox.top - box.top) * dpr + ((slotBox.height - glyph.h * cell) * dpr) / 2

      cMin = -Math.ceil(wmX / wmCW) - 1
      rMin = -Math.ceil(wmY / wmCH) - 1
      cols = Math.ceil((width - wmX) / wmCW) - cMin + 1
      rows = Math.ceil((height - wmY) / wmCH) - rMin + 1

      // 场心密、四角疏：椭圆渐隐，再按纵向压一档，让首屏下半留白
      ramp = new Float32Array(cols * rows)
      for (let r = 0; r < rows; r++) {
        const y = wmY + (rMin + r + 0.5) * wmCH
        const ny = (y / height) * 2 - 1
        const clear = Math.min(1, Math.max(0.16, (y / dpr - 24) / 130))
        for (let c = 0; c < cols; c++) {
          const x = wmX + (cMin + c + 0.5) * wmCW
          const nx = (x / width) * 2 - 1
          const rr = Math.sqrt(nx * nx + ny * ny * 0.82)
          const eased = Math.min(1, Math.max(0, (rr - 0.42) / 0.85))
          ramp[r * cols + c] = eased * eased * clear
        }
      }
      return true
    }

    const draw = (time: number) => {
      const t = reducedMotion ? 0 : time / 1000
      const etch = reducedMotion ? 1 : Math.min(1, (time - etchRef.current) / ETCH_MS)
      refreshQuiet(time)

      let spriteGoal = 0
      /* 水印场上没有别的东西：那枚游走的精灵连同它打的戳一并省掉 */
      if (!reducedMotion && !watermark) {
        const ts = time / 1000
        const rx = 0.44 * (1 + 0.1 * Math.sin(ts * 0.11))
        const ry = 0.38 * (1 + 0.1 * Math.sin(ts * 0.09 + 2))
        sprite.x = width * (0.5 + rx * Math.sin(ts * 0.65))
        sprite.y = height * (0.48 + ry * Math.sin(ts * 0.39 + 1.1))
        const box = host.getBoundingClientRect()
        spriteGoal = strengthAt(box.left + sprite.x / dpr, box.top + sprite.y / dpr) * SPRITE_STRENGTH

        if (spriteStampAt === Infinity) {
          spriteStampAt = time + between(SPRITE_FIRST_WAIT) * 1000
        }
        if (!spriteHold && time >= spriteStampAt) {
          spriteHold = {
            x: sprite.x,
            y: sprite.y,
            start: time,
            charge: between(SPRITE_STAMP_CHARGE),
          }
        }
        if (spriteHold) {
          spriteHold.x = sprite.x
          spriteHold.y = sprite.y
          spriteGoal *= SPRITE_CHARGE_GLOW
          if (chargeOf(time, spriteHold.start) >= spriteHold.charge) {
            launch(spriteHold.x, spriteHold.y, spriteHold.charge, time)
            spriteHold = null
            spriteStampAt = time + between(SPRITE_STAMP_WAIT) * 1000
          }
        }
      }
      sprite.strength += (spriteGoal - sprite.strength) * 0.08

      // 指针本身不平滑：光标底下的格子就是被点亮的那几格，只把进出场的
      // 响应缓一缓
      strength += (targetStrength - strength) * 0.3

      ctx.fillStyle = palette.bg
      ctx.fillRect(0, 0, width, height)

      // 频谱直接问站内播放器要：它在放歌就给真实频谱，没放歌就给一条自走的
      // 伪频谱，所以场任何时候都在呼吸。节拍也从它那里取，已按帧衰减。
      const live = readBands(bands, time)
      const specGain = live ? 1 : 0.72
      beatPulse = Math.max(beatPulse * BEAT_DECAY, beat())
      if (beatPulse < 0.005) beatPulse = 0

      const reachOf = (level: number) =>
        CURSOR_CELLS * wmCW * (0.45 + 0.55 * level) * (1 + BEAT_REACH * beatPulse)
      const glows: { x: number; y: number; strength: number; reach: number }[] = []
      if (strength > 0.01) glows.push({ x: pointer.x, y: pointer.y, strength, reach: reachOf(strength) })
      if (sprite.strength > 0.01)
        glows.push({ x: sprite.x, y: sprite.y, strength: sprite.strength, reach: reachOf(sprite.strength) })

      /* 指针这两帧挪了多远。指针停下或离场，这一份拖拽就慢慢收回——收得比
         跟随时慢，粒子才像是被松开的，不是弹回去的。首屏不参与拖拽，这份
         差量也就不必算。 */
      if (drag && strength > 0.01) {
        if (lastPX < -1e3) {
          lastPX = pointer.x
          lastPY = pointer.y
        }
        const rawX = Math.max(-WARP_DRAG_MAX, Math.min(WARP_DRAG_MAX, pointer.x - lastPX))
        const rawY = Math.max(-WARP_DRAG_MAX, Math.min(WARP_DRAG_MAX, pointer.y - lastPY))
        dragX += (rawX - dragX) * WARP_EASE
        dragY += (rawY - dragY) * WARP_EASE
      } else {
        dragX *= WARP_RELEASE
        dragY *= WARP_RELEASE
      }
      lastPX = pointer.x
      lastPY = pointer.y

      /* 一格该被拽到哪儿：顺着指针这一两帧的走向推一段。位置挪、格子本身
         不跟着缩放——跟着缩放读起来是「放大」，不是「被拖开」。
         写在闭包外的两个变量里，省掉每格一次的对象分配——一屏几千格。 */
      const pointerReach = reducedMotion || !drag ? 0 : reachOf(strength)
      let shiftX = 0
      let shiftY = 0
      const shiftAt = (cx: number, cy: number) => {
        shiftX = 0
        shiftY = 0
        if (strength <= 0.01) return
        const dx = cx - pointer.x
        const dy = cy - pointer.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist >= pointerReach) return
        const falloff = 1 - dist / pointerReach
        const amount = falloff * falloff * strength
        shiftX = dragX * amount * WARP_DRAG
        shiftY = dragY * amount * WARP_DRAG
      }

      // 每个活着的戳每帧只解一次，不是每格解一次
      const stamps: { x: number; y: number; cellPx: number; amp: number }[] = []
      if (pings.length > 0) {
        pings = pings.filter((ping) => (time - ping.born) / 1000 < ping.life)
        for (const ping of pings) {
          const age = (time - ping.born) / 1000 / ping.life
          const grow = 1 - (1 - age) ** 3
          stamps.push({
            x: ping.x,
            y: ping.y,
            cellPx: wmCW * (ping.from + (ping.to - ping.from) * grow),
            amp: (1 - age) ** 1.7,
          })
        }
      }
      for (const charging of [holding, spriteHold]) {
        if (!charging) continue
        stamps.push({
          x: charging.x,
          y: charging.y,
          cellPx: wmCW * (CHARGE_FROM + CHARGE_GROWTH * chargeOf(time, charging.start)),
          amp: 0.9,
        })
      }

      /** 盖住某个设备像素点的最强活戳 */
      const stampAt = (cx: number, cy: number) => {
        let amp = 0
        for (const stamp of stamps) {
          const lx = Math.floor((cx - stamp.x) / stamp.cellPx + STAMP_SIZE / 2)
          const ly = Math.floor((cy - stamp.y) / stamp.cellPx + STAMP_SIZE / 2)
          if (lx < 0 || ly < 0 || lx >= STAMP_SIZE || ly >= STAMP_SIZE) continue
          if (STAMP_ROWS[ly][lx] === '1' && stamp.amp > amp) amp = stamp.amp
        }
        return amp
      }

      /* 落墨按档攒进三条路径，整屏只换三次笔、只画三次。原来每一格都设一次
         fillStyle、画一次 fillRect：一屏几千格，就是几千次颜色串解析加几千次
         调用，正好压在滚动上，是首屏最重的一笔。 */
      const dimPath = new Path2D()
      const midPath = new Path2D()
      const litPath = new Path2D()

      for (let r = 0; r < rows; r++) {
        const row = rMin + r
        const yTop = wmY + row * wmCH
        const y = Math.round(yTop)
        const cellH = Math.round(yTop + wmCH) - y
        const cy = yTop + wmCH / 2
        for (let c = 0; c < cols; c++) {
          const col = cMin + c
          /* 水印场上一个粒子也不铺：这一圈整圈走空，页脚上只剩那一行字 */
          if (watermark) continue
          // 字标那几格由下面的字标循环落墨，这里跳过
          if (
            col >= 0 &&
            col < glyph.w &&
            row >= 0 &&
            row < glyph.h &&
            glyph.mask[row * glyph.w + col]
          ) {
            continue
          }

          const shade = ramp[r * cols + c]
          let lum = 0

          if (shade > 0.002) {
            const u = col / CELLS_PER_NOISE
            const v = row / CELLS_PER_NOISE
            const drift =
              0.6 * sample(noise, u + t * 0.14, v - t * 0.055) +
              0.4 * sample(noise, u * 0.55 - t * 0.08, v * 0.55 + t * 0.06)

            const twinkle =
              0.5 + 0.5 * Math.sin(t * 1.1 + jitter[(row * 37 + col * 11) & 4095] * 6.283)

            lum = shade * (0.3 + 0.52 * drift * drift + 0.18 * twinkle) * 0.62
          }

          const xLeft = wmX + col * wmCW
          const cx = xLeft + wmCW / 2
          shiftAt(cx, cy)

          let glowAmount = 0
          for (const glow of glows) {
            const dx = cx - glow.x
            const dy = cy - glow.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist < glow.reach) {
              const falloff = 1 - dist / glow.reach
              const amount = falloff * falloff * glow.strength
              if (amount > glowAmount) glowAmount = amount
            }
          }
          lum += glowAmount * 0.6

          let waveAmount = 0
          if (stamps.length > 0) {
            waveAmount = stampAt(cx, cy)
            lum += waveAmount * 1.15
          }

          let specAmount = 0
          if (shade > 0.002) {
            // 低频落在版心，高频散向两侧
            const across = (c + 0.5) / cols
            const side = Math.abs(across - 0.5) * 2
            const bandPos = (1 - side) * BANDS - 0.5
            const b0 = Math.max(0, Math.min(BANDS - 1, Math.floor(bandPos)))
            const b1 = Math.min(BANDS - 1, b0 + 1)
            const blend = Math.max(0, Math.min(1, bandPos - b0))
            const raw = bands[b0] * (1 - blend) + bands[b1] * blend
            const level = Math.max(0, (raw - SPECTRUM_FLOOR) / (1 - SPECTRUM_FLOOR))
            const fromBottom = rows - 1 - r
            const tall = level * rows * SPECTRUM_REACH
            if (level > 0 && fromBottom < tall) {
              specAmount = level * (1 - fromBottom / tall) ** 0.85
              lum += specAmount * SPECTRUM_DENSITY * specGain * Math.min(1, shade * 3)
            }
          }

          // 纯 Bayer 会在各处点亮同样的低位格，这个密度下会读成规则点阵，
          // 所以再叠一个每格固定的偏移：静息时散开，指针推高亮度时有序的
          // 结构才显出来
          const threshold =
            0.78 * ((BAYER[(row & 7) * 8 + (col & 7)] + 0.5) / 64) +
            0.22 * jitter[(row & 63) * 64 + (col & 63)]
          if (lum <= threshold) continue

          // 墨档只看这一格被谁加热过：指针、戳印、频谱取最强的那一个，
          // 静息一律最淡档。有序抖动的结构因此只在被推亮的地方显形。
          const heat = Math.max(glowAmount, waveAmount, specAmount * SPECTRUM_HEAT)
          /* 格子的边长仍按原来的栅格取，只把落点挪开：粒子被拽走的是位置，
             不是大小——跟着缩放的格子读起来是「缩放」，不是「拖拽」。 */
          const x = Math.round(xLeft) + Math.round(shiftX)
          const cellW = Math.round(xLeft + wmCW) - Math.round(xLeft)
          const wy = y + Math.round(shiftY)
          if (heat > 0.34) litPath.rect(x, wy, cellW, cellH)
          else if (heat > 0.1) midPath.rect(x, wy, cellW, cellH)
          else dimPath.rect(x, wy, cellW, cellH)
        }
      }

      ctx.fillStyle = palette.dim
      ctx.fill(dimPath)
      ctx.fillStyle = palette.mid
      ctx.fill(midPath)
      ctx.fillStyle = palette.lit
      ctx.fill(litPath)

      const glowsOnMark = glows.filter(
        (glow) =>
          glow.x > wmX - glow.reach &&
          glow.x < wmX + glyph.w * wmCW + glow.reach &&
          glow.y > wmY - glow.reach &&
          glow.y < wmY + glyph.h * wmCH + glow.reach,
      )
      const cursorOnMark = !watermark && glowsOnMark.length > 0

      /** 字标某格取什么墨：静息取本行档位，被戳扫过或指针掠过则提亮 */
      const markInk = (cx: number, cy: number, row: number) => {
        let crest = stamps.length > 0 ? stampAt(cx, cy) : 0
        for (const glow of glowsOnMark) {
          const dx = cx - glow.x
          const dy = cy - glow.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < glow.reach) {
            const falloff = 1 - dist / glow.reach
            const hit = falloff * falloff * glow.strength
            if (hit > crest) crest = hit
          }
        }
        return crest > 0.45 ? palette.crest : crest > 0.12 ? palette.hover : restInks[row]
      }

      /* 指针在场里、这一帧真有位移可算时，字标才走逐格那条路：整行整段落墨
         是拿位置换速度的，一走它就挪不动了 */
      const shiftActive = pointerReach > 0 && strength > 0.01

      // 格边都四舍五入到同一条分数栅格线，相邻格因此永远恰好相接：字里没有
      // 缝，外缘也落在整像素上
      for (let row = 0; row < glyph.h; row++) {
        const yTop = wmY + row * wmCH
        const y = Math.round(yTop)
        const rowHeight = Math.round(yTop + wmCH) - y

        // 静息且没人打扰：整行整段落墨，一次 fillRect 顶掉几十次
        if (etch >= 1 && stamps.length === 0 && !cursorOnMark && !shiftActive) {
          ctx.fillStyle = restInks[row]
          let run = 0
          for (let col = 0; col <= glyph.w; col++) {
            if (glyph.mask[row * glyph.w + col]) {
              run++
              continue
            }
            if (run > 0) {
              const x = Math.round(wmX + (col - run) * wmCW)
              ctx.fillRect(x, y, Math.round(wmX + col * wmCW) - x, rowHeight)
              run = 0
            }
          }
          continue
        }

        for (let col = 0; col < glyph.w; col++) {
          if (!glyph.mask[row * glyph.w + col]) continue
          const xLeft = wmX + col * wmCW
          const baseX = Math.round(xLeft)
          const cellW = Math.round(xLeft + wmCW) - baseX
          // 字标也吃这一份位移：指针滑过时笔画被拖着走，粒子字才真是粒子做的
          shiftAt(xLeft + wmCW / 2, yTop + wmCH / 2)
          const x = baseX + Math.round(shiftX)
          const wy = y + Math.round(shiftY)

          if (etch < 1) {
            // 刻写：这一格该在第几成进度落墨由刻法给出。还没轮到的就是空的——
            // 字标从空白处一笔一笔长出来，而不是先铺一层底墨再变色。刚刻到的
            // 一瞬在波前上顶一线峰档，拖尾长度随刻法变。
            const order = etchRun ? etchRun.order[row * glyph.w + col] : 0
            if (order > etch) continue
            const flash = Math.max(0, 1 - (etch - order) / (etchRun?.trail ?? 0.22))
            /* 水印不落重墨：刻到的一瞬也只顶到中档，免得整行字突然发黑 */
            ctx.fillStyle = mix(restInks[row], watermark ? palette.mid : palette.crest, flash * 0.85)
            ctx.fillRect(x, wy, cellW, rowHeight)
            continue
          }

          ctx.fillStyle = watermark ? restInks[row] : markInk(xLeft + wmCW / 2, yTop + wmCH / 2, row)
          ctx.fillRect(x, wy, cellW, rowHeight)
        }
      }
    }

    // 声场平滑后的电平与节拍脉冲，绘制循环私有
    const bands = new Float32Array(BANDS)
    let beatPulse = 0

    /**
     * 要让开的那几件的位置。页头是 fixed 的，这些矩形不随滚动变，所以量一次
     * 存着就够，只有换语言、改视口这类版式变化才需要重取。原来每帧都对十来个
     * 元素各量一次 getBoundingClientRect，是绘制循环里一笔白花的开销。
     */
    let quietBoxes: { left: number; top: number; right: number; bottom: number }[] = []
    let quietAt = -1e9
    const refreshQuiet = (time: number) => {
      if (time - quietAt < 400) return
      quietAt = time
      quietBoxes = []
      for (const el of quiet) {
        const rect = el.getBoundingClientRect()
        if (rect.width < 1 || rect.height < 1) continue
        quietBoxes.push({ left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom })
      }
    }

    const strengthAt = (clientX: number, clientY: number) => {
      let nearest = Infinity
      for (const box of quietBoxes) {
        const dx = Math.max(box.left - clientX, 0, clientX - box.right)
        const dy = Math.max(box.top - clientY, 0, clientY - box.bottom)
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < nearest) nearest = dist
      }
      return nearest >= HUSH_REACH ? 1 : (nearest / HUSH_REACH) ** CLEAR_CURVE
    }

    const locate = (event: PointerEvent) => {
      refreshQuiet(performance.now())
      const box = host.getBoundingClientRect()
      const inside =
        event.clientX >= box.left &&
        event.clientX <= box.right &&
        event.clientY >= box.top &&
        event.clientY <= box.bottom
      return {
        inside,
        strength: strengthAt(event.clientX, event.clientY),
        x: (event.clientX - box.left) * dpr,
        y: (event.clientY - box.top) * dpr,
      }
    }

    /** 控件上的点按不落戳，交互原样交给控件 */
    const onControl = (target: EventTarget | null) =>
      target instanceof Element &&
      target.closest(
        'a, button, input, select, textarea, label, [role="button"], header, [data-no-stamp]',
      ) !== null

    const onPointerMove = (event: PointerEvent) => {
      if (!visible) return
      const { inside, strength: level, x, y } = locate(event)
      if (!holding) targetStrength = inside ? level : 0
      if (!inside) return
      pointer.x = x
      pointer.y = y
      if (reducedMotion) draw(0)
    }

    const onPointerDown = (event: PointerEvent) => {
      /* 水印场只有「滑过拖开」这一种交互：按住蓄力落戳那一套不参与 */
      if (watermark || !visible || reducedMotion || onControl(event.target)) return
      const { inside, x, y } = locate(event)
      if (!inside) return
      pointer.x = x
      pointer.y = y
      targetStrength = 0
      holding = { x, y, start: performance.now() }
    }

    const onPointerUp = (event: PointerEvent) => {
      if (!holding) return
      if (finePointer) {
        const { inside, strength: level } = locate(event)
        targetStrength = inside ? level : 0
      }
      const now = performance.now()
      launch(holding.x, holding.y, chargeOf(now, holding.start), now)
      holding = null
    }

    const onPointerCancel = () => {
      holding = null
    }

    let frame = 0
    let lastDraw = 0
    /* 场是漂移的噪声，三十帧和六十帧看不出分别，省下的一半正好留给滚动。
       首屏只露出一角时再放慢一档——那点像素本来也读不清，却和滚动抢同一份
       帧预算。 */
    let interval = 33
    const loop = (time: number) => {
      frame = requestAnimationFrame(loop)
      if (time - lastDraw < interval) return
      lastDraw = time
      draw(time)
    }

    let drawing = false
    const startDrawing = () => {
      if (drawing) return
      drawing = true
      if (reducedMotion) draw(0)
      else frame = requestAnimationFrame(loop)
    }
    if (measure()) startDrawing()

    /** 换一种刻法：重算刻写表，把这一笔从头刻起 */
    restartRef.current = () => {
      if (!measure()) return
      refreshEtch()
      if (reducedMotion) {
        draw(0)
        return
      }
      drawing = true
      if (frame === 0) frame = requestAnimationFrame(loop)
      draw(performance.now())
    }

    repaintRef.current = () => {
      if (reducedMotion) draw(0)
    }

    // 出场时停画，别让看不见的场空转
    let entered = false
    const visibility = new IntersectionObserver(
      ([entry]) => {
        const was = visible
        visible = entry.isIntersecting
        interval = entry.intersectionRatio >= 0.98 ? 33 : 66
        /* 页脚那块在首屏之外：字标不该在看不见的地方刻完，等它真的进视口再落笔 */
        if (etchOnEnter && visible && !was && !entered) {
          entered = true
          etchRef.current = performance.now()
          refreshEtch()
        }
        if (reducedMotion) return
        if (visible && frame === 0) frame = requestAnimationFrame(loop)
        else if (!visible && frame !== 0) {
          cancelAnimationFrame(frame)
          frame = 0
        }
      },
      { rootMargin: '64px' },
    )
    visibility.observe(host)

    if (finePointer) window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerdown', onPointerDown, { passive: true })
    window.addEventListener('pointerup', onPointerUp, { passive: true })
    window.addEventListener('pointercancel', onPointerCancel, { passive: true })
    window.addEventListener('contextmenu', onPointerCancel, { passive: true })

    const observer = new ResizeObserver(() => {
      if (!measure()) return
      startDrawing()
      // 同一次 resize 里立刻重绘：等被节流的下一帧会在拖拽中途留下一片空底
      draw(reducedMotion ? 0 : lastDraw)
    })
    observer.observe(host)
    const slot = anchorRef.current
    if (slot) observer.observe(slot)

    const rebuild = () => {
      if (measure()) {
        startDrawing()
        draw(reducedMotion ? 0 : lastDraw)
      }
    }
    rebuildRef.current = rebuild

    // 字体到位后字宽会变，量一次真正的墨迹外框。fonts.ready 只保证"已经发出的
    // 请求"都完成了，而字标是画在 canvas 上的、DOM 里没有这两个字，浏览器不会
    // 主动去取它所在的片，所以要按字标文本显式 load 一次，否则字标会一直停在
    // 回落的宋体上。
    const fonts = document.fonts
    if (fonts) {
      Promise.all([
        fonts.load(`bold 100px ${STACK}`, textRef.current).catch(() => null),
        fonts.ready,
      ]).then(() => {
        if (!drawing) return
        rebuild()
      })
    }

    return () => {
      cancelAnimationFrame(frame)
      frame = 0
      observer.disconnect()
      visibility.disconnect()
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerCancel)
      window.removeEventListener('contextmenu', onPointerCancel)
      rebuildRef.current = () => {}
      restartRef.current = () => {}
      repaintRef.current = () => {}
    }
  }, [anchorRef])

  return (
    <div className={fieldClass} ref={hostRef} aria-hidden="true">
      <canvas className={canvasClass} ref={canvasRef} />
    </div>
  )
}
