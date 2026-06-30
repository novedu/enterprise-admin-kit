import { createServer } from 'node:http'

import { chatChunks, handleMockRequest } from '../mocks/handlers.js'

const port = Number(process.env.MOCK_PORT || 3001)

function readBody(request) {
  return new Promise((resolve, reject) => {
    let raw = ''
    request.on('data', (chunk) => {
      raw += chunk
    })
    request.on('end', () => {
      if (!raw) {
        resolve({})
        return
      }

      try {
        resolve(JSON.parse(raw))
      } catch (error) {
        reject(error)
      }
    })
    request.on('error', reject)
  })
}

function sendJson(response, payload, status = 200) {
  response.writeHead(status, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'content-type, authorization',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Content-Type': 'application/json; charset=utf-8',
  })
  response.end(JSON.stringify(payload))
}

function sendSse(response) {
  response.writeHead(200, {
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Content-Type': 'text/event-stream; charset=utf-8',
  })

  let index = 0
  const timer = setInterval(() => {
    const chunk = chatChunks[index]
    if (!chunk) {
      response.write('event: done\\ndata: [DONE]\\n\\n')
      clearInterval(timer)
      response.end()
      return
    }

    response.write(`data: ${JSON.stringify({ content: chunk })}\\n\\n`)
    index += 1
  }, 120)

  response.on('close', () => {
    clearInterval(timer)
  })
}

const server = createServer(async (request, response) => {
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Headers', 'content-type, authorization')
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')

  if (request.method === 'OPTIONS') {
    response.writeHead(204)
    response.end()
    return
  }

  const url = new URL(request.url || '/', `http://${request.headers.host}`)

  if (request.method === 'GET' && url.pathname === '/api/chat/stream') {
    sendSse(response)
    return
  }

  try {
    const payload = handleMockRequest({
      method: request.method || 'GET',
      pathname: url.pathname,
      searchParams: url.searchParams,
      body: await readBody(request),
    })

    sendJson(response, payload)
  } catch (error) {
    sendJson(
      response,
      {
        code: 500,
        message: error instanceof Error ? error.message : 'Mock server error',
        data: null,
      },
      500,
    )
  }
})

server.listen(port, () => {
  console.log(`Mock server running at http://localhost:${port}`)
})
