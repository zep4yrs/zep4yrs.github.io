import { Link } from 'react-router-dom'
import { useLang } from '../i18n/LangContext'

/**
 * 档案里没有这一页时的版面：顶带报出编号，正文交代缘由，
 * 右侧一张"查无此件"的图版。404 与失效的作品详情共用这一版式。
 */
export default function MissingRecord({
  title,
  body,
  cta,
  to,
}: {
  title: string
  body: string
  cta: string
  to: string
}) {
  const { t } = useLang()

  return (
    <section className="section shell missing page-enter">
      <div className="missing-top">
        <p className="mono missing-code">404</p>
        <span className="leader" aria-hidden="true" />
        <p className="mono missing-kicker">{t('siteSub')}</p>
      </div>

      <div className="missing-grid">
        <div className="missing-copy">
          <h1 className="display missing-title">{title}</h1>
          <p className="lede missing-body">{body}</p>
          <Link className="lk missing-cta" data-tone="accent" to={to}>
            {cta}
            <span className="arw" data-dir="e" aria-hidden="true">
              →
            </span>
          </Link>
        </div>

        <figure className="plate plate-corners missing-plate">
          <div className="plate-media missing-media">
            <span className="missing-glyph display" aria-hidden="true">
              404
            </span>
          </div>
          <figcaption className="plate-caption">
            <span className="cap-id">{t('brandMark')}</span>
            <span className="cap-year">— / —</span>
          </figcaption>
          <span className="corner" aria-hidden="true" />
        </figure>
      </div>
    </section>
  )
}
