// Runs requests.
import {
  AmazonSNSAdapter,
  callMeBack,
  GoogleCloudTasksAdapter,
  InProcessAdapter,
  QStashAdapter,
  ZeploAdapter,
} from '../dist/index.js'
import { SNS } from '@aws-sdk/client-sns'
import { CloudTasksClient } from '@google-cloud/tasks'
import { z } from 'zod'
import { Env } from 'lazy-strict-env'
import { randomUUID } from 'crypto'

const env = {
  requestbin: Env(
    z.object({
      REQUESTBIN_URL: z.string().url(),
    }),
  ),
  callmeback: Env(
    z.object({
      CALLMEBACK_ADAPTER: z
        .enum(['in-process', 'gcloud-tasks', 'amazon-sns', 'qstash', 'zeplo'])
        .default('in-process'),
    }),
  ),
  gcloud: Env(
    z.object({
      CALLMEBACK_CLOUD_TASK_QUEUE: z.string(),
    }),
  ),
  aws: Env(
    z.object({
      CALLMEBACK_SNS_TOPIC_ARN: z.string(),
    }),
  ),
  zeplo: Env(
    z.object({
      ZEPLO_TOKEN: z.string(),
    }),
  ),
  qstash: Env(
    z.object({
      QSTASH_TOKEN: z.string(),
    }),
  ),
}

function getAdapter() {
  const url = env.requestbin.REQUESTBIN_URL
  const postUrl = `${url}/post`
  if (env.callmeback.CALLMEBACK_ADAPTER === 'in-process') {
    return new InProcessAdapter({ url: postUrl })
  } else if (env.callmeback.CALLMEBACK_ADAPTER === 'gcloud-tasks') {
    const client = new CloudTasksClient()
    return new GoogleCloudTasksAdapter({
      client,
      queuePath: env.gcloud.CALLMEBACK_CLOUD_TASK_QUEUE,
      url: postUrl,
    })
  } else if (env.callmeback.CALLMEBACK_ADAPTER === 'amazon-sns') {
    const client = new SNS()
    return new AmazonSNSAdapter({
      sns: client,
      topicArn: env.aws.CALLMEBACK_SNS_TOPIC_ARN,
    })
  } else if (env.callmeback.CALLMEBACK_ADAPTER === 'zeplo') {
    return new ZeploAdapter({
      token: env.zeplo.ZEPLO_TOKEN,
      url: postUrl,
    })
  } else if (env.callmeback.CALLMEBACK_ADAPTER === 'qstash') {
    return new QStashAdapter({
      url: postUrl,
      token: env.qstash.QSTASH_TOKEN,
    })
  }
}

const config = {
  adapter: getAdapter(),
}

async function fire() {
  const id = randomUUID()
  const started = Date.now()
  const { id: taskId } = await callMeBack(config, {
    id,
    errorChance: 0,
    timing: true,
    delay: 12000,
  })
  const enqueued = Date.now()
  return {
    info: {
      id,
      taskId,
      started,
      enqueued,
    },
    check: async () => {
      for (;;) {
        const log = await fetch(`http://localhost:35124/log`).then((r) =>
          r.json(),
        )
        const task = log.find((t) => t.id === id)
        if (task) {
          return task
        }
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    },
  }
}

const baseTime = Date.now()
/** @type {Awaited<ReturnType<typeof fire>>[]} */
const tasks = await Promise.all(
  Array.from({ length: 30 }, async () => {
    const task = await fire()
    console.error(`${task.info.id} => ${task.info.taskId}`)
    return task
  }),
)
// await Promise.all(
//   .map(async () => {
//     const task = await fire()
//     tasks.push(task)
//     console.error(`${task.info.id} => ${task.info.taskId}`)
//   }),
// )
console.error()
for (const [i, task] of tasks.entries()) {
  const result = await task.check()
  const columns = [
    env.callmeback.CALLMEBACK_ADAPTER,
    i + 1,
    task.info.started - baseTime,
    task.info.enqueued - baseTime,
    result.start - baseTime,
    result.finish - baseTime,
  ]
  console.log(columns.join(','))
}
