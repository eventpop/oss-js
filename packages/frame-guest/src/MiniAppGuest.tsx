let _guest: MiniAppGuest | undefined

/**
 * Returns an API to communicate with the host.
 */
export const getMiniAppGuest = () => {
  if (!_guest) {
    _guest = new MiniAppGuest()
  }
  return _guest
}

/**
 * A class that provides an API to communicate with the host.
 */
class MiniAppGuest {
  private rpcToken: string
  private origin: string
  private _hash: string
  private locale?: string

  constructor() {
    const hashParams = new URLSearchParams(
      window.location.hash.replace(/^#/, ''),
    )

    const locale = hashParams.get('locale')

    const rpcToken = hashParams.get('rpcToken')
    if (!rpcToken) {
      throw new Error('rpcToken is missing from hash parameters')
    }

    const origin = hashParams.get('origin')
    if (!origin) {
      throw new Error('origin is missing from hash parameters')
    }

    this.rpcToken = rpcToken
    this.origin = origin
    this.locale = locale || undefined
    this._hash = String(hashParams.get('initialHash') || '#/')
  }

  get hash() {
    return this._hash
  }

  set hash(newHash) {
    this._hash = new URL(newHash, window.location.href).hash
  }

  /**
   * Sends a notification to the host without expecting a response.
   */
  notify(method: string, params: object, id?: string) {
    if (window.parent) {
      window.parent.postMessage(
        {
          jsonrpc: '2.0',
          method,
          locale: this.locale,
          params: { rpcToken: this.rpcToken, ...params },
          ...(id ? { id } : {}),
        },
        this.origin,
      )
    }
  }

  /**
   * Makes a request to the host and returns a promise that resolves with the response.
   */
  async call(method: string, params: object) {
    return new Promise((resolve, reject) => {
      const id = Math.random().toString(36).substring(2)

      const listener = (event: MessageEvent) => {
        if (event.data.id === id) {
          window.removeEventListener('message', listener)
          if (event.data.error) {
            reject(new Error(`RPC call failed: ${JSON.stringify(event.data)}`))
          } else {
            resolve(event.data.result)
          }
        }
      }

      window.addEventListener('message', listener)
      this.notify(method, params, id)
    })
  }

  /**
   * Registers a handler for a notification from the host.
   */
  on(expectedMethod: string, f: (params: any) => void) {
    const listener = (event: MessageEvent) => {
      if (event.source !== window.parent) {
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
      if (receivedRpcToken !== this.rpcToken) {
        return
      }
      if (event.origin !== this.origin) {
        return
      }
      if (method !== expectedMethod) {
        return
      }
      f(params)
    }
    window.addEventListener('message', listener)
    return () => {
      window.removeEventListener('message', listener)
    }
  }
}
