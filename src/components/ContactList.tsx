import { CONTACTS } from '../data/contacts'
import { useLang } from '../i18n/LangContext'
import { useCopyToClipboard } from '../lib/hooks'

/**
 * 六枚联络方印：只留图标，名目与账号收进 aria-label，悬停时才浮一条名条。
 * 可复制的两枚（QQ / 微信）点按后原地转色，名条改口报「已复制」。
 * 关于区与页脚各用一份，行为与样子同源。
 */
export default function ContactList() {
  const { t } = useLang()
  const { copied, copy } = useCopyToClipboard()

  return (
    <ul className="contact-list">
      {CONTACTS.map((c) => {
        const name = c.icon === 'wechat' ? t('contactWechat') : c.label
        const label = `${name} · ${c.value}`
        const mark = <span className="contact-mark" data-icon={c.icon} aria-hidden="true" />

        return (
          <li key={c.icon}>
            {c.url ? (
              <a
                className="ctl contact-mark-btn"
                href={c.url}
                target={c.url.startsWith('http') ? '_blank' : undefined}
                rel={c.url.startsWith('http') ? 'noreferrer noopener' : undefined}
                aria-label={label}
                data-tip={name}
              >
                {mark}
              </a>
            ) : (
              <button
                type="button"
                className="ctl contact-mark-btn"
                data-copied={copied === c.value ? 'true' : 'false'}
                data-tip={copied === c.value ? t('aboutCopied') : t('footerContactHint')}
                onClick={() => void copy(c.value ?? '')}
                aria-label={`${label} · ${t('footerContactHint')}`}
              >
                {mark}
              </button>
            )}
          </li>
        )
      })}
    </ul>
  )
}