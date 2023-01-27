import { test, expect } from '@playwright/test'
import { Requestbin } from './Requestbin'
import { callMeBack, CallMeBackConfig, InProcessAdapter } from '../src'
import { randomUUID } from 'crypto'

test('calls the endpoint', async ({ request }) => {
  const bin = new Requestbin(request)
  const value = randomUUID()
  const config: CallMeBackConfig = {
    adapter: new InProcessAdapter({
      url: bin.postUrl,
    }),
  }
  await callMeBack(config, { value })
  await expect(async () => {
    await bin.assertLog({ value })
  }).toPass()
})
