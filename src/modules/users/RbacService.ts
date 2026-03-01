import { supabase } from '@/lib/supabase'
import type { Tables, TablesInsert, TablesUpdate } from '@/types/database.types'

export type Role = Tables<'roles'>
export type Permission = Tables<'permissions'>

export const RbacService = {
  async getRoles() {
    const { data, error } = await supabase.from('roles').select('*').order('name')
    if (error) throw error
    return data as Role[]
  },

  async getPermissions() {
    const { data, error } = await supabase.from('permissions').select('*').order('module').order('code')
    if (error) throw error
    return data as Permission[]
  },

  async createRole(role: TablesInsert<'roles'>) {
    const { data, error } = await supabase.from('roles').insert(role).select().single()
    if (error) throw error
    return data
  },

  async updateRole(id: number, updates: TablesUpdate<'roles'>) {
    const { data, error } = await supabase.from('roles').update(updates).eq('id', id).select().single()
    if (error) throw error
    return data
  },

  async deleteRole(id: number) {
    const { error } = await supabase.from('roles').delete().eq('id', id)
    if (error) throw error
  },

  async createPermission(permission: TablesInsert<'permissions'>) {
    const { data, error } = await supabase.from('permissions').insert(permission).select().single()
    if (error) throw error
    return data
  },

  async deletePermission(id: number) {
    const { error } = await supabase.from('permissions').delete().eq('id', id)
    if (error) throw error
  },

  async getRolePermissions(roleId: number) {
    const { data, error } = await supabase
      .from('role_permissions')
      .select('permission_id')
      .eq('role_id', roleId)
    
    if (error) throw error
    return data.map(rp => rp.permission_id)
  },

  async syncRolePermissions(roleId: number, permissionIds: number[]) {
    // 1. Remove all existing
    const { error: deleteError } = await supabase
      .from('role_permissions')
      .delete()
      .eq('role_id', roleId)
    
    if (deleteError) throw deleteError

    if (permissionIds.length === 0) return

    // 2. Insert new
    const rows = permissionIds.map(pid => ({
      role_id: roleId,
      permission_id: pid
    }))

    const { error: insertError } = await supabase
      .from('role_permissions')
      .insert(rows)
    
    if (insertError) throw insertError
  }
}
