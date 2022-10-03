import { MiniAppRouter } from './MiniAppRouter'

export interface MiniAppSpec {
  router: MiniAppRouter
  onInitialize?: () => void
}
