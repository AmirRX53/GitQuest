import { useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import type { JSX } from 'react'
import { Layout } from './components/layout/Layout'
import { HomePage } from './pages/Home'
import { TrackPage, TracksPage } from './pages/Tracks'
import { LessonPage } from './pages/Lesson'
import { SandboxPage } from './pages/Sandbox'
import { CheatsheetPage } from './pages/Cheatsheet'
import { QuizPage, QuizzesPage } from './pages/Quiz'
import { GlossaryPage, NotFoundPage, ResourcesPage } from './pages/Reference'

/** Re-mounts page content on every route change so the enter animation plays. */
function AnimatedRoutes(): JSX.Element {
  const location = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])
  return (
    <div key={location.pathname} className="animate-page-in">
      <Routes location={location}>
        <Route path="/" element={<HomePage />} />
        <Route path="/tracks" element={<TracksPage />} />
        <Route path="/track/:trackId" element={<TrackPage />} />
        <Route path="/lesson/:lessonId" element={<LessonPage />} />
        <Route path="/sandbox" element={<SandboxPage />} />
        <Route path="/sandbox/:scenarioId" element={<SandboxPage />} />
        <Route path="/cheatsheet" element={<CheatsheetPage />} />
        <Route path="/quizzes" element={<QuizzesPage />} />
        <Route path="/quiz/:quizId" element={<QuizPage />} />
        <Route path="/glossary" element={<GlossaryPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  )
}

export default function App(): JSX.Element {
  return (
    <BrowserRouter>
      <Layout>
        <AnimatedRoutes />
      </Layout>
    </BrowserRouter>
  )
}

