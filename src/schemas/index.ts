import { roleSchema } from './role'
import { userSchema } from './user'

export const schemaRegistry = {
  user: userSchema,
  role: roleSchema,
}
