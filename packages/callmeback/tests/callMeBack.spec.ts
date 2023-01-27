import { test, expect } from '@playwright/test'
import { Requestbin } from './Requestbin'
import {
  callMeBack,
  CallMeBackAdapter,
  CallMeBackConfig,
  InProcessAdapter,
} from '../src'
import { randomUUID } from 'crypto'

function exercise<T extends CallMeBackAdapter>(
  klass: { new (...args: any[]): T },
  factory: (bin: Requestbin) => T,
) {
  test.describe(klass.name, () => {
    test('calls the endpoint', async ({ request }) => {
      const bin = new Requestbin(request)
      const value = randomUUID()
      const config: CallMeBackConfig = {
        adapter: factory(bin),
      }
      await callMeBack(config, { value })
      await expect(async () => {
        await bin.assertLog({ value })
      }).toPass()
    })
  })
}

exercise(InProcessAdapter, (bin) => {
  return new InProcessAdapter({
    url: bin.postUrl,
  })
})
