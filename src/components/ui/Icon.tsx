import type { JSX } from 'react'

const paths: Record<string, JSX.Element> = {
  terminal: (
    <path d="M4 17l6-5-6-5M12 19h8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  ),
  book: (
    <path
      d="M4 19.5A2.5 2.5 0 016.5 17H20V4a2 2 0 00-2-2H6.5A2.5 2.5 0 004 4.5v15zM4 19.5A2.5 2.5 0 006.5 22H20v-5"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  ),
  branch: (
    <>
      <circle cx="6" cy="6" r="2.2" strokeWidth="2" fill="none" />
      <circle cx="6" cy="18" r="2.2" strokeWidth="2" fill="none" />
      <circle cx="18" cy="8" r="2.2" strokeWidth="2" fill="none" />
      <path d="M6 8.2v7.6M18 10.2c0 3-2 4.3-5 4.8" strokeWidth="2" strokeLinecap="round" fill="none" />
    </>
  ),
  github: (
    <path
      d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.63.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.36 1.12 2.94.86.09-.67.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05a9.3 9.3 0 015 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.49A10.03 10.03 0 0022 12.25C22 6.58 17.52 2 12 2z"
      fill="currentColor"
      stroke="none"
    />
  ),
  chevron: <path d="M9 6l6 6-6 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />,
  check: <path d="M5 13l4 4L19 7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />,
  x: <path d="M6 6l12 12M18 6L6 18" strokeWidth="2.5" strokeLinecap="round" fill="none" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" strokeWidth="2" fill="none" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  moon: <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" strokeWidth="2" fill="none" />
      <path d="M21 21l-4.3-4.3" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  play: <path d="M8 5v14l11-7z" fill="currentColor" stroke="none" />,
  refresh: <path d="M21 12a9 9 0 11-2.6-6.4M21 3v6h-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />,
  copy: (
    <>
      <rect x="9" y="9" width="12" height="12" rx="2" strokeWidth="2" fill="none" />
      <path d="M5 15V5a2 2 0 012-2h10" strokeWidth="2" strokeLinecap="round" fill="none" />
    </>
  ),
  lightbulb: (
    <>
      <path d="M9 18h6M10 21h4" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 3a6 6 0 00-4 10.5c.7.6 1 1.5 1 2.5h6c0-1 .3-1.9 1-2.5A6 6 0 0012 3z" strokeWidth="2" strokeLinejoin="round" fill="none" />
    </>
  ),
  warning: (
    <>
      <path d="M12 3L2 20h20L12 3z" strokeWidth="2" strokeLinejoin="round" fill="none" />
      <path d="M12 10v4M12 17.5v.5" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" strokeWidth="2" fill="none" />
      <path d="M12 11v5M12 8v.5" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  award: (
    <>
      <circle cx="12" cy="9" r="6" strokeWidth="2" fill="none" />
      <path d="M9 14l-1.5 7L12 18.5 16.5 21 15 14" strokeWidth="2" strokeLinejoin="round" fill="none" />
    </>
  ),
  graduation: (
    <path d="M12 3L2 8l10 5 10-5-10-5zM5 10.5V15c0 1.5 3 3 7 3s7-1.5 7-3v-4.5" strokeWidth="2" strokeLinejoin="round" fill="none" strokeLinecap="round" />
  ),
  layers: (
    <>
      <path d="M12 2L2 8l10 6 10-6-10-6z" strokeWidth="2" strokeLinejoin="round" fill="none" />
      <path d="M2 13l10 6 10-6" strokeWidth="2" strokeLinejoin="round" fill="none" />
    </>
  ),
  clipboard: (
    <>
      <rect x="6" y="4" width="12" height="17" rx="2" strokeWidth="2" fill="none" />
      <path d="M9 4a2 2 0 012-2h2a2 2 0 012 2v1H9V4z" strokeWidth="2" fill="none" />
    </>
  ),
  quiz: (
    <>
      <circle cx="12" cy="12" r="9" strokeWidth="2" fill="none" />
      <path d="M9.5 9a2.5 2.5 0 114 2c-.8.6-1.5 1-1.5 2M12 16.5v.5" strokeWidth="2" strokeLinecap="round" fill="none" />
    </>
  ),
  map: (
    <>
      <path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z" strokeWidth="2" strokeLinejoin="round" fill="none" />
      <path d="M9 4v14M15 6v14" strokeWidth="2" />
    </>
  ),
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />,
  external: (
    <>
      <path d="M14 4h6v6M20 4l-9 9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M19 13v6a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1h6" strokeWidth="2" strokeLinecap="round" fill="none" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" strokeWidth="2" fill="none" />
      <path d="M12 7v5l3 2" strokeWidth="2" strokeLinecap="round" fill="none" />
    </>
  ),
  home: <path d="M3 11l9-8 9 8M5 9.5V21h14V9.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />,
  trash: <path d="M4 7h16M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2M6 7l1 13h10l1-13M10 11v6M14 11v6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />,
  undo: <path d="M9 14L4 9l5-5M4 9h10a6 6 0 016 6v1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />,
}

export type IconName = keyof typeof paths

interface IconProps {
  name: IconName
  className?: string
}

export function Icon({ name, className = 'h-5 w-5' }: IconProps): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" stroke="currentColor">
      {paths[name]}
    </svg>
  )
}
