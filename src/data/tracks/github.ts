import type { Track } from '../../types'

export const githubTrack: Track = {
  id: 'github',
  title: 'Working with GitHub',
  tagline: 'Where Git becomes collaboration',
  description:
    'GitHub wraps Git repositories with review, discussion and automation. Master the GitHub Flow — branch, commit, pull request, review, merge — plus SSH keys, issues and Actions.',
  color: 'blue',
  lessons: [
    {
      id: 'gh-what',
      title: 'Git vs GitHub',
      minutes: 4,
      summary: 'The tool and the platform — what each one does.',
      tryIt: [],
      links: [{ to: '/track/github/gh-ssh', label: 'Next: SSH keys' }],
      sections: [
        {
          id: 'distinction',
          title: 'The tool and the platform',
          blocks: [
            {
              kind: 'prose',
              text: '**Git** is the version control system — local, offline, no account needed. **GitHub** hosts Git repositories and adds the collaboration layer: pull requests for discussing changes, issues for tracking work, Actions for automation, and a web UI for history. Git is the engine; GitHub is the workshop around it. (GitLab and Bitbucket are alternative workshops for the same engine.)',
            },
            {
              kind: 'list',
              items: [
                'You can use Git without GitHub (fully offline).',
                'You cannot use GitHub without Git — it stores Git repositories.',
                'Everything in the Foundations track works identically on any host.',
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'gh-ssh',
      title: 'SSH keys & authentication',
      minutes: 7,
      summary: 'Push without passwords: generate a key, add it to your account.',
      tryIt: ['github-flow'],
      links: [{ to: '/track/github/gh-flow', label: 'Next: GitHub Flow' }],
      sections: [
        {
          id: 'keys',
          title: 'One key, many pushes',
          blocks: [
            {
              kind: 'code',
              lang: 'bash',
              title: 'generate and register a key',
              code: `ssh-keygen -t ed25519 -C "ada@example.com"
# accepts the default location, optionally adds a passphrase
cat ~/.ssh/id_ed25519.pub
# copy the output, then on GitHub:
# Settings → SSH and GPG keys → New SSH key`,
            },
            {
              kind: 'prose',
              text: 'SSH uses a **keypair**: the private key stays on your machine, the public key goes to GitHub. When you push, GitHub challenges your machine to prove it holds the private half — no password travels anywhere. Use the remote URL form `git@github.com:you/repo.git` and pushes authenticate automatically.',
            },
            {
              kind: 'code',
              lang: 'bash',
              title: 'verify the handshake',
              code: `ssh -T git@github.com
# Hi ada! You've successfully authenticated...`,
            },
            {
              kind: 'callout',
              callout: {
                kind: 'warning',
                title: 'Never share the private key',
                body: 'Only ever upload the `.pub` file. If a private key leaks, remove it from GitHub immediately and generate a fresh pair.',
              },
            },
            {
              kind: 'heading',
              text: 'Sign your commits (SSH, no GPG required)',
            },
            {
              kind: 'prose',
              text: 'GitHub can show a **Verified** badge on commits you signed, proving they came from you and not an impersonator. Since 2022 Git supports **SSH signing** — you can reuse the same ed25519 key you just created, no GPG setup needed.',
            },
            {
              kind: 'code',
              lang: 'bash',
              title: 'sign with your SSH key',
              code: `git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519.pub
git config --global commit.gpgsign true
# add the same .pub key under GitHub → Settings → SSH and GPG keys → “Signing key”
git commit -m "feat: verified commit"   # now shows Verified on GitHub`,
            },
            {
              kind: 'callout',
              callout: {
                kind: 'tip',
                title: 'Why this matters',
                body: 'Without signing, anyone can craft a commit with your name and email. Teams that require verified commits (branch ruleset → “Require signed commits”) block unverified pushes entirely.',
              },
            },
          ],
        },
      ],
    },
    {
      id: 'gh-flow',
      title: 'The GitHub Flow',
      minutes: 10,
      summary: 'The official workflow: branch, commit, PR, review, merge.',
      tryIt: ['github-flow'],
      links: [{ to: '/track/github/gh-pr', label: 'Next: pull requests & review' }],
      sections: [
        {
          id: 'flow',
          title: 'Six steps, one loop',
          blocks: [
            {
              kind: 'prose',
              text: 'GitHub\u2019s official workflow is deliberately simple: **main is always deployable**, and all work happens on short-lived branches reviewed through pull requests. Click each step:',
            },
            {
              kind: 'flow',
              steps: [
                { id: 'branch', label: '1. Branch', detail: 'git switch -c feature/thing — create a topic branch off main. Name it after the change, not the author.' },
                { id: 'commit', label: '2. Commit', detail: 'Make small, logical commits on the branch. Push the branch to origin.' },
                { id: 'pr', label: '3. Open a PR', detail: 'A pull request proposes merging your branch into main, with a diff and description. CI runs automatically.' },
                { id: 'review', label: '4. Discuss & review', detail: 'Teammates comment line-by-line. Push more commits to address feedback — the PR updates live.' },
                { id: 'merge', label: '5. Merge', detail: 'After approval, merge into main. Squash-merge keeps main linear; merge commits preserve both histories.' },
                { id: 'delete', label: '6. Delete & repeat', detail: 'Delete the branch — the PR keeps its history — and branch again for the next task.' },
              ],
            },
            {
              kind: 'callout',
              callout: {
                kind: 'best-practice',
                title: 'Short-lived branches',
                body: 'The longer a branch lives, the more it drifts from main and the nastier the merge. Days, not weeks. If it must live long, merge main into it regularly.',
              },
            },
          ],
        },
      ],
    },
    {
      id: 'gh-pr',
      title: 'Pull requests & code review',
      minutes: 9,
      summary: 'The craft of proposing changes — and reviewing others\u2019 kindly.',
      tryIt: ['github-flow'],
      links: [{ to: '/track/github/gh-issues', label: 'Next: issues & projects' }],
      sections: [
        {
          id: 'pr-craft',
          title: 'PRs are conversations',
          blocks: [
            {
              kind: 'list',
              items: [
                '**Small beats big.** A 200-line PR gets thorough review; a 2,000-line PR gets a rubber stamp.',
                '**Describe the why.** Link the issue, screenshot UI changes, explain trade-offs in the description.',
                '**Draft early.** Open a draft PR to share work-in-progress and let CI run while you finish.',
              ],
            },
            {
              kind: 'prose',
              text: 'Reviewing is a craft too. Comment on code, not people — “this loop could run away on empty input?” lands better than “you wrote a bug”. Approve when it is good **enough**; perfection is a habit, not a gate. Ask questions before prescribing; label nitpicks as nitpicks.',
            },
            {
              kind: 'callout',
              callout: {
                kind: 'tip',
                title: 'Review your own PR first',
                body: 'Read the diff once before requesting review. You will catch half the comments yourself — and reviewers will trust your PRs more.',
              },
            },
            {
              kind: 'heading',
              text: 'Branch protection & rulesets',
            },
            {
              kind: 'prose',
              text: 'On GitHub, protect `main` with a **ruleset** (Settings → Rules → Rulesets, which has replaced classic branch protection). Typical rules: require a PR, require at least one approval, require status checks (CI must pass), block force pushes, and optionally require signed commits. A `CODEOWNERS` file (`/.github/CODEOWNERS`) auto-requests the right reviewers per path.',
            },
            {
              kind: 'code',
              lang: 'bash',
              title: '.github/CODEOWNERS',
              code: `# .github/CODEOWNERS — request review from the right team
*              @octocat/docs-team
/src/payments/  @octocat/payments-team
*.yml           @octocat/devops-team`,
            },
            {
              kind: 'callout',
              callout: {
                kind: 'best-practice',
                title: 'Small PRs, fast reviews',
                body: 'Keep PRs under ~300 lines and focused on one concern. Smaller PRs get reviewed faster, catch more bugs, and are easier to revert. Draft PRs let CI run early without requesting review.',
              },
            },
          ],
        },
      ],
    },
    {
      id: 'gh-issues',
      title: 'Issues, labels & projects',
      minutes: 6,
      summary: 'Where work is discussed, triaged and tracked.',
      tryIt: [],
      links: [{ to: '/track/github/gh-cli', label: 'Next: GitHub CLI' }],
      sections: [
        {
          id: 'issues',
          title: 'The to-do list of a project',
          blocks: [
            {
              kind: 'prose',
              text: 'An **issue** is one unit of work: a bug report, a feature idea, a question. **Labels** triage them (bug, enhancement, good-first-issue). **Assignees** own them. **Milestones** group them toward releases, and Projects board them kanban-style. Mention an issue in a commit (`fix: handle empty input (#42)`) and GitHub links them automatically — closing keywords like “fixes #42” in a PR description close the issue on merge.',
            },
            {
              kind: 'callout',
              callout: {
                kind: 'best-practice',
                title: 'One issue, one concern',
                body: '“Refactor everything” is not an issue. Split until each is discussable, testable and closeable in a single PR.',
              },
            },
          ],
        },
      ],
    },
    {
      id: 'gh-cli',
      title: 'GitHub CLI (gh)',
      minutes: 7,
      summary: 'Do GitHub without leaving the terminal: create PRs, check CI, and manage issues with gh.',
      tryIt: [],
      links: [{ to: '/track/github/gh-actions', label: 'Next: GitHub Actions' }],
      sections: [
        {
          id: 'gh-cli-intro',
          title: 'gh — GitHub in the terminal',
          blocks: [
            {
              kind: 'prose',
              text: '**GitHub CLI (`gh`)** is the official command-line companion to `git`. Where `git` manages snapshots and branches locally, `gh` manages PRs, issues, and workflow runs on GitHub — without opening a browser.',
            },
            {
              kind: 'code',
              lang: 'bash',
              title: 'everyday gh commands',
              code: `gh auth login                    # one-time browser login (SSH or HTTPS)
gh repo view --web              # open current repo on GitHub
gh pr create --fill             # create a PR from current branch
gh pr view --web                # open your PR in browser
gh pr checks                    # see CI status without leaving the shell
gh issue create --title "Bug: ..." --body "Steps to reproduce..."
gh issue list --search "assignee:@me state:open"`,
            },
            {
              kind: 'callout',
              callout: {
                kind: 'tip',
                title: 'The combo to remember',
                body: '`git switch -c feature/x` → commit → `git push -u origin feature/x` → `gh pr create --fill` is the fastest GitHub Flow loop. Add `gh pr merge --squash --delete-branch` to finish without touching the web UI.',
              },
            },
            {
              kind: 'prose',
              text: 'Install via the [official instructions](https://cli.github.com) (winget, brew, apt). Run `gh --help` — almost every GitHub concept (repo, pr, issue, release, workflow run) has a subcommand.',
            },
          ],
        },
      ],
    },
    {
      id: 'gh-actions',
      title: 'GitHub Actions in 10 minutes',
      minutes: 8,
      summary: 'CI that runs on every push: lint, test, build.',
      tryIt: [],
      links: [{ to: '/track/habits/hb-commit-style', label: 'Next track: pro habits' }],
      sections: [
        {
          id: 'ci',
          title: 'Your first workflow',
          blocks: [
            {
              kind: 'prose',
              text: 'Actions runs jobs on GitHub\u2019s machines when events happen: a push, a PR, a schedule. Workflows are YAML files in `.github/workflows/`. A minimal CI checks out the code and runs your tests on every push:',
            },
            {
              kind: 'code',
              lang: 'yaml',
              title: '.github/workflows/ci.yml',
              code: `name: CI
on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci
      - run: npm test`,
            },
            {
              kind: 'callout',
              callout: {
                kind: 'info',
                title: 'PRs get the green check',
                body: 'With this file, every pull request shows a passing/failing CI check. Required status checks can block merging broken code — the cheapest safety net a team can install.',
              },
            },
            {
              kind: 'callout',
              callout: {
                kind: 'warning',
                title: 'Secrets stay in settings',
                body: 'Never hardcode tokens in workflow files. GitHub repo **Settings → Secrets and variables → Actions** injects them as environment variables; the UI also warns when a pushed file looks like a credential.',
              },
            },
          ],
        },
      ],
    },
  ],
}
