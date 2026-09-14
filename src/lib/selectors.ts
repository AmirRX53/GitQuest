import type { Quiz, Track } from '../types'

interface ProgressSnapshot {
  completedLessons: string[]
  quizScores: Record<string, number>
  milestones: string[]
}

export function trackLessonCount(track: Track): number {
  return track.lessons.length
}

export function trackCompletedCount(track: Track, p: ProgressSnapshot): number {
  return track.lessons.filter((l) => p.completedLessons.includes(l.id)).length
}

/** 0..1 completion of a track's lessons. */
export function trackProgress(track: Track, p: ProgressSnapshot): number {
  return trackLessonCount(track) === 0 ? 0 : trackCompletedCount(track, p) / trackLessonCount(track)
}

export function quizPercent(quiz: Quiz, p: ProgressSnapshot): number {
  return p.quizScores[quiz.id] ?? 0
}

/** Overall progress across lessons (70%) and quizzes (30%). */
export function overallProgress(tracks: Track[], quizzes: Quiz[], p: ProgressSnapshot): number {
  const lessons = tracks.flatMap((t) => t.lessons)
  const lessonPart =
    lessons.length === 0
      ? 0
      : lessons.filter((l) => p.completedLessons.includes(l.id)).length / lessons.length
  const quizPart =
    quizzes.length === 0
      ? 0
      : quizzes.reduce((sum, q) => sum + quizPercent(q, p), 0) / (quizzes.length * 100)
  return lessonPart * 0.7 + quizPart * 0.3
}

export function nextLessonId(tracks: Track[], p: ProgressSnapshot): string | null {
  for (const track of tracks) {
    for (const lesson of track.lessons) {
      if (!p.completedLessons.includes(lesson.id)) return lesson.id
    }
  }
  return null
}
