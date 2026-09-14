import type { ReactNode, JSX } from 'react'
import { Link } from 'react-router-dom'

import type { CalloutKind } from '../../types'
import { cx } from '../../lib/utils'
import { Icon, type IconName } from './Icon'

export function Badge({ children, className = '' }: { children: ReactNode; className?: string }): JSX.Element {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 rounded-full border border-zinc-300 px-2 py-0.5 text-xs font-medium text-zinc-700 light:border-zinc-300 light:bg-zinc-100 light:text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300',
        className,
      )}
    >
      {children}
    </span>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }): JSX.Element {
  return (
    <div
      className={cx(
        'rounded-2xl border border-zinc-200 bg-white shadow-sm light:border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900',
        className,
      )}
    >
      {children}
    </div>
  )
}

const calloutStyles: Record<CalloutKind, { icon: IconName; classes: string; label: string }> = {
  tip: { icon: 'lightbulb', classes: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-900 dark:text-emerald-200', label: 'Tip' },
  warning: { icon: 'warning', classes: 'border-amber-500/30 bg-amber-500/5 text-amber-900 dark:text-amber-200', label: 'Warning' },
  'best-practice': { icon: 'award', classes: 'border-violet-500/30 bg-violet-500/5 text-violet-900 dark:text-violet-200', label: 'Best practice' },
  info: { icon: 'info', classes: 'border-blue-500/30 bg-blue-500/5 text-blue-900 dark:text-blue-200', label: 'Good to know' },
}

export function Callout({ kind, title, body }: { kind: CalloutKind; title: string; body: string }): JSX.Element {
  const style = calloutStyles[kind]
  return (
    <aside className={cx('flex gap-3 rounded-xl border p-4', style.classes)}>
      <Icon name={style.icon} className="mt-0.5 h-5 w-5 shrink-0" />
      <div>
        <p className="text-sm font-semibold">{title ?? style.label}</p>
        <p className="mt-1 text-sm leading-relaxed opacity-90">{body}</p>
      </div>
    </aside>
  )
}

export function ProgressBar({ value, className = '', fillClassName = 'from-accent-500 to-accent-400' }: { value: number; className?: string; fillClassName?: string }): JSX.Element {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100)
  return (
    <div className={cx('h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800', className)} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className={cx('h-full rounded-full bg-gradient-to-r transition-all duration-500', fillClassName)} style={{ width: `${pct}%` }} />
    </div>
  )
}

export function ProgressRing({ value, size = 56, stroke = 5, label }: { value: number; size?: number; stroke?: number; label?: string }): JSX.Element {
  const pct = Math.min(1, Math.max(0, value))
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} className="stroke-zinc-200 dark:stroke-zinc-800" fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          className="stroke-accent-500 transition-all duration-700"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-xs font-semibold">{label ?? `${Math.round(pct * 100)}%`}</span>
    </div>
  )
}

interface LinkButtonProps {
  to: string
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  className?: string
}

export function LinkButton({ to, children, variant = 'primary', className = '' }: LinkButtonProps): JSX.Element {
  return (
    <Link
      to={to}
      className={cx(
        'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all',
        variant === 'primary' && 'bg-accent-600 text-white shadow-lg shadow-accent-600/25 hover:bg-accent-500',
        variant === 'secondary' &&
          'border border-zinc-300 text-zinc-800 hover:border-accent-400 hover:text-accent-700 light:border-zinc-300 dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-accent-400 dark:hover:text-accent-300',
        variant === 'ghost' && 'text-zinc-600 hover:text-accent-600 dark:text-zinc-400 dark:hover:text-accent-300',
        className,
      )}
    >
      {children}
    </Link>
  )
}

export function SectionTitle({ children, sub }: { children: ReactNode; sub?: string }): JSX.Element {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold tracking-tight">{children}</h2>
      {sub ? <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{sub}</p> : null}
    </div>
  )
}
