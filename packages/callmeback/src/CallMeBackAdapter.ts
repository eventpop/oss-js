
export interface CallMeBackAdapter {
}

/**
 * An in-memory adapter that makes an HTTP request in the same process.
 *
 * It is useful for prototyping and testing. Not suitable for serverless environments.
 * If the process exits before the request is made, the request will be lost.
 */
export class InMemoryAdapter implements CallMeBackAdapter {}

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
