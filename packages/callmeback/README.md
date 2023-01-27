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

## Configuring queues and running tests

By default, the tests will only run against the in-process adapter.

To run the tests against other adapters, there are some preparation steps.

1. Expose the `requestbin` service so that it’s publicly available.

   - If you are developing in Codespaces, you can go to the **Ports** tab, right click on the server’s **Local Address** &rarr; **Port Visibility** &rarr; **Public**.
   - You can also use [ngrok](https://ngrok.com/) or [Cloudflare Quick Tunnel](https://blog.cloudflare.com/quick-tunnels-anytime-anywhere/) to expose the service.

   Then set the environment variable `REQUESTBIN_URL` to the URL of the `requestbin` service **without the trailing slash**, for example:

   ```sh
   export REQUESTBIN_URL=https://dtinth-verbose-computing-machine-rr4g7rgqv2jgj-35124.preview.app.github.dev
   ```

2. Set up the credentials for the other adapters.

   - Check out the below sections for more details.

## Usage with Amazon SNS

About [Amazon SNS](https://aws.amazon.com/sns/):

- You need to [pre-configure the URL](https://docs.aws.amazon.com/sns/latest/dg/SendMessageToHttp.subscribe.html) when creating the subscription.
- Once the subscription is created, you must [confirm the subscription](https://docs.aws.amazon.com/sns/latest/dg/SendMessageToHttp.confirm.html). Amazon SNS will send a request to the URL you configured. That request body will contain a `SubscribeURL` parameter. You must make a `GET` request to that URL to confirm the subscription. You can make your endpoint do that automatically, or you can take the URL and visit it manually in your browser.
- I am not sure whether SNS respects the `Retry-After` response header or not. If someone was able to test this, please let us know and update the documentation.
