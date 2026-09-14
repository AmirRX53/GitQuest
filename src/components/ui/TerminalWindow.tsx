import type { ReactNode, JSX } from 'react'
import { cx } from '../../lib/utils'

interface TerminalWindowProps {
  title?: string
  children: ReactNode
  className?: string
}

export function TerminalWindow({ title = 'bash', children, className = '' }: TerminalWindowProps): JSX.Element {
  return (
    <div className={cx('overflow-hidden rounded-xl border border-zinc-700/60 bg-zinc-950 shadow-xl', className)}>
      <div className="flex items-center gap-2 border-b border-zinc-700/60 bg-zinc-900 px-4 py-2">
        <span className="h-3 w-3 rounded-full bg-red-500/80" />
        <span className="h-3 w-3 rounded-full bg-amber-500/80" />
        <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
        <span className="ml-2 font-mono text-xs text-zinc-400">{title}</span>
      </div>
      <div className="p-4 font-mono text-sm">{children}</div>
    </div>
  )
}

export function Prompt({ path = '~', children }: { path?: string; children?: ReactNode }): JSX.Element {
  return (
    <div className="flex items-start gap-2">
      <span className="shrink-0 font-mono text-sm">
        <span className="text-emerald-400">{path}</span>
        <span className="text-zinc-500"> $ </span>
      </span>
      <span className="font-mono text-sm text-zinc-100">{children}</span>
    </div>
  )
}
