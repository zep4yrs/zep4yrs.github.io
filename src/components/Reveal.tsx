import type { ReactNode } from 'react'
import { useReveal } from '../lib/hooks'

/** 进入视口后揭示一次；减弱动态时直接呈现 */
export default function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const { ref, shown } = useReveal<HTMLDivElement>()

  return (
    <div
      ref={ref}
      className={className ? `reveal ${className}` : 'reveal'}
      data-shown={shown}
      style={delay ? ({ '--reveal-delay': `${delay}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </div>
  )
}