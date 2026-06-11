<script setup lang="ts">
import { computed } from 'vue'
import { Badge } from '@/components/ui/badge'

const props = defineProps<{
  status?: string | null
}>()

const config = computed(() => {
  switch (props.status) {
    case 'Draft':
      return { label: 'Borrador', variant: 'secondary' }
    case 'In_Review':
      return { label: 'En Revisión', variant: 'warning' } // Custom variant might be needed, using outline fallback
    case 'Liquidated':
      return { label: 'Liquidada', variant: 'default', class: 'bg-blue-600 hover:bg-blue-700 text-white' }
    case 'Rejected':
      return { label: 'Rechazada', variant: 'destructive' }
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
