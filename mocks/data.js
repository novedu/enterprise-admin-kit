const names = [
  'Alex Chen',
  'Blake Smith',
  'Casey Wang',
  'Dana Lee',
  'Elliot Zhang',
  'Finley Brown',
  'Gray Lin',
  'Harper Zhou',
]

export const adminPermissions = {
  routes: [
    'Dashboard',
    'Workspaces',
    'WorkspaceDetail',
    'Applications',
    'ApplicationDetail',
    'Conversations',
    'User',
    'Role',
    'AI',
    'SchemaEditor',
    'Monitor',
    'Setting',
    'Profile',
  ],
  buttons: [
    'user:create',
    'user:edit',
    'user:delete',
    'user:export',
    'role:create',
    'role:edit',
    'role:delete',
    'setting:save',
  ],
  fields: ['field:user:email', 'field:user:phone', 'field:user:salary'],
}

export const userPermissions = {
  routes: [
    'Dashboard',
    'Workspaces',
    'WorkspaceDetail',
    'Applications',
    'ApplicationDetail',
    'Conversations',
    'AI',
    'Profile',
  ],
  buttons: [],
  fields: [],
}

export const adminMenu = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    title: 'Dashboard',
    titleKey: 'menu.dashboard',
    icon: 'DataLine',
  },
  { path: '/user', name: 'User', title: 'User Management', titleKey: 'menu.user', icon: 'User' },
  { path: '/role', name: 'Role', title: 'Role Management', titleKey: 'menu.role', icon: 'Lock' },
  { path: '/ai', name: 'AI', title: 'AI Chat', titleKey: 'menu.ai', icon: 'ChatDotRound' },
  {
    path: '/schema-editor',
    name: 'SchemaEditor',
    title: 'Schema Editor',
    titleKey: 'menu.schemaEditor',
    icon: 'Document',
  },
  {
    path: '/monitor',
    name: 'Monitor',
    title: 'Monitor',
    titleKey: 'menu.monitor',
    icon: 'Monitor',
  },
  {
    path: '/setting',
    name: 'Setting',
    title: 'Settings',
    titleKey: 'menu.setting',
    icon: 'Setting',
  },
]

export const userMenu = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    title: 'Dashboard',
    titleKey: 'menu.dashboard',
    icon: 'DataLine',
  },
  { path: '/ai', name: 'AI', title: 'AI Chat', titleKey: 'menu.ai', icon: 'ChatDotRound' },
  { path: '/profile', name: 'Profile', title: 'Profile', titleKey: 'menu.profile', icon: 'Avatar' },
]

export const userSchema = {
  rowKey: 'id',
  search: [
    {
      field: 'keyword',
      label: 'Keyword',
      labelKey: 'schema.user.keyword',
      component: 'Input',
      placeholder: 'Name / email / phone',
      placeholderKey: 'schema.user.placeholder.keyword',
    },
    {
      field: 'status',
      label: 'Status',
      labelKey: 'schema.user.status',
      component: 'Select',
      options: [
        { label: 'Active', labelKey: 'schema.user.option.active', value: 'active' },
        { label: 'Disabled', labelKey: 'schema.user.option.disabled', value: 'disabled' },
      ],
    },
  ],
  form: [
    {
      field: 'name',
      label: 'Name',
      labelKey: 'schema.user.name',
      component: 'Input',
      required: true,
    },
    {
      field: 'email',
      label: 'Email',
      labelKey: 'schema.user.email',
      component: 'Input',
      required: true,
      permission: 'field:user:email',
    },
    {
      field: 'phone',
      label: 'Phone',
      labelKey: 'schema.user.phone',
      component: 'Input',
      permission: 'field:user:phone',
    },
    {
      field: 'role',
      label: 'Role',
      labelKey: 'schema.user.role',
      component: 'Select',
      required: true,
      options: [
        { label: 'Admin', labelKey: 'schema.user.option.admin', value: 'admin' },
        { label: 'User', labelKey: 'schema.user.option.user', value: 'user' },
      ],
    },
    {
      field: 'status',
      label: 'Status',
      labelKey: 'schema.user.status',
      component: 'Radio',
      required: true,
      options: [
        { label: 'Active', labelKey: 'schema.user.option.active', value: 'active' },
        { label: 'Disabled', labelKey: 'schema.user.option.disabled', value: 'disabled' },
      ],
    },
    { field: 'joinDate', label: 'Join Date', labelKey: 'schema.user.joinDate', component: 'Date' },
  ],
  columns: [
    { prop: 'name', label: 'Name', labelKey: 'schema.user.name', minWidth: 140 },
    {
      prop: 'email',
      label: 'Email',
      labelKey: 'schema.user.email',
      minWidth: 190,
      permission: 'field:user:email',
    },
    {
      prop: 'phone',
      label: 'Phone',
      labelKey: 'schema.user.phone',
      minWidth: 140,
      permission: 'field:user:phone',
    },
    { prop: 'role', label: 'Role', labelKey: 'schema.user.role', width: 110 },
    { prop: 'status', label: 'Status', labelKey: 'schema.user.status', width: 110 },
    { prop: 'joinDate', label: 'Join Date', labelKey: 'schema.user.joinDate', width: 140 },
  ],
}

export const roleSchema = {
  rowKey: 'id',
  search: [
    {
      field: 'keyword',
      label: 'Keyword',
      labelKey: 'schema.role.keyword',
      component: 'Input',
      placeholder: 'Role name',
      placeholderKey: 'schema.role.placeholder.keyword',
    },
  ],
  form: [
    {
      field: 'name',
      label: 'Role Name',
      labelKey: 'schema.role.roleName',
      component: 'Input',
      required: true,
    },
    {
      field: 'code',
      label: 'Code',
      labelKey: 'schema.role.code',
      component: 'Input',
      required: true,
    },
    {
      field: 'scope',
      label: 'Data Scope',
      labelKey: 'schema.role.dataScope',
      component: 'Select',
      options: [
        { label: 'All Data', labelKey: 'schema.role.option.all', value: 'all' },
        { label: 'Department', labelKey: 'schema.role.option.department', value: 'department' },
        { label: 'Self', labelKey: 'schema.role.option.self', value: 'self' },
      ],
    },
  ],
  columns: [
    { prop: 'name', label: 'Role Name', labelKey: 'schema.role.roleName', minWidth: 160 },
    { prop: 'code', label: 'Code', labelKey: 'schema.role.code', minWidth: 140 },
    { prop: 'scope', label: 'Data Scope', labelKey: 'schema.role.dataScope', minWidth: 140 },
    { prop: 'users', label: 'Users', labelKey: 'schema.role.users', width: 100 },
  ],
}

export const users = Array.from({ length: 10000 }).map((_, index) => {
  const id = index + 1
  const name = names[index % names.length]

  return {
    id,
    name: `${name} ${id}`,
    email: `user${id}@enterprise.test`,
    phone: `1${String(3000000000 + id).slice(0, 10)}`,
    role: id % 7 === 0 ? 'admin' : 'user',
    status: id % 5 === 0 ? 'disabled' : 'active',
    joinDate: `2026-${String((id % 12) + 1).padStart(2, '0')}-${String((id % 27) + 1).padStart(2, '0')}`,
    salary: 9000 + (id % 30) * 900,
  }
})

export const roles = [
  { id: 1, name: 'Super Admin', code: 'admin', scope: 'all', users: 6 },
  { id: 2, name: 'Operator', code: 'operator', scope: 'department', users: 18 },
  { id: 3, name: 'Auditor', code: 'auditor', scope: 'self', users: 9 },
]
