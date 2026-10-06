import { useCallback, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import ArchiveMap from '../components/ArchiveMap'
import PlatePanel from '../components/PlatePanel'
import Reveal from '../components/Reveal'
import SectionHead from '../components/SectionHead'
import { getWork, threadEdges, threads, works } from '../data/works'
import { useLang } from '../i18n/LangContext'
import { usePrefersReducedMotion, useReveal } from '../lib/hooks'
import { statusKey } from '../lib/labels'
import { useSeo } from '../lib/useSeo'

const PROFILES = [
  { label: 'GitHub', url: 'https://github.com/zep4yrs' },
  { label: 'Gitee', url: 'https://gitee.com/Map1eBr1dge' },
  { label: 'CNB', url: 'https://cnb.cool/feng-qiao' },
]

export default function Home() {
  const { t, L, lang } = useLang()
  const [active, setActive] = useState(works[0].slug)
  const reduced = usePrefersReducedMotion()

  useSeo({
    title: t('siteTitle') + ' — ' + t('siteSub'),
    description: t('homeDescription'),
    path: `/${lang}/`,
    lang,
    image: '/og.png',
  })

  const pick = useCallback(
    (slug: string) => {
      setActive(slug)
      const el = document.getElementById('archive')
      if (el) el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
    },
    [reduced],
  )

  return (
    <div className="page-enter">
      <Hero active={active} onPick={pick} />

      <section id="archive" className="section archive">
        <div className="shell">
          <SectionHead num={t('archiveNum')} title={t('archiveTitle')} sub={t('archiveSub')} />
          <Reveal>
            <p className="lede archive-hint">{t('archiveHint')}</p>
          </Reveal>
          <Reveal className="archive-stage" delay={80}>
            <ArchiveMap active={active} onActive={setActive} />
            <PlatePanel slug={active} />
          </Reveal>
        </div>
      </section>

      <section id="threads" className="section threads">
        <div className="shell">
          <SectionHead num={t('linesNum')} title={t('linesTitle')} sub={t('linesSub')} />
          <Reveal>
            <p className="lede">{t('linesNote')}</p>
          </Reveal>

          <div className="thread-rows">
            {threads.map((th, i) => (
              <Reveal key={th.id} className="thread-row" delay={i * 60}>
                <div className="thread-head">
                  <span className="mono thread-count">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="thread-name display">{L(th.label)}</h3>
                  <span className="mono thread-num">
                    {String(th.works.length).padStart(2, '0')} {t('heroUnit')}
                  </span>
                  <span className="thread-head-rule" aria-hidden="true" />
                </div>
                <ul className="thread-works">
                  {th.works.map((slug) => {
                    const w = getWork(slug)
                    if (!w) return null
                    return (
                      <li key={slug}>
                        <Link
                          to={`/${lang}/works/${slug}`}
                          className="chip"
                          style={{ '--accent': w.accent } as CSSProperties}
                        >
                          <span className="mono chip-no">{w.no}</span>
                          <span className="chip-text">
                            <span className="chip-title display">{L(w.title)}</span>
                            <span className="chip-sub">{L(w.subtitle)}</span>
                          </span>
                          <span className="chip-lead" aria-hidden="true" />
                          <span className="mono chip-year">{w.year}</span>
                          <span className="stamp" data-status={w.status}>
                            {t(statusKey(w.status))}
                          </span>
                          <span className="chip-arw" aria-hidden="true">
                            →
                          </span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </Reveal>
            ))}
          </div>

          <Reveal className="edges">
            <p className="eyebrow edges-title">{t('linesSub')}</p>
            <ul className="edge-list">
              {threadEdges.map((e) => {
                const a = getWork(e.from)
                const b = getWork(e.to)
                if (!a || !b) return null
                return (
                  <li key={`${e.from}-${e.to}`} className="edge-item">
                    <span className="edge-pair">
                      <span className="mono edge-no">{a.no}</span>
                      {L(a.title)}
                      <span className="edge-arrow" aria-hidden="true">
                        ↔
                      </span>
                      <span className="mono edge-no">{b.no}</span>
                      {L(b.title)}
                    </span>
                    <span className="edge-reason">{L(e.reason)}</span>
                  </li>
                )
              })}
            </ul>
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
            </Reveal>
            <Reveal className="about-facts" delay={100}>
              <dl className="about-dl">
                <div>
                  <dt className="mono">{t('aboutNameLabel')}</dt>
                  <dd>
                    {t('brand')} · {t('brandMark')}
                  </dd>
                </div>
                <div>
                  <dt className="mono">{t('aboutFieldLabel')}</dt>
                  <dd>{t('brandRole')}</dd>
                </div>
                <div>
                  <dt className="mono">{t('aboutCountLabel')}</dt>
                  <dd>
                    {works.length} {t('heroUnit')}
                  </dd>
                </div>
              </dl>
              <p className="about-tagline display">{t('tagline')}</p>
            </Reveal>
          </div>
        </div>
      </section>

      <section id="contact" className="section contact">
        <div className="shell">
          <SectionHead num={t('contactNum')} title={t('contactTitle')} sub={t('contactSub')} />
          <Reveal>
            <ul className="profile-grid">
              {PROFILES.map((p) => (
                <li key={p.label}>
                  <a
                    className="profile-card"
                    href={p.url}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    <span className="profile-top">
                      <span className="profile-label display">{p.label}</span>
                      <span className="profile-arw" aria-hidden="true">
                        ↗
                      </span>
                    </span>
                    <span className="profile-url mono">{p.url.replace(/^https?:\/\//, '')}</span>
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>
    </div>
  )
}

function Hero({ active, onPick }: { active: string; onPick: (slug: string) => void }) {
  const { t, L, lang } = useLang()
  const { ref, shown } = useReveal<HTMLElement>()

  return (
    <section className="hero" ref={ref} data-shown={shown}>
      <div className="hero-grid" aria-hidden="true" />
      <div className="shell hero-inner">
        <div className="hero-main">
          <div className="hero-lead">
            <p className="eyebrow hero-kicker">{t('heroKicker')}</p>
            <h1 className="hero-title">
              <span className="hero-line hero-line-1">{t('brand')}</span>
              <span className="hero-line hero-line-2 display">{t('brandMark')}</span>
            </h1>
            <p className="hero-tagline">{t('tagline')}</p>
            <p className="hero-role">{t('brandRole')}</p>
          </div>

          <div className="hero-threads">
            <span className="eyebrow hero-threads-label">{t('navLines')}</span>
            <ul>
              {threads.map((th) => (
                <li key={th.id}>
                  <span className="th-count">{String(th.works.length).padStart(2, '0')}</span>
                  <span className="th-name">{L(th.label)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="hero-foot">
            <p className="hero-count">
              <span className="mono">{t('heroIndex')}</span>
              <strong>{String(works.length).padStart(2, '0')}</strong>
              <span className="mono">{t('heroUnit')}</span>
            </p>
            <span className="leader hero-foot-lead" aria-hidden="true" />
            <Link className="linkline hero-scroll" to={`/${lang}/#archive`}>
              {t('heroScroll')}
              <span className="arw" aria-hidden="true">
                ↓
              </span>
            </Link>
          </div>
        </div>

        <aside className="hero-register">
          <div className="register-head">
            <span className="eyebrow">{t('archiveIndexLabel')}</span>
            <span className="mono register-total">{String(works.length).padStart(2, '0')}</span>
          </div>
          <ul className="register-list">
            {works.map((w, i) => (
              <li key={w.slug} style={{ '--i': i } as CSSProperties}>
                <button
                  type="button"
                  className="register-item"
                  data-active={w.slug === active}
                  onClick={() => onPick(w.slug)}
                >
                  <span className="mono register-no">{w.no}</span>
                  <span className="register-name">{L(w.title)}</span>
                  <span className="register-dot" data-status={w.status} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  )
}