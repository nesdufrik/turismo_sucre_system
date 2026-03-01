<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { ClientService, type PaginatedResponse } from '../ClientService'
import ClientSheet from './ClientSheet.vue'
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
import {
	Pencil,
	Trash2,
	Plus,
	Search,
	Building2,
	User,
	Loader2,
} from 'lucide-vue-next'
import type { Tables } from '@/types/database.types'
import { useConfirm } from '@/composables/useConfirm'

type ClientRow = Tables<'clientes'>

const clients = ref<ClientRow[]>([])
const isLoading = ref(false)
const searchQuery = ref('')
const isSheetOpen = ref(false)
const selectedClientId = ref<number | null>(null)

// Paginación
const currentPage = ref(1)
const pageSize = ref(15)
const totalItems = ref(0)

const { confirm } = useConfirm()

const fetchClients = async () => {
	isLoading.value = true
	try {
		const response = (await ClientService.getClients({
			page: currentPage.value,
			pageSize: pageSize.value,
			search: searchQuery.value,
		})) as PaginatedResponse<ClientRow>

		clients.value = response.data
		totalItems.value = response.count || 0
	} catch (error: any) {
		toast.error('Error al cargar clientes', { description: error.message })
	} finally {
		isLoading.value = false
	}
}

// Observadores para recarga automática
watch([currentPage, pageSize], () => {
	fetchClients()
})

let searchTimeout: any = null
watch(searchQuery, () => {
	currentPage.value = 1 // Reset a pág 1 en búsqueda
	if (searchTimeout) clearTimeout(searchTimeout)
	searchTimeout = setTimeout(() => {
		fetchClients()
	}, 500) // Debounce de 500ms
})

const openCreateSheet = () => {
	selectedClientId.value = null
	isSheetOpen.value = true
}

const openEditSheet = (id: number) => {
	selectedClientId.value = id
	isSheetOpen.value = true
}

const deleteClient = async (id: number) => {
	const confirmed = await confirm({
		title: '¿Eliminar cliente?',
		description:
			'Esta acción eliminará al cliente y podría afectar cotizaciones históricas.',
		variant: 'destructive',
		confirmText: 'Eliminar',
	})

	if (!confirmed) return

	try {
		await ClientService.deleteClient(id)
		toast.success('Cliente eliminado')
		fetchClients()
	} catch (error: any) {
		toast.error('Error al eliminar', { description: error.message })
	}
}

const onSaved = () => {
	fetchClients()
}

onMounted(() => {
	fetchClients()
})
</script>

<template>
	<div class="space-y-4">
		<div class="flex items-center justify-between">
			<div class="relative max-w-sm w-full">
				<Search class="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
				<Input
					placeholder="Buscar por nombre, NIT o email..."
					v-model="searchQuery"
					class="pl-8"
				/>
			</div>
			<HasPermission name="quotes.create">
				<Button @click="openCreateSheet">
					<Plus />
					Nuevo Cliente
				</Button>
			</HasPermission>
		</div>

		<div class="border rounded-md">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Cliente</TableHead>
						<TableHead>Documento</TableHead>
						<TableHead>Contacto</TableHead>
						<TableHead>Ubicación</TableHead>
						<TableHead class="text-right">Acciones</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					<TableRow v-if="isLoading">
						<TableCell colspan="5" class="text-center py-8">
							<div class="flex items-center justify-center gap-2">
								<Loader2 class="h-4 w-4 animate-spin" />
								Cargando clientes...
							</div>
						</TableCell>
					</TableRow>
					<TableRow v-else-if="clients.length === 0">
						<TableCell
							colspan="5"
							class="text-center py-8 text-muted-foreground"
						>
							No se encontraron clientes.
						</TableCell>
					</TableRow>
					<TableRow v-for="client in clients" :key="client.cliente_id">
						<TableCell>
							<div class="flex items-center gap-3">
								<div
									class="h-8 w-8 rounded-full bg-muted flex items-center justify-center"
								>
									<Building2
										v-if="client.tipo_cliente === 'empresa'"
										class="h-4 w-4 text-primary"
									/>
									<User v-else class="h-4 w-4 text-muted-foreground" />
								</div>
								<div class="flex flex-col">
									<span class="font-medium">{{ client.nombre_completo }}</span>
									<span class="text-xs text-muted-foreground capitalize">{{
										client.tipo_cliente
									}}</span>
								</div>
							</div>
						</TableCell>
						<TableCell>
							<Badge variant="outline" v-if="client.documento_identidad">
								{{ client.documento_identidad }}
							</Badge>
							<span v-else class="text-muted-foreground text-xs">-</span>
						</TableCell>
						<TableCell>
							<div class="flex flex-col text-sm">
								<span v-if="client.email">{{ client.email }}</span>
								<span
									v-if="client.telefono"
									class="text-muted-foreground text-xs"
									>{{ client.telefono }}</span
								>
							</div>
						</TableCell>
						<TableCell class="text-sm">
							{{ client.ciudad }}
							<span v-if="client.pais" class="text-muted-foreground"
								>({{ client.pais }})</span
							>
						</TableCell>
						<TableCell class="text-right">
							<div class="flex justify-end gap-2">
								<HasPermission name="quotes.edit">
									<Button
										variant="ghost"
										size="icon"
										@click="openEditSheet(client.cliente_id)"
									>
										<Pencil class="w-4 h-4" />
									</Button>
								</HasPermission>
								<HasPermission name="quotes.edit">
									<Button
										variant="ghost"
										size="icon"
										class="text-destructive"
										@click="deleteClient(client.cliente_id)"
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

		<!-- Paginación UI (Basada en documentación oficial) -->
		<div class="flex items-center justify-between px-2 py-4">
			<div class="text-xs text-muted-foreground">
				Mostrando {{ clients.length }} de {{ totalItems }} clientes
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

		<ClientSheet
			:open="isSheetOpen"
			:client-id="selectedClientId"
			@update:open="isSheetOpen = $event"
			@saved="onSaved"
		/>
	</div>
</template>
