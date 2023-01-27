import { test } from '@playwright/test'
import { Requestbin } from './Requestbin'

test('logs', async ({ request }) => {
  const value = String(Math.random())
  const bin = new Requestbin(request)
  await bin.post({ value })
  await bin.assertLog({ value })
})
