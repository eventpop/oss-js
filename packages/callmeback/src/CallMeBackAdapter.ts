// https://github.com/DefinitelyTyped/DefinitelyTyped/issues/60924#issuecomment-1246619013
declare var fetch: typeof import('node-fetch').default
import { randomUUID } from 'crypto'

export interface CallMeBackAdapter {
  dispatch(input: DispatchInput): Promise<DispatchOutput>
}
export interface DispatchInput {
  data: string
}
export interface DispatchOutput {
  id: string
  raw: unknown
}

/**
 * An in-process adapter that makes an HTTP request in the same process.
 *
 * It is useful for prototyping and testing. Not suitable for serverless environments.
 * If the process exits before the request is made, the request will be lost.
 *
 * This adapter requires the `fetch` API to be available in the global scope.
 */
export class InProcessAdapter implements CallMeBackAdapter {
  constructor(private options: InProcessAdapterOptions) {}
  async dispatch(input: DispatchInput): Promise<DispatchOutput> {
    fetch(this.options.url, {
      method: 'POST',
      body: input.data,
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return {
      id: randomUUID(),
      raw: undefined,
    }
  }
}

export interface InProcessAdapterOptions {
  url: string
}

/**
 * An adapter that uses {@link https://aws.amazon.com/sns/ | Amazon SNS} to {@link https://docs.aws.amazon.com/sns/latest/dg/sns-http-https-endpoint-as-subscriber.html | enqueue a background HTTP request}.
 *
 * @remarks Requests will be sent with {@link https://docs.aws.amazon.com/sns/latest/dg/sns-large-payload-raw-message-delivery.html | raw message delivery}.
 */
export class AmazonSNSAdapter implements CallMeBackAdapter {
  constructor(private options: AmazonSNSAdapterOptions) {}
  async dispatch(input: DispatchInput): Promise<DispatchOutput> {
    const result = await this.options.sns.publish({
      TopicArn: this.options.topicArn,
      Message: input.data,
    })
    return {
      id: String(result.MessageId),
      raw: result,
    }
  }
}
export interface AmazonSNSAdapterOptions {
  topicArn: string
  sns: AmazonSNSPublisher
}
export interface AmazonSNSPublisher {
  publish(params: AmazonSNSPublishParams): PromiseLike<AmazonSNSPublishResult>
}
export interface AmazonSNSPublishParams {
  TopicArn: string
  Message: string
}
export interface AmazonSNSPublishResult {
  MessageId?: string
}

/**
 * An adapter that uses {@link https://cloud.google.com/tasks | Google Cloud Tasks} to enqueue a background HTTP request.
 */
export class GoogleCloudTasksAdapter implements CallMeBackAdapter {
  constructor(private options: GoogleCloudTasksAdapterOptions) {}
  async dispatch(input: DispatchInput): Promise<DispatchOutput> {
    const [result] = await this.options.client.createTask({
      parent: this.options.queuePath,
      task: {
        httpRequest: {
          httpMethod: 'POST',
          url: this.options.url,
          headers: {
            'Content-Type': 'application/json',
          },
          body: Buffer.from(input.data).toString('base64'),
        },
      },
    })
    return {
      id: String(result.name),
      raw: result,
    }
  }
}
export interface GoogleCloudTasksAdapterOptions {
  client: GoogleCloudTasksClient
  url: string
  /**
   * Queue parent, in format of `projects/PROJECT_ID/locations/LOCATION_ID/queues/QUEUE_ID`.
   */
  queuePath: string
}
export interface GoogleCloudTasksClient {
  createTask(
    params: GoogleCloudTasksCreateTaskParams,
  ): PromiseLike<[result: GoogleCloudTasksCreateTaskResult, ...rest: any[]]>
}
export interface GoogleCloudTasksCreateTaskParams {
  parent: string
  task: {
    httpRequest: any
  }
}
export interface GoogleCloudTasksCreateTaskResult {
  name?: string | null
}
