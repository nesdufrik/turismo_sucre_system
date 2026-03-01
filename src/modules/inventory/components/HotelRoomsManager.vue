<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { InventoryService } from '../InventoryService'
import { SettingsService } from '@/modules/settings/SettingsService'
import type { Tables } from '@/types/database.types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { toast } from 'vue-sonner'
import { Pencil, Trash2, Plus, DollarSign } from 'lucide-vue-next'
import { useForm, Form } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { useConfirm } from '@/composables/useConfirm'

const props = defineProps<{
	hotelId: number
}>()

const { confirm } = useConfirm()

// --- Room Types Management ---
const rooms = ref<any[]>([])
const isLoading = ref(false)
const isRoomDialogOpen = ref(false)
const editingRoomId = ref<number | null>(null)

const roomFormSchema = toTypedSchema(
	z.object({
		tipo: z.string().min(1, 'El tipo es requerido'),
		capacidad_personas: z.coerce.number().min(1, 'Capacidad mínima 1'),
	}),
)

const initialRoomValues = ref({
	tipo: '',
	capacidad_personas: 2,
})

const loadRooms = async () => {
	isLoading.value = true
	try {
		rooms.value = await InventoryService.getRoomTypes(props.hotelId)
	} catch (error: any) {
		toast.error('Error al cargar habitaciones', { description: error.message })
	} finally {
		isLoading.value = false
	}
}

const openCreateRoomDialog = () => {
	editingRoomId.value = null
	initialRoomValues.value = {
		tipo: '',
		capacidad_personas: 2,
	}
	isRoomDialogOpen.value = true
}

const openEditRoomDialog = (room: any) => {
	editingRoomId.value = room.habitacion_id
	initialRoomValues.value = {
		tipo: room.tipo || '',
		capacidad_personas: room.capacidad_personas || 2,
	}
	isRoomDialogOpen.value = true
}

const onRoomSubmit = async (values: any) => {
	try {
		const payload = { ...values, hotel_id: props.hotelId }
		if (editingRoomId.value) {
			await InventoryService.updateRoomType(editingRoomId.value, payload)
			toast.success('Habitación actualizada')
		} else {
			await InventoryService.createRoomType(payload)
			toast.success('Habitación creada')
		}
		isRoomDialogOpen.value = false
		loadRooms()
	} catch (error: any) {
		toast.error('Error al guardar habitación', { description: error.message })
	}
}

const deleteRoom = async (id: number) => {
	const confirmed = await confirm({
		title: '¿Eliminar habitación?',
		description: 'Esto eliminará también sus precios asociados.',
		variant: 'destructive',
		confirmText: 'Eliminar',
	})

	if (!confirmed) return

	try {
		await InventoryService.deleteRoomType(id)
		toast.success('Habitación eliminada')
		loadRooms()
	} catch (error: any) {
		toast.error('Error al eliminar', { description: error.message })
	}
}

// --- Room Prices Management ---
const isPricesDialogOpen = ref(false)
const selectedRoomForPrices = ref<any | null>(null)
const prices = ref<any[]>([])
const priceSheets = ref<Tables<'hojasdeprecios'>[]>([])
const isPriceEditMode = ref(false)
const editingPriceId = ref<number | null>(null)

const priceFormSchema = toTypedSchema(
	z.object({
		hoja_id: z.coerce.number().min(1, 'La hoja es requerida'),
		precio_por_noche: z.coerce.number().min(0),
		temporada: z.string().optional(),
	}),
)

const priceForm = useForm({
	validationSchema: priceFormSchema,
})

const openPricesDialog = async (room: any) => {
	selectedRoomForPrices.value = room
	isPricesDialogOpen.value = true
	await loadPrices(room.habitacion_id)
}

const loadPrices = async (roomId: number) => {
	try {
		const [fetchedPrices, sheets] = await Promise.all([
			InventoryService.getRoomPrices(roomId),
			SettingsService.getPriceSheets(),
		])
		prices.value = fetchedPrices
		priceSheets.value = sheets

		// Auto-select default sheet if not editing
		if (!editingPriceId.value) {
			const defaultSheet = sheets.find((s) => s.es_default)
			if (defaultSheet) {
				priceForm.setFieldValue('hoja_id', defaultSheet.hoja_id)
			}
		}
	} catch (error: any) {
		toast.error('Error al cargar precios', { description: error.message })
	}
}

const onPriceSubmit = priceForm.handleSubmit(async (values) => {
	if (!selectedRoomForPrices.value) return
	try {
		const payload = {
			...values,
			habitacion_id: selectedRoomForPrices.value.habitacion_id,
		}
		if (editingPriceId.value) {
			await InventoryService.updateRoomPrice(editingPriceId.value, payload)
			toast.success('Precio actualizado')
		} else {
			await InventoryService.createRoomPrice(payload)
			toast.success('Precio agregado')
		}
		// Reset form but keep dialog open
		priceForm.resetForm()
		editingPriceId.value = null
		isPriceEditMode.value = false
		loadPrices(selectedRoomForPrices.value.habitacion_id)
	} catch (error: any) {
		toast.error('Error al guardar precio', { description: error.message })
	}
})

const editPrice = (price: any) => {
	editingPriceId.value = price.precio_hab_id
	priceForm.setValues({
		hoja_id: price.hoja_id,
		precio_por_noche: price.precio_por_noche,
		temporada: price.temporada || '',
	})
	isPriceEditMode.value = true
}

const deletePrice = async (id: number) => {
	const confirmed = await confirm({
		title: '¿Eliminar precio?',
		description: 'Esta acción no se puede deshacer.',
		variant: 'destructive',
		confirmText: 'Eliminar',
	})

	if (!confirmed) return

	try {
		await InventoryService.deleteRoomPrice(id)
		toast.success('Precio eliminado')
		if (selectedRoomForPrices.value) {
			loadPrices(selectedRoomForPrices.value.habitacion_id)
		}
	} catch (error: any) {
		toast.error('Error al eliminar', { description: error.message })
	}
}

onMounted(() => {
	loadRooms()
})
</script>

<template>
	<div class="space-y-4 py-4">
		<div class="flex justify-between items-center">
			<h4 class="text-sm font-medium">Tipos de Habitación</h4>
			<HasPermission name="inventory.manage">
				<Button size="sm" @click="openCreateRoomDialog">
					<Plus class="w-4 h-4 mr-2" />
					Agregar Habitación
				</Button>
			</HasPermission>
		</div>

		<div class="border rounded-md">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Tipo</TableHead>
						<TableHead>Capacidad</TableHead>
						<TableHead>Precio por Noche</TableHead>
						<TableHead class="text-right">Acciones</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					<TableRow v-if="isLoading">
						<TableCell colspan="4" class="text-center">Cargando...</TableCell>
					</TableRow>
					<TableRow v-else-if="rooms.length === 0">
						<TableCell colspan="4" class="text-center text-muted-foreground"
							>No hay habitaciones registradas.</TableCell
						>
					</TableRow>
					<TableRow v-for="room in rooms" :key="room.habitacion_id">
						<TableCell class="font-medium">{{ room.tipo }}</TableCell>
						<TableCell>{{ room.capacidad_personas }} pax</TableCell>
						<TableCell>
							<div class="font-medium">
								{{
									room.precios?.[0]?.precio_por_noche
										? `$${room.precios[0].precio_por_noche}`
										: '-'
								}}
							</div>
						</TableCell>
						<TableCell class="text-right">
							<div class="flex justify-end gap-2">
								<HasPermission name="prices.view_cost">
									<Button
										variant="ghost"
										size="icon"
										class="h-8 w-8 text-green-700 hover:text-green-600"
										title="Gestionar Precios"
										@click="openPricesDialog(room)"
									>
										<DollarSign class="w-3 h-3" />
									</Button>
								</HasPermission>
								<HasPermission name="inventory.manage">
									<Button
										variant="ghost"
										size="icon"
										class="h-8 w-8"
										@click="openEditRoomDialog(room)"
									>
										<Pencil class="w-3 h-3" />
									</Button>
								</HasPermission>
								<HasPermission name="inventory.manage">
									<Button
										variant="ghost"
										size="icon"
										class="h-8 w-8 text-destructive"
										@click="deleteRoom(room.habitacion_id)"
									>
										<Trash2 class="w-3 h-3" />
									</Button>
								</HasPermission>
							</div>
						</TableCell>
					</TableRow>
				</TableBody>
			</Table>
		</div>

		<!-- Room Edit Dialog -->
		<Dialog :open="isRoomDialogOpen" @update:open="isRoomDialogOpen = $event">
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{{
						editingRoomId ? 'Editar Habitación' : 'Nueva Habitación'
					}}</DialogTitle>
					<DialogDescription
						>Define el tipo de habitación y su capacidad.</DialogDescription
					>
				</DialogHeader>

				<Form
					id="room-form"
					:validation-schema="roomFormSchema"
					:initial-values="initialRoomValues"
					@submit="onRoomSubmit"
				>
					<div class="space-y-4">
						<FormField v-slot="{ componentField }" name="tipo">
							<FormItem>
								<FormLabel>Tipo (Ej. Simple, Doble, Suite)</FormLabel>
								<FormControl>
									<Input
										placeholder="Doble Matrimonial"
										v-bind="componentField"
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						</FormField>
						<div class="grid grid-cols-2 gap-4">
							<FormField v-slot="{ componentField }" name="capacidad_personas">
								<FormItem>
									<FormLabel>Capacidad (Personas)</FormLabel>
									<FormControl>
										<Input type="number" min="1" v-bind="componentField" />
									</FormControl>
									<FormMessage />
								</FormItem>
							</FormField>
						</div>
					</div>

					<DialogFooter class="mt-4">
						<Button type="submit">Guardar</Button>
					</DialogFooter>
				</Form>
			</DialogContent>
		</Dialog>

		<!-- Prices Management Dialog -->
		<Dialog
			:open="isPricesDialogOpen"
			@update:open="isPricesDialogOpen = $event"
		>
			<DialogContent class="sm:max-w-[700px]">
				<DialogHeader>
					<DialogTitle>Precios por Temporada</DialogTitle>
					<DialogDescription>
						Gestionando precios para:
						<span class="font-semibold">{{ selectedRoomForPrices?.tipo }}</span>
					</DialogDescription>
				</DialogHeader>

				<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
					<!-- Price Form -->
					<div class="md:col-span-1 border-r pr-4">
						<HasPermission name="inventory.manage">
							<h5 class="text-sm font-medium mb-4">
								{{ editingPriceId ? 'Editar Precio' : 'Nuevo Precio' }}
							</h5>
							<form @submit="onPriceSubmit" class="space-y-4">
								<FormField v-slot="{ componentField }" name="hoja_id">
									<FormItem>
										<FormLabel>Hoja de Precios</FormLabel>
										<Select v-bind="componentField">
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Seleccionar" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem
													v-for="sheet in priceSheets"
													:key="sheet.hoja_id"
													:value="sheet.hoja_id"
												>
													{{ sheet.nombre }}
												</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								</FormField>
								<FormField v-slot="{ componentField }" name="precio_por_noche">
									<FormItem>
										<FormLabel>Precio por Noche</FormLabel>
										<FormControl>
											<Input
												type="number"
												step="0.01"
												v-bind="componentField"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								</FormField>
								<FormField v-slot="{ componentField }" name="temporada">
									<FormItem>
										<FormLabel>Temporada</FormLabel>
										<FormControl>
											<Input placeholder="Ej. Alta" v-bind="componentField" />
										</FormControl>
										<FormMessage />
									</FormItem>
								</FormField>
								<Button type="submit" class="w-full">{{
									editingPriceId ? 'Actualizar' : 'Agregar'
								}}</Button>
								<Button
									v-if="editingPriceId"
									type="button"
									variant="ghost"
									class="w-full mt-2"
									@click="
										() => {
											editingPriceId = null
											priceForm.resetForm()
										}
									"
									>Cancelar Edición</Button
								>
							</form>
							<template #no-access>
								<div
									class="flex items-center justify-center h-full text-muted-foreground text-sm italic"
								>
									Sin permisos para editar precios
								</div>
							</template>
						</HasPermission>
					</div>

					<!-- Prices List -->
					<div class="md:col-span-2">
						<HasPermission name="prices.view_cost">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Hoja</TableHead>
										<TableHead>Temporada</TableHead>
										<TableHead>Precio</TableHead>
										<TableHead></TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									<TableRow v-for="p in prices" :key="p.precio_hab_id">
										<TableCell class="py-2">{{ p.hoja?.nombre }}</TableCell>
										<TableCell class="py-2">{{ p.temporada || '-' }}</TableCell>
										<TableCell class="py-2 font-bold">{{
											p.precio_por_noche
										}}</TableCell>
										<TableCell class="py-2 text-right">
											<div class="flex justify-end gap-1">
												<HasPermission name="inventory.manage">
													<Button
														variant="ghost"
														size="icon"
														class="h-6 w-6"
														@click="editPrice(p)"
													>
														<Pencil class="w-3 h-3" />
													</Button>
												</HasPermission>
												<HasPermission name="inventory.manage">
													<Button
														variant="ghost"
														size="icon"
														class="h-6 w-6 text-destructive"
														@click="deletePrice(p.precio_hab_id)"
													>
														<Trash2 class="w-3 h-3" />
													</Button>
												</HasPermission>
											</div>
										</TableCell>
									</TableRow>
									<TableRow v-if="prices.length === 0">
										<TableCell
											colspan="4"
											class="text-center text-muted-foreground py-4"
											>Sin precios configurados</TableCell
										>
									</TableRow>
								</TableBody>
							</Table>
							<template #no-access>
								<div
									class="flex items-center justify-center h-full text-muted-foreground text-sm italic"
								>
									Sin permisos para ver precios
								</div>
							</template>
						</HasPermission>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	</div>
</template>
