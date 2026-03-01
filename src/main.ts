import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Toaster } from 'vue-sonner'
import './style.css'
import App from './App.vue'
import router from './router'
import { AuthService } from './modules/auth/AuthService'
import HasPermission from '@/components/common/HasPermission.vue'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Inicializar Auth Listener
AuthService.initAuthListener()

app.component('Toaster', Toaster)
app.component('HasPermission', HasPermission)

app.mount('#app')