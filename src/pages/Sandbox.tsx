import type { JSX } from 'react'
import { useParams } from 'react-router-dom'
import { scenarios } from '../data/scenarios'
import { TerminalApp } from '../features/terminal/TerminalApp'
import { useProgress } from '../lib/progress'
import { Link } from 'react-router-dom'
import { Badge, Card, LinkButton } from '../components/ui/primitives'
import { Icon } from '../components/ui/Icon'
import { Stagger } from '../components/ui/Stagger'
import { cx } from '../lib/utils'

const difficultyColor: Record<string, string> = {
  beginner: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
  intermediate: 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-300',
  advanced: 'border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-300',
}

export function SandboxPage(): JSX.Element {
  const { scenarioId } = useParams()
  const scenario = scenarios.find((s) => s.id === scenarioId) ?? null
  const progress = useProgress()

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Terminal sandbox</h1>
          <p className="mt-1 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
            A simulated shell running a real implementation of the commands — completely isolated from your machine.
            {scenario ? null : ' Pick a guided scenario, or explore freely.'}
          </p>
        </div>
        {scenario ? (
          <LinkButton to="/sandbox" variant="secondary">
            <Icon name="x" className="h-4 w-4" /> Exit scenario
          </LinkButton>
        ) : null}
      </div>

      {!scenario ? (
        <Stagger className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" step={55} maxDelay={440}>
          {scenarios.map((s) => {
            const done = progress.milestones.includes(s.id)
            return (
              <Link key={s.id} to={`/sandbox/${s.id}`} className="block">
                <Card className="h-full p-5 transition-all hover:-translate-y-0.5 hover:border-accent-400/60 hover:shadow-md">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{s.title}</p>
                    {done ? <Icon name="check" className="h-4 w-4 text-emerald-500" /> : null}
                  </div>
                  <p className="mt-1 text-xs font-normal text-zinc-500 dark:text-zinc-400">{s.summary}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={cx('rounded-full border px-2 py-0.5 text-[11px] font-medium', difficultyColor[s.difficulty])}>{s.difficulty}</span>
                    <span className="text-[11px] text-zinc-400">{s.minutes} min</span>
                  </div>
                </Card>
              </Link>
            )
          })}
        </Stagger>
      ) : (
        <div className="mb-6">
          <Badge className="mb-2">
            {scenario.title} · {scenario.difficulty}
          </Badge>
        </div>
      )}

      <TerminalApp
        key={scenario?.id ?? 'free'}
        scenario={scenario}
        onMilestone={(id) => {
          if (id) progress.addMilestone(id)
        }}
      />
    </div>
  )
}
