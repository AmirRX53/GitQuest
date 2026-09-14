import { useState } from 'react'
import type { JSX } from 'react'
import { cx } from '../../lib/utils'
import { Icon } from './Icon'

function CopyButton({ getText, className = '' }: { getText: () => string; className?: string }): JSX.Element {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(getText()).then(() => {
          setCopied(true)
          window.setTimeout(() => setCopied(false), 1500)
        })
      }}
      className={cx(
        'inline-flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-900/80 px-2 py-1 text-xs text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200',
        className,
      )}
      aria-label="Copy code"
    >
      <Icon name={copied ? 'check' : 'copy'} className="h-3.5 w-3.5" />
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

interface CodeBlockProps {
  code: string
  lang?: string
  title?: string
  className?: string
}

/** Minimal shell-aware tokenizer: comments, strings, flags, and the leading command. */
function tokenizeLine(line: string): Array<{ text: string; cls: string }> {
  const out: Array<{ text: string; cls: string }> = []
  const commentIdx = line.indexOf('#')
  const codePart = commentIdx >= 0 ? line.slice(0, commentIdx) : line
  const comment = commentIdx >= 0 ? line.slice(commentIdx) : ''

  const re = /("[^"]*"|'[^']*')|(\s)|(\S+)/g
  let m: RegExpExecArray | null
  let firstWord = true
  while ((m = re.exec(codePart)) !== null) {
    const [full, str, ws, word] = m
    if (ws) {
      out.push({ text: ' ', cls: '' })
      continue
    }
    if (str) {
      out.push({ text: str, cls: 'text-emerald-300' })
    } else if (word) {
      if (firstWord) {
        out.push({ text: word, cls: 'text-accent-300 font-semibold' })
        firstWord = false
      } else if (word.startsWith('-')) {
        out.push({ text: word, cls: 'text-amber-300' })
      } else {
        out.push({ text: word, cls: 'text-zinc-200' })
      }
    } else if (full) {
      out.push({ text: full, cls: '' })
    }
  }
  if (comment) out.push({ text: comment, cls: 'text-zinc-500 italic' })
  return out
}

export function CodeBlock({ code, lang = 'bash', title, className = '' }: CodeBlockProps): JSX.Element {
  return (
    <figure className={cx('overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950', className)}>
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-2 dark:border-zinc-800">
        <figcaption className="font-mono text-xs text-zinc-500 dark:text-zinc-400">{title ?? lang}</figcaption>
        <CopyButton getText={() => code} />
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed">
        {lang === 'bash'
          ? code.split('\n').map((line, i) => (
              <div key={i}>
                {tokenizeLine(line).map((t, j) => (
                  <span key={j} className={t.cls}>
                    {t.text}
                  </span>
                ))}
              </div>
            ))
          : code}
      </pre>
    </figure>
  )
}

/** Inline `code` chip. */
export function ICode({ children }: { children: string }): JSX.Element {
  return (
    <code className="rounded-md border border-zinc-300 bg-zinc-100 px-1.5 py-0.5 font-mono text-[0.85em] text-accent-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-accent-300">
      {children}
    </code>
  )
}
