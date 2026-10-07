import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react'
import {
  getState,
  hasPlaylist,
  next,
  pause,
  play,
  readMeter,
  seek,
  setVolume,
  subscribe,
  warm,
} from '../lib/audio'
import { useLang } from '../i18n/LangContext'

/** 订阅播放器状态：模块级单例，跨路由不重置 */
function usePlayer() {
  return useSyncExternalStore(subscribe, getState, getState)
}

function clock(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const s = Math.floor(seconds % 60)
  const m = Math.floor(seconds / 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function MusicPlayer() {
  const { t, L } = useLang()
  const state = usePlayer()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const barsRef = useRef<HTMLSpanElement>(null)

  // 只取元数据，不自动播放——AudioContext 必须由手势唤醒
  useEffect(() => {
    warm()
  }, [])

  /* 电平表读的是真声音：播放时每帧取一次分析器，没在放就归零。
     所以它不会「假装在跳」——不播放时就是四条平线。 */
  useEffect(() => {
    if (!state.playing) return
    const host = barsRef.current
    if (!host) return
    const cells = Array.from(host.children) as HTMLElement[]
    const out = new Float32Array(cells.length)
    let raf = 0
    const tick = () => {
      readMeter(out)
      for (let i = 0; i < cells.length; i++) cells[i].style.setProperty('--lvl', out[i].toFixed(3))
      raf = window.requestAnimationFrame(tick)
    }
    raf = window.requestAnimationFrame(tick)
    return () => {
      window.cancelAnimationFrame(raf)
      for (const c of cells) c.style.removeProperty('--lvl')
    }
  }, [state.playing])

  // 点在外面、按 Esc 都收起，避免浮层一直挂着挡内容
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const track = state.track
  const missing = state.error === 'missing'
  // 音源还没上时不留「（待填曲名）」这种占位，改读站点自己的名目
  const title = missing ? t('playerIdleTitle') : track ? L(track.title) : t('playerNoTrack')
  const artist = missing ? t('playerIdleArtist') : (track?.artist ?? t('playerHintShort'))

  /* 封面缺席的那一首（《风吹起落叶》没有专辑图）：不留一个空方框——空方框读起来
     像「图加载失败」。改在印面正中落一个题名首字，中英各自取各自的首字，
     于是它读作「有意留白」。 */
  const art = missing ? null : (track?.art ?? null)
  const artMark = !art && !missing && track ? title.slice(0, 1) : null

  /* 轨道上「已播」那一截要染浓，靠 --p 把进度交给样式表——滑块本身仍由浏览器
     拖拽与键盘接管，不自己造一套指针逻辑。 */
  const seekPct = state.duration > 0 ? (Math.min(state.time, state.duration) / state.duration) * 100 : 0
  const volPct = state.volume * 100

  return (
    <div
      className="player"
      ref={rootRef}
      data-open={open}
      data-playing={state.playing}
      data-missing={missing}
    >
      <div className="player-bar">
        {/* 播放键就是封面本身：点封面起停，指针压上去才浮出那枚三角/双条。
            封面不在时（没有 art）这一格仍立着，只是空底加图标。 */}
        <button
          type="button"
          className="ctl player-art"
          onClick={() => void (state.playing ? pause() : play())}
          disabled={missing}
          aria-label={state.playing ? t('playerPause') : t('playerPlay')}
        >
          {art ? <img src={art} alt="" width={34} height={34} decoding="async" /> : null}
          {artMark ? (
            <span className="player-art-mark" aria-hidden="true">
              {artMark}
            </span>
          ) : null}
          <span className="player-art-veil" aria-hidden="true" />
          <span className="player-art-icon" aria-hidden="true" />
        </button>

        <button
          type="button"
          className="player-meta"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          <span className="player-title">{title}</span>
          <span className="player-artist mono">{artist}</span>
        </button>

        <span className="player-bars" ref={barsRef} aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </span>

        {/* 曲目表不止一首时才立这枚方印：一首的时候它按下去什么也不会发生，
            摆着就是摆设。 */}
        {hasPlaylist() ? (
          <button
            type="button"
            className="ctl player-next"
            onClick={() => next()}
            disabled={missing}
            aria-label={t('playerNext')}
            title={t('playerNext')}
          >
            <span className="player-next-icon" aria-hidden="true" />
          </button>
        ) : null}

        <button
          type="button"
          className="ctl player-more"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? t('playerCollapse') : t('playerExpand')}
        >
          <span className="player-chevron" aria-hidden="true" />
        </button>
      </div>

      {/* 面板：两行著录。上行是进度（发丝轨道 + 方块滑块，已播那截染浓），
          下行是音量。两行之间一道发丝线分开，与站内的著录表同族。
          切曲不放在这里——它是「换一件东西」，和页头那枚方印同一族，立在条上。 */}
      <div className="player-panel" hidden={!open}>
        <div className="player-scrub">
          <input
            className="player-range player-range-seek"
            type="range"
            min={0}
            max={Math.max(state.duration, 0.001)}
            step={0.1}
            value={Math.min(state.time, state.duration || 0)}
            onChange={(e) => seek(Number(e.target.value))}
            disabled={missing || state.duration <= 0}
            aria-label={t('playerProgress')}
            style={{ '--p': `${seekPct}%` } as CSSProperties}
          />
          <p className="mono player-time">
            <span className="player-time-now">{clock(state.time)}</span>
            <span className="player-time-lead" aria-hidden="true" />
            <span className="player-time-total">{clock(state.duration)}</span>
          </p>
        </div>

        <div className="player-row">
          <span className="mono player-row-label">{t('playerVolume')}</span>
          <input
            className="player-range player-range-vol"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={state.volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            aria-label={t('playerVolume')}
            style={{ '--p': `${volPct}%` } as CSSProperties}
          />
        </div>

        {missing ? <p className="player-note">{t('playerMissing')}</p> : null}
      </div>
    </div>
  )
}
