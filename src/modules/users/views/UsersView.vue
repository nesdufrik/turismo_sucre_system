<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { UserService, type UserWithRole, type Invite } from '@/modules/users/UserService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Loader2, UserPlus, Mail, MoreHorizontal, Trash2, Users, Pencil, UserMinus, UserCheck, Copy } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useConfirm } from '@/composables/useConfirm'

const users = ref<UserWithRole[]>([])
const invites = ref<Invite[]>([])
const roles = ref<{name: string}[]>([])
const loading = ref(false)

const { confirm } = useConfirm()

// Invite State
const isInviteDialogOpen = ref(false)
const inviteEmail = ref('')
const inviteRole = ref('')
const isInviting = ref(false)

// Edit User State
const isEditUserDialogOpen = ref(false)
const editingUser = ref<UserWithRole | null>(null)
const selectedEditRole = ref('')
const isSavingRole = ref(false)

const openEditUser = (user: UserWithRole) => {
  editingUser.value = user
  // Get current role name safely
  const currentRole = user.user_roles[0]?.roles?.name || ''
  selectedEditRole.value = currentRole
  isEditUserDialogOpen.value = true
}

const saveUserRole = async () => {
  if (!editingUser.value || !selectedEditRole.value) return
  
  isSavingRole.value = true
  try {
    await UserService.assignRole(editingUser.value.profile_id, selectedEditRole.value)
    toast.success('Rol actualizado correctamente')
    isEditUserDialogOpen.value = false
    fetchData()
  } catch (error: any) {
    toast.error('Error al actualizar rol: ' + error.message)
  } finally {
    isSavingRole.value = false
  }
}

const fetchData = async () => {
  loading.value = true
  try {
    const [usersData, invitesData, rolesData] = await Promise.all([
      UserService.getUsers(),
      UserService.getPendingInvitations(),
      UserService.getAvailableRoles()
    ])
    users.value = usersData
    invites.value = invitesData
    roles.value = rolesData
  } catch (error) {
    console.error(error)
    toast.error('Error al cargar usuarios')
  } finally {
    loading.value = false
  }
}

const copyInviteLink = (token: string) => {
  const url = `${window.location.origin}/register-invite?token=${token}`
  navigator.clipboard.writeText(url)
  toast.success('Enlace copiado al portapapeles')
}

const sendInvite = async () => {
  if (!inviteEmail.value || !inviteRole.value) {
    toast.error('Completa todos los campos')
    return
  }
  
  isInviting.value = true
  try {
    const invite = await UserService.createInvitation(inviteEmail.value, inviteRole.value)
    
    // Show link immediately
    const url = `${window.location.origin}/register-invite?token=${invite.token}`
    navigator.clipboard.writeText(url) // Auto copy
    
    toast.success('Invitación creada y copiada', {
        description: 'El enlace se ha copiado al portapapeles.',
        duration: 5000,
        action: {
            label: 'Copiar de nuevo',
            onClick: () => copyInviteLink(invite.token)
        }
    })

    isInviteDialogOpen.value = false
    inviteEmail.value = ''
    inviteRole.value = ''
    fetchData()
  } catch (error: any) {
    toast.error('Error al invitar: ' + error.message)
  } finally {
    isInviting.value = false
  }
}

const revokeInvite = async (id: string) => {
  const confirmed = await confirm({
    title: '¿Revocar invitación?',
    description: 'El enlace enviado dejará de ser válido.',
    variant: 'destructive',
    confirmText: 'Revocar'
  })

  if (!confirmed) return

  try {
    await UserService.revokeInvitation(id)
    toast.success('Invitación revocada')
    fetchData()
  } catch (error) {
    toast.error('Error al revocar')
  }
}

const toggleUserStatus = async (user: UserWithRole) => {
  const newStatus = user.status === 'active' ? 'inactive' : 'active'
  const action = newStatus === 'active' ? 'activar' : 'desactivar'
  
  const confirmed = await confirm({
    title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} acceso?`,
    description: `El usuario ${newStatus === 'active' ? 'podrá' : 'ya no podrá'} iniciar sesión en el sistema.`,
    confirmText: newStatus === 'active' ? 'Activar' : 'Desactivar',
    variant: newStatus === 'active' ? 'default' : 'destructive'
  })

  if (!confirmed) return

  try {
    await UserService.toggleStatus(user.profile_id, newStatus)
    user.status = newStatus
    toast.success(`Usuario ${newStatus === 'active' ? 'activado' : 'desactivado'}`)
  } catch (error) {
    toast.error('Error al cambiar estado')
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
          <h1 class="text-3xl font-bold tracking-tight">Usuarios</h1>
          <p class="text-muted-foreground">Gestiona el acceso al sistema.</p>
        </div>
        <HasPermission name="users.manage">
          <Dialog v-model:open="isInviteDialogOpen">
            <DialogTrigger as-child>
              <Button>
                <UserPlus /> Invitar Usuario
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invitar Nuevo Usuario</DialogTitle>
                <DialogDescription>
                  Se enviará un correo con un enlace de registro único.
                </DialogDescription>
              </DialogHeader>
              <div class="grid gap-4 py-4">
                <div class="grid gap-2">
                  <Label>Email</Label>
                  <Input v-model="inviteEmail" type="email" placeholder="usuario@empresa.com" />
                </div>
                <div class="grid gap-2">
                  <Label>Rol Inicial</Label>
                  <Select v-model="inviteRole">
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem v-for="role in roles" :key="role.name" :value="role.name">
                        <span class="capitalize">{{ role.name }}</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" @click="isInviteDialogOpen = false">Cancelar</Button>
                <Button @click="sendInvite" :disabled="isInviting">
                  <Loader2 v-if="isInviting" class="mr-2 h-4 w-4 animate-spin" />
                  Enviar Invitación
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </HasPermission>
      </div>

      <Tabs default-value="users" class="space-y-4">
        <TabsList class="mb-0">
          <TabsTrigger value="users" class="flex items-center gap-2">
            <Users />
            Usuarios Activos
          </TabsTrigger>
          <TabsTrigger value="invites" class="flex items-center gap-2">
            <Mail />
            Invitaciones ({{ invites.length }})
          </TabsTrigger>
        </TabsList>

        <!-- Active Users Tab -->
        <TabsContent value="users" class="space-y-4">
          <div class="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead class="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-if="loading && users.length === 0">
                  <TableCell colspan="5" class="h-24 text-center">
                    <Loader2 class="h-4 w-4 animate-spin inline" /> Cargando...
                  </TableCell>
                </TableRow>
                
                <TableRow v-for="user in users" :key="user.profile_id">
                  <TableCell class="font-medium">
                    {{ user.full_name || 'Sin Nombre' }}
                    <div class="text-xs text-muted-foreground md:hidden">{{ user.email }}</div>
                  </TableCell>
                  <TableCell class="hidden md:table-cell">{{ user.email }}</TableCell>
                  <TableCell>
                    <Badge variant="outline" class="capitalize">
                      {{ user.user_roles[0]?.roles?.name || 'Sin Rol' }}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge :variant="user.status === 'active' ? 'default' : 'destructive'">
                      {{ user.status === 'active' ? 'Activo' : 'Inactivo' }}
                    </Badge>
                  </TableCell>
                  <TableCell class="text-right">
                    <HasPermission name="users.manage">
                      <DropdownMenu>
                        <DropdownMenuTrigger as-child>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal class="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem @click="openEditUser(user)">
                            <Pencil class="mr-2 h-4 w-4" /> Editar Rol
                          </DropdownMenuItem>
                          <DropdownMenuItem @click="toggleUserStatus(user)">
                            <component :is="user.status === 'active' ? UserMinus : UserCheck" class="mr-2 h-4 w-4" />
                            {{ user.status === 'active' ? 'Desactivar' : 'Activar' }} Acceso
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <template #no-access>-</template>
                    </HasPermission>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <!-- Pending Invites Tab -->
        <TabsContent value="invites" class="space-y-4">
          <div class="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Enviado</TableHead>
                  <TableHead class="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-if="invites.length === 0">
                  <TableCell colspan="4" class="h-24 text-center text-muted-foreground">
                    No hay invitaciones pendientes.
                  </TableCell>
                </TableRow>
                <TableRow v-for="invite in invites" :key="invite.id">
                  <TableCell>{{ invite.email }}</TableCell>
                  <TableCell class="capitalize">{{ invite.role }}</TableCell>
                  <TableCell>
                    {{ format(new Date(invite.created_at), 'PPP', { locale: es }) }}
                  </TableCell>
                  <TableCell class="text-right space-x-2">
                    <HasPermission name="users.manage">
                      <Button variant="ghost" size="sm" title="Copiar Enlace" @click="copyInviteLink(invite.token)">
                        <Copy class="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" class="text-destructive hover:text-destructive" @click="revokeInvite(invite.id)">
                        <Trash2 class="h-4 w-4 mr-2" /> Revocar
                      </Button>
                      <template #no-access>-</template>
                    </HasPermission>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <!-- Edit User Role Dialog -->
      <Dialog v-model:open="isEditUserDialogOpen">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Rol de Usuario</DialogTitle>
            <DialogDescription>
              Cambia el nivel de acceso para <b>{{ editingUser?.full_name || editingUser?.email }}</b>.
            </DialogDescription>
          </DialogHeader>
          <div class="grid gap-4 py-4">
            <div class="grid gap-2">
              <Label>Nuevo Rol</Label>
              <Select v-model="selectedEditRole">
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="role in roles" :key="role.name" :value="role.name">
                    <span class="capitalize">{{ role.name }}</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" @click="isEditUserDialogOpen = false">Cancelar</Button>
            <Button @click="saveUserRole" :disabled="isSavingRole">
              <Loader2 v-if="isSavingRole" class="mr-2 h-4 w-4 animate-spin" />
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>

    <template #no-access>
      <div class="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <div class="p-4 bg-red-50 rounded-full">
          <Users class="w-12 h-12 text-red-500 opacity-50" />
        </div>
        <div class="max-w-md">
          <h2 class="text-2xl font-bold">Acceso Restringido</h2>
          <p class="text-muted-foreground mt-2">
            No tienes los permisos necesarios para gestionar los usuarios del sistema. 
            Esta área es exclusiva para administradores.
          </p>
          <Button variant="outline" class="mt-6" @click="$router.back()">
            Volver
          </Button>
        </div>
      </div>
    </template>
  </HasPermission>
</template>

