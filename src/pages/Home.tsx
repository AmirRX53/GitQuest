import { useEffect, useState } from 'react'
import type { JSX } from 'react'
import { Link } from 'react-router-dom'
import { tracks } from '../data/tracks'
import { quizzes } from '../data/quizzes'
import { useProgress } from '../lib/progress'
import { trackProgress, overallProgress, nextLessonId } from '../lib/selectors'
import { Badge, Card, LinkButton, ProgressBar, ProgressRing, SectionTitle } from '../components/ui/primitives'
import { Stagger } from '../components/ui/Stagger'
import { Icon } from '../components/ui/Icon'
import { TerminalWindow } from '../components/ui/TerminalWindow'
import { cx, plural } from '../lib/utils'

const trackAccents: Record<string, { chip: string; bar: string }> = {
  violet: { chip: 'bg-violet-500/10 text-violet-500 dark:text-violet-300', bar: 'from-violet-500 to-violet-400' },
  amber: { chip: 'bg-amber-500/10 text-amber-500 dark:text-amber-300', bar: 'from-amber-500 to-amber-400' },
  blue: { chip: 'bg-blue-500/10 text-blue-500 dark:text-blue-300', bar: 'from-blue-500 to-blue-400' },
  rose: { chip: 'bg-rose-500/10 text-rose-500 dark:text-rose-300', bar: 'from-rose-500 to-rose-400' },
}

const trackIcons: Record<string, 'terminal' | 'branch' | 'github' | 'award'> = {
  shell: 'terminal',
  git: 'branch',
  github: 'github',
  habits: 'award',
}

const typedLines = [
  '$ git init',
  'Initialized empty Git repository',
  '$ git commit -m "feat: begin the quest"',
  ' 3 files changed, 1 adventure started',
  '$ git switch -c your/journey',
  'Switched to a new branch \'your/journey\'',
]

function useTypewriter(): number {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (count >= typedLines.length) return
    const t = window.setTimeout(() => setCount((c) => c + 1), count === 0 ? 400 : 900)
    return () => window.clearTimeout(t)
  }, [count])
  return count
}

export function HomePage(): JSX.Element {
  const progress = useProgress()
  const visible = useTypewriter()
  const overall = overallProgress(tracks, quizzes, progress)
  const next = nextLessonId(tracks, progress)
  const nextPath = next ? `/lesson/${next}` : null

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="relative grid items-center gap-10 lg:grid-cols-2">
        <div aria-hidden className="pointer-events-none absolute -left-12 -top-10 hidden h-[420px] w-[420px] rounded-full bg-accent-500/10 blur-[70px] dark:bg-accent-500/15 lg:block" />
        <div className="animate-fade-up relative">
          <Badge className="mb-4 shadow-sm shadow-accent-500/10">
            <Icon name="graduation" className="h-3.5 w-3.5" /> Free, interactive, beginner-friendly
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Learn <span className="text-accent-500 glow-text">Git</span>, <span className="text-accent-500 glow-text">Git Bash</span> &{' '}
            <span className="text-accent-500 glow-text">GitHub</span> by actually typing it.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
            Four guided tracks, a safe terminal sandbox where nothing can break, and quizzes that stick.
            No account, no setup — progress saves in your browser.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {nextPath ? (
              <LinkButton to={nextPath}>
                <Icon name="play" className="h-4 w-4" /> Resume learning
              </LinkButton>
            ) : (
              <LinkButton to="/tracks">
                <Icon name="play" className="h-4 w-4" /> Start learning
              </LinkButton>
            )}
            <LinkButton to="/sandbox" variant="secondary">
              <Icon name="terminal" className="h-4 w-4" /> Open the sandbox
            </LinkButton>
          </div>
        </div>
        <div className="animate-fade-up relative" style={{ animationDelay: '120ms' }}>
          <div aria-hidden className="pointer-events-none absolute -inset-3 -z-10 rounded-[22px] bg-gradient-to-br from-accent-500/20 via-violet-500/10 to-transparent blur-xl opacity-60 dark:opacity-80" />
          <TerminalWindow title="git-bash — the quest begins">
            <div className="space-y-1.5">
              {typedLines.slice(0, visible).map((line, i) => (
                <div key={i} className="font-mono text-sm">
                  {line.startsWith('$ ') ? (
                    <span>
                      <span className="text-emerald-400">~/quest </span>
                      <span className="text-zinc-500">$ </span>
                      <span className="text-zinc-100">{line.slice(2)}</span>
                    </span>
                  ) : (
                    <span className="text-zinc-400">{line}</span>
                  )}
                </div>
              ))}
              <span className="ml-1 inline-block h-4 w-2 animate-pulse-soft bg-accent-400 align-middle" />
            </div>
          </TerminalWindow>
        </div>
      </section>

      {/* Progress overview */}
      <section>
        <SectionTitle sub="Your journey so far — saved locally, no account needed.">Your progress</SectionTitle>
        <Card className="flex flex-col items-center gap-6 p-6 sm:flex-row">
          <ProgressRing value={overall} size={88} stroke={7} />
          <div className="min-w-0 flex-1">
            <p className="font-semibold">
              {overall >= 0.999 ? 'Quest complete — you legend.' : overall > 0 ? 'Keep the streak going.' : 'Every expert once ran git init.'}
            </p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {plural(progress.completedLessons.length, 'lesson')} completed ·{' '}
              {plural(Object.keys(progress.quizScores).length, 'quiz')} taken ·{' '}
              {plural(progress.milestones.length, 'scenario')} finished in the sandbox
            </p>
          </div>
          {nextPath ? (
            <LinkButton to={nextPath} variant="secondary">
              Next up: <span className="font-mono text-xs">{next}</span>
            </LinkButton>
          ) : null}
        </Card>
      </section>

      {/* Tracks */}
      <section>
        <SectionTitle sub="Work through them in order, or jump to what you need.">Learning tracks</SectionTitle>
        <Stagger className="grid gap-4 sm:grid-cols-2">
          {tracks.map((track) => {
            const p = trackProgress(track, progress)
            return (
              <Link key={track.id} to={`/track/${track.id}`} className="group">
                <Card className="relative h-full overflow-hidden p-6 transition-all group-hover:-translate-y-0.5 group-hover:border-accent-400/60 group-hover:shadow-lg group-hover:shadow-accent-500/10">
                  <div className={cx('absolute inset-x-0 top-0 h-1 bg-gradient-to-r shadow-sm', trackAccents[track.color]?.bar ?? 'from-accent-500 to-accent-400')} />
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span className={cx('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', trackAccents[track.color]?.chip ?? 'bg-accent-500/10 text-accent-500')}>
                        <Icon name={trackIcons[track.id] ?? 'book'} className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="text-lg font-bold">{track.title}</h3>
                        <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{track.tagline}</p>
                      </div>
                    </div>
                    <Icon name="chevron" className="h-5 w-5 shrink-0 text-zinc-400 transition-transform group-hover:translate-x-1" />
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <ProgressBar value={p} className="flex-1" fillClassName={trackAccents[track.color]?.bar ?? 'from-accent-500 to-accent-400'} />
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      {track.lessons.filter((l) => progress.completedLessons.includes(l.id)).length}/{track.lessons.length}
                    </span>
                  </div>
                </Card>
              </Link>
            )
          })}
        </Stagger>
      </section>

      {/* Features */}
      <section>
        <SectionTitle sub="More than lessons — tools you will keep using.">Inside GitQuest</SectionTitle>
        <Stagger className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: 'terminal' as const, title: 'Terminal sandbox', text: 'A simulated Git Bash that runs real command logic. Six guided missions from first commit to conflict resolution — reset any time.', to: '/sandbox' },
            { icon: 'clipboard' as const, title: 'Cheat sheet', text: 'Every command from the tracks, searchable and grouped, each with a copyable example.', to: '/cheatsheet' },
            { icon: 'quiz' as const, title: 'Quizzes', text: 'Short checks per track — spot the bug, pick the right undo, order the GitHub Flow.', to: '/quizzes' },
          ].map((f) => (
            <Link key={f.title} to={f.to} className="group">
              <Card className="h-full p-6 transition-all group-hover:border-accent-400/60 group-hover:shadow-lg group-hover:shadow-accent-500/10">
                <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent-500/10 text-accent-500 shadow-sm shadow-accent-500/10 group-hover:shadow-accent-500/20 group-hover:shadow-md transition-shadow">
                  <Icon name={f.icon} />
                </span>
                <h3 className="font-bold">{f.title}</h3>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{f.text}</p>
              </Card>
            </Link>
          ))}
        </Stagger>
      </section>
    </div>
  )
}
