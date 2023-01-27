import { test, expect } from '@playwright/test'
import { Requestbin } from './Requestbin'
import {
  AmazonSNSAdapter,
  callMeBack,
  CallMeBackAdapter,
  CallMeBackConfig,
  GoogleCloudTasksAdapter,
  InProcessAdapter,
} from '../src'
import { randomUUID } from 'crypto'

import { SNS } from '@aws-sdk/client-sns'
import { CloudTasksClient } from '@google-cloud/tasks'

function exercise<T extends CallMeBackAdapter>(
  klass: { new (...args: any[]): T },
  factory: (bin: Requestbin) => T,
) {
  test.describe(klass.name, () => {
    test('calls the endpoint', async ({ request }) => {
      const bin = new Requestbin(request)
      const config: CallMeBackConfig = { adapter: factory(bin) }
      const value = randomUUID()
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

exercise(AmazonSNSAdapter, (_bin) => {
  test.skip(!process.env.CALLMEBACK_SNS_TOPIC_ARN, 'SNS topic ARN not set')

  // Note: A subscription with the correct URL must be set up
  // for the topic before this test will pass.
  const topicArn = process.env.CALLMEBACK_SNS_TOPIC_ARN!
  const sns = new SNS({})
  return new AmazonSNSAdapter({ topicArn, sns })
})

exercise(GoogleCloudTasksAdapter, (bin) => {
  test.skip(!process.env.CALLMEBACK_CLOUD_TASK_QUEUE, 'Queue path not set')

  const client = new CloudTasksClient()
  return new GoogleCloudTasksAdapter({
    client,
    queuePath: process.env.CALLMEBACK_CLOUD_TASK_QUEUE!,
    url: bin.postUrl,
  })
})
