import * as echarts from 'echarts'
import { onBeforeUnmount, ref, shallowRef, type Ref } from 'vue'

export function useEchart(el: Ref<HTMLElement | undefined>) {
  const chart = shallowRef<echarts.ECharts>()
  const initialized = ref(false)

  function init() {
    if (!el.value || initialized.value) return chart.value
    chart.value = echarts.init(el.value)
    initialized.value = true
    window.addEventListener('resize', resize)
    return chart.value
  }

  function setOption(option: echarts.EChartsOption) {
    init()?.setOption(option)
  }

  function resize() {
    chart.value?.resize()
  }

  onBeforeUnmount(() => {
    window.removeEventListener('resize', resize)
    chart.value?.dispose()
  })

  return {
    chart,
    init,
    setOption,
    resize,
  }
}
