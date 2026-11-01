import { useCallback, useEffect, useState } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { LanguageProvider } from './i18n/LanguageContext'
import { SmoothScroll } from './components/SmoothScroll'
import { TransitionProvider } from './components/Transition'
import { Header } from './components/Header'
import { Cursor } from './components/Cursor'
import { Loader } from './components/Loader'
import { AppContext } from './AppContext'
import { ScrollTrigger } from './lib/gsap'
import Home from './pages/Home'
import ProjectPage from './pages/ProjectPage'
import NotFound from './pages/NotFound'

export default function App() {
  const [loaded, setLoaded] = useState(false)
  const onLoaded = useCallback(() => setLoaded(true), [])

  // Layout can shift once fonts have swapped in — re-measure scroll triggers
  useEffect(() => {
    if (loaded) ScrollTrigger.refresh()
  }, [loaded])

  return (
    <HashRouter>
      <LanguageProvider>
        <SmoothScroll>
          <TransitionProvider>
            <AppContext.Provider value={{ loaded }}>
              <Header />
              <main id="main">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/work/:id" element={<ProjectPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Cursor />
              <div className="grain" aria-hidden />
              <Loader onDone={onLoaded} />
            </AppContext.Provider>
          </TransitionProvider>
        </SmoothScroll>
      </LanguageProvider>
    </HashRouter>
  )
}
