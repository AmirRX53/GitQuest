import type { JSX } from 'react'
import type { TerminalDemo as Demo } from '../../types'
import { TerminalWindow } from './TerminalWindow'

const colorFor = (kind: string): string => {
  switch (kind) {
    case 'cmd':
      return 'text-zinc-100'
    case 'err':
      return 'text-red-400'
    case 'sys':
      return 'text-accent-300'
    default:
      return 'text-zinc-400'
  }
}

export function TerminalDemo({ demo }: { demo: Demo }): JSX.Element {
  return (
    <figure className="my-2">
      <TerminalWindow title={demo.title}>
        <div className="space-y-1">
          {demo.lines.map((line, i) => (
            <div key={i} className="flex items-start gap-2">
              {line.kind === 'cmd' ? (
                <span className="shrink-0 font-mono text-sm">
                  <span className="text-emerald-400">{demo.prompt}</span>
                  <span className="text-zinc-500"> $ </span>
                </span>
              ) : null}
              <span className={`whitespace-pre-wrap font-mono text-[13px] ${colorFor(line.kind)}`}>{line.text}</span>
            </div>
          ))}
        </div>
      </TerminalWindow>
      {demo.note ? <figcaption className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{demo.note}</figcaption> : null}
    </figure>
  )
}
