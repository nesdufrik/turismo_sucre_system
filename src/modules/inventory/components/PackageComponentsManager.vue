<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { InventoryService } from '@/modules/inventory/InventoryService'
import { Button } from '@/components/ui/button'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Trash2, Plus } from 'lucide-vue-next'
import SearchableSelect from '@/components/common/SearchableSelect.vue'
import { toast } from 'vue-sonner'
import type { Tables } from '@/types/database.types'

const props = defineProps<{
	packageId: number
}>()

const components = ref<any[]>([])
const loading = ref(false)

// Add Form
const selectedServiceId = ref<string>('')
const quantity = ref(1)
const services = ref<Tables<'servicios'>[]>([])

const fetchComponents = async () => {
	loading.value = true
	try {
		const pkg = await InventoryService.getPackageById(props.packageId)
		components.value = pkg.componentes || []
	} catch (error) {
		toast.error('Error al cargar componentes')
	} finally {
		loading.value = false
	}
}

const loadServices = async () => {
	try {
		services.value = await InventoryService.getServices()
	} catch (e) {
		console.error(e)
	}
}

const searchServices = async (q: string) => {
	return await InventoryService.searchServices(q)
}

const addComponent = async () => {
	if (!selectedServiceId.value) return

	try {
		await InventoryService.addPackageComponent({
			paquete_id: props.packageId,
			servicio_id: Number(selectedServiceId.value),
			cantidad: quantity.value,
		})
		toast.success('Servicio agregado')
		selectedServiceId.value = ''
		quantity.value = 1
		fetchComponents()
	} catch (error: any) {
		toast.error('Error al agregar', { description: error.message })
	}
}

const removeComponent = async (servicioId: number) => {
	try {
		await InventoryService.removePackageComponent(props.packageId, servicioId)
		fetchComponents()
	} catch (error) {
		toast.error('Error al eliminar')
	}
}

onMounted(() => {
	fetchComponents()
	loadServices()
})
</script>

<template>
	<div class="space-y-4">
		<HasPermission name="inventory.manage">
			<div class="flex items-end gap-2 border p-4 rounded-md bg-muted/20">
				<div class="grid gap-2 flex-1">
					<Label>Agregar Servicio al Paquete</Label>
					<SearchableSelect
						v-model="selectedServiceId"
						:items="services"
						label-key="nombre"
						value-key="servicio_id"
						placeholder="Buscar servicio..."
						mode="async"
						:search-fn="searchServices"
					/>
				</div>
				<div class="grid gap-2 w-24">
					<Label>Cantidad</Label>
					<Input type="number" v-model="quantity" min="1" />
				</div>
				<Button @click="addComponent" :disabled="!selectedServiceId">
					<Plus class="w-4 h-4" />
				</Button>
			</div>
		</HasPermission>

		<div class="border rounded-md">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Servicio</TableHead>
						<TableHead class="text-center">Cant.</TableHead>
						<TableHead class="text-right"></TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					<TableRow v-if="components.length === 0">
						<TableCell colspan="3" class="text-center text-muted-foreground">
							Sin servicios configurados.
						</TableCell>
					</TableRow>
					<TableRow v-for="comp in components" :key="comp.servicio_id">
						<TableCell>{{ comp.servicio?.nombre }}</TableCell>
						<TableCell class="text-center">{{ comp.cantidad }}</TableCell>
						<TableCell class="text-right">
							<HasPermission name="inventory.manage">
								<Button
									variant="ghost"
									size="icon"
									class="text-destructive"
									@click="removeComponent(comp.servicio_id)"
								>
									<Trash2 class="w-4 h-4" />
								</Button>
							</HasPermission>
						</TableCell>
					</TableRow>
				</TableBody>
			</Table>
		</div>
	</div>
</template>
