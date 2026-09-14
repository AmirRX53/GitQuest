import { useState } from 'react'
import type { JSX } from 'react'
import { Link, useParams } from 'react-router-dom'
import { quizzes } from '../data/quizzes'
import { tracks } from '../data/tracks'
import { useProgress } from '../lib/progress'
import { Badge, Card, LinkButton, ProgressBar, ProgressRing, SectionTitle } from '../components/ui/primitives'
import { Stagger } from '../components/ui/Stagger'
import { Icon } from '../components/ui/Icon'
import { ICode } from '../components/ui/CodeBlock'
import { cx, plural } from '../lib/utils'

const trackTitles: Record<string, string> = Object.fromEntries(tracks.map((t) => [t.id, t.title]))

export function QuizzesPage(): JSX.Element {
  const progress = useProgress()
  return (
    <div>
      <SectionTitle sub="Short checks per track. Wrong answers explain themselves — scores save locally.">Quizzes</SectionTitle>
      <Stagger className="grid gap-4 sm:grid-cols-2">
        {quizzes.map((quiz) => {
          const best = progress.quizScores[quiz.id]
          return (
            <Link key={quiz.id} to={`/quiz/${quiz.id}`} className="block">
              <Card className="flex items-center gap-4 p-6 transition-all hover:border-accent-400/60 hover:shadow-md">
                <div className="min-w-0 flex-1">
                  <Badge className="mb-1.5">{trackTitles[quiz.track] ?? quiz.track}</Badge>
                  <h3 className="font-bold">{quiz.title}</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">{plural(quiz.questions.length, 'question')}</p>
                </div>
                {best !== undefined ? <ProgressRing value={best / 100} size={52} stroke={4} /> : <Icon name="chevron" className="h-5 w-5 text-zinc-400" />}
              </Card>
            </Link>
          )
        })}
      </Stagger>
    </div>
  )
}

export function QuizPage(): JSX.Element {
  const { quizId } = useParams()
  const quiz = quizzes.find((q) => q.id === quizId)
  const progress = useProgress()

  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [submitted, setSubmitted] = useState(false)

  if (!quiz) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg font-semibold">Quiz not found.</p>
        <LinkButton to="/quizzes" className="mt-4">All quizzes</LinkButton>
      </div>
    )
  }

  const answeredAll = Object.keys(answers).length === quiz.questions.length
  const correctCount = quiz.questions.filter((q) => {
    const chosen = answers[q.id]
    return chosen !== undefined && q.options[chosen]?.correct === true
  }).length
  const percent = Math.round((correctCount / quiz.questions.length) * 100)

  const submit = (): void => {
    setSubmitted(true)
    progress.setQuizScore(quiz.id, percent)
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/quizzes" className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-accent-500 dark:text-zinc-400">
        <Icon name="chevron" className="h-4 w-4 rotate-180" /> All quizzes
      </Link>
      <h1 className="text-3xl font-extrabold tracking-tight">{quiz.title}</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        {plural(quiz.questions.length, 'question')} · {trackTitles[quiz.track]}
      </p>

      {submitted ? (
        <Card className="mt-8 p-8 text-center">
          <ProgressRing value={percent / 100} size={96} stroke={8} label={`${percent}%`} />
          <p className="mt-4 text-xl font-bold">
            {percent === 100 ? 'Perfect score!' : percent >= 60 ? 'Solid work.' : 'Worth another pass.'}
          </p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {correctCount} of {quiz.questions.length} correct — review the explanations below, then retake any time.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                setAnswers({})
                setSubmitted(false)
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-accent-600 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-500"
            >
              <Icon name="refresh" className="h-4 w-4" /> Retake
            </button>
            <LinkButton to="/sandbox" variant="secondary">Practice in sandbox</LinkButton>
          </div>
        </Card>
      ) : null}

      <div className="mt-8 space-y-6">
        {quiz.questions.map((question, qi) => {
          const chosen = answers[question.id]
          return (
            <Card key={question.id} className="p-6">
              <p className="font-semibold">
                <span className="mr-2 text-accent-500">{qi + 1}.</span>
                {question.prompt}
              </p>
              {question.code ? (
                <pre className="mt-3 overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-50 p-3 font-mono text-xs dark:border-zinc-800 dark:bg-zinc-950">
                  {question.code}
                </pre>
              ) : null}
              <div className="mt-4 space-y-2">
                {question.options.map((option, oi) => {
                  const isChosen = chosen === oi
                  const showState = submitted
                  return (
                    <button
                      key={oi}
                      type="button"
                      disabled={submitted}
                      onClick={() => setAnswers((a) => ({ ...a, [question.id]: oi }))}
                      className={cx(
                        'flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all',
                        !showState && isChosen && 'border-accent-500 bg-accent-500/10',
                        !showState && !isChosen && 'border-zinc-200 hover:border-accent-400 dark:border-zinc-800',
                        showState && option.correct && 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
                        showState && isChosen && !option.correct && 'border-red-500 bg-red-500/10 text-red-700 dark:text-red-300',
                        showState && !isChosen && !option.correct && 'border-zinc-200 opacity-60 dark:border-zinc-800',
                      )}
                    >
                      <span
                        className={cx(
                          'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold',
                          isChosen ? 'border-accent-500 bg-accent-500 text-white' : 'border-zinc-300 text-zinc-400 dark:border-zinc-700',
                        )}
                      >
                        {String.fromCharCode(65 + oi)}
                      </span>
                      {option.label.startsWith('git ') || option.label.includes(' → ') ? <ICode>{option.label}</ICode> : option.label}
                      {showState && option.correct ? <Icon name="check" className="ml-auto h-4 w-4 text-emerald-500" /> : null}
                      {showState && isChosen && !option.correct ? <Icon name="x" className="ml-auto h-4 w-4 text-red-500" /> : null}
                    </button>
                  )
                })}
              </div>
              {submitted ? (
                <p className="mt-3 rounded-xl bg-zinc-50 p-3 text-sm text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
                  <strong className="text-zinc-800 dark:text-zinc-200">Why:</strong> {question.explanation}
                </p>
              ) : null}
            </Card>
          )
        })}
      </div>

      {!submitted ? (
        <div className="mt-8">
          <ProgressBar value={Object.keys(answers).length / quiz.questions.length} />
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {Object.keys(answers).length}/{quiz.questions.length} answered
            </p>
            <button
              type="button"
              disabled={!answeredAll}
              onClick={submit}
              className={cx(
                'inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all',
                answeredAll
                  ? 'bg-accent-600 text-white shadow-lg shadow-accent-600/25 hover:bg-accent-500'
                  : 'cursor-not-allowed bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600',
              )}
            >
              <Icon name="check" className="h-4 w-4" /> Submit answers
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {/* explanations are rendered inline above once submitted */}
        </div>
      )}
    </div>
  )
}
