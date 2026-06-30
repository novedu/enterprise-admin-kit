import { describe, expect, it } from 'vitest'

import { flattenMenu } from './menu'

describe('flattenMenu', () => {
  it('flattens nested menus in display order', () => {
    const result = flattenMenu([
      {
        path: '/system',
        name: 'System',
        title: 'System',
        children: [{ path: '/system/user', name: 'User', title: 'User' }],
      },
    ])

    expect(result.map((item) => item.path)).toEqual(['/system', '/system/user'])
  })
})
