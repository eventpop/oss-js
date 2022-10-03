export type ReplyWithAction = (asyncFn: () => Promise<any>) => void

export interface MethodCallEvent {
  id?: string
  method: string
  params: any
  origin: string
  replyWithAction: ReplyWithAction
}

export interface RpcMessageEvent {
  id?: string
  method?: string
  params?: any
  result?: any
  error?: any
}

export interface MiniAppIframeControllerOptions {
  /**
   * The URL of the mini app.
   */
  url: string

  /**
   * The options to pass to the iframe.
   * This will be passed as a hash parameter to the iframe.
   */
  options: Record<string, string>

  /**
   * Enables routing.
   * When enabled, the iframe can send methods like `pushState` and `replaceState` to the host to change the URL.
   */
  routingEnabled?: boolean

  /**
   * Listener to run when a method is called.
   * Useful for adding custom methods.
   */
  onMethodCall?: (event: MethodCallEvent) => void

  /**
   * Listener to run when a message is received from the iframe.
   * Useful for logging.
   */
  onReceiveMessage?: (event: RpcMessageEvent) => void

  /**
   * Listener to run when a message is being sent into the iframe.
   * Useful for logging.
   */
  onSendMessage?: (event: RpcMessageEvent) => void
}

/**
 * The controller used to communicate with the mini app.
 */
export class MiniAppIframeController {
  private _rpcToken: string = crypto.randomUUID()
  private _disposeCallbacks: (() => void)[] = []
  private _routingEnabled: boolean
  private _onMethodCall?: (event: MethodCallEvent) => void
  private _onReceiveMessage?: (event: RpcMessageEvent) => void
  private _onSendMessage?: (event: RpcMessageEvent) => void
  private _notificationOrigin = '*'

  constructor(
    public readonly iframe: HTMLIFrameElement,
    opts: MiniAppIframeControllerOptions,
  ) {
    this._onMethodCall = opts.onMethodCall
    this._onReceiveMessage = opts.onReceiveMessage
    this._onSendMessage = opts.onSendMessage
    this._routingEnabled = opts.routingEnabled ?? false

    // Navigate the iframe to the mini app URL.
    const params = new URLSearchParams({
      ...opts.options,
      rpcToken: this._rpcToken,
      origin: window.location.origin,
      ...(this._routingEnabled && window.location.hash.startsWith('#!')
        ? { initialHash: decodeFromHash(window.location.hash) }
        : {}),
    }).toString()
    iframe.src = `${opts.url}#${params}`

    // Add message listener to handle messages from the iframe.
    const listener = (event: MessageEvent) => this.handleMessage(event)
    window.addEventListener('message', listener)
    this._disposeCallbacks.push(() => {
      window.removeEventListener('message', listener)
    })

    // Add popstate listener to handle history changes.
    if (this._routingEnabled) {
      const listener = (event: PopStateEvent) => {
        const id = crypto.randomUUID()
        const method = 'popState'
        const params = {
          state: event.state,
          url: decodeFromHash(window.location.hash),
          rpcToken: this._rpcToken,
        }
        this._sendToIframe({ id, method, params }, this._notificationOrigin)
      }
      window.addEventListener('popstate', listener)
      this._disposeCallbacks.push(() => {
        window.removeEventListener('popstate', listener)
      })
    }
  }

  handleMessage(event: MessageEvent) {
    const { iframe, _rpcToken: rpcToken } = this
    if (event.source !== iframe.contentWindow) {
      return
    }
    if (!event.data) {
      return
    }
    const {
      id,
      method,
      params: { rpcToken: receivedRpcToken, ...params } = { rpcToken: '' },
    } = event.data
    if (receivedRpcToken !== rpcToken) {
      return
    }
    const origin = event.origin
    this._notificationOrigin = origin

    this._onReceiveMessage?.({
      id,
      method,
      params,
    })

    const replyWithAction: ReplyWithAction = (asyncFn: () => Promise<any>) => {
      asyncFn()
        .then((result) => {
          this._sendToIframe({ id, result }, origin)
        })
        .catch((e) => {
          const error = {
            message: e.message,
            code: e.code || -1,
          }
          this._sendToIframe({ id, error }, origin)
        })
    }
    if (method === 'updateHeight') {
      iframe.style.height = `${params.height}px`
      return
    }
    if (this._routingEnabled) {
      if (method === 'pushState') {
        const { state, title, url } = params
        window.history.pushState(state, title, encodeToHash(url))
        return
      }
      if (method === 'replaceState') {
        const { state, title, url } = params
        window.history.pushState(state, title, encodeToHash(url))
        return
      }
      if (method === 'go') {
        const { delta } = params
        window.history.go(delta)
        return
      }
    }
    this._onMethodCall?.({
      origin,
      id,
      method,
      params,
      replyWithAction,
    })
  }

  private _sendToIframe(object: RpcMessageEvent, origin: string) {
    this.iframe.contentWindow?.postMessage(object, origin)
    this._onSendMessage?.(object)
  }

  dispose() {
    this._disposeCallbacks.forEach((callback) => callback())
  }
}

function encodeToHash(url: string) {
  return (new URL(url, window.location.href).hash || '#').replace(/#/, '#!')
}

function decodeFromHash(hash: string) {
  return hash.replace(/^#!?/, '#')
}
