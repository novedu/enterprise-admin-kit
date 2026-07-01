<template>
  <section class="console-grid observability-grid">
    <div class="surface panel">
      <div class="panel-head">
        <div>
          <h2 class="section-title">{{ t('page.ai.observability.traceTitle') }}</h2>
          <p class="section-subtitle">{{ t('page.ai.observability.traceSubtitle') }}</p>
        </div>
        <div class="inline-actions">
          <el-tag effect="plain">{{ scopeLabel }}</el-tag>
          <el-button :icon="Delete" @click="clearObservability">
            {{ t('page.ai.actions.clear') }}
          </el-button>
        </div>
      </div>
      <div class="trace-list">
        <button
          v-for="trace in snapshot.traces"
          :key="trace.traceId"
          class="trace-item"
          :class="{ active: selectedTraceId === trace.traceId }"
          @click="openTrace(trace.traceId)"
        >
          <strong>{{ trace.traceId }}</strong>
          <span>{{ trace.provider }} / {{ trace.model }}</span>
          <el-tag size="small" :type="traceStatusType(trace.status)">
            {{ trace.status }}
          </el-tag>
        </button>
        <el-empty
          v-if="!snapshot.traces.length"
          :description="t('page.ai.observability.noTraces')"
        />
      </div>
    </div>

    <div class="surface panel">
      <div class="panel-head">
        <div>
          <h2 class="section-title">{{ t('page.ai.observability.tokenTitle') }}</h2>
          <p class="section-subtitle">{{ t('page.ai.observability.tokenSubtitle') }}</p>
        </div>
        <el-tag>
          {{
            t('page.ai.observability.tokenCount', {
              count: selectedTokenUsage?.totalTokens || 0,
            })
          }}
        </el-tag>
      </div>
      <div class="bar-stack">
        <div class="bar-row">
          <span>{{ t('page.ai.observability.promptTokens') }}</span>
          <div>
            <i
              :style="{
                width: tokenBarWidth(
                  selectedTokenUsage?.totalTokens,
                  selectedTokenUsage?.promptTokens,
                ),
              }"
            />
          </div>
          <b>{{ selectedTokenUsage?.promptTokens || 0 }}</b>
        </div>
        <div class="bar-row">
          <span>{{ t('page.ai.observability.completionTokens') }}</span>
          <div class="completion">
            <i
              :style="{
                width: tokenBarWidth(
                  selectedTokenUsage?.totalTokens,
                  selectedTokenUsage?.completionTokens,
                ),
              }"
            />
          </div>
          <b>{{ selectedTokenUsage?.completionTokens || 0 }}</b>
        </div>
      </div>
    </div>

    <div class="surface panel">
      <div class="panel-head">
        <div>
          <h2 class="section-title">{{ t('page.ai.observability.latencyTitle') }}</h2>
          <p class="section-subtitle">{{ t('page.ai.observability.latencySubtitle') }}</p>
        </div>
      </div>
      <div class="latency-grid">
        <div>
          <span>{{ t('page.ai.observability.ttft') }}</span>
          <strong>{{ selectedLatency?.timeToFirstToken || 0 }}ms</strong>
        </div>
        <div>
          <span>{{ t('page.ai.observability.total') }}</span>
          <strong>{{ selectedLatency?.totalRequestTime || 0 }}ms</strong>
        </div>
        <div>
          <span>{{ t('page.ai.observability.chunks') }}</span>
          <strong>{{ selectedLatency?.chunkCount || 0 }}</strong>
        </div>
        <div>
          <span>{{ t('page.ai.observability.rate') }}</span>
          <strong>{{ formatRate(selectedLatency?.chunkRate) }}/s</strong>
        </div>
      </div>
    </div>

    <div class="surface panel wide-panel">
      <div class="panel-head">
        <div>
          <h2 class="section-title">{{ t('page.ai.observability.timelineTitle') }}</h2>
          <p class="section-subtitle">{{ t('page.ai.observability.timelineSubtitle') }}</p>
        </div>
      </div>
      <div class="timeline">
        <div
          v-for="event in selectedEvents"
          :key="`${event.traceId}-${event.timestamp}-${event.type}`"
        >
          <span class="timeline-dot" />
          <strong>{{ event.type }}</strong>
          <small>{{ new Date(event.timestamp).toLocaleTimeString() }}</small>
          <code>{{ summarizeEvent(event.payload) }}</code>
        </div>
        <el-empty
          v-if="!selectedEvents.length"
          :description="t('page.ai.observability.noEvents')"
        />
      </div>
      <div class="chunk-strip">
        <span v-for="(chunk, index) in chunkEvents" :key="`${chunk.timestamp}-${index}`">
          {{ getChunkText(chunk.payload) }}
        </span>
      </div>
    </div>

    <el-drawer v-model="detailVisible" :title="selectedTrace?.traceId" size="min(560px, 90vw)">
      <div class="timeline">
        <div
          v-for="event in selectedEvents"
          :key="`drawer-${event.traceId}-${event.timestamp}-${event.type}`"
        >
          <span class="timeline-dot" />
          <strong>{{ event.type }}</strong>
          <small>{{ new Date(event.timestamp).toLocaleTimeString() }}</small>
          <code>{{ summarizeEvent(event.payload) }}</code>
        </div>
      </div>
    </el-drawer>
  </section>
</template>

<script setup lang="ts">
defineOptions({
  name: 'AiObservabilityConsole',
})

import { Delete } from '@element-plus/icons-vue'
import { onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import {
  formatRate,
  getChunkText,
  summarizeEvent,
  tokenBarWidth,
  traceStatusType,
  useRuntimeObservability,
} from '../shared/useAiControlPlane'

const { t } = useI18n()
const detailVisible = ref(false)
const {
  snapshot,
  selectedTraceId,
  selectedTrace,
  selectedTokenUsage,
  selectedLatency,
  selectedEvents,
  chunkEvents,
  scopeLabel,
  startObservability,
  stopObservability,
  clearObservability,
} = useRuntimeObservability()

function openTrace(traceId: string) {
  selectedTraceId.value = traceId
  detailVisible.value = true
}

onMounted(startObservability)
onUnmounted(stopObservability)
</script>
