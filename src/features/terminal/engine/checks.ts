// Evaluate scenario-step checks against the engine state.

import type { Check } from '../../../types'
import type { EngineState } from './gitState'
import { worktreeChanges } from './gitCommands'
import { getDir, readFile } from './fs'

export interface CheckResult {
  passed: boolean
  label: string
}

export function evaluateCheck(check: Check, state: EngineState): CheckResult {
  const repo = state.repo
  const label = describeCheck(check)
  switch (check.kind) {
    case 'file-exists': {
      const content = readFile(state.vfs, `/${check.path}`)
      return { passed: content !== null, label }
    }
    case 'file-contains': {
      const content = readFile(state.vfs, `/${check.path}`)
      return { passed: content !== null && content.includes(check.text ?? ''), label }
    }
    case 'file-not-exists': {
      const content = readFile(state.vfs, `/${check.path}`)
      return { passed: content === null, label }
    }
    case 'dir-exists': {
      return { passed: getDir(state.vfs, `/${check.path}`) !== null, label }
    }
    case 'commit-count': {
      if (!repo) return { passed: false, label }
      const count = Object.keys(repo.commits).length
      return { passed: count >= (check.count ?? 1), label }
    }
    case 'branch-exists': {
      return { passed: repo?.branches[check.branch ?? ''] !== undefined, label }
    }
    case 'branch-checked-out': {
      return { passed: repo?.currentBranch === check.branch, label }
    }
    case 'branch-contains-commit': {
      if (!repo) return { passed: false, label }
      const branch = repo.branches[check.branch ?? '']
      if (!branch) return { passed: false, label }
      let cur: string | undefined = branch.head
      while (cur) {
        if (cur === check.name) return { passed: true, label }
        cur = repo.commits[cur]?.parents[0]
      }
      return { passed: false, label }
    }
    case 'branch-up-to-date-with': {
      if (!repo) return { passed: false, label }
      const b = repo.branches[check.branch ?? '']
      const r = repo.remotes['origin']?.[check.branch ?? '']
      return { passed: !!b && b.head === r, label }
    }
    case 'workdir-clean': {
      if (!repo) return { passed: false, label }
      const c = worktreeChangesSafe(repo, state)
      return { passed: c.staged.length === 0 && c.unstaged.length === 0 && c.untracked.length === 0, label }
    }
    case 'staged-count': {
      if (!repo) return { passed: (check.count ?? 1) <= 0, label }
      const c = worktreeChangesSafe(repo, state)
      return { passed: c.staged.length >= (check.count ?? 1), label }
    }
    case 'tag-exists': {
      return { passed: repo?.tags[check.name ?? ''] !== undefined, label }
    }
    case 'remote-set': {
      return { passed: (repo?.remotes['origin'] ?? null) !== null && Object.keys(repo?.remotes['origin'] ?? {}).length >= 0, label }
    }
    case 'branch-ahead-of': {
      if (!repo) return { passed: false, label }
      const b = repo.branches[check.branch ?? '']
      if (!b) return { passed: false, label }
      const remoteHead = repo.remotes['origin']?.[check.branch ?? '']
      return { passed: remoteHead !== undefined && b.head !== remoteHead && b.head !== '' && remoteHead !== '', label }
    }
    case 'commit-message-contains': {
      if (!repo) return { passed: false, label }
      const headId = repo.detachedHead ?? repo.branches[repo.currentBranch ?? '']?.head
      const msg = headId ? repo.commits[headId]?.message ?? '' : ''
      return { passed: msg.toLowerCase().includes((check.text ?? '').toLowerCase()), label }
    }
    case 'all-commits-conventional': {
      if (!repo) return { passed: false, label }
      const re = /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([^)]+\))?!?: .+/
      return {
        passed: Object.values(repo.commits).length > 0 && Object.values(repo.commits).every((c) => re.test(c.message.split('\n')[0])),
        label,
      }
    }
  }
  return { passed: false, label }
}

function worktreeChangesSafe(repo: NonNullable<EngineState['repo']>, state: EngineState) {
  return worktreeChanges(repo, state.vfs)
}

export function describeCheck(check: Check): string {
  switch (check.kind) {
    case 'file-exists':
      return `${check.path} exists`
    case 'file-contains':
      return `${check.path} contains “${check.text}”`
    case 'file-not-exists':
      return `${check.path} is gone`
    case 'dir-exists':
      return `folder ${check.path}/ exists`
    case 'commit-count':
      return `at least ${check.count ?? 1} commit(s) made`
    case 'branch-exists':
      return `branch '${check.branch}' exists`
    case 'branch-checked-out':
      return `branch '${check.branch}' is checked out`
    case 'branch-contains-commit':
      return `'${check.branch}' includes the commit`
    case 'branch-up-to-date-with':
      return `'${check.branch}' pushed up to date with origin`
    case 'workdir-clean':
      return 'working tree clean'
    case 'staged-count':
      return `at least ${check.count ?? 1} file(s) staged`
    case 'tag-exists':
      return `tag '${check.name}' exists`
    case 'remote-set':
      return 'remote origin configured'
    case 'branch-ahead-of':
      return `'${check.branch}' is ahead of origin`
    case 'commit-message-contains':
      return `latest commit message mentions “${check.text}”`
    case 'all-commits-conventional':
      return 'every commit follows Conventional Commits'
  }
}
