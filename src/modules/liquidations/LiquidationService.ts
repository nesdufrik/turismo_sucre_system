import { supabase } from '@/lib/supabase'

export type Liquidation = any // Will use typed views/tables from supabase client

export interface LiquidationPaginationParams {
  page: number
  pageSize: number
  search?: string
  status?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number | null
}

export type LiquidationWithDetails = {
  liquidacion_id: number
  cotizacion_id: number
  estado_pago: 'paid' | 'unpaid' | 'partial'
  monto_total: number
  fecha_liquidacion: string
  fecha_pago: string | null
  metodo_pago: string | null
  comprobante_pago: string | null
  comprobante_url: string | null
  notas: string | null
  creado_por: string | null
  codigo_referencia: string | null
  moneda: string | null
  nombre_grupo: string | null
  cantidad_pax: number | null
  cliente_nombre: string | null
  cliente_email: string | null
  cliente_empresa: string | null
}

export const LiquidationService = {
  async getLiquidations(params: LiquidationPaginationParams): Promise<PaginatedResponse<LiquidationWithDetails>> {
    let queryBuilder = supabase
      .from('v_liquidaciones_detalles')
      .select('*', { count: 'exact' })
      .order('fecha_liquidacion', { ascending: false })

    // Filtros de búsqueda
    const s = params.search?.trim()
    if (s) {
      queryBuilder = queryBuilder.or(`codigo_referencia.ilike.%${s}%,nombre_grupo.ilike.%${s}%,cliente_nombre.ilike.%${s}%`)
    }

    // Filtro de estado
    if (params.status && params.status !== 'all') {
      queryBuilder = queryBuilder.eq('estado_pago', params.status)
    }

    // Rango de paginación
    const from = (params.page - 1) * params.pageSize
    const to = from + params.pageSize - 1
    queryBuilder = queryBuilder.range(from, to)

    const { data, error, count } = await queryBuilder
    if (error) throw error

    return {
      data: (data || []) as unknown as LiquidationWithDetails[],
      count
    }
  },

  async registerPayment(
    liquidacionId: number, 
    paymentData: { 
      metodo_pago: string
      comprobante_pago: string
      comprobante_url?: string
      notas?: string 
    }
  ) {
    const { data, error } = await supabase
      .from('liquidaciones')
      .update({
        estado_pago: 'paid',
        fecha_pago: new Date().toISOString(),
        metodo_pago: paymentData.metodo_pago,
        comprobante_pago: paymentData.comprobante_pago,
        comprobante_url: paymentData.comprobante_url || null,
        notas: paymentData.notas || null
      })
      .eq('liquidacion_id', liquidacionId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async uploadReceipt(file: File) {
    // Extraer extensión y generar un nombre único
    const ext = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`
    const filePath = `receipts/${fileName}`

    const { error: uploadError } = await supabase.storage.from('comprobantes').upload(filePath, file)
    
    if (uploadError) {
      throw new Error('Error al subir el comprobante de pago al servidor')
    }

    const { data } = supabase.storage.from('comprobantes').getPublicUrl(filePath)
    return data.publicUrl
  }
}
