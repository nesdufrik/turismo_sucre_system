<script setup lang="ts">
import { ref, watch } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { InventoryService } from '../InventoryService'
import { packageSchema } from '../schemas/inventory.schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { toast } from 'vue-sonner'

const props = defineProps<{
  packageId: number | null
}>()

const emit = defineEmits<{
  (e: 'saved', newId?: number): void
  (e: 'cancel'): void
}>()

const isLoading = ref(false)

const form = useForm({
  validationSchema: toTypedSchema(packageSchema),
})

const loadPackage = async (id: number) => {
  isLoading.value = true
  try {
    const pkg = await InventoryService.getPackageById(id)
    form.setValues({
      nombre_paquete: pkg.nombre_paquete || '',
      descripcion: pkg.descripcion || '',
    })
  } catch (error: any) {
    toast.error('Error al cargar paquete', { description: error.message })
  } finally {
    isLoading.value = false
  }
}

watch(() => props.packageId, (newId) => {
  if (newId) {
    loadPackage(newId)
  } else {
    form.resetForm()
  }
}, { immediate: true })

const onSubmit = form.handleSubmit(async (values) => {
  isLoading.value = true
  try {
    if (props.packageId) {
      await InventoryService.updatePackage(props.packageId, values)
      toast.success('Paquete actualizado')
      emit('saved')
    } else {
      const newPkg = await InventoryService.createPackage(values)
      toast.success('Paquete creado')
      emit('saved', newPkg.paquete_id)
    }
  } catch (error: any) {
    toast.error('Error al guardar', { description: error.message })
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <form @submit="onSubmit" class="space-y-4 py-4">
    <FormField v-slot="{ componentField }" name="nombre_paquete">
      <FormItem>
        <FormLabel>Nombre del Paquete</FormLabel>
        <FormControl>
          <Input placeholder="Ej. Sucre & Potosi Express" v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="descripcion">
      <FormItem>
        <FormLabel>Descripción</FormLabel>
        <FormControl>
          <Textarea placeholder="Detalles del paquete..." class="resize-none" v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <div class="flex justify-end gap-2 pt-4">
      <Button type="button" variant="outline" @click="emit('cancel')">Cancelar</Button>
      <Button type="submit" :disabled="isLoading">
        {{ packageId ? 'Actualizar' : 'Crear' }}
      </Button>
    </div>
  </form>
</template>
