import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/inter'
import '@fontsource-variable/space-grotesk'
import '@fontsource-variable/vazirmatn'
import 'lenis/dist/lenis.css'
import './index.css'
import App from './App'
import { addTask, completeTask } from './lib/loading'

// Loading screen progress: fonts and page assets
addTask('fonts')
addTask('page')

document.fonts.ready.then(() => completeTask('fonts'))
if (document.readyState === 'complete') completeTask('page')
else window.addEventListener('load', () => completeTask('page'), { once: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
