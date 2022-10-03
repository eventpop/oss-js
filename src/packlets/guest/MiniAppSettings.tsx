import { createContext, ReactNode } from 'react'

export interface MiniAppSettings {
  heightOffset?: number
  wrapContents?: (contents: ReactNode) => ReactNode
}

export const MiniAppSettingsContext = createContext<MiniAppSettings>({})

export const MiniAppSettingsProvider = MiniAppSettingsContext.Provider
