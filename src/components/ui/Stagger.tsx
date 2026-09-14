import type { CSSProperties, JSX, ReactNode } from 'react'
import { Children } from 'react'

interface StaggerProps {
  children: ReactNode
  /** Delay step between items in ms. */
  step?: number
  /** Maximum total cascade delay in ms (prevents long grids waiting forever). */
  maxDelay?: number
  className?: string
}

/**
 * Applies a staggered entrance animation to each direct child.
 * Delay grows per item but is capped so large grids don't wait forever.
 */
export function Stagger({ children, step = 60, maxDelay = 480, className = '' }: StaggerProps): JSX.Element {
  const items = Children.toArray(children)
  return (
    <div className={className}>
      {items.map((child, i) => (
        <div
          key={i}
          className="animate-item-in h-full"
          style={{ animationDelay: `${Math.min(i * step, maxDelay)}ms` } as CSSProperties}
        >
          {child}
        </div>
      ))}
    </div>
  )
}
