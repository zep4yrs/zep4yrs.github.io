import { useMemo, type CSSProperties } from 'react'
import { Link, useParams } from 'react-router-dom'
import ComingSoonPlate from '../components/ComingSoonPlate'
import MediaPlate from '../components/MediaPlate'
import MissingRecord from '../components/MissingRecord'
import Reveal from '../components/Reveal'
import { getNeighbours, getWork, works, type Work } from '../data/works'
import { useLang } from '../i18n/LangContext'
import { useActiveSection } from '../lib/hooks'
import { categoryKey, LINK_LABEL, statusKey } from '../lib/labels'
import { useSeo } from '../lib/useSeo'

const TOTAL = works.length

export default function WorkDetail() {
  const { slug } = useParams()
  const { t, L, lang } = useLang()
  const work = slug ? getWork(slug) : undefined

  const sectionIds = useMemo(() => work?.sections.map((s) => s.id) ?? [], [work])
  const activeSection = useActiveSection(sectionIds)

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
      <MissingRecord
        title={t('detailNotFoundTitle')}
        body={t('detailNotFoundBody')}
        cta={t('detailNotFoundCta')}
        to={`/${lang}/`}
      />
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
          <div className="detail-top">
            <Link className="lk" data-tone="quiet" to={`/${lang}/#archive`}>
              <span className="arw" data-dir="w" aria-hidden="true">
                ←
              </span>
              {t('detailBack')}
            </Link>
            <span className="leader" aria-hidden="true" />
            <p className="mono detail-pos">
              {work.no}
              <span aria-hidden="true"> / </span>
              {String(TOTAL).padStart(2, '0')}
            </p>
          </div>

          <div className="detail-head">
            <div className="detail-head-main">
              <p className="eyebrow detail-eyebrow">
                {work.logo && !work.comingSoon ? (
                  <img
                    className="detail-mark"
                    src={work.logo}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                ) : null}
                <span>{t('archiveTitle')}</span>
                {work.year ? <span className="detail-year">{work.year}</span> : null}
              </p>

              <h1 className="detail-title display">{L(work.title)}</h1>

              {work.repoName ? <p className="mono detail-repo">repo · {work.repoName}</p> : null}

              <p className="detail-sub">{L(work.subtitle)}</p>
              <p className="lede detail-desc">{L(work.description)}</p>

              {work.links.length > 0 ? (
                <ul className="detail-links">
                  {work.links.map((link) => (
                    <li key={link.kind}>
                      <a
                        className="lk"
                        href={link.url}
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        {LINK_LABEL[link.kind]}
                        <span className="arw" data-dir="ne" aria-hidden="true">
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

          {/* 著录条：一件作品的固定字段横铺一行，与首页的索引行同一套行律 */}
          <dl className="detail-record">
            <div>
              <dt>{t('fieldNo')}</dt>
              <dd className="mono">{work.no}</dd>
            </div>
            {work.year ? (
              <div>
                <dt>{t('fieldYear')}</dt>
                <dd className="mono">{work.year}</dd>
              </div>
            ) : null}
            <div>
              <dt>{t('fieldStatus')}</dt>
              <dd className="mono rec-status" data-status={work.status}>
                {t(statusKey(work.status))}
              </dd>
            </div>
            {work.license ? (
              <div>
                <dt>{t('fieldLicense')}</dt>
                <dd className="mono">{work.license}</dd>
              </div>
            ) : null}
            {work.stack ? (
              <div>
                <dt>{t('fieldStack')}</dt>
                <dd className="mono">{L(work.stack)}</dd>
              </div>
            ) : null}
            {work.version ? (
              <div>
                <dt>{t('fieldVersion')}</dt>
                <dd className="mono">{L(work.version)}</dd>
              </div>
            ) : null}
            <div>
              <dt>{t('fieldCategory')}</dt>
              <dd className="mono">{t(categoryKey(work.category))}</dd>
            </div>
          </dl>
        </div>
      </header>

      {work.restricted ? (
        <div className="shell restricted">
          <Reveal>
            <div className="restricted-plate plate plate-corners">
              <p className="eyebrow">{t('detailRestrictedTitle')}</p>
              <p className="restricted-quote">“{L(work.description)}”</p>
              <p className="restricted-body">{t('detailRestrictedBody')}</p>
              <span className="corner" aria-hidden="true" />
            </div>
          </Reveal>
        </div>
      ) : (
        <div className="shell detail-body">
          {work.sections.length > 0 ? (
            <aside className="detail-toc">
              <p className="eyebrow">{t('detailOnThisPage')}</p>
              <ol>
                {work.sections.map((sec, i) => (
                  <li key={sec.id}>
                    <a
                      href={`#${sec.id}`}
                      data-on={activeSection === sec.id}
                      aria-current={activeSection === sec.id ? 'true' : undefined}
                    >
                      <span className="mono toc-no">{String(i + 1).padStart(2, '0')}</span>
                      {L(sec.label)}
                    </a>
                  </li>
                ))}
              </ol>
            </aside>
          ) : null}

          <div className="detail-sections">
            {work.sections.map((sec, i) => (
              <section className="dsec" id={sec.id} key={sec.id}>
                <Reveal>
                  <div className="dsec-head">
                    <p className="eyebrow dsec-label">
                      <span className="mono dsec-no">{String(i + 1).padStart(2, '0')}</span>
                      <span className="dsec-name">{L(sec.label)}</span>
                      <span className="leader" aria-hidden="true" />
                      {/* 剖切标记：制图纸上每一道剖切都带一对象字母，与章节序号并存 */}
                      <span className="mono dsec-cut" aria-hidden="true">
                        {String.fromCharCode(65 + i)}—{String.fromCharCode(65 + i)}
                      </span>
                    </p>
                    <h2 className="dsec-title display">{L(sec.title)}</h2>
                  </div>

                  {sec.upstream ? (
                    <div className="upstream">
                      <p className="eyebrow">{t('fieldUpstream')}</p>
                      <p className="upstream-name">
                        <a className="tlink" href={sec.upstream.url} target="_blank" rel="noreferrer noopener">
                          {sec.upstream.name}
                          <span className="arw" data-dir="ne" aria-hidden="true">
                            ↗
                          </span>
                        </a>
                        <span className="mono upstream-license">{sec.upstream.license}</span>
                      </p>
                      <p className="upstream-note">{L(sec.upstream.note)}</p>
                    </div>
                  ) : null}

                  {/* 取舍：详情页的主轴。每条写清选了什么、为什么、代价在哪 */}
                  {sec.decisions ? (
                    <div className="decisions">
                      {sec.decisions.map((d, j) => (
                        <article className="decision" key={j}>
                          <p className="decision-choice">
                            <span className="mono decision-idx">
                              {String(j + 1).padStart(2, '0')}
                            </span>
                            <span className="decision-name">{L(d.choice)}</span>
                          </p>
                          <dl className="decision-pair">
                            <div data-kind="why">
                              <dt className="mono">{t('decisionWhy')}</dt>
                              <dd>{L(d.why)}</dd>
                            </div>
                            <div data-kind="cost">
                              <dt className="mono">{t('decisionCost')}</dt>
                              <dd>{L(d.cost)}</dd>
                            </div>
                          </dl>
                        </article>
                      ))}
                    </div>
                  ) : null}

                  {/* 边界：不做的事与已知限制，读起来是约束而不是优点 */}
                  {sec.limits ? (
                    <ul className="limits">
                      {sec.limits.map((l, j) => (
                        <li key={j}>{L(l)}</li>
                      ))}
                    </ul>
                  ) : null}

                  {sec.body ? (
                    <div className="prose">
                      {sec.body.map((p, j) => (
                        <p key={j}>{L(p)}</p>
                      ))}
                    </div>
                  ) : null}

                  {sec.bullets ? (
                    <ul className="bullets">
                      {sec.bullets.map((b, j) => (
                        <li key={j}>{L(b)}</li>
                      ))}
                    </ul>
                  ) : null}

                  {sec.facts ? (
                    <dl className="fact-row">
                      {sec.facts.map((f, j) => (
                        <div key={j}>
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

                  {/* 指路：本页只写工程判断，科普与用法在博客那边 */}
                  {sec.reading ? (
                    <div className="reading">
                      <p className="eyebrow">{t('readingLabel')}</p>
                      <p className="reading-lead">
                        <a
                          className="lk"
                          data-tone="accent"
                          href={sec.reading.url}
                          target="_blank"
                          rel="noreferrer noopener"
                        >
                          {L(sec.reading.label)}
                          <span className="arw" data-dir="ne" aria-hidden="true">
                            ↗
                          </span>
                        </a>
                      </p>
                      <p className="reading-note">{L(sec.reading.note)}</p>
                    </div>
                  ) : null}
                </Reveal>
              </section>
            ))}

            {work.sections.length === 0 ? (
              <p className="dsec-note">{t('detailNoMedia')}</p>
            ) : null}

            {/* 标题栏：制图纸右下角那一栏，著录图号与固定字段 */}
            <DrawingBlock work={work} />
          </div>
        </div>
      )}

      <Reveal>
        <nav className="shell detail-nav" aria-label={t('detailIndex')}>
          {prev ? (
            <Link className="detail-nav-item detail-nav-prev" to={`/${lang}/works/${prev.slug}`}>
              <span className="mono detail-nav-dir">← {t('detailPrev')}</span>
              <span className="detail-nav-title">
                <span className="mono">{prev.no}</span> {L(prev.title)}
              </span>
            </Link>
          ) : (
            <span />
          )}

          <div className="detail-nav-mid">
            <p className="mono detail-nav-pos">
              {work.no}
              <span aria-hidden="true"> / </span>
              {String(TOTAL).padStart(2, '0')}
            </p>
            <Link className="lk" to={`/${lang}/#archive`}>
              <span className="arw" data-dir="w" aria-hidden="true">
                ←
              </span>
              {t('detailIndex')}
            </Link>
          </div>

          {next ? (
            <Link className="detail-nav-item detail-nav-next" to={`/${lang}/works/${next.slug}`}>
              <span className="mono detail-nav-dir">{t('detailNext')} →</span>
              <span className="detail-nav-title">
                <span className="mono">{next.no}</span> {L(next.title)}
              </span>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </Reveal>
    </article>
  )
}

function CoverPlate({ work }: { work: Work }) {
  const { t, L } = useLang()
  const fit = work.cover.type === 'image' ? 'cover' : 'contain'
  // 没有封面图的作品用仓库里的真实标识顶上，连标识也没有才退回单字；
  // 还没成形的那两件不摆素材，立一块「敬请期待」的字版
  const plate = work.comingSoon ? undefined : (work.cover.src ?? work.logo)

  return (
    <figure
      className="plate plate-corners dcover"
      data-restricted={work.restricted ? 'true' : undefined}
    >
      <div className="plate-media" data-fit={fit} data-soon={work.comingSoon ? 'true' : undefined}>
        {work.comingSoon ? (
          <ComingSoonPlate />
        ) : plate ? (
          <img
            className={work.cover.src ? undefined : 'dcover-mark'}
            src={plate}
            alt={L(work.title)}
            loading="eager"
            decoding="async"
          />
        ) : (
          <span className="dcover-glyph display" aria-hidden="true">
            {work.cover.glyph}
          </span>
        )}
      </div>
      <figcaption className="plate-caption">
        <span>
          {work.no}
          <span className="cap-sep" aria-hidden="true">
            ·
          </span>
          {t(categoryKey(work.category))}
        </span>
        <span className="cap-year">{work.year ?? t(statusKey(work.status))}</span>
      </figcaption>
      <span className="corner" aria-hidden="true" />
    </figure>
  )
}

/* 标题栏：制图纸右下角那一格。重复著录条里的固定字段，纯装饰，读屏略过。 */
function DrawingBlock({ work }: { work: Work }) {
  const { t, L } = useLang()
  const rows: Array<[string, string]> = [
    [t('fieldNo'), work.no],
    [t('fieldCategory'), t(categoryKey(work.category))],
    [t('fieldLicense'), work.license ?? '—'],
    [t('fieldVersion'), work.version ? L(work.version) : '—'],
  ]

  return (
    <div className="dwg-block" aria-hidden="true">
      <p className="mono dwg-fig">FIG. {work.no}</p>
      <dl className="dwg-rows">
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt className="mono">{k}</dt>
            <dd className="mono">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
