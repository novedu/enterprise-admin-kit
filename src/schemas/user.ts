import type { TableSchema } from '@/types/table'

export const userSchema: TableSchema = {
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
    {
      field: 'joinDate',
      label: 'Join Date',
      labelKey: 'schema.user.joinDate',
      component: 'Date',
    },
  ],
  columns: [
    {
      prop: 'name',
      label: 'Name',
      labelKey: 'schema.user.name',
      minWidth: 140,
    },
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
    {
      prop: 'role',
      label: 'Role',
      labelKey: 'schema.user.role',
      width: 110,
    },
    {
      prop: 'status',
      label: 'Status',
      labelKey: 'schema.user.status',
      width: 110,
    },
    {
      prop: 'joinDate',
      label: 'Join Date',
      labelKey: 'schema.user.joinDate',
      width: 140,
    },
  ],
}
