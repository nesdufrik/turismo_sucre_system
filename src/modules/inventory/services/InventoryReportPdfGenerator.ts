import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Tables } from '@/types/database.types'

export interface InventoryReportOptions {
	type: 'services' | 'hotels' | 'packages'
	hojaName?: string
	data: any[]
	agencyConfig?: Tables<'configuracion_sistema'> | null
	logoUrl?: string // Base64
}

export class InventoryReportPdfGenerator {
	private doc: jsPDF
	private options: InventoryReportOptions

	private colors = {
		primary: [44, 62, 80] as [number, number, number],
		secondary: [149, 165, 166] as [number, number, number],
		accent: [41, 128, 185] as [number, number, number],
		text: [51, 51, 51] as [number, number, number],
		lightGrey: [248, 249, 250] as [number, number, number],
	}

	constructor(options: InventoryReportOptions) {
		this.options = options
		this.doc = new jsPDF({
			orientation: 'landscape', // For matrix tables landscape is better
			unit: 'mm',
			format: 'a4',
		})
	}

	public generate() {
		this.drawHeader()

		if (this.options.type === 'services') {
			this.drawServicesMatrix()
		} else if (this.options.type === 'hotels') {
			this.drawHotelsMatrix()
		} else {
			this.drawPackagesList()
		}

		this.drawFooter()

		const titleMap = {
			services: 'Tours-y-Servicios',
			hotels: 'Hoteles',
			packages: 'Paquetes',
		}
		const filename = `Tarifario-${titleMap[this.options.type]}${this.options.hojaName ? `-${this.options.hojaName}` : ''}.pdf`
		this.doc.save(filename)
	}

	private drawHeader() {
		const doc = this.doc
		const pageWidth = doc.internal.pageSize.getWidth()

		// Logo
		if (this.options.logoUrl) {
			try {
				doc.addImage(this.options.logoUrl, 'PNG', 14, 10, 30, 20, '', 'FAST')
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

		let reportTitle = 'TARIFARIO CONFIDENCIAL'
		if (this.options.type === 'services') reportTitle += ' - TOURS Y SERVICIOS'
		if (this.options.type === 'hotels')
			reportTitle += ' - HOTELES Y ALOJAMIENTO'
		if (this.options.type === 'packages')
			reportTitle += ' - DIRECTORIO DE PAQUETES'

		doc.text(reportTitle, centerX, 18, { align: 'center' })

		if (this.options.hojaName) {
			doc.setFontSize(11)
			doc.setFont('helvetica', 'normal')
			doc.setTextColor(
				this.colors.accent[0],
				this.colors.accent[1],
				this.colors.accent[2],
			)
			doc.text(`Lista de Precios Base: ${this.options.hojaName}`, centerX, 24, {
				align: 'center',
			})
		}

		// Divider
		doc.setDrawColor(200, 200, 200)
		doc.line(14, 32, pageWidth - 14, 32)
	}

	private drawServicesMatrix() {
		// 1. Discover unique ranges [min, max] from all services
		const ranges = new Set<string>()

		this.options.data.forEach((service) => {
			if (!service.preciosservicio) return
			// Filter out rows that are not for the current sheet? Service layer already did this mostly, but just in case we only look at the passed structure
			service.preciosservicio.forEach((p: any) => {
				ranges.add(`${p.min_pax}-${p.max_pax}`)
			})
		})

		// Sort ranges (e.g., "1-1" before "2-4")
		const sortedRanges = Array.from(ranges).sort((a: string, b: string) => {
			const minA = parseInt(a ? (a.split('-')[0] as string) : '') || 0
			const minB = parseInt(b ? (b.split('-')[0] as string) : '') || 0
			return minA - minB
		})

		const paxHeaders = sortedRanges.map((r) => {
			const parts = r.split('-')
			const min = parts[0] ? parts[0] : ''
			const max = parts[1] ? parts[1] : ''
			if (min === max) return `${min} Pax`
			return `${min}-${max} Pax`
		})

		const headers = [
			['Ciudad', 'Servicio', 'Cód.', 'Tipo', 'Duración', ...paxHeaders],
		]

		const body = this.options.data.map((service) => {
			const row = [
				service.ubicaciones?.ciudad || '',
				service.nombre || '',
				service.codigo || '',
				service.categoriasservicio?.nombre || '',
				service.duracion_texto || '',
			]

			// Fill matrix columns based on ranges
			sortedRanges.forEach((rangeStr) => {
				const [minStr, maxStr] = rangeStr.split('-')
				const p = service.preciosservicio?.find(
					(x: any) =>
						x.min_pax.toString() === minStr && x.max_pax.toString() === maxStr,
				)

				if (p && p.precio_por_persona !== null) {
					row.push(
						new Intl.NumberFormat('en-US', {
							style: 'currency',
							currency: 'USD',
						}).format(p.precio_por_persona),
					)
				} else {
					row.push('-')
				}
			})

			return row
		})

		autoTable(this.doc, {
			startY: 40,
			head: headers,
			body: body,
			theme: 'grid',
			headStyles: {
				fillColor: this.colors.primary as any,
				textColor: 255,
				fontSize: 8,
			},
			styles: { fontSize: 8 },
			columnStyles: {
				0: { cellWidth: 20 },
				1: { cellWidth: 80 }, // Wide cell for service name
				2: { cellWidth: 15 },
			},
		})
	}

	private drawHotelsMatrix() {
		const headers = [
			[
				'Ciudad',
				'Hotel',
				'Categ.',
				'Desayuno',
				'Imptos.',
				'Habitación',
				'Temporada',
				'Precio Conf.',
			],
		]
		const body: any[] = []

		this.options.data.forEach((hotel) => {
			if (!hotel.tiposhabitacion || hotel.tiposhabitacion.length === 0) return

			let totalRows = 0
			hotel.tiposhabitacion.forEach((hab: any) => {
				if (hab.precioshabitacion) totalRows += hab.precioshabitacion.length
			})

			if (totalRows === 0) return

			let isFirstRowForHotel = true

			hotel.tiposhabitacion.forEach((hab: any) => {
				if (!hab.precioshabitacion || hab.precioshabitacion.length === 0) return

				hab.precioshabitacion.forEach((precio: any) => {
					const row: any[] = []

					if (isFirstRowForHotel) {
						row.push({
							content: hotel.ubicaciones?.ciudad || '',
							rowSpan: totalRows,
							styles: { valign: 'middle' },
						})
						row.push({
							content: hotel.nombre || '',
							rowSpan: totalRows,
							styles: { valign: 'middle' },
						})
						row.push({
							content: hotel.categoria || '',
							rowSpan: totalRows,
							styles: { valign: 'middle', halign: 'center' },
						})
						row.push({
							content: hotel.info_desayuno || '-',
							rowSpan: totalRows,
							styles: { valign: 'middle', halign: 'center' },
						})
						row.push({
							content: hotel.incluye_impuestos ? 'Sí' : 'No',
							rowSpan: totalRows,
							styles: { valign: 'middle', halign: 'center' },
						})
					}

					row.push(hab.tipo || '')
					row.push(precio.temporada || 'Regular')
					row.push(
						new Intl.NumberFormat('en-US', {
							style: 'currency',
							currency: 'USD',
						}).format(precio.precio_por_noche || 0),
					)

					body.push(row)
					isFirstRowForHotel = false
				})
			})
		})

		autoTable(this.doc, {
			startY: 40,
			head: headers,
			body: body,
			theme: 'grid',
			headStyles: {
				fillColor: this.colors.accent as any,
				textColor: 255,
				fontSize: 9,
			},
			styles: {
				fontSize: 8,
				cellPadding: 2,
				lineColor: [220, 220, 220],
				lineWidth: 0.1,
			},
		})
	}

	private drawPackagesList() {
		// Revert to portrait since packages don't need matrix
		this.doc.addPage('a4', 'portrait')
		this.doc.deletePage(1)

		this.doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' }) // Hack: re-init if package
		this.drawHeader()

		const headers = [
			['Código', 'Nombre del Paquete', 'Descripción / Detalle Base'],
		]
		const body = this.options.data.map((p) => [
			`PKG-${p.paquete_id}`,
			p.nombre_paquete || '',
			p.descripcion || '-',
		])

		autoTable(this.doc, {
			startY: 40,
			head: headers,
			body: body,
			theme: 'striped',
			headStyles: {
				fillColor: this.colors.secondary as any,
				textColor: 255,
				fontSize: 10,
			},
			styles: { fontSize: 9 },
			columnStyles: {
				0: { cellWidth: 25 },
				1: { cellWidth: 50 },
				2: { cellWidth: 'auto' },
			},
		})
	}

	private drawFooter() {
		const doc = this.doc
		const pageHeight = doc.internal.pageSize.getHeight()
		const pageWidth = doc.internal.pageSize.getWidth()

		doc.setFontSize(7)
		doc.setTextColor(120, 120, 120)

		const disclaimer =
			'IMPORTANTE: Tarifas confidenciales para uso exclusivo de agencias. Sujetas a modificación por fluctuación cambiaria y disponibilidad sin previo aviso.'
		doc.text(disclaimer, pageWidth / 2, pageHeight - 12, { align: 'center' })

		const dateStr = new Date().toLocaleString('es-ES')
		doc.text(`Generado: ${dateStr}`, 14, pageHeight - 8)
		doc.text('Sistema Turismo Sucre', pageWidth - 14, pageHeight - 8, {
			align: 'right',
		})
	}
}
