import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { ProgressActions, ProgressState } from '../types'
import { clamp } from './utils'

type Store = ProgressState & ProgressActions

export const useProgress = create<Store>()(
  persist(
    (set) => ({
      completedLessons: [],
      quizScores: {},
      milestones: [],
      dark: true,
      name: '',
      completeLesson: (id) =>
        set((s) =>
          s.completedLessons.includes(id)
            ? s
            : { completedLessons: [...s.completedLessons, id] },
        ),
      setQuizScore: (id, percent) =>
        set((s) => ({
          quizScores: {
            ...s.quizScores,
            [id]: Math.max(s.quizScores[id] ?? 0, clamp(Math.round(percent), 0, 100)),
          },
        })),
      addMilestone: (id) =>
        set((s) => (s.milestones.includes(id) ? s : { milestones: [...s.milestones, id] })),
      toggleDark: () => set((s) => ({ dark: !s.dark })),
      setName: (name) => set({ name }),
    }),
    { name: 'gitquest-progress-v1' },
  ),
)
