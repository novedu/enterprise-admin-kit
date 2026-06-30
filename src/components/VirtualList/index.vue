<template>
  <div ref="wrapperRef" class="virtual-list" :style="{ height: `${height}px` }" @scroll="handleScroll">
    <div class="virtual-list__phantom" :style="{ height: `${totalHeight}px` }" />
    <div class="virtual-list__content" :style="{ transform: `translateY(${offsetY}px)` }">
      <template v-for="virtualItem in visibleItems" :key="getItemKey(virtualItem.item, virtualItem.index)">
        <slot :item="virtualItem.item" :index="virtualItem.index" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends Record<string, unknown>">
import { computed, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    items: T[]
    height?: number
    rowHeight?: number
    buffer?: number
    itemKey?: keyof T | ((item: T, index: number) => string | number)
    loadMoreThreshold?: number
  }>(),
  {
    height: 480,
    rowHeight: 48,
    buffer: 6,
    loadMoreThreshold: 120,
  },
)

const emit = defineEmits<{
  reachEnd: []
}>()

const wrapperRef = ref<HTMLElement>()
const scrollTop = ref(0)
const reachedEnd = ref(false)

const totalHeight = computed(() => props.items.length * props.rowHeight)
const visibleCount = computed(() => Math.ceil(props.height / props.rowHeight) + props.buffer * 2)
const startIndex = computed(() => Math.max(Math.floor(scrollTop.value / props.rowHeight) - props.buffer, 0))
const endIndex = computed(() => Math.min(startIndex.value + visibleCount.value, props.items.length))
const offsetY = computed(() => startIndex.value * props.rowHeight)
const visibleItems = computed(() =>
  props.items.slice(startIndex.value, endIndex.value).map((item, index) => ({
    item,
    index: startIndex.value + index,
  })),
)

function getItemKey(item: T, index: number) {
  if (typeof props.itemKey === 'function') {
    return props.itemKey(item, index)
  }

  if (props.itemKey) {
    return String(item[props.itemKey])
  }

  return index
}

function handleScroll(event: Event) {
  const target = event.target as HTMLElement
  scrollTop.value = target.scrollTop

  const distanceToBottom = target.scrollHeight - target.scrollTop - target.clientHeight
  if (distanceToBottom <= props.loadMoreThreshold) {
    if (!reachedEnd.value) {
      reachedEnd.value = true
      emit('reachEnd')
    }
    return
  }

  reachedEnd.value = false
}

function scrollToTop() {
  if (!wrapperRef.value) return
  wrapperRef.value.scrollTop = 0
  scrollTop.value = 0
}

defineExpose({
  scrollToTop,
})
</script>

<style scoped>
.virtual-list {
  position: relative;
  overflow: auto;
  border: 1px solid var(--app-border);
  border-top: 0;
}

.virtual-list__phantom {
  width: 1px;
  opacity: 0;
}

.virtual-list__content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  will-change: transform;
}
</style>
