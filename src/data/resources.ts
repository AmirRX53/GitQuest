export interface Resource {
  title: string
  description: string
  url: string
  kind: 'docs' | 'book' | 'practice' | 'tool'
}

export const resources: Resource[] = [
  {
    title: 'Pro Git (2nd edition) — the free official book',
    description: 'Scott Chacon & Ben Straub\u2019s complete Git book, free online in 50+ languages. Chapters 1–3 cover everything in this app.',
    url: 'https://git-scm.com/book/en/v2',
    kind: 'book',
  },
  {
    title: 'Official Git reference & docs',
    description: 'Every command, every flag, searchable. Bookmark git-scm.com/docs — you will return weekly.',
    url: 'https://git-scm.com/docs',
    kind: 'docs',
  },
  {
    title: 'GitHub Docs — Get started',
    description: 'Official GitHub quickstarts, the GitHub Flow guide and Hello World tutorial.',
    url: 'https://docs.github.com/en/get-started',
    kind: 'docs',
  },
  {
    title: 'GitHub Flow (official guide)',
    description: 'The workflow this app simulates: branch, commit, PR, review, merge.',
    url: 'https://docs.github.com/en/get-started/using-github/github-flow',
    kind: 'docs',
  },
  {
    title: 'Conventional Commits specification',
    description: 'The full spec behind the commit style taught in the Pro Habits track.',
    url: 'https://www.conventionalcommits.org/en/v1.0.0/',
    kind: 'docs',
  },
  {
    title: 'GitHub Skills',
    description: 'Free hands-on courses that run inside real GitHub repositories.',
    url: 'https://skills.github.com',
    kind: 'practice',
  },
  {
    title: 'Learn Git Branching',
    description: 'The classic interactive visualization of commits, branches and rebases.',
    url: 'https://learngitbranching.js.org',
    kind: 'practice',
  },
  {
    title: 'Oh Shit, Git!?!',
    description: 'Sensible undo recipes for the moments when things go wrong.',
    url: 'https://ohshitgit.com',
    kind: 'practice',
  },
  {
    title: 'gitignore.io',
    description: 'Generate tailored .gitignore files for any stack.',
    url: 'https://www.toptal.com/developers/gitignore',
    kind: 'tool',
  },
  {
    title: 'Semantic Versioning',
    description: 'Why feat/fix/breaking commits map to version numbers.',
    url: 'https://semver.org',
    kind: 'docs',
  },
]

export const resourceKindLabels: Record<Resource['kind'], string> = {
  docs: 'Docs',
  book: 'Book',
  practice: 'Practice',
  tool: 'Tool',
}
