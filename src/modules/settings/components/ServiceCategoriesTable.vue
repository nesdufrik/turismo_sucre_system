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
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'vue-sonner'
import { Pencil, Trash2, Plus } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { serviceCategorySchema } from '../schemas/settings.schemas'
import { Skeleton } from '@/components/ui/skeleton'
import { useConfirm } from '@/composables/useConfirm'

const categories = ref<Tables<'categoriasservicio'>[]>([])
const isLoading = ref(false)
const isDialogOpen = ref(false)
const isEditing = ref(false)
const currentId = ref<number | null>(null)

const { confirm } = useConfirm()

const form = useForm({
  validationSchema: toTypedSchema(serviceCategorySchema),
})

const fetchCategories = async () => {
  isLoading.value = true
  try {
    categories.value = await SettingsService.getServiceCategories()
  } catch (error: any) {
    toast.error('Error al cargar categorías', { description: error.message })
  } finally {
    isLoading.value = false
  }
}

const onSubmit = form.handleSubmit(async (values) => {
  try {
    const payload = {
      nombre: values.nombre,
      descripcion: values.descripcion || null,
      color: values.color || '#3b82f6'
    }

    if (isEditing.value && currentId.value) {
      await SettingsService.updateServiceCategory(currentId.value, payload)
      toast.success('Categoría actualizada')
    } else {
      await SettingsService.createServiceCategory(payload)
      toast.success('Categoría creada')
    }
    isDialogOpen.value = false
    fetchCategories()
  } catch (error: any) {
    toast.error('Error al guardar', { description: error.message })
  }
})

const openCreateDialog = () => {
  isEditing.value = false
  currentId.value = null
  form.resetForm()
  form.setValues({ color: '#3b82f6' })
  isDialogOpen.value = true
}

const openEditDialog = (category: Tables<'categoriasservicio'>) => {
  isEditing.value = true
  currentId.value = category.categoria_id
  form.setValues({ 
    nombre: category.nombre || '',
    descripcion: category.descripcion || '',
    color: category.color || '#3b82f6'
  })
  isDialogOpen.value = true
}

const deleteCategory = async (id: number) => {
  const ok = await confirm({
    title: '¿Eliminar categoría?',
    description: 'Esta acción no se puede deshacer.',
    variant: 'destructive',
    confirmText: 'Eliminar'
  })
  
  if (!ok) return

  try {
    await SettingsService.deleteServiceCategory(id)
    toast.success('Categoría eliminada')
    fetchCategories()
  } catch (error: any) {
    toast.error('Error al eliminar', { description: error.message })
  }
}

onMounted(() => {
  fetchCategories()
})
</script>

<template>
  <div>
    <div class="flex justify-end mb-4">
      <HasPermission name="users.manage">
        <Button @click="openCreateDialog">
          <Plus />
          Nueva Categoría
        </Button>
      </HasPermission>
    </div>

    <div class="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead class="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="isLoading">
            <TableRow v-for="i in 5" :key="i">
              <TableCell>
                <div class="flex items-center gap-2">
                  <Skeleton class="h-3 w-3 rounded-full" />
                  <Skeleton class="h-4 w-32" />
                </div>
              </TableCell>
              <TableCell><Skeleton class="h-4 w-48" /></TableCell>
              <TableCell class="text-right"><Skeleton class="h-8 w-20 ml-auto" /></TableCell>
            </TableRow>
          </template>
          
          <template v-else-if="categories.length === 0">
            <TableRow>
              <TableCell colspan="3" class="text-center py-4 text-muted-foreground">
                No hay categorías registradas.
              </TableCell>
            </TableRow>
          </template>
          
          <template v-else>
            <TableRow v-for="cat in categories" :key="cat.categoria_id">
              <TableCell class="font-medium flex items-center gap-2">
                <div 
                  class="w-3 h-3 rounded-full" 
                  :style="{ backgroundColor: cat.color || '#3b82f6' }"
                ></div>
                {{ cat.nombre }}
              </TableCell>
              <TableCell class="text-muted-foreground">{{ cat.descripcion || '-' }}</TableCell>
              <TableCell class="text-right">
                <div class="flex justify-end gap-2">
                  <HasPermission name="users.manage">
                    <Button variant="ghost" size="icon" @click="openEditDialog(cat)">
                      <Pencil class="w-4 h-4" />
                    </Button>
                  </HasPermission>
                  <HasPermission name="users.manage">
                    <Button variant="ghost" size="icon" class="text-destructive" @click="deleteCategory(cat.categoria_id)">
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
          <DialogTitle>{{ isEditing ? 'Editar Categoría' : 'Nueva Categoría' }}</DialogTitle>
          <DialogDescription>
            {{ isEditing ? 'Modifica los detalles de la categoría.' : 'Ingresa los datos para la nueva categoría.' }}
          </DialogDescription>
        </DialogHeader>
        
        <form @submit="onSubmit" class="space-y-4">
          <FormField v-slot="{ componentField }" name="nombre">
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Transporte Privado" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="descripcion">
            <FormItem>
              <FormLabel>Descripción (Opcional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Descripción corta..." v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="color">
            <FormItem>
              <FormLabel>Color Identificativo</FormLabel>
              <FormControl>
                <div class="flex gap-2 items-center">
                  <Input type="color" class="w-12 h-8 p-0 border-0" v-bind="componentField" />
                  <Input type="text" v-bind="componentField" placeholder="#000000" class="flex-1" />
                </div>
              </FormControl>
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