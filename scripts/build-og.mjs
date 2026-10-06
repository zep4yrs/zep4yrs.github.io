import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

/**
 * 生成站点级 Open Graph 底图。
 * 这里不是作品素材，而是站点自身的分享封面——用矢量指令绘制，不伪造任何作品界面。
 * 视觉语言：雾蓝档案（Mist Indigo Archive）浅色蓝紫体系。
 */
const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const W = 1200
const H = 630

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="hazeBlue" cx="6%" cy="0%" r="62%">
      <stop offset="0%" stop-color="#5c80f0" stop-opacity="0.26"/>
      <stop offset="100%" stop-color="#5c80f0" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="hazeViolet" cx="97%" cy="2%" r="58%">
      <stop offset="0%" stop-color="#8e6cf4" stop-opacity="0.24"/>
      <stop offset="100%" stop-color="#8e6cf4" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="hazeCyan" cx="80%" cy="102%" r="62%">
      <stop offset="0%" stop-color="#68baee" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#68baee" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="markGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#2f37b4"/>
      <stop offset="42%" stop-color="#4a4ee0"/>
      <stop offset="74%" stop-color="#7b5cec"/>
      <stop offset="100%" stop-color="#9b7bf0"/>
    </linearGradient>
    <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
      <path d="M100 0H0V100" fill="none" stroke="#262f6e" stroke-opacity="0.07" stroke-width="1"/>
    </pattern>
  </defs>

  <rect width="${W}" height="${H}" fill="#f2f5fd"/>
  <rect width="${W}" height="${H}" fill="url(#hazeBlue)"/>
  <rect width="${W}" height="${H}" fill="url(#hazeViolet)"/>
  <rect width="${W}" height="${H}" fill="url(#hazeCyan)"/>
  <rect width="${W}" height="${H}" fill="url(#grid)"/>

  <rect x="36.5" y="36.5" width="${W - 73}" height="${H - 73}" fill="none" stroke="#262f6e" stroke-opacity="0.18" stroke-width="1"/>

  <g stroke="#4a4ee0" stroke-opacity="0.55" stroke-width="1.5" fill="none">
    <path d="M36.5 60L36.5 36.5L60 36.5"/>
    <path d="M${W - 60} 36.5L${W - 36.5} 36.5L${W - 36.5} 60"/>
    <path d="M36.5 ${H - 60}L36.5 ${H - 36.5}L60 ${H - 36.5}"/>
    <path d="M${W - 60} ${H - 36.5}L${W - 36.5} ${H - 36.5}L${W - 36.5} ${H - 60}"/>
  </g>

  <g font-family="ui-monospace, Consolas, monospace" font-size="20" letter-spacing="4.8">
    <text x="88" y="122" fill="#4a4ee0">WORKS ARCHIVE</text>
    <text x="${W - 88}" y="122" text-anchor="end" fill="#161a3a" fill-opacity="0.46">FENGQIAO · zep4yrs</text>
  </g>

  <line x1="88" y1="152" x2="${W - 88}" y2="152" stroke="#262f6e" stroke-opacity="0.18" stroke-width="1"/>

  <text x="88" y="340" font-family="'Iowan Old Style', Georgia, 'Songti SC', 'SimSun', serif" font-size="170" letter-spacing="-4" fill="#161a3a">枫桥</text>
  <text x="88" y="478" font-family="Georgia, Palatino, serif" font-size="96" letter-spacing="1" fill="url(#markGrad)">zep4yrs</text>

  <text x="88" y="552" font-family="'Microsoft YaHei', sans-serif" font-size="32" fill="#3336b8">保持热爱，奔赴山海。</text>
  <text x="${W - 88}" y="552" text-anchor="end" font-family="ui-monospace, Consolas, monospace" font-size="19" letter-spacing="3.2" fill="#161a3a" fill-opacity="0.46">10 WORKS · SECURITY / DESKTOP / VISUAL</text>
</svg>`

const out = join(root, 'public', 'og.png')
await mkdir(dirname(out), { recursive: true })
await writeFile(out, await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer())
console.log('og.png  written')
