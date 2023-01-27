# callmeback

🚧 This project is under construction. It is not yet ready for use. 🚧

Serverless-friendly background processing library. This library lets you enqueue HTTP requests to be processed in the background with adapters for:

- [ ] TODO — [Amazon SNS](https://docs.aws.amazon.com/sns/latest/dg/sns-http-https-endpoint-as-subscriber.html)
- [ ] TODO — [Google Cloud Tasks](https://cloud.google.com/tasks)
- [ ] TODO — In-process adapter (for local development and testing)

Due to differences in the way each service works, this library makes the following trade-off:

- The request method is always POST.
- The request body is always JSON-encoded.
- The URL is fixed. On some services this must be preconfigured (e.g. [Amazon SNS](https://docs.aws.amazon.com/sns/latest/dg/SendMessageToHttp.subscribe.html)), while on other services it can be configured directly on the adapter (e.g. [Google Cloud Tasks](https://cloud.google.com/tasks/docs/creating-http-target-tasks)).
- Retry logic depends on the service. Amazon SNS has a [default retry policy](https://docs.aws.amazon.com/sns/latest/dg/SendMessageToHttp.retry.html) but [it can be configured](https://docs.aws.amazon.com/sns/latest/dg/sns-message-delivery-retries.html#creating-delivery-policy) on a topic or subscription. On Google Cloud Tasks, a [RetryConfig](https://cloud.google.com/tasks/docs/reference/rest/v2/projects.locations.queues#RetryConfig) can be [configured](https://cloud.google.com/tasks/docs/configuring-queues#retry) on a queue.
- Rate limiting (throttling) depends on the service. Amazon SNS lets you [configure a throttle policy](https://docs.aws.amazon.com/sns/latest/dg/sns-message-delivery-retries.html#creating-delivery-policy) at the topic or subscription level. Google Cloud Tasks lets you [configure](https://cloud.google.com/tasks/docs/configuring-queues#retry) [RateLimits](https://cloud.google.com/tasks/docs/reference/rest/v2/projects.locations.queues#ratelimits) on a queue.
