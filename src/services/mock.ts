import Mock from 'mockjs'

import { handleMockRequest } from '@mocks/handlers.js'

Mock.setup({
  timeout: '180-480',
})

function parseBody(body: string) {
  if (!body) return {}

  try {
    return JSON.parse(body)
  } catch {
    return {}
  }
}

function register(method: 'get' | 'post', pattern: string | RegExp) {
  Mock.mock(pattern, method, (options) => {
    const url = new URL(options.url, window.location.origin)

    return handleMockRequest({
      method: method.toUpperCase(),
      pathname: url.pathname,
      searchParams: url.searchParams,
      body: parseBody(options.body),
    })
  })
}

register('post', '/api/login')
register('get', '/api/dashboard')
register('get', /\/api\/schema\/(user|role)$/)
register('get', /\/api\/user(\?.*)?$/)
register('get', /\/api\/role(\?.*)?$/)
register('post', '/api/user')
register('post', '/api/role')
register('post', /\/api\/(user|role)\/\d+$/)
register('post', /\/api\/(user|role)\/\d+\/delete$/)
