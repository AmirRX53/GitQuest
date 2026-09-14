import { useMemo, useState } from 'react'
import type { JSX } from 'react'
import { glossaryTerms } from '../data/glossary'
import { resources, resourceKindLabels } from '../data/resources'
import { groupBy } from '../lib/utils'
import { Badge, Card, LinkButton, SectionTitle } from '../components/ui/primitives'
import { Stagger } from '../components/ui/Stagger'
import { Icon } from '../components/ui/Icon'

export function GlossaryPage(): JSX.Element {
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const filtered = useMemo(
    () => glossaryTerms.filter((t) => t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q)),
    [q],
  )
  const grouped = useMemo(() => [...groupBy(filtered, (t) => t.category).entries()], [filtered])

  return (
    <div>
      <SectionTitle sub="The vocabulary of version control, minus the jargon.">Glossary</SectionTitle>
      <div className="relative mb-8 max-w-xl">
        <Icon name="search" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search terms…"
          className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-accent-400 dark:border-zinc-700 dark:bg-zinc-900"
          aria-label="Search glossary"
        />
      </div>
      <div className="space-y-10">
        {grouped.map(([category, terms], sectionIdx) => (
          <section key={category}>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-accent-500">{category}</h2>
            <Stagger key={`${query}-${sectionIdx}`} className="grid gap-3 md:grid-cols-2" step={35} maxDelay={420}>
              {terms.map((t) => (
                <Card key={t.term} className="p-4">
                  <dt className="font-semibold">{t.term}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{t.definition}</dd>
                </Card>
              ))}
            </Stagger>
          </section>
        ))}
        {grouped.length === 0 ? <p className="py-12 text-center text-zinc-500">No terms match “{query}”.</p> : null}
      </div>
    </div>
  )
}

export function ResourcesPage(): JSX.Element {
  return (
    <div>
      <SectionTitle sub="Official documentation and the community classics, curated.">Resources</SectionTitle>
      <Stagger className="grid gap-3 md:grid-cols-2" step={45} maxDelay={450}>
        {resources.map((r) => (
          <a key={r.url} href={r.url} target="_blank" rel="noreferrer" className="block">
            <Card className="flex h-full items-start gap-4 p-5 transition-all hover:border-accent-400/60 hover:shadow-md">
              <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-500/10 text-accent-500">
                <Icon name="book" className="h-4.5 w-4.5" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{r.title}</h3>
                  <Badge>{resourceKindLabels[r.kind]}</Badge>
                </div>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{r.description}</p>
                <p className="mt-2 inline-flex items-center gap-1 text-xs text-accent-500">
                  {new URL(r.url).hostname} <Icon name="external" className="h-3 w-3" />
                </p>
              </div>
            </Card>
          </a>
        ))}
      </Stagger>
      <Card className="mt-10 p-6 text-center">
        <p className="font-semibold">Ready to test yourself?</p>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Take a track quiz or run a sandbox scenario.</p>
        <div className="mt-4 flex justify-center gap-2">
          <LinkButton to="/quizzes">Quizzes</LinkButton>
          <LinkButton to="/sandbox" variant="secondary">Sandbox</LinkButton>
        </div>
      </Card>
    </div>
  )
}

export function NotFoundPage(): JSX.Element {
  return (
    <div className="py-24 text-center">
      <p className="font-mono text-6xl font-black text-zinc-200 dark:text-zinc-800">404</p>
      <h1 className="mt-4 text-2xl font-bold">This branch doesn&apos;t exist</h1>
      <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
        The page you asked for was never committed. <code className="font-mono">git switch</code> back to safety:
      </p>
      <div className="mt-6 flex justify-center gap-2">
        <LinkButton to="/">Home</LinkButton>
        <LinkButton to="/tracks" variant="secondary">Tracks</LinkButton>
      </div>
    </div>
  )
}
