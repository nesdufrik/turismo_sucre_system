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
  }
}
