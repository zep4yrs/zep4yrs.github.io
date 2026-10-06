import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useLang } from '../i18n/LangContext'
import type { UIKey } from '../i18n/dict'
import LangSwitch from './LangSwitch'

const NAV: { key: UIKey; hash: string }[] = [
  { key: 'navArchive', hash: 'archive' },
  { key: 'navLines', hash: 'threads' },
  { key: 'navAbout', hash: 'about' },
  { key: 'navContact', hash: 'contact' },
]

export default function SiteHeader() {
  const { t, lang } = useLang()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [solid, setSolid] = useState(false)

  useEffect(() => {
    setOpen(false)
  }, [location.pathname, location.hash])

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 28)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="site-header" data-solid={solid} data-open={open}>
      <div className="shell header-inner">
        <Link to={`/${lang}/`} className="brand" aria-label={t('siteTitle')}>
          <span className="brand-seal" aria-hidden="true">
            <span>z</span>
          </span>
          <span className="brand-text">
            <span className="brand-name">{t('brand')}</span>
            <span className="brand-sub">{t('brandMark')}</span>
          </span>
        </Link>

        <nav className="header-nav" aria-label={t('navArchive')}>
          {NAV.map((item) => (
            <Link key={item.hash} to={`/${lang}/#${item.hash}`} className="header-link">
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <LangSwitch />
          <button
            type="button"
            className="menu-btn"
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

      <div id="mobile-nav" className="mobile-nav" hidden={!open}>
        <nav className="shell" aria-label={t('navArchive')}>
          {NAV.map((item) => (
            <Link key={item.hash} to={`/${lang}/#${item.hash}`} className="mobile-link">
              <span className="mobile-link-label">{t(item.key)}</span>
              <span className="mobile-link-arw" aria-hidden="true">
                →
              </span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}