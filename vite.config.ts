import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

/* 站点是 BrowserRouter 的单页应用，深链没有对应的静态文件。GitHub Pages 与 EdgeOne
   都会把未命中的路径回落到根目录的 404.html —— 页面照样渲染，但状态码是 404，
   sitemap 里那二十二条地址对爬虫就等于不存在。这里按 sitemap 枚举出的路由各铺一份
   应用外壳，让每条地址都有真正的 200；没列进 sitemap 的路径仍由 404.html 兜住，
   交给前端的 NotFound 页。 */
function spaRouteShells(): Plugin {
  return {
    name: 'spa-route-shells',
    closeBundle() {
      const shell = readFileSync(join('dist', 'index.html'))
      const xml = readFileSync(join('dist', 'sitemap.xml'), 'utf8')
      const routes = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
        .map((m) => new URL(m[1]).pathname)
        .filter((path) => path !== '/')
      for (const route of routes) {
        const file = join('dist', route, 'index.html')
        mkdirSync(dirname(file), { recursive: true })
        writeFileSync(file, shell)
      }
      copyFileSync(join('dist', 'index.html'), join('dist', '404.html'))
    },
  }
}

export default defineConfig({
  plugins: [react(), spaRouteShells()],
  base: '/',
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    assetsInlineLimit: 2048,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
})