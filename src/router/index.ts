import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes'
import { useAuthStore } from '@/stores/auth'
import { AuthService } from '@/modules/auth/AuthService'

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Guard Global de Autenticación
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()

  // Asegurar que el estado de auth esté inicializado
  if (!authStore.isReady) {
    const user = await AuthService.getUser()
    authStore.setUser(user)
    authStore.setReady(true)
  }

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isAuthenticated = !!authStore.user
  const isUpdatePassword = to.name === 'UpdatePassword'

  if (requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && isAuthenticated) {
    next('/')
  } else if (isAuthenticated && isUpdatePassword) {
    // Permitir siempre el acceso a UpdatePassword si está autenticado (viniendo de recuperación)
    next()
  } else {
    next()
  }
})

export default router
