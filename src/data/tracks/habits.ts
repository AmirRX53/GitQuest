import type { Track } from '../../types'

export const habitsTrack: Track = {
  id: 'habits',
  title: 'Pro Habits',
  tagline: 'Best practices that scale to teams',
  description:
    'The difference between using Git and using it well: Conventional Commits, atomic history, knowing exactly which undo tool to reach for, and calm conflict resolution.',
  color: 'rose',
  lessons: [
    {
      id: 'hb-commit-style',
      title: 'Commit messages: Conventional Commits',
      minutes: 8,
      summary: 'A shared format that makes history searchable and changelogs automatic.',
      tryIt: ['first-repo'],
      links: [{ to: '/track/habits/hb-atomic', label: 'Next: atomic commits' }],
      sections: [
        {
          id: 'spec',
          title: 'type(scope): subject',
          blocks: [
            {
              kind: 'prose',
              text: 'The [Conventional Commits](https://www.conventionalcommits.org) spec is one line of grammar: `type(optional scope): description`. Types are drawn from a fixed set — `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore` — and tooling parses them to generate changelogs and version bumps (a `feat:` commit can trigger a minor release; `fix:` a patch).',
            },
            {
              kind: 'code',
              lang: 'bash',
              title: 'examples that pull their weight',
              code: `git commit -m "feat(auth): add login rate limiting"
git commit -m "fix(cart): stop total from going negative"
git commit -m "docs: explain the deploy checklist"
git commit -m "refactor!: rename exports to camelCase"
#        ! marks a breaking change
git commit -m "chore(deps): bump vite to 8.3"`,
            },
            {
              kind: 'table',
              table: {
                headers: ['Type', 'Use for'],
                rows: [
                  ['feat', 'New user-facing capability'],
                  ['fix', 'Bug fix'],
                  ['docs', 'Documentation only'],
                  ['refactor', 'Code change that neither fixes nor adds'],
                  ['chore', 'Tooling, deps, maintenance'],
                  ['test', 'Adding or fixing tests'],
                ],
              },
            },
            {
              kind: 'callout',
              callout: {
                kind: 'best-practice',
                title: 'Imperative mood',
                body: 'Write the subject as an instruction: “add retry logic”, not “added” or “adds”. GitHub itself uses it: “this commit **adds** retry logic”.',
              },
            },
            {
              kind: 'heading',
              text: 'The 50/72 rule and the full message',
            },
            {
              kind: 'prose',
              text: 'Keep the subject ≤ 50 characters, then a blank line, then a body wrapped at ~72 characters explaining *why* (not *what* — the diff shows what). For breaking changes, add a `BREAKING CHANGE:` footer or a `!` after the type/scope (`refactor!: drop Node 18`). Tools like **Commitlint** can enforce the spec in CI, and **Commitizen** (`git cz`) prompts you interactively.',
            },
            {
              kind: 'code',
              lang: 'bash',
              title: 'full commit with body and footer',
              code: "git commit -m \"feat(auth): add login rate limiting\" -m \"Limit to 5 attempts per 15 min per IP.\" -m \"Refs: #142\"",
            },
          ],
        },
      ],
    },
    {
      id: 'hb-atomic',
      title: 'Atomic commits & history hygiene',
      minutes: 7,
      summary: 'One commit, one purpose — and the tools to reshape history before sharing.',
      tryIt: ['first-repo'],
      links: [{ to: '/track/habits/hb-undo', label: 'Next: which undo when' }],
      sections: [
        {
          id: 'atomic',
          title: 'Small, complete, consistent',
          blocks: [
            {
              kind: 'prose',
              text: 'An **atomic commit** does exactly one thing, and passes tests by itself. Atomicity is what makes `git revert`, `git bisect` and code review all work. The toolkit for reshaping local history before pushing: `git commit --amend` (fold into last commit), `git rebase -i HEAD~3` (reorder/squash/reword the last three), `git reset --soft HEAD~1` (uncommit, keep changes).',
            },
            {
              kind: 'code',
              lang: 'bash',
              title: 'interactive rebase in one screen',
              code: `git rebase -i HEAD~3
# pick   a1b2c3d feat: add endpoint
# squash 9e8f7g6 feat: add endpoint tests
# pick   4d5c6b7 docs: update api readme
# reorder lines, mark squash to fuse commits, save & close.`,
            },
            {
              kind: 'callout',
              callout: {
                kind: 'warning',
                title: 'The golden rule of history',
                body: 'Rewrite only commits you have not pushed to a shared branch. After pushing, history is public — add new commits instead of editing old ones.',
              },
            },
            {
              kind: 'prose',
              text: 'Two power moves for polishing before you push: `git commit --fixup <sha>` marks a follow-up that `git rebase -i --autosquash` will automatically squash into the right commit. And `git bisect` binary-searches history to find the commit that broke something — far faster than reading logs line by line.',
            },
          ],
        },
      ],
    },
    {
      id: 'hb-undo',
      title: 'Which undo, when?',
      minutes: 10,
      summary: 'restore vs reset vs revert vs reflog — a decision table you can trust.',
      tryIt: ['undo-rescue'],
      links: [{ to: '/track/habits/hb-conflicts', label: 'Next: conflicts without fear' }],
      sections: [
        {
          id: 'decision',
          title: 'Four tools, four jobs',
          blocks: [
            {
              kind: 'table',
              table: {
                headers: ['Situation', 'Reach for', 'Safety'],
                rows: [
                  ['Messy edits, not staged', 'git restore <file>', 'Destroys the edits — that is the point'],
                  ['Staged the wrong file', 'git restore --staged <file>', 'Unstages, keeps edits'],
                  ['Last commit, not pushed', 'git reset --soft HEAD~1', 'Keeps changes staged'],
                  ['Commit already pushed', 'git revert <sha>', 'Safe: writes an inverse commit'],
                  ['“I deleted everything”', 'git reflog', 'Your parachute — see below'],
                ],
                caption: 'The undo decision table',
              },
            },
            {
              kind: 'prose',
              text: 'The rule that resolves 90% of anxiety: **reset rewrites local history; revert appends new history.** If no one else can see the commit, reset freely. If it is pushed, revert — others\u2019 clones stay coherent.',
            },
            {
              kind: 'code',
              lang: 'bash',
              title: 'reflog: the safety net',
              code: `git reflog
# a1b2c3d HEAD@{0}: reset: moving to HEAD~2
# 9e8f7g6 HEAD@{1}: commit: feat: the work I "lost"
git reset --hard 9e8f7g6
# ...and the "lost" commit is back. Commits are almost never truly gone.`,
            },
            {
              kind: 'callout',
              callout: {
                kind: 'info',
                title: 'Stash is undo-adjacent',
                body: 'Need to switch branches but mid-change? `git stash push` shelves everything; `git stash pop` restores it. Cleaner than committing WIP or stashing by copy-paste.',
              },
            },
            {
              kind: 'prose',
              text: 'Modern Git prefers **`git restore`** (unstage/discard) and **`git switch`** (change branches) over the overloaded `git checkout`. If you see `checkout` in older guides, mentally translate: `checkout <branch>` → `switch <branch>`, `checkout -- <file>` → `restore <file>`.',
            },
            {
              kind: 'callout',
              callout: {
                kind: 'warning',
                title: '`git clean` is the other half of undo',
                body: '`restore` and `reset` handle tracked files. For untracked files (build artifacts, stray logs), `git clean -n` previews what would be deleted, `git clean -f` deletes it. Always preview first — like `rm`, there is no undo.',
              },
            },
          ],
        },
      ],
    },
    {
      id: 'hb-conflicts',
      title: 'Resolving conflicts without fear',
      minutes: 9,
      summary: 'Conflicts are collaboration, not catastrophe. A calm protocol.',
      tryIt: ['conflict'],
      links: [{ to: '/track/habits/hb-workflows', label: 'Next: choosing a workflow' }],
      sections: [
        {
          id: 'protocol',
          title: 'The calm protocol',
          blocks: [
            {
              kind: 'list',
              ordered: true,
              items: [
                'Run `git status` — Git lists every conflicted file; nothing is hidden.',
                'Open each file and find the `<<<<<<<` markers. Both sides are shown; **you** choose the final text.',
                'Clean the file until no markers remain. Test the result — do not trust a conflict merge blindly.',
                '`git add <resolved-files>` to mark them resolved.',
                '`git commit` to finish the merge (or `git merge --continue`).',
              ],
            },
            {
              kind: 'prose',
              text: 'Abort buttons exist and work: `git merge --abort` (or `git rebase --abort`) returns you to the exact pre-merge state, no shame attached. To reduce conflicts structurally: pull main into your branch regularly, keep commits small, and talk to whoever last touched the file.',
            },
            {
              kind: 'callout',
              callout: {
                kind: 'tip',
                title: 'Editor integration',
                body: 'VS Code renders conflict blocks with “Accept Current / Incoming / Both” buttons. `git config --global merge.conflictstyle diff3` adds a third “common ancestor” section that makes intent clearer.',
              },
            },
            {
              kind: 'prose',
              text: 'Enable `git config --global rerere.enabled true` (reuse recorded resolution) — Git will remember how you resolved a conflict and auto-apply the same resolution if the conflict reappears during a rebase. Paired with frequent `git fetch` + `rebase` on feature branches, it keeps conflict pain low.',
            },
          ],
        },
      ],
    },
    {
      id: 'hb-workflows',
      title: 'Choosing a team workflow',
      minutes: 7,
      summary: 'GitHub Flow vs Git Flow vs trunk-based — and how to pick.',
      tryIt: ['github-flow'],
      links: [{ to: '/cheatsheet', label: 'Browse the cheat sheet' }],
      sections: [
        {
          id: 'compare',
          title: 'Three shapes of teamwork',
          blocks: [
            {
              kind: 'table',
              table: {
                headers: ['Workflow', 'Shape', 'Fits'],
                rows: [
                  ['GitHub Flow', 'main + short-lived feature branches, PR review', 'Web apps, continuous deployment, most teams'],
                  ['Git Flow', 'long-lived main + develop + release branches', 'Versioned apps, scheduled releases, mobile'],
                  ['Trunk-based', 'Everyone commits to main behind flags, tiny branches', 'Senior teams, very high deploy frequency'],
                ],
                caption: 'Compare before you commit (to one)',
              },
            },
            {
              kind: 'prose',
              text: 'Startups converge on GitHub Flow because it maps exactly to pull requests and CI. Git Flow\u2019s ceremony earns its keep when releases are shipped on a cadence (installer apps). Trunk-based development maximizes integration speed but needs strong test coverage and feature flags. Whichever you pick: write it down in CONTRIBUTING.md — a workflow nobody can find is a workflow nobody follows. Enforce it with a GitHub **ruleset** (Settings → Rules → Rulesets), not just documentation.',
            },
            {
              kind: 'callout',
              callout: {
                kind: 'best-practice',
                title: 'Protect main',
                body: 'Enable branch protection: require PRs, required status checks, and no direct pushes. One settings page converts team norms into mechanical guarantees.',
              },
            },
          ],
        },
      ],
    },
  ],
}
