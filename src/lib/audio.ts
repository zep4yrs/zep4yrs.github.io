/**
 * 站内的声音：一条跨页面续播的音频管线。
 *
 * 音频元素 → 分析器 → 音量 → 输出。音量故意加在分析器「之后」，所以把声音
 * 拧到 0 时分析照旧在跑，粒子场不会因为静音就死掉——Omarchy 也是这个顺序。
 * 音频还没起播（或没有音源）时 readBands 会给出一条自走的伪频谱，场始终在
 * 呼吸，不会因为「没放歌」就变成一张静止的图。
 *
 * 模块级单例：不挂在 React 树上，所以路由切换、组件卸载都不会打断播放。
 */

import { TRACKS, type Track } from '../data/tracks'

/** 频谱段数：与场里的柱数一一对应 */
export const BANDS = 32

export type PlayerState = {
  /** 音源已就绪（元数据已到，能播） */
  ready: boolean
  playing: boolean
  /** 当前播放位置，秒 */
  time: number
  /** 总时长，秒；未知时为 0 */
  duration: number
  /** 0..1 */
  volume: number
  /** 出错时的短提示，没有则为 null */
  error: string | null
  track: Track | null
}

const VOLUME_KEY = 'work:volume'

function readStoredVolume() {
  try {
    const raw = window.localStorage.getItem(VOLUME_KEY)
    if (raw === null) return 0.7
    const v = Number(raw)
    return Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 0.7
  } catch {
    return 0.7
  }
}

let el: HTMLAudioElement | null = null
let ctx: AudioContext | null = null
let analyser: AnalyserNode | null = null
let gain: GainNode | null = null
let bin = new Uint8Array(0)
let edges: Int32Array | null = null

/** 平滑后的段电平，绘制循环直接读 */
const smooth = new Float32Array(BANDS)
/** 上一帧电平，用来算谱通量 */
const prev = new Float32Array(BANDS)
const fluxRing: number[] = []
let fluxPeak = 0.01
let lastBeatAt = -1e9
let beatPulse = 0

let volume = 0.7
let error: string | null = null
let index = 0

const listeners = new Set<() => void>()
let snapshot: PlayerState = {
  ready: false,
  playing: false,
  time: 0,
  duration: 0,
  volume: 0.7,
  error: null,
  track: TRACKS[0] ?? null,
}

function emit() {
  const track = TRACKS[index] ?? null
  const next: PlayerState = {
    ready: Boolean(el && el.readyState >= 1 && Number.isFinite(el.duration)),
    playing: Boolean(el && !el.paused && !el.ended && el.readyState >= 2),
    time: el?.currentTime ?? 0,
    duration: el && Number.isFinite(el.duration) ? el.duration : 0,
    volume,
    error,
    track,
  }
  if (
    next.ready === snapshot.ready &&
    next.playing === snapshot.playing &&
    next.time === snapshot.time &&
    next.duration === snapshot.duration &&
    next.volume === snapshot.volume &&
    next.error === snapshot.error &&
    next.track === snapshot.track
  ) {
    return
  }
  snapshot = next
  for (const fn of listeners) fn()
}

export function getState(): PlayerState {
  return snapshot
}

export function subscribe(fn: () => void) {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

/** 建音频元素与图，只在第一次真正需要时做——AudioContext 必须由手势唤醒 */
function ensureGraph() {
  if (el) return
  const track = TRACKS[index]
  if (!track) return

  el = new Audio()
  el.preload = 'metadata'
  el.crossOrigin = 'anonymous'
  el.src = track.src

  volume = readStoredVolume()
  el.volume = 1

  const onError = () => {
    error = 'missing'
    emit()
  }
  el.addEventListener('error', onError)
  el.addEventListener('loadedmetadata', emit)
  el.addEventListener('durationchange', emit)
  el.addEventListener('play', emit)
  el.addEventListener('pause', emit)
  /* 一曲终了自动接下一首；只有一首时不动作，免得单曲循环成死循环 */
  el.addEventListener('ended', () => {
    if (TRACKS.length > 1) switchTo(index + 1, true)
    else emit()
  })
  el.addEventListener('timeupdate', emit)

  emit()
}

/**
 * 换到某一档。el 还没建时只改序号——建图那一步自会按新序号取 src，
 * 所以「没起播先换歌」不会白白造一个音频元素出来。
 */
function switchTo(i: number, autoplay: boolean) {
  if (TRACKS.length === 0) return
  index = ((i % TRACKS.length) + TRACKS.length) % TRACKS.length
  error = null
  const track = TRACKS[index]
  if (!el || !track) {
    emit()
    return
  }
  el.src = track.src
  el.load()
  emit()
  if (autoplay) void play()
}

/** 接上 Web Audio 图。必须在一个用户手势里调用，否则上下文起不来。 */
async function ensureContext() {
  if (!el) return
  if (!ctx) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return
    ctx = new Ctor()
    analyser = ctx.createAnalyser()
    analyser.fftSize = 2048
    analyser.smoothingTimeConstant = 0.72
    gain = ctx.createGain()
    gain.gain.value = volume
    // 元素 → 分析器 → 音量 → 输出：静音不影响分析
    const source = ctx.createMediaElementSource(el)
    source.connect(analyser)
    analyser.connect(gain)
    gain.connect(ctx.destination)

    bin = new Uint8Array(analyser.frequencyBinCount)
    // 频段按对数分：50Hz 到 10kHz，低频才不会被挤成一条
    const nyquist = ctx.sampleRate / 2
    const lo = 50
    const hi = 10000
    edges = new Int32Array(BANDS + 1)
    for (let i = 0; i <= BANDS; i++) {
      const f = lo * (hi / lo) ** (i / BANDS)
      edges[i] = Math.min(bin.length - 1, Math.max(1, Math.round((f / nyquist) * bin.length)))
    }
  }
  if (ctx.state === 'suspended') await ctx.resume()
}

export async function play() {
  ensureGraph()
  if (!el) return
  try {
    await ensureContext()
    await el.play()
    error = null
  } catch {
    error = 'blocked'
  }
  emit()
}

export function pause() {
  el?.pause()
  emit()
}

export async function toggle() {
  if (el && !el.paused) pause()
  else await play()
}

/** 下一首。正在放就接着放，停着就只换曲目，不擅自起播。 */
export function next() {
  if (TRACKS.length < 2) return
  switchTo(index + 1, Boolean(el && !el.paused && !el.ended))
}

/** 曲目表里是不是不止一首——只有一首时「下一首」这枚方印不必露面 */
export function hasPlaylist() {
  return TRACKS.length > 1
}

export function seek(seconds: number) {
  if (!el || !Number.isFinite(el.duration)) return
  el.currentTime = Math.min(el.duration, Math.max(0, seconds))
  emit()
}

export function setVolume(v: number) {
  volume = Math.min(1, Math.max(0, v))
  if (gain) gain.gain.value = volume
  try {
    window.localStorage.setItem(VOLUME_KEY, String(volume))
  } catch {
    /* 隐私模式下写不了，音量这次有效即可 */
  }
  emit()
}

/**
 * 把当前频谱写进 out。返回是否来自真实播放：false 表示这是自走的伪频谱。
 * 绘制循环每帧调一次。
 */
export function readBands(out: Float32Array, time: number): boolean {
  const live = Boolean(analyser && el && !el.paused && !el.ended && el.readyState >= 2)
  if (!live || !analyser || !edges) {
    idleBands(time, out)
    beatPulse = 0
    return false
  }

  analyser.getByteFrequencyData(bin)
  let sum = 0
  for (let b = 0; b < BANDS; b++) {
    let max = 0
    const end = Math.max(edges[b] + 1, edges[b + 1])
    for (let i = edges[b]; i < end; i++) if (bin[i] > max) max = bin[i]
    const level = max / 255
    const rise = level > smooth[b]
    smooth[b] += (level - smooth[b]) * (rise ? 0.7 : 0.14)
    out[b] = smooth[b]
    sum += smooth[b]
  }

  // 低十二段的谱通量估拍：只有明显越过自身峰值才算一次
  let flux = 0
  for (let b = 0; b < 12; b++) {
    const rise = out[b] - prev[b]
    if (rise > 0) flux += rise
    prev[b] = out[b]
  }
  flux /= 12
  fluxPeak = Math.max(fluxPeak * 0.996, flux, 0.01)
  fluxRing.push(flux)
  if (fluxRing.length > 48) fluxRing.shift()
  const avg = fluxRing.reduce((s, v) => s + v, 0) / fluxRing.length
  if (flux > fluxPeak * 0.55 && flux > avg * 1.5 && time - lastBeatAt > 220) {
    lastBeatAt = time
    beatPulse = Math.min(1, flux / fluxPeak)
  }
  beatPulse *= 0.84
  if (beatPulse < 0.005) beatPulse = 0

  return sum > 0.01
}

/** 最近一次节拍的脉冲，0..1，已衰减 */
export function beat(): number {
  return beatPulse
}

/**
 * 若干条真实电平：直接读分析器，按对数频段归并。播放时才有值，没在放一律归零。
 * 页头那条电平表每帧调一次——所以它是真的跟着声音走，不是一段循环动画。
 */
export function readMeter(out: Float32Array): boolean {
  const live = Boolean(analyser && el && !el.paused && !el.ended && el.readyState >= 2)
  if (!live || !analyser || !edges) {
    out.fill(0)
    return false
  }
  analyser.getByteFrequencyData(bin)
  const n = out.length
  for (let b = 0; b < n; b++) {
    const from = edges[Math.floor((b * BANDS) / n)]
    const to = Math.max(from + 1, edges[Math.floor(((b + 1) * BANDS) / n)])
    let max = 0
    for (let i = from; i < to; i++) if (bin[i] > max) max = bin[i]
    out[b] = max / 255
  }
  return true
}

/**
 * 没有音源时场照跳的那条伪频谱：低频厚、高频薄，再叠两层慢漂移，
 * 所以柱子会自己起伏，但整体安静，不会假装在放一首歌。
 */
function idleBands(time: number, out: Float32Array) {
  const t = time / 1000
  for (let i = 0; i < BANDS; i++) {
    const p = i / (BANDS - 1)
    const body = 0.1 + 0.15 * (1 - p) ** 1.7
    const slow = 0.5 + 0.5 * Math.sin(t * 0.31 + i * 0.42)
    const fast = 0.5 + 0.5 * Math.sin(t * 0.83 + i * 1.27)
    out[i] = body * (0.55 + 0.45 * slow) + 0.045 * fast
  }
}

/** 供播放器在挂载时预热（不播放，只把元数据取回来） */
export function warm() {
  ensureGraph()
}
