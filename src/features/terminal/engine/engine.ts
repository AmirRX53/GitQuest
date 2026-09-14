// Engine entrypoint: dispatch a command line against engine state.

import type { EngineState } from './gitState'
import { createInitialState } from './gitState'
import type { CmdResult, OutLine } from './commands'
import { tokenize, splitArgs } from './commands'
import { gitCommands } from './gitCommands'
import { gitRemoteCommands } from './gitRemoteCommands'
import {
  resolvePath, getNode, getDir, listDir, readFile, writeFile, removeNode, copyNode, nameOf,
} from './fs'

export type { EngineState } from './gitState'
export type { OutLine, CmdResult } from './commands'

export const REPO_ROOT = '/project'

const allGitCommands: Record<string, (ctx: import('./commands').CmdContext) => CmdResult> = {
  ...gitCommands,
  ...gitRemoteCommands,
}

function mkCtx(state: EngineState, args: string[], flags: Set<string>, positional: string[], username: string) {
  return {
    state,
    cwd: state.vfs.cwd,
    args,
    flags,
    positional,
    username,
  }
}

function shellHelp(): OutLine[] {
  return [
    { kind: 'sys', text: 'Available commands:' },
    { kind: 'out', text: '  pwd, ls, cd, mkdir, touch, cat, echo, rm, cp, mv, grep, find, clear, help' },
    { kind: 'out', text: '  git init, status, add, commit, log, diff, branch, switch, checkout, tag' },
    { kind: 'out', text: '  git merge, restore, reset, revert, stash, remote, push, pull, fetch, clone, reflog' },
    { kind: 'sys', text: 'Tip: press Tab for completion, ↑/↓ for history.' },
  ]
}

function runShellCommand(cmd: string, ctx: { state: EngineState; args: string[]; flags: Set<string>; positional: string[]; username: string }): CmdResult {
  const { state } = ctx
  const lines: OutLine[] = []
  const vfs = state.vfs
  const abs = (t: string): string | null => resolvePath(vfs, t)

  switch (cmd) {
    case 'help':
      return { lines: shellHelp(), state }

    case 'clear':
      return { lines: [], state, clearRequested: true } as CmdResult & { clearRequested: boolean }

    case 'pwd':
      lines.push({ kind: 'out', text: vfs.cwd })
      return { lines, state }

    case 'ls': {
      const target = ctx.positional[0] ?? '.'
      const a = abs(target)
      if (!a) {
        lines.push({ kind: 'err', text: `ls: ${target}: No such file or directory` })
        return { lines, state }
      }
      const node = getNode(vfs, a)
      if (!node) {
        lines.push({ kind: 'err', text: `ls: ${target}: No such file or directory` })
        return { lines, state }
      }
      if (node.type === 'file') {
        lines.push({ kind: 'out', text: nameOf(a) })
        return { lines, state }
      }
      const entries = listDir(vfs, a)
      if (ctx.flags.has('-a')) {
        lines.push({ kind: 'out', text: ['.git', ...entries.filter(([n]) => n !== '.git').map(([n]) => n)].join('  ') })
      } else {
        // .git is invisible by default
        const visible = entries.filter(([n]) => n !== '.git')
        if (visible.length === 0) return { lines, state }
        lines.push({ kind: 'out', text: visible.map(([n, nd]) => (nd.type === 'dir' ? `${n}/` : n)).join('  ') })
      }
      return { lines, state }
    }

    case 'cd': {
      const target = ctx.positional[0] ?? '/'
      const a = abs(target)
      if (!a || getDir(vfs, a) === null) {
        lines.push({ kind: 'err', text: `bash: cd: ${target}: No such file or directory` })
        return { lines, state }
      }
      vfs.cwd = a
      return { lines, state }
    }

    case 'mkdir': {
      if (ctx.positional.length === 0) {
        lines.push({ kind: 'err', text: 'mkdir: missing operand' })
        return { lines, state }
      }
      for (const t of ctx.positional) {
        const a = abs(t)
        if (!a) {
          lines.push({ kind: 'err', text: `mkdir: cannot create directory '${t}': No such file or directory` })
          continue
        }
        if (getNode(vfs, a)) {
          lines.push({ kind: 'err', text: `mkdir: cannot create directory '${t}': File exists` })
          continue
        }
        const parent = getDir(vfs, a.slice(0, a.lastIndexOf('/')) || '/')
        if (!parent) {
          lines.push({ kind: 'err', text: `mkdir: cannot create directory '${t}': No such file or directory` })
          continue
        }
        parent.children.set(nameOf(a), { type: 'dir', children: new Map() })
      }
      return { lines, state }
    }

    case 'touch': {
      if (ctx.positional.length === 0) {
        lines.push({ kind: 'err', text: 'touch: missing file operand' })
        return { lines, state }
      }
      for (const t of ctx.positional) {
        const a = abs(t)
        if (!a) {
          lines.push({ kind: 'err', text: `touch: cannot touch '${t}': No such file or directory` })
          continue
        }
        if (getNode(vfs, a)) continue
        const e = writeFile(vfs, a, '')
        if (e) lines.push({ kind: 'err', text: `touch: ${t}: ${e}` })
      }
      return { lines, state }
    }

    case 'cat': {
      if (ctx.positional.length === 0) {
        lines.push({ kind: 'err', text: 'cat: missing file operand' })
        return { lines, state }
      }
      for (const t of ctx.positional) {
        const a = abs(t)
        const content = a ? readFile(vfs, a) : null
        if (content === null) {
          lines.push({ kind: 'err', text: `cat: ${t}: No such file or directory` })
        } else {
          const fileLines = content.split('\n')
          if (fileLines.length > 0 && fileLines[fileLines.length - 1] === '') fileLines.pop()
          for (const l of fileLines) lines.push({ kind: 'out', text: l })
        }
      }
      return { lines, state }
    }

    case 'echo': {
      lines.push({ kind: 'out', text: ctx.args.join(' ') })
      return { lines, state }
    }

    case 'rm': {
      if (ctx.positional.length === 0) {
        lines.push({ kind: 'err', text: 'rm: missing operand' })
        return { lines, state }
      }
      for (const t of ctx.positional) {
        const a = abs(t)
        if (!a || !getNode(vfs, a)) {
          lines.push({ kind: 'err', text: `rm: cannot remove '${t}': No such file or directory` })
          continue
        }
        const node = getNode(vfs, a)!
        if (node.type === 'dir' && !ctx.flags.has('-r') && !ctx.flags.has('-rf')) {
          lines.push({ kind: 'err', text: `rm: cannot remove '${t}': Is a directory` })
          continue
        }
        const e = removeNode(vfs, a)
        if (e) lines.push({ kind: 'err', text: `rm: ${t}: ${e}` })
      }
      return { lines, state }
    }

    case 'cp': {
      const [from, to] = ctx.positional
      if (!from || !to) {
        lines.push({ kind: 'err', text: 'cp: missing destination file operand' })
        return { lines, state }
      }
      const aFrom = abs(from)
      const aTo = abs(to)
      if (!aFrom || !getNode(vfs, aFrom)) {
        lines.push({ kind: 'err', text: `cp: cannot stat '${from}': No such file or directory` })
        return { lines, state }
      }
      if (!aTo) {
        lines.push({ kind: 'err', text: `cp: target '${to}' is invalid` })
        return { lines, state }
      }
      const toNode = getNode(vfs, aTo)
      const dest = toNode && toNode.type === 'dir' ? `${aTo}/${nameOf(aFrom)}` : aTo
      const e = copyNode(vfs, aFrom, dest)
      if (e) lines.push({ kind: 'err', text: `cp: ${e}` })
      return { lines, state }
    }

    case 'mv': {
      const [from, to] = ctx.positional
      if (!from || !to) {
        lines.push({ kind: 'err', text: 'mv: missing destination file operand' })
        return { lines, state }
      }
      const aFrom = abs(from)
      if (!aFrom || !getNode(vfs, aFrom)) {
        lines.push({ kind: 'err', text: `mv: cannot stat '${from}': No such file or directory` })
        return { lines, state }
      }
      const aTo = abs(to)
      if (!aTo) {
        lines.push({ kind: 'err', text: `mv: target '${to}' is invalid` })
        return { lines, state }
      }
      const toNode = getNode(vfs, aTo)
      const dest = toNode && toNode.type === 'dir' ? `${aTo}/${nameOf(aFrom)}` : aTo
      const e = copyNode(vfs, aFrom, dest)
      if (e) {
        lines.push({ kind: 'err', text: `mv: ${e}` })
        return { lines, state }
      }
      removeNode(vfs, aFrom)
      return { lines, state }
    }

    case 'grep': {
      const [pattern, file] = ctx.positional
      if (!pattern || !file) {
        lines.push({ kind: 'err', text: 'usage: grep PATTERN FILE' })
        return { lines, state }
      }
      const a = abs(file)
      const content = a ? readFile(vfs, a) : null
      if (content === null) {
        lines.push({ kind: 'err', text: `grep: ${file}: No such file or directory` })
        return { lines, state }
      }
      content.split('\n').forEach((l, i) => {
        if (l.includes(pattern)) lines.push({ kind: 'out', text: `${i + 1}:${l}` })
      })
      return { lines, state }
    }

    case 'find': {
      const dirTarget = ctx.positional[0] ?? '.'
      const a = abs(dirTarget)
      if (!a || !getDir(vfs, a)) {
        lines.push({ kind: 'err', text: `find: '${dirTarget}': No such file or directory` })
        return { lines, state }
      }
      const nameFilter = ctx.args.includes('-name') ? ctx.args[ctx.args.indexOf('-name') + 1] : null
      const walk = (path: string, prefix: string): void => {
        for (const [n, node] of listDir(vfs, path)) {
          if (n === '.git') continue
          const disp = prefix === '' ? n : `${prefix}/${n}`
          if (!nameFilter || disp.includes(nameFilter.split('*').join(''))) {
            lines.push({ kind: 'out', text: `./${disp}` })
          }
          if (node.type === 'dir') walk(`${path}/${n}`, disp)
        }
      }
      walk(a, '')
      return { lines, state }
    }

    default:
      lines.push({ kind: 'err', text: `bash: ${cmd}: command not found` })
      return { lines, state }
  }
}

export interface RunOutcome extends CmdResult {
  clearRequested?: boolean
}

/** Run one command line; returns new state (immutable usage: replace prior state). */
export function runCommand(input: string, prevState: EngineState, username = 'you'): RunOutcome {
  const trimmed = input.trim()
  if (trimmed === '') return { lines: [], state: prevState }

  // Support `echo text > file` and `echo text >> file` redirection.
  const redirect = /(.*?)\s(>>|>)\s*(\S+)\s*$/.exec(trimmed)
  if (redirect && redirect[1]!.trim().startsWith('echo')) {
    const [, echoPart, op, file] = redirect as unknown as [string, string, string, string]
    const first = runCommand(echoPart.trim(), prevState, username)
    const text = first.lines.map((l) => l.text).join(' ')
    const abs = resolvePath(first.state.vfs, file)
    if (!abs) return { lines: [{ kind: 'err', text: `bash: ${file}: invalid path` }], state: first.state }
    const content = op === '>>' ? `${readFile(first.state.vfs, abs) ?? ''}${text}\n` : `${text}\n`
    const werr = writeFile(first.state.vfs, abs, content)
    if (werr) return { lines: [{ kind: 'err', text: `bash: ${file}: ${werr}` }], state: first.state }
    return { lines: [], state: first.state }
  }

  const tokens = tokenize(trimmed)
  const cmd = tokens[0]
  const rest = tokens.slice(1)

  if (cmd === 'git') {
    if (rest.length === 0) {
      return {
        lines: [{ kind: 'err', text: 'usage: git [--version] <command> [<args>]' }],
        state: prevState,
      }
    }
    const sub = rest[0]
    const fn = allGitCommands[sub]
    if (!fn) {
      return {
        lines: [{ kind: 'err', text: `git: '${sub}' is not a git command. See 'git --help'.` }],
        state: prevState,
      }
    }
    const { flags, positional } = splitArgs(rest.slice(1))
    const result = fn(mkCtx(prevState, rest.slice(1), flags, positional, username))
    return result
  }

  const { flags, positional } = splitArgs(rest)
  return runShellCommand(cmd, mkCtx(prevState, rest, flags, positional, username))
}

export { createInitialState }
