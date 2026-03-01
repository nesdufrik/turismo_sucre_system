<script setup lang="ts">
import { VisXYContainer, VisLine, VisAxis, VisArea, VisTooltip, VisCrosshair } from '@unovis/vue'
import { ChartContainer } from '@/components/ui/chart'
import type { ChartDataPoint } from '../DashboardService'

defineProps<{
  data: ChartDataPoint[]
}>()

const x = (d: ChartDataPoint) => new Date(d.date).getTime()
const yQuoted = (d: ChartDataPoint) => d.quoted
const ySold = (d: ChartDataPoint) => d.sold

const tickFormat = (date: number) => {
    return new Date(date).toLocaleDateString('es-BO', { day: 'numeric', month: 'short' })
}

const colors = {
    quoted: '#3b82f6', // Blue-500
    sold: '#22c55e'    // Green-500
}
</script>

<template>
  <div class="flex flex-col h-full w-full">
    <!-- Legend -->
    <div class="flex justify-end gap-4 mb-2 text-sm">
        <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-blue-500"></div>
            <span class="text-muted-foreground">Cotizado</span>
        </div>
        <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-green-500"></div>
            <span class="text-muted-foreground">Vendido</span>
        </div>
    </div>

    <!-- Chart -->
    <div class="h-[300px] w-full">
        <ChartContainer :config="{ 
            quoted: { label: 'Cotizado', color: colors.quoted },
            sold: { label: 'Vendido', color: colors.sold } 
        }">
            <VisXYContainer :data="data" :height="300">
                <!-- Quoted Area (Blue) -->
                <VisArea :x="x" :y="yQuoted" :color="colors.quoted" :opacity="0.1" />
                <VisLine :x="x" :y="yQuoted" :color="colors.quoted" />
                
                <!-- Sold Area (Green) -->
                <VisArea :x="x" :y="ySold" :color="colors.sold" :opacity="0.2" />
                <VisLine :x="x" :y="ySold" :color="colors.sold" />

                <VisAxis type="x" :tick-format="tickFormat" :grid-line="false" />
                <VisAxis type="y" :tick-format="(v: number) => `$${v}`" :grid-line="true" />

                <VisTooltip />
                <VisCrosshair />
            </VisXYContainer>
        </ChartContainer>
    </div>
  </div>
</template>