<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { InventoryService } from '@/modules/inventory/InventoryService'
import { QuoteService, type QuoteItemWithDetails } from '../../QuoteService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
} from '@/components/ui/number-field'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import SearchableSelect from '@/components/common/SearchableSelect.vue'
import { toast } from 'vue-sonner'
import type { Tables } from '@/types/database.types'

const props = defineProps<{
  open: boolean
  quoteId: number
  hojaId: number | null
  pax: number
  itemToEdit?: QuoteItemWithDetails | null
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'saved'): void
}>()

const packages = ref<Tables<'paquetes'>[]>([])
const isLoading = ref(false)
const isCalculating = ref(false)
const calculationDetails = ref<string[]>([])
const selectedPackageObject = ref<Tables<'paquetes'> | null>(null)

// Form State
const selectedPackageId = ref<string>('')
const appliesCommission = ref(false)
// Removed local pax
const dateService = ref('')
const manualPrice = ref<number | null>(null)
const customDescription = ref('')
// Removed esPorPax

const loadPackages = async () => {
  isLoading.value = true
  try {
    const data = await InventoryService.getPackages()
    packages.value = data || []
  } catch (error) {
    toast.error('Error al cargar paquetes')
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

const searchPackages = async (query: string) => {
  return await InventoryService.searchPackages(query)
}

onMounted(() => {
  loadPackages()

  if (props.itemToEdit) {
      // --- EDIT MODE ---
      selectedPackageId.value = props.itemToEdit.paquete_id?.toString() || ''
      
      if (props.itemToEdit.paquetes) {
           const mockPkg = {
               paquete_id: props.itemToEdit.paquete_id!,
               nombre_paquete: props.itemToEdit.paquetes.nombre_paquete
           } as any
           
           selectedPackageObject.value = mockPkg
           if (!packages.value.find(p => p.paquete_id === mockPkg.paquete_id)) {
               packages.value = [mockPkg, ...packages.value]
           }
      }
      
      dateService.value = props.itemToEdit.fecha_servicio || ''
      manualPrice.value = props.itemToEdit.paquete_id ? 0 : props.itemToEdit.precio_unitario_snapshot
      customDescription.value = props.itemToEdit.descripcion_snapshot || ''
      calculationDetails.value = [] // Reset logs
	    appliesCommission.value = props.itemToEdit.aplica_comision || false
  } else {
      // --- CREATE MODE ---
      selectedPackageId.value = ''
      selectedPackageObject.value = null
      dateService.value = new Date().toISOString().split('T')[0] as string
      manualPrice.value = null
      calculationDetails.value = []
      customDescription.value = ''
      appliesCommission.value = false
  }
})

// Removed watch(props.open)
// watch(() => props.open, (isOpen) => { ... })

const selectedPackage = computed(() =>  selectedPackageObject.value ||
  packages.value.find(p => p.paquete_id.toString() === selectedPackageId.value)
)

const subtotal = computed(() => {
  return (manualPrice.value || 0) * props.pax
})

const calculatePrice = async () => {
  if (!selectedPackageId.value || !props.hojaId || !dateService.value) return

  isCalculating.value = true
  calculationDetails.value = []
  let totalPackagePrice = 0
  
  try {
    // 1. Get Package Components
    const pkg = await InventoryService.getPackageById(Number(selectedPackageId.value))
    
    if (!pkg.componentes || pkg.componentes.length === 0) {
      calculationDetails.value.push('⚠️ Este paquete no tiene servicios configurados.')
      return
    }

    // 2. Iterate and Price each component
    for (const component of pkg.componentes) {
      if (!component.servicio_id) continue

      const priceData = await QuoteService.findServicePrice(
        component.servicio_id, 
        props.hojaId, 
        props.pax, 
        dateService.value
      )

      if (priceData && priceData.precio_por_persona) {
        const componentTotal = priceData.precio_por_persona * (component.cantidad || 1)
        totalPackagePrice += componentTotal
        calculationDetails.value.push(
          `✅ ${component.servicio?.nombre}: ${priceData.precio_por_persona} x ${component.cantidad} = ${componentTotal}`
        )
      } else {
        calculationDetails.value.push(
          `❌ ${component.servicio?.nombre}: No se encontró precio para esta fecha/pax`
        )
      }
    }

    // 3. Update Manual Price (Suggestion)
    manualPrice.value = totalPackagePrice

  } catch (error) {
    console.error(error)
    toast.error('Error al calcular precio del paquete')
  } finally {
    isCalculating.value = false
  }
}

// Trigger calculation when relevant fields change
watch([selectedPackageId, dateService], () => {
  // Only auto-calc if NOT editing initial load (to preserve manual override)
  if (props.itemToEdit && 
      selectedPackageId.value === props.itemToEdit.paquete_id?.toString() &&
      dateService.value === props.itemToEdit.fecha_servicio &&
      manualPrice.value === props.itemToEdit.precio_unitario_snapshot
      ) {
      return
  }

  if (selectedPackageId.value && props.hojaId) {
    calculatePrice()
  }
})

const onSave = async () => {
  if (!selectedPackageId.value) return
  
  isLoading.value = true
  try {
    const payload = {
      paquete_id: Number(selectedPackageId.value),
      cantidad: 1,
      numero_pax: props.pax,
      fecha_servicio: dateService.value,
      precio_unitario_snapshot: manualPrice.value || 0,
      subtotal_item: subtotal.value,
      es_por_pax: true,
      aplica_comision: appliesCommission.value,
      descripcion_snapshot: customDescription.value || selectedPackage.value?.nombre_paquete
    }

    if (props.itemToEdit) {
         await QuoteService.updateQuoteItem(props.itemToEdit.item_id, payload)
         toast.success('Paquete actualizado')
    } else {
        await QuoteService.addQuoteItem({
            ...payload,
            cotizacion_id: props.quoteId,
        })
        toast.success('Paquete agregado')
    }
    emit('saved')
    emit('update:open', false)
  } catch (error: any) {
    toast.error('Error al guardar', { description: error.message })
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>{{ itemToEdit ? 'Editar Paquete' : 'Agregar Paquete' }}</DialogTitle>
        <DialogDescription>
          {{ itemToEdit ? 'Modifica los detalles del paquete.' : 'Selecciona un paquete turístico. El precio se calculará automáticamente según los servicios incluidos.' }}
        </DialogDescription>
      </DialogHeader>

      <div class="grid gap-4 py-4">
        <div class="grid gap-2">
          <Label>Paquete</Label>
          <SearchableSelect
            v-model="selectedPackageId"
            :items="packages"
            label-key="nombre_paquete"
            value-key="paquete_id"
            placeholder="Selecciona un paquete"
            search-placeholder="Buscar paquete..."
            mode="async"
            :search-fn="searchPackages"
            @select="(item) => selectedPackageObject = item as Tables<'paquetes'>"
          />
        </div>

        <div class="grid grid-cols-1 gap-4">
          <div class="grid gap-2">
            <Label>Fecha del Servicio</Label>
            <Input type="date" v-model="dateService" />
          </div>
        </div>

        <div class="grid gap-2">
           <div class="flex justify-between">
             <Label>Precio Unitario (Calculado)</Label>
             <span v-if="isCalculating" class="text-xs text-muted-foreground animate-pulse">Calculando...</span>
           </div>
           <NumberField v-model="manualPrice" :min="0" :step="0.01">
              <NumberFieldContent>
                <NumberFieldDecrement />
                <NumberFieldInput />
                <NumberFieldIncrement />
              </NumberFieldContent>
            </NumberField>
           <p class="text-xs text-muted-foreground">Puedes ajustar este precio manualmente.</p>

           <div class="flex items-center space-x-2 pt-2">
             <Checkbox id="commission" v-model:modelValue="appliesCommission" />
             <Label for="commission" class="text-sm font-medium leading-none cursor-pointer">
                Aplica Comisión de Agencia
             </Label>
           </div>
        </div>
        
        <!-- Calculation Details -->
        <div v-if="calculationDetails.length > 0" class="text-xs text-muted-foreground bg-muted p-2 rounded max-h-24 overflow-y-auto">
          <div v-for="(log, i) in calculationDetails" :key="i">{{ log }}</div>
        </div>

        <div class="grid gap-2">
          <Label>Descripción (Opcional)</Label>
          <Input v-model="customDescription" />
        </div>

        <div class="bg-muted p-4 rounded-md">
          <div class="flex justify-between items-center">
            <span class="font-bold">Subtotal Estimado:</span>
            <span class="text-lg font-bold">{{ subtotal }}</span>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="emit('update:open', false)">Cancelar</Button>
        <Button @click="onSave" :disabled="isLoading || !selectedPackageId">
          {{ isLoading ? 'Guardando...' : (itemToEdit ? 'Guardar Cambios' : 'Agregar a Cotización') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
