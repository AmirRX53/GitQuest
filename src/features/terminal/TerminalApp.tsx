import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { JSX } from 'react'
import { createInitialState, runCommand } from './engine/engine'
import type { EngineState } from './engine/gitState'
import type { OutLine } from './engine/commands'
import type { Scenario } from '../../types'
import { evaluateCheck, describeCheck } from './engine/checks'
import { cx } from '../../lib/utils'
import { Icon } from '../../components/ui/Icon'
import { TerminalWindow } from '../../components/ui/TerminalWindow'

interface HistoryEntry {
  lines: OutLine[]
  cmd: string
}

const FREE_PLAYGROUND_SETUP = JSON.stringify({
  cwd: '/project',
  tree: { 'README.md': '# My Project\n\nWelcome to the sandbox — this file is yours to experiment with.' },
})

const COMMANDS = [
  'pwd', 'ls', 'cd', 'mkdir', 'touch', 'cat', 'echo', 'rm', 'cp', 'mv', 'grep', 'find', 'clear', 'help',
  'git init', 'git status', 'git add', 'git commit', 'git log', 'git diff', 'git branch', 'git switch',
  'git checkout', 'git tag', 'git merge', 'git restore', 'git reset', 'git revert', 'git stash',
  'git remote', 'git push', 'git pull', 'git fetch', 'git clone', 'git reflog',
]

const OUTPUT_COLOR: Record<string, string> = {
  cmd: 'text-zinc-100',
  out: 'text-zinc-300',
  err: 'text-red-400',
  sys: 'text-accent-300',
}

function promptFor(state: EngineState): string {
  const cwd = state.vfs.cwd
  return cwd === '/' ? '/' : cwd.startsWith('/') ? `~${cwd}` : cwd
}

export function TerminalApp({ scenario, onMilestone }: { scenario: Scenario | null; onMilestone?: (id: string) => void }): JSX.Element {
  const [, setScenarioId] = useState<string | null>(scenario?.id ?? null)
  const [state, setState] = useState<EngineState>(() => createInitialState(scenario?.setup ?? FREE_PLAYGROUND_SETUP))
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [input, setInput] = useState('')
  const [pastCommands, setPastCommands] = useState<string[]>([])
  const [pastIdx, setPastIdx] = useState(-1)
  const [stepIndex, setStepIndex] = useState(0)
  const [showHint, setShowHint] = useState(0)
  const [milestoneFired, setMilestoneFired] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Reload when the scenario prop changes.
    setScenarioId(scenario?.id ?? null)
    setState(createInitialState(scenario?.setup ?? FREE_PLAYGROUND_SETUP))
    setHistory([])
    setStepIndex(0)
    setShowHint(0)
    setMilestoneFired(false)
    setPastCommands([])
    setPastIdx(-1)
    setInput('')
  }, [scenario?.id, scenario?.setup])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [history])

  const steps = scenario?.steps ?? []
  const step = steps[stepIndex]

  // NOTE: the engine mutates state in place, so this must NOT be memoized on
  // state identity — recompute on every render (renders happen after each command).
  const stepPassed = step ? step.checks.every((c) => evaluateCheck(c, state).passed) : false

  useEffect(() => {
    if (stepPassed && step) {
      const t = window.setTimeout(() => {
        if (stepIndex + 1 < steps.length) {
          setStepIndex((i) => i + 1)
          setShowHint(0)
        } else if (!milestoneFired) {
          setMilestoneFired(true)
          onMilestone?.(scenario?.id ?? '')
        }
        setHistory((h) => [
          ...h,
          {
            cmd: '',
            lines: [
              { kind: 'sys', text: stepIndex + 1 < steps.length ? `✔ Step ${stepIndex + 1} complete — next goal unlocked below.` : '✔ Scenario complete! Great job.' },
            ],
          },
        ])
      }, 600)
      return () => window.clearTimeout(t)
    }
    return undefined
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepPassed, stepIndex])

  const execute = useCallback(
    (raw: string): void => {
      const result = runCommand(raw, state)
      setState(result.state)
      setHistory((h) => [...h, { cmd: raw, lines: result.lines }])
      if (raw.trim() !== '') {
        setPastCommands((p) => [...p.filter((c) => c !== raw), raw])
      }
      setPastIdx(-1)
      setInput('')
    },
    [state],
  )

  const suggestions = useMemo(() => {
    if (!input.includes(' ')) {
      return COMMANDS.filter((c) => c.startsWith(input) && input.length >= 2)
    }
    return []
  }, [input])

  const onKey = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') {
      execute(input)
    } else if (e.key === 'Tab') {
      e.preventDefault()
      const sugg = suggestions[0]
      if (sugg) setInput(sugg + (sugg.includes(' ') ? ' ' : ''))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (pastCommands.length === 0) return
      const idx = pastIdx === -1 ? pastCommands.length - 1 : Math.max(0, pastIdx - 1)
      setPastIdx(idx)
      setInput(pastCommands[idx] ?? '')
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (pastIdx === -1) return
      const idx = pastIdx + 1
      if (idx >= pastCommands.length) {
        setPastIdx(-1)
        setInput('')
      } else {
        setPastIdx(idx)
        setInput(pastCommands[idx] ?? '')
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault()
      setHistory([])
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="relative">
        <div aria-hidden className="pointer-events-none absolute -inset-2 -z-10 rounded-[18px] bg-gradient-to-br from-accent-500/15 via-violet-500/10 to-transparent blur-xl opacity-50 dark:opacity-70" />
        <TerminalWindow title={scenario ? `sandbox — ${scenario.title}` : 'sandbox — free playground'}>
        <div
          ref={scrollRef}
          className="h-[420px] cursor-text space-y-1 overflow-y-auto pr-1"
          onClick={() => inputRef.current?.focus()}
          role="log"
          aria-label="Terminal output"
        >
          {history.length === 0 ? (
            <p className="font-mono text-xs text-zinc-500">
              Welcome to the GitQuest sandbox. Type <span className="text-accent-300 drop-shadow-[0_0_10px_rgba(167,139,250,0.45)]">help</span> to list commands.
              {scenario ? ' Complete the goal on the right.' : ' Free explore mode — nothing can break.'}
            </p>
          ) : null}
          {history.map((entry, i) => (
            <div key={i}>
              {entry.cmd !== '' ? (
                <div className="flex items-start gap-2">
                  <span className="shrink-0 font-mono text-sm">
                    <span className="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">{promptFor(state)}</span>
                    <span className="text-zinc-500"> $ </span>
                  </span>
                  <span className="font-mono text-sm text-zinc-100">{entry.cmd}</span>
                </div>
              ) : null}
              {entry.lines.map((l, j) =>
                l.text !== '' || l.kind !== 'out' ? (
                  <div key={j} className={cx('whitespace-pre-wrap font-mono text-[13px]', OUTPUT_COLOR[l.kind])}>
                    {l.text}
                  </div>
                ) : null,
              )}
            </div>
          ))}
          {/* Active input line */}
          <div className="flex items-center gap-2">
            <span className="shrink-0 font-mono text-sm">
              <span className="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">{promptFor(state)}</span>
              <span className="text-zinc-500"> $ </span>
            </span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              className="w-full bg-transparent font-mono text-sm text-zinc-100 caret-accent-400 outline-none"
              aria-label="Terminal input"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        </div>
        </TerminalWindow>
      </div>

      <aside className="space-y-4">
        {scenario ? (
          <>
            <div className="glow-card rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-xs font-semibold uppercase tracking-wider text-accent-500">
                Goal {stepIndex + 1} of {steps.length}
              </p>
              <p className="mt-2 text-sm font-medium">{step?.goal}</p>
              {step ? (
                <>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {step.checks.map((c, i) => {
                      const res = evaluateCheck(c, state)
                      return (
                        <span
                          key={i}
                          className={cx(
                            'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px]',
                            res.passed
                              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
                              : 'border-zinc-300 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400',
                          )}
                        >
                          <Icon name={res.passed ? 'check' : 'x'} className="h-3 w-3" />
                          {describeCheck(c)}
                        </span>
                      )
                    })}
                  </div>
                  <div className="mt-3 space-y-1">
                    {step.hints.slice(0, showHint).map((h, i) => (
                      <p key={i} className="rounded-lg bg-accent-500/10 px-3 py-1.5 font-mono text-xs text-accent-600 dark:text-accent-300">
                        {h.label}: {h.text}
                      </p>
                    ))}
                    {showHint < step.hints.length ? (
                      <button
                        type="button"
                        onClick={() => setShowHint((n) => n + 1)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-accent-500 dark:text-zinc-400"
                      >
                        <Icon name="lightbulb" className="h-3.5 w-3.5" /> Need a hint?
                      </button>
                    ) : null}
                  </div>
                </>
              ) : null}
            </div>
            {stepPassed ? null : (
              <p className="text-center text-xs text-zinc-400 dark:text-zinc-500">The next goal unlocks when this one is complete.</p>
            )}
          </>
        ) : null}
        <div className="glow-card rounded-2xl border border-zinc-200 bg-white p-4 text-xs text-zinc-500 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          <p className="mb-2 font-semibold text-zinc-700 dark:text-zinc-200">Keyboard</p>
          <ul className="space-y-1">
            <li><kbd className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">Tab</kbd> complete command</li>
            <li><kbd className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">↑ / ↓</kbd> command history</li>
            <li><kbd className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">Ctrl+L</kbd> clear screen</li>
          </ul>
        </div>
      </aside>
    </div>
  )
}
