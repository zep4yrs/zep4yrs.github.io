import { useLang } from '../i18n/LangContext'

/**
 * 还没成形的作品在图版位置上立的一块字版。
 * 做成字而不是图片：图片里的字切不了语言，而全站是中英双语的。
 */
export default function ComingSoonPlate() {
  const { t } = useLang()

  return (
    <span className="soon-plate">
      <span className="mono soon-plate-kicker">{t('comingSoonSub')}</span>
      <span className="display soon-plate-word">{t('comingSoon')}</span>
    </span>
  )
}