import { createContext, ReactNode } from 'react'

export interface MiniAppSettings {
  /**
   * When auto-resizing, how much pixels to add to the height of the iframe.
   * Defaults to 0.
   */
  heightOffset?: number

  /**
   * A function that wraps the contents of the mini-app page.
   * It will have access to MiniApp’s context and router.
   */
  wrapContents?: (contents: ReactNode) => ReactNode
}

export const MiniAppSettingsContext = createContext<MiniAppSettings>({})

/**
 * Use MiniAppSettingsProvider to provide advanced settings to the mini-app framework.
 */
export const MiniAppSettingsProvider = MiniAppSettingsContext.Provider
