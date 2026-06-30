import { post } from '@/services/request'
import type { LoginPayload, LoginResult } from '@/types/auth'

export function login(payload: LoginPayload) {
  return post<LoginResult>('/login', payload)
}
