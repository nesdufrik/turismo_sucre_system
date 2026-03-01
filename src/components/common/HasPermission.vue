<script setup lang="ts">
import { usePermission } from '@/composables/usePermission'

interface Props {
  /** El código del permiso requerido (ej. 'quotes.delete') */
  name: string
  /** Opcional: Si se requiere que tenga TODOS los permisos de una lista */
  all?: boolean
}

const props = defineProps<Props>()
const { can } = usePermission()

// Si es una lista de permisos separada por comas o un array
const permissions = props.name.split(',').map(p => p.trim())

const hasAccess = () => {
  if (props.all) {
    return permissions.every(p => can(p))
  }
  return permissions.some(p => can(p))
}
</script>

<template>
  <slot v-if="hasAccess()" />
  <slot v-else name="no-access" />
</template>
