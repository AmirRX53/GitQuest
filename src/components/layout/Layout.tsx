import { useEffect } from 'react'
import type { JSX, ReactNode } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useProgress } from '../../lib/progress'
import { cx } from '../../lib/utils'
import { Icon } from '../ui/Icon'

const navItems = [
  { to: '/', label: 'Home', icon: 'home' as const },
  { to: '/tracks', label: 'Tracks', icon: 'map' as const },
  { to: '/sandbox', label: 'Sandbox', icon: 'terminal' as const },
  { to: '/cheatsheet', label: 'Cheat sheet', icon: 'clipboard' as const },
  { to: '/quizzes', label: 'Quizzes', icon: 'quiz' as const },
  { to: '/glossary', label: 'Glossary', icon: 'book' as const },
  { to: '/resources', label: 'Resources', icon: 'external' as const },
]

export function Layout({ children }: { children: ReactNode }): JSX.Element {
  const dark = useProgress((s) => s.dark)
  const toggleDark = useProgress((s) => s.toggleDark)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', dark)
    root.classList.toggle('light', !dark)
  }, [dark])

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/85 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/85">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-600 text-white shadow-lg shadow-accent-600/30">
              <Icon name="branch" className="h-4.5 w-4.5" />
            </span>
            <span className="text-lg tracking-tight">GitQuest</span>
          </Link>
          <nav aria-label="Main" className="ml-auto hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  cx(
                    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-accent-500/10 text-accent-600 dark:text-accent-300'
                      : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <button
            type="button"
            onClick={toggleDark}
            className="ml-auto rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 md:ml-0 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <Icon name={dark ? 'sun' : 'moon'} />
          </button>
        </div>
        {/* Mobile nav */}
        <nav aria-label="Mobile" className="flex gap-1 overflow-x-auto border-t border-zinc-200 px-3 py-2 md:hidden dark:border-zinc-800">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cx(
                  'shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium',
                  isActive ? 'bg-accent-500/10 text-accent-600 dark:text-accent-300' : 'text-zinc-500 dark:text-zinc-400',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">{children}</main>
      <footer className="border-t border-zinc-200 py-8 dark:border-zinc-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-4 text-center text-sm text-zinc-500 sm:px-6 dark:text-zinc-400">
          <p>
            GitQuest — learn Git, Git Bash and GitHub by doing. Content follows the official{' '}
            <a href="https://git-scm.com/book/en/v2" target="_blank" rel="noreferrer" className="text-accent-500 hover:underline">Pro Git</a>{' '}
            book and{' '}
            <a href="https://docs.github.com" target="_blank" rel="noreferrer" className="text-accent-500 hover:underline">GitHub Docs</a>.
          </p>
          <p className="text-xs">Progress lives only in your browser. Nothing to break, nothing to lose.</p>
        </div>
      </footer>
    </div>
  )
}
