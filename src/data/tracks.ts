/**
 * 站内曲目表。
 *
 * 音频与封面放在 public/music/ 下（该目录不进构建管线，原样发布）。文件缺失时
 * 播放器会显示「音源未就绪」，粒子场自动回落到自走频谱，不会报错也不会白屏。
 */

export type Track = {
  id: string
  title: { zh: string; en: string }
  artist: string
  /** 相对 public 的路径，例如 /music/track.mp3 */
  src: string
  /** 可选封面，同样放 public 下 */
  art?: string
}

export const TRACKS: Track[] = [
  {
    id: 'voyaging-star',
    title: { zh: '远航星的告别', en: "Voyaging Star's Farewell" },
    artist: '鸣潮先约电台',
    src: '/music/track.mp3',
    art: '/music/cover.webp',
  },
  {
    id: 'moon-song-heart-lamp',
    title: { zh: '月声尽，心灯明', en: 'Moon Song Fades, Heart Lamp Shines' },
    artist: '鸣潮先约电台',
    src: '/music/track-2.mp3',
    art: '/music/cover-2.webp',
  },
  {
    id: 'wind-lifts-leaves',
    title: { zh: '风吹起落叶', en: 'Wind Lifts the Falling Leaves' },
    artist: '云浠',
    src: '/music/track-3.mp3',
    art: '/music/cover-3.webp',
  },
]