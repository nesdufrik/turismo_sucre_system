import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../auth'

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should initialize with null user and session', () => {
    const store = useAuthStore()
    expect(store.user).toBeNull()
    expect(store.session).toBeNull()
    expect(store.isReady).toBe(false)
  })

  it('should update user', () => {
    const store = useAuthStore()
    const mockUser = { id: '1', email: 'test@test.com' } as any
    store.setUser(mockUser)
    expect(store.user).toEqual(mockUser)
  })

  it('should update session', () => {
    const store = useAuthStore()
    const mockSession = { access_token: 'token' } as any
    store.setSession(mockSession)
    expect(store.session).toEqual(mockSession)
  })

  it('should update ready state', () => {
    const store = useAuthStore()
    store.setReady(true)
    expect(store.isReady).toBe(true)
  })
})
