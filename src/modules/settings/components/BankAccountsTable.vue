<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { QuoteService } from '@/modules/quotes/QuoteService'
import { SettingsService } from '../SettingsService'
import type { Tables } from '@/types/database.types'
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
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { toast } from 'vue-sonner'
import { Pencil, Trash2, Plus, Check, Landmark } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { Skeleton } from '@/components/ui/skeleton'
import { useConfirm } from '@/composables/useConfirm'

type BankAccount = Tables<'cuentas_bancarias'>

const accounts = ref<BankAccount[]>([])
const isLoading = ref(false)
const isDialogOpen = ref(false)
const isEditing = ref(false)
const currentId = ref<string | null>(null)

const { confirm } = useConfirm()

const formSchema = toTypedSchema(z.object({
  banco: z.string().min(2, 'El nombre del banco es requerido'),
  numero_cuenta: z.string().min(5, 'Número de cuenta inválido'),
  titular: z.string().min(3, 'El titular es requerido'),
  moneda: z.enum(['USD', 'BOB']),
  tipo_cuenta: z.string().min(2, 'Tipo de cuenta (Ahorros/Corriente)'),
  es_default: z.boolean().default(false),
  is_active: z.boolean().default(true)
}))

const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    moneda: 'USD',
    es_default: false,
    is_active: true
  }
})

const fetchAccounts = async () => {
  isLoading.value = true
  try {
    const data = await QuoteService.getBankAccounts()
    accounts.value = data
  } catch (error: any) {
    toast.error('Error al cargar cuentas bancarias')
  } finally {
    isLoading.value = false
  }
}

const onSubmit = form.handleSubmit(async (values) => {
  try {
    if (isEditing.value && currentId.value) {
      await SettingsService.updateBankAccount(currentId.value, values)
      toast.success('Cuenta actualizada')
    } else {
      await SettingsService.createBankAccount(values)
      toast.success('Cuenta creada')
    }
    isDialogOpen.value = false
    fetchAccounts()
  } catch (error: any) {
    toast.error('Error al guardar', { description: error.message })
  }
})

const openCreateDialog = () => {
  isEditing.value = false
  currentId.value = null
  form.resetForm()
  isDialogOpen.value = true
}

const openEditDialog = (account: BankAccount) => {
  isEditing.value = true
  currentId.value = account.id
  form.setValues({
    banco: account.banco,
    numero_cuenta: account.numero_cuenta,
    titular: account.titular,
    moneda: account.moneda as 'USD' | 'BOB',
    tipo_cuenta: account.tipo_cuenta,
    es_default: account.es_default || false,
    is_active: account.is_active || true
  })
  isDialogOpen.value = true
}

const deleteAccount = async (id: string) => {
  const ok = await confirm({
    title: '¿Eliminar cuenta?',
    description: 'Esta cuenta ya no aparecerá en las cotizaciones.',
    variant: 'destructive',
    confirmText: 'Eliminar'
  })

  if (!ok) return

  try {
    await SettingsService.deleteBankAccount(id)
    toast.success('Cuenta eliminada')
    fetchAccounts()
  } catch (error: any) {
    toast.error('Error al eliminar')
  }
}

onMounted(() => {
  fetchAccounts()
})
</script>

<template>
  <div>
    <div class="flex justify-end mb-4">
      <HasPermission name="users.manage">
        <Button @click="openCreateDialog">
          <Plus class="w-4 h-4 mr-2" />
          Nueva Cuenta
        </Button>
      </HasPermission>
    </div>

    <div class="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Banco</TableHead>
            <TableHead>Cuenta / Titular</TableHead>
            <TableHead>Moneda</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead class="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="isLoading">
            <TableRow v-for="i in 3" :key="i">
              <TableCell><Skeleton class="h-4 w-32" /></TableCell>
              <TableCell><Skeleton class="h-4 w-48" /></TableCell>
              <TableCell><Skeleton class="h-4 w-12" /></TableCell>
              <TableCell><Skeleton class="h-4 w-12" /></TableCell>
              <TableCell class="text-right"><Skeleton class="h-8 w-20 ml-auto" /></TableCell>
            </TableRow>
          </template>

          <template v-else-if="accounts.length === 0">
            <TableRow>
              <TableCell colspan="5" class="text-center py-8 text-muted-foreground">
                No hay cuentas bancarias registradas.
              </TableCell>
            </TableRow>
          </template>

          <template v-else>
            <TableRow v-for="acc in accounts" :key="acc.id">
              <TableCell>
                <div class="flex items-center gap-2">
                  <Landmark class="w-4 h-4 text-muted-foreground" />
                  <div class="flex flex-col">
                    <span class="font-medium">{{ acc.banco }}</span>
                    <span class="text-xs text-muted-foreground">{{ acc.tipo_cuenta }}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div class="flex flex-col">
                  <span class="text-sm font-mono">{{ acc.numero_cuenta }}</span>
                  <span class="text-xs text-muted-foreground">{{ acc.titular }}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{{ acc.moneda }}</Badge>
              </TableCell>
              <TableCell>
                <div class="flex items-center gap-2">
                  <Check v-if="acc.es_default" class="w-4 h-4 text-green-500" title="Por defecto" />
                  <Badge :variant="acc.is_active ? 'default' : 'secondary'">
                    {{ acc.is_active ? 'Activa' : 'Inactiva' }}
                  </Badge>
                </div>
              </TableCell>
              <TableCell class="text-right">
                <div class="flex justify-end gap-2">
                  <HasPermission name="users.manage">
                    <Button variant="ghost" size="icon" @click="openEditDialog(acc)">
                      <Pencil class="w-4 h-4" />
                    </Button>
                  </HasPermission>
                  <HasPermission name="users.manage">
                    <Button variant="ghost" size="icon" class="text-destructive" @click="deleteAccount(acc.id)">
                      <Trash2 class="w-4 h-4" />
                    </Button>
                  </HasPermission>
                </div>
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>

    <Dialog :open="isDialogOpen" @update:open="isDialogOpen = $event">
      <DialogContent class="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{{ isEditing ? 'Editar Cuenta' : 'Nueva Cuenta Bancaria' }}</DialogTitle>
          <DialogDescription>
            Configura los datos bancarios que aparecerán en las cotizaciones.
          </DialogDescription>
        </DialogHeader>

        <form @submit="onSubmit" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <FormField v-slot="{ componentField }" name="banco">
              <FormItem>
                <FormLabel>Banco</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. Banco Unión" v-bind="componentField" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="tipo_cuenta">
              <FormItem>
                <FormLabel>Tipo de Cuenta</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. Caja de Ahorros" v-bind="componentField" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
          </div>

          <FormField v-slot="{ componentField }" name="numero_cuenta">
            <FormItem>
              <FormLabel>Número de Cuenta</FormLabel>
              <FormControl>
                <Input placeholder="123456789" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="titular">
            <FormItem>
              <FormLabel>Titular de la Cuenta</FormLabel>
              <FormControl>
                <Input placeholder="Nombre Completo o Empresa" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="moneda">
            <FormItem>
              <FormLabel>Moneda</FormLabel>
              <Select v-bind="componentField">
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar moneda" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="USD">Dólares (USD)</SelectItem>
                  <SelectItem value="BOB">Bolivianos (BOB)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          </FormField>

          <div class="grid grid-cols-2 gap-4">
            <FormField v-slot="{ value, handleChange }" name="es_default">
              <FormItem class="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox :modelValue="value" @update:modelValue="handleChange" />
                </FormControl>
                <div class="space-y-1 leading-none">
                  <FormLabel>Por Defecto</FormLabel>
                </div>
              </FormItem>
            </FormField>

            <FormField v-slot="{ value, handleChange }" name="is_active">
              <FormItem class="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox :modelValue="value" @update:modelValue="handleChange" />
                </FormControl>
                <div class="space-y-1 leading-none">
                  <FormLabel>Activa</FormLabel>
                </div>
              </FormItem>
            </FormField>
          </div>

          <DialogFooter>
            <Button type="submit" :disabled="isLoading">
              Guardar Cuenta
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>
