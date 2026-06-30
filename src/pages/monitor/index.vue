<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('page.monitor.title') }}</h1>
        <p class="page-subtitle">{{ t('page.monitor.subtitle') }}</p>
      </div>
      <el-button type="primary" :icon="Bell" @click="realtimeService.emit()">
        {{ t('page.monitor.emitEvent') }}
      </el-button>
    </div>

    <div class="monitor-grid">
      <div v-for="item in cards" :key="item.label" class="surface monitor-card">
        <div class="monitor-card__head">
          <span class="status-dot" :class="item.level" />
          <el-tag size="small" effect="plain" :type="item.tag">{{ t('common.live') }}</el-tag>
        </div>
        <p>{{ item.label }}</p>
        <strong>{{ item.value }}</strong>
        <small>{{ item.trend }}</small>
      </div>
    </div>

    <section class="monitor-layout">
      <div class="surface event-panel">
        <div class="toolbar">
          <div>
            <h2 class="section-title">{{ t('page.monitor.eventStream') }}</h2>
            <p class="section-subtitle">{{ t('page.monitor.eventStreamSubtitle') }}</p>
          </div>
          <el-button link type="primary" @click="store.markAllRead()">{{
            t('page.monitor.markRead')
          }}</el-button>
        </div>
        <el-timeline class="event-timeline">
          <el-timeline-item
            v-for="item in store.list"
            :key="item.id"
            :timestamp="item.createdAt"
            :type="item.level === 'danger' ? 'danger' : item.level"
          >
            <strong>{{ item.title }}</strong>
            <p>{{ item.content }}</p>
          </el-timeline-item>
        </el-timeline>
      </div>

      <aside class="side-stack">
        <div class="surface log-panel">
          <div>
            <h2 class="section-title">{{ t('page.monitor.systemLogs') }}</h2>
            <p class="section-subtitle">{{ t('page.monitor.systemLogsSubtitle') }}</p>
          </div>
          <div class="console-list">
            <div v-for="line in logLines" :key="line.code" class="console-line">
              <span>{{ line.time }}</span>
              <code>{{ line.code }}</code>
              <p>{{ t(line.textKey) }}</p>
            </div>
          </div>
        </div>

        <div class="surface alert-panel">
          <div>
            <h2 class="section-title">{{ t('page.monitor.alertPanel') }}</h2>
            <p class="section-subtitle">{{ t('page.monitor.alertPanelSubtitle') }}</p>
          </div>
          <div class="alert-list">
            <div v-for="item in alertItems" :key="item.label" class="alert-item">
              <span class="status-dot" :class="item.level" />
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </div>
          </div>
        </div>
      </aside>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Bell } from '@element-plus/icons-vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { realtimeService } from '@/services/realtime'
import { useNotificationStore } from '@/store'

const store = useNotificationStore()
const { t } = useI18n()
const cards = computed(() => [
  {
    label: t('page.monitor.robotsOnline'),
    value: 32,
    level: 'success',
    tag: 'success',
    trend: '+12%',
  },
  {
    label: t('page.monitor.ordersPerMinute'),
    value: 128,
    level: 'info',
    tag: 'primary',
    trend: '+8%',
  },
  {
    label: t('page.monitor.deviceAlerts'),
    value: 4,
    level: 'warning',
    tag: 'warning',
    trend: '-3%',
  },
  { label: t('page.monitor.inventoryRisk'), value: 2, level: 'danger', tag: 'danger', trend: '+1' },
])
const logLines = [
  { time: '09:31:08', code: 'WS-200', textKey: 'page.monitor.log.connected' },
  { time: '09:31:16', code: 'EDGE-ACK', textKey: 'page.monitor.log.heartbeat' },
  { time: '09:31:22', code: 'CACHE-SCAN', textKey: 'page.monitor.log.cache' },
]
const alertItems = computed(() => [
  { label: t('page.monitor.deviceAlerts'), value: 4, level: 'warning' },
  { label: t('page.monitor.inventoryRisk'), value: 2, level: 'danger' },
])
</script>

<style scoped>
.monitor-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.monitor-card {
  min-height: 136px;
  padding: 16px;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.monitor-card:hover {
  border-color: color-mix(in srgb, var(--app-primary) 38%, var(--app-border));
  box-shadow: var(--app-shadow-strong);
}

.monitor-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.monitor-card p {
  margin: 16px 0 8px;
  color: var(--app-muted);
}

.monitor-card strong {
  font-size: 28px;
}

.monitor-card small {
  display: block;
  margin-top: 10px;
  color: var(--app-success);
}

.monitor-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 16px;
  margin-top: 16px;
  align-items: start;
}

.event-panel {
  padding: 18px;
}

.event-timeline {
  margin-top: 18px;
}

.event-panel p {
  margin: 6px 0 0;
  color: var(--app-muted);
}

.side-stack {
  display: grid;
  gap: 16px;
}

.log-panel,
.alert-panel {
  display: grid;
  gap: 16px;
  padding: 18px;
}

.console-list {
  display: grid;
  gap: 8px;
  border-radius: 8px;
  padding: 12px;
  background: var(--app-code-bg);
}

.console-line {
  display: grid;
  grid-template-columns: 70px 88px 1fr;
  gap: 10px;
  align-items: center;
  color: var(--app-code-text);
  font-size: 12px;
}

.console-line span {
  color: #93c5fd;
}

.console-line code {
  color: #fbbf24;
}

.console-line p {
  margin: 0;
  color: #d1d5db;
}

.alert-list {
  display: grid;
  gap: 10px;
}

.alert-item {
  display: grid;
  grid-template-columns: 10px 1fr auto;
  gap: 10px;
  align-items: center;
  border: 1px solid var(--app-border-subtle);
  border-radius: 8px;
  padding: 12px;
  background: var(--app-panel-soft);
}

@media (max-width: 960px) {
  .monitor-grid {
    grid-template-columns: 1fr 1fr;
  }

  .monitor-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .monitor-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .monitor-card {
    min-height: auto;
    padding: 14px;
  }

  .event-panel,
  .log-panel,
  .alert-panel {
    padding: 14px;
  }

  .event-timeline {
    padding-left: 2px;
  }

  .console-line {
    grid-template-columns: 1fr;
    gap: 4px;
    padding: 4px 0;
  }

  .alert-item {
    grid-template-columns: 10px 1fr;
  }

  .alert-item strong {
    grid-column: 2;
  }
}
</style>
