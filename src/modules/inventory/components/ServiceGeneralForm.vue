<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { InventoryService } from '../InventoryService'
import { SettingsService } from '@/modules/settings/SettingsService'
import { serviceSchema } from '../schemas/inventory.schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
	serviceId: number | null
}>()

const emit = defineEmits<{
	(e: 'saved', newId?: number, name?: string): void
	(e: 'cancel'): void
}>()

const categories = ref<Tables<'categoriasservicio'>[]>([])
const locations = ref<Tables<'ubicaciones'>[]>([])
const isLoading = ref(false)

const form = useForm({
	validationSchema: toTypedSchema(serviceSchema),
})

const loadDependencies = async () => {
	try {
		const [cats, locs] = await Promise.all([
			SettingsService.getServiceCategories(),
			SettingsService.getLocations(),
		])
		categories.value = cats
		locations.value = locs
	} catch (error) {
		console.error(error)
		toast.error('Error al cargar dependencias')
	}
}

const loadService = async (id: number) => {
	isLoading.value = true
	try {
		const service = await InventoryService.getServiceById(id)
		form.setValues({
			nombre: service.nombre || '',
			codigo: service.codigo || '',
			descripcion: service.descripcion || '',
			duracion_texto: service.duracion_texto || '',
			categoria_id: service.categoria_id || undefined,
			ubicacion_id: service.ubicacion_id || undefined,
		})
	} catch (error: any) {
		toast.error('Error al cargar servicio', { description: error.message })
	} finally {
		isLoading.value = false
	}
}

watch(
	() => props.serviceId,
	(newId) => {
		if (newId) {
			loadService(newId)
		} else {
			form.resetForm()
		}
	},
	{ immediate: true },
)

onMounted(() => {
	loadDependencies()
})

const onSubmit = form.handleSubmit(async (values) => {
	isLoading.value = true
	try {
		if (props.serviceId) {
			await InventoryService.updateService(props.serviceId, values)
			toast.success('Servicio actualizado')
			emit('saved')
		} else {
			const newService = await InventoryService.createService(values)
			toast.success('Servicio creado')
			emit('saved', newService.servicio_id, newService.nombre || '')
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
				<FormLabel>Nombre del Servicio</FormLabel>
				<FormControl>
					<Input placeholder="Ej. City Tour Full Day" v-bind="componentField" />
				</FormControl>
				<FormMessage />
			</FormItem>
		</FormField>

		<div class="grid grid-cols-2 gap-4">
			<FormField v-slot="{ componentField }" name="codigo">
				<FormItem>
					<FormLabel>Código (Opcional)</FormLabel>
					<FormControl>
						<Input placeholder="SRV-001" v-bind="componentField" />
					</FormControl>
					<FormMessage />
				</FormItem>
			</FormField>

			<FormField v-slot="{ componentField }" name="duracion_texto">
				<FormItem>
					<FormLabel>Duración</FormLabel>
					<FormControl>
						<Input placeholder="Ej. 4 horas" v-bind="componentField" />
					</FormControl>
					<FormMessage />
				</FormItem>
			</FormField>
		</div>

		<div class="grid grid-cols-2 gap-4">
			<FormField v-slot="{ componentField }" name="categoria_id">
				<FormItem>
					<FormLabel>Categoría</FormLabel>
					<FormControl>
						<Select v-bind="componentField">
							<SelectTrigger class="w-full">
								<SelectValue placeholder="Seleccione..." />
							</SelectTrigger>
							<SelectContent>
								<SelectItem
									v-for="cat in categories"
									:key="cat.categoria_id"
									:value="cat.categoria_id"
								>
									{{ cat.nombre }}
								</SelectItem>
							</SelectContent>
						</Select>
					</FormControl>
					<FormMessage />
				</FormItem>
			</FormField>

			<FormField v-slot="{ componentField }" name="ubicacion_id">
				<FormItem>
					<FormLabel>Ubicación</FormLabel>
					<Select v-bind="componentField">
						<FormControl>
							<SelectTrigger class="w-full">
								<SelectValue placeholder="Seleccione..." />
							</SelectTrigger>
						</FormControl>
						<SelectContent>
							<SelectItem
								v-for="loc in locations"
								:key="loc.ubicacion_id"
								:value="loc.ubicacion_id"
							>
								{{ loc.ciudad }}
							</SelectItem>
						</SelectContent>
					</Select>
					<FormMessage />
				</FormItem>
			</FormField>
		</div>

		<FormField v-slot="{ componentField }" name="descripcion">
			<FormItem>
				<FormLabel>Descripción</FormLabel>
				<FormControl>
					<Textarea
						placeholder="Detalles del servicio..."
						class="resize-none"
						v-bind="componentField"
					/>
				</FormControl>
				<FormMessage />
			</FormItem>
		</FormField>

		<div class="flex justify-end gap-2 pt-4">
			<Button type="button" variant="outline" @click="emit('cancel')"
				>Cancelar</Button
			>
			<Button type="submit" :disabled="isLoading">
				{{ serviceId ? 'Actualizar' : 'Crear' }}
			</Button>
		</div>
	</form>
</template>
