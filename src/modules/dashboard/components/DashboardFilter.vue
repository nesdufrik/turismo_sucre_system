<script setup lang="ts">
import { ref, watch } from 'vue'
import { type DateRangeOption } from '../DashboardService'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RangeCalendar } from '@/components/ui/range-calendar'
import { Calendar as CalendarIcon } from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import { getLocalTimeZone } from '@internationalized/date'
import type { DateRange } from 'radix-vue'

// Props & Emits
const props = defineProps<{
  modelValue: DateRangeOption
  customRange?: { start: Date, end: Date }
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: DateRangeOption): void
  (e: 'update:customRange', value: { start: Date, end: Date }): void
  (e: 'change'): void
}>()

// Internal State
const selectedPreset = ref<DateRangeOption>(props.modelValue)

// Radix/Shadcn RangeCalendar uses DateRange type: { start: DateValue, end: DateValue }
const dateRange = ref<DateRange>({
  start: undefined,
  end: undefined,
})

const handlePresetChange = (val: string) => {
  const newVal = val as DateRangeOption
  emit('update:modelValue', newVal)
  
  if (newVal !== 'custom') {
    emit('change')
  }
}

// When calendar selection changes
watch(dateRange, (val) => {
  if (val.start && val.end) {
    const start = val.start.toDate(getLocalTimeZone())
    const end = val.end.toDate(getLocalTimeZone())
    emit('update:customRange', { start, end })
    // If we have both dates, trigger change
    if (selectedPreset.value === 'custom') {
        emit('change')
    }
  }
})
</script>

<template>
  <div class="flex items-center gap-2">
    <!-- Preset Selector -->
    <Select v-model="selectedPreset" @update:modelValue="(val: any) => handlePresetChange(val)">
      <SelectTrigger class="w-[180px]">
        <SelectValue placeholder="Periodo" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="this_month">Este Mes</SelectItem>
        <SelectItem value="last_month">Mes Pasado</SelectItem>
        <SelectItem value="this_year">Este Año</SelectItem>
        <SelectItem value="custom">Personalizado</SelectItem>
      </SelectContent>
    </Select>

    <!-- Custom Date Picker (Visible only if custom) -->
    <div v-if="selectedPreset === 'custom'" class="grid gap-2">
      <Popover>
        <PopoverTrigger as-child>
          <Button
            id="date"
            variant="outline"
            :class="cn(
              'w-[260px] justify-start text-left font-normal',
              !dateRange.start && 'text-muted-foreground'
            )"
          >
            <CalendarIcon class="mr-2 h-4 w-4" />
            <span v-if="dateRange.start">
              <template v-if="dateRange.end">
                {{ dateRange.start }} - {{ dateRange.end }}
              </template>
              <template v-else>
                {{ dateRange.start }}
              </template>
            </span>
            <span v-else>Seleccionar fechas</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent class="w-auto p-0" align="end">
          <RangeCalendar
            v-model="dateRange as any"
            initial-focus
            :number-of-months="2"
          />
        </PopoverContent>
      </Popover>
    </div>
  </div>
</template>