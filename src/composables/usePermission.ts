import { useAuthStore } from '@/stores/auth'

export function usePermission() {
  const authStore = useAuthStore()

  const can = (permissionCode: string) => {
    // If not authenticated, definitely no
    if (!authStore.user) return false

    // If permissions haven't loaded yet, default to false (secure)
    // or true if we want optimistic UI (but false is safer).
    // Given we await fetchProfile in router guard, they should be loaded.
    
    return authStore.permissions.includes(permissionCode)
  }

  const is = (_roleName: string) => {
    // We could implement this if we stored role names in authStore too,
    // but permissions are preferred.
    // For now, let's keep it simple or not use it.
    return false 
  }

  return { can, is }
}
