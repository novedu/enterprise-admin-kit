import type { TableSchema } from '@/types/table'

export const roleSchema: TableSchema = {
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
    {
      prop: 'name',
      label: 'Role Name',
      labelKey: 'schema.role.roleName',
      minWidth: 160,
    },
    {
      prop: 'code',
      label: 'Code',
      labelKey: 'schema.role.code',
      minWidth: 140,
    },
    {
      prop: 'scope',
      label: 'Data Scope',
      labelKey: 'schema.role.dataScope',
      minWidth: 140,
    },
    {
      prop: 'users',
      label: 'Users',
      labelKey: 'schema.role.users',
      width: 100,
    },
  ],
}
