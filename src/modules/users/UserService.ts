import { supabase } from '@/lib/supabase'
import type { Tables, TablesUpdate } from '@/types/database.types'

export type Profile = Tables<'profiles'> & { status: 'active' | 'inactive' } // Manually extended until codegen
export type Role = Tables<'roles'>

export type UserWithRole = Profile & {
	user_roles: {
		roles: {
			name: string
			description: string | null
		} | null
	}[]
}

export type Invite = {
	id: string
	email: string
	role: string
	token: string
	created_at: string
	expires_at: string
}

export const UserService = {
	async getUsers() {
		// Obtenemos perfiles y su rol actual
		// user_roles es un array, pero nuestra logica de negocio fuerza 1 rol principal.
		const { data, error } = await supabase
			.from('profiles')
			.select(
				`
                *,
                user_roles:user_roles!user_roles_user_id_fkey (
                    roles (
                        name,
                        description
                    )
                )
            `
			)
			.order('full_name')

		if (error) throw error
		return data as unknown as UserWithRole[]
	},

	async getAvailableRoles() {
		const { data, error } = await supabase
			.from('roles')
			.select('*')
			.order('name')

		if (error) throw error
		return data as Role[]
	},

	// Invitations
	async createInvitation(email: string, role: string) {
		const { data, error } = await supabase
			.from('user_invites')
			.insert({ email, role })
			.select()
			.single()

		if (error) throw error
		return data as Invite
	},

	async getPendingInvitations() {
		const { data, error } = await supabase
			.from('user_invites')
			.select('*')
			.order('created_at', { ascending: false })

		if (error) throw error
		return data as Invite[]
	},

	async revokeInvitation(id: string) {
		const { error } = await supabase.from('user_invites').delete().eq('id', id)

		if (error) throw error
	},

	async validateInviteToken(token: string) {
		const { data, error } = await supabase.rpc('get_invite_details', {
			lookup_token: token,
		})

		if (error) throw error

		return data as { valid: boolean; email?: string; role?: string }
	},

	async toggleStatus(userId: string, newStatus: 'active' | 'inactive') {
		const { error } = await supabase.rpc('toggle_user_status', {
			target_user_id: userId,

			new_status: newStatus,
		})

		if (error) throw error
	},

	async assignRole(userId: string, roleName: string) {
		const { error } = await supabase.rpc('assign_user_role', {
			target_user_id: userId,
			target_role_name: roleName,
		})

		if (error) throw error
	},

	async removeUserRoles(userId: string) {
		const { error } = await supabase.rpc('remove_user_roles', {
			target_user_id: userId,
		})

		if (error) throw error
	},

    async updateProfile(id: string, updates: TablesUpdate<'profiles'>) {
        const { data, error } = await supabase.from('profiles').update(updates).eq('profile_id', id).select().single()
        if (error) throw error
        return data
    },

    /**
     * Extrae el nombre del archivo de una URL pública de Supabase Storage
     */
    getFileNameFromUrl(url: string) {
        if (!url) return null
        const parts = url.split('/')
        return parts[parts.length - 1]
    },

    /**
     * Elimina un archivo del bucket de avatars
     */
    async deleteAvatarFile(url: string) {
        const fileName = this.getFileNameFromUrl(url)
        if (!fileName) return

        const { error } = await supabase.storage
            .from('avatars')
            .remove([`avatars/${fileName}`])
        
        if (error) {
            console.error('Error deleting file from storage:', error)
        }
    },

    async uploadAvatar(file: File) {
        const fileName = file.name // El nombre ya viene procesado como .webp desde el componente
        const filePath = `avatars/${fileName}`

        const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file)
        
        if (uploadError) {
            throw new Error('Error al subir imagen al servidor')
        }

        const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
        return data.publicUrl
    }
}