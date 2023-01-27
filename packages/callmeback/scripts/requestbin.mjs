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
  let body = request.body
  if (typeof body === 'string') {
    body = JSON.parse(body)
  }
  log.push(body)
  return { ok: true }
})

fastify.get('/log', async (_request, _reply) => {
  return log
})

fastify.listen({ port: 35124 })
