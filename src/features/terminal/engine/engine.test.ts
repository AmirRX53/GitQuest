import { describe, expect, it } from 'vitest'

import { createInitialState, runCommand } from './engine'
import type { EngineState } from './gitState'

function setup(json: string): EngineState {
  return createInitialState(json)
}

function run(state: EngineState, input: string): { state: EngineState; text: string } {
  const result = runCommand(input, state)
  return { state: result.state, text: result.lines.map((l) => l.text).join('\n') }
}

/** echo with redirection is handled inside runCommand; write text directly via run(). */
function write(state: EngineState, file: string, text: string): EngineState {
  const r = run(state, `echo "${text}" > ${file}`)
  return r.state
}

const emptyDir = JSON.stringify({ cwd: '/project', tree: {} })

describe('shell commands', () => {
  it('creates, lists and reads files', () => {
    let s = setup(emptyDir)
    run(s, 'touch README.md')
    s = write(s, 'README.md', 'hello world')
    const cat = run(s, 'cat README.md')
    expect(cat.text).toBe('hello world')
    const ls = run(s, 'ls')
    expect(ls.text).toContain('README.md')
  })

  it('navigates directories', () => {
    let s = setup(emptyDir)
    s = run(s, 'mkdir src').state
    s = run(s, 'cd src').state
    expect(s.vfs.cwd).toBe('/project/src')
    const pwd = run(s, 'pwd')
    expect(pwd.text).toBe('/project/src')
    s = run(s, 'cd ..').state
    expect(s.vfs.cwd).toBe('/project')
  })

  it('reports missing commands', () => {
    const s = setup(emptyDir)
    const r = run(s, 'notacmd')
    expect(r.text).toContain('command not found')
  })
})

describe('git basics', () => {
  it('init, add, commit, log', () => {
    let s = setup(JSON.stringify({ cwd: '/project', tree: { 'README.md': 'hello' } }))
    s = run(s, 'git init').state
    s = run(s, 'git add README.md').state
    s = run(s, 'git commit -m "feat: initial commit"').state
    const log = run(s, 'git log --oneline')
    expect(log.text).toMatch(/^[a-z0-9]+ feat: initial commit$/m)
    const status = run(s, 'git status')
    expect(status.text).toContain('working tree clean')
  })

  it('commit without staging does nothing', () => {
    let s = setup(JSON.stringify({ cwd: '/project', tree: { 'a.txt': 'x' } }))
    s = run(s, 'git init').state
    const r = run(s, 'git commit -m "feat: x"')
    expect(r.text).toContain('nothing to commit')
  })

  it('commit without message fails gracefully', () => {
    let s = setup(JSON.stringify({ cwd: '/project', tree: { 'a.txt': 'x' } }))
    s = run(s, 'git init').state
    s = run(s, 'git add .').state
    const r = run(s, 'git commit')
    expect(r.text).toContain('empty commit message')
  })
})

describe('branches and merging', () => {
  it('branch, switch, fast-forward merge', () => {
    let s = setup(JSON.stringify({ cwd: '/project', tree: { 'app.txt': 'v1' } }))
    s = run(s, 'git init').state
    s = run(s, 'git add .').state
    s = run(s, 'git commit -m "feat: v1"').state
    s = run(s, 'git branch feature').state
    s = run(s, 'git switch feature').state
    s = write(s, 'app.txt', 'v2')
    s = run(s, 'git add .').state
    s = run(s, 'git commit -m "feat: v2"').state
    const file = run(s, 'cat app.txt')
    expect(file.text).toBe('v2')
    s = run(s, 'git switch main').state
    expect(run(s, 'cat app.txt').text).toBe('v1')
    const merge = run(s, 'git merge feature')
    expect(merge.text).toContain('Fast-forward')
    expect(run(s, 'cat app.txt').text).toBe('v2')
  })

  it('detects merge conflicts', () => {
    let s = setup(JSON.stringify({ cwd: '/project', tree: { 'f.txt': 'base' } }))
    s = run(s, 'git init').state
    s = run(s, 'git add .').state
    s = run(s, 'git commit -m "chore: base"').state
    s = run(s, 'git branch other').state
    s = write(s, 'f.txt', 'main-change')
    s = run(s, 'git add .').state
    s = run(s, 'git commit -m "feat: main change"').state
    s = run(s, 'git switch other').state
    s = write(s, 'f.txt', 'other-change')
    s = run(s, 'git add .').state
    s = run(s, 'git commit -m "feat: other change"').state
    s = run(s, 'git switch main').state
    const merge = run(s, 'git merge other')
    expect(merge.text).toContain('CONFLICT')
    const cat = run(s, 'cat f.txt')
    expect(cat.text).toContain('<<<<<<<')
    expect(cat.text).toContain('=======')
    expect(cat.text).toContain('>>>>>>>')
  })
})

describe('undo commands', () => {
  it('restore discards working tree edits', () => {
    let s = setup(JSON.stringify({ cwd: '/project', tree: { 'a.txt': 'original' } }))
    s = run(s, 'git init').state
    s = run(s, 'git add .').state
    s = run(s, 'git commit -m "feat: a"').state
    s = write(s, 'a.txt', 'changed')
    const diff = run(s, 'git diff')
    expect(diff.text).toContain('+changed')
    s = run(s, 'git restore a.txt').state
    expect(run(s, 'cat a.txt').text).toBe('original')
  })

  it('reset --soft keeps changes staged', () => {
    let s = setup(JSON.stringify({ cwd: '/project', tree: { 'a.txt': 'one' } }))
    s = run(s, 'git init').state
    s = run(s, 'git add .').state
    s = run(s, 'git commit -m "feat: one"').state
    s = write(s, 'a.txt', 'two')
    s = run(s, 'git add .').state
    s = run(s, 'git commit -m "feat: two"').state
    const before = Object.keys(s.repo!.commits).length
    const r = run(s, 'git reset --soft HEAD~1')
    expect(r.text).toContain('HEAD is now at')
    expect(Object.keys(s.repo!.commits).length).toBe(before)
    const status = run(s, 'git status')
    expect(status.text).toContain('Changes to be committed')
  })

  it('revert creates an inverse commit', () => {
    let s = setup(JSON.stringify({ cwd: '/project', tree: { 'a.txt': 'one' } }))
    s = run(s, 'git init').state
    s = run(s, 'git add .').state
    s = run(s, 'git commit -m "feat: one"').state
    s = run(s, 'echo two > a.txt').state
    s = run(s, 'git add .').state
    s = run(s, 'git commit -m "feat: two"').state
    const revert = run(s, 'git revert HEAD')
    expect(revert.text).toMatch(/Revert/)
    expect(run(s, 'cat a.txt').text).toBe('one')
  })
})

describe('stash', () => {
  it('stash push and pop', () => {
    let s = setup(JSON.stringify({ cwd: '/project', tree: { 'a.txt': 'orig' } }))
    s = run(s, 'git init').state
    s = run(s, 'git add .').state
    s = run(s, 'git commit -m "feat: a"').state
    s = write(s, 'a.txt', 'wip')
    const stashed = run(s, 'git stash push')
    expect(stashed.text).toContain('Saved working directory')
    expect(run(s, 'cat a.txt').text).toBe('orig')
    const popped = run(s, 'git stash pop')
    expect(popped.text).toContain('Dropped')
    expect(run(s, 'cat a.txt').text).toBe('wip')
  })
})

describe('remote workflow', () => {
  it('push fails without upstream, succeeds with -u', () => {
    let s = setup(JSON.stringify({ cwd: '/project', tree: { 'a.txt': 'x' } }))
    s = run(s, 'git init').state
    s = run(s, 'git add .').state
    s = run(s, 'git commit -m "feat: x"').state
    const noUp = run(s, 'git push')
    expect(noUp.text).toContain('no upstream branch')
    s = run(s, 'git remote add origin github.com:you/project.git').state
    const push = run(s, 'git push -u origin main')
    expect(push.text).toContain('new branch')
    const again = run(s, 'git push')
    expect(again.text).toContain('Everything up-to-date')
  })
})
