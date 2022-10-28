import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { enableInteractionHighlighter } from '@eventpop-oss/interaction-highlighter'
import 'bootstrap/dist/css/bootstrap.min.css'

const demos = new Map(
  Object.entries(import.meta.glob('./*.demo.tsx')).map(([path, module]) => {
    const name = path.replace(/^\.\//, '').replace(/\.demo\.tsx$/, '')
    return [name, lazy(module as any)] as const
  }),
)

function Demo() {
  const demo = new URLSearchParams(location.search).get('demo')
  const Demo = demo && demos.get(demo)
  if (Demo) {
    return (
      <Suspense fallback={<div>Loading demo “{demo}”...</div>}>
        <Demo />
      </Suspense>
    )
  }
  return (
    <>
      <h1>Select a demo</h1>
      <ul>
        {Array.from(demos.keys()).map((name) => (
          <li key={name}>
            <a href={`?demo=${encodeURIComponent(name)}`}>{name}</a>
          </li>
        ))}
      </ul>
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Demo />
  </React.StrictMode>,
)

if (navigator.userAgent.includes('Playwright/')) {
  enableInteractionHighlighter()
}
