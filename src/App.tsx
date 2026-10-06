import { lazy, Suspense, useEffect, useRef } from 'react'
import {
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useParams,
} from 'react-router-dom'
import SiteFooter from './components/SiteFooter'
import SiteHeader from './components/SiteHeader'
import { LangProvider, fallbackLang, useLang } from './i18n/LangContext'
import { isLang } from './i18n/dict'
import Home from './pages/Home'
import NotFound from './pages/NotFound'

const WorkDetail = lazy(() => import('./pages/WorkDetail'))

export default function App() {
  return (
    <>
      <ScrollManager />
      <Routes>
        <Route path="/:lang/*" element={<LangLayout />}>
          <Route index element={<Home />} />
          <Route path="works/:slug" element={<WorkDetail />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="*" element={<LangRedirect />} />
      </Routes>
    </>
  )
}

function LangLayout() {
  const { lang } = useParams()
  if (!isLang(lang)) return <LangRedirect />
  return (
    <LangProvider>
      <Shell />
    </LangProvider>
  )
}

/** 语言段缺失或非法时，补上站点默认语言，其余路径原样保留 */
function LangRedirect() {
  const location = useLocation()
  const parts = location.pathname.split('/').filter(Boolean)
  if (parts.length === 0) parts.push(fallbackLang())
  else if (!isLang(parts[0])) parts[0] = fallbackLang()
  return <Navigate to={`/${parts.join('/')}${location.search}${location.hash}`} replace />
}

function Shell() {
  const { t } = useLang()
  return (
    <>
      <a className="skip" href="#main">
        {t('skip')}
      </a>
      <SiteHeader />
      <main id="main">
        <Suspense fallback={<PageLoading />}>
          <Outlet />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  )
}

function PageLoading() {
  const { t } = useLang()
  return (
    <div className="page-loading" role="status" aria-live="polite">
      <span className="mono page-loading-text">{t('loading')}</span>
      <span className="page-loading-bar" aria-hidden="true" />
    </div>
  )
}

const logicalKey = (pathname: string) => pathname.replace(/^\/(zh|en)(?=\/|$)/, '') || '/'

function scrollToHash(hash: string) {
  const id = decodeURIComponent(hash.slice(1))
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  let tries = 0
  const tick = () => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
      return
    }
    if (tries++ < 40) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

/**
 * 切换语言时保持当前滚动位置（同一逻辑路由不重定位）；
 * 进入新页面时回到顶部；带锚点时滚动到对应区块。
 */
function ScrollManager() {
  const location = useLocation()
  const prevKey = useRef<string | null>(null)

  useEffect(() => {
    const key = logicalKey(location.pathname)
    const sameRoute = prevKey.current !== null && prevKey.current === key
    prevKey.current = key

    if (location.hash) {
      scrollToHash(location.hash)
      return
    }
    if (sameRoute) return
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [location.pathname, location.hash])

  return null
}