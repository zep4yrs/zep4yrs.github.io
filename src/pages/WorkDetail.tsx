import { useMemo, type CSSProperties } from 'react'
import { Link, useParams } from 'react-router-dom'
import MediaPlate from '../components/MediaPlate'
import { getNeighbours, getWork, type Work } from '../data/works'
import { useLang } from '../i18n/LangContext'
import { categoryKey, LINK_LABEL, statusKey } from '../lib/labels'
import { useSeo } from '../lib/useSeo'

export default function WorkDetail() {
  const { slug } = useParams()
  const { t, L, lang } = useLang()
  const work = slug ? getWork(slug) : undefined

  const title = work ? L(work.seo.title) : t('detailNotFoundTitle')
  const description = work ? L(work.seo.description) : t('detailNotFoundBody')

  const jsonLd = useMemo(() => {
    if (!work) return undefined
    return {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: work.title[lang],
      description: work.description[lang],
      inLanguage: lang === 'zh' ? 'zh-CN' : 'en',
      creator: { '@type': 'Person', name: lang === 'zh' ? '枫桥' : 'Fengqiao' },
      ...(work.year ? { dateCreated: work.year } : {}),
      ...(work.links.length ? { sameAs: work.links.map((l) => l.url) } : {}),
    }
  }, [work, lang])

  useSeo({
    title,
    description,
    path: work ? `/${lang}/works/${work.slug}` : `/${lang}/`,
    lang,
    image: work?.cover.src,
    type: 'article',
    jsonLd,
  })

  if (!work) {
    return (
      <div className="page-enter">
        <section className="section shell empty-state">
          <p className="eyebrow">404</p>
          <h1 className="display empty-title">{t('detailNotFoundTitle')}</h1>
          <p className="lede">{t('detailNotFoundBody')}</p>
          <Link className="linkline" to={`/${lang}/`}>
            {t('detailNotFoundCta')}
            <span className="arw" aria-hidden="true">
              →
            </span>
          </Link>
        </section>
      </div>
    )
  }

  const { prev, next } = getNeighbours(work.slug)

  return (
    <article
      className="detail page-enter"
      style={{ '--accent': work.accent } as CSSProperties}
      data-status={work.status}
    >
      <header className="detail-hero">
        <div className="shell">
          <Link className="back" to={`/${lang}/#archive`}>
            <span className="back-arw" aria-hidden="true">
              ←
            </span>
            {t('detailBack')}
          </Link>

          <div className="detail-head">
            <div className="detail-head-main">
              <p className="eyebrow detail-eyebrow">
                {work.logo ? (
                  <img
                    className="detail-mark"
                    src={work.logo}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                ) : null}
                <span className="detail-no">{work.no}</span>
                {work.year ? <span className="detail-year">{work.year}</span> : null}
              </p>

              <h1 className="detail-title display">{L(work.title)}</h1>

              {work.repoName ? (
                <p className="mono detail-repo">
                  repo · {work.repoName}
                </p>
              ) : null}

              <p className="detail-sub">{L(work.subtitle)}</p>
              <p className="lede detail-desc">{L(work.description)}</p>

              <div className="detail-stamps">
                <span className="stamp" data-status={work.status}>
                  {t(statusKey(work.status))}
                </span>
                {work.version ? <span className="stamp stamp-plain">{L(work.version)}</span> : null}
                <span className="stamp stamp-plain">{t(categoryKey(work.category))}</span>
              </div>

              {work.links.length > 0 ? (
                <ul className="detail-links">
                  {work.links.map((link) => (
                    <li key={link.kind}>
                      <a
                        className="linkline"
                        href={link.url}
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        {LINK_LABEL[link.kind]}
                        <span className="arw" aria-hidden="true">
                          ↗
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <CoverPlate work={work} />
          </div>
        </div>
      </header>

      {work.restricted ? (
        <div className="shell restricted">
          <div className="restricted-plate plate plate-corners">
            <p className="eyebrow">{t('detailRestrictedTitle')}</p>
            <p className="restricted-quote">“{L(work.description)}”</p>
            <p className="restricted-body">{t('detailRestrictedBody')}</p>
            <span className="corner" aria-hidden="true" />
          </div>
        </div>
      ) : (
        <div className="shell detail-body">
          {work.sections.length > 0 ? (
            <aside className="detail-toc">
              <p className="eyebrow">{t('detailOnThisPage')}</p>
              <ol>
                {work.sections.map((sec) => (
                  <li key={sec.id}>
                    <a href={`#${sec.id}`}>{L(sec.label)}</a>
                  </li>
                ))}
              </ol>
            </aside>
          ) : null}

          <div className="detail-sections">
            {work.sections.map((sec) => (
              <section className="dsec" id={sec.id} key={sec.id}>
                <div className="dsec-head">
                  <span className="mono dsec-label">{L(sec.label)}</span>
                  <h2 className="dsec-title display">{L(sec.title)}</h2>
                </div>

                {sec.upstream ? (
                  <div className="upstream">
                    <p className="eyebrow">{t('fieldUpstream')}</p>
                    <p className="upstream-name">
                      <a href={sec.upstream.url} target="_blank" rel="noreferrer noopener">
                        {sec.upstream.name}
                        <span className="arw" aria-hidden="true">
                          ↗
                        </span>
                      </a>
                      <span className="mono upstream-license">{sec.upstream.license}</span>
                    </p>
                    <p className="upstream-note">{L(sec.upstream.note)}</p>
                  </div>
                ) : null}

                {sec.body ? (
                  <div className="prose">
                    {sec.body.map((p, i) => (
                      <p key={i}>{L(p)}</p>
                    ))}
                  </div>
                ) : null}

                {sec.bullets ? (
                  <ul className="bullets">
                    {sec.bullets.map((b, i) => (
                      <li key={i}>{L(b)}</li>
                    ))}
                  </ul>
                ) : null}

                {sec.facts ? (
                  <dl className="fact-row">
                    {sec.facts.map((f, i) => (
                      <div key={i}>
                        <dt className="mono">{L(f.label)}</dt>
                        <dd>{L(f.value)}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}

                {sec.gallery ? (
                  <div className="gallery">
                    {sec.gallery.map((m) => (
                      <MediaPlate
                        key={m.src}
                        media={m}
                        alt={L(m.alt)}
                        caption={L(m.caption)}
                        fit={m.kind === 'banner' ? 'cover' : 'contain'}
                      />
                    ))}
                  </div>
                ) : null}

                {sec.note ? <p className="dsec-note">{L(sec.note)}</p> : null}
              </section>
            ))}

            {work.sections.length === 0 ? (
              <p className="dsec-note">{t('detailNoMedia')}</p>
            ) : null}
          </div>
        </div>
      )}

      <nav className="shell detail-nav" aria-label={t('detailIndex')}>
        {prev ? (
          <Link className="detail-nav-item detail-nav-prev" to={`/${lang}/works/${prev.slug}`}>
            <span className="mono detail-nav-dir">
              ← {t('detailPrev')}
            </span>
            <span className="detail-nav-title">
              <span className="mono">{prev.no}</span> {L(prev.title)}
            </span>
          </Link>
        ) : (
          <span />
        )}

        <Link className="detail-nav-index" to={`/${lang}/#archive`}>
          {t('detailIndex')}
        </Link>

        {next ? (
          <Link className="detail-nav-item detail-nav-next" to={`/${lang}/works/${next.slug}`}>
            <span className="mono detail-nav-dir">
              {t('detailNext')} →
            </span>
            <span className="detail-nav-title">
              <span className="mono">{next.no}</span> {L(next.title)}
            </span>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  )
}

function CoverPlate({ work }: { work: Work }) {
  const { L } = useLang()
  const fit = work.cover.type === 'image' ? 'cover' : 'contain'

  return (
    <figure className="plate plate-corners dcover">
      <div className="plate-media" data-fit={fit}>
        {work.cover.src ? (
          <img src={work.cover.src} alt={L(work.title)} loading="eager" decoding="async" />
        ) : (
          <span className="dcover-glyph display" aria-hidden="true">
            {work.cover.glyph}
          </span>
        )}
      </div>
      <figcaption className="plate-caption">
        <span>{work.no}</span>
        <span className="cap-id" aria-hidden="true">
          ▚
        </span>
      </figcaption>
      <span className="corner" aria-hidden="true" />
    </figure>
  )
}