<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import {
	QuoteService,
	type QuoteWithClient,
	type PaginatedResponse,
} from '../QuoteService'
import { useRouter } from 'vue-router'
import { useConfirm } from '@/composables/useConfirm'
import { useAuthStore } from '@/stores/auth'
import { usePermission } from '@/composables/usePermission'
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
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
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
import {
	Plus,
	Search,
	MoreHorizontal,
	FileText,
	Trash2,
	Calendar,
	User,
	Users2,
	Loader2,
} from 'lucide-vue-next'
import { formatDateTime } from '@/lib/date-utils'
import { toast } from 'vue-sonner'
import QuoteStatusBadge from '../components/QuoteStatusBadge.vue'
import QuoteReportDialog from '../components/QuoteReportDialog.vue'
import { supabase } from '@/lib/supabase'
import { onUnmounted } from 'vue'

const router = useRouter()
const { confirm } = useConfirm()
const authStore = useAuthStore()
const { can } = usePermission()
const quotes = ref<QuoteWithClient[]>([])

const navigateToQuote = (id: number) => {
	if (can('quotes.view') || can('quotes.edit')) {
		router.push({
			name: 'QuoteEdit',
			params: { id },
		})
	}
}
const loading = ref(true)
const showReportDialog = ref(false)

// Realtime subscription
let quoteSubscription: any = null

const subscribeToQuotes = () => {
	quoteSubscription = supabase
		.channel('public:cotizaciones')
		.on(
			'postgres_changes',
			{ event: '*', schema: 'public', table: 'cotizaciones' },
			() => {
				// Refresh list on any change
				fetchQuotes()
			},
		)
		.subscribe()
}

// Filters & Pagination
const searchQuery = ref('')
const statusFilter = ref('all')
const currentPage = ref(1)
const pageSize = ref(15)
const totalItems = ref(0)

const fetchQuotes = async () => {
	loading.value = true
	try {
		const response = (await QuoteService.getQuotes({
			page: currentPage.value,
			pageSize: pageSize.value,
			search: searchQuery.value,
			status: statusFilter.value,
		})) as PaginatedResponse<QuoteWithClient>

		quotes.value = response.data
		totalItems.value = response.count || 0
	} catch (error) {
		console.error(error)
		toast.error('Error al cargar cotizaciones')
	} finally {
		loading.value = false
	}
}

// Watchers
watch([currentPage, pageSize, statusFilter], () => {
	fetchQuotes()
})

let searchTimeout: any = null
watch(searchQuery, () => {
	currentPage.value = 1
	if (searchTimeout) clearTimeout(searchTimeout)
	searchTimeout = setTimeout(() => {
		fetchQuotes()
	}, 500)
})

const canDelete = (quote: QuoteWithClient) => {
	return !['Liquidated'].includes(quote.estado || '')
}

const deleteQuote = async (quote: QuoteWithClient) => {
	if (!canDelete(quote)) {
		toast.error('No se puede eliminar una cotización aprobada o vendida')
		return
	}

	const ok = await confirm({
		title: '¿Eliminar Cotización?',
		description: `Estás a punto de eliminar la cotización ${quote.codigo_referencia || `#${quote.cotizacion_id}`}. Esta acción no se puede deshacer.`,
		confirmText: 'Eliminar',
		variant: 'destructive',
	})

	if (!ok) return

	try {
		await QuoteService.deleteQuote(quote.cotizacion_id)
		toast.success('Cotización eliminada')
		fetchQuotes()
	} catch (error) {
		toast.error('Error al eliminar')
	}
}

onMounted(() => {
	fetchQuotes()
	subscribeToQuotes()
})

onUnmounted(() => {
	if (quoteSubscription) {
		supabase.removeChannel(quoteSubscription)
	}
})
</script>

<template>
	<div class="space-y-4">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Cotizaciones</h1>
			<p class="text-muted-foreground">
				Administra las cotizaciones del sistema.
			</p>
		</div>

		<div class="flex flex-col md:flex-row items-center justify-between gap-4">
			<div class="flex items-center gap-2 w-full max-w-2xl">
				<div class="relative flex-1">
					<Search
						class="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"
					/>
					<Input
						v-model="searchQuery"
						placeholder="Buscar por grupo, ID o código..."
						class="pl-8"
					/>
				</div>
				<div class="w-48">
					<Select v-model="statusFilter">
						<SelectTrigger>
							<SelectValue placeholder="Estado" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Todos los estados</SelectItem>
							<SelectItem value="Draft">Borrador</SelectItem>
							<SelectItem value="In_Review">En Revisión</SelectItem>
							<SelectItem value="Liquidated">Liquidada</SelectItem>
							<SelectItem value="Rejected">Rechazada</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>
			<div class="flex flex-wrap gap-2">
				<Button variant="outline" @click="showReportDialog = true">
					<FileText class="w-4 h-4 mr-2" /> Reportes
				</Button>
				<HasPermission name="quotes.create">
					<Button @click="router.push({ name: 'QuoteCreate' })">
						<Plus /> Crear Nuevo
					</Button>
				</HasPermission>
			</div>
		</div>

		<div class="rounded-md border bg-card shadow-sm overflow-hidden">
			<Table>
				<TableHeader class="bg-muted/50">
					<TableRow>
						<TableHead class="w-20">ID</TableHead>
						<TableHead class="w-32">Referencia</TableHead>
						<TableHead>Cliente / Grupo</TableHead>
						<TableHead>Pax</TableHead>
						<TableHead>Creado</TableHead>
						<TableHead>Total</TableHead>
						<TableHead>Estado</TableHead>
						<TableHead class="text-right">Acciones</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					<TableRow v-if="loading">
						<TableCell colspan="8" class="text-center py-12">
							<div class="flex flex-col items-center gap-2">
								<Loader2 class="h-8 w-8 animate-spin text-primary" />
								<span class="text-sm text-muted-foreground"
									>Cargando cotizaciones...</span
								>
							</div>
						</TableCell>
					</TableRow>
					<TableRow v-else-if="quotes.length === 0">
						<TableCell
							colspan="8"
							class="text-center py-12 text-muted-foreground"
						>
							No se encontraron cotizaciones.
						</TableCell>
					</TableRow>
					<TableRow
						v-for="quote in quotes"
						:key="quote.cotizacion_id"
						class="group"
						:class="{ 'cursor-pointer': can('quotes.view') || can('quotes.edit') }"
						@click="navigateToQuote(quote.cotizacion_id)"
					>
						<TableCell class="font-mono text-xs font-semibold text-muted-foreground">
							#{{ quote.cotizacion_id }}
						</TableCell>
						<TableCell class="font-mono text-xs font-bold text-primary"
							>{{ quote.codigo_referencia }}</TableCell
						>
						<TableCell>
							<div class="flex flex-col">
								<span class="font-medium">{{
									quote.clientes?.nombre_completo || 'Cliente General'
								}}</span>
								<span
									v-if="quote.nombre_grupo"
									class="text-xs text-muted-foreground flex items-center gap-1"
								>
									<User class="w-3 h-3" /> {{ quote.nombre_grupo }}
								</span>
							</div>
						</TableCell>
						<TableCell>
							<div class="flex items-center gap-2">
								<div class="flex items-center gap-1">
									<Users2 class="w-3.5 h-3.5 text-muted-foreground" />
									<span class="text-sm font-medium">{{ quote.cantidad_pax }}</span>
									<span class="text-xs text-muted-foreground">ad.</span>
								</div>
								<div
									v-if="quote.cantidad_pax_ninos > 0"
									class="flex items-center gap-1 text-xs text-muted-foreground border-l pl-2"
								>
									<span>{{ quote.cantidad_pax_ninos }}</span>
									<span>niñ.</span>
								</div>
							</div>
						</TableCell>
						<TableCell>
							<div
								v-if="quote.fecha_creacion"
								class="flex items-center gap-2 text-xs text-muted-foreground"
							>
								<Calendar class="w-3 h-3" />
								{{ formatDateTime(quote.fecha_creacion) }}
							</div>
							<span v-else class="text-xs text-muted-foreground">-</span>
						</TableCell>
						<TableCell class="font-bold">
							<HasPermission name="prices.view_cost">
								{{
									new Intl.NumberFormat('en-US', {
										style: 'currency',
										currency: quote.moneda || 'USD',
									}).format(quote.total_general || 0)
								}}
								<template #no-access>
									<span class="text-muted-foreground font-normal text-xs italic"
										>***</span
									>
								</template>
							</HasPermission>
						</TableCell>
						<TableCell>
							<QuoteStatusBadge :status="quote.estado" />
						</TableCell>
						<TableCell class="text-right" @click.stop>
							<DropdownMenu>
								<DropdownMenuTrigger as-child>
									<Button variant="ghost" size="icon">
										<MoreHorizontal class="w-4 h-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<HasPermission name="quotes.view,quotes.edit">
										<DropdownMenuItem
											@click="
												router.push({
													name: 'QuoteEdit',
													params: { id: quote.cotizacion_id },
												})
											"
										>
											<FileText class="w-4 h-4 mr-2" /> Ver / Editar
										</DropdownMenuItem>
									</HasPermission>

									<HasPermission name="quotes.delete">
										<DropdownMenuItem
											v-if="canDelete(quote as any)"
											@click="deleteQuote(quote as any)"
											class="text-destructive focus:text-destructive"
										>
											<Trash2 class="w-4 h-4 mr-2" /> Eliminar
										</DropdownMenuItem>
										<template #no-access>
											<DropdownMenuItem
												v-if="
													canDelete(quote as any) &&
													(quote as any).creado_por === authStore.user?.id
												"
												@click="deleteQuote(quote as any)"
												class="text-destructive focus:text-destructive"
											>
												<Trash2 class="w-4 h-4 mr-2" /> Eliminar (Propias)
											</DropdownMenuItem>
										</template>
									</HasPermission>
								</DropdownMenuContent>
							</DropdownMenu>
						</TableCell>
					</TableRow>
				</TableBody>
			</Table>
		</div>

		<!-- Pagination UI -->
		<div
			class="flex flex-col md:flex-row items-center justify-between px-2 py-4 gap-4"
		>
			<div class="text-xs text-muted-foreground">
				Mostrando {{ quotes.length }} de {{ totalItems }} cotizaciones
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

		<!-- Dialogs -->
		<QuoteReportDialog v-model:open="showReportDialog" />
	</div>
</template>
