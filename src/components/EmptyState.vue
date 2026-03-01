<script setup lang="ts">
import { type Component } from 'vue'
import { Button } from '@/components/ui/button'

defineProps<{
  title: string
  description?: string
  icon?: Component
  actionLabel?: string
}>()

const emit = defineEmits<{
  (e: 'action'): void
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center p-8 text-center bg-muted/10 rounded-lg border-2 border-dashed border-muted h-full min-h-[300px]">
    <component 
      :is="icon" 
      v-if="icon" 
      class="w-12 h-12 text-muted-foreground mb-4 opacity-50" 
    />
    <h3 class="text-lg font-medium tracking-tight mb-1">{{ title }}</h3>
    <p v-if="description" class="text-sm text-muted-foreground max-w-sm mb-6">
      {{ description }}
    </p>
    <Button v-if="actionLabel" @click="emit('action')">
      {{ actionLabel }}
    </Button>
  </div>
</template>
