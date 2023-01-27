import { CallMeBackAdapter } from './CallMeBackAdapter'

export async function callMeBack(config: CallMeBackConfig, data: any) {
  return config.adapter.dispatch({ data: JSON.stringify(data) })
}

export interface CallMeBackConfig {
  adapter: CallMeBackAdapter
}
