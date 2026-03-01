<script setup lang="ts">
import { VisSingleContainer, VisDonut, VisTooltip } from '@unovis/vue'
import { Donut } from '@unovis/ts'
import { computed } from 'vue'

const props = defineProps<{
  data: Record<string, number>
}>()

const chartData = computed(() => {
  // Vibrant Palette for distinct states
  return [
    { status: 'Borrador', value: props.data.Draft || 0, color: '#94a3b8' }, // Slate-400
    { status: 'En Revisión', value: props.data.In_Review || 0, color: '#f59e0b' }, // Amber-500
    { status: 'Aprobada', value: props.data.Approved || 0, color: '#3b82f6' }, // Blue-500
    { status: 'Rechazada', value: props.data.Rejected || 0, color: '#ef4444' }, // Red-500
    { status: 'Vendida', value: props.data.Sold || 0, color: '#22c55e' }, // Green-500
  ].filter(d => d.value > 0)
})

const valueFn = (d: any) => d.value
const colorFn = (d: any) => d.color

// Simplified tooltip without conflicting containers
const triggers = {
    [Donut.selectors.segment]: (d: any) => `
        <span style="display: flex; align-items: center; gap: 6px; font-family: sans-serif; font-size: 12px; color: #333;">
            <span style="width: 8px; height: 8px; border-radius: 50%; background-color: ${d.data.color}; display: inline-block;"></span>
            <b>${d.data.status}:</b> ${d.data.value}
        </span>
    `
}
</script>

<template>
  <div class="w-full flex flex-col items-center">
    <div class="h-[250px] w-full max-w-[300px]">
        <VisSingleContainer :data="chartData" :height="250">
            <VisDonut 
                :value="valueFn" 
                :color="colorFn"
                :arc-width="40"
            />
            <VisTooltip :triggers="triggers" />
        </VisSingleContainer>
    </div>
    
    <!-- Legend -->
    <div class="flex flex-wrap gap-x-4 gap-y-2 justify-center mt-4 px-4">
        <div v-for="item in chartData" :key="item.status" class="flex items-center gap-1.5">
            <div class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ backgroundColor: item.color }"></div>
            <span class="text-xs text-muted-foreground whitespace-nowrap">{{ item.status }} ({{ item.value }})</span>
        </div>
    </div>
  </div>
</template>