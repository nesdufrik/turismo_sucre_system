import { supabase } from '@/lib/supabase'
import type { Tables, TablesInsert, TablesUpdate } from '@/types/database.types'

export type Client = Tables<'clientes'>
export type ClientInsert = TablesInsert<'clientes'>
export type ClientUpdate = TablesUpdate<'clientes'>

export interface PaginationParams {
  page: number
  pageSize: number
  search?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number | null
}

export const ClientService = {
  async getClients(params?: PaginationParams): Promise<PaginatedResponse<Client> | Client[]> {
    // Si no hay parámetros, mantenemos el comportamiento original (devolver Client[])
    // para no romper posibles usos donde no se espera un objeto con count.
    if (!params) {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('nombre_completo', { ascending: true })

      if (error) throw error
      return data || []
    }

    // Si hay parámetros, devolvemos la respuesta paginada
    let query = supabase
      .from('clientes')
      .select('*', { count: 'exact' })
      .order('nombre_completo', { ascending: true })

    const from = (params.page - 1) * params.pageSize
    const to = from + params.pageSize - 1
    
    query = query.range(from, to)

    if (params.search) {
      query = query.or(`nombre_completo.ilike.%${params.search}%,email.ilike.%${params.search}%,empresa.ilike.%${params.search}%,documento_identidad.ilike.%${params.search}%`)
    }

    const { data, error, count } = await query

    if (error) throw error
    return {
      data: data || [],
      count
    }
  },

  async getClientById(id: number) {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('cliente_id', id)
      .single()

    if (error) throw error
    return data
  },

  async createClient(client: ClientInsert) {
    const { data, error } = await supabase
      .from('clientes')
      .insert(client)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateClient(id: number, client: ClientUpdate) {
    const { data, error } = await supabase
      .from('clientes')
      .update(client)
      .eq('cliente_id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteClient(id: number) {
    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('cliente_id', id)

    if (error) throw error
  },

  // MANTENEMOS ESTA FUNCIÓN INTACTA
  async searchClients(query: string) {
    let queryBuilder = supabase
      .from('clientes')
      .select('*')
      .limit(20)

    if (query) {
      queryBuilder = queryBuilder.or(`nombre_completo.ilike.%${query}%,email.ilike.%${query}%,empresa.ilike.%${query}%`)
    } else {
      queryBuilder = queryBuilder.order('fecha_creacion', { ascending: false })
    }

    const { data, error } = await queryBuilder

    if (error) throw error
    return data
  }
}