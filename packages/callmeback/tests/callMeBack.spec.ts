import { test, expect } from '@playwright/test'
import { Requestbin } from './Requestbin'
import {
  AmazonSNSAdapter,
  callMeBack,
  CallMeBackAdapter,
  CallMeBackConfig,
  InProcessAdapter,
} from '../src'
import { randomUUID } from 'crypto'

import { SNS } from '@aws-sdk/client-sns'

function exercise<T extends CallMeBackAdapter>(
  klass: { new (...args: any[]): T },
  factory: (bin: Requestbin) => T,
) {
  test.describe(klass.name, () => {
    test('calls the endpoint', async ({ request }) => {
      const bin = new Requestbin(request)
      const config: CallMeBackConfig = {
        adapter: factory(bin),
      }
      for (let i = 0; i < 10; i++) {
        const value = randomUUID()
        await callMeBack(config, { value })
        await expect(async () => {
          await bin.assertLog({ value })
        }).toPass()
      }
    })
  })
}

exercise(InProcessAdapter, (bin) => {
  return new InProcessAdapter({
    url: bin.postUrl,
  })
})

exercise(AmazonSNSAdapter, (_bin) => {
  test.skip(!process.env.CALLMEBACK_SNS_TOPIC_ARN, 'SNS topic ARN not set')

  // Note: A subscription with the correct URL must be set up
  // for the topic before this test will pass.

  return new AmazonSNSAdapter({
    topicArn: process.env.CALLMEBACK_SNS_TOPIC_ARN!,
    sns: new SNS({}),
  })
})
