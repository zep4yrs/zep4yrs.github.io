import MissingRecord from '../components/MissingRecord'
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
    <MissingRecord
      title={t('notFoundTitle')}
      body={t('notFoundBody')}
      cta={t('notFoundCta')}
      to={`/${lang}/`}
    />
  )
}
