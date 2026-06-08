import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { QuoteWithClient, QuoteItemWithDetails } from '../QuoteService'
import { PriceCalculator } from '../domain/PriceCalculator'
import type { Tables } from '@/types/database.types'

interface PdfGeneratorOptions {
	quote: QuoteWithClient
	items: QuoteItemWithDetails[]
	bankAccount?: Tables<'cuentas_bancarias'> | null
	logoUrl?: string // Base64 image
	agencyConfig?: Tables<'configuracion_sistema'> | null
}

export class QuotePdfGenerator {
	private doc: jsPDF
	private quote: QuoteWithClient
	private items: QuoteItemWithDetails[]
	private bankAccount?: Tables<'cuentas_bancarias'> | null
	private agencyConfig?: Tables<'configuracion_sistema'> | null
	private logoUrl?: string

	// Colors (Turismo Sucre Branding Palette - hypothetical)
	private colors = {
		primary: [41, 128, 185] as [number, number, number],
		secondary: [127, 140, 141] as [number, number, number],
		accent: [230, 126, 34] as [number, number, number],
		text: [44, 62, 80] as [number, number, number],
		lightGrey: [245, 245, 245] as [number, number, number],
	}

	constructor(options: PdfGeneratorOptions) {
		this.quote = options.quote
		this.items = options.items
		this.bankAccount = options.bankAccount
		this.agencyConfig = options.agencyConfig
		this.logoUrl = options.logoUrl

		// A4 Portrait
		this.doc = new jsPDF({
			orientation: 'portrait',
			unit: 'mm',
			format: 'a4',
		})
	}

	public generate() {
		this.drawHeader()
		this.drawClientInfo()
		this.drawItineraryTable()
		this.drawFinancialSummary()
		this.drawFooter()

		// Draw watermark LAST and with transparency to be on top of everything
		this.drawWatermark()

		// Save
		const refName = this.quote.codigo_referencia || `ID-${this.quote.cotizacion_id}`
		const filename = `Cotizacion-${refName}-${this.quote.clientes?.nombre_completo || 'Cliente'}.pdf`
		this.doc.save(filename)
	}

	private formatCurrency(amount: number, currency: string = 'USD'): string {
		return new Intl.NumberFormat('es-BO', {
			style: 'currency',
			currency: currency,
			minimumFractionDigits: 2,
		})
			.format(amount)
			.replace('BOB', 'Bs') // Ensure consistency
	}

	private formatDate(dateStr?: string | null): string {
		if (!dateStr) return '-'

		// Split YYYY-MM-DD to avoid timezone shifts
		const parts = dateStr.split('-')
		if (parts.length !== 3) return dateStr

		const yearStr = parts[0] || '0'
		const monthStr = parts[1] || '0'
		const dayStr = parts[2] || '0'

		const year = parseInt(yearStr)
		const month = parseInt(monthStr) - 1 // JS months are 0-indexed
		const day = parseInt(dayStr)

		const date = new Date(year, month, day)

		return date.toLocaleDateString('es-ES', {
			day: '2-digit',
			month: 'short',
			year: 'numeric',
		})
	}

	private drawWatermark() {
		if (this.quote.estado === 'Approved') return

		const doc = this.doc
		const text = 'BORRADOR'

		// Use low opacity for watermark
		doc.saveGraphicsState()
		// @ts-ignore - setGState exists in standard jsPDF but types might be tricky
		doc.setGState(new doc.GState({ opacity: 0.15 }))

		doc.setTextColor(150, 150, 150)
		doc.setFontSize(100)
		doc.setFont('helvetica', 'bold')

		const pageWidth = doc.internal.pageSize.getWidth()
		const pageHeight = doc.internal.pageSize.getHeight()

		// Approximate text height in mm for dynamically set font size
		// jsPDF points to mm scale is 0.352777
		const fontSize = doc.getFontSize()
		const textWidth = doc.getTextWidth(text)
		const textHeight = fontSize * 0.352777

		const angleRad = (45 * Math.PI) / 180
		const cosA = Math.cos(angleRad)
		const sinA = Math.sin(angleRad)

		const cx = pageWidth / 2
		const cy = pageHeight / 2

		// Mathematical origin coordinates for rotated text bounding box to ensure perfect center
		const x = cx - (textWidth / 2) * cosA + (textHeight / 2) * sinA
		const y = cy + (textWidth / 2) * sinA + (textHeight / 2) * cosA

		// Draw perfectly centered across the page
		doc.text(text, x, y, {
			angle: 45,
		})

		doc.restoreGraphicsState()
	}

	private drawHeader() {
		const doc = this.doc
		const pageWidth = doc.internal.pageSize.getWidth()

		// Draw Logo (Left side)
		const leftMargin = 14
		if (this.logoUrl) {
			try {
				doc.addImage(this.logoUrl, 'PNG', leftMargin, 10, 45, 30, '', 'FAST')
			} catch (e) {
				console.error('Failed to draw logo', e)
			}
		} else {
			doc.setFontSize(22)
			doc.setTextColor(
				this.colors.primary[0],
				this.colors.primary[1],
				this.colors.primary[2],
			)
			doc.text('TURISMO SUCRE', leftMargin, 20)
		}

		// Center Configuration
		const centerX = pageWidth / 2
		doc.setFontSize(12)
		doc.setFont('helvetica', 'bold')
		doc.setTextColor(
			this.colors.text[0],
			this.colors.text[1],
			this.colors.text[2],
		)

		// Line 1: Company Name
		const name = this.agencyConfig?.empresa_nombre || 'Turismo Sucre Ltda.'
		doc.text(`"${name}"`, centerX, 15, { align: 'center' })

		doc.setFont('helvetica', 'normal')
		doc.setFontSize(10)

		// Line 2: Description
		const desc =
			this.agencyConfig?.empresa_descripcion || 'Operadora de Turismo'
		doc.text(desc, centerX, 21, { align: 'center' })

		doc.setFontSize(8)
		doc.setTextColor(100, 100, 100)

		// Line 3: Address
		const address = this.agencyConfig?.empresa_direccion || 'Calle Dalence #349'
		doc.text(`Calle: ${address}`, centerX, 26, { align: 'center' })

		// Line 4: Tels + Fax
		const tels = this.agencyConfig?.empresa_telefonos || '64 60349'
		const fax = this.agencyConfig?.empresa_fax
			? `   Fax ${this.agencyConfig.empresa_fax}`
			: ''
		doc.text(`Telf. ${tels}${fax}`, centerX, 30, { align: 'center' })

		// Line 5: Cel + Email
		const cel = this.agencyConfig?.empresa_celular || '77137775'
		const email =
			this.agencyConfig?.empresa_correo || 'reservas@turismosucre.com.bo'
		doc.text(`Celular ${cel}   ${email}`, centerX, 34, { align: 'center' })

		// Line 6: City - Country
		const city = this.agencyConfig?.empresa_ciudad || 'Sucre'
		const country = this.agencyConfig?.empresa_pais || 'Bolivia'
		doc.text(`${city} - ${country}`, centerX, 38, { align: 'center' })

		// Right Side: Ref No & Dates
		doc.setFontSize(10)
		doc.setTextColor(
			this.colors.text[0],
			this.colors.text[1],
			this.colors.text[2],
		)

		const rightMargin = 14
		const startX = pageWidth - rightMargin

		doc.text('Ref:', startX - 7, 20)
		doc.setFont('helvetica', 'bold')
		doc.text(this.quote.codigo_referencia || `Nº ${this.quote.cotizacion_id}`, startX, 26, { align: 'right' })

		doc.setFont('helvetica', 'normal')
		doc.setFontSize(8)
		doc.text(
			`Fecha: ${this.formatDate(this.quote.fecha_creacion)}`,
			startX,
			34,
			{ align: 'right' },
		)
		if (this.quote.fecha_validez_hasta) {
			doc.setTextColor(192, 57, 43) // Red for expiry
			doc.text(
				`Vence: ${this.formatDate(this.quote.fecha_validez_hasta)}`,
				startX,
				38,
				{ align: 'right' },
			)
		}

		// Divider
		doc.setDrawColor(200, 200, 200)
		doc.line(14, 42, pageWidth - 14, 42)
	}

	private drawClientInfo() {
		const doc = this.doc
		const startY = 52

		doc.setFontSize(12)
		doc.setTextColor(
			this.colors.primary[0],
			this.colors.primary[1],
			this.colors.primary[2],
		)
		doc.text('INFORMACIÓN DEL CLIENTE', 14, startY)

		doc.setFontSize(10)
		doc.setTextColor(
			this.colors.text[0],
			this.colors.text[1],
			this.colors.text[2],
		)

		const clientName = this.quote.clientes?.nombre_completo || 'Cliente General'
		const company = this.quote.clientes?.empresa || ''
		const email = this.quote.clientes?.email || ''
		const groupName = this.quote.nombre_grupo || '-'
		const pax = this.quote.cantidad_pax || 1
		const paxNinos = this.quote.cantidad_pax_ninos || 0
		const pctNinos = this.quote.porcentaje_pago_ninos ?? 50

		// Left Column
		doc.text(`Cliente: ${clientName}`, 14, startY + 8)
		if (company) doc.text(`Empresa: ${company}`, 14, startY + 14)
		doc.text(`Email: ${email}`, 14, startY + 20)

		// Right Column
		const col2X = 110
		doc.text(`Grupo: ${groupName}`, col2X, startY + 8)
		if (paxNinos > 0) {
			doc.text(`Pasajeros: ${pax} Ad. + ${paxNinos} Niñ. (${pctNinos}%)`, col2X, startY + 14)
		} else {
			doc.text(`Pasajeros: ${pax}`, col2X, startY + 14)
		}
		doc.text(`Moneda: ${this.quote.moneda}`, col2X, startY + 20)
	}

	private drawItineraryTable() {
		// Determine headers and data
		const headers = [
			['Fecha', 'Descripción', 'Código', 'Precio Unit.', 'Subtotal'],
		]
		const paxAdultos = this.quote.cantidad_pax || 1
		const paxNinos = this.quote.cantidad_pax_ninos || 0
		const pctNinos = this.quote.porcentaje_pago_ninos ?? 50
		const paxEfectivo = paxAdultos + (paxNinos * (pctNinos / 100))

		// Sort items by date
		const sortedItems = [...this.items].sort((a, b) => {
			const dateA = a.fecha_servicio ? new Date(a.fecha_servicio).getTime() : 0
			const dateB = b.fecha_servicio ? new Date(b.fecha_servicio).getTime() : 0
			return dateA - dateB
		})

		const body = sortedItems.map((item) => {
			// Build Description
			let desc = item.descripcion_snapshot || ''
			if (item.servicios?.nombre) desc = item.servicios.nombre
			else if (item.tiposhabitacion)
				desc = `${item.tiposhabitacion.hoteles?.nombre} - ${item.tiposhabitacion.tipo}`
			else if (item.paquetes?.nombre_paquete)
				desc = item.paquetes.nombre_paquete

			// Add manual description override if different
			if (item.descripcion_snapshot && item.descripcion_snapshot !== desc) {
				desc = `${desc} \n(${item.descripcion_snapshot})`
			}

			// Calculations using Domain Logic
			const price = item.precio_unitario_snapshot || 0
			const rowTotal = PriceCalculator.calculateItemTotal(item, paxEfectivo)

			return [
				this.formatDate(item.fecha_servicio),
				desc,
				item.servicios?.codigo || '-',
				this.formatCurrency(price, this.quote.moneda || 'USD'),
				this.formatCurrency(rowTotal, this.quote.moneda || 'USD'),
			]
		})

		autoTable(this.doc, {
			startY: 82,
			head: headers,
			body: body,
			theme: 'grid',
			headStyles: {
				fillColor: this.colors.primary as any,
				textColor: 255,
				fontSize: 10,
				fontStyle: 'bold',
			},
			styles: {
				fontSize: 9,
				cellPadding: 3,
			},
			columnStyles: {
				0: { cellWidth: 25 }, // Fecha
				1: { cellWidth: 'auto' }, // Descripcion
				2: { cellWidth: 20 }, // Código
				3: { cellWidth: 28, halign: 'right' }, // Precio Unit.
				4: { cellWidth: 28, halign: 'right' }, // Subtotal
			},
			alternateRowStyles: {
				fillColor: this.colors.lightGrey as any,
			},
		})
	}

	private drawFinancialSummary() {
		const doc = this.doc
		// @ts-ignore
		const finalY = doc.lastAutoTable.finalY + 10
		const pageWidth = doc.internal.pageSize.getWidth()
		const xPos = pageWidth - 80 // Start position for the summary block

		// Calculations using Domain Logic
		const summary = PriceCalculator.calculateSummary(this.items, {
			pax: this.quote.cantidad_pax || 1,
			paxNinos: this.quote.cantidad_pax_ninos || 0,
			porcentajePagoNinos: this.quote.porcentaje_pago_ninos ?? 50,
			taxPercent: this.quote.porcentaje_impuesto || 0,
			commPercent: this.quote.porcentaje_comision || 0,
			exchangeRate: this.quote.tipo_cambio || undefined,
			tieneTourConductor: this.quote.tiene_tour_conductor || false,
			costoTourConductor: Number(this.quote.costo_tour_conductor) || 0,
		})

		const {
			subtotalNeto,
			subtotalServicios = subtotalNeto,
			costoTourConductor = 0,
			taxAmount,
			totalBruto,
			commAmount,
			totalFinal,
			totalFinalBOB,
		} = summary
		const taxPercent = this.quote.porcentaje_impuesto || 0
		const commPercent = this.quote.porcentaje_comision || 0
		const currency = this.quote.moneda || 'USD'
		const exchangeRate = this.quote.tipo_cambio || 0

		// Calculate height dynamically
		let boxHeight = 45
		if (this.quote.tiene_tour_conductor) boxHeight += 12
		if (commPercent > 0) boxHeight += 6
		if (currency === 'USD' && totalFinalBOB) boxHeight += 6

		// Draw Box
		doc.setDrawColor(200, 200, 200)
		doc.setFillColor(250, 250, 250)
		doc.rect(xPos - 5, finalY - 5, 75, boxHeight, 'F')

		doc.setFontSize(10)

		// Helper for lines
		const drawLine = (
			label: string,
			value: string,
			y: number,
			isBold: boolean = false,
		) => {
			doc.setFont('helvetica', isBold ? 'bold' : 'normal')
			doc.setTextColor(
				this.colors.text[0],
				this.colors.text[1],
				this.colors.text[2],
			)
			doc.text(label, xPos, y)
			doc.text(value, pageWidth - 14, y, { align: 'right' })
		}

		let currentY = finalY

		if (this.quote.tiene_tour_conductor) {
			drawLine(
				'Subtotal Servicios:',
				this.formatCurrency(subtotalServicios, currency),
				currentY,
			)
			currentY += 6
			drawLine(
				'Tour Conductor (Fijo):',
				this.formatCurrency(costoTourConductor, currency),
				currentY,
			)
			currentY += 6
		}

		drawLine(
			'Subtotal Neto:',
			this.formatCurrency(subtotalNeto, currency),
			currentY,
			this.quote.tiene_tour_conductor
		)

		currentY += 6
		drawLine(
			`Impuestos (${taxPercent}%):`,
			this.formatCurrency(taxAmount, currency),
			currentY,
		)

		currentY += 6
		doc.setDrawColor(200, 200, 200)
		doc.line(xPos, currentY - 3, pageWidth - 14, currentY - 3)
		drawLine(
			'Total Bruto:',
			this.formatCurrency(totalBruto, currency),
			currentY,
			true,
		)

		if (commPercent > 0) {
			currentY += 6
			doc.setTextColor(192, 57, 43) // Red for deduction
			doc.text(`Comisión (${commPercent}%):`, xPos, currentY)
			doc.text(
				`- ${this.formatCurrency(commAmount, currency)}`,
				pageWidth - 14,
				currentY,
				{ align: 'right' },
			)
		}

		currentY += 8
		doc.setDrawColor(0, 0, 0)
		doc.line(xPos, currentY - 4, pageWidth - 14, currentY - 4)

		// Final Total
		doc.setFontSize(12)
		doc.setFont('helvetica', 'bold')
		doc.setTextColor(
			this.colors.primary[0],
			this.colors.primary[1],
			this.colors.primary[2],
		)
		doc.text('TOTAL:', xPos, currentY)
		doc.text(
			this.formatCurrency(totalFinal, currency),
			pageWidth - 14,
			currentY,
			{ align: 'right' },
		)

		// Total in BOB and Exchange Rate
		if (currency === 'USD' && totalFinalBOB) {
			currentY += 6
			doc.setFontSize(9)
			doc.setFont('helvetica', 'normal')
			doc.setTextColor(100, 100, 100)

			// Show T/C
			doc.text(`T/C: ${exchangeRate.toFixed(2)}`, xPos, currentY)

			// Show converted total without duplicate prefix
			const bobValue = this.formatCurrency(totalFinalBOB, 'BOB')
			doc.text(`(${bobValue})`, pageWidth - 14, currentY, { align: 'right' })
		}
	}

	private drawFooter() {
		const doc = this.doc
		const pageHeight = doc.internal.pageSize.getHeight()
		const pageWidth = doc.internal.pageSize.getWidth()
		let currentY = pageHeight - 50

		doc.setFontSize(9)
		doc.setTextColor(
			this.colors.text[0],
			this.colors.text[1],
			this.colors.text[2],
		)

		// Bank Account Info
		if (this.bankAccount) {
			doc.setFont('helvetica', 'bold')
			doc.text('DATOS BANCARIOS:', 14, currentY)
			doc.setFont('helvetica', 'normal')
			currentY += 5
			doc.text(`Banco: ${this.bankAccount.banco}`, 14, currentY)
			currentY += 4
			doc.text(
				`Cuenta (${this.bankAccount.moneda}): ${this.bankAccount.numero_cuenta}`,
				14,
				currentY,
			)
			currentY += 4
			doc.text(`Titular: ${this.bankAccount.titular}`, 14, currentY)
			if (this.bankAccount.tipo_cuenta) {
				currentY += 4
				doc.text(`Tipo: ${this.bankAccount.tipo_cuenta}`, 14, currentY)
			}
		} else {
			doc.text(
				'Por favor contacte a su agente para detalles de pago.',
				14,
				currentY,
			)
		}

		// Disclaimer / Signature
		currentY = pageHeight - 15
		doc.setFontSize(8)
		doc.setTextColor(150, 150, 150)
		doc.text(
			'Esta cotización está sujeta a disponibilidad y cambios sin previo aviso.',
			14,
			currentY,
		)
		doc.text('Generado por Sistema Turismo Sucre', pageWidth - 14, currentY, {
			align: 'right',
		})
	}
}
