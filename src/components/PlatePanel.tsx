import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { getWork, threads, works } from '../data/works'
import { useLang } from '../i18n/LangContext'
import { statusKey } from '../lib/labels'

/** 当前图版：随图版柜的选择即时更新。图版柜陈列的是作品标识（logo），
 *  真实界面截图留在各作品详情页。 */
export default function PlatePanel({ slug }: { slug: string }) {
  const { t, L, lang } = useLang()
  const work = getWork(slug)
  if (!work) return null

  const plate = work.logo ?? work.cover.src
  const fit = work.logo ? 'mark' : work.cover.type === 'image' ? 'cover' : 'contain'
  const total = String(works.length).padStart(2, '0')
  const thread = threads.find((th) => th.id === work.category)

  return (
    <aside
      className="panel plate plate-corners"
      style={{ '--accent': work.accent } as CSSProperties}
      aria-live="polite"
    >
      <div className="panel-head">
        <span className="eyebrow">{t('archivePlateLabel')}</span>
        <span className="mono panel-no">
          {work.no} / {total}
        </span>
      </div>

      <div className="panel-media" data-fit={fit}>
        {plate ? (
          <img key={plate} src={plate} alt="" loading="lazy" decoding="async" />
        ) : (
          <span className="panel-glyph display" aria-hidden="true">
            {work.cover.glyph}
          </span>
        )}
      </div>

      <div className="panel-body" key={work.slug}>
        <h3 className="panel-title display">{L(work.title)}</h3>
        <p className="panel-sub">{L(work.subtitle)}</p>

        <dl className="panel-facts">
          {thread ? (
            <div>
              <dt className="mono">{t('fieldCategory')}</dt>
              <dd>{L(thread.label)}</dd>
            </div>
          ) : null}
          {work.year ? (
            <div>
              <dt className="mono">{t('fieldYear')}</dt>
              <dd>{work.year}</dd>
            </div>
          ) : null}
          {work.version ? (
            <div>
              <dt className="mono">{t('fieldVersion')}</dt>
              <dd>{L(work.version)}</dd>
            </div>
          ) : null}
          <div>
            <dt className="mono">{t('fieldStatus')}</dt>
            <dd>{t(statusKey(work.status))}</dd>
          </div>
        </dl>

        <Link className="linkline panel-open" to={`/${lang}/works/${work.slug}`}>
          {t('archiveOpen')}
          <span className="arw" aria-hidden="true">
            →
          </span>
        </Link>
      </div>

      <span className="corner" aria-hidden="true" />
    </aside>
  )
}
