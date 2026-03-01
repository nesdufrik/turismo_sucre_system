<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { InventoryService } from '@/modules/inventory/InventoryService'
import { QuoteService, type QuoteItemWithDetails } from '../../QuoteService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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


const hotels = ref<Tables<'hoteles'>[]>([])
const roomTypes = ref<Tables<'tiposhabitacion'>[]>([])
const isLoading = ref(false)
const isPricing = ref(false)
const selectedHotelObject = ref<Tables<'hoteles'> | null>(null)

// Form State
const selectedHotelId = ref<string>('')
const selectedRoomId = ref<string>('')
const quantityRooms = ref(1)
const appliesCommission = ref(false)
// Removed local totalPax
const dateCheckIn = ref('')
const dateCheckOut = ref('')
const manualPrice = ref<number | null>(null)
const foundPrice = ref<number | null>(null)
const customDescription = ref('')
// Removed esPorPax

const loadHotels = async () => {
	isLoading.value = true
	try {
		const data = await InventoryService.getHotels()
		hotels.value = data || []
	} catch (error) {
		toast.error('Error al cargar hoteles')
		console.error(error)
	} finally {
		isLoading.value = false
	}
}

const searchHotels = async (query: string) => {
	return await InventoryService.searchHotels(query)
}

const loadRooms = async (hotelId: number) => {
	try {
		const data = await InventoryService.getRoomTypes(hotelId)
		roomTypes.value = data || []
	} catch (error) {
		toast.error('Error al cargar habitaciones')
	}
}

onMounted(() => {
	loadHotels()

    if (props.itemToEdit) {
        // --- EDIT MODE ---
        if (props.itemToEdit.tiposhabitacion?.hoteles && props.itemToEdit.tiposhabitacion.hotel_id) {
                const mockHotel = { 
                hotel_id: props.itemToEdit.tiposhabitacion.hotel_id,
                nombre: props.itemToEdit.tiposhabitacion.hoteles.nombre 
            } as any
            
            selectedHotelObject.value = mockHotel
            selectedHotelId.value = mockHotel.hotel_id.toString()
            
            if (!hotels.value.find(h => h.hotel_id === mockHotel.hotel_id)) {
                hotels.value = [mockHotel, ...hotels.value]
            }
        }
        
        // Set Room ID
        selectedRoomId.value = props.itemToEdit.habitacion_id?.toString() || ''
        dateCheckIn.value = props.itemToEdit.fecha_servicio_inicio || ''
        dateCheckOut.value = props.itemToEdit.fecha_servicio_fin || ''
        manualPrice.value = props.itemToEdit.habitacion_id ? 0 : props.itemToEdit.precio_unitario_snapshot
        customDescription.value = props.itemToEdit.descripcion_snapshot || ''
		appliesCommission.value = props.itemToEdit.aplica_comision || false
    } else {
        // --- CREATE MODE ---
        selectedHotelId.value = ''
        selectedHotelObject.value = null
        selectedRoomId.value = ''
        roomTypes.value = []
        quantityRooms.value = 1
        dateCheckIn.value = new Date().toISOString().split('T')[0] || ''
        dateCheckOut.value = ''
        manualPrice.value = null
        foundPrice.value = null
        customDescription.value = ''
		appliesCommission.value = false
    }
})

watch(selectedHotelId, (newId) => {	// Only clear room if we are NOT in initial edit load (which we can't easily detect here without a flag)
    // Or just clear it. If user changes hotel, room must be cleared.
    // Issue: If we set selectedHotelId programmatically during edit load, this clears room.
    // Solution: We are not setting selectedHotelId in edit mode above because it was hard.
    
	if (newId) {
        selectedRoomId.value = '' // This clears it if user changes hotel. Good.
		loadRooms(Number(newId))
	} else {
		roomTypes.value = []
	}
})

const nights = computed(() => {
	if (!dateCheckIn.value || !dateCheckOut.value) return 1
	const start = new Date(dateCheckIn.value)
	const end = new Date(dateCheckOut.value)
	const diff = end.getTime() - start.getTime()
	const days = Math.ceil(diff / (1000 * 3600 * 24))
	return days > 0 ? days : 1
})

const selectedHotel = computed(() =>
    selectedHotelObject.value ||
	hotels.value.find((h) => h.hotel_id.toString() === selectedHotelId.value)
)
const selectedRoom = computed(() =>
	roomTypes.value.find(
		(r) => r.habitacion_id.toString() === selectedRoomId.value
	)
)

// Price Lookup
watch([selectedRoomId], async ([rId]) => {
    // Avoid overwrite on edit load
    if (props.itemToEdit && rId === props.itemToEdit.habitacion_id?.toString() && manualPrice.value === props.itemToEdit.precio_unitario_snapshot) {
        return
    }

	if (!rId || !props.hojaId) {
		foundPrice.value = null
		return
	}

	isPricing.value = true
	try {
		// Hotel prices are usually simpler: Room ID + Sheet
		const priceRecord = await QuoteService.findRoomPrice(
			Number(rId),
			props.hojaId
		)
		if (priceRecord) {
			foundPrice.value = priceRecord.precio_por_noche
		} else {
			foundPrice.value = null
		}
	} catch (e) {
		console.error(e)
		foundPrice.value = null
	} finally {
		isPricing.value = false
	}
})

const finalPrice = computed(() => {
	if (manualPrice.value !== null && manualPrice.value !== 0)
		return manualPrice.value
	return foundPrice.value || 0
})

// Unit price per person to be saved
const unitPricePerPax = computed(() => {
	if (props.pax <= 0) return 0
	// Formula: (Room Price * Quantity of Rooms) / Global Pax
	return (finalPrice.value * quantityRooms.value) / props.pax
})

const subtotal = computed(() => {
	// Logic check: (UnitPerPax * Pax * Nights)
	return unitPricePerPax.value * props.pax * nights.value
})

const onSave = async () => {
    // If editing, selectedRoomId might be populated from props but select dropdown is empty because we didn't load hotel.
    // That's fine as long as we have the ID.
	if (!selectedRoomId.value) return

	isLoading.value = true
	try {
        const payload = {
			habitacion_id: Number(selectedRoomId.value),
			cantidad: nights.value, // In hotels, quantity is NIGHTS
			numero_pax: props.pax,
			fecha_servicio_inicio: dateCheckIn.value,
			fecha_servicio_fin: dateCheckOut.value,
			fecha_servicio: dateCheckIn.value,
			precio_unitario_snapshot: unitPricePerPax.value,
			es_por_pax: true,
			descripcion_snapshot:
				customDescription.value ||
				(selectedHotel.value && selectedRoom.value ? `${selectedHotel.value?.nombre} - ${selectedRoom.value?.tipo} (${quantityRooms.value} hab.)` : undefined),
			aplica_comision: appliesCommission.value,
		}

        if (props.itemToEdit) {
            // Update
             await QuoteService.updateQuoteItem(props.itemToEdit.item_id, payload)
             toast.success('Hotel actualizado')
        } else {
            // Create
            await QuoteService.addQuoteItem({
                ...payload,
			    cotizacion_id: props.quoteId,
            })
		    toast.success('Hotel agregado')
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
				<DialogTitle>{{ itemToEdit ? 'Editar Hotel' : 'Agregar Hotel' }}</DialogTitle>
				<DialogDescription>
					{{ itemToEdit ? 'Modifica la reserva de hotel.' : 'Selecciona hotel y tipo de habitación.' }}
				</DialogDescription>
			</DialogHeader>

			<div class="grid gap-4 py-4">
				<div class="grid gap-2">
					<Label>Hotel</Label>
					<SearchableSelect
						v-model="selectedHotelId"
						:items="hotels"
						label-key="nombre"
						value-key="hotel_id"
						placeholder="Selecciona un hotel"
						search-placeholder="Buscar hotel..."
						mode="async"
						:search-fn="searchHotels"
                        @select="(item) => selectedHotelObject = item as Tables<'hoteles'>"
					/>
				</div>

				<div class="grid gap-2" v-if="selectedHotelId">
					<Label>Tipo de Habitación</Label>
					<Select v-model="selectedRoomId">
						<SelectTrigger>
							<SelectValue placeholder="Selecciona habitación" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem
								v-for="r in roomTypes"
								:key="r.habitacion_id"
								:value="r.habitacion_id.toString()"
							>
								{{ r.tipo }}
							</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div class="grid gap-2">
						<Label>Check In</Label>
						<Input type="date" v-model="dateCheckIn" />
					</div>
					<div class="grid gap-2">
						<Label>Check Out</Label>
						<Input type="date" v-model="dateCheckOut" />
					</div>
				</div>

				<div class="grid grid-cols-1 gap-4">
					<div class="grid gap-2">
						<Label>Cant. Habitaciones (Solo informativo)</Label>
						<NumberField v-model="quantityRooms" :min="1">
							<NumberFieldContent>
								<NumberFieldDecrement />
								<NumberFieldInput />
								<NumberFieldIncrement />
							</NumberFieldContent>
						</NumberField>
					</div>
				</div>

				<div class="grid gap-2">
					<Label>Descripción (Opcional)</Label>
					<Input v-model="customDescription" placeholder="Detalles..." />
				</div>

				<div class="bg-muted p-4 rounded-md space-y-2">
					<div class="flex justify-between items-center text-sm">
						<span class="font-medium text-muted-foreground"
							>Precio por Habitación (Noche):</span
						>
						<span class="font-mono" v-if="isPricing">Buscando...</span>
						<span class="font-mono" v-else-if="foundPrice !== null"
							>{{ foundPrice }} USD</span
						>
						<span class="font-mono text-warning" v-else-if="!hojaId"
							>Sin hoja de precios</span
						>
						<span class="font-mono text-muted-foreground" v-else
							>No encontrado</span
						>
					</div>

					<div class="grid gap-2">
						<Label class="text-xs"
							>Precio Manual / Override (Habitación/Noche)</Label
						>
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

					<Separator class="my-2" />

					<div class="flex justify-between items-center">
						<span class="text-sm font-bold text-primary"
							>Prorrateo por Pax ({{ pax }} pax):</span
						>
						<span class="text-sm font-bold text-primary"
							>{{ unitPricePerPax.toFixed(2) }} USD / pax</span
						>
					</div>

					<div class="text-[10px] text-muted-foreground text-right italic">
						Cálculo: ({{ finalPrice }} USD x {{ quantityRooms }} hab.) /
						{{ pax }} pax = {{ unitPricePerPax.toFixed(2) }} USD
					</div>

					<div class="flex justify-between items-center pt-2 border-t">
						<span class="font-bold">Total ({{ nights }} noches):</span>
						<span class="text-lg font-bold">{{ subtotal.toFixed(2) }} USD</span>
					</div>
				</div>
			</div>

			<DialogFooter>
				<Button variant="outline" @click="emit('update:open', false)"
					>Cancelar</Button
				>
				<Button @click="onSave" :disabled="isLoading || !selectedRoomId">
					{{ isLoading ? 'Guardando...' : (itemToEdit ? 'Guardar Cambios' : 'Agregar a Cotización') }}
				</Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
</template>
