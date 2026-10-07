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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)