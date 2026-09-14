// Simulated git commands. Each returns output lines and may mutate engine state.

import type { Commit, GitRepo } from './gitState'
import { emptyRepo } from './gitState'
import type { OutLine, CmdResult, CmdContext } from './commands'
import { absOfRel, absPath, REPO_ROOT, repoRel, shortHash } from './commands'
import { getNode, getDir, writeFile, listDir, nameOf, type Vfs } from './fs'

function out(text: string): OutLine {
  return { kind: 'out', text }
}

function err(text: string): OutLine {
  return { kind: 'err', text }
}

/** Snapshot of all files under a directory as absolute path -> content. */
export function flattenWorktree(vfs: Vfs, dirPath = '/'): Record<string, string> {
  const files: Record<string, string> = {}
  const walk = (path: string): void => {
    for (const [name, node] of listDir(vfs, path)) {
      const full = path === '/' ? `/${name}` : `${path}/${name}`
      if (node.type === 'file') files[full] = node.content
      else walk(full)
    }
  }
  walk(dirPath)
  return files
}

/** Working tree as repo-relative path -> content (git-level view). */
export function relWorktree(vfs: Vfs, dirPath = REPO_ROOT): Record<string, string> {
  const abs = flattenWorktree(vfs, dirPath)
  const rel: Record<string, string> = {}
  for (const [p, content] of Object.entries(abs)) rel[repoRel(p)] = content
  return rel
}

export function headTreeOf(repo: GitRepo): Record<string, string> {
  if (!repo.currentBranch && !repo.detachedHead) return {}
  const headId = repo.detachedHead ?? repo.branches[repo.currentBranch ?? '']?.head
  if (!headId) return {}
  return repo.commits[headId]?.tree ?? {}
}

export function worktreeChanges(
  repo: GitRepo,
  vfs: Vfs,
): { staged: string[]; unstaged: string[]; untracked: string[] } {
  const headTree = headTreeOf(repo)
  const work = relWorktree(vfs)
  const staged: string[] = []
  const unstaged: string[] = []
  const untracked: string[] = []
  const all = new Set([...Object.keys(headTree), ...Object.keys(work), ...Object.keys(repo.index)])
  for (const path of all) {
    const inIndex = path in repo.index
    const inHead = path in headTree
    const indexVal = inIndex ? repo.index[path] : undefined
    const headVal = inHead ? headTree[path] : undefined
    const workVal = work[path]
    if (inIndex) {
      if (indexVal !== headVal) staged.push(path)
      if (workVal !== indexVal) unstaged.push(path)
    } else if (inHead || workVal !== undefined) {
      untracked.push(path)
    }
  }
  return { staged, unstaged, untracked }
}

function cmdInit(ctx: CmdContext): CmdResult {
  const { state } = ctx
  if (state.repo) {
    return { lines: [out('Reinitialized existing Git repository')], state }
  }
  const repo = emptyRepo()
  repo.config['user.name'] = ctx.username
  repo.config['user.email'] = `${ctx.username.toLowerCase().replace(/\s+/g, '.')}@example.com`
  repo.currentBranch = 'main'
  repo.branches = {}
  state.repo = repo
  return {
    lines: [out(`Initialized empty Git repository in ${state.vfs.cwd}/.git/`)],
    state,
  }
}

function cmdAdd(ctx: CmdContext): CmdResult {
  const repo = ctx.state.repo
  if (!repo) return { lines: [err('fatal: not a git repository (or any of the parent directories): .git')], state: ctx.state }
  if (ctx.positional.length === 0) {
    return { lines: [err("Nothing specified, nothing added. Maybe you wanted to say 'git add .'?")], state: ctx.state }
  }
  const spec = ctx.positional[0]
  const lines: OutLine[] = []

  if (spec === '.' || spec === '-A' || spec === '--all' || spec === '*') {
    const work = relWorktree(ctx.state.vfs, REPO_ROOT)
    for (const [rel, content] of Object.entries(work)) {
      repo.index[rel] = content
    }
    return { lines, state: ctx.state }
  }

  const abs = absPath(ctx, spec)
  if (!abs) return { lines: [err(`fatal: pathspec '${spec}' did not match any files`)], state: ctx.state }
  const node = getNode(ctx.state.vfs, abs)
  if (!node) {
    return { lines: [err(`fatal: pathspec '${spec}' did not match any files`)], state: ctx.state }
  }
  if (node.type === 'file') {
    repo.index[repoRel(abs)] = node.content
  } else {
    const sub = relWorktree(ctx.state.vfs, abs)
    for (const [p, content] of Object.entries(sub)) repo.index[p] = content
  }
  return { lines, state: ctx.state }
}

function cmdRestore(ctx: CmdContext): CmdResult {
  const repo = ctx.state.repo
  if (!repo) return { lines: [err('fatal: not a git repository')], state: ctx.state }
  const spec = ctx.positional[0]
  if (!spec) return { lines: [err('fatal: you must specify path(s) to restore')], state: ctx.state }
  const abs = absPath(ctx, spec)
  if (!abs) return { lines: [err(`error: pathspec '${spec}' did not match any file(s) known to git`)], state: ctx.state }
  const rel = repoRel(abs)
  const headTree = headTreeOf(repo)
  if (!(rel in headTree) && !(rel in repo.index)) {
    return { lines: [err(`error: pathspec '${spec}' did not match any file(s) known to git`)], state: ctx.state }
  }
  const source = ctx.flags.has('--staged') ? headTree : rel in repo.index ? repo.index : headTree
  const content = source[rel]
  if (content === undefined) {
    // File was deleted; restore from HEAD removes it from disk.
    return { lines: [], state: ctx.state }
  }
  const writeErr = writeFile(ctx.state.vfs, abs, content)
  if (writeErr) return { lines: [err(writeErr)], state: ctx.state }
  if (ctx.flags.has('--staged')) {
    const headVal = headTree[rel]
    if (headVal === undefined) delete repo.index[rel]
    else repo.index[rel] = headVal
  }
  return { lines: [], state: ctx.state }
}

function makeCommit(repo: GitRepo, message: string, author: string): string {
  const id = `c${Object.keys(repo.commits).length + 1}${Math.random().toString(36).slice(2, 6)}`
  const commit = {
    id,
    message,
    parents: [] as string[],
    author,
    timestamp: Date.now(),
    tree: { ...repo.index },
  }
  const headId = repo.currentBranch
    ? repo.branches[repo.currentBranch]?.head
    : repo.detachedHead
  if (headId && repo.commits[headId]) commit.parents = [headId]
  if (repo.mergeState && repo.currentBranch) {
    const other = repo.branches[repo.mergeState.branch]
    if (other) commit.parents = [...commit.parents, other.head]
  }
  repo.commits[id] = commit
  if (repo.currentBranch) repo.branches[repo.currentBranch] = { name: repo.currentBranch, head: id, upstream: repo.branches[repo.currentBranch]?.upstream ?? null }
  else if (repo.detachedHead) repo.detachedHead = id
  repo.mergeState = null
  return id
}

function cmdCommit(ctx: CmdContext): CmdResult {
  const repo = ctx.state.repo
  if (!repo) return { lines: [err('fatal: not a git repository')], state: ctx.state }

  if (ctx.flags.has('--amend')) {
    const headId = repo.currentBranch ? repo.branches[repo.currentBranch]?.head : repo.detachedHead
    if (headId && repo.commits[headId]) {
      const msgIdx = ctx.args.indexOf('-m')
      if (msgIdx >= 0 && ctx.args[msgIdx + 1]) repo.commits[headId].message = ctx.args[msgIdx + 1]
      return { lines: [out(`[main ${shortHash(headId)}] ${repo.commits[headId].message.split('\n')[0]}`)], state: ctx.state }
    }
  }

  const msgIdx = ctx.args.indexOf('-m')
  const message = msgIdx >= 0 ? ctx.args[msgIdx + 1] : ''
  if (!message) {
    return {
      lines: [
        err('Aborting commit due to empty commit message.'),
        err('hint: Use `git commit -m "your message"` to commit with a message.'),
      ],
      state: ctx.state,
    }
  }

  const headTree = headTreeOf(repo)
  if (Object.keys(repo.index).length === 0 && Object.keys(headTree).length === 0) {
    return { lines: [out('nothing to commit, working tree clean')], state: ctx.state }
  }
  const changes = worktreeChanges(repo, ctx.state.vfs)
  const hasStagedChanges = changes.staged.length > 0 || Object.keys(repo.index).length !== Object.keys(headTree).length
  if (!hasStagedChanges && changes.unstaged.length === 0 && changes.untracked.length === 0) {
    return { lines: [out('nothing to commit, working tree clean')], state: ctx.state }
  }
  if (!hasStagedChanges) {
    return {
      lines: [
        out('On branch ' + (repo.currentBranch ?? 'HEAD detached')),
        out('nothing to commit, working tree clean'),
        err('hint: stage files first with `git add <file>`'),
      ],
      state: ctx.state,
    }
  }

  const author = repo.config['user.name'] ?? ctx.username
  const id = makeCommit(repo, message, author)
  const firstLine = message.split('\n')[0]
  return {
    lines: [
      out(`[${repo.currentBranch ?? 'detached HEAD'} ${shortHash(id)}] ${firstLine}`),
      out(` ${Object.keys(repo.index).length} file(s) committed`),
    ],
    state: ctx.state,
  }
}

function cmdStatus(ctx: CmdContext): CmdResult {
  const repo = ctx.state.repo
  if (!repo) return { lines: [err('fatal: not a git repository (or any of the parent directories): .git')], state: ctx.state }
  const branch = repo.currentBranch ?? `HEAD detached at ${shortHash(repo.detachedHead ?? '')}`
  const lines: OutLine[] = [out(`On branch ${branch}`)]
  const changes = worktreeChanges(repo, ctx.state.vfs)
  if (changes.staged.length === 0 && changes.unstaged.length === 0 && changes.untracked.length === 0) {
    lines.push(out('nothing to commit, working tree clean'))
    return { lines, state: ctx.state }
  }
  if (changes.staged.length > 0) {
    lines.push(out('Changes to be committed:'))
    for (const p of changes.staged) lines.push(out(`        modified:   ${p}`))
  }
  if (changes.unstaged.length > 0) {
    lines.push(out('Changes not staged for commit:'))
    for (const p of changes.unstaged) lines.push(out(`        modified:   ${p}`))
  }
  if (changes.untracked.length > 0) {
    lines.push(out('Untracked files:'))
    for (const p of changes.untracked) lines.push(out(`        ${p}`))
  }
  return { lines, state: ctx.state }
}

function cmdLog(ctx: CmdContext): CmdResult {
  const repo = ctx.state.repo
  if (!repo) return { lines: [err('fatal: not a git repository')], state: ctx.state }
  const headId = repo.detachedHead ?? repo.branches[repo.currentBranch ?? '']?.head
  if (!headId || !repo.commits[headId]) {
    return { lines: [err('fatal: your current branch \'main\' does not have any commits yet')], state: ctx.state }
  }
  if (ctx.flags.has('--oneline')) {
    const lines: OutLine[] = []
    let cur: string | null = headId
    while (cur && repo.commits[cur]) {
      const c: Commit = repo.commits[cur]!
      lines.push(out(`${shortHash(c.id)} ${c.message.split('\n')[0]}`))
      cur = c.parents[0] ?? null
    }
    return { lines, state: ctx.state }
  }
  const lines: OutLine[] = []
  let cur: string | null = headId
  while (cur && repo.commits[cur]) {
    const c: Commit = repo.commits[cur]!
    lines.push(out(`commit ${c.id}${c.parents.length > 1 ? ' (merge)' : ''}`))
    lines.push(out(`Author: ${c.author}`))
    lines.push(out(`Date:   ${new Date(c.timestamp).toDateString()}`))
    lines.push(out(''))
    for (const l of c.message.split('\n')) lines.push(out(`    ${l}`))
    lines.push(out(''))
    cur = c.parents[0] ?? null
  }
  return { lines, state: ctx.state }
}

function cmdDiff(ctx: CmdContext): CmdResult {
  const repo = ctx.state.repo
  if (!repo) return { lines: [err('fatal: not a git repository')], state: ctx.state }
  const lines: OutLine[] = []
  const work = relWorktree(ctx.state.vfs)
  const headTree = headTreeOf(repo)
  const showDiff = (rel: string, before: string | undefined, after: string | undefined): void => {
    lines.push(out(`diff --git a/${rel} b/${rel}`))
    if (before === undefined) lines.push(out('new file'))
    if (after === undefined) lines.push(out('deleted file'))
    lines.push(out(`--- a/${rel}`))
    lines.push(out(`+++ b/${rel}`))
    const beforeLines = (before ?? '').split('\n')
    const afterLines = (after ?? '').split('\n')
    for (const l of beforeLines) if (!afterLines.includes(l)) lines.push({ kind: 'err', text: `-${l}` })
    for (const l of afterLines) if (!beforeLines.includes(l)) lines.push({ kind: 'out', text: `+${l}` })
  }
  const targets = ctx.positional.length > 0 ? ctx.positional.map((p) => repoRel(absPath(ctx, p) ?? '')) : Object.keys({ ...headTree, ...repo.index, ...work })
  for (const rel of targets) {
    const inIndex = rel in repo.index
    const headVal = headTree[rel]
    const indexVal = inIndex ? repo.index[rel] : undefined
    const workVal = work[rel]
    if (ctx.flags.has('--staged') || ctx.flags.has('--cached')) {
      if (indexVal !== headVal) showDiff(rel, headVal, indexVal)
    } else if (workVal !== indexVal) {
      showDiff(rel, indexVal ?? headVal, workVal)
    }
  }
  if (lines.length === 0) lines.push(out('(no changes)'))
  return { lines, state: ctx.state }
}

function cmdBranch(ctx: CmdContext): CmdResult {
  const repo = ctx.state.repo
  if (!repo) return { lines: [err('fatal: not a git repository')], state: ctx.state }
  const name = ctx.positional[0]
  if (!name) {
    const lines: OutLine[] = []
    for (const b of Object.values(repo.branches)) {
      lines.push(out(`${b.name === repo.currentBranch ? '* ' : '  '}${b.name}`))
    }
    if (lines.length === 0) lines.push(err('fatal: not a git repository (or any of the parent directories): .git'))
    return { lines, state: ctx.state }
  }
  if (!repo.currentBranch || !repo.branches[repo.currentBranch]) {
    return { lines: [err("fatal: not a valid object name: 'main'")], state: ctx.state }
  }
  const head = repo.branches[repo.currentBranch].head
  if (repo.branches[name]) return { lines: [err(`fatal: a branch named '${name}' already exists`)], state: ctx.state }
  repo.branches[name] = { name, head, upstream: null }
  return { lines: [], state: ctx.state }
}

function switchTo(repo: GitRepo, vfs: Vfs, target: string): string | null {
  const branch = repo.branches[target]
  if (!branch) return `error: pathspec '${target}' did not match any file(s) known to git`
  const targetTree = branch.head && repo.commits[branch.head] ? repo.commits[branch.head]!.tree : {}
  const headTree = headTreeOf(repo)
  // Remove files tracked by HEAD that the target branch does not have.
  for (const rel of Object.keys({ ...headTree, ...repo.index })) {
    if (!(rel in targetTree)) {
      const abs = absOfRel(rel)
      const node = getNode(vfs, abs)
      if (node) removeNodeFromVfs(vfs, abs)
    }
  }
  // Write/overwrite target branch files.
  for (const [rel, content] of Object.entries(targetTree)) {
    writeFile(vfs, absOfRel(rel), content)
  }
  repo.currentBranch = target
  repo.detachedHead = null
  repo.index = { ...targetTree }
  return null
}

function removeNodeFromVfs(vfs: Vfs, abs: string): void {
  const parentPath = abs.slice(0, abs.lastIndexOf('/')) || '/'
  const parent = getDir(vfs, parentPath)
  if (parent) parent.children.delete(nameOf(abs))
}

function cmdSwitch(ctx: CmdContext): CmdResult {
  const repo = ctx.state.repo
  if (!repo) return { lines: [err('fatal: not a git repository')], state: ctx.state }
  let name = ctx.positional[0]
  if (ctx.flags.has('-c')) {
    const newName = ctx.args[ctx.args.indexOf('-c') + 1]
    if (!newName) return { lines: [err('fatal: missing branch name')], state: ctx.state }
    if (repo.branches[newName]) return { lines: [err(`fatal: a branch named '${newName}' already exists`)], state: ctx.state }
    const cur = repo.currentBranch
    if (!cur || !repo.branches[cur]) return { lines: [err('fatal: not a valid object name')], state: ctx.state }
    repo.branches[newName] = { name: newName, head: repo.branches[cur].head, upstream: null }
    name = newName
  }
  if (!name) return { lines: [err('fatal: missing branch or commit to switch to')], state: ctx.state }
  if (repo.mergeState) return { lines: [err('error: you need to resolve your current index first')], state: ctx.state }
  const error = switchTo(repo, ctx.state.vfs, name)
  if (error) return { lines: [err(error)], state: ctx.state }
  return { lines: [out(`Switched to branch '${name}'`)], state: ctx.state }
}

function cmdCheckout(ctx: CmdContext): CmdResult {
  const repo = ctx.state.repo
  if (!repo) return { lines: [err('fatal: not a git repository')], state: ctx.state }
  const name = ctx.positional[0]
  if (!name) return { lines: [err('fatal: missing branch or path to checkout')], state: ctx.state }
  if (repo.branches[name]) {
    if (name === repo.currentBranch) return { lines: [out(`Already on '${name}'`)], state: ctx.state }
    const error = switchTo(repo, ctx.state.vfs, name)
    if (error) return { lines: [err(error)], state: ctx.state }
    return { lines: [out(`Switched to branch '${name}'`)], state: ctx.state }
  }
  return { lines: [err(`error: pathspec '${name}' did not match any file(s) known to git`)], state: ctx.state }
}

function cmdTag(ctx: CmdContext): CmdResult {
  const repo = ctx.state.repo
  if (!repo) return { lines: [err('fatal: not a git repository')], state: ctx.state }
  const name = ctx.positional[0]
  if (!name) {
    return { lines: Object.keys(repo.tags).map((t) => out(t)), state: ctx.state }
  }
  const headId = repo.detachedHead ?? repo.branches[repo.currentBranch ?? '']?.head
  if (!headId) return { lines: [err('fatal: failed to resolve \'HEAD\' as a valid ref')], state: ctx.state }
  repo.tags[name] = { name, commit: headId }
  return { lines: [], state: ctx.state }
}

function cmdReflog(ctx: CmdContext): CmdResult {
  const repo = ctx.state.repo
  if (!repo) return { lines: [err('fatal: not a git repository')], state: ctx.state }
  const headId = repo.detachedHead ?? repo.branches[repo.currentBranch ?? '']?.head
  if (!headId) return { lines: [err('fatal: your current branch does not have any commits yet')], state: ctx.state }
  const lines: OutLine[] = []
  let cur: string | null = headId
  let n = 0
  while (cur && repo.commits[cur]) {
    const c: Commit = repo.commits[cur]!
    lines.push(out(`${shortHash(c.id)} HEAD@{${n}}: commit: ${c.message.split('\n')[0]}`))
    cur = c.parents[0] ?? null
    n++
  }
  return { lines, state: ctx.state }
}

export const gitCommands: Record<string, (ctx: CmdContext) => CmdResult> = {
  init: cmdInit,
  add: cmdAdd,
  restore: cmdRestore,
  commit: cmdCommit,
  status: cmdStatus,
  log: cmdLog,
  diff: cmdDiff,
  branch: cmdBranch,
  switch: cmdSwitch,
  checkout: cmdCheckout,
  tag: cmdTag,
  reflog: cmdReflog,
}
