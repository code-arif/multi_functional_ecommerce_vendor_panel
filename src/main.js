import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Toast, { POSITION } from 'vue-toastification'
import App from './App.vue'
import router from './router'
import 'vue-toastification/dist/index.css'
import './assets/css/toast.css'
import './assets/css/main.css'

const app   = createApp(App)
const pinia = createPinia()

app.use(pinia).use(router)
app.use(Toast, { position: POSITION.TOP_RIGHT, timeout: 3000, maxToasts: 3 })

import { setVendorInactiveHandler } from './api'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore(pinia)
setVendorInactiveHandler((payload) => {
  authStore.setInactiveShopStatus(payload?.status || 'pending', payload?.rejection_reason ?? null)
  if (router.currentRoute.value.path !== '/account-status') {
    router.replace('/account-status')
  }
})

authStore.fetchMe().then(() => app.mount('#app'))
