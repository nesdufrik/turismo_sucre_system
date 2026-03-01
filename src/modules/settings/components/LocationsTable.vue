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
import { toast } from 'vue-sonner'
import { Pencil, Trash2, Plus } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { locationSchema } from '../schemas/settings.schemas'
import { Skeleton } from '@/components/ui/skeleton'
import { useConfirm } from '@/composables/useConfirm'

const locations = ref<Tables<'ubicaciones'>[]>([])
const isLoading = ref(false)
const isDialogOpen = ref(false)
const isEditing = ref(false)
const currentId = ref<number | null>(null)

const { confirm } = useConfirm()

const form = useForm({
  validationSchema: toTypedSchema(locationSchema),
})

const fetchLocations = async () => {
  isLoading.value = true
  try {
    locations.value = await SettingsService.getLocations()
  } catch (error: any) {
    toast.error('Error al cargar ubicaciones', { description: error.message })
  } finally {
    isLoading.value = false
  }
}

const onSubmit = form.handleSubmit(async (values) => {
  try {
    const payload = {
      ciudad: values.ciudad,
      pais: values.pais,
      codigo: values.codigo || null
    }

    if (isEditing.value && currentId.value) {
      await SettingsService.updateLocation(currentId.value, payload)
      toast.success('Ubicación actualizada')
    } else {
      await SettingsService.createLocation(payload)
      toast.success('Ubicación creada')
    }
    isDialogOpen.value = false
    fetchLocations()
  } catch (error: any) {
    toast.error('Error al guardar', { description: error.message })
  }
})

const openCreateDialog = () => {
  isEditing.value = false
  currentId.value = null
  form.resetForm()
  form.setValues({ pais: 'Bolivia' })
  isDialogOpen.value = true
}

const openEditDialog = (location: Tables<'ubicaciones'>) => {
  isEditing.value = true
  currentId.value = location.ubicacion_id
  form.setValues({
    ciudad: location.ciudad || '',
    pais: location.pais || 'Bolivia',
    codigo: location.codigo || ''
  })
  isDialogOpen.value = true
}

const deleteLocation = async (id: number) => {
  const ok = await confirm({
    title: '¿Eliminar ubicación?',
    description: 'Esta acción no se puede deshacer.',
    variant: 'destructive',
    confirmText: 'Eliminar'
  })

  if (!ok) return

  try {
    await SettingsService.deleteLocation(id)
    toast.success('Ubicación eliminada')
    fetchLocations()
  } catch (error: any) {
    toast.error('Error al eliminar', { description: error.message })
  }
}

onMounted(() => {
  fetchLocations()
})
</script>

<template>
  <div>
    <div class="flex justify-end mb-4">
      <HasPermission name="users.manage">
        <Button @click="openCreateDialog">
          <Plus />
          Nueva Ubicación
        </Button>
      </HasPermission>
    </div>

    <div class="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ciudad</TableHead>
            <TableHead>País</TableHead>
            <TableHead>Código</TableHead>
            <TableHead class="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="isLoading">
            <TableRow v-for="i in 5" :key="i">
              <TableCell><Skeleton class="h-4 w-32" /></TableCell>
              <TableCell><Skeleton class="h-4 w-24" /></TableCell>
              <TableCell><Skeleton class="h-4 w-12" /></TableCell>
              <TableCell class="text-right"><Skeleton class="h-8 w-20 ml-auto" /></TableCell>
            </TableRow>
          </template>

          <template v-else-if="locations.length === 0">
            <TableRow>
              <TableCell colspan="4" class="text-center py-4 text-muted-foreground">
                No hay ubicaciones registradas.
              </TableCell>
            </TableRow>
          </template>

          <template v-else>
            <TableRow v-for="loc in locations" :key="loc.ubicacion_id">
              <TableCell class="font-medium">{{ loc.ciudad }}</TableCell>
              <TableCell>{{ loc.pais }}</TableCell>
              <TableCell class="font-mono text-xs">{{ loc.codigo || '-' }}</TableCell>
              <TableCell class="text-right">
                <div class="flex justify-end gap-2">
                  <HasPermission name="users.manage">
                    <Button variant="ghost" size="icon" @click="openEditDialog(loc)">
                      <Pencil class="w-4 h-4" />
                    </Button>
                  </HasPermission>
                  <HasPermission name="users.manage">
                    <Button variant="ghost" size="icon" class="text-destructive" @click="deleteLocation(loc.ubicacion_id)">
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
          <DialogTitle>{{ isEditing ? 'Editar Ubicación' : 'Nueva Ubicación' }}</DialogTitle>
          <DialogDescription>
            {{ isEditing ? 'Modifica los datos de la ubicación.' : 'Ingresa los datos para la nueva ubicación.' }}
          </DialogDescription>
        </DialogHeader>

        <form @submit="onSubmit" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <FormField v-slot="{ componentField }" name="ciudad">
              <FormItem>
                <FormLabel>Ciudad</FormLabel>
                <FormControl>
                  <Input placeholder="Sucre" v-bind="componentField" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="pais">
              <FormItem>
                <FormLabel>País</FormLabel>
                <FormControl>
                  <Input placeholder="Bolivia" v-bind="componentField" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
          </div>

          <FormField v-slot="{ componentField }" name="codigo">
            <FormItem>
              <FormLabel>Código (Opcional)</FormLabel>
              <FormControl>
                <Input placeholder="SRE" v-bind="componentField" class="uppercase" maxlength="5" />
              </FormControl>
              <FormDescription>Usado para generar códigos de reserva.</FormDescription>
              <FormMessage />
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