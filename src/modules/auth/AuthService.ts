import { supabase } from '@/lib/supabase'
import type { RegisterCredentials } from '@/types/auth'
import { useAuthStore } from '@/stores/auth'

export class AuthService {
	static async login(email: string, password: string) {
		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password,
		})

		if (error) throw error
		return data
	}

	static async register(credentials: RegisterCredentials) {
		const { data, error } = await supabase.auth.signUp({
			email: credentials.email,
			password: credentials.password,
			options: credentials.options,
		})

		if (error) throw error
		return data
	}

	static async signOut() {
		const { error } = await supabase.auth.signOut()
		if (error) throw error

		const authStore = useAuthStore()
		authStore.reset()
	}

	static async getSession() {
		const { data, error } = await supabase.auth.getSession()
		if (error) throw error
		return data.session
	}

	static async getUser() {
		const {
			data: { user },
			error,
		} = await supabase.auth.getUser()
		if (error) {
			// Si no hay sesión, simplemente devolvemos null en lugar de lanzar error
			// Esto evita que el router guard explote
			return null
		}
		return user
	}

	// Inicializa el listener de auth
	static initAuthListener() {
		const authStore = useAuthStore()
        const router = import('@/router')

		supabase.auth.onAuthStateChange(async (event, session) => {
			if (session) {
				authStore.setSession(session)
				authStore.setUser(session.user)
                
                // Si el evento es recuperación de contraseña, redirigimos a la vista de actualización
                if (event === 'PASSWORD_RECOVERY') {
                    const r = await router
                    r.default.push({ name: 'UpdatePassword' })
                }
			} else {
				authStore.reset()
			}
			authStore.setReady(true)
		})
	}
}
