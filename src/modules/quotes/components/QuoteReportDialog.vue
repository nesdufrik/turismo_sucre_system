<script setup lang="ts">
import { ref, watch, nextTick, shallowRef } from 'vue'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'vue-sonner'
import { FileDown, Loader2 } from 'lucide-vue-next'
import { QuoteReportService } from '../services/QuoteReportService'
import {
	QuoteReportPdfGenerator,
	type QuoteReportData,
} from '../services/QuoteReportPdfGenerator'

// Chart.js Configuration
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js'
import { Pie } from 'vue-chartjs'
import { AgencyService } from '@/modules/agency/AgencyService'

ChartJS.register(ArcElement, Tooltip, Legend, Title)

const props = defineProps<{
	open: boolean
}>()

const emit = defineEmits<{
	(e: 'update:open', value: boolean): void
}>()

const startDate = ref('')
const endDate = ref('')
const isGenerating = ref(false)

// We set default dates: past 30 days
watch(
	() => props.open,
	(newVal) => {
		if (newVal && !startDate.value) {
			const today = new Date()
			const thirtyDaysAgo = new Date()
			thirtyDaysAgo.setDate(today.getDate() - 30)

			endDate.value = today.toISOString().split('T')[0] || ''
			startDate.value = thirtyDaysAgo.toISOString().split('T')[0] || ''
		}
	},
)

// Chart reference and data
const chartRef = shallowRef<any>(null)
const chartData = ref({
	labels: ['Vendida', 'Aprobada', 'Borrador', 'Rechazada'],
	datasets: [
		{
			data: [1],
			backgroundColor: ['#2E7D32', '#1565C0', '#F57F17', '#C62828'],
		},
	],
})
const renderChartTrigger = ref(false)

const handleGenerateReport = async () => {
	if (!startDate.value || !endDate.value) {
		toast.error('Seleccione un rango de fechas válido')
		return
	}

	// Ensure start is before end
	if (new Date(startDate.value) > new Date(endDate.value)) {
		toast.error('La fecha de inicio debe ser anterior a la final')
		return
	}

	isGenerating.value = true

	try {
		// 1. Fetch RAW Data
		const rawData = await QuoteReportService.getQuotesForDateRange(
			startDate.value,
			endDate.value,
		)
		if (!rawData || rawData.length === 0) {
			toast.warning('No se encontraron cotizaciones en este rango de fechas.')
			isGenerating.value = false
			return
		}

		// 2. Prepare Chart Data (Background)
		const liquidated = rawData.filter((d) => d.estado === 'Liquidated').length
		const draft = rawData.filter(
			(d) => d.estado === 'Draft' || d.estado === 'In_Review',
		).length
		const rejct = rawData.filter((d) => d.estado === 'Rejected').length

		chartData.value = {
			labels: ['Liquidada', 'Borrador/Revisión', 'Rechazada'],
			datasets: [
				{
					data: [liquidated, draft, rejct],
					backgroundColor: ['#1565C0', '#F57F17', '#C62828'],
				},
			],
		}

		// Trigger chart render temporarily to get base64
		renderChartTrigger.value = true
		await nextTick()

		// Let animation finish (or configure chart.js with animation:false)
		await new Promise((resolve) => setTimeout(resolve, 500))

		let chartBase64 = ''
		if (chartRef.value && chartRef.value.chart) {
			chartBase64 = chartRef.value.chart.toBase64Image()
		}
		renderChartTrigger.value = false

		// 3. Fetch Agency Config for Logo
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

		// 4. Generate PDF
		const generator = new QuoteReportPdfGenerator({
			data: rawData as QuoteReportData[],
			startDate: startDate.value,
			endDate: endDate.value,
			agencyConfig: config,
			logoUrl: logoBase64,
			chartUrl: chartBase64,
		})

		generator.generate()
		toast.success('Reporte descargado correctamente')
		emit('update:open', false)
	} catch (e: any) {
		console.error('Failed to generate report', e)
		toast.error('Error al generar el reporte', { description: e.message })
	} finally {
		isGenerating.value = false
	}
}

// Chart Options (No animations so we can capture base64 instantly)
const chartOptions = {
	responsive: true,
	maintainAspectRatio: false,
	animation: { duration: 0 },
	plugins: {
		legend: {
			position: 'right' as const,
			labels: { boxWidth: 12, font: { size: 10 } },
		},
	},
}
</script>

<template>
	<Dialog :open="open" @update:open="emit('update:open', $event)">
		<DialogContent class="sm:max-w-md">
			<DialogHeader>
				<DialogTitle>Generar Reporte de Cotizaciones</DialogTitle>
				<DialogDescription>
					Filtre por rango de fechas para generar un PDF analítico del
					rendimiento comercial.
				</DialogDescription>
			</DialogHeader>

			<div class="space-y-4 py-4">
				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2">
						<Label>Fecha Inicio</Label>
						<Input type="date" v-model="startDate" />
					</div>
					<div class="space-y-2">
						<Label>Fecha Fin</Label>
						<Input type="date" v-model="endDate" />
					</div>
				</div>
				<div
					class="text-xs text-muted-foreground mt-2 border-l-2 border-primary pl-2 p-1"
				>
					El reporte incluirá gráficas de conversión (Vendidas vs Rechazadas) y
					el sumatorio total de ingresos cruzados.
				</div>

				<!-- Hidden container to render chart to take screenshot -->
				<div v-if="renderChartTrigger" class="absolute -top-full opacity-0">
					<div style="width: 400px; height: 250px">
						<Pie ref="chartRef" :data="chartData" :options="chartOptions" />
					</div>
				</div>
			</div>

			<DialogFooter>
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
					Descargar PDF
				</Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
</template>
