<script setup lang="ts">
import { ref, watch } from 'vue'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { toast } from 'vue-sonner'
import { FileDown, Loader2 } from 'lucide-vue-next'
import { InventoryReportService } from '../services/InventoryReportService'
import { InventoryReportPdfGenerator } from '../services/InventoryReportPdfGenerator'
import { AgencyService } from '@/modules/agency/AgencyService'
import type { Tables } from '@/types/database.types'

const props = defineProps<{
	open: boolean
}>()

const emit = defineEmits<{
	(e: 'update:open', value: boolean): void
}>()

const isGenerating = ref(false)
const reportType = ref<'services' | 'hotels' | 'packages'>('services')
const selectedHojaId = ref<number | ''>('')
const priceSheets = ref<Tables<'hojasdeprecios'>[]>([])
const loadingSheets = ref(false)

const loadDependencies = async () => {
	loadingSheets.value = true
	try {
		const sheets = await InventoryReportService.getPriceSheets()
		priceSheets.value = sheets || []

		// Auto-select the default sheet
		const def = priceSheets.value.find((s) => s.es_default)
		if (def) selectedHojaId.value = def.hoja_id
		else if (priceSheets.value && priceSheets.value.length > 0)
			selectedHojaId.value = priceSheets.value[0]?.hoja_id || ''
	} catch (e) {
		toast.error('No se pudieron cargar las hojas de precio')
	} finally {
		loadingSheets.value = false
	}
}

watch(
	() => props.open,
	(newVal) => {
		if (newVal && priceSheets.value.length === 0) {
			loadDependencies()
		}
	},
)

const handleGenerateReport = async () => {
	if (
		(reportType.value === 'services' || reportType.value === 'hotels') &&
		selectedHojaId.value === ''
	) {
		toast.error('Debe seleccionar una Hoja de Precios Base')
		return
	}

	isGenerating.value = true

	try {
		// 1. Fetch RAW Data correctly based on Type selection
		let rawData: any[] = []
		let hojaName = undefined

		if (reportType.value === 'services') {
			rawData = await InventoryReportService.getServicesMatrix(
				Number(selectedHojaId.value),
			)
		} else if (reportType.value === 'hotels') {
			rawData = await InventoryReportService.getHotelsMatrix(
				Number(selectedHojaId.value),
			)
		} else {
			rawData = await InventoryReportService.getPackages()
		}

		if (selectedHojaId.value !== '') {
			hojaName =
				priceSheets.value.find((h) => h.hoja_id === selectedHojaId.value)
					?.nombre || 'Indefinida'
		}

		if (!rawData || rawData.length === 0) {
			toast.warning(
				`No existen registros con precios configurados para este tarifario. Verifique el catálogo de ${reportType.value}.`,
			)
			isGenerating.value = false
			return
		}

		// 2. Fetch Agency Config for Logo
		const config = await AgencyService.getAgencyProfile()
		let logoBase64: string | undefined = undefined
		if (config?.empresa_logo_url) {
			try {
				const res = await fetch(config.empresa_logo_url)
				const blob = await res.blob()
				logoBase64 = await new Promise<string>((resolve, reject) => {
					const reader = new FileReader()
					reader.onloadend = () => resolve(reader.result as string)
					reader.onerror = reject
					reader.readAsDataURL(blob)
				})
			} catch (e) {
				console.error('Failed to load logo for Report PDF', e)
			}
		}

		// 3. Generate PDF mapping logic (Landscape Matrix mapping logic internally built)
		const generator = new InventoryReportPdfGenerator({
			type: reportType.value,
			hojaName: hojaName,
			data: rawData,
			agencyConfig: config,
			logoUrl: logoBase64,
		})

		generator.generate()
		toast.success(
			`Catálogo Confidencial de ${reportType.value} generado correctamente`,
		)
		emit('update:open', false)
	} catch (e: any) {
		console.error('Failed to generate report', e)
		toast.error('Error interno al compilar el PDF', { description: e.message })
	} finally {
		isGenerating.value = false
	}
}
</script>

<template>
	<Dialog :open="open" @update:open="emit('update:open', $event)">
		<DialogContent class="sm:max-w-md">
			<DialogHeader>
				<DialogTitle>Imprimir Tarifario (Inventory)</DialogTitle>
				<DialogDescription>
					Seleccione el tipo de catálogo confidencial. El sistema generará una
					matriz PDF lista para distribución.
				</DialogDescription>
			</DialogHeader>

			<div class="space-y-4 py-4">
				<div class="space-y-2">
					<Label>Sección del Catálogo</Label>
					<Select v-model="reportType as any">
						<SelectTrigger>
							<SelectValue placeholder="Categoría" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="services"
								>Tours, Excursiones y Transfers</SelectItem
							>
							<SelectItem value="hotels">Directorio de Hoteles</SelectItem>
							<SelectItem value="packages">Paquetes Prediseñados</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div v-show="reportType !== 'packages'" class="space-y-2 mt-4">
					<Label>Hoja de Precios Activa (Tarifario Base)</Label>
					<Select v-model="selectedHojaId as any" :disabled="loadingSheets">
						<SelectTrigger>
							<SelectValue placeholder="Seleccione el año o tarifario..." />
						</SelectTrigger>
						<SelectContent>
							<SelectItem
								v-for="h in priceSheets"
								:key="h.hoja_id"
								:value="h.hoja_id"
							>
								{{ h.nombre }} {{ h.es_default ? '(Default)' : '' }}
							</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div
					class="text-xs text-muted-foreground mt-4 border-l-2 border-primary pl-2 p-1 bg-muted/20 rounded-r"
				>
					<span v-if="reportType === 'services'">
						El sistema renderizará la matriz cruzando todos los servicios con
						sus rangos de PAX disponibles (Ej: 1-2, 3-5).
					</span>
					<span v-else-if="reportType === 'hotels'">
						Se extraerá el precio base confidencial de cada tipo de habitación
						asociada a su temporada.
					</span>
					<span v-else>
						Se imprimirá el catálogo descriptivo general de los paquetes
						armados. No requiere tarifario base.
					</span>
				</div>
			</div>

			<DialogFooter class="gap-2 sm:gap-0">
				<Button
					variant="outline"
					@click="emit('update:open', false)"
					:disabled="isGenerating"
				>
					Cancelar
				</Button>
				<Button @click="handleGenerateReport" :disabled="isGenerating">
					<Loader2 v-if="isGenerating" class="w-4 h-4 mr-2 animate-spin" />
					<FileDown v-else class="w-4 h-4 mr-2" />
					Generar PDF
				</Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
</template>
