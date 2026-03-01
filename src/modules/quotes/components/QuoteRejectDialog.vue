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

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'confirm', reason: string): void
}>()

const reason = ref('')
const error = ref('')

// Reset when opening
watch(() => props.open, (val) => {
  if (val) {
    reason.value = ''
    error.value = ''
  }
})

const handleConfirm = () => {
  if (!reason.value.trim()) {
    error.value = 'El motivo es obligatorio'
    return
  }
  emit('confirm', reason.value)
  emit('update:open', false)
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Rechazar Cotización</DialogTitle>
        <DialogDescription>
          Por favor indica el motivo del rechazo para que el agente pueda realizar las correcciones necesarias.
        </DialogDescription>
      </DialogHeader>
      
      <div class="grid gap-4 py-4">
        <div class="grid gap-2">
          <Label htmlFor="reason">Motivo</Label>
          <Textarea
            id="reason"
            v-model="reason"
            placeholder="Ej: El margen de utilidad es muy bajo..."
            class="h-24"
            :class="{ 'border-red-500': error }"
          />
          <span v-if="error" class="text-xs text-red-500">{{ error }}</span>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="emit('update:open', false)">Cancelar</Button>
        <Button variant="destructive" @click="handleConfirm">Rechazar</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
