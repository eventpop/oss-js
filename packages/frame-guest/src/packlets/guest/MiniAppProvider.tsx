import { useRef, FC, ReactNode, useEffect, useContext } from 'react'
import { getMiniAppGuest } from './MiniAppGuest'
import { MiniAppSettingsContext } from './MiniAppSettings'
import { ResizeAction } from './ResizePauser'

const defaultWrapContents = (x: ReactNode) => x

export const MiniAppProvider: FC<{ children?: ReactNode }> = (props) => {
  const div = useRef<HTMLDivElement>(null)
  const settings = useContext(MiniAppSettingsContext)
  const { heightOffset = 0, wrapContents = defaultWrapContents } = settings

  useEffect(() => {
    const guest = getMiniAppGuest()
    const element = div.current!
    const updateHeightAction = new ResizeAction()

    const updateHeight = () => {
      if (window.parent) {
        updateHeightAction.run(() => {
          guest.notify('updateHeight', {
            height: element.clientHeight + heightOffset,
          })
        })
      }
    }
    const resizeObserver = new ResizeObserver(updateHeight)
    resizeObserver.observe(element)
    updateHeight()

    return () => {
      resizeObserver.disconnect()
      updateHeightAction.dispose()
    }
  }, [div, heightOffset])

  return <div ref={div}>{wrapContents(props.children)}</div>
}
