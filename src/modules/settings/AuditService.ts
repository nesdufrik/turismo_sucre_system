import { supabase } from '@/lib/supabase'
import type { Tables } from '@/types/database.types'

export type AuditLog = Tables<'auditoria'> & {
  profiles: {
    full_name: string | null
    email: string | null
  } | null
}

export interface AuditFilters {
  tabla?: string
  accion?: string
  usuario_id?: string
  limit?: number
}

export interface OperationalAuditLog {
  tipo_evento: 'reapertura_cotizacion' | 'modificacion_pago' | 'anulacion_pago'
  evento_id: number
  registro_id: number
  referencia: string | null
  justificacion: string
  usuario_id: string | null
  usuario_nombre: string | null
  usuario_email: string | null
  fecha: string
  detalles: {
    monto_anterior?: number
    estado_pago_anterior?: string
    tipo_modificacion?: string
    valores_anteriores?: any
    valores_nuevos?: any
  }
}

export const AuditService = {
  async getLogs(filters: AuditFilters = {}) {
    let query = supabase
      .from('auditoria')
      .select(`
        *,
        profiles:usuario_id (
          full_name,
          email
        )
      `)
      .order('timestamp', { ascending: false })

    if (filters.tabla) query = query.eq('tabla_nombre', filters.tabla)
    if (filters.accion) query = query.eq('accion', filters.accion)
    if (filters.usuario_id) query = query.eq('usuario_id', filters.usuario_id)
    
    const { data, error } = await query.limit(filters.limit || 100)

    if (error) throw error
    return data as AuditLog[]
  },

  async getTables() {
    // Get unique table names from logs for filtering
    const { data, error } = await supabase.rpc('get_audit_tables' as any)
    if (error) {
        // Fallback if RPC doesn't exist
        const { data: fallbackData } = await supabase.from('auditoria').select('tabla_nombre')
        const tables = new Set(fallbackData?.map(item => item.tabla_nombre))
        return Array.from(tables).sort()
    }
    return data
  },

  async getOperationalLogs(limit: number = 100): Promise<OperationalAuditLog[]> {
    const { data, error } = await supabase
      .from('v_auditoria_operativa')
      .select('*')
      .order('fecha', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data as any as OperationalAuditLog[]
  }
}
