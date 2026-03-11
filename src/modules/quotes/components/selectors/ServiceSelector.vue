<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { InventoryService } from '@/modules/inventory/InventoryService'
import { QuoteService, type QuoteItemWithDetails } from '../../QuoteService'
import { useConfirm } from '@/composables/useConfirm'
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
	hojaId: number | null
	quoteId: number
    pax: number
    itemToEdit?: QuoteItemWithDetails | null
}>()

const emit = defineEmits<{
	(e: 'update:open', value: boolean): void
	(e: 'saved'): void
}>()

const services = ref<Tables<'servicios'>[]>([])
const isLoading = ref(false)
const isPricing = ref(false)
const selectedServiceObject = ref<Tables<'servicios'> | null>(null) // Store full object
const { confirm } = useConfirm()

// Form State
const selectedServiceId = ref<string>('')
const dateService = ref('')
const manualPrice = ref<number | null>(null)
const foundPrice = ref<number | null>(null)
const customDescription = ref('')
const appliesCommission = ref(false)

const loadServices = async () => {
	isLoading.value = true
	try {
		const data = await InventoryService.getServices()
		services.value = data || []
	} catch (error) {
		toast.error('Error al cargar servicios')
		console.error(error)
	} finally {
		isLoading.value = false
	}
}

const searchServices = async (query: string) => {
	return await InventoryService.searchServices(query)
}

onMounted(() => {
	loadServices()
    
    // Initialize Form
    if (props.itemToEdit) {
        // --- EDIT MODE ---
        console.log('Editing Item:', props.itemToEdit) // Debug
        
        selectedServiceId.value = props.itemToEdit.servicio_id?.toString() || ''
        dateService.value = props.itemToEdit.fecha_servicio || ''
        manualPrice.value = props.itemToEdit.servicio_id ? 0 : props.itemToEdit.precio_unitario_snapshot
        customDescription.value = props.itemToEdit.descripcion_snapshot || ''
        // Use the proper column 'aplica_comision'. Default to true.
        appliesCommission.value = props.itemToEdit.aplica_comision ?? false

        // Mock Object for UI Display (Optional but recommended for UX)
        if (props.itemToEdit.servicios) {
             const mockService = { 
                servicio_id: props.itemToEdit.servicio_id!,
                nombre: props.itemToEdit.servicios.nombre,
            } as any
            selectedServiceObject.value = mockService
            
            // Inject into list so SearchableSelect finds it immediately
            if (!services.value.find(s => s.servicio_id === props.itemToEdit?.servicio_id)) {
                services.value = [mockService, ...services.value]
            }
        }
    } else {
        // --- CREATE MODE ---
        selectedServiceId.value = ''
        selectedServiceObject.value = null
        dateService.value = new Date().toISOString().split('T')[0] || ''
        manualPrice.value = null
        foundPrice.value = null
        customDescription.value = ''
        appliesCommission.value = false
    }
})

// Removed watch(props.open) because v-if in parent handles lifecycle
// watch(() => props.open, ...) 

const selectedService = computed(() =>
    selectedServiceObject.value || 
	services.value.find(
		(s) => s.servicio_id.toString() === selectedServiceId.value
	)
)

// Watch for changes to trigger price lookup
watch([selectedServiceId, dateService], async ([sId, d]) => {
    // If editing and values match initial, avoid re-pricing over manual override
    if (props.itemToEdit && 
        sId === props.itemToEdit.servicio_id?.toString() && 
        d === props.itemToEdit.fecha_servicio &&
        manualPrice.value === props.itemToEdit.precio_unitario_snapshot
    ) {
        return
    }

	if (!sId || !props.hojaId || !d) {
		foundPrice.value = null
		return
	}

	isPricing.value = true
	try {
		const priceRecord = await QuoteService.findServicePrice(
			Number(sId),
			props.hojaId,
			props.pax, // Using Global Pax
			d
		)
		if (priceRecord) {
			foundPrice.value = priceRecord.precio_por_persona
		} else {
			foundPrice.value = null
		}
	} catch (e) {
		console.error(e)
	} finally {
		isPricing.value = false
	}
})

// Reset custom description when the user changes the selected service
// We ignore the initial assignment where oldId is empty/undefined
watch(selectedServiceId, (newId, oldId) => {
    if (oldId && newId !== oldId) {
        customDescription.value = ''
    }
})

const finalPrice = computed(() => {
	if (manualPrice.value !== null && manualPrice.value !== 0)
		return manualPrice.value
	return foundPrice.value || 0
})

const subtotal = computed(() => {
	return finalPrice.value * props.pax // Using Global Pax for estimation
})

const onSave = async () => {
	if (!selectedServiceId.value && !customDescription.value) {
		toast.error(
			'Debe seleccionar un servicio o ingresar una descripción manual'
		)
		return
	}

	if (finalPrice.value <= 0) {
		const ok = await confirm({
			title: 'Precio en cero',
			description: 'El precio actual es 0. ¿Deseas continuar agregando este servicio?',
			confirmText: 'Continuar',
		})
		if (!ok) return
	}

	isLoading.value = true
	try {
        const payload = {
			servicio_id: selectedServiceId.value
				? Number(selectedServiceId.value)
				: null,
			cantidad: 1, 
			numero_pax: props.pax, // Save the pax used for calculation
			fecha_servicio: dateService.value,
			precio_unitario_snapshot: finalPrice.value,
			es_por_pax: true, // Reset to standard behavior (per pax)
            aplica_comision: appliesCommission.value, // Save to new column
			descripcion_snapshot:
				customDescription.value ||
				selectedService.value?.nombre ||
				'Servicio Personalizado',
		}

        if (props.itemToEdit) {
            await QuoteService.updateQuoteItem(props.itemToEdit.item_id, payload)
            toast.success('Item actualizado')
        } else {
		    await QuoteService.addQuoteItem({
                ...payload,
			    cotizacion_id: props.quoteId,
            })
		    toast.success('Item agregado')
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
				<DialogTitle>{{ itemToEdit ? 'Editar Servicio' : 'Agregar Servicio' }}</DialogTitle>
				<DialogDescription>
					{{ itemToEdit ? 'Modifica los detalles del servicio.' : 'Busca un servicio y añádelo a la cotización.' }}
				</DialogDescription>
			</DialogHeader>

			<div class="grid gap-4 py-4">
				<div class="grid gap-2">
					<div class="flex justify-between items-center">
						<Label>Servicio</Label>
						<Button
							v-if="selectedServiceId"
							variant="link"
							size="sm"
							class="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
							@click="selectedServiceId = ''"
						>
							Limpiar selección (Modo Manual)
						</Button>
					</div>
					<SearchableSelect
						v-model="selectedServiceId"
						:items="services"
						label-key="nombre"
						value-key="servicio_id"
						placeholder="Selecciona un servicio (o déjalo vacío para manual)"
						search-placeholder="Buscar servicio..."
						mode="async"
						:search-fn="searchServices"
                        @select="(item) => selectedServiceObject = item as Tables<'servicios'>"
					/>
				</div>

				<div class="grid grid-cols-1 gap-4">
					<div class="grid gap-2">
						<Label>Fecha del Servicio</Label>
						<Input type="date" v-model="dateService" />
					</div>
				</div>

				<div class="grid gap-2">
					<Label
						>Servicio especial
						{{
							!selectedServiceId ? '(Requerida para manual)' : '(Opcional)'
						}}</Label
					>
					<Input
						v-model="customDescription"
						:placeholder="
							selectedService?.nombre ||
							'Ej: Servicio especial fuera de catálogo...'
						"
					/>
				</div>

				<div class="bg-muted p-4 rounded-md space-y-2">
					<div class="flex justify-between items-center">
						<span class="text-sm font-medium">Precio Base (Hojas):</span>
						<span class="font-mono" v-if="isPricing">Calculando...</span>
						<span class="font-mono" v-else-if="foundPrice !== null"
							>{{ foundPrice }} / pax</span
						>
						<span class="font-mono text-warning" v-else-if="!hojaId"
							>Sin hoja de precios</span
						>
						<span class="font-mono text-muted-foreground" v-else
							>No encontrado</span
						>
					</div>

					<div class="grid gap-2">
						<Label>Precio Manual / Override (Unitario)</Label>
						<NumberField v-model="manualPrice" :min="0" :step="0.01">
							<NumberFieldContent>
								<NumberFieldDecrement />
								<NumberFieldInput />
								<NumberFieldIncrement />
							</NumberFieldContent>
						</NumberField>
					</div>

                    <div class="flex items-center space-x-2 pt-2">
                        <Checkbox id="commission" v-model:modelValue="appliesCommission" />
                        <Label for="commission" class="text-sm font-medium leading-none cursor-pointer">
                            Aplica Comisión de Agencia
                        </Label>
                    </div>

					<div class="flex justify-between items-center pt-2 border-t">
						<span class="font-bold">Subtotal Estimado:</span>
						<span class="text-lg font-bold">{{ subtotal }}</span>
					</div>
				</div>
			</div>

			<DialogFooter>
				<Button variant="outline" @click="emit('update:open', false)"
					>Cancelar</Button
				>
				<Button
					@click="onSave"
					:disabled="isLoading || (!selectedServiceId && !customDescription)"
				>
					{{ isLoading ? 'Guardando...' : (itemToEdit ? 'Guardar Cambios' : 'Agregar a Cotización') }}
				</Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
</template>
