import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import ComingSoonPlate from './ComingSoonPlate'
import { diagrams } from '../data/diagrams'
import { getWork, works } from '../data/works'
import { useLang } from '../i18n/LangContext'
import { useActiveSection, useNarrow, usePrefersReducedMotion } from '../lib/hooks'
import { categoryKey, statusKey } from '../lib/labels'

const IDS = works.map((w) => `wa-${w.slug}`)
const LAST = works.length - 1
const STAGE_ID = 'archive-stage'
/** 档距里的那道缝：件与件之间只留一线，靠边框与纸色分开，不靠空带 */
const STEP_GAP = 30
/** 宽屏下当前档由舞台滚动位置直接算出，不再挂十个区块的测量，传一张空表 */
const EMPTY: string[] = []

/**
 * 滚动期间把刻字搁下。刻字每 18ms 改一次文本节点，那件所在的合成层就得跟着
 * 重画一遍；滚动本来每帧也在动这一层，两者叠在一起，滚轮就发涩。滚的时候停笔、
 * 滚停了接着刻——刻字只是把墨添上去，停一下看不出来，省下的却是滚动里最密的
 * 一笔开销。
 *
 * 只记一个时刻，不再为每次滚动事件起一个定时器：滚轮一秒钟能派上百个事件，
 * 原来每个事件都要 clearTimeout + setTimeout 一次，正是滚动里白白多出来的一笔。
 */
const SCROLL_IDLE_MS = 140
let lastScrollAt = 0

function noteScroll() {
  lastScrollAt = performance.now()
}

/** 页面是否正在滚：滚停了就继续刻字 */
const isScrolling = () => performance.now() - lastScrollAt < SCROLL_IDLE_MS

/** GitHub 地址换成 GitDiagram：路径不变，换一个域名就能读到架构图 */
const toDiagram = (url: string) => url.replace('github.com', 'gitdiagram.com')

const githubOf = (slug: string) => getWork(slug)?.links.find((l) => l.kind === 'github')?.url

/** 已经刻完的行不再重刻：翻走再翻回来，文字就停在全文上 */
const etched = new Set<string>()

/**
 * 已经取过的图版。舞台一次只挂三件，第四件是在跨档那一瞬才进 DOM 的——
 * 那一刻浏览器要现去取图、现解码，一张大图解码十几毫秒，正好压在滚动上，
 * 读起来就是「换件的时候卡一下」。所以提前两档把图取回来并解码，
 * 轮到它进 DOM 时图已经在解码缓存里，换件不再掉帧。
 */
const warmed = new Set<string>()

function warm(url?: string) {
  if (!url || warmed.has(url)) return
  warmed.add(url)
  const img = new Image()
  img.decoding = 'async'
  img.src = url
  void img.decode?.().catch(() => {})
}

const plateOf = (slug: string) => {
  const w = getWork(slug)
  return w ? (w.cover.src ?? w.logo) : undefined
}

/** 舞台的行程：从第一档走到最后一档要滚过的距离 */
function travelOf(stage: HTMLElement, view: HTMLElement) {
  return Math.max(1, stage.getBoundingClientRect().height - view.getBoundingClientRect().height)
}

/** 窗口吸附在页头下沿的高度，从 CSS 里读，改版式时不必回来改这里 */
function stickTopOf(view: HTMLElement) {
  return parseFloat(getComputedStyle(view).top) || 0
}

/**
 * 首屏索引脊与右侧竖轨共用：把页面滚到某一档的位置。
 * 舞台上只有当前件与上下件，远处的行并不在 DOM 里，所以不能靠锚点跳，
 * 只能按「档位 ÷ 总档数 × 行程」算出该滚到哪儿。
 */
export function scrollToWork(slug: string, smooth = true) {
  const i = works.findIndex((w) => w.slug === slug)
  if (i < 0) return
  const behavior: ScrollBehavior = smooth ? 'smooth' : 'auto'
  const stage = document.getElementById(STAGE_ID)
  const view = stage?.querySelector<HTMLElement>('.wa-view')
  if (stage && view) {
    const start = stage.getBoundingClientRect().top + window.scrollY - stickTopOf(view)
    window.scrollTo({ top: start + (i / LAST) * travelOf(stage, view), behavior })
    return
  }
  document.getElementById(`wa-${slug}`)?.scrollIntoView({ behavior, block: 'start' })
}

/**
 * 作品档案：一块吸附在版心里的舞台。
 * 页面照常滚，滚过一档的距离就翻一件——不接管滚轮、不锁滚动、不另起滚动容器，
 * 与详情页读目录是同一套「位置决定当前」的判据。
 *
 * 卷轴的位移完全由页面滚动位置算出来，写进 --wa-pos 而不是走 CSS 时间过渡：
 * 滚动一像素卷轴就走一像素，两者之间不会留下半拍错位。滚动期间只有这一个
 * 自定义属性在变，React 不参与，重渲染只发生在跨档的那一刻（全程十次）。
 *
 * 舞台上只挂当前一件与上下各一件，其余的不进 DOM、图版也不加载；
 * 右侧一条竖轨报出十档的位置，点一下就滚到那一档。
 */
export default function WorkArchive({ onActive }: { onActive: (slug: string) => void }) {
  const narrow = useNarrow()
  const reduced = usePrefersReducedMotion()
  const stageRef = useRef<HTMLDivElement | null>(null)
  const [index, setIndex] = useState(0)

  /* 只报「此刻在滚」这一件事，不做任何测量；刻字那边据此停笔 */
  useEffect(() => {
    window.addEventListener('scroll', noteScroll, { passive: true })
    return () => window.removeEventListener('scroll', noteScroll)
  }, [])

  useLayoutEffect(() => {
    if (narrow) return
    const stage = stageRef.current
    const view = stage?.querySelector<HTMLElement>('.wa-view')
    if (!stage || !view) return

    /* 吸附位：窗口顶边钉在页头下沿的那条线。它只在版式变化时才动，量一次存着。
       原来每帧都要 getComputedStyle(view).top 去取这个数——那是一次强制样式
       结算，而同一帧刚写过 --wa-pos、样式已经标脏，于是每帧都得把整棵子树的
       样式重算一遍才读得到它。滚动里最贵的一笔就出在这儿。 */
    let stick = stickTopOf(view)
    /* 行程 = 舞台高 － 窗口高。两者都只在版式变化时才变，交给 ResizeObserver
       报信，滚动里就不必再量这两个盒子。 */
    let travel = travelOf(stage, view)

    let raf = 0
    let shown = -1
    let lastSlot = -1
    const read = () => {
      raf = 0
      /* 与 scrollToWork 共用同一把尺：起点 + 进度 × 行程 */
      const top = stage.getBoundingClientRect().top
      const progress = Math.min(1, Math.max(0, (stick - top) / travel))
      const slot = progress * LAST
      /* 值没变就不写。写一次 --wa-pos 会让三件各自重算一遍样式；舞台还在视口
         外时进度恒为零，滚动首屏或页脚的那几百帧，这笔开销全是白花的。 */
      if (Math.abs(slot - lastSlot) > 1e-4) {
        lastSlot = slot
        stage.style.setProperty('--wa-pos', slot.toFixed(4))
      }
      const next = Math.round(slot)
      if (next !== shown) {
        shown = next
        setIndex(next)
      }
    }
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(read)
    }
    const onResize = () => {
      stick = stickTopOf(view)
      travel = travelOf(stage, view)
      onScroll()
    }
    read()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)

    /* 档距一改，舞台高度就变，行程得跟着更正 */
    const ro = new ResizeObserver(() => {
      travel = travelOf(stage, view)
      onScroll()
    })
    ro.observe(stage)

    return () => {
      if (raf) window.cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [narrow])

  /* 档距 = 当前件的实际高度 + 一道缝。件高由摘要四行定死、十件一致，所以档距
     是个常量；写成量出来的值，前后件正好贴住当前件，卷轴上下不再空出一条没有
     内容的带——「衔接」看着是断的，断的就是这条带。件高变了（字体到位、换语言、
     图版换比例）就重取一次。 */
  useLayoutEffect(() => {
    if (narrow) return
    const stage = stageRef.current
    const entry = stage?.querySelector<HTMLElement>('.wa-entry[data-on="true"]')
    if (!stage || !entry) return
    const sync = () => {
      const h = entry.getBoundingClientRect().height
      if (h < 1) return
      stage.style.setProperty('--wa-step', `${Math.round(h) + STEP_GAP}px`)
    }
    sync()
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(sync)
    ro.observe(entry)
    return () => ro.disconnect()
  }, [index, narrow])

  /* 窄屏放不下舞台，退回普通清单，当前件仍由滚动位置决定。
     宽屏下这个判据用不上（当前档由舞台滚动位置直接算出），
     就不要挂十个区块的测量——每帧白量一遍是白花的钱。 */
  const seen = useActiveSection(narrow ? IDS : EMPTY).replace('wa-', '')
  const cur = narrow ? Math.max(0, works.findIndex((w) => w.slug === seen)) : index
  const slug = works[cur]?.slug ?? works[0].slug

  /* 前后各两档的图版先取回来：第四件进 DOM 时图已在缓存里 */
  useEffect(() => {
    if (narrow) return
    for (const d of [0, 1, -1, 2, -2]) {
      const w = works[cur + d]
      if (w) warm(plateOf(w.slug))
    }
  }, [cur, narrow])

  /* 当前件交还给首页：首屏索引脊跟着亮 */
  const onActiveRef = useRef(onActive)
  onActiveRef.current = onActive
  useEffect(() => {
    onActiveRef.current(slug)
  }, [slug])

  const entries = works
    .map((w, i) => [w, i] as const)
    .filter(([, i]) => narrow || Math.abs(i - cur) <= 1)
    .map(([w, i]) => (
      <Entry
        key={w.slug}
        work={w}
        note={diagrams[w.slug]}
        gh={githubOf(w.slug)}
        i={i}
        on={i === cur}
        reduced={reduced}
      />
    ))

  if (narrow) return <ul className="wa-entries">{entries}</ul>

  return (
    <div
      className="wa-stage"
      id={STAGE_ID}
      ref={stageRef}
      style={{ '--count': works.length } as CSSProperties}
    >
      <div className="wa-view">
        <ul className="wa-reel">{entries}</ul>

        <ol className="wa-rail">
          {works.map((w, i) => (
            <li key={w.slug}>
              <button
                type="button"
                className="wa-tick"
                data-on={i === cur}
                aria-current={i === cur ? 'true' : undefined}
                aria-label={`${w.no} ${w.title.zh}`}
                onClick={() => scrollToWork(w.slug, !reduced)}
              />
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

function Entry({
  work: w,
  note,
  gh,
  i,
  on,
  reduced,
}: {
  work: (typeof works)[number]
  note?: { zh: string; en: string }
  gh?: string
  i: number
  on: boolean
  reduced: boolean
}) {
  const { t, L, lang } = useLang()
  const body = L(note ?? w.description)
  const typedRef = useRef<HTMLSpanElement | null>(null)

  /* 刻字直接写进 DOM 的文本节点，不经过 state。
     每 18ms 一次 setState 会把整件（标题、链接、图版）重渲染六十遍，
     正好压在滚动上，翻页时就成了能感觉到的卡顿；写 DOM 则一次布局都不触发。 */
  useEffect(() => {
    const host = typedRef.current
    if (!host) return
    const key = `${w.slug}:${lang}`
    const chars = Array.from(body)
    const done = () => {
      host.textContent = body
      host.dataset.typing = 'false'
    }
    if (reduced || !on || etched.has(key)) {
      done()
      return
    }
    let shown = 0
    host.textContent = ''
    host.dataset.typing = 'true'
    const perTick = Math.max(1, Math.ceil(chars.length / 60))
    const id = window.setInterval(() => {
      /* 页面正在滚：这一拍不落墨，也不推进进度——等滚停了从原处接着刻 */
      if (isScrolling()) return
      shown = Math.min(chars.length, shown + perTick)
      host.textContent = chars.slice(0, shown).join('')
      if (shown >= chars.length) {
        etched.add(key)
        host.dataset.typing = 'false'
        window.clearInterval(id)
      }
    }, 18)
    return () => {
      window.clearInterval(id)
      /* 刻到一半被翻走：记在册上，翻回来直接给全文，不再重刻一遍 */
      if (shown > 0 && shown < chars.length) etched.add(key)
    }
  }, [body, lang, on, reduced, w.slug])

  /* 图版：有封面图就用封面图，没有就用仓库里的真实标识，都没有才退回单字。
     还没成形的那两件不摆素材，图版位置立一块「敬请期待」的字版。 */
  const plate = w.comingSoon ? undefined : (w.cover.src ?? w.logo)
  const fit = w.comingSoon
    ? 'contain'
    : w.cover.type === 'image'
      ? 'cover'
      : w.logo
        ? 'mark'
        : 'contain'

  return (
    <li
      className="wa-entry"
      id={`wa-${w.slug}`}
      data-on={on}
      style={{ '--i': i, '--accent': w.accent } as CSSProperties}
    >
      <p className="wa-entry-head">
        <span className="wa-entry-flag" aria-hidden="true" />
        <span className="mono wa-entry-no">{w.no}</span>
        <span className="mono wa-entry-cat">{t(categoryKey(w.category))}</span>
        <span className="leader" aria-hidden="true" />
        {w.year ? <span className="mono wa-entry-year">{w.year}</span> : null}
        <span className="stamp" data-status={w.status}>
          {t(statusKey(w.status))}
        </span>
      </p>

      <div className="wa-entry-body">
        <div className="wa-entry-main">
          <h3 className="wa-entry-title display">
            <Link className="tlink" to={`/${lang}/works/${w.slug}`} tabIndex={on ? 0 : -1}>
              {L(w.title)}
            </Link>
          </h3>
          <p className="wa-entry-sub">{L(w.subtitle)}</p>

          <p className="mono wa-entry-label">
            {note ? t('archiveNoteLabel') : t('archiveFallbackLabel')}
          </p>
          <p className="wa-entry-note">
            <span className="wa-note-ghost" aria-hidden="true">
              {body}
            </span>
            <span className="wa-note-typed" ref={typedRef} aria-hidden="true" />
            <span className="sr">{body}</span>
          </p>

          <div className="wa-entry-foot">
            {gh ? (
              <a
                className="lk"
                href={toDiagram(gh)}
                target="_blank"
                rel="noreferrer noopener"
                tabIndex={on ? 0 : -1}
              >
                GitDiagram
                <span className="arw" data-dir="ne" aria-hidden="true">
                  ↗
                </span>
              </a>
            ) : (
              <span className="mono wa-entry-restricted">{t('archiveRestricted')}</span>
            )}

            <Link
              className="lk"
              data-tone="accent"
              to={`/${lang}/works/${w.slug}`}
              tabIndex={on ? 0 : -1}
            >
              {t('archiveOpen')}
              <span className="arw" data-dir="e" aria-hidden="true">
                →
              </span>
            </Link>
          </div>
        </div>

        <figure className="wa-entry-plate">
          <div className="wa-plate-media" data-fit={fit} data-soon={w.comingSoon ? 'true' : undefined}>
            {w.comingSoon ? (
              <ComingSoonPlate />
            ) : plate ? (
              <img src={plate} alt="" loading="lazy" decoding="async" />
            ) : (
              <span className="wa-plate-glyph display" aria-hidden="true">
                {w.cover.glyph}
              </span>
            )}
          </div>
        </figure>
      </div>
    </li>
  )
}
