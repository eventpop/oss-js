import React from 'react'
import ReactDOM from 'react-dom/client'
import { enableInteractionHighlighter } from '@eventpop-oss/interaction-highlighter'
import { MiniAppDemo } from './MiniAppDemo'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <MiniAppDemo />
  </React.StrictMode>,
)

if (navigator.userAgent.includes('Playwright/')) {
  enableInteractionHighlighter()
}
