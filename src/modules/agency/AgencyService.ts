import { supabase } from '@/lib/supabase'
import type { Tables, TablesUpdate } from '@/types/database.types'

export const AgencyService = {
	async getAgencyProfile() {
		const { data, error } = await supabase
			.from('configuracion_sistema')
			.select('*')
			.limit(1)
			.single()

		if (error && error.code !== 'PGRST116') throw error
		return data as Tables<'configuracion_sistema'> | null
	},

	async updateAgencyProfile(
		id: string,
		updates: TablesUpdate<'configuracion_sistema'>,
	) {
		const { data, error } = await supabase
			.from('configuracion_sistema')
			.update(updates)
			.eq('id', id)
			.select()
			.single()

		if (error) throw error
		return data as Tables<'configuracion_sistema'>
	},

	getFileNameFromUrl(url: string) {
		if (!url) return null
		const parts = url.split('/')
		return parts[parts.length - 1]
	},

	async deleteLogoFile(url: string) {
		const fileName = this.getFileNameFromUrl(url)
		if (!fileName) return

		const { error } = await supabase.storage
			.from('company_assets')
			.remove([fileName])

		if (error) {
			console.error('Error deleting file from storage:', error)
		}
	},

	async uploadLogo(file: File) {
		const fileName = `logo_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`

		const { error: uploadError } = await supabase.storage
			.from('company_assets')
			.upload(fileName, file)

		if (uploadError) {
			throw new Error('Error al subir imagen al servidor')
		}

		const { data } = supabase.storage
			.from('company_assets')
			.getPublicUrl(fileName)
		return data.publicUrl
	},
}
