import { FC, useEffect, useState } from 'react'
import { MiniAppProvider } from './MiniAppProvider'
import { MiniAppRouterProvider } from './MiniAppRouter'
import { MiniAppSpec } from './MiniAppSpec'

const initializedSet = new WeakSet<MiniAppSpec>()

export interface MiniAppPage {
  /**
   * A Mini App object created by `createMiniApp`.
   */
  miniApp: MiniAppSpec
}

/**
 * Renders a Mini App
 */
export const MiniAppPage: FC<MiniAppPage> = (props) => {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    if (!initializedSet.has(props.miniApp)) {
      initializedSet.add(props.miniApp)
      props.miniApp.onInitialize?.()
    }
    setMounted(true)
  }, [props.miniApp])
  if (!mounted) {
    return null
  }
  return (
    <>
      <MiniAppProvider>
        <MiniAppRouterProvider router={props.miniApp.router} />
      </MiniAppProvider>
    </>
  )
}
