import type { Scenario } from '../types'

export const scenarios: Scenario[] = [
  {
    id: 'first-repo',
    title: 'Your first repository',
    track: 'git',
    difficulty: 'beginner',
    minutes: 8,
    summary: 'Initialize a repo, make your first commit, and read history like a pro.',
    setup: JSON.stringify({
      cwd: '/project',
      tree: { 'README.md': '# My Project\n\nWelcome!', 'notes.txt': 'scratch ideas' },
    }),
    steps: [
      {
        goal: 'Turn this folder into a Git repository.',
        hints: [
          { label: 'git', text: 'git init starts tracking the current folder.' },
        ],
        checks: [{ kind: 'branch-checked-out', branch: 'main' }],
        sampleCommand: 'git init',
      },
      {
        goal: 'Check what Git sees (there should be untracked files).',
        hints: [{ label: 'git', text: 'git status shows the state of the working tree.' }],
        checks: [{ kind: 'staged-count', count: 0 }],
        sampleCommand: 'git status',
      },
      {
        goal: 'Stage both files for the commit.',
        hints: [
          { label: 'git', text: 'git add <file> stages one file; git add . stages everything.' },
        ],
        checks: [{ kind: 'staged-count', count: 2 }],
        sampleCommand: 'git add .',
      },
      {
        goal: 'Commit with a Conventional Commit message.',
        hints: [
          { label: 'git', text: 'git commit -m "feat: ..."' },
          { label: 'style', text: 'Types like feat, fix, docs keep history readable.' },
        ],
        checks: [{ kind: 'commit-count', count: 1 }, { kind: 'all-commits-conventional' }],
        sampleCommand: 'git commit -m "feat: initial commit"',
      },
      {
        goal: 'Inspect your history.',
        hints: [{ label: 'git', text: 'git log --oneline shows compact history.' }],
        checks: [{ kind: 'commit-message-contains', text: 'feat' }],
        sampleCommand: 'git log --oneline',
      },
    ],
  },
  {
    id: 'branch-merge',
    title: 'Branch & merge',
    track: 'git',
    difficulty: 'beginner',
    minutes: 10,
    summary: 'Create a feature branch, commit on it, and merge it back to main.',
    setup: JSON.stringify({
      cwd: '/project',
      tree: { 'app.js': 'console.log("v1")' },
    }),
    steps: [
      {
        goal: 'Initialize the repository and commit app.js.',
        hints: [{ label: 'git', text: 'git init, then git add ., then git commit -m "chore: baseline"' }],
        checks: [{ kind: 'commit-count', count: 1 }],
        sampleCommand: 'git init && git add . && git commit -m "chore: baseline"',
      },
      {
        goal: 'Create a branch called feature/farewell.',
        hints: [{ label: 'git', text: 'git branch <name> creates a branch without switching to it.' }],
        checks: [{ kind: 'branch-exists', branch: 'feature/farewell' }],
        sampleCommand: 'git branch feature/farewell',
      },
      {
        goal: 'Switch onto the new branch.',
        hints: [{ label: 'git', text: 'git switch <name> checks out the branch.' }],
        checks: [{ kind: 'branch-checked-out', branch: 'feature/farewell' }],
        sampleCommand: 'git switch feature/farewell',
      },
      {
        goal: 'Change app.js to say v2 and commit it on this branch.',
        hints: [
          { label: 'shell', text: 'echo "console.log(\\"v2\\")" > app.js' },
          { label: 'git', text: 'git add . && git commit -m "feat: v2 greeting"' },
        ],
        checks: [{ kind: 'file-contains', path: 'app.js', text: 'v2' }, { kind: 'commit-count', count: 2 }],
        sampleCommand: 'echo "console.log(\\"v2\\")" > app.js && git add . && git commit -m "feat: v2 greeting"',
      },
      {
        goal: 'Go back to main and merge the branch in.',
        hints: [
          { label: 'git', text: 'git switch main' },
          { label: 'git', text: 'git merge feature/farewell' },
        ],
        checks: [
          { kind: 'branch-checked-out', branch: 'main' },
          { kind: 'file-contains', path: 'app.js', text: 'v2' },
        ],
        sampleCommand: 'git switch main && git merge feature/farewell',
      },
    ],
  },
  {
    id: 'github-flow',
    title: 'GitHub Flow, simulated',
    track: 'github',
    difficulty: 'intermediate',
    minutes: 12,
    summary: 'Branch, commit, push to a fake origin, and open-state your PR — the full loop.',
    setup: JSON.stringify({
      cwd: '/project',
      tree: { 'docs.md': '# Docs\n\nHello.' },
    }),
    steps: [
      {
        goal: 'Initialize and commit docs.md on main, then push with upstream.',
        hints: [
          { label: 'git', text: 'git init && git add . && git commit -m "docs: baseline"' },
          { label: 'git', text: 'git remote add origin <url> registers the remote.' },
          { label: 'git', text: 'git push -u origin main publishes and links the branch.' },
        ],
        checks: [{ kind: 'remote-set' }, { kind: 'commit-count', count: 1 }],
        sampleCommand: 'git init && git add . && git commit -m "docs: baseline" && git remote add origin url && git push -u origin main',
      },
      {
        goal: 'Create and switch to a branch docs/greeting.',
        hints: [{ label: 'git', text: 'git switch -c docs/greeting creates AND switches.' }],
        checks: [{ kind: 'branch-checked-out', branch: 'docs/greeting' }],
        sampleCommand: 'git switch -c docs/greeting',
      },
      {
        goal: 'Add a line to docs.md and commit it.',
        hints: [
          { label: 'shell', text: 'echo "New section" >> docs.md' },
          { label: 'git', text: 'git add docs.md && git commit -m "docs: add greeting section"' },
        ],
        checks: [{ kind: 'file-contains', path: 'docs.md', text: 'New section' }, { kind: 'commit-count', count: 2 }],
        sampleCommand: 'echo "New section" >> docs.md && git add docs.md && git commit -m "docs: add greeting section"',
      },
      {
        goal: 'Push the branch to origin.',
        hints: [{ label: 'git', text: 'git push -u origin docs/greeting' }],
        checks: [{ kind: 'branch-ahead-of', branch: 'docs/greeting' }],
        sampleCommand: 'git push -u origin docs/greeting',
      },
    ],
  },
  {
    id: 'undo-rescue',
    title: 'Undo rescue mission',
    track: 'habits',
    difficulty: 'intermediate',
    minutes: 12,
    summary: 'Discard a bad edit, uncommit safely, and revert a pushed commit.',
    setup: JSON.stringify({
      cwd: '/project',
      tree: { 'config.txt': 'mode=production' },
    }),
    steps: [
      {
        goal: 'Initialize and commit config.txt.',
        hints: [{ label: 'git', text: 'git init && git add . && git commit -m "feat: config"' }],
        checks: [{ kind: 'commit-count', count: 1 }],
        sampleCommand: 'git init && git add . && git commit -m "feat: config"',
      },
      {
        goal: 'Overwrite config.txt, then discard the damage with git restore.',
        hints: [
          { label: 'shell', text: 'echo "mode=???" > config.txt' },
          { label: 'git', text: 'git restore config.txt resets the file from HEAD.' },
        ],
        checks: [{ kind: 'file-contains', path: 'config.txt', text: 'mode=production' }],
        sampleCommand: 'echo "mode=???" > config.txt && git restore config.txt',
      },
      {
        goal: 'Commit a second change, then undo the commit but keep the edits (soft reset).',
        hints: [
          { label: 'git', text: 'echo "mode=debug" > config.txt && git add . && git commit -m "feat: debug mode"' },
          { label: 'git', text: 'git reset --soft HEAD~1 moves the branch back, keeps changes staged.' },
        ],
        checks: [{ kind: 'staged-count', count: 1 }],
        sampleCommand: 'echo "mode=debug" > config.txt && git add . && git commit -m "feat: debug mode" && git reset --soft HEAD~1',
      },
      {
        goal: 'Re-commit, then practice git revert on it.',
        hints: [
          { label: 'git', text: 'git commit -m "feat: debug mode" to recreate the commit.' },
          { label: 'git', text: 'git revert HEAD creates an inverse commit — safe for pushed work.' },
        ],
        checks: [{ kind: 'file-contains', path: 'config.txt', text: 'mode=production' }, { kind: 'commit-count', count: 3 }],
        sampleCommand: 'git commit -m "feat: debug mode" && git revert HEAD',
      },
    ],
  },
  {
    id: 'conflict',
    title: 'Resolve a merge conflict',
    track: 'habits',
    difficulty: 'advanced',
    minutes: 15,
    summary: 'Two branches edit one file. You are the tiebreaker.',
    setup: JSON.stringify({
      cwd: '/project',
      tree: { 'title.txt': 'Untitled' },
    }),
    steps: [
      {
        goal: 'Initialize and commit title.txt.',
        hints: [{ label: 'git', text: 'git init && git add . && git commit -m "chore: baseline"' }],
        checks: [{ kind: 'commit-count', count: 1 }],
        sampleCommand: 'git init && git add . && git commit -m "chore: baseline"',
      },
      {
        goal: 'Branch to feature/title and change title.txt there; commit.',
        hints: [
          { label: 'git', text: 'git switch -c feature/title' },
          { label: 'shell', text: 'echo "Feature Title" > title.txt && git add . && git commit -m "feat: feature title"' },
        ],
        checks: [{ kind: 'branch-exists', branch: 'feature/title' }, { kind: 'commit-count', count: 2 }],
        sampleCommand: 'git switch -c feature/title && echo "Feature Title" > title.txt && git add . && git commit -m "feat: feature title"',
      },
      {
        goal: 'Back on main, change title.txt differently; commit.',
        hints: [
          { label: 'git', text: 'git switch main' },
          { label: 'shell', text: 'echo "Main Title" > title.txt && git add . && git commit -m "feat: main title"' },
        ],
        checks: [{ kind: 'commit-count', count: 3 }],
        sampleCommand: 'git switch main && echo "Main Title" > title.txt && git add . && git commit -m "feat: main title"',
      },
      {
        goal: 'Try to merge feature/title — observe the conflict markers.',
        hints: [{ label: 'git', text: 'git merge feature/title' }],
        checks: [{ kind: 'file-contains', path: 'title.txt', text: '<<<<<<<' }],
        sampleCommand: 'git merge feature/title',
      },
      {
        goal: 'Edit title.txt to a single final value, stage it, and complete the merge commit.',
        hints: [
          { label: 'shell', text: 'echo "Final Title" > title.txt' },
          { label: 'git', text: 'git add title.txt && git commit -m "fix: resolve title conflict"' },
        ],
        checks: [
          { kind: 'file-contains', path: 'title.txt', text: 'Final Title' },
          { kind: 'commit-count', count: 4 },
          { kind: 'workdir-clean' },
        ],
        sampleCommand: 'echo "Final Title" > title.txt && git add title.txt && git commit -m "fix: resolve title conflict"',
      },
    ],
  },
  {
    id: 'gitignore',
    title: 'Tame untracked files',
    track: 'git',
    difficulty: 'beginner',
    minutes: 8,
    summary: 'Use .gitignore to keep secrets and build artifacts out of Git.',
    setup: JSON.stringify({
      cwd: '/project',
      tree: { 'app.js': 'main()' },
    }),
    steps: [
      {
        goal: 'Initialize and commit app.js.',
        hints: [{ label: 'git', text: 'git init && git add . && git commit -m "feat: app"' }],
        checks: [{ kind: 'commit-count', count: 1 }],
        sampleCommand: 'git init && git add . && git commit -m "feat: app"',
      },
      {
        goal: 'Create a file called .gitignore containing "node_modules" and "*.log".',
        hints: [
          { label: 'shell', text: 'echo "node_modules" > .gitignore && echo "*.log" >> .gitignore' },
        ],
        checks: [{ kind: 'file-contains', path: '.gitignore', text: 'node_modules' }],
        sampleCommand: 'echo "node_modules" > .gitignore && echo "*.log" >> .gitignore',
      },
      {
        goal: 'Commit the .gitignore file.',
        hints: [{ label: 'git', text: 'git add .gitignore && git commit -m "chore: ignore build artifacts"' }],
        checks: [{ kind: 'commit-count', count: 2 }],
        sampleCommand: 'git add .gitignore && git commit -m "chore: ignore build artifacts"',
      },
    ],
  },
]
