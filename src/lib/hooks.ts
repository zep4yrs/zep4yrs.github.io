import { useEffect, useRef, useState } from 'react'

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

/** 判断当前是否处于「低性能 / 窄屏」场景，用于降级复杂效果 */
export function useCoarseOrSmall(): boolean {
  const [value, setValue] = useState(() => {
    if (typeof window === 'undefined') return false
    const coarse = window.matchMedia?.('(pointer: coarse)').matches ?? false
    return coarse || window.innerWidth < 900
  })

  useEffect(() => {
    const onResize = () => {
      const coarse = window.matchMedia?.('(pointer: coarse)').matches ?? false
      setValue(coarse || window.innerWidth < 900)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return value
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