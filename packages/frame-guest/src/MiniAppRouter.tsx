import {
  createHashRouter,
  RouterProvider as MiniAppRouterProvider,
  Route as MiniAppRoute,
  Link as MiniAppLink,
  RouteObject,
  createMemoryRouter,
  useLoaderData,
  useNavigate as useMiniAppNavigate,
  useSearchParams as useMiniAppSearchParams,
} from 'react-router-dom'

import { getMiniAppGuest } from './MiniAppGuest'

export {
  MiniAppRouterProvider,
  MiniAppRoute,
  MiniAppLink,
  useLoaderData,
  useMiniAppNavigate,
  useMiniAppSearchParams,
}

export type MiniAppRouter = ReturnType<typeof createMemoryRouter>

export function createMiniAppRouter(routes: RouteObject[]): MiniAppRouter {
  if (typeof window === 'undefined') {
    return createMemoryRouter(routes)
  }
  return createHashRouter(routes, {
    window: createMiniAppWindow() as Window,
  })
}

interface WindowAsUsedByHashRouter {
  history: {
    pushState: (state: any, title: string, url: string) => void
    replaceState: (state: any, title: string, url: string) => void
    go: (delta: number) => void
    state: any
  }
  location: {
    assign: (url: string) => void
    hash: string
    href: string
  }
  addEventListener: (type: string, listener: () => void) => void
  removeEventListener: (type: string, listener: () => void) => void
  document: {
    querySelector: (selector: string) => HTMLElement | null
  }
}

function createMiniAppWindow() {
  let installed = false
  const listeners = new Set<() => void>()
  const install = () => {
    installed = true
    getMiniAppGuest().on('popState', (params) => {
      fakeWindow.history.state = params.state
      fakeWindow.location.hash = params.url
      listeners.forEach((listener) => listener())
    })
  }
  const fakeWindow: WindowAsUsedByHashRouter = {
    history: {
      pushState: (state, title, url) => {
        getMiniAppGuest().notify('pushState', { state, title, url })
      },
      replaceState: (state, title, url) => {
        getMiniAppGuest().notify('replaceState', { state, title, url })
      },
      go: (delta) => {
        getMiniAppGuest().notify('go', { delta })
      },
      state: null,
    },
    location: {
      assign: (url) => {},
      get hash() {
        return getMiniAppGuest().hash
      },
      set hash(url) {
        getMiniAppGuest().hash = url
      },
      get href() {
        return getMiniAppGuest().hash
      },
      set href(url) {
        getMiniAppGuest().hash = url
      },
    },
    addEventListener: (type, listener) => {
      if (!installed) install()
      listeners.add(listener)
    },
    removeEventListener: (type, listener) => {
      listeners.delete(listener)
    },
    document: {
      querySelector: (selector) => null,
    },
  }
  return fakeWindow
}
