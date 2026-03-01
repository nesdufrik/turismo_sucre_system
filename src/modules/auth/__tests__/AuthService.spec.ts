import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { AuthService } from '../AuthService'
import { supabase } from '@/lib/supabase'

// Mock @/lib/supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      getUser: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
  },
}))

describe('AuthService', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('should call signInWithPassword with correct credentials', async () => {
      const email = 'test@example.com'
      const password = 'password123'
      const mockData = { user: { id: '1' }, session: { access_token: 'token' } }
      
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: mockData as any,
        error: null,
      })

      const result = await AuthService.login(email, password)
      
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({ email, password })
      expect(result).toEqual(mockData)
    })

    it('should throw error if signInWithPassword fails', async () => {
      const error = { message: 'Invalid login credentials' }
      
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null } as any,
        error: error as any,
      })

      await expect(AuthService.login('test', 'pass')).rejects.toEqual(error)
    })
  })

  describe('getUser', () => {
    it('should return user when supabase returns data', async () => {
      const mockUser = { id: '1', email: 'test@test.com' }
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser } as any,
        error: null,
      })

      const user = await AuthService.getUser()
      expect(user).toEqual(mockUser)
    })

    it('should return null when supabase returns error (missing session)', async () => {
      // This test verifies the fix for the "AuthSessionMissingError"
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null } as any,
        error: { message: 'Auth session missing', name: 'AuthSessionMissingError', status: 400 } as any,
      })

      const user = await AuthService.getUser()
      expect(user).toBeNull()
    })
  })

  describe('signOut', () => {
    it('should call signOut and clear auth store', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null })
      
      // We need to import the store to check if it was cleared, 
      // but AuthService imports it internally. 
      // We can trust the store logic or import it here to verify state.
      const { useAuthStore } = await import('@/stores/auth')
      const authStore = useAuthStore()
      authStore.setUser({ id: '1' } as any) // set initial state

      await AuthService.signOut()

      expect(supabase.auth.signOut).toHaveBeenCalled()
      expect(authStore.user).toBeNull()
    })
  })
})
