// ─── Prose & lesson content ────────────────────────────────────────────────────

/** One paragraph of lesson prose (joined with blank lines when rendered). */
export type ProseBlock = string

/** A fenced terminal demo: title, prompt context and pre-rendered output lines. */
export interface TerminalDemo {
  id: string
  title: string
  /** Prompt context, e.g. "~/projects/app (main)". Rendered before the "$". */
  prompt: string
  lines: TerminalLine[]
  /** Optional callout shown under the demo. */
  note?: string
}

/** Rendered inline code: `cmd`, or `out` for a printed output line. */
export interface TerminalLine {
  kind: 'cmd' | 'out'
  text: string
}

export type CalloutKind = 'tip' | 'warning' | 'best-practice' | 'info'

/** An admonition block (tip / warning / best practice / info). */
export interface CalloutBlock {
  kind: CalloutKind
  title: string
  body: string
}

/** A table of command comparisons, e.g. merge vs rebase. */
export interface TableBlock {
  headers: string[]
  rows: string[][]
  caption?: string
}

/** One stop in the GitHub Flow SVG diagram. */
export interface FlowStep {
  id: string
  label: string
  detail: string
}

/** An interactive GitHub Flow diagram block. */
export interface FlowDiagramBlock {
  kind: 'flow'
  steps: FlowStep[]
}

export type LessonBlock =
  | { kind: 'prose'; text: ProseBlock }
  | { kind: 'list'; ordered?: boolean; items: string[] }
  | { kind: 'heading'; text: string }
  | { kind: 'demo'; demo: TerminalDemo }
  | { kind: 'callout'; callout: CalloutBlock }
  | { kind: 'code'; lang: string; code: string; title?: string }
  | { kind: 'table'; table: TableBlock }
  | { kind: 'flow'; steps: FlowStep[] }

/** Where the lesson can send the learner next. */
export type LessonLink =
  | { to: string; label: string }
  | { sandbox: string; label: string }

export interface LessonSection {
  id: string
  title: string
  blocks: LessonBlock[]
}

export interface Lesson {
  id: string
  title: string
  minutes: number
  /** One-line summary shown on cards. */
  summary: string
  sections: LessonSection[]
  /** Sandbox scenario ids suggested for this lesson. */
  tryIt: string[]
  links: LessonLink[]
}

export interface Track {
  id: string
  title: string
  tagline: string
  description: string
  color: 'violet' | 'amber' | 'blue' | 'rose'
  lessons: Lesson[]
}

// ─── Sandbox / terminal ────────────────────────────────────────────────────────

/** A single condition the learner must satisfy; evaluated against the engine state. */
export interface Check {
  kind:
    | 'file-exists'
    | 'file-contains'
    | 'file-not-exists'
    | 'dir-exists'
    | 'commit-count'
    | 'branch-exists'
    | 'branch-checked-out'
    | 'branch-contains-commit'
    | 'branch-up-to-date-with'
    | 'workdir-clean'
    | 'staged-count'
    | 'tag-exists'
    | 'remote-set'
    | 'branch-ahead-of'
    | 'commit-message-contains'
    | 'all-commits-conventional'
  path?: string
  text?: string
  count?: number
  branch?: string
  name?: string
}

export interface StepHint {
  /** Shown as a nudge button label chip, e.g. "git add". */
  label: string
  text: string
}

export interface ScenarioStep {
  goal: string
  hints: StepHint[]
  checks: Check[]
  /** Command executed by "walk through" / listed in help panel. */
  sampleCommand: string
}

export interface Scenario {
  id: string
  title: string
  track: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  minutes: number
  summary: string
  /** Initial virtual filesystem + git state. */
  setup: string
  steps: ScenarioStep[]
}

// ─── Cheat sheet, glossary, quizzes ────────────────────────────────────────────

export interface CheatEntry {
  command: string
  description: string
  example?: string
  category: string
  tags?: string[]
}

export interface GlossaryTerm {
  term: string
  definition: string
  category: string
}

export interface QuizOption {
  label: string
  correct?: boolean
}

export interface QuizQuestion {
  id: string
  prompt: string
  /** Optional command shown in a small code chip above the prompt. */
  code?: string
  options: QuizOption[]
  explanation: string
}

export interface Quiz {
  id: string
  track: string
  title: string
  questions: QuizQuestion[]
}

// ─── Progress state ────────────────────────────────────────────────────────────

export interface ProgressState {
  completedLessons: string[]
  /** quizId -> best score in percent */
  quizScores: Record<string, number>
  milestones: string[]
  dark: boolean
  name: string
}

export interface ProgressActions {
  completeLesson: (id: string) => void
  setQuizScore: (id: string, percent: number) => void
  addMilestone: (id: string) => void
  toggleDark: () => void
  setName: (name: string) => void
}
