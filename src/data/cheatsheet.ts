import type { CheatEntry } from '../types'

export const cheatEntries: CheatEntry[] = [
  // ── Shell basics ──
  { command: 'pwd', description: 'Print the current working directory.', category: 'Shell basics', example: 'pwd' },
  { command: 'ls [-la]', description: 'List files; -a shows hidden dotfiles, -l long format.', category: 'Shell basics', example: 'ls -la' },
  { command: 'cd <dir>', description: 'Change directory. cd .. goes up, cd ~ goes home, cd - goes back.', category: 'Shell basics', example: 'cd ~/projects' },
  { command: 'mkdir <dir>', description: 'Create a directory.', category: 'Shell basics', example: 'mkdir src' },
  { command: 'touch <file>', description: 'Create an empty file (or update its timestamp).', category: 'Shell basics', example: 'touch README.md' },
  { command: 'cp <src> <dest>', description: 'Copy files or directories (add -r for folders).', category: 'Shell basics', example: 'cp config.json config.bak.json' },
  { command: 'mv <src> <dest>', description: 'Move or rename.', category: 'Shell basics', example: 'mv draft.md notes/draft.md' },
  { command: 'rm [-r] <file>', description: 'Delete permanently — no trash bin. -r for directories.', category: 'Shell basics', example: 'rm -r build/' },
  { command: 'cat <file>', description: 'Print a file to the screen.', category: 'Shell basics', example: 'cat VERSION' },
  { command: 'less <file>', description: 'Scroll through a file (q quits, / searches).', category: 'Shell basics', example: 'less package.json' },
  { command: 'echo', description: 'Print text; with > or >> writes into a file.', category: 'Shell basics', example: 'echo "v1" > VERSION' },
  { command: 'grep <pat> <file>', description: 'Print lines matching a pattern; -rn searches recursively with line numbers.', category: 'Shell basics', example: 'grep -rn "TODO" src/' },
  { command: 'find <dir> -name <pat>', description: 'Find files by name pattern.', category: 'Shell basics', example: 'find . -name "*.test.js"' },
  { command: '| (pipe)', description: 'Feed one command\u2019s output into the next.', category: 'Shell basics', example: 'history | grep git' },
  { command: 'history', description: 'List recent commands. ↑ / ↓ walk through them.', category: 'Shell basics', example: 'history | tail -10' },

  // ── Start & configure ──
  { command: 'git --version', description: 'Show the installed Git version.', category: 'Setup & config', example: 'git --version' },
  { command: 'git config --global user.name', description: 'Set the name stamped on your commits.', category: 'Setup & config', example: 'git config --global user.name "Ada Lovelace"' },
  { command: 'git config --global user.email', description: 'Set the commit email — match your GitHub account.', category: 'Setup & config', example: 'git config --global user.email "ada@example.com"' },
  { command: 'git config --global init.defaultBranch main', description: 'Make new repos start on main.', category: 'Setup & config', example: 'git config --global init.defaultBranch main' },
  { command: 'git config --global alias.<a> <cmd>', description: 'Create a shortcut, e.g. alias.st status → git st.', category: 'Setup & config', example: 'git config --global alias.st status' },
  { command: 'git init', description: 'Turn the current folder into a repository (creates .git/).', category: 'Setup & config', example: 'git init' },
  { command: 'git clone <url>', description: 'Download a repo with its full history and set origin.', category: 'Setup & config', example: 'git clone git@github.com:you/app.git' },
  { command: 'ssh-keygen -t ed25519', description: 'Generate an SSH keypair for passwordless pushes.', category: 'Setup & config', example: 'ssh-keygen -t ed25519 -C "you@example.com"' },

  // ── Everyday changes ──
  { command: 'git status', description: 'What is modified, staged, untracked — run it constantly.', category: 'Everyday changes', example: 'git status' },
  { command: 'git add <file>', description: 'Stage a file for the next commit.', category: 'Everyday changes', example: 'git add src/api.js' },
  { command: 'git add .', description: 'Stage everything in the current directory.', category: 'Everyday changes', example: 'git add .' },
  { command: 'git add -p', description: 'Stage hunk-by-hunk — the atomic commit tool.', category: 'Everyday changes', example: 'git add -p' },
  { command: 'git commit -m "<msg>"', description: 'Record staged changes with a message.', category: 'Everyday changes', example: 'git commit -m "feat: add retry logic"' },
  { command: 'git commit --amend', description: 'Fold staged changes into the last commit (unpushed only).', category: 'Everyday changes', example: 'git add typo.js && git commit --amend --no-edit' },
  { command: 'git diff', description: 'Show unstaged changes (working tree vs index).', category: 'Everyday changes', example: 'git diff' },
  { command: 'git diff --staged', description: 'Show what the next commit will contain.', category: 'Everyday changes', example: 'git diff --staged' },
  { command: 'git rm <file>', description: 'Remove a file and stage the removal.', category: 'Everyday changes', example: 'git rm old.js' },
  { command: 'git mv <from> <to>', description: 'Rename a file and stage the move.', category: 'Everyday changes', example: 'git mv util.js utils.ts' },

  // ── History & inspection ──
  { command: 'git log', description: 'Full history of the current branch.', category: 'History & inspection', example: 'git log' },
  { command: 'git log --oneline --graph --all', description: 'Compact, decorated history of every branch.', category: 'History & inspection', example: 'git log --oneline --graph --all' },
  { command: 'git show <sha>', description: 'One commit: message + full diff.', category: 'History & inspection', example: 'git show HEAD' },
  { command: 'git blame <file>', description: 'Who last changed each line, and when.', category: 'History & inspection', example: 'git blame src/api.js' },
  { command: 'git reflog', description: 'Every move HEAD made — the undo-your-undo tool.', category: 'History & inspection', example: 'git reflog' },

  // ── Branching & merging ──
  { command: 'git branch', description: 'List branches (* marks current).', category: 'Branching & merging', example: 'git branch' },
  { command: 'git branch <name>', description: 'Create a branch without switching.', category: 'Branching & merging', example: 'git branch feature/login' },
  { command: 'git switch <name>', description: 'Switch branches (the modern checkout).', category: 'Branching & merging', example: 'git switch feature/login' },
  { command: 'git switch -c <name>', description: 'Create and switch in one command.', category: 'Branching & merging', example: 'git switch -c feature/login' },
  { command: 'git merge <branch>', description: 'Integrate another branch into the current one.', category: 'Branching & merging', example: 'git merge feature/login' },
  { command: 'git branch -d <name>', description: 'Delete a merged branch.', category: 'Branching & merging', example: 'git branch -d feature/login' },
  { command: 'git stash push', description: 'Shelve uncommitted changes.', category: 'Branching & merging', example: 'git stash push -m "wip: login"' },
  { command: 'git stash pop', description: 'Restore the last stash and drop it.', category: 'Branching & merging', example: 'git stash pop' },

  // ── Remotes & GitHub ──
  { command: 'git remote add origin <url>', description: 'Register a remote named origin.', category: 'Remotes & GitHub', example: 'git remote add origin git@github.com:you/app.git' },
  { command: 'git remote -v', description: 'List configured remotes.', category: 'Remotes & GitHub', example: 'git remote -v' },
  { command: 'git push -u origin <branch>', description: 'Publish a branch and set its upstream.', category: 'Remotes & GitHub', example: 'git push -u origin main' },
  { command: 'git push', description: 'Upload local commits to the upstream remote.', category: 'Remotes & GitHub', example: 'git push' },
  { command: 'git fetch', description: 'Download remote work without merging.', category: 'Remotes & GitHub', example: 'git fetch' },
  { command: 'git pull', description: 'Fetch + integrate (merge) remote changes.', category: 'Remotes & GitHub', example: 'git pull' },
  { command: 'git tag -a <name>', description: 'Annotate the current commit as a release.', category: 'Remotes & GitHub', example: 'git tag -a v1.0.0 -m "First release"' },

  // ── Undo & rescue ──
  { command: 'git restore <file>', description: 'Discard unstaged edits to a file.', category: 'Undo & rescue', example: 'git restore config.txt' },
  { command: 'git restore --staged <file>', description: 'Unstage a file, keep the edits.', category: 'Undo & rescue', example: 'git restore --staged src/api.js' },
  { command: 'git reset --soft HEAD~1', description: 'Uncommit the last commit, keep changes staged.', category: 'Undo & rescue', example: 'git reset --soft HEAD~1' },
  { command: 'git reset --hard <sha>', description: 'Move branch and wipe working tree to match a commit.', category: 'Undo & rescue', example: 'git reset --hard origin/main' },
  { command: 'git revert <sha>', description: 'Undo a pushed commit with a new inverse commit.', category: 'Undo & rescue', example: 'git revert a1b2c3d' },
  { command: 'git commit --amend (msg)', description: 'Reword the last unpushed commit.', category: 'Undo & rescue', example: 'git commit --amend -m "feat: better message"' },
  { command: 'git rebase -i HEAD~n', description: 'Interactively reword/squash/reorder the last n commits.', category: 'Undo & rescue', example: 'git rebase -i HEAD~3' },
  { command: 'git merge --abort', description: 'Back out of a conflicted merge entirely.', category: 'Undo & rescue', example: 'git merge --abort' },
  { command: 'git bisect', description: 'Binary-search history for the commit that broke something.', category: 'Undo & rescue', example: 'git bisect start HEAD v1.0' },
]
