<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import {
	InventoryService,
	type HotelWithLocation,
	type PaginationResponse,
} from '../InventoryService'
import HotelSheet from './HotelSheet.vue'
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

const hotels = ref<HotelWithLocation[]>([])
const isLoading = ref(false)
const searchQuery = ref('')
const isSheetOpen = ref(false)
const selectedHotelId = ref<number | null>(null)
const selectedHotelName = ref<string>('')

// Paginación
const currentPage = ref(1)
const pageSize = ref(15)
const totalItems = ref(0)

const { confirm } = useConfirm()

const fetchHotels = async () => {
	isLoading.value = true
	try {
		const response = (await InventoryService.getHotels({
			page: currentPage.value,
			pageSize: pageSize.value,
			search: searchQuery.value,
		})) as PaginationResponse<HotelWithLocation>
		hotels.value = response.data
		totalItems.value = response.count || 0
	} catch (error: any) {
		toast.error('Error al cargar hoteles', { description: error.message })
	} finally {
		isLoading.value = false
	}
}

// Watchers
watch([currentPage, pageSize], () => {
	fetchHotels()
})

let searchTimeout: any = null
watch(searchQuery, () => {
	currentPage.value = 1
	if (searchTimeout) clearTimeout(searchTimeout)
	searchTimeout = setTimeout(() => {
		fetchHotels()
	}, 500)
})

const openCreateSheet = () => {
	selectedHotelId.value = null
	selectedHotelName.value = ''
	isSheetOpen.value = true
}

const openEditSheet = (id: number, name: string) => {
	selectedHotelId.value = id
	selectedHotelName.value = name
	isSheetOpen.value = true
}

const deleteHotel = async (id: number) => {
	const confirmed = await confirm({
		title: '¿Eliminar hotel?',
		description:
			'Esta acción no se puede deshacer. Se eliminarán los precios y habitaciones asociadas.',
		variant: 'destructive',
		confirmText: 'Eliminar',
	})

	if (!confirmed) return

	try {
		await InventoryService.deleteHotel(id)
		toast.success('Hotel eliminado')
		fetchHotels()
	} catch (error: any) {
		toast.error('Error al eliminar', { description: error.message })
	} finally {
		// No need to set isDeleting to false here as useConfirm handles its own loading state
	}
}

const onSheetClose = (shouldRefresh: boolean) => {
	isSheetOpen.value = false
	if (shouldRefresh) {
		fetchHotels()
	}
}

onMounted(() => {
	fetchHotels()
})
</script>

<template>
	<div class="space-y-4">
		<div class="flex items-center justify-between">
			<div class="relative max-w-sm w-full">
				<Search class="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
				<Input
					placeholder="Buscar hoteles..."
					v-model="searchQuery"
					class="pl-8"
				/>
			</div>
			<HasPermission name="inventory.manage">
				<Button @click="openCreateSheet">
					<Plus class="w-4 h-4 mr-2" />
					Nuevo Hotel
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
						<TableHead>Desayuno</TableHead>
						<TableHead class="text-right">Acciones</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					<TableRow v-if="isLoading">
						<TableCell colspan="5" class="text-center py-4"
							>Cargando...</TableCell
						>
					</TableRow>
					<TableRow v-else-if="hotels.length === 0">
						<TableCell
							colspan="5"
							class="text-center py-4 text-muted-foreground"
						>
							No hay hoteles registrados.
						</TableCell>
					</TableRow>
					<TableRow v-for="hotel in hotels" :key="hotel.hotel_id">
						<TableCell class="font-medium">{{ hotel.nombre }}</TableCell>
						<TableCell>
							<Badge variant="outline" v-if="hotel.categoria">{{
								hotel.categoria
							}}</Badge>
							<span v-else>-</span>
						</TableCell>
						<TableCell>{{ hotel.ubicacion?.ciudad || '-' }}</TableCell>
						<TableCell>{{ hotel.info_desayuno || '-' }}</TableCell>
						<TableCell class="text-right">
							<div class="flex justify-end gap-2">
								<HasPermission name="inventory.manage">
									<Button
										variant="ghost"
										size="icon"
										@click="openEditSheet(hotel.hotel_id, hotel.nombre || '')"
									>
										<Pencil class="w-4 h-4" />
									</Button>
								</HasPermission>
								<HasPermission name="inventory.manage">
									<Button
										variant="ghost"
										size="icon"
										class="text-destructive"
										@click="deleteHotel(hotel.hotel_id)"
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
				Mostrando {{ hotels.length }} de {{ totalItems }} hoteles
			</div>
			<Pagination
				v-slot="{ page }"
				v-model:page="currentPage"
				:total="totalItems"
				:items-per-page="pageSize"
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

		<HotelSheet
			:open="isSheetOpen"
			:hotel-id="selectedHotelId"
			:hotel-name="selectedHotelName"
			@update:open="isSheetOpen = $event"
			@saved="onSheetClose(true)"
			@refresh="fetchHotels"
		/>
	</div>
</template>
