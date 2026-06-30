<template>
  <div class="page">
    <section class="positioning-panel">
      <div>
        <el-tag effect="plain" type="primary">{{ t('page.dashboard.positionBadge') }}</el-tag>
        <h1 class="page-title">{{ t('page.dashboard.title') }}</h1>
        <p class="page-subtitle">{{ t('page.dashboard.subtitle') }}</p>
      </div>
      <div class="positioning-actions">
        <el-tag type="success">{{ t('page.dashboard.realtimeMock') }}</el-tag>
        <el-button type="primary" :loading="loading" @click="refetch">{{
          t('common.refetch')
        }}</el-button>
      </div>
    </section>

    <section class="capability-grid">
      <div v-for="item in capabilityItems" :key="item.titleKey" class="capability-card surface">
        <el-icon>
          <component :is="item.icon" />
        </el-icon>
        <div>
          <strong>{{ t(item.titleKey) }}</strong>
          <p>{{ t(item.contentKey) }}</p>
        </div>
      </div>
    </section>

    <div class="metric-grid">
      <div v-for="item in data?.metrics" :key="item.label" class="metric surface">
        <div class="metric-icon" :class="item.level">
          <span class="status-dot" :class="item.level" />
        </div>
        <div>
          <p>{{ item.labelKey ? t(item.labelKey) : item.label }}</p>
          <strong>{{ getMetricValue(item) }}</strong>
          <small>{{ item.trend }}</small>
        </div>
      </div>
    </div>

    <section class="dashboard-grid">
      <div class="surface chart-panel">
        <div class="toolbar">
          <strong>{{ t('page.dashboard.ordersAndSales') }}</strong>
          <div class="dashboard-actions">
            <el-segmented v-model="mode" :options="modeOptions" />
          </div>
        </div>
        <div ref="chartEl" class="chart" />
      </div>

      <div class="surface server-panel">
        <div class="toolbar">
          <div>
            <h2 class="section-title">{{ t('page.dashboard.serverStatus') }}</h2>
            <p class="section-subtitle">{{ t('page.dashboard.serverSubtitle') }}</p>
          </div>
          <el-tag type="success">{{ t('page.dashboard.status.healthy') }}</el-tag>
        </div>
        <div class="server-bars">
          <div>
            <span>{{ t('page.dashboard.cpu') }}</span>
            <el-progress :percentage="data?.server.cpu || 0" />
          </div>
          <div>
            <span>{{ t('page.dashboard.memory') }}</span>
            <el-progress :percentage="data?.server.memory || 0" color="#d97706" />
          </div>
          <div>
            <span>{{ t('page.dashboard.network') }}</span>
            <el-progress :percentage="data?.server.network || 0" color="#16a34a" />
          </div>
        </div>
      </div>
    </section>

    <section class="surface activity-panel">
      <div>
        <h2 class="section-title">{{ t('page.dashboard.activityTitle') }}</h2>
        <p class="section-subtitle">{{ t('page.dashboard.activitySubtitle') }}</p>
      </div>
      <div class="activity-list">
        <div v-for="item in activityItems" :key="item.titleKey" class="activity-item">
          <span class="status-dot" :class="item.level" />
          <div>
            <strong>{{ t(item.titleKey) }}</strong>
            <p>{{ t(item.contentKey) }}</p>
          </div>
          <time>{{ item.time }}</time>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ChatDotRound, DataLine, Lock, Monitor, Operation, Tickets } from '@element-plus/icons-vue'
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import type { DashboardData } from '@/api/dashboard'
import { dashboardCacheKey, getDashboard } from '@/api/dashboard'
import { useRequestCache } from '@/composables/useRequestCache'
import { useEchart } from '@/hooks/useEchart'

const mode = ref<'orders' | 'sales'>('orders')
const { t } = useI18n()
const chartEl = ref<HTMLElement>()
const chart = useEchart(chartEl)
const { data, loading, refetch } = useRequestCache(dashboardCacheKey, getDashboard, {
  staleTime: 20_000,
  cacheTime: 3 * 60_000,
})
const modeOptions = computed(() => [
  { label: t('page.dashboard.mode.orders'), value: 'orders' },
  { label: t('page.dashboard.mode.sales'), value: 'sales' },
])
const capabilityItems = [
  {
    titleKey: 'page.dashboard.capability.rbacTitle',
    contentKey: 'page.dashboard.capability.rbacContent',
    icon: Lock,
  },
  {
    titleKey: 'page.dashboard.capability.schemaTitle',
    contentKey: 'page.dashboard.capability.schemaContent',
    icon: Operation,
  },
  {
    titleKey: 'page.dashboard.capability.tableTitle',
    contentKey: 'page.dashboard.capability.tableContent',
    icon: Tickets,
  },
  {
    titleKey: 'page.dashboard.capability.aiTitle',
    contentKey: 'page.dashboard.capability.aiContent',
    icon: ChatDotRound,
  },
  {
    titleKey: 'page.dashboard.capability.monitorTitle',
    contentKey: 'page.dashboard.capability.monitorContent',
    icon: Monitor,
  },
  {
    titleKey: 'page.dashboard.capability.visualTitle',
    contentKey: 'page.dashboard.capability.visualContent',
    icon: DataLine,
  },
]
const activityItems = computed(() => [
  {
    titleKey: 'page.dashboard.activity.rbacTitle',
    contentKey: 'page.dashboard.activity.rbacContent',
    time: '09:12',
    level: 'success',
  },
  {
    titleKey: 'page.dashboard.activity.schemaTitle',
    contentKey: 'page.dashboard.activity.schemaContent',
    time: '09:18',
    level: 'info',
  },
  {
    titleKey: 'page.dashboard.activity.alertTitle',
    contentKey: 'page.dashboard.activity.alertContent',
    time: '09:26',
    level: 'warning',
  },
])

function draw() {
  if (!data.value) return
  chart.setOption({
    color: ['#2563eb', '#16a34a'],
    tooltip: {
      trigger: 'axis',
    },
    grid: {
      left: 36,
      right: 16,
      top: 32,
      bottom: 28,
    },
    xAxis: {
      type: 'category',
      data: data.value.sales.map((item) => item.date),
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: mode.value,
        type: mode.value === 'orders' ? 'bar' : 'line',
        smooth: true,
        data: data.value.sales.map((item) => item[mode.value]),
      },
    ],
  })
}

function getMetricValue(item: DashboardData['metrics'][number]) {
  if (item.labelKey === 'page.dashboard.metric.serverStatus') {
    return t('page.dashboard.status.stable')
  }

  return item.value
}

watch([mode, data], async () => {
  await nextTick()
  draw()
})
</script>

<style scoped>
.positioning-panel {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 16px;
  border: 1px solid var(--app-border);
  border-radius: 8px;
  padding: 20px;
  background:
    linear-gradient(
      135deg,
      color-mix(in srgb, var(--app-primary) 9%, transparent),
      transparent 48%
    ),
    var(--app-panel);
  box-shadow: var(--app-shadow);
}

.positioning-panel .page-title {
  margin-top: 12px;
}

.positioning-panel .page-subtitle {
  max-width: 760px;
  line-height: 1.6;
}

.positioning-actions {
  display: flex;
  flex: 0 0 auto;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
}

.capability-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.capability-card {
  display: grid;
  grid-template-columns: 38px 1fr;
  gap: 12px;
  min-height: 112px;
  padding: 16px;
  transition:
    border-color 0.18s ease,
    background 0.18s ease;
}

.capability-card:hover {
  border-color: color-mix(in srgb, var(--app-primary) 42%, var(--app-border));
  background: var(--app-panel-muted);
}

.capability-card .el-icon {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border-radius: 8px;
  background: var(--app-panel-muted);
  color: var(--app-primary);
  font-size: 18px;
}

.capability-card strong {
  color: var(--app-heading);
}

.capability-card p {
  margin: 6px 0 0;
  color: var(--app-muted);
  font-size: 13px;
  line-height: 1.5;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.metric {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.metric:hover {
  transform: translateY(-2px);
  box-shadow: var(--app-shadow-strong);
}

.metric-icon {
  display: grid;
  width: 44px;
  height: 44px;
  flex: 0 0 44px;
  place-items: center;
  border-radius: 8px;
  background: var(--app-panel-soft);
}

.metric p {
  margin: 0;
  color: var(--app-muted);
}

.metric strong {
  display: block;
  margin-top: 8px;
  font-size: 28px;
}

.metric small {
  color: var(--app-success);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(300px, 0.5fr);
  gap: 16px;
  margin-top: 16px;
}

.chart-panel,
.server-panel {
  padding: 18px;
}

.chart {
  width: 100%;
  height: 360px;
}

.server-bars {
  display: grid;
  gap: 22px;
  margin-top: 28px;
}

.activity-panel {
  display: grid;
  gap: 16px;
  margin-top: 16px;
  padding: 18px;
}

.activity-list {
  display: grid;
  gap: 10px;
}

.activity-item {
  display: grid;
  grid-template-columns: 12px 1fr auto;
  gap: 12px;
  align-items: start;
  border: 1px solid var(--app-border-subtle);
  border-radius: 8px;
  padding: 12px;
  background: var(--app-panel-soft);
}

.activity-item p {
  margin: 4px 0 0;
  color: var(--app-muted);
}

.activity-item time {
  color: var(--app-muted);
  font-size: 12px;
}

.server-bars span {
  display: block;
  margin-bottom: 8px;
  color: var(--app-muted);
}

.dashboard-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

@media (max-width: 960px) {
  .positioning-panel {
    display: grid;
  }

  .positioning-actions {
    justify-content: flex-start;
  }

  .capability-grid {
    grid-template-columns: 1fr;
  }

  .metric-grid,
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 1220px) and (min-width: 961px) {
  .capability-grid,
  .metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .positioning-panel,
  .chart-panel,
  .server-panel,
  .activity-panel {
    padding: 14px;
  }

  .positioning-actions,
  .dashboard-actions {
    width: 100%;
  }

  .positioning-actions .el-button,
  .dashboard-actions :deep(.el-segmented) {
    width: 100%;
  }

  .capability-card {
    grid-template-columns: 34px 1fr;
    min-height: auto;
    padding: 14px;
  }

  .metric {
    padding: 14px;
  }

  .metric strong {
    font-size: 24px;
  }

  .chart {
    height: 280px;
  }

  .activity-item {
    grid-template-columns: 10px 1fr;
  }

  .activity-item time {
    grid-column: 2;
  }
}
</style>
