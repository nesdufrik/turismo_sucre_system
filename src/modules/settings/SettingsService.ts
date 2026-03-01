import { supabase } from '@/lib/supabase'
import type { TablesInsert, TablesUpdate } from '@/types/database.types'

export class SettingsService {
  // --- Ubicaciones ---
  static async getLocations() {
    const { data, error } = await supabase
      .from('ubicaciones')
      .select('*')
      .order('ciudad')
    if (error) throw error
    return data
  }

  static async createLocation(location: TablesInsert<'ubicaciones'>) {
    const { data, error } = await supabase
      .from('ubicaciones')
      .insert(location)
      .select()
      .single()
    if (error) throw error
    return data
  }

  static async updateLocation(id: number, location: TablesUpdate<'ubicaciones'>) {
    const { data, error } = await supabase
      .from('ubicaciones')
      .update(location)
      .eq('ubicacion_id', id)
      .select()
      .single()
    if (error) throw error
    return data
  }

  static async deleteLocation(id: number) {
    const { error } = await supabase
      .from('ubicaciones')
      .delete()
      .eq('ubicacion_id', id)
    if (error) throw error
  }

  // --- Categorías de Servicio ---
  static async getServiceCategories() {
    const { data, error } = await supabase
      .from('categoriasservicio')
      .select('*')
      .order('nombre')
    if (error) throw error
    return data
  }

  static async createServiceCategory(category: TablesInsert<'categoriasservicio'>) {
    const { data, error } = await supabase
      .from('categoriasservicio')
      .insert(category)
      .select()
      .single()
    if (error) throw error
    return data
  }

  static async updateServiceCategory(id: number, category: TablesUpdate<'categoriasservicio'>) {
    const { data, error } = await supabase
      .from('categoriasservicio')
      .update(category)
      .eq('categoria_id', id)
      .select()
      .single()
    if (error) throw error
    return data
  }

  static async deleteServiceCategory(id: number) {
    const { error } = await supabase
      .from('categoriasservicio')
      .delete()
      .eq('categoria_id', id)
    if (error) throw error
  }

  // --- Hojas de Precios ---
  static async getPriceSheets() {
    const { data, error } = await supabase
      .from('hojasdeprecios')
      .select('*')
      .order('nombre')
    if (error) throw error
    return data
  }

  static async createPriceSheet(sheet: TablesInsert<'hojasdeprecios'>) {
    // The database trigger 'trigger_price_sheet_default' handles exclusivity of 'es_default'
    const { data, error } = await supabase
      .from('hojasdeprecios')
      .insert(sheet)
      .select()
      .single()
    if (error) throw error
    return data
  }

  static async updatePriceSheet(id: number, sheet: TablesUpdate<'hojasdeprecios'>) {
    // The database trigger 'trigger_price_sheet_default' handles exclusivity of 'es_default'
    const { data, error } = await supabase
      .from('hojasdeprecios')
      .update(sheet)
      .eq('hoja_id', id)
      .select()
      .single()
    if (error) throw error
    return data
  }

  static async deletePriceSheet(id: number) {
    const { error } = await supabase
      .from('hojasdeprecios')
      .delete()
      .eq('hoja_id', id)
    if (error) throw error
  }

  // --- Cuentas Bancarias ---
  static async createBankAccount(account: TablesInsert<'cuentas_bancarias'>) {
    const { data, error } = await supabase
      .from('cuentas_bancarias')
      .insert(account)
      .select()
      .single()
    if (error) throw error
    return data
  }

  static async updateBankAccount(id: string, account: TablesUpdate<'cuentas_bancarias'>) {
    const { data, error } = await supabase
      .from('cuentas_bancarias')
      .update(account)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  }

  static async deleteBankAccount(id: string) {
    const { error } = await supabase
      .from('cuentas_bancarias')
      .delete()
      .eq('id', id)
    if (error) throw error
  }
}
