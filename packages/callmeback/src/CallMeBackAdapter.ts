export interface CallMeBackAdapter {
  dispatch(input: DispatchInput): void
}

export interface DispatchInput {
  data: string
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
  dispatch(input: DispatchInput) {
    fetch(this.options.url, {
      method: 'POST',
      body: input.data,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
}

export interface InProcessAdapterOptions {
  url: string
}

/**
 * An adapter that uses {@link https://cloud.google.com/tasks | Google Cloud Tasks} to enqueue a background HTTP request.
 */
export class GoogleCloudTasksAdapter implements CallMeBackAdapter {}

/**
 * An adapter that uses {@link https://aws.amazon.com/sns/ | Amazon SNS} to {@link https://docs.aws.amazon.com/sns/latest/dg/sns-http-https-endpoint-as-subscriber.html | enqueue a background HTTP request}.
 *
 * @remarks Requests will be sent with {@link https://docs.aws.amazon.com/sns/latest/dg/sns-large-payload-raw-message-delivery.html | raw message delivery}.
 */
export class AmazonSNSAdapter implements CallMeBackAdapter {}
