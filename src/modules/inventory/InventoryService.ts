import { supabase } from '@/lib/supabase'
import type { Tables, TablesInsert, TablesUpdate } from '@/types/database.types'

// Paginación
export type PaginationParams = {
	page: number
	pageSize: number
	search?: string
}

export type PaginationResponse<T> = {
	data: T[]
	count: number | null
}

// Tipo extendido para la UI
export type ServiceWithCategoryAndLocation = Tables<'servicios'> & {
	categoria: {
		nombre: string
		color: string
	}
	ubicacion: {
		ciudad: string
	}
}

export type HotelWithLocation = Tables<'hoteles'> & {
	ubicacion: {
		ciudad: string
	}
}

export class InventoryService {
	// --- Helper Parser ---
	private static parseQuery(query: string) {
		const filters: Record<string, string> = {}
		const regex = /\$([a-zA-Z0-9_]+):([^,$]+)/g
		let match

		while ((match = regex.exec(query)) !== null) {
			if (match[1] && match[2]) {
				filters[match[1]] = match[2].trim()
			}
		}

		const cleanText = query.replace(regex, '').replace(/,/g, ' ').trim()
		return { text: cleanText, filters }
	}

	// --- Servicios ---
	static async getServices(): Promise<ServiceWithCategoryAndLocation[]>
	static async getServices(
		params: PaginationParams,
	): Promise<PaginationResponse<ServiceWithCategoryAndLocation>>
	static async getServices(
		params?: PaginationParams,
	): Promise<
		| ServiceWithCategoryAndLocation[]
		| PaginationResponse<ServiceWithCategoryAndLocation>
	> {
		if (!params) {
			const { data, error } = await supabase
				.from('servicios')
				.select(
					`*,
					categoria:categoriasservicio!inner(nombre, color),
					ubicacion:ubicaciones!inner(ciudad)
				`,
				)
				.order('nombre')
			if (error) throw error
			return data as ServiceWithCategoryAndLocation[]
		}

		let query = supabase
			.from('servicios')
			.select(
				`*,
				categoria:categoriasservicio!inner(nombre, color),
				ubicacion:ubicaciones!inner(ciudad)
			`,
				{ count: 'exact' },
			)
			.order('nombre', { ascending: true })

		// Filtro de búsqueda
		if (params.search) {
			query = query.ilike('nombre', `%${params.search}%`)
		}

		// Rango de paginación
		const from = (params.page - 1) * params.pageSize
		const to = from + params.pageSize - 1

		query = query.range(from, to)

		const { data, error, count } = await query

		if (error) throw error
		return {
			data: data as ServiceWithCategoryAndLocation[],
			count,
		}
	}

	static async searchServices(query: string) {
		const { text, filters } = this.parseQuery(query)

		let q = supabase
			.from('servicios')
			.select(
				`*,
				categoria:categoriasservicio!inner(nombre),
				ubicacion:ubicaciones!inner(ciudad)
			`,
			)
			.order('nombre')
			.limit(20)

		if (text) {
			q = q.ilike('nombre', `%${text}%`)
		}

		if (filters.ciudad) {
			q = q.ilike('ubicacion.ciudad', `%${filters.ciudad}%`)
		}

		if (filters.categoria) {
			q = q.ilike('categoria.nombre', `%${filters.categoria}%`)
		}

		const { data, error } = await q

		if (error) throw error
		return data
	}

	static async getServiceById(id: number) {
		const { data, error } = await supabase
			.from('servicios')
			.select(
				`
        *,
        precios:preciosservicio(*)
      `,
			)
			.eq('servicio_id', id)
			.single()
		if (error) throw error
		return data
	}

	static async createService(service: TablesInsert<'servicios'>) {
		const { data, error } = await supabase
			.from('servicios')
			.insert(service)
			.select()
			.single()
		if (error) throw error
		return data
	}

	static async updateService(id: number, service: TablesUpdate<'servicios'>) {
		const { data, error } = await supabase
			.from('servicios')
			.update(service)
			.eq('servicio_id', id)
			.select()
			.single()
		if (error) throw error
		return data
	}

	static async deleteService(id: number) {
		const { error } = await supabase
			.from('servicios')
			.delete()
			.eq('servicio_id', id)
		if (error) throw error
	}

	// --- Precios de Servicio ---
	static async getServicePrices(serviceId: number) {
		const { data, error } = await supabase
			.from('preciosservicio')
			.select(
				`
        *,
        hoja:hojasdeprecios(nombre)
      `,
			)
			.eq('servicio_id', serviceId)
			.order('hoja_id')
		if (error) throw error
		return data
	}

	static async createServicePrice(price: TablesInsert<'preciosservicio'>) {
		const { data, error } = await supabase
			.from('preciosservicio')
			.insert(price)
			.select()
			.single()
		if (error) throw error
		return data
	}

	static async updateServicePrice(
		id: number,
		price: TablesUpdate<'preciosservicio'>,
	) {
		const { data, error } = await supabase
			.from('preciosservicio')
			.update(price)
			.eq('precio_id', id)
			.select()
			.single()
		if (error) throw error
		return data
	}

	static async deleteServicePrice(id: number) {
		const { error } = await supabase
			.from('preciosservicio')
			.delete()
			.eq('precio_id', id)
		if (error) throw error
	}

	// --- Hoteles ---
	/* static async getHotels() {
		const { data, error } = await supabase
			.from('hoteles')
			.select(
				`
        *,
        ubicacion:ubicaciones(ciudad)
      `,
			)
			.order('nombre')
		if (error) throw error
		return data
	} */

	static async getHotels(): Promise<HotelWithLocation[]>
	static async getHotels(
		params: PaginationParams,
	): Promise<PaginationResponse<HotelWithLocation>>
	static async getHotels(params?: PaginationParams) {
		if (!params) {
			const { data, error } = await supabase
				.from('hoteles')
				.select(
					`
						*,
						ubicacion:ubicaciones(ciudad)
					`,
				)
				.order('nombre')
			if (error) throw error
			return data as HotelWithLocation[]
		}

		let query = supabase
			.from('hoteles')
			.select(
				`
					*,
					ubicacion:ubicaciones!inner(ciudad)
				`,
				{ count: 'exact' },
			)
			.order('nombre', { ascending: true })

		// Filtro de búsqueda
		if (params.search) {
			query = query.ilike('nombre', `%${params.search}%`)
		}

		// Rango de paginación
		const from = (params.page - 1) * params.pageSize
		const to = from + params.pageSize - 1

		query = query.range(from, to)

		const { data, error, count } = await query

		if (error) throw error
		return {
			data,
			count,
		} as PaginationResponse<HotelWithLocation>
	}

	static async searchHotels(query: string) {
		const { text, filters } = this.parseQuery(query)

		let q = supabase
			.from('hoteles')
			.select(
				`
        *,
        ubicacion:ubicaciones!inner(ciudad)
      `,
			)
			.order('nombre')
			.limit(20)

		if (text) {
			q = q.ilike('nombre', `%${text}%`)
		}

		if (filters.ciudad) {
			q = q.ilike('ubicacion.ciudad', `%${filters.ciudad}%`)
		}

		const { data, error } = await q
		if (error) throw error
		return data
	}

	static async getHotelById(id: number) {
		const { data, error } = await supabase
			.from('hoteles')
			.select(
				`
        *,
        habitaciones:tiposhabitacion(*)
      `,
			)
			.eq('hotel_id', id)
			.single()
		if (error) throw error
		return data
	}

	static async createHotel(hotel: TablesInsert<'hoteles'>) {
		const { data, error } = await supabase
			.from('hoteles')
			.insert(hotel)
			.select()
			.single()
		if (error) throw error
		return data
	}

	static async updateHotel(id: number, hotel: TablesUpdate<'hoteles'>) {
		const { data, error } = await supabase
			.from('hoteles')
			.update(hotel)
			.eq('hotel_id', id)
			.select()
			.single()
		if (error) throw error
		return data
	}

	static async deleteHotel(id: number) {
		const { error } = await supabase.from('hoteles').delete().eq('hotel_id', id)
		if (error) throw error
	}

	// --- Tipos de Habitación ---
	static async getRoomTypes(hotelId: number) {
		const { data, error } = await supabase
			.from('tiposhabitacion')
			.select(
				`
				*,
				precios:precioshabitacion(
					precio_por_noche,
					hoja:hojasdeprecios!inner(es_default)
				)
			`,
			)
			.eq('hotel_id', hotelId)
			.order('tipo')
		if (error) throw error
		return data as any[]
	}

	static async createRoomType(room: TablesInsert<'tiposhabitacion'>) {
		const { data, error } = await supabase
			.from('tiposhabitacion')
			.insert(room)
			.select()
			.single()
		if (error) throw error
		return data
	}

	static async updateRoomType(
		id: number,
		room: TablesUpdate<'tiposhabitacion'>,
	) {
		const { data, error } = await supabase
			.from('tiposhabitacion')
			.update(room)
			.eq('habitacion_id', id)
			.select()
			.single()
		if (error) throw error
		return data
	}

	static async deleteRoomType(id: number) {
		const { error } = await supabase
			.from('tiposhabitacion')
			.delete()
			.eq('habitacion_id', id)
		if (error) throw error
	}

	// --- Precios de Habitación ---
	static async getRoomPrices(roomId: number) {
		const { data, error } = await supabase
			.from('precioshabitacion')
			.select(
				`
        *,
        hoja:hojasdeprecios(nombre)
      `,
			)
			.eq('habitacion_id', roomId)
			.order('hoja_id')
		if (error) throw error
		return data
	}

	static async createRoomPrice(price: TablesInsert<'precioshabitacion'>) {
		const { data, error } = await supabase
			.from('precioshabitacion')
			.insert(price)
			.select()
			.single()
		if (error) throw error
		return data
	}

	static async updateRoomPrice(
		id: number,
		price: TablesUpdate<'precioshabitacion'>,
	) {
		const { data, error } = await supabase
			.from('precioshabitacion')
			.update(price)
			.eq('precio_hab_id', id)
			.select()
			.single()
		if (error) throw error
		return data
	}

	static async deleteRoomPrice(id: number) {
		const { error } = await supabase
			.from('precioshabitacion')
			.delete()
			.eq('precio_hab_id', id)
		if (error) throw error
	}

	// --- Paquetes ---
	static async getPackages() {
		const { data, error } = await supabase
			.from('paquetes')
			.select('*')
			.order('nombre_paquete')
		if (error) throw error
		return data
	}

	static async searchPackages(query: string) {
		const { data, error } = await supabase
			.from('paquetes')
			.select('*')
			.ilike('nombre_paquete', `%${query}%`)
			.order('nombre_paquete')
			.limit(20)

		if (error) throw error
		return data
	}

	static async getPackageById(id: number) {
		const { data, error } = await supabase
			.from('paquetes')
			.select(
				`
        *,
        componentes:componentespaquete(
          *,
          servicio:servicios(nombre)
        )
      `,
			)
			.eq('paquete_id', id)
			.single()
		if (error) throw error
		return data
	}

	static async createPackage(pkg: TablesInsert<'paquetes'>) {
		const { data, error } = await supabase
			.from('paquetes')
			.insert(pkg)
			.select()
			.single()
		if (error) throw error
		return data
	}

	static async updatePackage(id: number, pkg: TablesUpdate<'paquetes'>) {
		const { data, error } = await supabase
			.from('paquetes')
			.update(pkg)
			.eq('paquete_id', id)
			.select()
			.single()
		if (error) throw error
		return data
	}

	static async deletePackage(id: number) {
		const { error } = await supabase
			.from('paquetes')
			.delete()
			.eq('paquete_id', id)
		if (error) throw error
	}

	// --- Componentes de Paquete ---
	static async addPackageComponent(
		component: TablesInsert<'componentespaquete'>,
	) {
		const { data, error } = await supabase
			.from('componentespaquete')
			.insert(component)
			.select()
			.single()
		if (error) throw error
		return data
	}

	static async removePackageComponent(packageId: number, serviceId: number) {
		const { error } = await supabase
			.from('componentespaquete')
			.delete()
			.eq('paquete_id', packageId)
			.eq('servicio_id', serviceId)
		if (error) throw error
	}

	static async updatePackageComponent(
		packageId: number,
		serviceId: number,
		updates: TablesUpdate<'componentespaquete'>,
	) {
		const { data, error } = await supabase
			.from('componentespaquete')
			.update(updates)
			.eq('paquete_id', packageId)
			.eq('servicio_id', serviceId)
			.select()
			.single()
		if (error) throw error
		return data
	}
}
