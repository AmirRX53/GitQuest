import type { Track } from '../../types'

export const shellTrack: Track = {
  id: 'shell',
  title: 'Shell Basics (Git Bash)',
  tagline: 'Own the terminal before you own Git',
  description:
    'Git Bash gives Windows a proper Unix-style shell — and every platform benefits from these basics. Navigate, inspect, and move files with confidence; these are the moves every Git workflow builds on.',
  color: 'amber',
  lessons: [
    {
      id: 'shell-what-is-gitbash',
      title: 'What is Git Bash?',
      minutes: 5,
      summary: 'Why Git on Windows ships with a mini Unix world, and when to use it.',
      tryIt: ['first-repo'],
      links: [{ to: '/track/git/git-first-repo', label: 'Start the Git track' }],
      sections: [
        {
          id: 'intro',
          title: 'One program, two jobs',
          blocks: [
            {
              kind: 'prose',
              text: 'Git began life on Linux, and its command line still speaks Unix. On Windows, **Git Bash** (part of Git for Windows) bundles Git with an emulation layer called **MINGW64** that provides a Unix-like shell: the familiar `$` prompt, forward slashes, and the standard commands you will meet in this track.',
            },
            {
              kind: 'list',
              items: [
                '**Git commands** — `git init`, `git commit`, and friends, identical on every OS.',
                '**Coreutils** — `ls`, `cp`, `mv`, `rm`, `grep`… the everyday toolkit of the shell.',
                '**A bash shell** — the scripting language that glues commands together.',
              ],
            },
            {
              kind: 'callout',
              callout: {
                kind: 'info',
                title: 'macOS and Linux users',
                body: 'Everything in this track works in Terminal (zsh/bash) as-is. Git Bash is simply Windows catching up to what Unix terminals always did.',
              },
            },
            {
              kind: 'callout',
              callout: {
                kind: 'warning',
                title: 'Line endings on Windows',
                body: 'Windows and Unix use different line endings (CRLF vs LF). Git can normalize this: `git config --global core.autocrlf true` on Windows converts to CRLF in your working files but stores LF in the repo. macOS/Linux users should use `input`. Set it once and forget it — mismatched endings show up as phantom diffs.',
              },
            },
            {
              kind: 'heading',
              text: 'Anatomy of the prompt',
            },
            {
              kind: 'demo',
              demo: {
                id: 'prompt-anatomy',
                title: 'reading the prompt',
                prompt: '~/projects/app',
                lines: [
                  { kind: 'out', text: 'user@machine MINGW64 ~/projects/app (main)' },
                  { kind: 'cmd', text: 'git status' },
                  { kind: 'out', text: 'On branch main' },
                  { kind: 'out', text: '...the (main) at the end of the prompt is the current Git branch.' },
                ],
                note: 'Many Git Bash prompts show the current branch right in the prompt — your first superpower.',
              },
            },
          ],
        },
        {
          id: 'first-steps',
          title: 'Your first commands',
          blocks: [
            {
              kind: 'prose',
              text: 'Open Git Bash and try three commands: **pwd** (print working directory — where am I?), **ls** (list files), and **cd** (change directory). That is the entire navigation model.',
            },
            {
              kind: 'demo',
              demo: {
                id: 'pwd-ls-cd',
                title: 'navigate',
                prompt: '~',
                lines: [
                  { kind: 'cmd', text: 'pwd' },
                  { kind: 'out', text: '/c/Users/you' },
                  { kind: 'cmd', text: 'cd projects' },
                  { kind: 'cmd', text: 'ls' },
                  { kind: 'out', text: 'app/  notes.txt  website/' },
                  { kind: 'cmd', text: 'cd app' },
                  { kind: 'out', text: '~/projects/app' },
                ],
              },
            },
            {
              kind: 'callout',
              callout: {
                kind: 'tip',
                title: 'Tab is your co-pilot',
                body: 'Type the first letters of a file or folder and press Tab — the shell completes it. Press Tab twice to see all options. This prevents typos in long filenames forever.',
              },
            },
            {
              kind: 'callout',
              callout: {
                kind: 'best-practice',
                title: 'History is a time machine',
                body: 'Press ↑ / ↓ to walk through previous commands, or run `history` to list them all. Re-running a complicated command is one keystroke away.',
              },
            },
          ],
        },
      ],
    },
    {
      id: 'shell-navigation',
      title: 'Paths, cd and ls, deeply',
      minutes: 7,
      summary: 'Absolute vs relative paths, ~, .., hidden files and useful ls flags.',
      tryIt: [],
      links: [{ to: '/track/shell/shell-file-ops', label: 'Next: working with files' }],
      sections: [
        {
          id: 'paths',
          title: 'Every path is a story from a starting point',
          blocks: [
            {
              kind: 'prose',
              text: 'An **absolute path** starts from the root: `/c/Users/you/projects/app`. A **relative path** starts from where you stand: `app` or `../website`. Two shorthands matter: `~` means your home directory, and `..` means the parent folder.',
            },
            {
              kind: 'demo',
              demo: {
                id: 'paths-demo',
                title: 'relative vs absolute',
                prompt: '~/projects',
                lines: [
                  { kind: 'cmd', text: 'cd /c/Users/you/projects/app' },
                  { kind: 'out', text: '# absolute — works from anywhere' },
                  { kind: 'cmd', text: 'cd ..' },
                  { kind: 'out', text: '# back up one level' },
                  { kind: 'cmd', text: 'cd ~/projects' },
                  { kind: 'out', text: '# home shortcut' },
                ],
              },
            },
            {
              kind: 'table',
              table: {
                headers: ['Command', 'What it does'],
                rows: [
                  ['ls', 'List visible files'],
                  ['ls -a', 'Also show hidden files (dotfiles like .git)'],
                  ['ls -l', 'Long format: size, date, permissions'],
                  ['ls -la', 'The classic combo — long + all'],
                  ['cd -', 'Jump to the previous directory'],
                ],
                caption: 'ls flags you will actually use',
              },
            },
            {
              kind: 'callout',
              callout: {
                kind: 'warning',
                title: 'Spaces in names',
                body: 'Quote paths containing spaces: `cd "My Project"`. Unquoted spaces mean “two arguments” to the shell.',
              },
            },
          ],
        },
      ],
    },
    {
      id: 'shell-file-ops',
      title: 'Creating, copying, moving, deleting',
      minutes: 8,
      summary: 'touch, mkdir, cp, mv, rm — and the safety habits around rm.',
      tryIt: ['gitignore'],
      links: [{ to: '/track/shell/shell-pipes', label: 'Next: pipes & redirection' }],
      sections: [
        {
          id: 'ops',
          title: 'The file manipulation six',
          blocks: [
            {
              kind: 'demo',
              demo: {
                id: 'file-ops-demo',
                title: 'everyday file work',
                prompt: '~/projects/app',
                lines: [
                  { kind: 'cmd', text: 'mkdir src docs' },
                  { kind: 'cmd', text: 'touch src/index.js README.md' },
                  { kind: 'cmd', text: 'cp README.md docs/README-backup.md' },
                  { kind: 'cmd', text: 'mv README.md INTRO.md' },
                  { kind: 'cmd', text: 'rm docs/README-backup.md' },
                  { kind: 'out', text: '# careful: rm -r deletes a folder and everything inside' },
                ],
                note: 'mv does double duty: rename (mv old new) and move (mv file folder/).',
              },
            },
            {
              kind: 'callout',
              callout: {
                kind: 'warning',
                title: 'rm does not ask twice',
                body: 'There is no recycle bin. `rm -r folder` is gone-gone. The habit to build: run `ls` first to see exactly what you are about to delete, especially with wildcards like `rm *.log`.',
              },
            },
            {
              kind: 'callout',
              callout: {
                kind: 'best-practice',
                title: 'Undo safety net',
                body: 'This is exactly why Git exists: once a folder is a repository, committed files survive any rm. Version control turns “careful” into “carefree”.',
              },
            },
            {
              kind: 'heading',
              text: 'A note on permissions',
            },
            {
              kind: 'prose',
              text: 'On Unix-like shells (including Git Bash) every file has permissions — who can read, write, or execute it. `ls -l` shows them as `rwx` triplets. You rarely need `chmod` day-to-day, but one case matters for Git: executable scripts (hooks, shell scripts) need `chmod +x script.sh` or Git will track them as non-executable. Run `ls -l` after `git clone` if a script refuses to run.',
            },
            {
              kind: 'code',
              lang: 'bash',
              title: 'permissions at a glance',
              code: `ls -l script.sh
# -rw-r--r-- 1 you 4096 Apr  1 09:00 script.sh  → not executable
chmod +x script.sh
ls -l script.sh
# -rwxr-xr-x 1 you 4096 Apr  1 09:00 script.sh  → now executable`,
            },
          ],
        },
      ],
    },
    {
      id: 'shell-pipes',
      title: 'Reading files, pipes & redirection',
      minutes: 9,
      summary: 'cat, less, head/tail, > and >>, | and grep — compose small tools.',
      tryIt: [],
      links: [{ to: '/track/shell/shell-grep', label: 'Next: find & grep' }],
      sections: [
        {
          id: 'redirection',
          title: 'Streams: where output goes',
          blocks: [
            {
              kind: 'prose',
              text: 'Every command writes text to **stdout**. Redirection sends that stream into a file: `>` creates/overwrites, `>>` appends. The **pipe** `|` feeds one command\u2019s output into the next — the heart of the Unix philosophy: small tools, composed.',
            },
            {
              kind: 'demo',
              demo: {
                id: 'pipes-demo',
                title: 'redirect and pipe',
                prompt: '~/projects/app',
                lines: [
                  { kind: 'cmd', text: 'echo "v1.0" > VERSION' },
                  { kind: 'cmd', text: 'cat VERSION' },
                  { kind: 'out', text: 'v1.0' },
                  { kind: 'cmd', text: 'echo "released 2026" >> VERSION' },
                  { kind: 'cmd', text: 'history | tail -5' },
                  { kind: 'out', text: '# last 5 commands — pipe in action' },
                ],
              },
            },
            {
              kind: 'table',
              table: {
                headers: ['Command', 'Use it for'],
                rows: [
                  ['cat file', 'Dump a small file to the screen'],
                  ['less file', 'Scroll a big one (q to quit, / to search)'],
                  ['head -20 file', 'First 20 lines'],
                  ['tail -f log', 'Follow a growing log live'],
                ],
              },
            },
          ],
        },
      ],
    },
    {
      id: 'shell-grep',
      title: 'grep & find essentials',
      minutes: 8,
      summary: 'Search inside files and locate files by name — before reaching for an IDE.',
      tryIt: [],
      links: [{ to: '/track/git/git-why', label: 'Next track: Git foundations' }],
      sections: [
        {
          id: 'grep-find',
          title: 'Two searches, two questions',
          blocks: [
            {
              kind: 'prose',
              text: '**grep** answers “which files contain this text?”; **find** answers “where is the file with this name?”. Both accept patterns and both shine when piped.',
            },
            {
              kind: 'demo',
              demo: {
                id: 'grep-find-demo',
                title: 'searching',
                prompt: '~/projects/app',
                lines: [
                  { kind: 'cmd', text: 'grep -rn "TODO" src/' },
                  { kind: 'out', text: 'src/index.js:12: // TODO: validate input' },
                  { kind: 'cmd', text: 'find . -name "*.test.js"' },
                  { kind: 'out', text: './src/app.test.js' },
                ],
                note: 'grep -rn = recursive + line numbers. find . -name = search here, by name pattern.',
              },
            },
            {
              kind: 'callout',
              callout: {
                kind: 'tip',
                title: 'Combine them',
                body: '`history | grep git` finds every git command you have run. Chaining grep behind any command is a debugging superpower.',
              },
            },
          ],
        },
      ],
    },
  ],
}
