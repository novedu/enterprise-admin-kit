export type RoleCode = 'admin' | 'user'

export interface PermissionSet {
  buttons: string[]
  fields: string[]
  routes: string[]
}

export interface MenuItem {
  path: string
  name: string
  title: string
  titleKey?: string
  icon?: string
  children?: MenuItem[]
}

export interface LoginPayload {
  username: string
  password: string
}

export interface LoginResult {
  token: string
  role: RoleCode
  permissions: PermissionSet
  menu: MenuItem[]
  profile: {
    id: number
    name: string
    avatar: string
    department: string
  }
}
