<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { type Component } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  title: string
  value: string | number
  subValue?: string
  icon?: Component
  trend?: number // Percentage change (future feature)
  loading?: boolean
  class?: string
}

defineProps<Props>()
</script>

<template>
  <Card :class="cn('overflow-hidden', $props.class)">
    <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle class="text-sm font-medium text-muted-foreground">
        {{ title }}
      </CardTitle>
      <component :is="icon" v-if="icon" class="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div v-if="loading" class="animate-pulse space-y-2">
        <div class="h-8 w-24 bg-muted rounded"></div>
        <div class="h-3 w-16 bg-muted rounded"></div>
      </div>
      <div v-else>
        <div class="text-2xl font-bold">{{ value }}</div>
        <p v-if="subValue" class="text-xs text-muted-foreground mt-1">
          {{ subValue }}
        </p>
      </div>
    </CardContent>
  </Card>
</template>
