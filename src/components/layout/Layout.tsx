import { useEffect, useState } from 'react'
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

function ScrollToTop(): JSX.Element | null {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <button
      type="button"
      aria-label="Scroll to top"
      aria-hidden={!visible}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={cx(
        'fixed bottom-6 right-6 z-40 inline-flex h-10 w-10 items-center justify-center rounded-full',
        'bg-accent-600 text-white shadow-md shadow-accent-600/25 ring-1 ring-accent-600/20',
        'transition-all duration-200 hover:bg-accent-700 hover:shadow-lg hover:shadow-accent-600/30 hover:shadow-accent-600/25',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950',
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0',
      )}
    >
      <Icon name="arrowUp" className="h-5 w-5" />
    </button>
  )
}

function AmbientGlow(): JSX.Element {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Light mode: very soft violet washes */}
      <div className="glow-orb animate-glow-drift hidden dark:hidden h-[520px] w-[680px] bg-accent-500/10 sm:block" style={{ left: '-8%', top: '-10%' }} />
      <div className="glow-orb animate-glow-drift hidden dark:hidden h-[460px] w-[560px] bg-violet-400/10 sm:block" style={{ right: '-6%', top: '18%', animationDelay: '1.2s' }} />
      {/* Dark mode: richer glows */}
      <div className="glow-orb animate-glow-drift hidden h-[620px] w-[780px] bg-accent-600/20 dark:block" style={{ left: '-10%', top: '-14%' }} />
      <div className="glow-orb animate-glow-drift hidden h-[520px] w-[640px] bg-violet-500/15 dark:block" style={{ right: '-8%', top: '16%', animationDelay: '1.1s' }} />
      <div className="glow-orb animate-glow-pulse hidden h-[380px] w-[520px] bg-accent-500/10 dark:block" style={{ left: '22%', top: '42%', animationDelay: '0.6s' }} />
      {/* Subtle grid sheen */}
      <div className="absolute inset-0 opacity-[0.035] dark:opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(139 92 246) 1px, transparent 0)', backgroundSize: '28px 28px' }} />
    </div>
  )
}

export function Layout({ children }: { children: ReactNode }): JSX.Element {
  const dark = useProgress((s) => s.dark)
  const toggleDark = useProgress((s) => s.toggleDark)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', dark)
    root.classList.toggle('light', !dark)
  }, [dark])

  return (
    <div className="relative flex min-h-screen flex-col">
      <AmbientGlow />
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/85 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/85">
        {/* hairline glow under header */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent-500/30 to-transparent opacity-60 dark:via-accent-500/25" />
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Link to="/" className="group flex items-center gap-2 font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-600 text-white shadow-lg shadow-accent-600/30 transition-all group-hover:shadow-accent-600/40 group-hover:shadow-xl">
              <Icon name="branch" className="h-4.5 w-4.5 drop-shadow-[0_0_8px_rgba(255,255,255,0.55)]" />
            </span>
            <span className="text-lg tracking-tight transition-colors group-hover:text-accent-600 dark:group-hover:text-accent-300">GitQuest</span>
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
                      ? 'bg-accent-500/10 text-accent-600 shadow-[0_0_14px_rgba(139,92,246,0.22)] dark:text-accent-300'
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
                  isActive ? 'bg-accent-500/10 text-accent-600 shadow-[0_0_10px_rgba(139,92,246,0.18)] dark:text-accent-300' : 'text-zinc-500 dark:text-zinc-400',
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
            <a href="https://git-scm.com/book/en/v2" target="_blank" rel="noreferrer" className="text-accent-500 hover:text-accent-600 hover:underline dark:hover:text-accent-300">Pro Git</a>{' '}
            book and{' '}
            <a href="https://docs.github.com" target="_blank" rel="noreferrer" className="text-accent-500 hover:text-accent-600 hover:underline dark:hover:text-accent-300">GitHub Docs</a>.
          </p>
          <p className="text-xs">Progress lives only in your browser. Nothing to break, nothing to lose.</p>
        </div>
      </footer>
      <ScrollToTop />
    </div>
  )
}
