import { supabase } from '@/lib/supabase'
import type { Tables, TablesInsert, TablesUpdate } from '@/types/database.types'
import { PriceCalculator } from './domain/PriceCalculator'

export type Quote = Tables<'cotizaciones'>
export type QuoteInsert = TablesInsert<'cotizaciones'>
export type QuoteUpdate = TablesUpdate<'cotizaciones'>

export type QuoteItem = Tables<'itemscotizacion'>
export type QuoteItemInsert = TablesInsert<'itemscotizacion'>
export type QuoteItemUpdate = TablesUpdate<'itemscotizacion'>

// Paginación
export interface QuotePaginationParams {
  page: number
  pageSize: number
  search?: string
  status?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number | null
}

// Tipo extendido para la UI
export type QuoteWithClient = Quote & {
	clientes: {
		nombre_completo: string | null
		email: string | null
		empresa: string | null
	} | null
}

export type QuoteItemWithDetails = QuoteItem & {
	servicios?: Pick<Tables<'servicios'>, 'nombre' | 'codigo'> | null
	tiposhabitacion?:
		| (Pick<Tables<'tiposhabitacion'>, 'tipo' | 'hotel_id'> & {
				hoteles: Pick<Tables<'hoteles'>, 'nombre'> | null
		  })
		| null
	paquetes?: Pick<Tables<'paquetes'>, 'nombre_paquete'> | null
}

export const QuoteService = {
	// --- Quotes Header ---

	async getQuotes(params?: QuotePaginationParams): Promise<PaginatedResponse<QuoteWithClient> | QuoteWithClient[]> {
		// CASO 1: Consulta normal sin parámetros (usamos tablas originales)
        if (!params) {
            const { data, error } = await supabase
                .from('cotizaciones')
                .select(`
                    *,
                    clientes (
                        nombre_completo,
                        email,
                        empresa
                    )
                `)
                .order('fecha_creacion', { ascending: false })

            if (error) throw error
            return data as QuoteWithClient[]
        }

        // CASO 2: Con parámetros (usamos la VISTA para búsqueda y paginación)
		let queryBuilder = supabase
			.from('v_cotizaciones_detalles')
			.select('*', { count: 'exact' })
			.order('fecha_creacion', { ascending: false })

        // Filtros de búsqueda
        const s = params.search?.trim()
        if (s) {
            const isNum = !isNaN(Number(s))
            if (isNum) {
                // Prioridad ID exacto o coincidencia en grupo/cliente/código
                queryBuilder = queryBuilder.or(`cotizacion_id.eq.${s},codigo_referencia.ilike.%${s}%,nombre_grupo.ilike.%${s}%,cliente_nombre.ilike.%${s}%`)
            } else {
                queryBuilder = queryBuilder.or(`codigo_referencia.ilike.%${s}%,nombre_grupo.ilike.%${s}%,cliente_nombre.ilike.%${s}%,cliente_email.ilike.%${s}%`)
            }
        }

        // Filtro de estado
        if (params.status && params.status !== 'all') {
            queryBuilder = queryBuilder.eq('estado', params.status)
        }

        // Rango de paginación
        const from = (params.page - 1) * params.pageSize
        const to = from + params.pageSize - 1
        queryBuilder = queryBuilder.range(from, to)

        const { data, error, count } = await queryBuilder
        if (error) throw error

        // Mapeo para mantener la estructura de 'clientes' anidada que espera el frontend
        const mappedData = (data || []).map(q => ({
            ...q,
            clientes: {
                nombre_completo: q.cliente_nombre,
                email: q.cliente_email,
                empresa: q.cliente_empresa
            }
        }))

        return {
            data: mappedData as any[], // Usamos any temporalmente para el build
            count
        }
	},

	async getQuoteById(id: number) {
		const { data, error } = await supabase
			.from('cotizaciones')
			.select(
				`
        *,
        clientes (
          *
        )
      `
			)
			.eq('cotizacion_id', id)
			.single()

		if (error) throw error
		return data
	},

	async createQuote(quote: QuoteInsert) {
		const payload: any = { ...quote }
		if (!payload.codigo_referencia) {
			delete payload.codigo_referencia
		}
		const { data, error } = await supabase
			.from('cotizaciones')
			.insert(payload)
			.select()
			.single()

		if (error) throw error
		return data
	},

	async updateQuote(id: number, quote: QuoteUpdate) {
		const payload = { ...quote }
		if (!payload.codigo_referencia) {
			delete payload.codigo_referencia
		}
		const { data, error } = await supabase
			.from('cotizaciones')
			.update(payload)
			.eq('cotizacion_id', id)
			.select()
			.single()

		if (error) throw error
		return data
	},

	async deleteQuote(id: number) {
		const { error: itemsError } = await supabase
			.from('itemscotizacion')
			.delete()
			.eq('cotizacion_id', id)

		if (itemsError) throw itemsError

		const { error } = await supabase
			.from('cotizaciones')
			.delete()
			.eq('cotizacion_id', id)

		if (error) throw error
	},

	// --- Quote Items ---

	async getQuoteItems(quoteId: number) {
		const { data, error } = await supabase
			.from('itemscotizacion')
			.select(
				`
        *,
        servicios ( nombre, codigo ),
        tiposhabitacion ( 
          tipo,
          hotel_id,
          hoteles ( nombre )
        ),
        paquetes ( nombre_paquete )
      `
			)
			.eq('cotizacion_id', quoteId)
			.order('fecha_servicio', { ascending: true, nullsFirst: false })
			.order('item_id', { ascending: true })

		if (error) throw error
		return data as QuoteItemWithDetails[]
	},

	async addQuoteItem(item: QuoteItemInsert) {
		const { data, error } = await supabase
			.from('itemscotizacion')
			.insert(item)
			.select()
			.single()

		if (error) throw error

		await this.recalculateQuoteTotal(item.cotizacion_id!)

		return data
	},

	async updateQuoteItem(id: number, item: QuoteItemUpdate) {
		const { data, error } = await supabase
			.from('itemscotizacion')
			.update(item)
			.eq('item_id', id)
			.select()
			.single()

		if (error) throw error

		if (data.cotizacion_id) {
			await this.recalculateQuoteTotal(data.cotizacion_id)
		}

		return data
	},

	async deleteQuoteItem(id: number, quoteId: number) {
		const { error } = await supabase
			.from('itemscotizacion')
			.delete()
			.eq('item_id', id)

		if (error) throw error

		await this.recalculateQuoteTotal(quoteId)
	},

	async recalculateQuoteTotal(quoteId: number) {
		const { data: quote, error: quoteError } = await supabase
			.from('cotizaciones')
			.select('cantidad_pax, cantidad_pax_ninos, porcentaje_pago_ninos, porcentaje_impuesto, porcentaje_comision, tiene_tour_conductor, costo_tour_conductor')
			.eq('cotizacion_id', quoteId)
			.single()

		if (quoteError) throw quoteError

		const pax = quote.cantidad_pax || 1
		const paxNinos = quote.cantidad_pax_ninos || 0
		const porcentajePagoNinos = Number(quote.porcentaje_pago_ninos) ?? 50.0
		const taxPercent = quote.porcentaje_impuesto || 0
		const commPercent = quote.porcentaje_comision || 0
		const tieneTourConductor = quote.tiene_tour_conductor || false
		const costoTourConductor = Number(quote.costo_tour_conductor) || 0

		const { data: items, error: itemsError } = await supabase
			.from('itemscotizacion')
			.select('precio_unitario_snapshot, cantidad, es_por_pax, aplica_comision')
			.eq('cotizacion_id', quoteId)

		if (itemsError) throw itemsError

		const summary = PriceCalculator.calculateSummary(items || [], {
			pax,
			paxNinos,
			porcentajePagoNinos,
			taxPercent,
			commPercent,
			tieneTourConductor,
			costoTourConductor,
		})

		await supabase
			.from('cotizaciones')
			.update({ total_general: summary.totalFinal })
			.eq('cotizacion_id', quoteId)

		return summary
	},

	async getSystemConfig() {
		const { data, error } = await supabase
			.from('configuracion_sistema')
			.select('*')
			.single()

		if (error) throw error
		return data
	},

	async getBankAccounts() {
		const { data, error } = await supabase
			.from('cuentas_bancarias')
			.select('*')
			.order('es_default', { ascending: false })

		if (error) throw error
		return data
	},

	async findServicePrice(
		serviceId: number,
		hojaId: number,
		pax: number,
		date: string
	) {
		const query = (targetHojaId: number) =>
			supabase
				.from('preciosservicio')
				.select('*')
				.eq('servicio_id', serviceId)
				.eq('hoja_id', targetHojaId)
				.lte('min_pax', pax)
				.gte('max_pax', pax)
				.or(`valido_desde.is.null,valido_desde.lte.${date}`)
				.or(`valido_hasta.is.null,valido_hasta.gte.${date}`)
				.limit(1)

		const { data, error } = await query(hojaId)
		if (error) throw error
		if (data && data.length > 0) return data[0]

		const { data: defaultSheet } = await supabase
			.from('hojasdeprecios')
			.select('hoja_id')
			.eq('es_default', true)
			.single()

		if (!defaultSheet || defaultSheet.hoja_id === hojaId) return null

		const { data: defaultData, error: defaultError } = await query(
			defaultSheet.hoja_id
		)
		if (defaultError) throw defaultError

		return defaultData?.[0] || null
	},

	async findRoomPrice(habitacionId: number, hojaId: number) {
		const query = (targetHojaId: number) =>
			supabase
				.from('precioshabitacion')
				.select('*')
				.eq('habitacion_id', habitacionId)
				.eq('hoja_id', targetHojaId)
				.single()

		const { data, error } = await query(hojaId)

		if (data) return data
		if (error && error.code !== 'PGRST116') throw error

		const { data: defaultSheet } = await supabase
			.from('hojasdeprecios')
			.select('hoja_id')
			.eq('es_default', true)
			.single()

		if (!defaultSheet || defaultSheet.hoja_id === hojaId) return null

		const { data: defaultData, error: defaultError } = await query(
			defaultSheet.hoja_id
		)
		if (defaultError && defaultError.code !== 'PGRST116') throw defaultError

		return defaultData || null
	},

    async getFullQuoteContext(quoteId: number) {
        const [quote, items, config, bankAccounts] = await Promise.all([
            this.getQuoteById(quoteId),
            this.getQuoteItems(quoteId),
            this.getSystemConfig(),
            this.getBankAccounts()
        ])

        let selectedBank = null
        if (quote.id_cuenta_bancaria) {
            selectedBank = bankAccounts.find(b => b.id === quote.id_cuenta_bancaria)
        } else {
            selectedBank = bankAccounts.find(b => b.es_default)
        }

        return {
            quote,
            items,
            config,
            bankAccount: selectedBank || null
        }
    },

    async updateStatus(quoteId: number, status: 'Draft' | 'In_Review' | 'Approved' | 'Rejected' | 'Sold', reason?: string) {
        const payload: any = {
            estado: status,
        }

        if (status === 'Approved') {
            payload.fecha_aprobacion = new Date().toISOString()
        }

        if (status === 'Rejected' && reason) {
            payload.motivo_rechazo = reason
        }

        const { error } = await supabase.from('cotizaciones').update(payload).eq('cotizacion_id', quoteId)
        if (error) throw error
    }
}
