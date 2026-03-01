<script setup lang="ts">
import { ref, watch } from 'vue'
import { Check, ChevronsUpDown, Loader2 } from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useDebounceFn } from '@vueuse/core'

interface Props {
  modelValue?: string | number | null
  items: any[]
  labelKey?: string
  valueKey?: string
  placeholder?: string
  searchPlaceholder?: string
  mode?: 'sync' | 'async'
  searchFn?: (query: string) => Promise<any[]>
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  labelKey: 'label',
  valueKey: 'value',
  placeholder: 'Seleccionar...',
  searchPlaceholder: 'Buscar...',
  mode: 'sync',
  items: () => [],
})

const emit = defineEmits(['update:modelValue', 'select'])

const open = ref(false)
const internalItems = ref<any[]>([])
const loading = ref(false)
const searchQuery = ref('')

// Initialize items
watch(() => props.items, (newItems) => {
  if (props.mode === 'sync' || !searchQuery.value) {
    internalItems.value = newItems
  }
}, { immediate: true })

// Async Search
const handleSearch = useDebounceFn(async (query: string) => {
  searchQuery.value = query
  if (props.mode === 'async' && props.searchFn) {
    if (!query) {
        internalItems.value = props.items
        return
    }
    loading.value = true
    try {
      const results = await props.searchFn(query)
      internalItems.value = results
    } catch (e) {
      console.error(e)
    } finally {
      loading.value = false
    }
  }
}, 300)

const handleSelect = (item: any) => {
  const val = item[props.valueKey]
  emit('update:modelValue', val)
  emit('select', item)
  open.value = false
}

// Display label
const displayLabel = ref('')
watch(() => props.modelValue, (val) => {
    if (!val) {
        displayLabel.value = ''
        return
    }
    // Try to find in current items
    const found = internalItems.value.find(i => i[props.valueKey] == val) || props.items.find(i => i[props.valueKey] == val)
    if (found) {
        displayLabel.value = found[props.labelKey]
    } else {
        // Fallback if not found (maybe loaded async previously)
        displayLabel.value = String(val)
    }
}, { immediate: true })

</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button
        variant="outline"
        role="combobox"
        :aria-expanded="open"
        class="w-full justify-between"
        :disabled="disabled"
      >
        <span class="truncate">
            {{ displayLabel || placeholder }}
        </span>
        <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-full p-0">
      <Command :disable-filter="mode === 'async'">
        <CommandInput 
            :placeholder="searchPlaceholder" 
            @update:model-value="handleSearch"
        />
        <CommandList>
            <CommandEmpty v-if="!loading && mode === 'sync'">No se encontraron resultados.</CommandEmpty>
            <div v-if="!loading && mode === 'async' && internalItems.length === 0" class="py-6 text-center text-sm">
                No se encontraron resultados.
            </div>
            <CommandGroup>
                <div v-if="loading" class="flex items-center justify-center p-4">
                    <Loader2 class="h-4 w-4 animate-spin" />
                </div>
                <CommandItem
                    v-for="item in internalItems"
                    :key="item[valueKey]"
                    :value="item"
                    @select="() => handleSelect(item)"
                >
                    <Check
                    :class="cn(
                        'mr-2 h-4 w-4',
                        modelValue == item[valueKey] ? 'opacity-100' : 'opacity-0'
                    )"
                    />
                    {{ item[labelKey] }}
                </CommandItem>
            </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
</template>