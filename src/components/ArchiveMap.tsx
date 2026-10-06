import { Link, useNavigate } from 'react-router-dom'
import { threads, works } from '../data/works'
import { useLang } from '../i18n/LangContext'
import { statusKey } from '../lib/labels'
import { useCoarseOrSmall } from '../lib/hooks'

const SLOTS = 5
const VB_W = 900
const TILE_W = 160
const TILE_H = 200
const BAND_H = 104
const COL_CX = [90, 270, 450, 630, 810]
const ROW_STRIDE = 306
const PAD_TOP = 10
const HEAD_TEXT_DY = 22
const HEAD_RULE_DY = 34
const TILE_DY = 46

/* 图版柜的装箱顺序：把单件脉络插进三件脉络之间，五条脉络恰好铺满两排十格。
   版面因此没有空格，也没有为了对齐而被拉长的行。 */
const MAP_ORDER = ['security', 'game', 'web', 'desktop', 'education']

interface Group {
  id: string
  from: number
  to: number
  slugs: string[]
}

const ROWS: Group[][] = (() => {
  const ordered = MAP_ORDER.map((id) => threads.find((th) => th.id === id)).filter(
    (th): th is (typeof threads)[number] => Boolean(th),
  )
  const rows: Group[][] = []
  let row: Group[] = []
  let col = 0
  for (const th of ordered) {
    if (col + th.works.length > SLOTS && row.length) {
      rows.push(row)
      row = []
      col = 0
    }
    row.push({ id: th.id, from: col, to: col + th.works.length - 1, slugs: th.works })
    col += th.works.length
  }
  if (row.length) rows.push(row)
  return rows
})()

const VB_H = PAD_TOP + ROWS.length * ROW_STRIDE - (ROW_STRIDE - TILE_DY - TILE_H) + 20

const THREAD_LABEL: Record<string, (typeof threads)[number]['label']> = {}
for (const th of threads) THREAD_LABEL[th.id] = th.label

const BY_SLUG = new Map(works.map((w) => [w.slug, w]))

export default function ArchiveMap({
  active,
  onActive,
}: {
  active: string
  onActive: (slug: string) => void
}) {
  const { t, L, lang } = useLang()
  const navigate = useNavigate()
  const compact = useCoarseOrSmall()

  /* 窄屏 / 触屏：图版柜改为可点的档案清单，一次点击直达作品 */
  if (compact) {
    return (
      <ul className="amap-list">
        {works.map((w) => {
          const thumb = w.logo ?? w.cover.src
          const thumbFit = w.logo ? 'mark' : w.cover.type === 'image' ? 'cover' : 'contain'
          return (
            <li key={w.slug}>
              <Link to={`/${lang}/works/${w.slug}`} className="amap-row">
                <span className="amap-row-thumb" data-fit={thumbFit}>
                  {thumb ? (
                    <img src={thumb} alt="" loading="lazy" decoding="async" />
                  ) : (
                    <span className="amap-row-glyph" aria-hidden="true">
                      {w.cover.glyph}
                    </span>
                  )}
                </span>
                <span className="amap-row-main">
                  <span className="amap-row-top">
                    <span className="mono amap-row-no">{w.no}</span>
                    <span className="stamp" data-status={w.status}>
                      {t(statusKey(w.status))}
                    </span>
                  </span>
                  <span className="amap-row-title">{L(w.title)}</span>
                  <span className="amap-row-sub">{L(w.subtitle)}</span>
                </span>
                <span className="amap-row-arw" aria-hidden="true">
                  →
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    )
  }

  const order = works.map((w) => w.slug)

  const move = (dir: number) => {
    const i = order.indexOf(active)
    onActive(order[(i + dir + order.length) % order.length])
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault()
      move(1)
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault()
      move(-1)
    }
  }

  return (
    <div className="amap" onKeyDown={onKeyDown}>
      <svg
        className="amap-svg"
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="xMidYMid meet"
        role="group"
        aria-label={t('archiveIndexLabel')}
      >
        {ROWS.map((row, ri) => {
          const top = PAD_TOP + ri * ROW_STRIDE
          return (
            <g key={`row-${ri}`}>
              {row.map((g) => {
                const left = COL_CX[g.from] - TILE_W / 2
                const right = COL_CX[g.to] + TILE_W / 2
                return (
                  <g key={`head-${g.id}`} className="amap-group">
                    <text
                      className="amap-group-label"
                      x={left + 2}
                      y={top + HEAD_TEXT_DY}
                      textAnchor="start"
                    >
                      {L(THREAD_LABEL[g.id])}
                    </text>
                    <text
                      className="amap-group-count"
                      x={right - 2}
                      y={top + HEAD_TEXT_DY}
                      textAnchor="end"
                    >
                      {String(g.slugs.length).padStart(2, '0')}
                    </text>
                    <line
                      className="amap-group-rule"
                      x1={left}
                      y1={top + HEAD_RULE_DY}
                      x2={right}
                      y2={top + HEAD_RULE_DY}
                    />
                    {g.slugs.map((slug, i) => (
                      <line
                        key={`tick-${slug}`}
                        className="amap-group-tick"
                        x1={COL_CX[g.from + i]}
                        y1={top + HEAD_RULE_DY}
                        x2={COL_CX[g.from + i]}
                        y2={top + TILE_DY}
                      />
                    ))}
                  </g>
                )
              })}

              {row.map((g) =>
                g.slugs.map((slug, i) => {
                  const w = BY_SLUG.get(slug)
                  if (!w) return null
                  const cx = COL_CX[g.from + i]
                  const x = cx - TILE_W / 2
                  const y = top + TILE_DY
                  const mark = w.logo ?? (w.cover.type === 'image' ? w.cover.src : undefined)
                  return (
                    <g
                      key={slug}
                      className="amap-node"
                      style={{ '--accent': w.accent } as React.CSSProperties}
                      data-active={slug === active}
                      data-status={w.status}
                      tabIndex={0}
                      role="link"
                      aria-label={`${w.no} ${L(w.title)}`}
                      aria-current={slug === active ? 'true' : undefined}
                      onMouseEnter={() => onActive(slug)}
                      onFocus={() => onActive(slug)}
                      onClick={() => navigate(`/${lang}/works/${slug}`)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          navigate(`/${lang}/works/${slug}`)
                        }
                      }}
                    >
                      <rect
                        className="amap-tile"
                        x={x}
                        y={y}
                        width={TILE_W}
                        height={TILE_H}
                      />
                      <rect
                        className="amap-tile-band"
                        x={x}
                        y={y}
                        width={TILE_W}
                        height={BAND_H}
                      />
                      {mark ? (
                        <image
                          className="amap-tile-logo"
                          x={x + (TILE_W - 58) / 2}
                          y={y + (BAND_H - 58) / 2}
                          width={58}
                          height={58}
                          href={mark}
                          preserveAspectRatio="xMidYMid meet"
                        />
                      ) : (
                        <text
                          className="amap-tile-glyph"
                          x={cx}
                          y={y + BAND_H / 2 + 15}
                          textAnchor="middle"
                        >
                          {w.cover.glyph}
                        </text>
                      )}
                      <circle
                        className="amap-node-dot"
                        cx={x + TILE_W - 16}
                        cy={y + 16}
                        r={4}
                      />
                      <text className="amap-tile-no" x={x + 16} y={y + BAND_H + 40}>
                        {w.no}
                      </text>
                      <text className="amap-tile-title" x={x + 45} y={y + BAND_H + 40}>
                        {L(w.title)}
                      </text>
                      <text className="amap-tile-meta" x={x + 16} y={y + BAND_H + 70}>
                        {[w.year, t(statusKey(w.status))].filter(Boolean).join(' · ')}
                      </text>
                    </g>
                  )
                }),
              )}
            </g>
          )
        })}
      </svg>

      <p className="amap-hint mono">{t('archiveKeyboard')}</p>
    </div>
  )
}
