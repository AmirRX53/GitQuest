import { useState } from 'react'
import type { JSX } from 'react'
import { Link, useParams } from 'react-router-dom'
import { tracks } from '../data/tracks'

function findTrackById(lessonId: string) {
  return tracks.find((t) => t.lessons.some((l) => l.id === lessonId))
}
import { scenarios } from '../data/scenarios'
import { useProgress } from '../lib/progress'
import type { LessonBlock } from '../types'
import { Badge, Card, LinkButton } from '../components/ui/primitives'
import { Icon } from '../components/ui/Icon'
import { CodeBlock, ICode } from '../components/ui/CodeBlock'
import { TerminalDemo } from '../components/ui/TerminalDemo'
import { Callout } from '../components/ui/primitives'
import { cx } from '../lib/utils'

/** Render **bold**, *italic* and `code` spans inside prose strings. */
function RichText({ text }: { text: string }): JSX.Element {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) return <strong key={i}>{part.slice(2, -2)}</strong>
        if (part.startsWith('*') && part.endsWith('*') && part.length > 2) return <em key={i}>{part.slice(1, -1)}</em>
        if (part.startsWith('`') && part.endsWith('`')) return <ICode key={i}>{part.slice(1, -1)}</ICode>
        return <span key={i}>{part}</span>
      })}
    </>
  )
}

function BlockView({ block }: { block: LessonBlock }): JSX.Element {
  switch (block.kind) {
    case 'prose':
      return (
        <p className="leading-relaxed text-zinc-700 dark:text-zinc-300">
          <RichText text={block.text} />
        </p>
      )
    case 'heading':
      return <h3 className="mt-2 text-xl font-bold tracking-tight">{block.text}</h3>
    case 'list':
      return block.ordered ? (
        <ol className="ml-5 list-decimal space-y-1.5 text-zinc-700 dark:text-zinc-300">
          {block.items.map((item, i) => (
            <li key={i} className="leading-relaxed"><RichText text={item} /></li>
          ))}
        </ol>
      ) : (
        <ul className="ml-5 list-disc space-y-1.5 text-zinc-700 dark:text-zinc-300">
          {block.items.map((item, i) => (
            <li key={i} className="leading-relaxed"><RichText text={item} /></li>
          ))}
        </ul>
      )
    case 'demo':
      return <TerminalDemo demo={block.demo} />
    case 'callout':
      return <Callout kind={block.callout.kind} title={block.callout.title} body={block.callout.body} />
    case 'code':
      return <CodeBlock code={block.code} lang={block.lang} title={block.title} />
    case 'table':
      return (
        <figure>
          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 font-semibold dark:bg-zinc-900">
                <tr>
                  {block.table.headers.map((h, i) => (
                    <th key={i} className="px-4 py-2.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {block.table.rows.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j} className="px-4 py-2.5 align-top font-mono text-[13px] text-zinc-700 dark:text-zinc-300">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {block.table.caption ? <figcaption className="mt-2 text-xs text-zinc-500">{block.table.caption}</figcaption> : null}
        </figure>
      )
    case 'flow':
      return <FlowDiagram steps={block.steps} />
  }
}

function FlowDiagram({ steps }: { steps: Array<{ id: string; label: string; detail: string }> }): JSX.Element {
  const [active, setActive] = useState(0)
  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center gap-2">
        {steps.map((s, i) => (
          <span key={s.id} className="inline-flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActive(i)}
              className={cx(
                'rounded-full border px-3 py-1.5 text-xs font-semibold transition-all',
                i === active
                  ? 'border-accent-500 bg-accent-500 text-white shadow-md shadow-accent-500/30'
                  : 'border-zinc-300 text-zinc-600 hover:border-accent-400 dark:border-zinc-700 dark:text-zinc-300',
              )}
            >
              {s.label}
            </button>
            {i < steps.length - 1 ? <Icon name="chevron" className="h-3.5 w-3.5 text-zinc-400" /> : null}
          </span>
        ))}
      </div>
      <p className="mt-4 rounded-xl bg-zinc-50 p-4 text-sm leading-relaxed text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
        {steps[active]?.detail}
      </p>
    </Card>
  )
}

export function LessonPage(): JSX.Element {
  const { lessonId } = useParams()
  const progress = useProgress()
  const trackForLesson = lessonId ? findTrackById(lessonId) : undefined
  const lesson = trackForLesson?.lessons.find((l) => l.id === lessonId)
  const trackTitle = trackForLesson?.title ?? ''

  if (!lesson || !trackForLesson) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg font-semibold">Lesson not found.</p>
        <LinkButton to="/tracks" className="mt-4">Back to tracks</LinkButton>
      </div>
    )
  }

  const isComplete = progress.completedLessons.includes(lesson.id)
  const relatedScenarios = scenarios.filter((s) => lesson.tryIt.includes(s.id))
  const idx = trackForLesson.lessons.findIndex((l) => l.id === lesson.id)
  const prev = idx > 0 ? trackForLesson.lessons[idx - 1] : null
  const next = idx < trackForLesson.lessons.length - 1 ? trackForLesson.lessons[idx + 1] : null

  return (
    <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
      {/* Section nav */}
      <nav className="hidden lg:block" aria-label="Lesson sections">
        <div className="sticky top-24 space-y-1">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">{trackTitle}</p>
          {lesson.sections.map((s, i) => (
            <a key={s.id} href={`#${s.id}`} className="block rounded-lg px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900">
              {i + 1}. {s.title}
            </a>
          ))}
        </div>
      </nav>

      <article className="min-w-0">
        <Link to={`/track/${trackForLesson.id}`} className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-accent-500 dark:text-zinc-400">
          <Icon name="chevron" className="h-4 w-4 rotate-180" /> {trackTitle}
        </Link>
        <div className="mb-2 flex items-center gap-2">
          <Badge>
            <Icon name="clock" className="h-3.5 w-3.5" /> {lesson.minutes} min
          </Badge>
          {isComplete ? (
            <Badge className="border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
              <Icon name="check" className="h-3.5 w-3.5" /> Completed
            </Badge>
          ) : null}
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">{lesson.title}</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">{lesson.summary}</p>

        <div className="mt-8 space-y-10">
          {lesson.sections.map((section, i) => (
            <section key={section.id} id={section.id} className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold tracking-tight">
                <span className="mr-2 text-accent-500">{i + 1}.</span>
                {section.title}
              </h2>
              {section.blocks.map((block, j) => (
                <BlockView key={j} block={block} />
              ))}
            </section>
          ))}
        </div>

        {/* Try it + links */}
        {(relatedScenarios.length > 0 || lesson.links.length > 0) && (
          <Card className="mt-10 p-6">
            <h3 className="flex items-center gap-2 font-bold">
              <Icon name="terminal" className="h-5 w-5 text-accent-500" /> Practice & next steps
            </h3>
            {relatedScenarios.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {relatedScenarios.map((s) => (
                  <LinkButton key={s.id} to={`/sandbox/${s.id}`} variant="secondary">
                    <Icon name="play" className="h-4 w-4" /> Sandbox: {s.title}
                  </LinkButton>
                ))}
              </div>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-2">
              {lesson.links.map((link) =>
                'to' in link ? (
                  <Link key={link.label} to={link.to} className="inline-flex items-center gap-1 text-sm font-medium text-accent-500 hover:underline">
                    {link.label} <Icon name="arrowRight" className="h-4 w-4" />
                  </Link>
                ) : null,
              )}
            </div>
          </Card>
        )}

        {/* Prev / next + complete */}
        <div className="mt-10 flex flex-col gap-4 border-t border-zinc-200 pt-6 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            {prev ? (
              <LinkButton to={`/lesson/${prev.id}`} variant="secondary">
                <Icon name="chevron" className="h-4 w-4 rotate-180" /> {prev.title}
              </LinkButton>
            ) : null}
            {next ? (
              <LinkButton to={`/lesson/${next.id}`} variant="secondary">
                {next.title} <Icon name="chevron" className="h-4 w-4" />
              </LinkButton>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => {
              if (!isComplete) progress.completeLesson(lesson.id)
            }}
            className={cx(
              'inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all',
              isComplete
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
                : 'bg-accent-600 text-white shadow-lg shadow-accent-600/25 hover:bg-accent-500',
            )}
          >
            <Icon name={isComplete ? 'check' : 'award'} className="h-4 w-4" />
            {isComplete ? 'Lesson completed' : 'Mark as complete'}
          </button>
        </div>
      </article>
    </div>
  )
}
