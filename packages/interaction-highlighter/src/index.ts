/**
 * Highlights focus and pointer interactions on the page.
 */
export function enableInteractionHighlighter() {
  const anyWindow = window as any
  const key = '__interactionHighlighterEnabled'
  if (anyWindow[key]) {
    anyWindow[key].dispose()
  }

  let disposed = false
  anyWindow[key] = {
    dispose() {
      disposed = true
    },
  }

  addEventListener(
    'focus',
    (event) => {
      if (disposed) return
      const rect = (event.target as HTMLElement)?.getBoundingClientRect?.()
      if (!rect) return
      const highlight = createHighlight(rect)
      requestAnimationFrame(() => {
        highlight.remove()
      })
    },
    true,
  )
  const map = new Map<number, Highlight>()
  addEventListener('pointerdown', (event) => {
    if (disposed) return
    const highlight = createHighlight(event)
    map.set(event.pointerId, highlight)
  })
  addEventListener('pointermove', (event) => {
    const highlight = map.get(event.pointerId)
    if (!highlight) return
    highlight.move(event)
  })
  addEventListener('pointerup', (event) => {
    const highlight = map.get(event.pointerId)
    if (!highlight) return
    highlight.remove()
    map.delete(event.pointerId)
  })
}

interface Highlight {
  remove(): void
  move(point: { clientX: number; clientY: number }): void
}
function createHighlight(rect: DOMRect | PointerEvent): Highlight {
  const el = document.createElement('div')
  el.style.position = 'fixed'
  el.style.pointerEvents = 'none'
  el.style.zIndex = '999999'
  el.style.transition =
    'opacity 0.2s ease-in-out 0.2s, transform 0.2s ease-in-out'
  if ('clientX' in rect) {
    el.style.border = '4px solid #47BFAF'
    el.style.top = `${rect.clientY - 8}px`
    el.style.left = `${rect.clientX - 8}px`
    el.style.width = `16px`
    el.style.height = `16px`
    el.style.borderRadius = '999px'
    el.style.transform = 'scale(2)'
    requestAnimationFrame(() => {
      el.style.transform = 'scale(1)'
    })
  } else {
    el.style.border = '4px solid #F68A33'
    el.style.top = `${rect.y - 6}px`
    el.style.left = `${rect.x - 6}px`
    el.style.width = `${rect.width + 12}px`
    el.style.height = `${rect.height + 12}px`
    el.style.borderRadius = '4px'
  }
  el.style.boxSizing = 'border-box'
  el.style.opacity = '1'
  document.body.appendChild(el)
  return {
    remove() {
      el.style.opacity = '0'
      setTimeout(() => {
        el.remove()
      }, 500)
    },
    move(point) {
      el.style.top = `${point.clientY - 8}px`
      el.style.left = `${point.clientX - 8}px`
    },
  }
}
