<template>
  <el-button v-if="visible" v-bind="$attrs">
    <slot />
  </el-button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { hasButtonPermission } from '@/utils/permission'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<{
  permission?: string
}>()

const visible = computed(() => hasButtonPermission(props.permission))
</script>
