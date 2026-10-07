import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useLang } from '../i18n/LangContext'
import type { UIKey } from '../i18n/dict'
import LangSwitch from './LangSwitch'
import MusicPlayer from './MusicPlayer'

const NAV: { key: UIKey; hash: string }[] = [
  { key: 'navArchive', hash: 'archive' },
  { key: 'navAccess', hash: 'access' },
  { key: 'navAbout', hash: 'about' },
]

export default function SiteHeader() {
  const { t, lang } = useLang()
  const location = useLocation()
  const headerRef = useRef<HTMLElement>(null)
  const [open, setOpen] = useState(false)
  const [solid, setSolid] = useState(false)
  const [active, setActive] = useState('')
  /* 已经写进 URL 的那一节：只在跨节的那一刻写一次，不必每帧都 replaceState */
  const writtenHash = useRef('')

  useEffect(() => {
    setOpen(false)
  }, [location.pathname, location.hash])

  useEffect(() => {
    let raf = 0
    let wasSolid = false
    /* 可滚动的总里程只在内容或视口变化时才变，量一次存着。
       原来每帧都读一次 documentElement.scrollHeight，那是每帧强制一次布局，
       滚动里最贵的一笔就出在这儿。 */
    let range = 0
    /* 这一页有没有那三节（只有首页有）。没有就完全不碰 URL，
       免得把详情页目录自己写下的锚点（#decisions 之类）抹掉。 */
    const hasSections = !!document.getElementById(NAV[0].hash)
    writtenHash.current = window.location.hash.replace(/^#/, '')
    const measureRange = () => {
      range = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
    }

    const read = () => {
      raf = 0
      const y = window.scrollY

      /* 先把要量的都量完，最后才落笔。原来是量一半写一次自定义属性、再接着量，
         那次写会把布局标脏，后面的量就得再做一次强制重排——一帧两次。
         现在这一帧里没有任何写在读之前，强制重排只可能有一次。 */
      const mark = window.innerHeight * 0.32
      let next = ''
      for (const item of NAV) {
        const el = document.getElementById(item.hash)
        if (el && el.getBoundingClientRect().top <= mark) next = item.hash
      }
      const solid = y > 28
      const progress = range > 0 ? Math.min(1, Math.max(0, y / range)) : 0

      // 阅读进度直接写进自定义属性，不走 state，滚动时不必每帧重渲染
      headerRef.current?.style.setProperty('--progress', String(progress))

      /* URL 跟随滚动：滑到哪一节，锚点就写成哪一节。
         用 replaceState 而不是 pushState —— 否则一路滑下来会把历史记录塞满，
         返回键就再也退不回上一页了。 */
      if (hasSections && next !== writtenHash.current) {
        writtenHash.current = next
        window.history.replaceState(
          null,
          '',
          window.location.pathname + window.location.search + (next ? `#${next}` : ''),
        )
      }

      /* 实底与当前章节只在真的变了才落 state：不抖动，页头就不跟着重渲染 */
      if (solid !== wasSolid) {
        wasSolid = solid
        setSolid(solid)
      }
      setActive((prev) => (prev === next ? prev : next))
    }
    /* 滚动事件一秒能来上百次，量一次布局就够贵了，收进 rAF 一帧只量一次 */
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(read)
    }
    measureRange()
    read()
    /* 图版懒加载会把页面撑高，里程得跟着重算，否则进度线会走不满 */
    const ro = new ResizeObserver(measureRange)
    ro.observe(document.body)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (raf) window.cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [location.pathname])

  return (
    <header className="site-header" ref={headerRef} data-solid={solid} data-open={open}>
      <div className="shell header-inner">
        <Link to={`/${lang}/`} className="brand" aria-label={t('siteTitle')}>
          <span className="ctl brand-seal" data-tone="brand" aria-hidden="true">
            <img src="/media/avatar.webp" alt="" width={46} height={46} decoding="async" />
          </span>
          <span className="brand-text">
            <span className="brand-name">{t('brand')}</span>
            <span className="brand-sub">{t('brandMark')}</span>
          </span>
        </Link>

        {/* 播放器落在页头正中：绝对定位，不参与两端的伸缩，
            字标与导航因此还是各贴一边，中间这条始终在版心正中 */}
        <div className="header-player">
          <MusicPlayer />
        </div>

        <nav className="header-nav" aria-label={t('navArchive')}>
          {NAV.map((item) => (
            <Link
              key={item.hash}
              to={`/${lang}/#${item.hash}`}
              className="rowlink"
              data-on={active === item.hash}
              aria-current={active === item.hash ? 'true' : undefined}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <LangSwitch />
          <button
            type="button"
            className="ctl menu-btn"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr">{open ? t('navClose') : t('navMenu')}</span>
            <span className="menu-bars" aria-hidden="true">
              <i />
              <i />
            </span>
          </button>
        </div>
      </div>

      <span className="header-progress" aria-hidden="true" />

      <div id="mobile-nav" className="mobile-nav" hidden={!open}>
        <nav className="shell" aria-label={t('navArchive')}>
          {NAV.map((item, i) => (
            <Link
              key={item.hash}
              to={`/${lang}/#${item.hash}`}
              className="mobile-link"
              data-on={active === item.hash}
            >
              <span className="mono mobile-link-no">{String(i + 1).padStart(2, '0')}</span>
              <span className="mobile-link-label">{t(item.key)}</span>
              <span className="arw" data-dir="e" aria-hidden="true">
                →
              </span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
