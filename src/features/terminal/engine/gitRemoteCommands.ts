// Simulated git: merge, reset, revert, stash, remote, push, pull, fetch, clone.

import type { EngineState, GitRepo } from './gitState'
import type { CmdContext, CmdResult, OutLine } from './commands'
import { absOfRel, shortHash } from './commands'
import { writeFile, removeNode, nameOf } from './fs'
import { headTreeOf, relWorktree, worktreeChanges } from './gitCommands'

function out(text: string): OutLine {
  return { kind: 'out', text }
}

function err(text: string): OutLine {
  return { kind: 'err', text }
}

function cmdMerge(ctx: CmdContext): CmdResult {
  const repo = ctx.state.repo
  if (!repo) return { lines: [err('fatal: not a git repository')], state: ctx.state }
  const name = ctx.positional[0]
  if (!name) return { lines: [err('fatal: missing branch to merge')], state: ctx.state }
  const other = repo.branches[name]
  if (!other) return { lines: [err(`merge: ${name} - not something we can merge`)], state: ctx.state }
  const cur = repo.currentBranch
  if (!cur || !repo.branches[cur]) return { lines: [err('fatal: no current branch')], state: ctx.state }
  if (name === cur) return { lines: [out('Already up to date.')], state: ctx.state }

  const curHead = repo.branches[cur].head
  const otherHead = other.head
  if (curHead && isAncestor(repo, otherHead, curHead)) {
    return { lines: [out('Already up to date.')], state: ctx.state }
  }
  // Fast-forward: current branch has no commits the other lacks.
  if (!curHead || isAncestor(repo, curHead, otherHead)) {
    applyTree(ctx.state, repo.commits[otherHead]?.tree ?? {})
    repo.branches[cur].head = otherHead
    repo.index = { ...(repo.commits[otherHead]?.tree ?? {}) }
    return {
      lines: [out(`Updating ${shortHash(curHead ?? '')}..${shortHash(otherHead)}`), out('Fast-forward')],
      state: ctx.state,
    }
  }

  // Three-way merge with conflict detection per file.
  const base = mergeBase(repo, curHead, otherHead)
  const baseTree = base ? repo.commits[base]?.tree ?? {} : {}
  const curTree = repo.commits[curHead]?.tree ?? {}
  const otherTree = repo.commits[otherHead]?.tree ?? {}
  const all = new Set([...Object.keys(baseTree), ...Object.keys(curTree), ...Object.keys(otherTree)])
  const conflicts: string[] = []
  const merged: Record<string, string> = { ...curTree }
  for (const rel of all) {
    const b = baseTree[rel]
    const c = curTree[rel]
    const o = otherTree[rel]
    if (c === o) continue // same in both (includes both missing)
    if (b === c) merged[rel] = o ?? '' // only other changed
    else if (b === o) continue // only current changed
    else conflicts.push(rel) // both changed differently
  }
  if (conflicts.length > 0) {
    repo.mergeState = { branch: name, base: base ?? '' }
    for (const rel of conflicts) {
      const ours = curTree[rel] ?? ''
      const theirs = otherTree[rel] ?? ''
      const conflicted = `<<<<<<< HEAD\n${ours}\n=======\n${theirs}\n>>>>>>> ${name}\n`
      merged[rel] = conflicted
      writeFile(ctx.state.vfs, absOfRel(rel), conflicted)
      repo.index[rel] = conflicted
    }
    return {
      lines: [
        err('Auto-merging failed. Fix conflicts and then commit the result.'),
        ...conflicts.map((c) => err(`CONFLICT (content): Merge conflict in ${c}`)),
        err(`Automatic merge failed; fix conflicts and then commit the result.`),
      ],
      state: ctx.state,
    }
  }
  // Clean merge: stage the merge result, create merge commit.
  repo.index = { ...merged }
  for (const rel of Object.keys(merged)) writeFile(ctx.state.vfs, absOfRel(rel), merged[rel])
  const id = makeCommitIn(repo, `Merge branch '${name}' into ${cur}`)
  return {
    lines: [
      out(`Merge made by the 'ort' strategy.`),
      out(`[${cur} ${shortHash(id)}] Merge branch '${name}' into ${cur}`),
    ],
    state: ctx.state,
  }
}

function isAncestor(repo: GitRepo, maybeAncestor: string | undefined, of: string | undefined): boolean {
  if (!maybeAncestor || !of) return false
  let cur: string | undefined = of
  while (cur) {
    if (cur === maybeAncestor) return true
    cur = repo.commits[cur]?.parents[0]
  }
  return false
}

function mergeBase(repo: GitRepo, a: string, b: string): string | null {
  const ancestorsOfA = new Set<string>()
  let cur: string | undefined = a
  while (cur) {
    ancestorsOfA.add(cur)
    cur = repo.commits[cur]?.parents[0]
  }
  cur = b
  while (cur) {
    if (ancestorsOfA.has(cur)) return cur
    cur = repo.commits[cur]?.parents[0]
  }
  return null
}

function applyTree(state: EngineState, tree: Record<string, string>): void {
  const work = relWorktree(state.vfs)
  for (const rel of Object.keys(work)) {
    if (!(rel in tree)) removeNode(state.vfs, absOfRel(rel))
  }
  for (const [rel, content] of Object.entries(tree)) writeFile(state.vfs, absOfRel(rel), content)
}

function makeCommitIn(repo: GitRepo, message: string): string {
  const id = `c${Object.keys(repo.commits).length + 1}${Math.random().toString(36).slice(2, 6)}`
  const headId = repo.currentBranch ? repo.branches[repo.currentBranch]?.head : repo.detachedHead
  const parents = headId && repo.commits[headId] ? [headId] : []
  if (repo.mergeState && repo.currentBranch) {
    const other = repo.branches[repo.mergeState.branch]
    if (other && !parents.includes(other.head)) parents.push(other.head)
  }
  repo.commits[id] = {
    id,
    message,
    parents,
    author: repo.config['user.name'] ?? 'you',
    timestamp: Date.now(),
    tree: { ...repo.index },
  }
  if (repo.currentBranch) {
    repo.branches[repo.currentBranch] = {
      name: repo.currentBranch,
      head: id,
      upstream: repo.branches[repo.currentBranch]?.upstream ?? null,
    }
  } else if (repo.detachedHead) {
    repo.detachedHead = id
  }
  repo.mergeState = null
  return id
}

function cmdReset(ctx: CmdContext): CmdResult {
  const repo = ctx.state.repo
  if (!repo) return { lines: [err('fatal: not a git repository')], state: ctx.state }
  const target = ctx.positional[0] ?? 'HEAD'
  const lines: OutLine[] = []
  let headId: string | undefined
  if (target === 'HEAD') {
    headId = repo.detachedHead ?? repo.branches[repo.currentBranch ?? '']?.head
  } else if (repo.branches[target]) {
    headId = repo.branches[target].head
  } else if (repo.commits[target]) {
    headId = target
  } else {
    // HEAD~n
    const m = /^(HEAD|@)(~(\d+))?$/.exec(target)
    if (m) {
      let cur: string | null = repo.detachedHead ?? repo.branches[repo.currentBranch ?? '']?.head ?? null
      const back = m[3] ? parseInt(m[3], 10) : 0
      for (let i = 0; i < back && cur; i++) cur = repo.commits[cur]?.parents[0] ?? null
      headId = cur ?? undefined
    }
    if (!headId) {
      // Maybe short hash prefix.
      const match = Object.keys(repo.commits).find((c) => c.startsWith(target))
      if (match) headId = match
    }
  }
  if (!headId) return { lines: [err(`fatal: ambiguous argument '${target}': unknown revision`)], state: ctx.state }

  const soft = ctx.flags.has('--soft')
  const hard = ctx.flags.has('--hard')
  if (repo.currentBranch) {
    repo.branches[repo.currentBranch] = {
      name: repo.currentBranch,
      head: headId,
      upstream: repo.branches[repo.currentBranch]?.upstream ?? null,
    }
  } else if (repo.detachedHead !== null) {
    repo.detachedHead = headId
  }
  if (soft) {
    // Keep index and worktree.
  } else if (hard) {
    const tree = repo.commits[headId]?.tree ?? {}
    repo.index = { ...tree }
    applyTree(ctx.state, tree)
  } else {
    repo.index = { ...(repo.commits[headId]?.tree ?? {}) }
  }
  lines.push(out(`HEAD is now at ${shortHash(headId)} ${(repo.commits[headId]?.message ?? '').split('\n')[0]}`))
  return { lines, state: ctx.state }
}

function cmdRevert(ctx: CmdContext): CmdResult {
  const repo = ctx.state.repo
  if (!repo) return { lines: [err('fatal: not a git repository')], state: ctx.state }
  const target = ctx.positional[0]
  if (!target) return { lines: [err('fatal: bad revision given')], state: ctx.state }
  let id: string | undefined = repo.commits[target] ? target : Object.keys(repo.commits).find((c) => c.startsWith(target))
  if (!id) {
    // e.g. "HEAD~1"
    const m = /^(HEAD)(~(\d+))?$/.exec(target)
    if (m) {
      let cur: string | undefined = repo.detachedHead ?? repo.branches[repo.currentBranch ?? '']?.head
      const back = m[3] ? parseInt(m[3], 10) : 0
      for (let i = 0; i < back && cur; i++) cur = repo.commits[cur]?.parents[0]
      id = cur
    }
  }
  if (!id || !repo.commits[id]) return { lines: [err(`fatal: bad revision '${target}'`)], state: ctx.state }
  const commit = repo.commits[id]
  const parentTree = commit.parents[0] ? repo.commits[commit.parents[0]].tree : {}
  repo.index = { ...parentTree }
  applyTree(ctx.state, parentTree)
  const newId = makeCommitIn(repo, `Revert "${commit.message.split('\n')[0]}"\n\nThis reverts commit ${id}.`)
  return {
    lines: [out(`[main ${shortHash(newId)}] Revert "${commit.message.split('\n')[0]}"`)],
    state: ctx.state,
  }
}

function cmdStash(ctx: CmdContext): CmdResult {
  const repo = ctx.state.repo
  if (!repo) return { lines: [err('fatal: not a git repository')], state: ctx.state }
  const sub = ctx.positional[0] ?? 'push'
  if (sub === 'push' || sub === 'save') {
    const changes = worktreeChanges(repo, ctx.state.vfs)
    if (changes.staged.length === 0 && changes.unstaged.length === 0 && changes.untracked.length === 0) {
      return { lines: [out('No local changes to save')], state: ctx.state }
    }
    const work = relWorktree(ctx.state.vfs)
    const tracked: Record<string, string> = {}
    for (const [rel, content] of Object.entries(work)) {
      if (rel in repo.index || rel in headTreeOf(repo)) tracked[rel] = content
    }
    repo.stashes.push({ label: `WIP on ${repo.currentBranch ?? 'HEAD'}`, tree: tracked })
    const headTree = headTreeOf(repo)
    repo.index = { ...headTree }
    applyTree(ctx.state, headTree)
    return { lines: [out(`Saved working directory and index state WIP on ${repo.currentBranch ?? 'HEAD'}`)], state: ctx.state }
  }
  if (sub === 'pop' || sub === 'apply') {
    const stash = repo.stashes.pop()
    if (!stash) return { lines: [err('No stash entries found.')], state: ctx.state }
    for (const [rel, content] of Object.entries(stash.tree)) writeFile(ctx.state.vfs, absOfRel(rel), content)
    for (const rel of Object.keys(stash.tree)) repo.index[rel] = stash.tree[rel]
    return { lines: [out(`${sub === 'pop' ? 'Dropped' : 'Applied'} refs/stash@{0}`)], state: ctx.state }
  }
  if (sub === 'list') {
    if (repo.stashes.length === 0) return { lines: [], state: ctx.state }
    return { lines: repo.stashes.map((s, i) => out(`stash@{${repo.stashes.length - 1 - i}}: ${s.label}`)), state: ctx.state }
  }
  return { lines: [err(`git stash: '${sub}' is not a stash command`)], state: ctx.state }
}

function cmdRemote(ctx: CmdContext): CmdResult {
  const repo: GitRepo | null = ctx.state.repo
  if (!repo) return { lines: [err('fatal: not a git repository')], state: ctx.state }
  const sub = ctx.positional[0]
  if (!sub) return { lines: Object.keys(repo.remotes).map((r) => out(r)), state: ctx.state }
  if (sub === 'add') {
    const remoteName = ctx.positional[1]
    const url = ctx.positional[2]
    if (!remoteName || !url) return { lines: [err('usage: git remote add <name> <url>')], state: ctx.state }
    repo.remotes[remoteName] = repo.remotes[remoteName] ?? {}
    return { lines: [], state: ctx.state }
  }
  if (sub === '-v') {
    const lines: OutLine[] = []
    for (const name of Object.keys(repo.remotes)) {
      lines.push(out(`${name}\tgithub.com:you/${name}.git (fetch)`))
      lines.push(out(`${name}\tgithub.com:you/${name}.git (push)`))
    }
    return { lines, state: ctx.state }
  }
  return { lines: [err(`Unknown subcommand: ${sub}`)], state: ctx.state }
}

// ─── Network: push / pull / fetch / clone ────────────────────────────────────

function remoteUrl(name: string): string {
  return `github.com:you/${name}.git`
}

function cmdPush(ctx: CmdContext): CmdResult {
  const repo = ctx.state.repo
  if (!repo) return { lines: [err('fatal: not a git repository')], state: ctx.state }
  const setUpstream = ctx.flags.has('-u') || ctx.flags.has('--set-upstream')
  let branchName: string | undefined
  let remoteName: string | undefined
  if (ctx.positional.length >= 2) {
    remoteName = ctx.positional[0]
    branchName = ctx.positional[1]?.split(':')[0]
  } else if (ctx.positional.length === 1) {
    if (repo.remotes[ctx.positional[0]] !== undefined) {
      remoteName = ctx.positional[0]
      branchName = repo.currentBranch ?? undefined
    } else {
      branchName = ctx.positional[0]?.split(':')[0]
    }
  } else {
    branchName = repo.currentBranch ?? undefined
  }
  if (!branchName || !repo.branches[branchName]) {
    return { lines: [err(`error: src refspec ${branchName ?? ''} does not match any`)], state: ctx.state }
  }
  const branch = repo.branches[branchName]
  let origin = remoteName ?? branch.upstream?.split('/')[0] ?? null
  if (!origin) {
    if (!setUpstream) {
      return {
        lines: [
          err(`fatal: The current branch ${branchName} has no upstream branch.`),
          err('To push the current branch and set the remote as upstream, use'),
          err(''),
          err(`    git push --set-upstream origin ${branchName}`),
          err(''),
        ],
        state: ctx.state,
      }
    }
    origin = 'origin'
  }
  if (!repo.remotes[origin]) repo.remotes[origin] = {}
  if (setUpstream) branch.upstream = `${origin}/${branchName}`
  const remoteBranches = repo.remotes[origin] ?? (repo.remotes[origin] = {})
  const remoteHead = remoteBranches[branchName]
  const localHead = branch.head
  if (remoteHead === localHead) {
    return { lines: [out('Everything up-to-date')], state: ctx.state }
  }
  if (remoteHead && !isAncestor(repo, remoteHead, localHead)) {
    return {
      lines: [
        out('To github.com:you/project.git'),
        err(` ! [rejected]        ${branchName} -> ${branchName} (fetch first)`),
        err('hint: Updates were rejected because the remote contains work that you do not'),
        err('hint: have locally. Integrate the remote changes (e.g. `git pull`) before pushing.'),
      ],
      state: ctx.state,
    }
  }
  remoteBranches[branchName] = localHead
  return {
    lines: [
      out(`Enumerating objects: ${Object.keys(repo.commits).length}, done.`),
      out(`Writing objects: 100% (${Object.keys(repo.commits).length}/${Object.keys(repo.commits).length}), done.`),
      out(`To ${remoteUrl('project')}`),
      remoteHead
        ? out(`   ${shortHash(remoteHead)}..${shortHash(localHead)}  ${branchName} -> ${branchName}`)
        : out(` * [new branch]      ${branchName} -> ${branchName}`),
      setUpstream ? out(`Branch '${branchName}' set up to track remote branch '${branch.upstream}'.`) : out(''),
    ].filter((l) => l.text !== ''),
    state: ctx.state,
  }
}

function cmdFetch(ctx: CmdContext): CmdResult {
  const repo = ctx.state.repo
  if (!repo) return { lines: [err('fatal: not a git repository')], state: ctx.state }
  if (Object.keys(repo.remotes).length === 0 || Object.keys(repo.remotes['origin'] ?? {}).length === 0) {
    return { lines: [], state: ctx.state }
  }
  return {
    lines: [
      out(`From ${remoteUrl('project')}`),
      out(` * [new ref]         origin/main -> origin/main`),
    ],
    state: ctx.state,
  }
}

function cmdPull(ctx: CmdContext): CmdResult {
  const repo = ctx.state.repo
  if (!repo) return { lines: [err('fatal: not a git repository')], state: ctx.state }
  const cur = repo.currentBranch
  if (!cur || !repo.branches[cur]) return { lines: [err('fatal: no current branch')], state: ctx.state }
  const upstream = repo.branches[cur].upstream
  const origin = upstream?.split('/')[0] ?? 'origin'
  const remoteBranch = upstream?.split('/')[1] ?? cur
  const remoteBranches = repo.remotes[origin]
  if (!remoteBranches || !(remoteBranch in remoteBranches)) {
    return { lines: [err(`fatal: couldn't find remote ref ${remoteBranch}`)], state: ctx.state }
  }
  const remoteHead = remoteBranches[remoteBranch]
  const localHead = repo.branches[cur].head
  if (remoteHead === localHead) return { lines: [out('Already up to date.')], state: ctx.state }
  if (isAncestor(repo, localHead, remoteHead)) {
    applyTree(ctx.state, repo.commits[remoteHead]?.tree ?? {})
    repo.branches[cur].head = remoteHead
    repo.index = { ...(repo.commits[remoteHead]?.tree ?? {}) }
    return {
      lines: [out(`Updating ${shortHash(localHead)}..${shortHash(remoteHead)}`), out('Fast-forward')],
      state: ctx.state,
    }
  }
  // Diverged: merge remote-tracking branch into current.
  const base = mergeBase(repo, localHead, remoteHead)
  const baseTree = base ? repo.commits[base]?.tree ?? {} : {}
  const curTree = repo.commits[localHead]?.tree ?? {}
  const otherTree = repo.commits[remoteHead]?.tree ?? {}
  const all = new Set([...Object.keys(baseTree), ...Object.keys(curTree), ...Object.keys(otherTree)])
  const conflicts: string[] = []
  const merged: Record<string, string> = { ...curTree }
  for (const rel of all) {
    const b = baseTree[rel]
    const c = curTree[rel]
    const o = otherTree[rel]
    if (c === o) continue
    if (b === c) merged[rel] = o ?? ''
    else if (b === o) continue
    else conflicts.push(rel)
  }
  if (conflicts.length > 0) {
    repo.mergeState = { branch: `${origin}/${remoteBranch}`, base: base ?? '' }
    for (const rel of conflicts) {
      const conflicted = `<<<<<<< HEAD\n${curTree[rel] ?? ''}\n=======\n${otherTree[rel] ?? ''}\n>>>>>>> ${origin}/${remoteBranch}\n`
      merged[rel] = conflicted
      writeFile(ctx.state.vfs, absOfRel(rel), conflicted)
      repo.index[rel] = conflicted
    }
    return {
      lines: [
        err('Auto-merging failed. Fix conflicts and then commit the result.'),
        ...conflicts.map((c) => err(`CONFLICT (content): Merge conflict in ${c}`)),
      ],
      state: ctx.state,
    }
  }
  repo.index = { ...merged }
  for (const [rel, content] of Object.entries(merged)) writeFile(ctx.state.vfs, absOfRel(rel), content)
  const id = makeCommitIn(repo, `Merge branch '${origin}/${remoteBranch}' into ${cur}`)
  return { lines: [out(`[${cur} ${shortHash(id)}] Merge branch '${origin}/${remoteBranch}' into ${cur}`)], state: ctx.state }
}

function cmdClone(ctx: CmdContext): CmdResult {
  const repo = ctx.state.repo
  const url = ctx.positional[0]
  if (!url) return { lines: [err('fatal: You must specify a repository to clone.')], state: ctx.state }
  const name = nameOf(url.replace(/\.git$/, ''))
  const lines = [
    out(`Cloning into '${name}'...`),
    out('remote: Enumerating objects: 12, done.'),
    out('remote: Counting objects: 100% (12/12), done.'),
    out('Receiving objects: 100% (12/12), done.'),
    out('Resolving deltas: 100% (4/4), done.'),
  ]
  if (repo && ctx.state.vfs.cwd.includes(name)) {
    return { lines, state: ctx.state }
  }
  return { lines, state: ctx.state }
}

export const gitRemoteCommands: Record<string, (ctx: CmdContext) => CmdResult> = {
  merge: cmdMerge,
  reset: cmdReset,
  revert: cmdRevert,
  stash: cmdStash,
  remote: cmdRemote,
  push: cmdPush,
  pull: cmdPull,
  fetch: cmdFetch,
  clone: cmdClone,
}
