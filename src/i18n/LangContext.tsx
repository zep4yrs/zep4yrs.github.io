import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { dict, isLang, type Lang, type Localized, type UIKey } from './dict'

const STORAGE_KEY = 'zep-work-lang'

interface LangValue {
  lang: Lang
  setLang: (next: Lang) => void
  t: (key: UIKey) => string
  L: (value: Localized) => string
}

const LangContext = createContext<LangValue | null>(null)

function readStoredLang(): Lang | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return isLang(v) ? v : null
  } catch {
    return null
  }
}

function detectLang(): Lang {
  try {
    const nav = (navigator.language || 'zh').toLowerCase()
    return nav.startsWith('zh') ? 'zh' : 'en'
  } catch {
    return 'zh'
  }
}

/** 站点默认语言：用户主动选择优先，其次浏览器语言 */
export const fallbackLang = (): Lang => readStoredLang() ?? detectLang()

/** 把路径中的语言段替换为目标语言，其余部分（作品 slug / 查询串 / 锚点）原样保留 */
export function swapLangInPath(pathname: string, next: Lang): string {
  const parts = pathname.split('/').filter(Boolean)
  if (parts.length === 0) return `/${next}/`
  if (isLang(parts[0])) {
    parts[0] = next
  } else {
    parts.unshift(next)
  }
  return `/${parts.join('/')}${pathname.endsWith('/') ? '/' : ''}`
}

export function LangProvider({ children }: { children: ReactNode }) {
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const lang: Lang = isLang(params.lang) ? params.lang : fallbackLang()

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      /* 隐私模式下忽略 */
    }
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en'
  }, [lang])

  const setLang = useCallback(
    (next: Lang) => {
      if (next === lang) return
      const target = swapLangInPath(location.pathname, next)
      navigate(target + location.search + location.hash, { replace: true })
    },
    [lang, location.pathname, location.search, location.hash, navigate],
  )

  const value = useMemo<LangValue>(
    () => ({
      lang,
      setLang,
      t: (key) => dict[lang][key],
      L: (v) => v[lang],
    }),
    [lang, setLang],
  )

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export function useLang(): LangValue {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used inside LangProvider')
  return ctx
}