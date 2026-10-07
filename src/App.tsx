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

/* 刷新首页时先回首屏：URL 上的锚点是上一次滚动留下的残迹（滚动跟随会把当前
   区块写进地址栏），刷新时不该照它把页面按在半途。只在 reload 时清 —— 直接打开
   的深链（/zh/#access 之类）仍按锚点定位。
   写在模块作用域、渲染之前：StrictMode 会把 effect 跑两遍，用 ref 或 state 记
   「首次」都会在第二遍被抹掉，只有模块级、一次性的代码才真的只跑一次。 */
const navType = (
  performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
)?.type
if (navType === 'reload' && logicalKey(window.location.pathname) === '/' && window.location.hash) {
  window.history.replaceState(null, '', window.location.pathname + window.location.search)
}

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
 * 定位职责只有一条：这一趟该落在哪里。
 * - 带锚点 → 滚到那一区块（详情页返回、页头导航、首屏下滑都走这里）
 * - 换页且无锚点 → 回到顶部
 * - 同页切语言（逻辑路由与锚点都没变）→ 原地不动，保持当前滚动位置
 */
function ScrollManager() {
  const location = useLocation()
  /* 已经定过位的「逻辑路由 + 锚点」。切语言会换 location.key，但逻辑路由与锚点
     都不变，靠这一对比就把「同页切语言」（该原地不动）和「同页换锚点」（该滚过去）
     分开了。 */
  const handled = useRef<string | null>(null)

  useEffect(() => {
    /* 锚点读实时的 URL，而不是 react-router 的那一份：滚动跟随是用
       history.replaceState 写的，router 并不知情，它那份会过期。 */
    const hash = window.location.hash
    const sig = logicalKey(location.pathname) + hash
    if (sig === handled.current) return
    handled.current = sig

    if (hash) {
      scrollToHash(hash)
      return
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [location.pathname, location.key])

  return null
}