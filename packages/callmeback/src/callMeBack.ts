import { CallMeBackAdapter } from "./CallMeBackAdapter"

export function callMeBack(config: CallMeBackConfig, input: CallMeBackInput) {

}

export interface CallMeBackConfig {
  /**
   * If specified, the request URL will be resolved relative to this base URL
   * using `new URL(relativeUrl, baseUrl)`.
   */
  baseUrl?: string | URL

  adapter: CallMeBackAdapter
}

export interface CallMeBackInput {
  /**
   * The URL to call back to.
   * If `config.baseUrl` is specified, this URL will be resolved relative to it.
   * If `config.baseUrl` is not specified, an absolute URL is required.
   */
  url: string | URL

  /**
   * The payload to send to the URL. It will be JSON-encoded.
   */
  payload?: any
}

