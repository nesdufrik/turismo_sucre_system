<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { InventoryService } from '../InventoryService'
import { SettingsService } from '@/modules/settings/SettingsService'
import { hotelSchema } from '../schemas/inventory.schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { toast } from 'vue-sonner'
import type { Tables } from '@/types/database.types'

const props = defineProps<{
	hotelId: number | null
}>()

const emit = defineEmits<{
	(e: 'saved', newId?: number): void
	(e: 'cancel'): void
}>()

const locations = ref<Tables<'ubicaciones'>[]>([])
const isLoading = ref(false)

const form = useForm({
	validationSchema: toTypedSchema(hotelSchema),
	initialValues: {
		incluye_impuestos: false,
	},
})

const loadDependencies = async () => {
	try {
		locations.value = await SettingsService.getLocations()
	} catch (error) {
		console.error(error)
		toast.error('Error al cargar dependencias')
	}
}

const loadHotel = async (id: number) => {
	isLoading.value = true
	try {
		const hotel = await InventoryService.getHotelById(id)
		form.setValues({
			nombre: hotel.nombre || '',
			categoria: hotel.categoria || '',
			ubicacion_id: hotel.ubicacion_id || undefined,
			info_desayuno: hotel.info_desayuno || '',
			incluye_impuestos: hotel.incluye_impuestos ?? false,
		})
	} catch (error: any) {
		toast.error('Error al cargar hotel', { description: error.message })
	} finally {
		isLoading.value = false
	}
}

watch(
	() => props.hotelId,
	(newId) => {
		if (newId) {
			loadHotel(newId)
		} else {
			form.resetForm()
		}
	},
	{ immediate: true }
)

onMounted(() => {
	loadDependencies()
})

const onSubmit = form.handleSubmit(async (values) => {
	isLoading.value = true
	try {
		if (props.hotelId) {
			await InventoryService.updateHotel(props.hotelId, values)
			toast.success('Hotel actualizado')
			emit('saved')
		} else {
			const newHotel = await InventoryService.createHotel(values)
			toast.success('Hotel creado')
			emit('saved', newHotel.hotel_id)
		}
	} catch (error: any) {
		toast.error('Error al guardar', { description: error.message })
	} finally {
		isLoading.value = false
	}
})
</script>

<template>
	<form @submit="onSubmit" class="space-y-4 py-4">
		<FormField v-slot="{ componentField }" name="nombre">
			<FormItem>
				<FormLabel>Nombre del Hotel</FormLabel>
				<FormControl>
					<Input placeholder="Ej. Parador Santa Maria" v-bind="componentField" />
				</FormControl>
				<FormMessage />
			</FormItem>
		</FormField>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<FormField v-slot="{ componentField }" name="categoria">
				<FormItem>
					<FormLabel>Categoría (Estrellas/Tipo)</FormLabel>
					<FormControl>
						<Input placeholder="Ej. 5 Estrellas, Boutique" v-bind="componentField" />
					</FormControl>
					<FormMessage />
				</FormItem>
			</FormField>

			<FormField v-slot="{ componentField }" name="ubicacion_id">
				<FormItem>
					<FormLabel>Ubicación</FormLabel>
					<Select v-bind="componentField">
						<FormControl>
							<SelectTrigger>
								<SelectValue placeholder="Seleccione ..." />
							</SelectTrigger>
						</FormControl>
						<SelectContent>
							<SelectItem v-for="loc in locations" :key="loc.ubicacion_id" :value="loc.ubicacion_id">
								{{ loc.ciudad }}
							</SelectItem>
						</SelectContent>
					</Select>
					<FormMessage />
				</FormItem>
			</FormField>
		</div>

		<FormField v-slot="{ componentField }" name="info_desayuno">
			<FormItem>
				<FormLabel>Información de Desayuno</FormLabel>
				<FormControl>
					<Input placeholder="Ej. Buffet Americano incluido" v-bind="componentField" />
				</FormControl>
				<FormMessage />
			</FormItem>
		</FormField>

		<FormField v-slot="{ value, handleChange }" name="incluye_impuestos">
			<FormItem class="rounded-md border p-4 shadow-sm">
				<FormControl>
					<Label class="flex flex-row items-start gap-2">
						<Checkbox :modelValue="value" @update:modelValue="handleChange" />
						<div class="grid gap-2 font-normal">
							<p class="text-sm leading-none font-medium">
								Incluye Impuestos
							</p>
							<p class="text-muted-foreground text-sm">
								Marcar si las tarifas de este hotel ya incluyen impuestos de ley.
							</p>
						</div>
					</Label>
				</FormControl>
			</FormItem>
		</FormField>

		<div class="flex justify-end gap-2 pt-4">
			<Button type="button" variant="outline" @click="emit('cancel')">Cancelar</Button>
			<Button type="submit" :disabled="isLoading">
				{{ hotelId ? 'Actualizar' : 'Crear' }}
			</Button>
		</div>
	</form>
</template>
