import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
// 霞鹜文楷：按 unicode-range 分片下发，浏览器只取页面真正用到的那几片。
// 只引入会真正被请求的三个字重（正文 400、字标 bold、等宽 400），别的一律不进包。
import 'lxgw-wenkai-webfont/lxgwwenkai-regular.css'
import 'lxgw-wenkai-webfont/lxgwwenkai-bold.css'
import 'lxgw-wenkai-webfont/lxgwwenkaimono-regular.css'
import './styles/tokens.css'
import './styles/base.css'
import './styles/layout.css'
import './styles/home.css'
import './styles/detail.css'

if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual'
}

/* 旧站（四时工坊）注册过一个 Service Worker，拦截本站所有 GET 请求做
   stale-while-revalidate，缓存里还存着旧站的 / 与 /index.html。新站不再用 SW，
   但访问者浏览器里那个旧的仍在：转发音频的 Range 请求会报「未知错误」，页面被拖着
   变慢，打开首页还可能被喂回旧站页面。浏览器对 SW 脚本的更新检查有 24 小时节流，
   单靠放一个 /sw.js 不够及时，所以在应用启动时主动注销、清空缓存，再重载一次让页面
   脱离它的控制。sessionStorage 做闸，一次会话最多重载一次，不会打转。 */
if ('serviceWorker' in navigator) {
  void navigator.serviceWorker.getRegistrations().then(async (regs) => {
    if (regs.length === 0) return
    try {
      if (sessionStorage.getItem('work:sw-purged')) return
      sessionStorage.setItem('work:sw-purged', '1')
    } catch {
      return
    }
    await Promise.all(regs.map((reg) => reg.unregister()))
    if (typeof caches !== 'undefined') {
      const keys = await caches.keys()
      await Promise.all(keys.map((key) => caches.delete(key)))
    }
    location.reload()
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)