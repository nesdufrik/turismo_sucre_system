<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { InventoryService } from '../InventoryService'
import { SettingsService } from '@/modules/settings/SettingsService'
import type { Tables } from '@/types/database.types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { toast } from 'vue-sonner'
import { Pencil, Trash2, Plus } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { useConfirm } from '@/composables/useConfirm'

const props = defineProps<{
  serviceId: number
}>()

const prices = ref<any[]>([])
const priceSheets = ref<Tables<'hojasdeprecios'>[]>([])
const isLoading = ref(false)
const isDialogOpen = ref(false)
const editingId = ref<number | null>(null)

const { confirm } = useConfirm()

const formSchema = toTypedSchema(z.object({
  hoja_id: z.number().min(1, 'La hoja de precios es requerida'),
  precio_por_persona: z.coerce.number().min(0, 'El precio debe ser mayor o igual a 0'),
  min_pax: z.coerce.number().min(1, 'Min Pax debe ser al menos 1'),
  max_pax: z.coerce.number().min(1, 'Max Pax debe ser al menos 1'),
  temporada: z.string().optional(),
  // TODO: Add Date validation if we implement DatePickers
}))

const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    min_pax: 1,
    max_pax: 10,
    precio_por_persona: 0
  }
})

const loadData = async () => {
  isLoading.value = true
  try {
    const [fetchedPrices, sheets] = await Promise.all([
      InventoryService.getServicePrices(props.serviceId),
      SettingsService.getPriceSheets()
    ])
    prices.value = fetchedPrices
    priceSheets.value = sheets
  } catch (error: any) {
    toast.error('Error al cargar datos', { description: error.message })
  } finally {
    isLoading.value = false
  }
}

const openCreateDialog = () => {
  editingId.value = null
  
  // Find default sheet
  const defaultSheet = priceSheets.value.find(s => s.es_default)
  
  form.resetForm({
    values: {
      min_pax: 1,
      max_pax: 10,
      precio_por_persona: 0,
      hoja_id: defaultSheet ? defaultSheet.hoja_id : undefined
    }
  })
  isDialogOpen.value = true
}

const openEditDialog = (price: any) => {
  editingId.value = price.precio_id
  form.setValues({
    hoja_id: price.hoja_id,
    precio_por_persona: price.precio_por_persona,
    min_pax: price.min_pax,
    max_pax: price.max_pax,
    temporada: price.temporada || '',
  })
  isDialogOpen.value = true
}

const onSubmit = form.handleSubmit(async (values) => {
  try {
    const payload = {
      ...values,
      servicio_id: props.serviceId
    }

    if (editingId.value) {
      await InventoryService.updateServicePrice(editingId.value, payload)
      toast.success('Precio actualizado')
    } else {
      await InventoryService.createServicePrice(payload)
      toast.success('Precio agregado')
    }
    isDialogOpen.value = false
    loadData()
  } catch (error: any) {
    toast.error('Error al guardar precio', { description: error.message })
  }
})

const deletePrice = async (id: number) => {
  const confirmed = await confirm({
    title: '¿Eliminar precio?',
    description: 'Esta acción no se puede deshacer.',
    variant: 'destructive',
    confirmText: 'Eliminar'
  })

  if (!confirmed) return

  try {
    await InventoryService.deleteServicePrice(id)
    toast.success('Precio eliminado')
    loadData()
  } catch (error: any) {
    toast.error('Error al eliminar', { description: error.message })
  }
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="space-y-4 py-4">
    <div class="flex justify-between items-center">
      <h4 class="text-sm font-medium">Listado de Precios</h4>
      <HasPermission name="inventory.manage">
        <Button size="sm" @click="openCreateDialog">
          <Plus class="w-4 h-4 mr-2" />
          Agregar Precio
        </Button>
      </HasPermission>
    </div>

    <div class="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Hoja</TableHead>
            <TableHead>Pax (Min-Max)</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Temporada</TableHead>
            <TableHead class="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="isLoading">
            <TableCell colspan="5" class="text-center">Cargando...</TableCell>
          </TableRow>
          <TableRow v-else-if="prices.length === 0">
            <TableCell colspan="5" class="text-center text-muted-foreground">No hay precios definidos.</TableCell>
          </TableRow>
          <TableRow v-for="price in prices" :key="price.precio_id">
            <TableCell>{{ price.hoja?.nombre }}</TableCell>
            <TableCell>{{ price.min_pax }} - {{ price.max_pax }}</TableCell>
            <TableCell class="font-bold">
              <HasPermission name="prices.view_cost">
                {{ price.precio_por_persona }}
                <template #no-access>
                  <span class="text-muted-foreground font-normal text-xs italic">***</span>
                </template>
              </HasPermission>
            </TableCell>
            <TableCell>{{ price.temporada || '-' }}</TableCell>
            <TableCell class="text-right">
              <div class="flex justify-end gap-1">
                <HasPermission name="inventory.manage">
                  <Button variant="ghost" size="icon" class="h-8 w-8" @click="openEditDialog(price)">
                    <Pencil class="w-3 h-3" />
                  </Button>
                </HasPermission>
                <HasPermission name="inventory.manage">
                  <Button variant="ghost" size="icon" class="h-8 w-8 text-destructive" @click="deletePrice(price.precio_id)">
                    <Trash2 class="w-3 h-3" />
                  </Button>
                </HasPermission>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <Dialog :open="isDialogOpen" @update:open="isDialogOpen = $event">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{{ editingId ? 'Editar Precio' : 'Nuevo Precio' }}</DialogTitle>
          <DialogDescription>Configura el precio para una hoja y rango de pasajeros específico.</DialogDescription>
        </DialogHeader>

        <form @submit="onSubmit" class="space-y-4">
          <FormField v-slot="{ componentField }" name="hoja_id">
            <FormItem>
              <FormLabel>Hoja de Precios</FormLabel>
              <Select v-bind="componentField">
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una hoja" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem v-for="sheet in priceSheets" :key="sheet.hoja_id" :value="sheet.hoja_id">
                    {{ sheet.nombre }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          </FormField>

          <div class="grid grid-cols-2 gap-4">
             <FormField v-slot="{ componentField }" name="min_pax">
              <FormItem>
                <FormLabel>Min Pax</FormLabel>
                <FormControl>
                  <Input type="number" min="1" v-bind="componentField" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
            <FormField v-slot="{ componentField }" name="max_pax">
              <FormItem>
                <FormLabel>Max Pax</FormLabel>
                <FormControl>
                  <Input type="number" min="1" v-bind="componentField" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <FormField v-slot="{ componentField }" name="precio_por_persona">
              <FormItem>
                <FormLabel>Precio (por persona)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" v-bind="componentField" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="temporada">
              <FormItem>
                <FormLabel>Temporada (Opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. Alta 2025" v-bind="componentField" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
          </div>

          <DialogFooter>
            <Button type="submit">Guardar Precio</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>
