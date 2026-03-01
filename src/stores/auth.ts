import { defineStore } from 'pinia'
import type { User, Session } from '@supabase/supabase-js'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import type { Tables } from '@/types/database.types'

type Profile = Tables<'profiles'>

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const session = ref<Session | null>(null)
  const profile = ref<Profile | null>(null)
  const permissions = ref<string[]>([]) // List of permission codes
  const isReady = ref(false)

  function setUser(newUser: User | null) {
    user.value = newUser
  }

  function setSession(newSession: Session | null) {
    session.value = newSession
  }

  function setReady(ready: boolean) {
    isReady.value = ready
  }

  function reset() {
    user.value = null
    session.value = null
    profile.value = null
    permissions.value = []
  }

  async function fetchProfile() {
    if (!user.value) {
      profile.value = null
      permissions.value = []
      return
    }

    // 1. Sincronizar permisos desde el JWT (app_metadata)
    // Esta es ahora nuestra Fuente de Verdad, idéntica a la que usa el RLS en SQL
    const jwtPermissions = user.value.app_metadata?.authorization?.permissions
    if (Array.isArray(jwtPermissions)) {
      permissions.value = jwtPermissions
    } else {
      permissions.value = []
    }

    try {
      // 2. Cargar solo datos de visualización del perfil
      const { data, error } = await supabase
        .from('profiles')
        .select('profile_id, full_name, avatar_url, updated_at, username, email')
        .eq('profile_id', user.value.id)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return
      }

      profile.value = data as Profile
    } catch (e) {
      console.error('Exception fetching profile:', e)
    }
  }

  return {
    user,
    session,
    profile,
    permissions,
    isReady,
    setUser,
    setSession,
    setReady,
    reset,
    fetchProfile,
  }
})
