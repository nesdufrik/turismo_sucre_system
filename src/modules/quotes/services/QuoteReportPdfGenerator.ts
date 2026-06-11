import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Tables } from '@/types/database.types'

export interface QuoteReportData {
	cotizacion_id: number
	codigo_referencia?: string | null
	estado: string | null
	moneda: string | null
	total_general: number | null
	fecha_creacion: string | null
	clientes: {
		nombre_completo: string | null
		empresa: string | null
	} | null
}

export interface ReportPdfGeneratorOptions {
	data: QuoteReportData[]
	startDate: string
	endDate: string
	agencyConfig?: Tables<'configuracion_sistema'> | null
	logoUrl?: string // Base64 empty if none
	chartUrl?: string // Base64 empty if none
}

export class QuoteReportPdfGenerator {
	private doc: jsPDF
	private data: QuoteReportData[]
	private startDate: string
	private endDate: string
	private logoUrl?: string
	private chartUrl?: string

	private colors = {
		primary: [41, 128, 185] as [number, number, number],
		secondary: [127, 140, 141] as [number, number, number],
		text: [44, 62, 80] as [number, number, number],
		lightGrey: [245, 245, 245] as [number, number, number],
	}

	constructor(options: ReportPdfGeneratorOptions) {
		this.data = options.data
		this.startDate = options.startDate
		this.endDate = options.endDate
		this.endDate = options.endDate
		this.logoUrl = options.logoUrl
		this.chartUrl = options.chartUrl

		this.doc = new jsPDF({
			orientation: 'portrait',
			unit: 'mm',
			format: 'a4',
		})
	}

	public generate() {
		this.drawHeader()
		this.drawSummary()
		if (this.chartUrl) {
			this.drawChart()
			this.drawTable(140) // Move table down below chart
		} else {
			this.drawTable(90) // Table right below summary
		}
		this.drawFooter()

		const filename = `Reporte-Cotizaciones-${this.startDate}-to-${this.endDate}.pdf`
		this.doc.save(filename)
	}

	private drawHeader() {
		const doc = this.doc
		const pageWidth = doc.internal.pageSize.getWidth()

		// Logo
		if (this.logoUrl) {
			try {
				doc.addImage(this.logoUrl, 'PNG', 14, 10, 30, 20, '', 'FAST')
			} catch (e) {
				console.error('Failed to draw logo')
			}
		} else {
			doc.setFontSize(18)
			doc.setTextColor(
				this.colors.primary[0],
				this.colors.primary[1],
				this.colors.primary[2],
			)
			doc.text('TURISMO SUCRE', 14, 20)
		}

		const centerX = pageWidth / 2
		doc.setFontSize(16)
		doc.setFont('helvetica', 'bold')
		doc.setTextColor(
			this.colors.text[0],
			this.colors.text[1],
			this.colors.text[2],
		)
		doc.text('REPORTE DE COTIZACIONES', centerX, 20, { align: 'center' })

		doc.setFontSize(10)
		doc.setFont('helvetica', 'normal')
		const rangeText = `Fecha: ${this.startDate} al ${this.endDate}`
		doc.text(rangeText, centerX, 26, { align: 'center' })

		// Divider
		doc.setDrawColor(200, 200, 200)
		doc.line(14, 32, pageWidth - 14, 32)
	}

	private drawSummary() {
		const doc = this.doc
		const startY = 42

		const liquidatedItems = this.data.filter((d) => d.estado === 'Liquidated')

		const totalUSD = liquidatedItems
			.filter((d) => d.moneda === 'USD')
			.reduce((acc, curr) => acc + (curr.total_general || 0), 0)
		const totalBOB = liquidatedItems
			.filter((d) => d.moneda === 'BOB')
			.reduce((acc, curr) => acc + (curr.total_general || 0), 0)

		doc.setFontSize(11)
		doc.setFont('helvetica', 'bold')
		doc.text('Métricas de Rendimiento', 14, startY)

		doc.setFontSize(10)
		doc.setFont('helvetica', 'normal')

		doc.text(
			`Total Cotizaciones Generadas: ${this.data.length}`,
			14,
			startY + 8,
		)
		doc.text(
			`Cotizaciones Liquidadas: ${liquidatedItems.length}`,
			14,
			startY + 14,
		)

		const conversion =
			this.data.length > 0
				? Math.round((liquidatedItems.length / this.data.length) * 100)
				: 0
		doc.text(`Tasa de Cierre General: ${conversion}%`, 14, startY + 20)

		// Right column
		const col2X = 110
		doc.setFont('helvetica', 'bold')
		doc.text('Cotizaciones Liquidadas (Ingresos)', col2X, startY)
		doc.setFont('helvetica', 'normal')

		const formatCurrency = (val: number, cur: string) =>
			new Intl.NumberFormat('en-US', {
				style: 'currency',
				currency: cur,
			}).format(val)

		doc.text(
			`Total en USD: ${formatCurrency(totalUSD, 'USD')}`,
			col2X,
			startY + 8,
		)
		doc.text(
			`Total en BOB: ${formatCurrency(totalBOB, 'BOB')}`,
			col2X,
			startY + 14,
		)

		doc.setDrawColor(200, 200, 200)
		doc.line(
			14,
			startY + 34,
			doc.internal.pageSize.getWidth() - 14,
			startY + 34,
		)
	}

	private drawChart() {
		if (!this.chartUrl) return
		const doc = this.doc
		const pageWidth = doc.internal.pageSize.getWidth()
		const chartWidth = 75
		const chartHeight = 45
		const centerX = pageWidth / 2

		try {
			// Place chart centered below the summary block
			doc.addImage(
				this.chartUrl,
				'PNG',
				centerX - chartWidth / 2,
				85,
				chartWidth,
				chartHeight,
				'',
				'FAST',
			)
		} catch (e) {
			console.error('Failed to draw chart in pdf')
		}
	}

	private drawTable(startY: number) {
		const headers = [['Fecha', 'Referencia', 'Cliente', 'Estado', 'Subtotal', 'Mon.']]

		const body = this.data.map((item) => {
			const dateStr = item.fecha_creacion
				? new Date(item.fecha_creacion).toLocaleDateString('es-ES')
				: '-'
			let clientName = item.clientes?.nombre_completo || 'General'
			if (item.clientes?.empresa) clientName += ` (${item.clientes.empresa})`

			const statusTranslations: Record<string, string> = {
				Draft: 'Borrador',
				In_Review: 'En Revisión',
				Liquidated: 'Liquidada',
				Rejected: 'Rechazada',
			}

			const st =
				statusTranslations[item.estado || 'Draft'] || item.estado || '-'
			const val = item.total_general
				? Number(item.total_general).toFixed(2)
				: '0.00'

			return [
				dateStr,
				item.codigo_referencia || `#${item.cotizacion_id}`,
				clientName,
				st,
				val,
				item.moneda || 'USD',
			]
		})

		autoTable(this.doc, {
			startY: startY,
			head: headers,
			body: body,
			theme: 'grid',
			headStyles: {
				fillColor: this.colors.primary as any,
				textColor: 255,
				fontSize: 9,
			},
			styles: { fontSize: 8 },
			columnStyles: {
				0: { cellWidth: 20 },
				1: { cellWidth: 25 },
				2: { cellWidth: 'auto' },
				3: { cellWidth: 25 },
				4: { cellWidth: 20, halign: 'right' },
				5: { cellWidth: 12 },
			},
		})
	}

	private drawFooter() {
		const doc = this.doc
		const pageHeight = doc.internal.pageSize.getHeight()
		const pageWidth = doc.internal.pageSize.getWidth()

		doc.setFontSize(8)
		doc.setTextColor(150, 150, 150)
		doc.text(
			'Generado por Sistema Turismo Sucre',
			pageWidth - 14,
			pageHeight - 10,
			{ align: 'right' },
		)

		const dateStr = new Date().toLocaleString('es-ES')
		doc.text(`Fecha de Impresión: ${dateStr}`, 14, pageHeight - 10)
	}
}
