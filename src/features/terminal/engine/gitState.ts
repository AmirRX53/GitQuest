import type { Vfs } from './fs'
import { createVfsFromSpec } from './fs'

// ─── Data model ────────────────────────────────────────────────────────────────

export interface Commit {
  id: string
  message: string
  parents: string[]
  author: string
  timestamp: number
  /** Snapshot of tracked files at commit time (repo-root-relative path -> content). */
  tree: Record<string, string>
}

export interface Branch {
  name: string
  /** Commit id the branch points at. */
  head: string
  /** Upstream tracking branch name like "origin/main", or null. */
  upstream: string | null
}

export interface RemoteBranch {
  name: string
  head: string
}

export interface Tag {
  name: string
  commit: string
}

export interface GitRepo {
  /** Commit id -> commit. */
  commits: Record<string, Commit>
  branches: Record<string, Branch>
  /** Detached HEAD commit id when no branch is checked out. */
  detachedHead: string | null
  currentBranch: string | null
  /** Staged snapshot (absolute path -> content). */
  index: Record<string, string>
  tags: Record<string, Tag>
  /** remote name -> (branch name -> head commit id). */
  remotes: Record<string, Record<string, string>>
  /** Stashes: label + snapshot of tracked working files. */
  stashes: Array<{ label: string; tree: Record<string, string> }>
  /** Merge in progress: the branch being merged and the merge base. */
  mergeState: { branch: string; base: string } | null
  /** Simple config map: user.name, user.email, etc. */
  config: Record<string, string>
}

/** Full engine state: filesystem + repo. */
export interface EngineState {
  vfs: Vfs
  repo: GitRepo | null
}

// ─── Constructors ──────────────────────────────────────────────────────────────

export function emptyRepo(): GitRepo {
  return {
    commits: {},
    branches: {},
    detachedHead: null,
    currentBranch: null,
    index: {},
    tags: {},
    remotes: {},
    stashes: [],
    mergeState: null,
    config: {},
  }
}

export interface InitialSetup {
  /** JSON tree spec for the virtual filesystem. */
  tree: Record<string, string | Record<string, never>>
  cwd: string
  /** Pre-configured remotes: name -> branch -> head commit id. */
  remotes?: Record<string, Record<string, string>>
  /** Commits, branches and HEAD to seed (repo starts initialized). */
  seed?: {
    commits: Array<{ id: string; message: string; parents: string[]; tree: Record<string, string> }>
    branches: Array<{ name: string; head: string; upstream?: string }>
    currentBranch: string
  }
}

export function createInitialState(setupJson: string): EngineState {
  const setup = JSON.parse(setupJson) as InitialSetup
  const vfs = createVfsFromSpec(setupJson)
  const state: EngineState = { vfs, repo: null }
  if (setup.seed) {
    const repo = emptyRepo()
    repo.config['user.name'] = 'you'
    repo.config['user.email'] = 'you@example.com'
    repo.currentBranch = setup.seed.currentBranch
    for (const c of setup.seed.commits) {
      repo.commits[c.id] = {
        id: c.id,
        message: c.message,
        parents: c.parents,
        author: 'you',
        timestamp: Date.now() - setup.seed.commits.length * 60_000,
        tree: c.tree,
      }
    }
    for (const b of setup.seed.branches) {
      repo.branches[b.name] = { name: b.name, head: b.head, upstream: b.upstream ?? null }
    }
    if (setup.remotes) repo.remotes = { ...setup.remotes }
    state.repo = repo
  }
  return state
}
