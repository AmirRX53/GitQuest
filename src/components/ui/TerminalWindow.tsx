import type { ReactNode, JSX } from 'react'
import { cx } from '../../lib/utils'

interface TerminalWindowProps {
  title?: string
  children: ReactNode
  className?: string
}

export function TerminalWindow({ title = 'bash', children, className = '' }: TerminalWindowProps): JSX.Element {
  return (
    <div
      className={cx(
        'relative overflow-hidden rounded-xl border border-zinc-700/60 bg-zinc-950 shadow-xl shadow-zinc-950/30',
        'ring-1 ring-accent-500/10 dark:ring-accent-500/15',
        'before:pointer-events-none before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:from-accent-500/10 before:via-transparent before:to-violet-500/10 before:opacity-60',
        'after:pointer-events-none after:absolute after:-inset-[1px] after:rounded-xl after:opacity-0 after:transition-opacity after:duration-300 hover:after:opacity-100 after:shadow-[0_0_28px_rgba(139,92,246,0.22)]',
        className,
      )}
    >
      <div className="relative flex items-center gap-2 border-b border-zinc-700/60 bg-zinc-900 px-4 py-2">
        <span className="h-3 w-3 rounded-full bg-red-500/80 shadow-sm shadow-red-500/20" />
        <span className="h-3 w-3 rounded-full bg-amber-500/80 shadow-sm shadow-amber-500/20" />
        <span className="h-3 w-3 rounded-full bg-emerald-500/80 shadow-sm shadow-emerald-500/20" />
        <span className="ml-2 font-mono text-xs text-zinc-400">{title}</span>
        <span className="ml-auto hidden h-1.5 w-1.5 rounded-full bg-accent-400 shadow-[0_0_10px_rgba(139,92,246,0.9)] sm:inline-block" aria-hidden />
      </div>
      <div className="relative p-4 font-mono text-sm">{children}</div>
    </div>
  )
}

export function Prompt({ path = '~', children }: { path?: string; children?: ReactNode }): JSX.Element {
  return (
    <div className="flex items-start gap-2">
      <span className="shrink-0 font-mono text-sm">
        <span className="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.35)]">{path}</span>
        <span className="text-zinc-500"> $ </span>
      </span>
      <span className="font-mono text-sm text-zinc-100">{children}</span>
    </div>
  )
}
