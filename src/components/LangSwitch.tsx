import { useLang } from '../i18n/LangContext'
import type { Lang } from '../i18n/dict'

const LABEL: Record<Lang, string> = { zh: '中文', en: 'EN' }

export default function LangSwitch() {
  const { lang, setLang, t } = useLang()

  return (
    <div className="langswitch" role="group" aria-label={t('switchLabel')}>
      {(['zh', 'en'] as Lang[]).map((code) => (
        <button
          key={code}
          type="button"
          className="langswitch-btn"
          data-on={lang === code}
          aria-pressed={lang === code}
          lang={code === 'zh' ? 'zh-CN' : 'en'}
          onClick={() => setLang(code)}
        >
          {LABEL[code]}
        </button>
      ))}
    </div>
  )
}