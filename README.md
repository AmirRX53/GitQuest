# GitQuest 🎮

Learn **Git**, **Git Bash** and **GitHub** by actually typing it — a free, interactive
learning app that runs entirely in your browser. No account, no setup, nothing to break.

## What's inside

| | |
|---|---|
| 🗺️ **4 learning tracks** | Shell Basics (Git Bash) · Git Foundations · Working with GitHub · Pro Habits — 19 lessons with real command examples, terminal demos, tables and callouts. |
| 💻 **Terminal sandbox** | A simulated shell with a real implementation of ~30 commands (`ls`, `grep`, `git init/add/commit/branch/merge/rebase-style undo/push/pull`…). Includes 6 guided scenarios: first repo, branch & merge, GitHub Flow, undo rescue, conflict resolution and `.gitignore`. |
| 📋 **Cheat sheet** | 62 commands, searchable, grouped by category, one-click copyable examples. |
| ❓ **Quizzes** | 4 track quizzes (17 questions) with per-answer explanations and saved best scores. |
| 📚 **Extras** | Glossary of 22 terms, curated official resources, GitHub Flow interactive diagram. |
| 💾 **Progress** | Lessons completed, quiz scores and sandbox milestones persist in `localStorage`. Dark & light themes. |

Content follows the official [Pro Git book](https://git-scm.com/book/en/v2),
[GitHub Docs](https://docs.github.com/en/get-started/using-github/github-flow) and the
[Conventional Commits](https://www.conventionalcommits.org) specification.

## Tech stack

- [Vite 8](https://vite.dev) + [React 19](https://react.dev) + TypeScript (strict)
- [Tailwind CSS 4](https://tailwindcss.com) with custom theme tokens
- [zustand](https://zustand.docs.pmnd.rs) with `persist` for progress state
- [Vitest](https://vitest.dev) — the simulated git engine is fully unit-tested

## Develop

```bash
npm install
npm run dev        # start dev server
npm run test       # run engine unit tests
npm run typecheck  # tsc -b
npm run build      # production build into dist/
npm run preview    # serve the production build
```

## Architecture notes

- `src/features/terminal/engine/` — a pure, immutable-friendly virtual filesystem +
  simulated git object model (commits as tree snapshots, branches as pointers, index,
  remotes). Scenario checks (`checks.ts`) evaluate goals against engine state, so the
  guided missions are pure data (`src/data/scenarios.ts`).
- `src/data/` — all lesson, cheat sheet, quiz and glossary content as typed data;
  add a lesson by appending to a track file, the UI adapts automatically.
- `src/lib/progress.ts` — zustand store persisted to `localStorage`
  (`gitquest-progress-v1`).

## Deploy

`npm run build` produces a static `dist/` folder — host it anywhere
(GitHub Pages, Netlify, Cloudflare Pages). For GitHub Pages + client-side routing,
add a `404.html` copy of `index.html` or switch the router to `HashRouter`.
