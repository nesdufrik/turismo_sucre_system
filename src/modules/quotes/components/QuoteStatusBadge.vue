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
    case 'Approved':
      return { label: 'Aprobada', variant: 'default', class: 'bg-green-600 hover:bg-green-700' }
    case 'Rejected':
      return { label: 'Rechazada', variant: 'destructive' }
    case 'Sold':
      return { label: 'Vendida', variant: 'default', class: 'bg-blue-600 hover:bg-blue-700' }
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
