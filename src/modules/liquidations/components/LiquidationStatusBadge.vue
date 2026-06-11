<script setup lang="ts">
import { computed } from 'vue'
import { Badge } from '@/components/ui/badge'

const props = defineProps<{
  status?: 'paid' | 'unpaid' | 'partial' | string | null
}>()

const config = computed(() => {
  switch (props.status) {
    case 'paid':
      return { label: 'Pagada', variant: 'default', class: 'bg-green-600 hover:bg-green-700 text-white font-medium' }
    case 'unpaid':
      return { label: 'No Pagada', variant: 'destructive', class: 'font-medium' }
    case 'partial':
      return { label: 'Pago Parcial', variant: 'warning', class: 'font-medium' }
    default:
      return { label: props.status || 'Desconocido', variant: 'outline' }
  }
})
</script>

<template>
  <Badge :variant="config.variant as any" :class="config.class">
    {{ config.label }}
  </Badge>
</template>
