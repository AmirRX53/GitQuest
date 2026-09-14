import type { Quiz } from '../types'

export const quizzes: Quiz[] = [
  {
    id: 'quiz-shell',
    track: 'shell',
    title: 'Shell basics check',
    questions: [
      {
        id: 'sh-q1',
        prompt: 'You are deep inside nested folders. Which command prints where you are?',
        options: [
          { label: 'pwd', correct: true },
          { label: 'ls' },
          { label: 'cd' },
          { label: 'where' },
        ],
        explanation: 'pwd = print working directory. ls lists contents, cd moves elsewhere.',
      },
      {
        id: 'sh-q2',
        prompt: 'Which command lists files including hidden ones like .gitignore?',
        code: 'ls -?',
        options: [
          { label: 'ls -a', correct: true },
          { label: 'ls -h' },
          { label: 'ls all' },
          { label: 'dir /hidden' },
        ],
        explanation: 'Hidden (dot) files need the -a flag: ls -a, or ls -la for the long format.',
      },
      {
        id: 'sh-q3',
        prompt: 'What does the following produce?',
        code: 'echo "hello" > notes.txt',
        options: [
          { label: 'Creates notes.txt containing "hello" (overwrites)', correct: true },
          { label: 'Appends "hello" to notes.txt' },
          { label: 'Prints "hello" and ignores notes.txt' },
          { label: 'Errors — echo cannot write files' },
        ],
        explanation: '> redirects stdout into a file, overwriting it. >> appends instead.',
      },
      {
        id: 'sh-q4',
        prompt: 'Which is the safest sequence before running rm -r build/?',
        options: [
          { label: 'ls build/ — confirm it is what you think, then delete', correct: true },
          { label: 'rm -r build/ twice for certainty' },
          { label: 'mv build/ build2/ instead' },
          { label: 'Nothing — rm has an undo flag' },
        ],
        explanation: 'rm is permanent. Looking before deleting (ls) is the habit; Git protects tracked files, but untracked files are gone forever.',
      },
    ],
  },
  {
    id: 'quiz-git',
    track: 'git',
    title: 'Git foundations check',
    questions: [
      {
        id: 'g-q1',
        prompt: 'What is the staging area for?',
        options: [
          { label: 'Drafting exactly which changes go into the next commit', correct: true },
          { label: 'Storing deleted files until you empty it' },
          { label: 'A backup of the remote repository' },
          { label: 'A queue of commands waiting to run' },
        ],
        explanation: 'The index lets you compose a commit deliberately — stage some changes, leave others for later commits.',
      },
      {
        id: 'g-q2',
        prompt: 'A file shows under "Untracked files" in git status. What does that mean?',
        options: [
          { label: 'Git sees the file but is not recording it yet', correct: true },
          { label: 'The file is staged and ready to commit' },
          { label: 'The file is corrupted' },
          { label: 'The file is ignored by .gitignore' },
        ],
        explanation: 'Untracked = present in the working directory, unknown to Git. git add starts tracking it.',
      },
      {
        id: 'g-q3',
        prompt: 'What does this sequence do?',
        code: 'git reset --soft HEAD~1',
        options: [
          { label: 'Moves the branch back one commit, keeping the changes staged', correct: true },
          { label: 'Deletes the last commit and all its changes permanently' },
          { label: 'Restores the working directory from HEAD' },
          { label: 'Reverts the last pushed commit safely' },
        ],
        explanation: '--soft keeps the index and working tree — perfect for "I committed too early". Use revert instead once a commit is pushed.',
      },
      {
        id: 'g-q4',
        prompt: 'Two branches edited the same line. What happens on git merge?',
        options: [
          { label: 'Git writes conflict markers and waits for you to resolve', correct: true },
          { label: 'Git overwrites with the current branch\u2019s version silently' },
          { label: 'Git refuses and deletes the other branch' },
          { label: 'Git opens a pull request automatically' },
        ],
        explanation: 'The file gets <<<<<<< ======= >>>>>>> markers. Edit to the final version, git add, and commit to finish the merge.',
      },
      {
        id: 'g-q5',
        prompt: 'Which pair best describes how changes reach history?',
        options: [
          { label: 'git add → git commit', correct: true },
          { label: 'git commit → git push → git add' },
          { label: 'git stage → git push' },
          { label: 'git save → git sync' },
        ],
        explanation: 'Stage (add) builds the draft commit; commit records it. Push is a separate, later step to a remote.',
      },
    ],
  },
  {
    id: 'quiz-github',
    track: 'github',
    title: 'GitHub workflow check',
    questions: [
      {
        id: 'gh-q1',
        prompt: 'Put the GitHub Flow in order:',
        options: [
          { label: 'Branch → Commit → Pull request → Review → Merge', correct: true },
          { label: 'Pull request → Branch → Merge → Commit' },
          { label: 'Commit to main → Branch → Review → Revert' },
          { label: 'Fork → Rebase → Force push → Deploy' },
        ],
        explanation: 'The official flow: branch off main, commit, open a PR, discuss and review, merge, delete the branch.',
      },
      {
        id: 'gh-q2',
        prompt: 'What is the first push of a new branch usually missing without -u?',
        options: [
          { label: 'An upstream link to the remote branch', correct: true },
          { label: 'A pull request' },
          { label: 'A tag' },
          { label: 'A commit message' },
        ],
        explanation: 'git push -u origin <branch> publishes and records the upstream, so later bare git push works.',
      },
      {
        id: 'gh-q3',
        prompt: 'What does "main is always deployable" imply in GitHub Flow?',
        options: [
          { label: 'All work happens on branches, merged via reviewed PRs', correct: true },
          { label: 'Everyone commits directly to main' },
          { label: 'main is rebuilt once a month' },
          { label: 'main cannot have CI' },
        ],
        explanation: 'That single rule drives the whole flow: protect main, branch for changes, review through PRs.',
      },
      {
        id: 'gh-q4',
        prompt: 'Where should an API token used by CI live?',
        options: [
          { label: 'GitHub Actions secrets / environment variables', correct: true },
          { label: 'A committed config.json' },
          { label: 'A comment in the workflow YAML' },
          { label: 'The README, but encoded' },
        ],
        explanation: 'Secrets go in repo settings and are injected as env vars. Anything committed is public forever and must be rotated.',
      },
    ],
  },
  {
    id: 'quiz-habits',
    track: 'habits',
    title: 'Pro habits check',
    questions: [
      {
        id: 'h-q1',
        prompt: 'Which commit message follows Conventional Commits?',
        options: [
          { label: 'fix(cart): stop total from going negative', correct: true },
          { label: 'Fixed the cart bug finally!!' },
          { label: 'misc updates' },
          { label: 'WIP' },
        ],
        explanation: 'type(scope): description — fix is the type for bug fixes; the subject stays imperative and specific.',
      },
      {
        id: 'h-q2',
        prompt: 'A teammate pushed a broken commit to main. What is the cleanest shared-history fix?',
        options: [
          { label: 'git revert <sha> and push', correct: true },
          { label: 'git reset --hard HEAD~1 && git push --force' },
          { label: 'Delete the repository and re-clone' },
          { label: 'Edit the commit message on GitHub' },
        ],
        explanation: 'Revert appends an inverse commit — no history rewriting, everyone\u2019s clone stays valid. Force-pushing main destroys collaborators\u2019 work.',
      },
      {
        id: 'h-q3',
        prompt: 'You ran git reset --hard and "lost" three commits. First tool to reach for?',
        options: [
          { label: 'git reflog', correct: true },
          { label: 'git push' },
          { label: 'rm -rf .git' },
          { label: 'Re-clone from GitHub' },
        ],
        explanation: 'reflog records every position HEAD has held. Find the commit id there and git reset --hard <id> — commits are almost never truly gone.',
      },
      {
        id: 'h-q4',
        prompt: 'What makes a commit "atomic"?',
        options: [
          { label: 'It does one logical thing and passes tests on its own', correct: true },
          { label: 'It contains exactly one line change' },
          { label: 'It is committed within one minute' },
          { label: 'It has no message' },
        ],
        explanation: 'Atomic = single-purpose and self-consistent, which is what makes revert, bisect and review all work.',
      },
    ],
  },
]
