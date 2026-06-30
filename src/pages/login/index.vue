<template>
  <main class="login-page">
    <section class="login-visual">
      <div class="login-hero">
        <div class="brand-lockup">
          <span class="brand-mark">E</span>
          <div>
            <p>{{ t('page.login.brand') }}</p>
            <small>{{ t('page.login.position') }}</small>
          </div>
        </div>
        <h1>{{ t('page.login.headline') }}</h1>
        <span>{{ t('page.login.subtitle') }}</span>
        <div class="hero-proof">
          <div v-for="item in proofItems" :key="item.titleKey">
            <strong>{{ t(item.titleKey) }}</strong>
            <small>{{ t(item.contentKey) }}</small>
          </div>
        </div>
      </div>
    </section>

    <section class="login-panel">
      <div class="login-card surface">
        <el-tag effect="plain" type="primary">{{ t('page.login.demoBadge') }}</el-tag>
        <h2>{{ t('page.login.signIn') }}</h2>
        <p>{{ t('page.login.hint') }}</p>

        <el-form :model="form" label-position="top" @submit.prevent="submit">
          <el-form-item :label="t('page.login.username')">
            <el-input v-model="form.username" :placeholder="t('page.login.usernamePlaceholder')" />
          </el-form-item>
          <el-form-item :label="t('page.login.password')">
            <el-input
              v-model="form.password"
              type="password"
              show-password
              :placeholder="t('page.login.passwordPlaceholder')"
            />
          </el-form-item>
          <el-button class="w-full" type="primary" size="large" :loading="loading" @click="submit">
            {{ t('page.login.login') }}
          </el-button>
        </el-form>

        <div class="account-switch">
          <button type="button" @click="fill('admin')">
            <strong>{{ t('page.login.adminRole') }}</strong>
            <span>admin / admin123</span>
          </button>
          <button type="button" @click="fill('user')">
            <strong>{{ t('page.login.userRole') }}</strong>
            <span>user / user123</span>
          </button>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { useAuthStore } from '@/store'

const auth = useAuthStore()
const { t } = useI18n()
const loading = ref(false)
const form = reactive({
  username: 'admin',
  password: 'admin123',
})
const proofItems = [
  {
    titleKey: 'page.login.proof.rbacTitle',
    contentKey: 'page.login.proof.rbacContent',
  },
  {
    titleKey: 'page.login.proof.schemaTitle',
    contentKey: 'page.login.proof.schemaContent',
  },
  {
    titleKey: 'page.login.proof.realtimeTitle',
    contentKey: 'page.login.proof.realtimeContent',
  },
]

function fill(role: 'admin' | 'user') {
  form.username = role
  form.password = role === 'admin' ? 'admin123' : 'user123'
}

async function submit() {
  loading.value = true
  try {
    await auth.login(form)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  display: grid;
  grid-template-columns: minmax(0, 1.12fr) minmax(380px, 0.88fr);
  min-height: 100vh;
  background:
    linear-gradient(120deg, rgba(15, 23, 42, 0.86), rgba(30, 41, 59, 0.62)),
    url('https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1800&q=80')
      center/cover;
}

.login-visual {
  display: flex;
  align-items: end;
  padding: 64px;
  color: white;
}

.login-hero {
  width: min(760px, 100%);
}

.brand-lockup {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
}

.brand-mark {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.36);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.16);
  font-weight: 800;
}

.login-visual p {
  margin: 0;
  font-weight: 700;
  letter-spacing: 0;
}

.login-visual small {
  display: block;
  margin-top: 4px;
  color: rgba(226, 232, 240, 0.82);
}

.login-visual h1 {
  max-width: 760px;
  margin: 0;
  font-size: 64px;
  line-height: 1.04;
}

.login-visual span {
  display: block;
  max-width: 620px;
  margin-top: 18px;
  color: #dbeafe;
  font-size: 18px;
  line-height: 1.6;
}

.hero-proof {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 34px;
}

.hero-proof div {
  min-height: 104px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 8px;
  padding: 14px;
  background: rgba(15, 23, 42, 0.42);
  backdrop-filter: blur(8px);
}

.hero-proof strong {
  display: block;
  font-size: 15px;
}

.hero-proof small {
  line-height: 1.5;
}

.login-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(244, 246, 248, 0.92);
}

.login-card {
  width: min(420px, 100%);
  padding: 28px;
}

.login-card h2 {
  margin: 12px 0 0;
  font-size: 28px;
}

.login-card p {
  margin: 8px 0 24px;
  color: var(--app-muted);
}

.account-switch {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 16px;
}

.account-switch button {
  min-height: 70px;
  border: 1px solid var(--app-border);
  border-radius: 8px;
  padding: 10px;
  background: var(--app-panel-soft);
  color: var(--app-text);
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    background 0.18s ease;
}

.account-switch button:hover,
.account-switch button:focus-visible {
  border-color: var(--app-primary);
  background: var(--app-panel-muted);
  outline: none;
}

.account-switch strong,
.account-switch span {
  display: block;
}

.account-switch span {
  margin-top: 5px;
  color: var(--app-muted);
  font-size: 12px;
}

@media (max-width: 860px) {
  .login-page {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .login-visual {
    min-height: 44vh;
    padding: 32px;
  }

  .hero-proof {
    grid-template-columns: 1fr;
  }

  .login-visual h1 {
    font-size: 36px;
  }
}

@media (max-width: 1180px) and (min-width: 861px) {
  .login-visual {
    padding: 48px;
  }

  .login-visual h1 {
    font-size: 48px;
  }

  .hero-proof {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .login-visual {
    align-items: start;
    min-height: auto;
    padding: 28px 20px;
  }

  .brand-lockup {
    margin-bottom: 22px;
  }

  .login-visual h1 {
    font-size: 30px;
    line-height: 1.12;
  }

  .login-visual span {
    margin-top: 14px;
    font-size: 15px;
  }

  .hero-proof {
    margin-top: 22px;
  }

  .hero-proof div {
    min-height: auto;
  }

  .login-panel {
    align-items: start;
    padding: 16px;
  }

  .login-card {
    padding: 20px;
  }

  .account-switch {
    grid-template-columns: 1fr;
  }
}
</style>
