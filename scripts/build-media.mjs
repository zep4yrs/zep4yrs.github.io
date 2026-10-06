/**
 * 把素材压缩为站点可直接使用的 WebP（public/media/）。两个来源严格分开：
 *
 * 1. media-src/ —— 各作品仓库中的真实素材（来自云端仓库调查）。
 *    只做尺寸收敛与编码转换，不生成、不合成、不伪造。
 * 2. marks-src/ —— 仓库本身没有 logo 的作品所使用的标识图（AI 生成，
 *    非仓库素材）。仅用于补足图版柜的标识位，不参与作品事实性描述。
 */
import { mkdir, readFile, writeFile, readdir, stat } from 'node:fs/promises'
import { dirname, join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(root, 'media-src')
const MARKS_SRC = join(root, 'marks-src')
const OUT = join(root, 'public', 'media')

/** 每个素材的输出约束。width 为最大宽度，只缩不放。 */
const PLAN = {
  'sitelens/banner.png': { out: 'sitelens/banner.webp', width: 2200, quality: 80 },
  'sitelens/logo.png': { out: 'sitelens/logo.webp', width: 512, quality: 88 },
  'sitelens/banner-4.0-attackchain.png': { out: 'sitelens/banner-4.0-attackchain.webp', width: 2000, quality: 80 },
  'sitelens/banner-3.0-exploit.png': { out: 'sitelens/banner-3.0-exploit.webp', width: 2000, quality: 80 },
  'sitelens/roadmap.png': { out: 'sitelens/roadmap.webp', width: 2200, quality: 78 },
  'sitelens/release-3.0.0.png': { out: 'sitelens/release-3.0.0.webp', width: 2200, quality: 78 },

  'lannook/app-icon.png': { out: 'lannook/app-icon.webp', width: 512, quality: 88 },

  'bluetidy/application-mode.png': { out: 'bluetidy/application-mode.webp', width: 2200, quality: 78 },
  'bluetidy/logo.png': { out: 'bluetidy/logo.webp', width: 512, quality: 88 },

  'disksift/hero.png': { out: 'disksift/hero.webp', width: 2200, quality: 80 },
  'disksift/triage.png': { out: 'disksift/triage.webp', width: 2000, quality: 80 },
  'disksift/dark.png': { out: 'disksift/dark.webp', width: 2000, quality: 80 },
  'disksift/empty.png': { out: 'disksift/empty.webp', width: 2000, quality: 80 },
  'disksift/logo.png': { out: 'disksift/logo.webp', width: 512, quality: 88 },

  'structvis/quick-sort.png': { out: 'structvis/quick-sort.webp', width: 1800, quality: 82 },
  'structvis/graph-traversal.png': { out: 'structvis/graph-traversal.webp', width: 1800, quality: 82 },
  'structvis/binary-tree.png': { out: 'structvis/binary-tree.webp', width: 1800, quality: 82 },
  'structvis/splash.png': { out: 'structvis/splash.webp', width: 2000, quality: 80 },
}

/** SVG 原样拷贝：本身已是矢量，压缩反而有害。 */
const COPY = {
  'ctfhub/mark.svg': 'ctfhub/mark.svg',
  'structvis/mark.svg': 'structvis/mark.svg',
  'cryptovis/mark.svg': 'cryptovis/mark.svg',
}

/** AI 生成的作品标识（仓库无 logo 时补位），来源 marks-src/。 */
const MARKS = {
  'alertzero.jpg': 'alertzero/mark.webp',
  'binsight.jpg': 'binsight/mark.webp',
  'lodestar.jpg': 'lodestar/mark.webp',
}

async function walk(dir) {
  const out = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...(await walk(p)))
    else out.push(p)
  }
  return out
}

async function main() {
  const report = []
  const seen = new Set()

  for (const [key, cfg] of Object.entries(PLAN)) {
    const input = join(SRC, key.split('/').join(sep))
    const output = join(OUT, cfg.out.split('/').join(sep))
    await mkdir(dirname(output), { recursive: true })

    const buf = await readFile(input)
    const img = sharp(buf, { failOn: 'none' })
    const meta = await img.metadata()
    const resized = meta.width && meta.width > cfg.width ? img.resize({ width: cfg.width }) : img
    const webp = await resized.webp({ quality: cfg.quality, effort: 5 }).toBuffer()

    await writeFile(output, webp)
    seen.add(key)
    report.push({
      out: cfg.out,
      from: `${meta.width}x${meta.height}`,
      kb: Math.round(webp.length / 1024),
    })
  }

  for (const [key, out] of Object.entries(COPY)) {
    const input = join(SRC, key.split('/').join(sep))
    const output = join(OUT, out.split('/').join(sep))
    await mkdir(dirname(output), { recursive: true })
    const buf = await readFile(input)
    await writeFile(output, buf)
    seen.add(key)
    report.push({ out, from: 'svg', kb: Math.round(buf.length / 1024) })
  }

  for (const [key, out] of Object.entries(MARKS)) {
    const input = join(MARKS_SRC, key)
    const output = join(OUT, out.split('/').join(sep))
    await mkdir(dirname(output), { recursive: true })

    const buf = await readFile(input)
    const img = sharp(buf, { failOn: 'none' })
    const meta = await img.metadata()
    const resized = meta.width && meta.width > 512 ? img.resize({ width: 512 }) : img
    const webp = await resized.webp({ quality: 90, effort: 5 }).toBuffer()

    await writeFile(output, webp)
    report.push({
      out,
      from: `${meta.width}x${meta.height}`,
      kb: Math.round(webp.length / 1024),
    })
  }

  // 未登记的素材直接报错，避免悄悄漏掉真实素材
  const present = (await walk(SRC)).map((p) => relative(SRC, p).split(sep).join('/'))
  const unplanned = present.filter((p) => !seen.has(p))
  if (unplanned.length) {
    throw new Error(`media-src 中存在未登记的素材：\n  ${unplanned.join('\n  ')}`)
  }

  for (const r of report) {
    process.stdout.write(`${r.out.padEnd(42)} ${String(r.from).padEnd(12)} ${r.kb} KB\n`)
  }
  const total = report.reduce((a, r) => a + r.kb, 0)
  process.stdout.write(`\n${report.length} files · ${total} KB total\n`)
}

main().catch((err) => {
  process.stderr.write(String(err?.stack || err) + '\n')
  process.exit(1)
})