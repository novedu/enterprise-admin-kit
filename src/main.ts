import '@unocss/reset/tailwind.css'
import 'element-plus/dist/index.css'
import 'highlight.js/styles/github-dark.css'
import './styles/theme.css'
import './styles/main.css'
import 'virtual:uno.css'

import ElementPlus from 'element-plus'
import { createPinia } from 'pinia'
import { createApp } from 'vue'

import App from './App.vue'
import { registerPermissionDirective } from './directives/permission'
import { i18n } from './locales'
import { realtimeService } from './services/realtime'
import router from './router'

if (import.meta.env.VITE_USE_BROWSER_MOCK !== 'false') {
  await import('./services/mock')
}

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)
app.use(ElementPlus)
registerPermissionDirective(app)

app.mount('#app')
realtimeService.start()
