import { useRef } from 'react'
import { Link } from 'react-router-dom'
import ContactList from './ContactList'
import PixelField from './PixelField'
import { works } from '../data/works'
import { useLang } from '../i18n/LangContext'
import { usePrefersReducedMotion } from '../lib/hooks'

export default function SiteFooter() {
  const { t, lang } = useLang()
  const year = new Date().getFullYear()
  const reduced = usePrefersReducedMotion()
  const glyphRef = useRef<HTMLDivElement>(null)

  return (
    <footer className="site-footer">
      {/* 页脚的底就是首屏那块方格纸，但只留那一行字：zep4yrs 居中刻在页脚上
          当水印，不铺周围的粒子，墨也一律取最淡的一档。指针滑过时，字上的
          格子被顺着走向拖开一段，停下再松开（见 PixelField）。等这一块真的
          进了视口才落笔。 */}
      <PixelField
        text={t('brandMark')}
        runId={0}
        anchorRef={glyphRef}
        reduced={reduced}
        fieldClass="footer-field"
        canvasClass="footer-canvas"
        etchOnEnter
        drag
        watermark
      />
      <h2 className="sr">{t('brandMark')}</h2>
      {/* 只交代字标刻在哪，自己不显形也不吃指针——它整块压在文字底下 */}
      <div className="footer-glyph" ref={glyphRef} aria-hidden="true" />

      <div className="shell footer-strip">
        <p className="mono footer-strip-title">{t('siteTitle')}</p>
        <span className="leader" aria-hidden="true" />
        <p className="mono footer-strip-note">
          {t('heroIndex')} {String(works.length).padStart(2, '0')} {t('heroUnit')}
        </p>
      </div>

      <div className="shell footer-inner">
        <div className="footer-brand">
          <p className="footer-name">
            {t('brand')} · {t('siteSub')}
          </p>
          <p className="footer-tagline display">{t('tagline')}</p>
        </div>

        <nav className="footer-nav" aria-label={t('navArchive')}>
          <p className="eyebrow footer-col-label">{t('detailIndex')}</p>
          <Link className="rowlink" to={`/${lang}/#archive`}>
            {t('navArchive')}
          </Link>
          <Link className="rowlink" to={`/${lang}/#access`}>
            {t('navAccess')}
          </Link>
          <Link className="rowlink" to={`/${lang}/#about`}>
            {t('navAbout')}
          </Link>
        </nav>

        <div className="footer-contacts">
          <p className="eyebrow footer-col-label">{t('footerContactLabel')}</p>
          <ContactList />
        </div>

        <div className="footer-meta">
          <p className="eyebrow footer-col-label">{t('footerNoteLabel')}</p>
          <p className="footer-note">{t('footerNote')}</p>
        </div>
      </div>

      <div className="shell footer-base">
        <p className="mono footer-rights">
          © {year} {t('brand')} {t('brandMark')} · {t('footerRights')}
        </p>
        <span className="leader" aria-hidden="true" />
        <p className="mono footer-built">{t('footerBuilt')}</p>
      </div>
    </footer>
  )
}