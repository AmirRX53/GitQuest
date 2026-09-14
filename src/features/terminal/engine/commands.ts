// Command layer: shared types + helpers.

import type { EngineState } from './gitState'
import { resolvePath } from './fs'

export interface OutLine {
  kind: 'cmd' | 'out' | 'err' | 'sys'
  text: string
}

export interface CmdResult {
  lines: OutLine[]
  state: EngineState
}

export interface CmdContext {
  state: EngineState
  /** Current working directory (absolute). */
  cwd: string
  args: string[]
  flags: Set<string>
  positional: string[]
  username: string
}

/** Parse a command line into command name, flags and positional args (quoted-aware). */
export function tokenize(input: string): string[] {
  const tokens: string[] = []
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(input)) !== null) {
    tokens.push(m[1] ?? m[2] ?? m[3])
  }
  return tokens
}

/** Split args into flags (starting with -) and positional args. */
export function splitArgs(args: string[]): { flags: Set<string>; positional: string[] } {
  const flags = new Set<string>()
  const positional: string[] = []
  for (const a of args) {
    if (a.startsWith('-') && a.length > 1) flags.add(a)
    else positional.push(a)
  }
  return { flags, positional }
}

/** Resolve a path argument to absolute, or null if it can't be resolved. */
export function absPath(ctx: Pick<CmdContext, 'state' | 'cwd'>, target: string): string | null {
  return resolvePath({ root: ctx.state.vfs.root, cwd: ctx.cwd }, target)
}

/** The repository always lives at this path inside the virtual filesystem. */
export const REPO_ROOT = '/project'

/** Repo-root-relative path for an absolute path. */
export function repoRel(abs: string): string {
  if (abs.startsWith(REPO_ROOT + '/')) return abs.slice(REPO_ROOT.length + 1)
  return abs.replace(/^\//, '')
}

/** Absolute path for a repo-root-relative path. */
export function absOfRel(rel: string): string {
  return `${REPO_ROOT}/${rel}`
}

/** Short hash like real git shows (first 7 chars). */
export function shortHash(id: string): string {
  return id.slice(0, 7)
}
