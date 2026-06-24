<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

const props = withDefaults(defineProps<{
  open: boolean
  title?: string
  description?: string
  placeholder?: string
  confirmText?: string
}>(), {
  title: 'Reabrir Cotización para Edición',
  description: 'Esta cotización ya se encuentra liquidada o pagada. Para poder modificarla, debes ingresar una justificación detallada que quedará registrada en el historial de auditoría.',
  placeholder: 'Ej: Se requiere agregar un traslado de servicio adicional solicitado por el cliente...',
  confirmText: 'Reabrir Cotización'
})

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'confirm', justification: string): void
}>()

const justification = ref('')
const error = ref('')

// Reset when opening
watch(() => props.open, (val) => {
  if (val) {
    justification.value = ''
    error.value = ''
  }
})

const handleConfirm = () => {
  const trimmed = justification.value.trim()
  if (!trimmed) {
    error.value = 'La justificación es obligatoria.'
    return
  }
  if (trimmed.length < 10) {
    error.value = 'Por favor, proporciona una justificación más detallada (mínimo 10 caracteres).'
    return
  }
  emit('confirm', trimmed)
  emit('update:open', false)
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-[450px]">
      <DialogHeader>
        <DialogTitle>{{ title }}</DialogTitle>
        <DialogDescription>
          {{ description }}
        </DialogDescription>
      </DialogHeader>
      
      <div class="grid gap-4 py-4">
        <div class="grid gap-2">
          <Label htmlFor="justification">Justificación / Motivo del cambio</Label>
          <Textarea
            id="justification"
            v-model="justification"
            :placeholder="placeholder"
            class="h-28"
            :class="{ 'border-red-500': error }"
          />
          <span v-if="error" class="text-xs text-red-500">{{ error }}</span>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="emit('update:open', false)">Cancelar</Button>
        <Button class="bg-blue-600 hover:bg-blue-700 text-white" @click="handleConfirm">{{ confirmText }}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
