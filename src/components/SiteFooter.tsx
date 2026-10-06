import { Link } from 'react-router-dom'
import { useLang } from '../i18n/LangContext'

export default function SiteFooter() {
  const { t, lang } = useLang()
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <div className="footer-brand">
          <p className="footer-mark display" aria-hidden="true">
            zep4yrs
          </p>
          <p className="footer-name">
            {t('brand')} · {t('siteSub')}
          </p>
          <p className="footer-tagline">{t('tagline')}</p>
        </div>

        <nav className="footer-nav" aria-label={t('navArchive')}>
          <Link to={`/${lang}/#archive`}>{t('navArchive')}</Link>
          <Link to={`/${lang}/#threads`}>{t('navLines')}</Link>
          <Link to={`/${lang}/#about`}>{t('navAbout')}</Link>
          <Link to={`/${lang}/#contact`}>{t('navContact')}</Link>
        </nav>

        <div className="footer-meta">
          <p className="footer-note">{t('footerNote')}</p>
          <p className="mono footer-built">{t('footerBuilt')}</p>
          <p className="mono footer-rights">
            © {year} {t('brand')} {t('brandMark')} · {t('footerRights')}
          </p>
        </div>
      </div>
    </footer>
  )
}