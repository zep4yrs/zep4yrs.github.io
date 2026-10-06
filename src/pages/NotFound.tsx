import { Link } from 'react-router-dom'
import { useLang } from '../i18n/LangContext'
import { useSeo } from '../lib/useSeo'

export default function NotFound() {
  const { t, lang } = useLang()

  useSeo({
    title: `${t('notFoundTitle')} · ${t('siteTitle')}`,
    description: t('notFoundBody'),
    path: `/${lang}/`,
    lang,
  })

  return (
    <section className="section shell empty-state page-enter">
      <p className="eyebrow">404</p>
      <h1 className="display empty-title">{t('notFoundTitle')}</h1>
      <p className="lede">{t('notFoundBody')}</p>
      <Link className="linkline" to={`/${lang}/`}>
        {t('notFoundCta')}
        <span className="arw" aria-hidden="true">
          →
        </span>
      </Link>
    </section>
  )
}