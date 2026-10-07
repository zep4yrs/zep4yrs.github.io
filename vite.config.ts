import { copyFileSync } from 'node:fs'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

/* 站点是 BrowserRouter 的单页应用，深链（/zh/works/<slug>，sitemap 里有二十条）
   直接打开时静态服务器找不到对应文件。GitHub Pages 与 EdgeOne 都会回落到根目录的
   404.html，把它做成 index.html 的副本，应用照常启动、路由自己接管地址。 */
function spaFallback(): Plugin {
  return {
    name: 'spa-fallback',
    closeBundle() {
      copyFileSync('dist/index.html', 'dist/404.html')
    },
  }
}

export default defineConfig({
  plugins: [react(), spaFallback()],
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