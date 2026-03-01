<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { QuoteService, type QuoteItemWithDetails } from '../QuoteService'
import { PriceCalculator } from '../domain/PriceCalculator'
import { useConfirm } from '@/composables/useConfirm'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardFooter,
} from '@/components/ui/card'
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
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Hotel, Map, Package, Info, Edit } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

import ServiceSelector from './selectors/ServiceSelector.vue'
import HotelSelector from './selectors/HotelSelector.vue'
import PackageSelector from './selectors/PackageSelector.vue'

const props = defineProps<{
	quoteId: number
	hojaId: number | null
	pax: number
	taxPercent: number
	commPercent: number
	exchangeRate: number
	currency: string
	readonly?: boolean
}>()

const emit = defineEmits<{
	(e: 'refresh'): void
}>()

const items = ref<QuoteItemWithDetails[]>([])
const isLoading = ref(false)
const editingItem = ref<QuoteItemWithDetails | null>(null)
const { confirm } = useConfirm()

// Formatting
const fmt = new Intl.NumberFormat('en-US', {
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
})
const cur = (val: number) => fmt.format(val)

// Calculations using Domain Logic
const financialSummary = computed(() => {
	return PriceCalculator.calculateSummary(items.value, {
		pax: props.pax,
		taxPercent: props.taxPercent,
		commPercent: props.commPercent,
		exchangeRate: props.exchangeRate,
	})
})

const subtotalNeto = computed(() => financialSummary.value.subtotalNeto)
const taxAmount = computed(() => financialSummary.value.taxAmount)
const totalBruto = computed(() => financialSummary.value.totalBruto)
const commAmount = computed(() => financialSummary.value.commAmount)
const totalFinalUSD = computed(() => financialSummary.value.totalFinal)
const totalFinalBOB = computed(() => financialSummary.value.totalFinalBOB || 0)

// Selectors State
const showServiceSelector = ref(false)
const showHotelSelector = ref(false)
const showPackageSelector = ref(false)

const fetchItems = async () => {
	isLoading.value = true
	try {
		items.value = await QuoteService.getQuoteItems(props.quoteId)
	} catch (error: any) {
		toast.error('Error al cargar items')
	} finally {
		isLoading.value = false
	}
}

const deleteItem = async (id: number) => {
	const ok = await confirm({
		title: '¿Eliminar item?',
		description: 'Esta acción quitará el servicio de la cotización.',
		confirmText: 'Eliminar',
		variant: 'destructive',
	})

	if (!ok) return

	try {
		await QuoteService.deleteQuoteItem(id, props.quoteId)
		fetchItems()
		emit('refresh')
	} catch (error) {
		toast.error('Error al eliminar item')
	}
}

const onSaved = () => {
	fetchItems()
	emit('refresh')
}

const editItem = (item: QuoteItemWithDetails) => {
	if (props.readonly) return
	editingItem.value = item
	if (item.servicio_id) {
		showServiceSelector.value = true
	} else if (item.habitacion_id) {
		showHotelSelector.value = true
	} else if (item.paquete_id) {
		showPackageSelector.value = true
	} else {
		showServiceSelector.value = true
	}
}

const openAddService = () => {
	editingItem.value = null
	showServiceSelector.value = true
}

const openAddHotel = () => {
	editingItem.value = null
	showHotelSelector.value = true
}

const openAddPackage = () => {
	editingItem.value = null
	showPackageSelector.value = true
}

onMounted(() => {
	fetchItems()
})
</script>

<template>
	<Card class="h-full flex flex-col">
		<CardHeader class="flex flex-row items-center justify-between">
			<CardTitle>Itinerario / Servicios</CardTitle>
			<div class="flex items-center gap-2">
				<Badge variant="outline" class="font-normal text-xs">
					{{ pax }} Pax
				</Badge>
				<HasPermission name="quotes.edit">
					<DropdownMenu v-if="!readonly">
						<DropdownMenuTrigger as-child>
							<Button size="sm" variant="default">
								<Plus />
								Agregar Item
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem @click="openAddService">
								<Map class="w-4 h-4 mr-2" /> Servicio / Tour
							</DropdownMenuItem>
							<DropdownMenuItem @click="openAddHotel">
								<Hotel class="w-4 h-4 mr-2" /> Hotel
							</DropdownMenuItem>
							<DropdownMenuItem @click="openAddPackage">
								<Package class="w-4 h-4 mr-2" /> Paquete
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</HasPermission>
			</div>
		</CardHeader>
		<CardContent class="grow">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Fecha</TableHead>
						<TableHead>Descripción</TableHead>
						<TableHead>Código</TableHead>
						<TableHead class="text-center">Tipo</TableHead>
						<TableHead class="text-right">Unitario</TableHead>
						<TableHead class="text-right">Total Item</TableHead>
						<TableHead v-if="!readonly"></TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					<TableRow v-if="items.length === 0">
						<TableCell
							:colspan="readonly ? 5 : 6"
							class="text-center py-8 text-muted-foreground"
						>
							No hay items en esta cotización.
						</TableCell>
					</TableRow>
					<TableRow v-for="item in items" :key="item.item_id">
						<TableCell class="text-xs whitespace-nowrap">
							{{ item.fecha_servicio || 'Sin fecha' }}
						</TableCell>
						<TableCell class="font-medium">
							<!-- Primary Display: SNAPSHOT -->
							<div
								class="max-w-[300px] truncate"
								:title="item.descripcion_snapshot || ''"
							>
								{{ item.descripcion_snapshot }}
							</div>

							<!-- Metadata (Origin) -->
							<div
								class="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1 uppercase tracking-wider"
							>
								<span v-if="item.servicios" class="flex items-center gap-1">
									<Map class="w-3 h-3" /> {{ item.servicios.nombre }}
								</span>
								<span
									v-else-if="item.tiposhabitacion"
									class="flex items-center gap-1"
								>
									<Hotel class="w-3 h-3" />
									{{ item.tiposhabitacion.hoteles?.nombre }}
								</span>
								<span v-else-if="item.paquetes" class="flex items-center gap-1">
									<Package class="w-3 h-3" /> {{ item.paquetes.nombre_paquete }}
								</span>
							</div>
						</TableCell>
						<TableCell class="text-xs whitespace-nowrap">
							{{ item.servicios?.codigo || 'Sin código' }}
						</TableCell>
						<TableCell class="text-center">
							<Badge
								:variant="(item.aplica_comision ?? true) ? 'secondary' : 'outline'"
								class="text-[10px] px-1.5 h-5"
							>
								{{ (item.aplica_comision ?? true) ? 'Comisionable' : 'Neto' }}
							</Badge>
						</TableCell>
						<TableCell class="text-right text-xs">
							<HasPermission name="prices.view_cost">
								{{ cur(item.precio_unitario_snapshot || 0) }}
								<template #no-access>***</template>
							</HasPermission>
							<div class="text-[10px] text-muted-foreground">
								x {{ item.cantidad }}
							</div>
						</TableCell>
						<TableCell class="text-right font-bold text-sm">
							<HasPermission name="prices.view_cost">
								{{ cur(PriceCalculator.calculateItemTotal(item, pax)) }}
								<template #no-access>***</template>
							</HasPermission>
						</TableCell>
						<TableCell
							v-if="!readonly"
							class="text-right flex items-center justify-end gap-1"
						>
							<HasPermission name="quotes.edit">
								<Button
									variant="ghost"
									size="icon"
									class="h-6 w-6 text-muted-foreground hover:text-primary"
									@click="editItem(item)"
								>
									<Edit class="w-3 h-3" />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									class="h-6 w-6 text-destructive"
									@click="deleteItem(item.item_id)"
								>
									<Trash2 class="w-3 h-3" />
								</Button>
							</HasPermission>
						</TableCell>
					</TableRow>
				</TableBody>
			</Table>
		</CardContent>

		<!-- Footer: Resumen Financiero -->
		<HasPermission name="prices.view_cost">
			<CardFooter
				class="bg-muted/50 border-t flex flex-col items-end p-6 space-y-2"
			>
				<div class="w-full flex justify-between text-sm text-muted-foreground">
					<span>Subtotal Neto (Pax x {{ pax }})</span>
					<span>{{ cur(subtotalNeto) }} USD</span>
				</div>
				<div class="w-full flex justify-between text-sm text-muted-foreground">
					<span>Adicional Factura ({{ taxPercent }}%)</span>
					<span class="text-primary">+ {{ cur(taxAmount) }} USD</span>
				</div>
				<div class="w-full flex justify-between font-medium">
					<span>Subtotal</span>
					<span>{{ cur(totalBruto) }} USD</span>
				</div>
				<div
					v-if="commPercent > 0"
					class="w-full flex justify-between text-sm text-muted-foreground"
				>
					<span>Comisión Agencia ({{ commPercent }}%)</span>
					<span class="text-destructive">- {{ cur(commAmount) }} USD</span>
				</div>
				<Separator class="my-2" />
				<div class="w-full flex justify-between items-center pt-2">
					<span class="text-lg font-bold">TOTAL A PAGAR</span>
					<div class="text-right">
						<div class="text-2xl font-black text-primary">
							{{ cur(totalFinalUSD) }} USD
						</div>
						<div class="text-sm font-medium text-muted-foreground">
							{{ cur(totalFinalBOB) }} BOB
						</div>
					</div>
				</div>
				<div
					class="text-[10px] text-muted-foreground italic flex items-center gap-1 mt-4"
				>
					<Info class="w-3 h-3" /> Tipo de cambio aplicado: 1 USD =
					{{ exchangeRate }} BOB
				</div>
			</CardFooter>
			<template #no-access>
				<div class="p-6 text-center border-t bg-muted/20 text-muted-foreground text-sm italic">
					Información financiera restringida. Contacte con un administrador para ver totales.
				</div>
			</template>
		</HasPermission>

		<!-- Selectors -->
		<ServiceSelector
			v-if="showServiceSelector"
			v-model:open="showServiceSelector"
			:quote-id="quoteId"
			:hoja-id="hojaId"
			:pax="pax"
			:item-to-edit="editingItem"
			@saved="onSaved"
		/>

		<HotelSelector
			v-if="showHotelSelector"
			v-model:open="showHotelSelector"
			:quote-id="quoteId"
			:hoja-id="hojaId"
			:pax="pax"
			:item-to-edit="editingItem"
			@saved="onSaved"
		/>

		<PackageSelector
			v-if="showPackageSelector"
			v-model:open="showPackageSelector"
			:quote-id="quoteId"
			:hoja-id="hojaId"
			:pax="pax"
			:item-to-edit="editingItem"
			@saved="onSaved"
		/>
	</Card>
</template>
