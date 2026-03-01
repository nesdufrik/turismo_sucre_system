<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import {
	InventoryService,
	type ServiceWithCategoryAndLocation,
	type PaginationResponse,
} from '../InventoryService'
import ServiceSheet from './ServiceSheet.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationFirst,
	PaginationItem,
	PaginationLast,
	PaginationNext,
	PaginationPrevious,
} from '@/components/ui/pagination'
import { toast } from 'vue-sonner'
import { Pencil, Trash2, Plus, Search } from 'lucide-vue-next'
import { useConfirm } from '@/composables/useConfirm'

const services = ref<ServiceWithCategoryAndLocation[]>([])
const isLoading = ref(false)
const searchQuery = ref('')
const isSheetOpen = ref(false)
const selectedServiceId = ref<number | null>(null)
const selectedServiceName = ref<string>('')

// Paginación
const currentPage = ref(1)
const pageSize = ref(15)
const totalItems = ref(0)

const { confirm } = useConfirm()

const fetchServices = async () => {
	isLoading.value = true
	try {
		const response = (await InventoryService.getServices({
			page: currentPage.value,
			pageSize: pageSize.value,
			search: searchQuery.value,
		})) as PaginationResponse<ServiceWithCategoryAndLocation>
		services.value = response.data
		totalItems.value = response.count || 0
	} catch (error: any) {
		toast.error('Error al cargar servicios', { description: error.message })
	} finally {
		isLoading.value = false
	}
}

// Watchers
watch([currentPage, pageSize], () => {
	fetchServices()
})

let searchTimeout: any = null
watch(searchQuery, () => {
	currentPage.value = 1
	if (searchTimeout) clearTimeout(searchTimeout)
	searchTimeout = setTimeout(() => {
		fetchServices()
	}, 500)
})

const openCreateSheet = () => {
	selectedServiceId.value = null
	selectedServiceName.value = ''
	isSheetOpen.value = true
}

const openEditSheet = (id: number, name: string) => {
	selectedServiceId.value = id
	selectedServiceName.value = name
	isSheetOpen.value = true
}

const deleteService = async (id: number) => {
	const confirmed = await confirm({
		title: '¿Eliminar servicio?',
		description:
			'Esta acción no se puede deshacer. Se eliminarán los precios asociados.',
		variant: 'destructive',
		confirmText: 'Eliminar',
	})

	if (!confirmed) return

	try {
		await InventoryService.deleteService(id)
		toast.success('Servicio eliminado')
		fetchServices()
	} catch (error: any) {
		toast.error('Error al eliminar', { description: error.message })
	}
}

const onSheetClose = (shouldRefresh: boolean) => {
	isSheetOpen.value = false
	if (shouldRefresh) {
		fetchServices()
	}
}

onMounted(() => {
	fetchServices()
})
</script>

<template>
	<div class="space-y-4">
		<div class="flex items-center justify-between">
			<div class="relative max-w-sm w-full">
				<Search class="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
				<Input
					placeholder="Buscar servicios por nombre..."
					v-model="searchQuery"
					class="pl-8"
				/>
			</div>
			<HasPermission name="inventory.manage">
				<Button @click="openCreateSheet">
					<Plus />
					Nuevo Servicio
				</Button>
			</HasPermission>
		</div>

		<div class="border rounded-md">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Nombre</TableHead>
						<TableHead>Categoría</TableHead>
						<TableHead>Ubicación</TableHead>
						<TableHead>Código</TableHead>
						<TableHead class="text-right">Acciones</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					<TableRow v-if="isLoading">
						<TableCell colspan="5" class="text-center py-4"
							>Cargando...</TableCell
						>
					</TableRow>
					<TableRow v-else-if="services.length === 0">
						<TableCell
							colspan="5"
							class="text-center py-4 text-muted-foreground"
						>
							No hay servicios registrados.
						</TableCell>
					</TableRow>
					<TableRow v-for="service in services" :key="service.servicio_id">
						<TableCell class="font-medium">
							<div>{{ service.nombre }}</div>
							<div class="text-xs text-muted-foreground truncate max-w-[200px]">
								{{ service.descripcion }}
							</div>
						</TableCell>
						<TableCell>
							<Badge
								v-if="service.categoria"
								:style="{
									backgroundColor: service.categoria.color,
									color: '#fff',
								}"
							>
								{{ service.categoria.nombre }}
							</Badge>
							<span v-else>-</span>
						</TableCell>
						<TableCell>{{ service.ubicacion?.ciudad || '-' }}</TableCell>
						<TableCell>{{ service.codigo || '-' }}</TableCell>
						<TableCell class="text-right">
							<div class="flex justify-end gap-2">
								<HasPermission name="inventory.manage">
									<Button
										variant="ghost"
										size="icon"
										@click="
											openEditSheet(service.servicio_id, service.nombre || '')
										"
									>
										<Pencil class="w-4 h-4" />
									</Button>
								</HasPermission>
								<HasPermission name="inventory.manage">
									<Button
										variant="ghost"
										size="icon"
										class="text-destructive"
										@click="deleteService(service.servicio_id)"
									>
										<Trash2 class="w-4 h-4" />
									</Button>
								</HasPermission>
							</div>
						</TableCell>
					</TableRow>
				</TableBody>
			</Table>
		</div>

		<!-- Paginación UI -->
		<div
			class="flex flex-col md:flex-row items-center justify-between px-2 py-4 gap-4"
		>
			<div class="text-xs text-muted-foreground">
				Mostrando {{ services.length }} de {{ totalItems }} servicios
			</div>
			<Pagination
				v-slot="{ page }"
				v-model:page="currentPage"
				:total="totalItems"
				:items-per-page="pageSize"
				:sibling-count="1"
				show-edges
			>
				<PaginationContent v-slot="{ items }">
					<PaginationFirst />
					<PaginationPrevious />

					<template v-for="(item, index) in items">
						<PaginationItem
							v-if="item.type === 'page'"
							:key="index"
							:value="item.value"
							:is-active="item.value === page"
						>
							{{ item.value }}
						</PaginationItem>
						<PaginationEllipsis v-else :key="item.type" :index="index" />
					</template>

					<PaginationNext />
					<PaginationLast />
				</PaginationContent>
			</Pagination>
		</div>

		<ServiceSheet
			:open="isSheetOpen"
			:service-id="selectedServiceId"
			:service-name="selectedServiceName"
			@update:open="isSheetOpen = $event"
			@saved="onSheetClose(true)"
			@refresh="fetchServices"
		/>
	</div>
</template>
