# GitQuest

Learn **Git**, **Git Bash** and **GitHub** by doing — interactive lessons, a browser-based terminal sandbox, and quizzes. No account, no setup. Content follows the [Pro Git book](https://git-scm.com/book/en/v2) and [GitHub Docs](https://docs.github.com).

## Features

- **4 tracks / 19 lessons** — Shell Basics · Git Foundations · GitHub · Pro Habits
- **Terminal sandbox** — ~30 commands (`git`, `ls`, `grep`, etc.) + 6 guided scenarios (first repo, branch & merge, GitHub Flow, undo, conflicts, `.gitignore`)
- **Cheat sheet, quizzes, glossary** — searchable, copyable, with saved scores
- **Progress in `localStorage`** — lessons, quiz scores, and milestones persist locally. Dark & light themes.

## Requirements

Node.js 18+

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Type-check + production build → `dist/` |
| `npm run preview` | Serve the production build |
| `npm run typecheck` | `tsc -b` |
| `npm run test` | Vitest (engine unit tests) |

## Project structure

```
src/
  data/
    tracks/{shell,git,github,habits}.ts  # lessons
    scenarios.ts                          # sandbox missions
    cheatsheet.ts  quizzes.ts  glossary.ts  resources.ts
  features/terminal/engine/               # virtual FS + simulated git
  lib/progress.ts                         # zustand store (persist: gitquest-progress-v1)
  pages/  components/  App.tsx
```

## Editing content

No CMS — content is typed data, the UI adapts automatically.

**Add a lesson** — append to the relevant file in `src/data/tracks/*.ts`:

```ts
// src/data/tracks/git.ts
{ id: 'my-lesson', title: '...', minutes: 8, summary: '...', sections: [...], tryIt: ['first-repo'], links: [...] }
```

**Add a scenario** — append to `src/data/scenarios.ts`. Each step has a `goal`, `hints`, `checks` (evaluated against engine state in `src/features/terminal/engine/checks.ts`), and a `sampleCommand`.

**Cheat sheet / quizzes / glossary** — edit `src/data/cheatsheet.ts`, `quizzes.ts`, `glossary.ts` respectively.

## Deploy

`npm run build` outputs a static `dist/` — host anywhere (Netlify, Cloudflare Pages, etc.).

> GitHub Pages uses `BrowserRouter`: add a `404.html` copy of `index.html` or switch to `HashRouter` in `src/App.tsx` to avoid 404s on refresh.

## Stack

Vite 8 + React 19 + TypeScript (strict) · Tailwind CSS 4 · Zustand (persist) · Vitest
