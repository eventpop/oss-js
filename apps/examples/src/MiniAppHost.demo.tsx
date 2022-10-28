import { FC, useEffect, useRef, useState } from 'react'
import { MiniAppIframeController } from '@eventpop-oss/frame-host'

const MiniAppHostDemo: FC = () => {
  const [logs, setLogs] = useState<string>('Logs will display here...')
  const iframe = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const idToMethodMap = new Map<string, string>()
    const controller = new MiniAppIframeController(iframe.current!, {
      url: '/?demo=MiniAppGuest',
      options: {},
      routingEnabled: true,
      onReceiveMessage: (event) => {
        const { id, method, params } = event
        if (id && method) {
          idToMethodMap.set(id, method)
        }
        setLogs((l) => l + `\n<< received ${method}(${JSON.stringify(params)})`)
      },
      onSendMessage: (event) => {
        const { id, method, result, params } = event
        const prefix =
          method || idToMethodMap.get(id || '') + '.reply' || `#${id}`
        setLogs(
          (l) => l + `\n>> sent ${prefix}(${JSON.stringify(result || params)})`,
        )
      },
    })
    return () => {
      controller.dispose()
    }
  }, [])

  return (
    <>
      <h1>@eventpop-oss/frame demo</h1>
      <LogViewer contents={logs} />
      <iframe ref={iframe} style={{ width: 'calc(100% - 4px)' }} />
    </>
  )
}

interface LogViewer {
  contents: string
}

const LogViewer: FC<LogViewer> = (props) => {
  const isBottom = useRef(true)
  const textArea = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    if (textArea.current) {
      textArea.current.onscroll = () => {
        isBottom.current =
          textArea.current!.scrollTop + textArea.current!.clientHeight >=
          textArea.current!.scrollHeight - 32
      }
    }
  }, [])
  useEffect(() => {
    if (isBottom.current && textArea.current) {
      textArea.current.scrollTop = textArea.current.scrollHeight
    }
  }, [props.contents])
  return (
    <div>
      <textarea
        ref={textArea}
        readOnly
        style={{
          height: '256px',
          width: '100%',
          boxSizing: 'border-box',
          borderRadius: '4px',
          border: '1px solid #e2e8f0',
          padding: '8px',
          fontFamily: 'monospace',
          fontSize: '12px',
        }}
        value={props.contents}
      />
    </div>
  )
}

export default MiniAppHostDemo
