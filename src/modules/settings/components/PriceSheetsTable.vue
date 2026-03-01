<script setup lang="ts">
import { ref, onMounted } from 'vue'
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
import { toast } from 'vue-sonner'
import { Pencil, Trash2, Plus, Check } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { priceSheetSchema } from '../schemas/settings.schemas'
import { Skeleton } from '@/components/ui/skeleton'
import { useConfirm } from '@/composables/useConfirm'

const sheets = ref<Tables<'hojasdeprecios'>[]>([])
const isLoading = ref(false)
const isDialogOpen = ref(false)
const isEditing = ref(false)
const currentId = ref<number | null>(null)

const { confirm } = useConfirm()

const form = useForm({
  validationSchema: toTypedSchema(priceSheetSchema),
  initialValues: {
    es_default: false
  }
})

const fetchSheets = async () => {
  isLoading.value = true
  try {
    sheets.value = await SettingsService.getPriceSheets()
  } catch (error: any) {
    toast.error('Error al cargar hojas de precios', { description: error.message })
  } finally {
    isLoading.value = false
  }
}

const onSubmit = form.handleSubmit(async (values) => {
  try {
    if (isEditing.value && currentId.value) {
      await SettingsService.updatePriceSheet(currentId.value, {
        nombre: values.nombre,
        es_default: values.es_default
      })
      toast.success('Hoja de precios actualizada')
    } else {
      await SettingsService.createPriceSheet({
        nombre: values.nombre,
        es_default: values.es_default
      })
      toast.success('Hoja de precios creada')
    }
    isDialogOpen.value = false
    fetchSheets()
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

const openEditDialog = (sheet: Tables<'hojasdeprecios'>) => {
  isEditing.value = true
  currentId.value = sheet.hoja_id
  form.setValues({
    nombre: sheet.nombre || '',
    es_default: sheet.es_default || false
  })
  isDialogOpen.value = true
}

const deleteSheet = async (id: number) => {
  const ok = await confirm({
    title: '¿Eliminar hoja de precios?',
    description: 'Esta acción no se puede deshacer.',
    variant: 'destructive',
    confirmText: 'Eliminar'
  })

  if (!ok) return

  try {
    await SettingsService.deletePriceSheet(id)
    toast.success('Hoja de precios eliminada')
    fetchSheets()
  } catch (error: any) {
    toast.error('Error al eliminar', { description: error.message })
  }
}

onMounted(() => {
  fetchSheets()
})
</script>

<template>
  <div>
    <div class="flex justify-end mb-4">
      <HasPermission name="users.manage">
        <Button @click="openCreateDialog">
          <Plus />
          Nueva Hoja de Precios
        </Button>
      </HasPermission>
    </div>

    <div class="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Por Defecto</TableHead>
            <TableHead class="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="isLoading">
            <TableRow v-for="i in 5" :key="i">
              <TableCell><Skeleton class="h-4 w-48" /></TableCell>
              <TableCell><Skeleton class="h-4 w-4" /></TableCell>
              <TableCell class="text-right"><Skeleton class="h-8 w-20 ml-auto" /></TableCell>
            </TableRow>
          </template>

          <template v-else-if="sheets.length === 0">
            <TableRow>
              <TableCell colspan="3" class="text-center py-4 text-muted-foreground">
                No hay hojas de precios registradas.
              </TableCell>
            </TableRow>
          </template>

          <template v-else>
            <TableRow v-for="sheet in sheets" :key="sheet.hoja_id">
              <TableCell class="font-medium">{{ sheet.nombre }}</TableCell>
              <TableCell>
                <Check v-if="sheet.es_default" class="w-4 h-4 text-green-500" />
              </TableCell>
              <TableCell class="text-right">
                <div class="flex justify-end gap-2">
                  <HasPermission name="users.manage">
                    <Button variant="ghost" size="icon" @click="openEditDialog(sheet)">
                      <Pencil class="w-4 h-4" />
                    </Button>
                  </HasPermission>
                  <HasPermission name="users.manage">
                    <Button variant="ghost" size="icon" class="text-destructive" @click="deleteSheet(sheet.hoja_id)">
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
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{{ isEditing ? 'Editar Hoja de Precios' : 'Nueva Hoja de Precios' }}</DialogTitle>
          <DialogDescription>
            {{ isEditing
              ? 'Modifica los datos de la hoja de precios.'
              : 'Ingresa los datos para la nueva hoja deprecios.' }}
          </DialogDescription>
        </DialogHeader>
        <form @submit="onSubmit" class="space-y-4">
          <FormField v-slot="{ componentField }" name="nombre">
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Tarifa General 2025" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ value, handleChange }" name="es_default">
            <FormItem class="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
              <FormControl>
                <Checkbox :modelValue="value" @update:modelValue="handleChange" />
              </FormControl>
              <div class="space-y-1 leading-none">
                <FormLabel>Es por Defecto</FormLabel>
                <FormDescription>
                  Esta hoja de precios se usará automáticamente en nuevas cotizaciones.
                </FormDescription>
              </div>
            </FormItem>
          </FormField>

          <DialogFooter>
            <Button type="submit">Guardar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>