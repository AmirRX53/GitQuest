import type { Track } from '../../types'

export const gitTrack: Track = {
  id: 'git',
  title: 'Git Foundations',
  tagline: 'Snapshots, branches and the staging area',
  description:
    'The mental model that makes Git click: three states, cheap branches, and commits as snapshots. Everything from `git init` to confident merging.',
  color: 'violet',
  lessons: [
    {
      id: 'git-why',
      title: 'Why version control?',
      minutes: 5,
      summary: 'The problems Git solves: history, backups, fearlessness, collaboration.',
      tryIt: ['first-repo'],
      links: [{ to: '/track/git/git-install', label: 'Next: install & configure' }],
      sections: [
        {
          id: 'problem',
          title: 'Life before Git',
          blocks: [
            {
              kind: 'prose',
              text: 'Folders named `final`, `final2`, `final_FINAL` are version control by luck. Git replaces that with a **history of snapshots**: every commit records exactly what the project looked like, who changed it, and why. You gain three superpowers: a searchable past, an off-site backup (via remotes), and the freedom to experiment on branches without breaking the working copy.',
            },
            {
              kind: 'callout',
              callout: {
                kind: 'info',
                title: 'Git is distributed',
                body: 'Unlike older centralized systems, every clone is a full copy of the history. Work offline, commit on a plane, sync later. This design is why branching feels instant.',
              },
            },
          ],
        },
      ],
    },
    {
      id: 'git-install',
      title: 'Install & first-time setup',
      minutes: 6,
      summary: 'git config — the identity Git stamps on every commit you make.',
      tryIt: [],
      links: [{ to: '/track/git/git-init-clone', label: 'Next: init & clone' }],
      sections: [
        {
          id: 'config',
          title: 'Tell Git who you are',
          blocks: [
            {
              kind: 'code',
              lang: 'bash',
              title: 'first-time setup',
              code: `git --version          # check the install
git config --global user.name "Ada Lovelace"
git config --global user.email "ada@example.com"
git config --global init.defaultBranch main
git config --global --list   # review settings`,
            },
            {
              kind: 'prose',
              text: 'These settings live in `~/.gitconfig`. The email matters: GitHub matches it to your account to attribute commits. Set `init.defaultBranch main` once and every new repo starts on `main`.',
            },
            {
              kind: 'callout',
              callout: {
                kind: 'tip',
                title: 'Aliases pay rent forever',
                body: '`git config --global alias.st status` gives you `git st`. Popular ones: `co` (checkout), `br` (branch), `cia` (commit --amend --no-edit)... make your own as patterns emerge.',
              },
            },
          ],
        },
      ],
    },
    {
      id: 'git-init-clone',
      title: 'Starting repos: init & clone',
      minutes: 6,
      summary: 'Two ways to begin: a fresh repo, or a copy of an existing one.',
      tryIt: ['first-repo', 'github-flow'],
      links: [{ to: '/track/git/git-three-states', label: 'Next: the three states' }],
      sections: [
        {
          id: 'two-starts',
          title: 'init vs clone',
          blocks: [
            {
              kind: 'code',
              lang: 'bash',
              title: 'start from scratch',
              code: `mkdir my-app && cd my-app
git init
# Initialized empty Git repository in .../.git/`,
            },
            {
              kind: 'code',
              lang: 'bash',
              title: 'or copy an existing project',
              code: `git clone https://github.com/octocat/Spoon-Knife.git
cd Spoon-Knife
git remote -v   # origin points at the GitHub copy`,
            },
            {
              kind: 'prose',
              text: '`git init` creates a hidden `.git` folder — the entire database of history. Delete it and Git forgets everything; it is not magic, just files. `git clone` downloads the history **and** remembers where it came from as `origin`, the conventional remote name.',
            },
            {
              kind: 'callout',
              callout: {
                kind: 'best-practice',
                title: 'One repo, one project',
                body: 'Initialize at the project root, not your home folder. Repos containing repos (accidental `git init` too high) cause endless confusion.',
              },
            },
          ],
        },
      ],
    },
    {
      id: 'git-three-states',
      title: 'The three states & areas',
      minutes: 8,
      summary: 'Working directory → staging area → repository. The model behind every command.',
      tryIt: ['first-repo'],
      links: [{ to: '/track/git/git-log-diff', label: 'Next: reading history' }],
      sections: [
        {
          id: 'model',
          title: 'Where files live',
          blocks: [
            {
              kind: 'prose',
              text: 'Git has three places a file can be. The **working directory** is what you see and edit. The **staging area** (index) is the draft of your next commit. The **repository** is the committed history. `git add` moves changes left-to-right into staging; `git commit` writes the staged snapshot into history.',
            },
            {
              kind: 'list',
              items: [
                'Edited a file → it is *modified* in the working directory.',
                'Ran `git add` → it is *staged* in the index.',
                'Ran `git commit` → it is a *committed* snapshot, safe forever.',
              ],
            },
            {
              kind: 'demo',
              demo: {
                id: 'three-states-demo',
                title: 'watch the file move across areas',
                prompt: '~/projects/app (main)',
                lines: [
                  { kind: 'cmd', text: 'echo "hello" > file.txt' },
                  { kind: 'cmd', text: 'git status' },
                  { kind: 'out', text: 'Untracked files:  file.txt' },
                  { kind: 'cmd', text: 'git add file.txt' },
                  { kind: 'out', text: 'Changes to be committed:  new file: file.txt' },
                  { kind: 'cmd', text: 'git commit -m "feat: add file.txt"' },
                  { kind: 'out', text: 'working tree clean ✔' },
                ],
              },
            },
            {
              kind: 'callout',
              callout: {
                kind: 'best-practice',
                title: 'Why staging exists',
                body: 'Staging lets you build a commit deliberately: edit five files, stage only the two that belong together, commit. Small, logical commits are the whole game — staging is the tool that makes them possible.',
              },
            },
          ],
        },
      ],
    },
    {
      id: 'git-log-diff',
      title: 'Reading history: status, log, diff',
      minutes: 8,
      summary: 'The three looking-glasses: what changed, when, and by how much.',
      tryIt: ['first-repo'],
      links: [{ to: '/track/git/git-add-commit', label: 'Next: add & commit well' }],
      sections: [
        {
          id: 'viewing',
          title: 'Interrogate the repository',
          blocks: [
            {
              kind: 'code',
              lang: 'bash',
              title: 'the inspection trio',
              code: `git status            # right now: what is modified/staged?
git log --oneline     # compact history
git log --oneline --graph --all   # branch topology
git diff              # unstaged changes (working vs index)
git diff --staged     # what a commit would contain
git show HEAD         # last commit in detail`,
            },
            {
              kind: 'callout',
              callout: {
                kind: 'tip',
                title: 'Make `git diff` a reflex',
                body: 'Before every `git add`, run `git diff`. Reading your own changes catches stray console.logs, secrets, and half-finished edits before they enter history.',
              },
            },
          ],
        },
      ],
    },
    {
      id: 'git-add-commit',
      title: 'add & commit, done well',
      minutes: 9,
      summary: 'Atomic commits, message style, and why "misc fixes" is a smell.',
      tryIt: ['first-repo', 'gitignore'],
      links: [{ to: '/track/git/git-branches', label: 'Next: branching' }],
      sections: [
        {
          id: 'craft',
          title: 'Commits are documentation',
          blocks: [
            {
              kind: 'prose',
              text: 'A good commit does **one logical thing** and says so. Future-you (and every teammate reading `git blame`) will bisect, revert, and review these messages.',
            },
            {
              kind: 'table',
              table: {
                headers: ['Not great', 'Why it hurts'],
                rows: [
                  ['"misc fixes"', 'Unreviewable, unrevertable, unsearchable'],
                  ['"WIP"', 'Describes a moment, not a change'],
                  ['"fix bug + add feature + update deps"', 'Three commits wearing a trench coat'],
                ],
              },
            },
            {
              kind: 'code',
              lang: 'bash',
              title: 'the everyday loop',
              code: `git status            # what did I touch?
git diff              # review the actual changes
git add src/api.js    # stage deliberately (or git add -p!)
git commit -m "feat: add retry logic to API client"`,
            },
            {
              kind: 'callout',
              callout: {
                kind: 'best-practice',
                title: 'git add -p is a superpower',
                body: '`git add -p` walks through your edits hunk-by-hunk and lets you stage some, skip others. It is the fastest route to atomic commits when one working session touched many concerns.',
              },
            },
            {
              kind: 'callout',
              callout: {
                kind: 'tip',
                title: 'Amend only unpushed work',
                body: 'Forgot a file? `git add forgotten.js` then `git commit --amend --no-edit` folds it into the last commit. Safe while the commit is local — after pushing, prefer a new commit.',
              },
            },
          ],
        },
      ],
    },
    {
      id: 'git-branches',
      title: 'Branching & merging',
      minutes: 10,
      summary: 'Branches are pointers, merging is integration — including conflicts.',
      tryIt: ['branch-merge', 'conflict'],
      links: [{ to: '/track/git/git-remotes', label: 'Next: remotes & sync' }],
      sections: [
        {
          id: 'pointers',
          title: 'A branch is a sticky note',
          blocks: [
            {
              kind: 'prose',
              text: 'A commit stores its parent\u2019s id — history is a chain. A **branch** is just a movable pointer to one commit. Creating one costs nothing, which is why Git workflows branch constantly. `git switch -c feature/login` says: create a pointer here and move me onto it.',
            },
            {
              kind: 'code',
              lang: 'bash',
              title: 'the branching loop',
              code: `git switch -c feature/login    # create + switch
# ...edit, add, commit...
git switch main                # back to the trunk
git merge feature/login        # bring the work in
git branch -d feature/login    # tidy up`,
            },
            {
              kind: 'prose',
              text: 'Git can merge automatically when changes touch different files or different regions. When both branches edit the same lines, Git pauses with a **conflict**, writing both versions into the file between `<<<<<<< HEAD` and `>>>>>>> feature` markers. Edit the file into the shape you want, `git add` it, and commit — the merge completes.',
            },
            {
              kind: 'code',
              lang: 'bash',
              title: 'when a conflict strikes',
              code: `git merge feature/login
# CONFLICT in src/auth.js
# open the file, find <<<<<<< ======= >>>>>>>, edit to the final version
git add src/auth.js
git commit                  # completes the merge`,
            },
            {
              kind: 'callout',
              callout: {
                kind: 'info',
                title: 'merge vs rebase',
                body: '`merge` preserves both histories and adds a merge commit — honest and simple. `rebase` replays your commits on top of the other branch — linear and tidy. Rule of thumb: rebase your own unpushed branches, merge shared ones. The Habits track covers this in depth.',
              },
            },
          ],
        },
      ],
    },
    {
      id: 'git-remotes',
      title: 'Remotes: push, pull, fetch',
      minutes: 9,
      summary: 'Sync work between clones — and what upstream means.',
      tryIt: ['github-flow'],
      links: [{ to: '/track/git/git-gitignore', label: 'Next: .gitignore' }],
      sections: [
        {
          id: 'sync',
          title: 'A remote is a bookmark to another clone',
          blocks: [
            {
              kind: 'code',
              lang: 'bash',
              title: 'the sync trio',
              code: `git remote add origin git@github.com:you/app.git
git push -u origin main   # publish + set upstream
git fetch                 # download new work, no merging
git pull                  # fetch + merge into current branch
git push                  # upload your commits`,
            },
            {
              kind: 'prose',
              text: '`origin` is the conventional name for the remote you cloned from. The first `push -u` records the partnership ("upstream") between your `main` and `origin/main` — after that, bare `git push` and `git pull` know where to go. `fetch` downloads without touching your branch, letting you inspect before integrating; `pull` does fetch + merge in one motion.',
            },
            {
              kind: 'callout',
              callout: {
                kind: 'warning',
                title: 'Rejected push?',
                body: '`! [rejected] ... fetch first` means the remote has commits you lack. `git pull`, resolve anything, then push again. Never force-push shared branches (`--force` rewrites history others are standing on).',
              },
            },
            {
              kind: 'callout',
              callout: {
                kind: 'best-practice',
                title: 'If you must force-push, lease it',
                body: 'After a `rebase` on your own feature branch you may need to update the remote. Prefer `git push --force-with-lease` over `--force` — it aborts if someone else pushed in the meantime, so you never silently overwrite their work. Even better: `git config --global alias.pfl "push --force-with-lease"` and make it the default habit.',
              },
            },
            {
              kind: 'callout',
              callout: {
                kind: 'tip',
                title: 'Pull without the bubble',
                body: 'Bare `git pull` creates a merge commit when your branch diverged. Many teams prefer `git pull --rebase` (replay your commits on top of the fetched branch) to keep history linear. Set a default with `git config --global pull.rebase false|true|merges` or just prefer `git fetch` + explicit `git rebase origin/main`.',
              },
            },
          ],
        },
      ],
    },
    {
      id: 'git-gitignore',
      title: '.gitignore & tags',
      minutes: 7,
      summary: 'Keep junk out of history, and mark releases with tags.',
      tryIt: ['gitignore'],
      links: [{ to: '/track/github/gh-what', label: 'Next track: GitHub' }],
      sections: [
        {
          id: 'ignore',
          title: 'What should never be committed',
          blocks: [
            {
              kind: 'code',
              lang: 'bash',
              title: '.gitignore',
              code: `# dependencies
node_modules/
# build output
dist/
# environment & secrets
.env
# editor noise
.DS_Store
*.log`,
            },
            {
              kind: 'prose',
              text: 'Patterns match paths: `*.log` anywhere, `build/` any build folder, `/secret.txt` only at the root. Check `github/gitignore` for battle-tested starter files per language. One caveat: files **already tracked** stay tracked — `git rm --cached file` untracks without deleting.',
            },
            {
              kind: 'callout',
              callout: {
                kind: 'warning',
                title: 'Secrets are forever',
                body: 'A committed API key lives in history even after deletion — and scrapers hunt public repos. Rotate any credential that touches a commit, and keep `.env` files ignored from day one.',
              },
            },
            {
              kind: 'heading',
              text: 'Tags mark moments',
            },
            {
              kind: 'code',
              lang: 'bash',
              title: 'annotated tags for releases',
              code: `git tag -a v1.0.0 -m "First stable release"
git push origin v1.0.0
git tag          # list`,
            },
          ],
        },
      ],
    },
  ],
}
