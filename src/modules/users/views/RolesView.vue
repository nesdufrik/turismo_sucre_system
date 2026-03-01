<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { RbacService, type Role, type Permission } from '../RbacService'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Loader2, Plus, Shield, Save, Trash2, Key, ListPlus, Pencil } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { useConfirm } from '@/composables/useConfirm'

// State
const roles = ref<Role[]>([])
const permissions = ref<Permission[]>([])
const loading = ref(false)

const { confirm } = useConfirm()

// Role Form State
const isRoleDialogOpen = ref(false)
const roleForm = ref<Partial<Role>>({ name: '', description: '' })
const isEditingRole = ref(false)
const savingRole = ref(false)

// Permission Manager State
const isPermManagerOpen = ref(false)
const newPerm = ref({ code: '', description: '', module: '' })
const creatingPerm = ref(false)

// Permissions Matrix State
const isPermissionsSheetOpen = ref(false)
const selectedRole = ref<Role | null>(null)
const selectedPermissionIds = ref<number[]>([])
const loadingPermissions = ref(false)
const savingPermissions = ref(false)

// Fetch Data
const fetchData = async () => {
  loading.value = true
  try {
    const [rolesData, permissionsData] = await Promise.all([
      RbacService.getRoles(),
      RbacService.getPermissions()
    ])
    roles.value = rolesData
    permissions.value = permissionsData
  } catch (error) {
    console.error(error)
    toast.error('Error al cargar datos')
  } finally {
    loading.value = false
  }
}

// Group Permissions by Module
const groupedPermissions = computed(() => {
  const groups: Record<string, Permission[]> = {}
  permissions.value.forEach(p => {
    const mod = p.module || 'General'
    if (!groups[mod]) groups[mod] = []
    groups[mod].push(p)
  })
  return groups
})

// --- ROLE ACTIONS ---

const openCreateRole = () => {
  roleForm.value = { name: '', description: '' }
  isEditingRole.value = false
  isRoleDialogOpen.value = true
}

const openEditRole = (role: Role) => {
  roleForm.value = { ...role }
  isEditingRole.value = true
  isRoleDialogOpen.value = true
}

const saveRole = async () => {
  if (!roleForm.value.name) {
    toast.error('El nombre es requerido')
    return
  }

  savingRole.value = true
  try {
    if (isEditingRole.value && roleForm.value.id) {
      await RbacService.updateRole(roleForm.value.id, roleForm.value)
      toast.success('Rol actualizado')
    } else {
      await RbacService.createRole(roleForm.value as any)
      toast.success('Rol creado')
    }
    await fetchData()
    isRoleDialogOpen.value = false
  } catch (error: any) {
    toast.error(error.message || 'Error al guardar rol')
  } finally {
    savingRole.value = false
  }
}

const deleteRole = async (role: Role) => {
  const confirmed = await confirm({
    title: '¿Eliminar rol?',
    description: `¿Estás seguro de eliminar el rol "${role.name}"? Esto podría afectar a usuarios existentes.`,
    variant: 'destructive',
    confirmText: 'Eliminar'
  })

  if (!confirmed) return

  try {
    await RbacService.deleteRole(role.id)
    toast.success('Rol eliminado')
    await fetchData()
  } catch (error: any) {
    toast.error('Error al eliminar: ' + error.message)
  }
}

// --- PERMISSION CRUD ACTIONS ---

const openPermManager = () => {
  newPerm.value = { code: '', description: '', module: '' }
  isPermManagerOpen.value = true
}

const createPermission = async () => {
  if (!newPerm.value.code || !newPerm.value.module) {
    toast.error('Código y Módulo son requeridos')
    return
  }
  
  creatingPerm.value = true
  try {
    await RbacService.createPermission(newPerm.value)
    toast.success('Permiso creado')
    newPerm.value = { code: '', description: '', module: '' }
    await fetchData()
  } catch (error: any) {
    toast.error('Error al crear permiso: ' + error.message)
  } finally {
    creatingPerm.value = false
  }
}

const deletePermission = async (id: number) => {
  const confirmed = await confirm({
    title: '¿Eliminar permiso?',
    description: '¿Eliminar este permiso base? Se quitará de todos los roles permanentemente.',
    variant: 'destructive',
    confirmText: 'Eliminar'
  })

  if (!confirmed) return

  try {
    await RbacService.deletePermission(id)
    toast.success('Permiso eliminado')
    await fetchData()
  } catch (error: any) {
    toast.error('Error al eliminar permiso')
  }
}

// --- ASSIGNMENT ACTIONS ---

const openPermissionsManager = async (role: Role) => {
  selectedRole.value = role
  isPermissionsSheetOpen.value = true
  loadingPermissions.value = true
  
  try {
    const ids = await RbacService.getRolePermissions(role.id)
    selectedPermissionIds.value = ids
  } catch (error) {
    toast.error('Error al cargar permisos del rol')
  } finally {
    loadingPermissions.value = false
  }
}

const handleSwitchChange = (permId: number, isChecked: boolean) => {
  const index = selectedPermissionIds.value.indexOf(permId)
  if (isChecked && index === -1) {
    selectedPermissionIds.value.push(permId)
  } else if (!isChecked && index !== -1) {
    selectedPermissionIds.value.splice(index, 1)
  }
}

const savePermissions = async () => {
  if (!selectedRole.value) return
  savingPermissions.value = true
  try {
    await RbacService.syncRolePermissions(selectedRole.value.id, selectedPermissionIds.value)
    toast.success(`Permisos actualizados para ${selectedRole.value.name}`)
    isPermissionsSheetOpen.value = false
  } catch (error: any) {
    toast.error('Error al guardar permisos: ' + error.message)
  } finally {
    savingPermissions.value = false
  }
}

const isGroupSelected = (groupPerms: Permission[]) => {
  return groupPerms.every(p => selectedPermissionIds.value.includes(p.id))
}

const toggleGroup = (groupPerms: Permission[]) => {
  const allSelected = isGroupSelected(groupPerms)
  if (allSelected) {
    groupPerms.forEach(p => {
      const idx = selectedPermissionIds.value.indexOf(p.id)
      if (idx !== -1) selectedPermissionIds.value.splice(idx, 1)
    })
  } else {
    groupPerms.forEach(p => {
      if (!selectedPermissionIds.value.includes(p.id)) selectedPermissionIds.value.push(p.id)
    })
  }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <HasPermission name="users.view">
    <div class="space-y-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">Roles y Permisos</h1>
          <p class="text-muted-foreground">Define los perfiles de acceso y sus capacidades.</p>
        </div>
        <HasPermission name="users.manage">
          <div class="flex gap-2">
            <Button variant="outline" @click="openPermManager">
              <ListPlus class="w-4 h-4 mr-2" /> Catálogo de Permisos
            </Button>
            <Button @click="openCreateRole">
              <Plus class="w-4 h-4 mr-2" /> Nuevo Rol
            </Button>
          </div>
        </HasPermission>
      </div>

      <div class="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead class="w-[200px]">Rol</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead class="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="loading && roles.length === 0">
              <TableCell colspan="3" class="h-24 text-center">
                <Loader2 class="h-4 w-4 animate-spin inline" /> Cargando...
              </TableCell>
            </TableRow>
            
            <TableRow v-for="role in roles" :key="role.id">
              <TableCell class="font-medium">
                <div class="flex items-center gap-2">
                  <Shield class="h-4 w-4 text-muted-foreground" />
                  <span class="capitalize">{{ role.name }}</span>
                </div>
              </TableCell>
              <TableCell class="text-muted-foreground">{{ role.description || '-' }}</TableCell>
              <TableCell class="text-right space-x-2">
                <HasPermission name="users.manage">
                  <Button variant="outline" size="sm" @click="openPermissionsManager(role)">
                    <Key class="w-4 h-4 mr-2" /> Permisos
                  </Button>
                  <Button variant="ghost" size="sm" @click="openEditRole(role)">
                    <Pencil class="w-4 h-4 mr-2" /> Editar
                  </Button>
                  <Button variant="ghost" size="icon" class="h-8 w-8 text-destructive" @click="deleteRole(role)">
                    <Trash2 class="w-4 h-4" />
                  </Button>
                  <template #no-access>-</template>
                </HasPermission>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <!-- Create/Edit Role Dialog -->
      <Dialog v-model:open="isRoleDialogOpen">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{{ isEditingRole ? 'Editar Rol' : 'Crear Nuevo Rol' }}</DialogTitle>
            <DialogDescription>
              Define el nombre identificador y una descripción opcional.
            </DialogDescription>
          </DialogHeader>
          <div class="grid gap-4 py-4">
            <div class="grid gap-2">
              <Label>Nombre (Identificador)</Label>
              <Input v-model="roleForm.name" placeholder="ej: supervisor" />
            </div>
            <div class="grid gap-2">
              <Label>Descripción</Label>
              <Input :model-value="roleForm.description || ''" @update:model-value="roleForm.description = $event as string" placeholder="Descripción corta del rol" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" @click="isRoleDialogOpen = false">Cancelar</Button>
            <Button @click="saveRole" :disabled="savingRole">
              <Loader2 v-if="savingRole" class="mr-2 h-4 w-4 animate-spin" />
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <!-- Catálogo de Permisos Dialog -->
      <Dialog v-model:open="isPermManagerOpen">
        <DialogContent class="sm:max-w-[600px] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Catálogo de Permisos</DialogTitle>
            <DialogDescription>
              Gestiona los permisos base del sistema.
            </DialogDescription>
          </DialogHeader>
          <div class="grid gap-4 py-4 border-b">
             <div class="grid grid-cols-3 gap-2 items-end">
                <div class="space-y-1">
                   <Label class="text-xs">Módulo</Label>
                   <Input v-model="newPerm.module" placeholder="ej: quotes" class="h-8" />
                </div>
                <div class="space-y-1">
                   <Label class="text-xs">Código</Label>
                   <Input v-model="newPerm.code" placeholder="ej: quotes.approve" class="h-8" />
                </div>
                <Button size="sm" @click="createPermission" :disabled="creatingPerm">
                   <Plus class="h-4 w-4 mr-1" /> Agregar
                </Button>
             </div>
             <Input v-model="newPerm.description" placeholder="Descripción del permiso..." class="h-8" />
          </div>
          <div class="flex-1 overflow-y-auto space-y-4 mt-4">
             <div v-for="(groupPerms, moduleName) in groupedPermissions" :key="moduleName">
                <h4 class="text-xs font-bold uppercase text-muted-foreground mb-2">{{ moduleName }}</h4>
                <div class="space-y-1">
                   <div v-for="perm in groupPerms" :key="perm.id" class="flex items-center justify-between text-sm p-2 bg-muted/30 rounded-md">
                      <div>
                         <div class="font-mono text-xs font-semibold">{{ perm.code }}</div>
                         <div class="text-xs text-muted-foreground">{{ perm.description }}</div>
                      </div>
                      <Button variant="ghost" size="icon" class="h-6 w-6 text-destructive" @click="deletePermission(perm.id)">
                         <Trash2 class="h-3 w-3" />
                      </Button>
                   </div>
                </div>
             </div>
          </div>
        </DialogContent>
      </Dialog>

      <!-- Permissions Matrix Sheet -->
      <Sheet v-model:open="isPermissionsSheetOpen">
        <SheetContent class="w-[400px] sm:w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Configurar Permisos</SheetTitle>
            <SheetDescription>Rol: <b class="capitalize">{{ selectedRole?.name }}</b></SheetDescription>
          </SheetHeader>
          <div class="py-6 space-y-6">
            <div v-if="loadingPermissions" class="flex justify-center py-8">
              <Loader2 class="h-8 w-8 animate-spin text-primary" />
            </div>
            <div v-else v-for="(groupPerms, moduleName) in groupedPermissions" :key="moduleName" class="space-y-3">
              <div class="flex items-center justify-between">
                <h4 class="text-sm font-semibold uppercase text-muted-foreground">{{ moduleName }}</h4>
                <Button variant="ghost" size="sm" class="h-6 text-xs" @click="toggleGroup(groupPerms)">
                  {{ isGroupSelected(groupPerms) ? 'Todos' : 'Ninguno' }}
                </Button>
              </div>
              <div class="grid gap-2">
                <div v-for="perm in groupPerms" :key="perm.id" class="flex items-center justify-between p-3 rounded-md border bg-card">
                  <div class="grid gap-1">
                    <span class="text-sm font-medium">{{ perm.code }}</span>
                    <span class="text-xs text-muted-foreground">{{ perm.description }}</span>
                  </div>
                  <Switch 
                    :modelValue="selectedPermissionIds.includes(perm.id)" 
                    @update:modelValue="(val: boolean) => handleSwitchChange(perm.id, val)"
                  />
                </div>
              </div>
            </div>
          </div>
          <SheetFooter>
            <Button @click="savePermissions" :disabled="savingPermissions" class="w-full">
              <Loader2 v-if="savingPermissions" class="mr-2 h-4 w-4 animate-spin" />
              <Save class="mr-2 h-4 w-4" /> Guardar Permisos
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>

    <template #no-access>
      <div class="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <div class="p-4 bg-red-50 rounded-full">
          <Shield class="w-12 h-12 text-red-500 opacity-50" />
        </div>
        <div class="max-w-md">
          <h2 class="text-2xl font-bold">Acceso Restringido</h2>
          <p class="text-muted-foreground mt-2">
            No tienes los permisos necesarios para gestionar la seguridad.
          </p>
          <Button variant="outline" class="mt-6" @click="$router.back()">
            Volver
          </Button>
        </div>
      </div>
    </template>
  </HasPermission>
</template>
