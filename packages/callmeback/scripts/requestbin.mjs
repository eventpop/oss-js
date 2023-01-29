// @ts-check
import Fastify from 'fastify'

const fastify = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
    },
  },
})

/** @type {any[]} */
const log = []

fastify.post('/post', async (request, _reply) => {
  /** @type {any} */
  let body = request.body
  if (typeof body === 'string') {
    body = JSON.parse(body)
  }

  // Simulate random errors for retrying
  let errorChance = 0.1
  if (body.errorChance != null) {
    errorChance = body.errorChance
  }
  if (Math.random() < errorChance) {
    throw new Error('Random error')
  }

  // Add timing information
  let timing = false
  if (body.timing) {
    timing = true
  }
  if (timing) {
    body.start = Date.now()
  }

  // Simulate request delay
  let delay = 0
  if (body.delay != null) {
    delay = body.delay
  }
  await new Promise((resolve) => setTimeout(resolve, delay))

  if (timing) {
    body.finish = Date.now()
  }

  log.push(body)
  return { ok: true }
})

fastify.get('/log', async (_request, _reply) => {
  return log
})

fastify.listen({ port: 35124 })
