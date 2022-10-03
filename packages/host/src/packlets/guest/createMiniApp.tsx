import { RouteObject } from 'react-router-dom'
import { createMiniAppRouter } from './MiniAppRouter'
import { MiniAppSpec } from './MiniAppSpec'

/**
 * Creates a Mini App. The created Mini App can be rendered with `<MiniAppPage />`.
 */
export function createMiniApp(options: MiniAppOptions): MiniAppSpec {
  return {
    router: createMiniAppRouter(options.routes),
    onInitialize: options.onInitialize,
  }
}

interface MiniAppOptions {
  /**
   * The routes that will be exposed in the Mini App.
   * Each element is a React Router v6.4 route object.
   *
   * A Mini App has its own router that can synchronize with the parent page’s history.
   */
  routes: RouteObject[]

  /**
   * Code to run when the Mini-App is being initialized (before rendered).
   */
  onInitialize?: () => void
}
