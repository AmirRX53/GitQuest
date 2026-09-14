import type { Track } from '../../types'
import { shellTrack } from './shell'
import { gitTrack } from './git'
import { githubTrack } from './github'
import { habitsTrack } from './habits'

export const tracks: Track[] = [shellTrack, gitTrack, githubTrack, habitsTrack]

export function findTrack(trackId: string): Track | undefined {
  return tracks.find((t) => t.id === trackId)
}

export function findLesson(trackId: string, lessonId: string) {
  const track = findTrack(trackId)
  const lesson = track?.lessons.find((l) => l.id === lessonId)
  if (track && lesson) return { track, lesson }
  return null
}
