import {
  adminMenu,
  adminPermissions,
  roleSchema,
  roles,
  userMenu,
  userPermissions,
  users,
  userSchema,
} from './data.js'

export function ok(data, message = 'ok') {
  return {
    code: 0,
    message,
    data,
  }
}

export function fail(message, code = 400) {
  return {
    code,
    message,
    data: null,
  }
}

function page(source, params) {
  const pageNum = Number(params.get('page') || 1)
  const pageSize = Number(params.get('pageSize') || 10)
  const keyword = params.get('keyword')?.toLowerCase()
  const status = params.get('status')

  const filtered = source.filter((item) => {
    const keywordMatched = keyword
      ? Object.values(item).some((value) => String(value).toLowerCase().includes(keyword))
      : true
    const statusMatched = status ? item.status === status : true
    return keywordMatched && statusMatched
  })

  return ok({
    list: filtered.slice((pageNum - 1) * pageSize, pageNum * pageSize),
    total: filtered.length,
  })
}

function createLoginResult(role) {
  if (role === 'admin') {
    return {
      token: `mock-admin-token-${Date.now()}`,
      role: 'admin',
      permissions: adminPermissions,
      menu: adminMenu,
      profile: {
        id: 1,
        name: 'Alex Admin',
        avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Alex',
        department: 'Platform Engineering',
      },
    }
  }

  return {
    token: `mock-user-token-${Date.now()}`,
    role: 'user',
    permissions: userPermissions,
    menu: userMenu,
    profile: {
      id: 2,
      name: 'Uma User',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Uma',
      department: 'Customer Success',
    },
  }
}

export function handleMockRequest({ method, pathname, searchParams, body }) {
  if (method === 'POST' && pathname === '/api/login') {
    if (body.username === 'admin' && body.password === 'admin123') return ok(createLoginResult('admin'))
    if (body.username === 'user' && body.password === 'user123') return ok(createLoginResult('user'))
    return fail('Invalid username or password')
  }

  if (method === 'GET' && pathname === '/api/dashboard') {
    return ok({
      metrics: [
        { label: 'Today Orders', labelKey: 'page.dashboard.metric.todayOrders', value: '1,284', trend: '+12.8%', level: 'success' },
        { label: 'Today Sales', labelKey: 'page.dashboard.metric.todaySales', value: '$86,420', trend: '+8.2%', level: 'success' },
        { label: 'Online Users', labelKey: 'page.dashboard.metric.onlineUsers', value: '4,812', trend: '+3.1%', level: 'info' },
        { label: 'Server Status', labelKey: 'page.dashboard.metric.serverStatus', value: 'Stable', trend: '99.98%', level: 'success' },
      ],
      server: {
        cpu: 52,
        memory: 68,
        network: 41,
        status: 'Healthy',
      },
      sales: Array.from({ length: 7 }).map((_, index) => ({
        date: `D${index + 1}`,
        orders: 180 + index * 32,
        sales: 16000 + index * 3600,
      })),
    })
  }

  if (method === 'GET' && pathname === '/api/schema/user') return ok(userSchema)
  if (method === 'GET' && pathname === '/api/schema/role') return ok(roleSchema)

  if (method === 'GET' && pathname === '/api/user') return page(users, searchParams)
  if (method === 'GET' && pathname === '/api/role') return page(roles, searchParams)

  if (method === 'POST' && pathname === '/api/user') {
    const row = { id: users.length + 1, ...body }
    users.unshift(row)
    return ok(row)
  }

  if (method === 'POST' && pathname === '/api/role') {
    const row = { id: roles.length + 1, users: 0, ...body }
    roles.unshift(row)
    return ok(row)
  }

  const updateMatch = pathname.match(/^\/api\/(user|role)\/(\d+)$/)
  if (method === 'POST' && updateMatch) {
    const [, resource, id] = updateMatch
    const source = resource === 'role' ? roles : users
    const index = source.findIndex((item) => item.id === Number(id))
    if (index === -1) return fail('Record not found', 404)
    source[index] = { ...source[index], ...body }
    return ok(source[index])
  }

  const deleteMatch = pathname.match(/^\/api\/(user|role)\/(\d+)\/delete$/)
  if (method === 'POST' && deleteMatch) {
    const [, resource, id] = deleteMatch
    const source = resource === 'role' ? roles : users
    const index = source.findIndex((item) => item.id === Number(id))
    if (index === -1) return fail('Record not found', 404)
    source.splice(index, 1)
    return ok(true)
  }

  return fail(`No mock handler for ${method} ${pathname}`, 404)
}

export const chatChunks = [
  'Enterprise Admin Kit uses RBAC, Schema Form, TablePage and request cache as separate layers.\\n\\n',
  '```ts\\n',
  "const cacheKey = ['table-page', api, params]\\n",
  '```\\n\\n',
  'This keeps infrastructure reusable and business pages small.',
]
