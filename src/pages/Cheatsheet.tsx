import { useMemo, useState } from 'react'
import type { JSX } from 'react'
import { cheatEntries } from '../data/cheatsheet'
import { groupBy } from '../lib/utils'
import { Card, SectionTitle } from '../components/ui/primitives'
import { Stagger } from '../components/ui/Stagger'
import { Icon } from '../components/ui/Icon'

export function CheatsheetPage(): JSX.Element {
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()

  const filtered = useMemo(() => {
    if (!q) return cheatEntries
    return cheatEntries.filter(
      (e) =>
        e.command.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        (e.example ?? '').toLowerCase().includes(q) ||
        (e.tags ?? []).some((t) => t.includes(q)),
    )
  }, [q])

  const grouped = useMemo(() => [...groupBy(filtered, (e) => e.category).entries()], [filtered])

  return (
    <div>
      <SectionTitle sub={`${cheatEntries.length} commands from the tracks — search, copy, practice.`}>Cheat sheet</SectionTitle>

      <div className="relative mb-8 max-w-xl">
        <Icon name="search" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search commands, e.g. undo, branch, stash…"
          className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-accent-400 dark:border-zinc-700 dark:bg-zinc-900"
          aria-label="Search cheat sheet"
        />
      </div>

      {grouped.length === 0 ? (
        <p className="py-12 text-center text-zinc-500">No commands match “{query}”.</p>
      ) : null}

      <div className="space-y-10">
        {grouped.map(([category, entries], sectionIdx) => (
          <section key={category}>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-accent-500">{category}</h2>
            <Stagger
              key={`${query}-${sectionIdx}`}
              className="grid gap-3 md:grid-cols-2"
              step={35}
              maxDelay={420}
            >
              {entries.map((e) => (
                <Card key={e.command} className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <code className="font-mono text-sm font-semibold text-accent-600 dark:text-accent-300">{e.command}</code>
                    {e.example ? (
                      <button
                        type="button"
                        onClick={() => void navigator.clipboard.writeText(e.example ?? '')}
                        className="shrink-0 rounded-lg border border-zinc-200 p-1.5 text-zinc-400 transition-colors hover:border-accent-400 hover:text-accent-500 dark:border-zinc-800"
                        aria-label={`Copy example: ${e.example}`}
                      >
                        <Icon name="copy" className="h-3.5 w-3.5" />
                      </button>
                    ) : null}
                  </div>
                  <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-400">{e.description}</p>
                  {e.example ? (
                    <pre className="mt-2 overflow-x-auto rounded-lg bg-zinc-50 p-2.5 font-mono text-xs text-zinc-600 dark:bg-zinc-950 dark:text-zinc-400">
                      {e.example}
                    </pre>
                  ) : null}
                </Card>
              ))}
            </Stagger>
          </section>
        ))}
      </div>
    </div>
  )
}
