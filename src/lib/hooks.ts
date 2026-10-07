import { useCallback, useEffect, useRef, useState } from 'react'

/** 跟随 prefers-reduced-motion，并支持用户在站内手动覆盖 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    if (!window.matchMedia) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return reduced
}

/** 窄屏：吸附式舞台放不下整件，降级成普通清单 */
export function useNarrow(query = '(max-width: 1000px)'): boolean {
  const [narrow, setNarrow] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    if (!window.matchMedia) return
    const mq = window.matchMedia(query)
    const onChange = () => setNarrow(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [query])

  return narrow
}

/**
 * 目录的当前章节：取「最后一个已经越过版心偏上那条线」的区块。
 * 与页头的当前区高亮同一套判据，滚动时读者才知道自己读到哪儿。
 *
 * 判定收进 rAF：滚动事件一秒能来上百次，每次都去量十个区块的盒子等于每秒
 * 上百次强制重排，正是滚动发涩的来头。一帧只量一次，且只在跨档时才落 state。
 */
export function useActiveSection(ids: string[]): string {
  const [active, setActive] = useState(ids[0] ?? '')
  const key = ids.join('|')

  useEffect(() => {
    if (ids.length === 0) return
    let raf = 0
    const read = () => {
      raf = 0
      /* 版心偏上 30% 处那条线，用视口高度直接比，不必再叠一次 scrollY */
      const mark = window.innerHeight * 0.3
      let next = ids[0]
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= mark) next = id
      }
      setActive((prev) => (prev === next ? prev : next))
    }
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(read)
    }
    read()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (raf) window.cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
    // ids 由 key 派生，key 相同即内容相同
  }, [key])

  return active
}

/** 把一段文本交给剪贴板，并在两秒内回一句「已复制」。没有页面可开的账号
    （QQ / 微信）靠它交接，页脚与关于区两处的联络行共用同一份行为。 */
export function useCopyToClipboard(resetMs = 2000) {
  const [copied, setCopied] = useState<string | null>(null)
  const timer = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current)
    },
    [],
  )

  const copy = useCallback(
    async (value: string) => {
      try {
        await navigator.clipboard.writeText(value)
        setCopied(value)
        if (timer.current !== null) window.clearTimeout(timer.current)
        timer.current = window.setTimeout(() => setCopied((v) => (v === value ? null : v)), resetMs)
      } catch {
        setCopied(null)
      }
    },
    [resetMs],
  )

  return { copied, copy }
}

/** 元素进入视口后触发一次，用于滚动揭示动画 */
export function useReveal<T extends HTMLElement>(disabled = false) {
  const ref = useRef<T | null>(null)
  const [shown, setShown] = useState(disabled)

  useEffect(() => {
    if (disabled) {
      setShown(true)
      return
    }
    const node = ref.current
    if (!node || typeof IntersectionObserver === 'undefined') {
      setShown(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true)
            io.disconnect()
          }
        })
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
    )
    io.observe(node)
    return () => io.disconnect()
  }, [disabled])

  return { ref, shown }
}