/**
 * 字标的十种刻法。
 *
 * 每种刻法只回答一件事：字标的某一格在第几成进度上落墨。结果是一张与字标
 * 等大的 0..1 表——0 最先落墨，1 最后。绘制循环拿当前进度和这张表一比，就
 * 知道哪一格已经刻定、哪一格还压在波前上。表随字标的格宽格高一次算好，之后
 * 每帧只做一次比较，不逐帧重算。
 */

export type EtchId =
  | 'diagonal'
  | 'press'
  | 'bloom'
  | 'collapse'
  | 'rain'
  | 'decode'
  | 'louvre'
  | 'pour'
  | 'ripple'
  | 'shutter'

export interface Etch {
  id: EtchId
  /** 逐格落墨的进度阈值，长度 w × h */
  order: Float32Array
  /** 波前高光的拖尾长度，以进度为单位：越小越脆，越大越晕 */
  trail: number
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)

/** 稳定的逐格散列：读起来是随机的，但同一个下标永远同一个值。返回值必须
 *  落在 0..1 —— 末尾的 ^ 是带符号运算，不补一次 >>> 0 会有一半概率是负数，
 *  拿它当抖动偏移就会把整列往前推。 */
const hash = (n: number) => {
  let x = Math.imul(n, 2654435761) >>> 0
  x ^= x >>> 15
  x = Math.imul(x, 2246822519) >>> 0
  x ^= x >>> 13
  return (x >>> 0) / 4294967296
}

/**
 * 32 位整数雪崩：runId 是 0、1、2… 连号的，相邻种子只差一个常数，直接拿去
 * 当 LCG 的种子，头几次输出也彼此相邻，挑出来的刻法会以固定步长在几个值上
 * 来回走。先雪崩一次，种子之间才互不相关。
 */
const mix32 = (n: number) => {
  let x = n >>> 0
  x = Math.imul(x ^ (x >>> 16), 0x7feb352d) >>> 0
  x = Math.imul(x ^ (x >>> 15), 0x846ca68b) >>> 0
  return (x ^ (x >>> 16)) >>> 0
}

type Cut = {
  id: EtchId
  trail: number
  /** 一格在第几成进度落墨 */
  at: (col: number, row: number, w: number, h: number, rnd: () => number) => number
}

const CUTS: Cut[] = [
  {
    // 一道斜向波前自左上推过
    id: 'diagonal',
    trail: 0.22,
    at: (col, row, w, h) => (col + row) / Math.max(1, w - 1 + h - 1),
  },
  {
    // 逐行压印，行内带一点手压的抖动
    id: 'press',
    trail: 0.14,
    at: (col, row, _w, h) => (row + 0.5 * hash(col * 7 + row * 131)) / Math.max(1, h),
  },
  {
    // 自中心向外绽放
    id: 'bloom',
    trail: 0.3,
    at: (col, row, w, h) => {
      const cx = (w - 1) / 2
      const cy = (h - 1) / 2
      return clamp01(Math.hypot(col - cx, row - cy) / (Math.hypot(cx, cy) || 1))
    },
  },
  {
    // 自四周向心收拢
    id: 'collapse',
    trail: 0.3,
    at: (col, row, w, h) => {
      const cx = (w - 1) / 2
      const cy = (h - 1) / 2
      return clamp01(1 - Math.hypot(col - cx, row - cy) / (Math.hypot(cx, cy) || 1))
    },
  },
  {
    // 数字雨：每列错峰起落，列内自上而下
    id: 'rain',
    trail: 0.18,
    at: (col, row, _w, h) => clamp01((row / Math.max(1, h)) * 0.55 + hash(col * 97) * 0.45),
  },
  {
    // 逐格解码：分五轮乱序显形，读起来像在解一段乱码
    id: 'decode',
    trail: 0.1,
    at: (_col, _row, _w, _h, rnd) => {
      const round = rnd()
      const within = rnd()
      return clamp01((Math.floor(round * 5) / 5) * 0.72 + within * 0.28)
    },
  },
  {
    // 横向百叶：奇偶行交错着往下合
    id: 'louvre',
    trail: 0.16,
    at: (_col, row, _w, h) =>
      clamp01((Math.floor(row / 2) / Math.max(1, h / 2)) * 0.82 + (row % 2) * 0.18),
  },
  {
    // 自左向右逐列倾泻
    id: 'pour',
    trail: 0.2,
    at: (col, _row, w, _h, rnd) => clamp01((col + rnd() * 0.5) / Math.max(1, w)),
  },
  {
    // 中心涟漪：等距的同心环，环上带一点角向起伏
    id: 'ripple',
    trail: 0.26,
    at: (col, row, w, h) => {
      const cx = (w - 1) / 2
      const cy = (h - 1) / 2
      const dx = col - cx
      const dy = row - cy
      const d = Math.hypot(dx, dy) / (Math.hypot(cx, cy) || 1)
      return clamp01(d + 0.09 * Math.sin(Math.atan2(dy, dx) * 7))
    },
  },
  {
    // 从中线向上下展开，像一次快门
    id: 'shutter',
    trail: 0.24,
    at: (_col, row, _w, h) => {
      const mid = (h - 1) / 2
      return clamp01(Math.abs(row - mid) / (mid || 1))
    },
  },
]

/** 0..n-1 的一个乱序队列，顺序由 cycle 决定；同一个 cycle 永远同一个顺序 */
function queue(cycle: number, n: number): number[] {
  const order = Array.from({ length: n }, (_, i) => i)
  let state = mix32((cycle ^ 0x4a4ee0) >>> 0)
  const rnd = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    return state / 4294967296
  }
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    const swap = order[i]
    order[i] = order[j]
    order[j] = swap
  }
  return order
}

/**
 * 按字标的格宽格高算一张刻写表。seed 变一次就换一种刻法；同一个 seed 与尺寸
 * 永远得到同一张表，所以 resize 不会把刻法打乱。
 *
 * 选法走的是「十种排成一队、挨个点过去」，不是每次独立抽：独立抽的话十次里
 * 平均只翻得出六种半，连点几下很容易撞见刚看过的那一种，读起来就像只有一
 * 两种动画。排成队之后一轮之内十种各来一次，下一轮重新洗牌，顺序又是新的。
 */
export function buildEtch(w: number, h: number, seed: number, avoid?: EtchId): Etch {
  const width = Math.max(1, w)
  const height = Math.max(1, h)

  const count = CUTS.length
  const run = Math.max(0, Math.floor(seed))
  const order = queue(Math.floor(run / count), count)
  let slot = run % count
  // 轮与轮的接缝上可能又接回刚看过的那一种，往后挪一格
  if (avoid && count > 1 && CUTS[order[slot]].id === avoid) slot = (slot + 1) % count
  const pick = order[slot]
  const cut = CUTS[pick]

  let state = mix32((run ^ 0x4a4ee0) >>> 0)
  const rnd = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    return state / 4294967296
  }

  const order2 = new Float32Array(width * height)
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      order2[row * width + col] = cut.at(col, row, width, height, rnd)
    }
  }

  return { id: cut.id, order: order2, trail: cut.trail }
}
