import type { JSX } from 'react'
import { Link, useParams } from 'react-router-dom'
import { findTrack, tracks } from '../data/tracks'
import { useProgress } from '../lib/progress'
import { trackProgress } from '../lib/selectors'
import { Badge, Card, ProgressBar, ProgressRing, SectionTitle } from '../components/ui/primitives'
import { Stagger } from '../components/ui/Stagger'
import { Icon } from '../components/ui/Icon'
import { cx, plural } from '../lib/utils'

export function TracksPage(): JSX.Element {
  const progress = useProgress()
  return (
    <div>
      <SectionTitle sub="Four tracks, in the order a new developer would need them.">Learning tracks</SectionTitle>
      <Stagger className="space-y-6" step={90}>
        {tracks.map((track, i) => {
          const p = trackProgress(track, progress)
          const done = track.lessons.filter((l) => progress.completedLessons.includes(l.id)).length
          return (
            <Link key={track.id} to={`/track/${track.id}`} className="block">
              <Card className="flex flex-col gap-4 p-6 transition-all hover:-translate-y-0.5 hover:border-accent-400/60 hover:shadow-lg sm:flex-row sm:items-center">
                <span className="text-3xl font-black text-zinc-200 dark:text-zinc-800">{String(i + 1).padStart(2, '0')}</span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-bold">{track.title}</h3>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{track.description}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <ProgressBar value={p} className="max-w-xs flex-1" />
                    <span className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400">
                      {done}/{track.lessons.length} lessons
                    </span>
                  </div>
                </div>
                <ProgressRing value={p} />
              </Card>
            </Link>
          )
        })}
      </Stagger>
    </div>
  )
}

export function TrackPage(): JSX.Element {
  const { trackId } = useParams()
  const progress = useProgress()
  const track = trackId ? findTrack(trackId) : undefined
  if (!track) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg font-semibold">Track not found.</p>
      </div>
    )
  }
  return (
    <div>
      <Link to="/tracks" className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-accent-500 dark:text-zinc-400">
        <Icon name="chevron" className="h-4 w-4 rotate-180" /> All tracks
      </Link>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge className="mb-2">{plural(track.lessons.length, 'lesson')}</Badge>
          <h1 className="text-3xl font-extrabold tracking-tight">{track.title}</h1>
          <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">{track.description}</p>
        </div>
        <ProgressRing value={trackProgress(track, progress)} size={72} stroke={6} />
      </div>
      <Stagger className="space-y-3" step={50} maxDelay={400}>
        {track.lessons.map((lesson, i) => {
          const complete = progress.completedLessons.includes(lesson.id)
          return (
            <Link key={lesson.id} to={`/lesson/${lesson.id}`} className="block">
              <Card className={cx('flex items-center gap-4 p-4 transition-all hover:border-accent-400/60 hover:shadow-md', complete && 'border-emerald-500/30 bg-emerald-500/5')}>
                <span
                  className={cx(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-bold',
                    complete ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-zinc-300 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400',
                  )}
                >
                  {complete ? <Icon name="check" className="h-4 w-4" /> : i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{lesson.title}</p>
                  <p className="truncate text-sm text-zinc-500 dark:text-zinc-400">{lesson.summary}</p>
                </div>
                <span className="hidden shrink-0 items-center gap-1 text-xs text-zinc-400 sm:flex">
                  <Icon name="clock" className="h-3.5 w-3.5" /> {lesson.minutes} min
                </span>
                <Icon name="chevron" className="h-5 w-5 shrink-0 text-zinc-400" />
              </Card>
            </Link>
          )
        })}
      </Stagger>
    </div>
  )
}
