import { useCallback, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import PixelField from '../components/PixelField'
import ContactList from '../components/ContactList'
import Reveal from '../components/Reveal'
import WorkArchive, { scrollToWork } from '../components/WorkArchive'
import SectionHead from '../components/SectionHead'
import { demos, installs, type AccessRoute } from '../data/access'
import { getWork, threads, works } from '../data/works'
import { useLang } from '../i18n/LangContext'
import { usePrefersReducedMotion, useReveal } from '../lib/hooks'
import { useSeo } from '../lib/useSeo'

export default function Home() {
  const { t, lang } = useLang()
  const [active, setActive] = useState(works[0].slug)
  const reduced = usePrefersReducedMotion()

  /* 取用一节里没出现的那几件，就是还没成形、暂时没有入口的 */
  const taken = new Set([...demos, ...installs].map((r) => r.slug))
  const pending = works.filter((w) => !taken.has(w.slug))

  useSeo({
    title: t('siteTitle') + ' — ' + t('siteSub'),
    description: t('homeDescription'),
    path: `/${lang}/`,
    lang,
    image: '/og.png',
  })

  /* 首屏索引脊点了哪一件，就把舞台翻到那一档；当前件由滚动位置决定 */
  const pick = useCallback(
    (slug: string) => {
      setActive(slug)
      scrollToWork(slug, !reduced)
    },
    [reduced],
  )

  return (
    <div className="page-enter">
      <Hero active={active} onPick={pick} />

      <section id="archive" className="section archive">
        <div className="shell">
          <SectionHead num={t('archiveNum')} title={t('archiveTitle')} sub={t('archiveSub')} />
          <Reveal className="archive-stage" delay={80}>
            <WorkArchive onActive={setActive} />
          </Reveal>
        </div>
      </section>

      <section id="access" className="section access">
        <div className="shell">
          <SectionHead num={t('accessNum')} title={t('accessTitle')} sub={t('accessSub')} />

          <div className="access-groups">
            <AccessGroup
              no="01"
              name={t('accessDemo')}
              note={t('accessDemoNote')}
              cta={t('accessOpen')}
              routes={demos}
            />
            <AccessGroup
              no="02"
              name={t('accessInstall')}
              note={t('accessInstallNote')}
              cta={t('accessDownload')}
              routes={installs}
            />
          </div>

          <Reveal className="access-pending-row">
            <p className="access-pending">
              <span className="mono access-pending-no">
                {String(pending.length).padStart(2, '0')}
              </span>
              <span className="access-pending-text">{t('accessPending')}</span>
              <span className="access-lead" aria-hidden="true" />
              <Link className="lk" to={`/${lang}/#archive`}>
                {t('accessPendingCta')}
                <span className="arw" data-dir="e" aria-hidden="true">
                  →
                </span>
              </Link>
            </p>
          </Reveal>
        </div>
      </section>

      <section id="about" className="section about">
        <div className="shell">
          <SectionHead num={t('aboutNum')} title={t('aboutTitle')} sub={t('aboutSub')} />
          <div className="about-grid">
            <Reveal className="about-body prose">
              <p>{t('aboutP1')}</p>
              <p>{t('aboutP2')}</p>
              <p>{t('aboutP3')}</p>
              <p>{t('aboutP4')}</p>
              <p>{t('aboutP5')}</p>
              <p>{t('aboutP6')}</p>
            </Reveal>

            <Reveal className="about-side" delay={100}>
              <figure className="about-portrait">
                <img
                  src="/media/profile.webp"
                  alt={t('aboutPortraitAlt')}
                  width={880}
                  height={1100}
                  loading="lazy"
                  decoding="async"
                />
              </figure>

              <div className="about-who">
                <p className="about-name display">{t('brand')}</p>
                <p className="about-id mono">{t('brandMark')}</p>
              </div>

              <div className="about-contacts">
                <p className="eyebrow about-contacts-label">{t('aboutContactLabel')}</p>
                <ContactList />
              </div>

              <p className="about-tagline display">{t('tagline')}</p>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  )
}

function AccessGroup({
  no,
  name,
  note,
  cta,
  routes,
}: {
  no: string
  name: string
  note: string
  cta: string
  routes: AccessRoute[]
}) {
  const { L } = useLang()

  return (
    <div className="access-group">
      <header className="access-head">
        <span className="mono access-head-no">{no}</span>
        <h3 className="access-head-name display">{name}</h3>
        <span className="mono access-head-note">{note}</span>
        <span className="access-head-rule" aria-hidden="true" />
      </header>

      <ul className="access-grid" data-count={routes.length}>
        {routes.map((r) => {
          const w = getWork(r.slug)
          if (!w) return null
          return (
            <li key={r.slug}>
              <a
                className="access-card"
                href={r.url}
                target="_blank"
                rel="noreferrer noopener"
                style={{ '--accent': w.accent } as CSSProperties}
              >
                <span className="access-card-main">
                  <span className="mono access-card-no">{w.no}</span>
                  <span className="access-card-title display">{L(w.title)}</span>
                  <span className="access-card-form">{L(r.form)}</span>
                </span>
                <span className="access-card-side">
                  <span className="mono access-card-host">{r.host}</span>
                  <span className="lk" data-tone="accent">
                    {cta}
                    <span className="arw" data-dir="ne" aria-hidden="true">
                      ↗
                    </span>
                  </span>
                </span>
              </a>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function Hero({ active, onPick }: { active: string; onPick: (slug: string) => void }) {
  const { t, L, lang } = useLang()
  const { ref, shown } = useReveal<HTMLElement>()
  const glyphRef = useRef<HTMLButtonElement>(null)
  const [markRun, setMarkRun] = useState(0)
  const reduced = usePrefersReducedMotion()

  return (
    <section className="hero" ref={ref} data-shown={shown}>
      <PixelField text={t('brand')} runId={markRun} anchorRef={glyphRef} reduced={reduced} />

      <div className="shell hero-inner">
        <div className="hero-top">
          <p className="eyebrow hero-kicker">{t('heroKicker')}</p>
          <span className="leader" aria-hidden="true" />
        </div>

        <div className="hero-anchor">
          <h1 className="sr">
            {t('brand')} · {t('brandMark')}
          </h1>
          <button
            ref={glyphRef}
            type="button"
            className="hero-glyph"
            aria-label={t('heroRedraw')}
            onClick={() => setMarkRun((n) => n + 1)}
          />
          <p className="hero-tagline">{t('tagline')}</p>
        </div>

        <div className="hero-ledger">
          <ul className="ledger-index">
            {works.map((w) => (
              <li key={w.slug}>
                <button
                  type="button"
                  className="ledger-item"
                  data-on={w.slug === active}
                  onClick={() => onPick(w.slug)}
                >
                  <span className="mono ledger-no">{w.no}</span>
                  <span className="ledger-name">{L(w.title)}</span>
                  <span className="ledger-dot" data-status={w.status} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>

          <div className="ledger-foot">
            <p className="hero-count">
              <span className="mono">{t('heroIndex')}</span>
              <strong>{String(works.length).padStart(2, '0')}</strong>
              <span className="mono">{t('heroUnit')}</span>
            </p>
            <span className="leader" aria-hidden="true" />
            <ul className="ledger-threads">
              {threads.map((th) => (
                <li key={th.id}>
                  <span className="mono th-count">{String(th.works.length).padStart(2, '0')}</span>
                  <span className="th-name">{L(th.label)}</span>
                </li>
              ))}
            </ul>
            <Link className="lk hero-scroll" to={`/${lang}/#archive`}>
              {t('heroScroll')}
              <span className="arw" data-dir="s" aria-hidden="true">
                ↓
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}