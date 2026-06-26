import type { QuoteWithClient, QuoteItemWithDetails } from '../QuoteService'
import { PriceCalculator } from '../domain/PriceCalculator'
import type { Tables } from '@/types/database.types'
import { parseISO } from '@/lib/date-utils'

export type EmailTemplateStyle = 'modern' | 'classic'

export class QuoteMessageGenerator {
	private quote: QuoteWithClient
	private items: QuoteItemWithDetails[]
	private bankAccount: Tables<'cuentas_bancarias'> | null
	private agencyConfig: Tables<'configuracion_sistema'> | null
	private logoUrl: string | null

	constructor(
		quote: QuoteWithClient,
		items: QuoteItemWithDetails[],
		bankAccount: Tables<'cuentas_bancarias'> | null = null,
		agencyConfig: Tables<'configuracion_sistema'> | null = null,
		logoUrl: string | null = null,
	) {
		this.quote = quote
		this.items = items
		this.bankAccount = bankAccount
		this.agencyConfig = agencyConfig
		this.logoUrl = logoUrl
	}

	private formatCurrency(amount: number, currency: string = 'USD'): string {
		return new Intl.NumberFormat('es-BO', {
			style: 'currency',
			currency: currency,
			minimumFractionDigits: 2,
		})
			.format(amount)
			.replace('BOB', 'Bs')
	}

	private formatDate(dateStr?: string | null): string {
		if (!dateStr) return '-'
		const date = parseISO(dateStr)
		if (!date) return '-'
		return date.toLocaleDateString('es-BO', {
			day: '2-digit',
			month: 'short',
			year: 'numeric',
		})
	}

	public generateHtml(introMessage: string = ''): string {
		const docTypeNameCap = this.quote.estado === 'Liquidated' ? 'Liquidación' : 'Cotización'
		const paxAdultos = this.quote.cantidad_pax || 1
		const paxNinos = this.quote.cantidad_pax_ninos || 0
		const pctNinos = this.quote.porcentaje_pago_ninos ?? 50
		const paxEfectivo = paxAdultos + (paxNinos * (pctNinos / 100))
		const currency = this.quote.moneda || 'USD'
		const summary = PriceCalculator.calculateSummary(this.items, {
			pax: paxAdultos,
			paxNinos,
			porcentajePagoNinos: pctNinos,
			taxPercent: this.quote.porcentaje_impuesto || 0,
			commPercent: this.quote.porcentaje_comision || 0,
			exchangeRate: this.quote.tipo_cambio || 0,
			tieneTourConductor: this.quote.tiene_tour_conductor || false,
			costoTourConductor: Number(this.quote.costo_tour_conductor) || 0,
		})

		const itemsHtml = this.items
			.map(
				(item) => `
      <tr>
        <td style="padding: 12px 8px; border-bottom: 1px solid #edf2f7; font-size: 14px;">${this.formatDate(item.fecha_servicio)}</td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #edf2f7; font-size: 14px;">
          <div style="font-weight: bold; color: #2d3748;">${item.descripcion_snapshot || item.servicios?.nombre || 'Servicio'}</div>
          <div style="font-size: 12px; color: #718096;">${item.servicios?.codigo || ''}</div>
        </td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #edf2f7; font-size: 14px; text-align: right; color: #4a5568;">
          ${this.formatCurrency(PriceCalculator.calculateItemTotal(item, paxEfectivo), currency)}
        </td>
      </tr>
    `,
			)
			.join('')

		return `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #2d3748; max-width: 700px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <!-- Header -->
        <div style="background-color: #1e40af; padding: 30px 20px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 1px;">${docTypeNameCap} de Viaje</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 14px;">Referencia: ${this.quote.codigo_referencia || `#${this.quote.cotizacion_id}`} | ${this.quote.nombre_grupo || 'Individual'}</p>
        </div>

        <div style="padding: 30px 25px;">
          <!-- Intro -->
          <div style="margin-bottom: 25px; line-height: 1.6;">
            ${introMessage ? `<div style="white-space: pre-wrap; margin-bottom: 20px;">${introMessage}</div>` : `<p>Estimado/a <strong>${this.quote.clientes?.nombre_completo || 'Cliente'}</strong>, es un placer saludarte. Adjuntamos el detalle de los servicios ${this.quote.estado === 'Liquidated' ? 'liquidados' : 'cotizados'}:</p>`}
          </div>

          <!-- Table -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
            <thead>
              <tr style="background-color: #f7fafc;">
                <th style="padding: 12px 8px; text-align: left; border-bottom: 2px solid #e2e8f0; font-size: 13px; color: #4a5568; text-transform: uppercase;">Fecha</th>
                <th style="padding: 12px 8px; text-align: left; border-bottom: 2px solid #e2e8f0; font-size: 13px; color: #4a5568; text-transform: uppercase;">Descripción</th>
                <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #e2e8f0; font-size: 13px; color: #4a5568; text-transform: uppercase;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <!-- Summary -->
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 6px; margin-left: auto; width: 300px;">
            ${
							this.quote.tiene_tour_conductor
								? `
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
                <span style="color: #718096;">Subtotal Servicios:</span>
                <span>${this.formatCurrency(summary.subtotalServicios ?? summary.subtotalNeto, currency)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
                <span style="color: #718096;">Tour Conductor (Fijo):</span>
                <span>${this.formatCurrency(summary.costoTourConductor ?? 0, currency)}</span>
              </div>
            `
								: ''
						}
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
              <span style="color: #718096; font-weight: ${this.quote.tiene_tour_conductor ? 'bold' : 'normal'};">Subtotal Neto:</span>
              <span style="font-weight: ${this.quote.tiene_tour_conductor ? 'bold' : 'normal'};">${this.formatCurrency(summary.subtotalNeto, currency)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
              <span style="color: #718096;">Impuestos (${this.quote.porcentaje_impuesto || 0}%):</span>
              <span>${this.formatCurrency(summary.taxAmount, currency)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
              <span style="color: #718096; font-weight: bold;">Subtotal:</span>
              <span style="font-weight: bold;">${this.formatCurrency(summary.totalBruto, currency)}</span>
            </div>
            ${
							this.quote.porcentaje_comision
								? `
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
                <span style="color: #718096;">Comisión (${this.quote.porcentaje_comision}%):</span>
                <span>${this.formatCurrency(summary.commAmount, currency)}</span>
              </div>
            `
								: ''
						}
            <div style="display: flex; justify-content: space-between; padding-top: 10px; border-top: 1px solid #e2e8f0; margin-top: 10px;">
              <strong style="color: #1e40af; font-size: 18px;">TOTAL:</strong>
              <strong style="color: #1e40af; font-size: 18px;">${this.formatCurrency(summary.totalFinal, currency)}</strong>
            </div>
          </div>

          <!-- Notes -->
          ${
						this.quote.notas_para_cliente
							? `
            <div style="margin-top: 30px; padding: 15px; border-left: 4px solid #3b82f6; background-color: #eff6ff; font-size: 14px;">
              <strong style="color: #1e40af; display: block; margin-bottom: 5px;">Notas Importantes:</strong>
              <div style="color: #1e3a8a; font-style: italic;">${this.quote.notas_para_cliente.replace(/\n/g, '<br>')}</div>
            </div>
          `
							: ''
					}

          <!-- Bank Info -->
          ${
						this.bankAccount
							? `
            <div style="margin-top: 30px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 13px;">
              <strong style="display: block; margin-bottom: 10px; color: #2d3748; text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px;">Instrucciones de Pago:</strong>
              <div style="color: #4a5568;">
                <strong>Banco:</strong> ${this.bankAccount.banco}<br>
                <strong>Cuenta:</strong> ${this.bankAccount.numero_cuenta} (${this.bankAccount.tipo_cuenta})<br>
                <strong>Titular:</strong> ${this.bankAccount.titular}<br>
                <strong>Moneda:</strong> ${this.bankAccount.moneda}
              </div>
            </div>
          `
							: ''
					}
        </div>

        <!-- Footer -->
        <div style="background-color: #f7fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #a0aec0;">
          <p style="margin: 0;"><strong>Turismo Sucre</strong> | Sucre, Bolivia</p>
        </div>
      </div>
    `
	}

	public generateClassicHtml(introMessage: string = ''): string {
		const docTypeNameCap = this.quote.estado === 'Liquidated' ? 'Liquidación' : 'Cotización'
		const paxAdultos = this.quote.cantidad_pax || 1
		const paxNinos = this.quote.cantidad_pax_ninos || 0
		const pctNinos = this.quote.porcentaje_pago_ninos ?? 50
		const paxEfectivo = paxAdultos + (paxNinos * (pctNinos / 100))
		const currency = this.quote.moneda || 'USD'
		const summary = PriceCalculator.calculateSummary(this.items, {
			pax: paxAdultos,
			paxNinos,
			porcentajePagoNinos: pctNinos,
			taxPercent: this.quote.porcentaje_impuesto || 0,
			commPercent: this.quote.porcentaje_comision || 0,
			exchangeRate: this.quote.tipo_cambio || 0,
			tieneTourConductor: this.quote.tiene_tour_conductor || false,
			costoTourConductor: Number(this.quote.costo_tour_conductor) || 0,
		})

		const sortedItems = [...this.items].sort((a, b) => {
			const dateA = a.fecha_servicio ? new Date(a.fecha_servicio).getTime() : 0
			const dateB = b.fecha_servicio ? new Date(b.fecha_servicio).getTime() : 0
			return dateA - dateB
		})

		const itemsHtml = sortedItems
			.map((item) => {
				let desc = item.descripcion_snapshot || ''
				if (item.servicios?.nombre) desc = item.servicios.nombre
				const code = item.servicios?.codigo || '-'
				const price = item.precio_unitario_snapshot || 0
				const rowTotal = PriceCalculator.calculateItemTotal(item, paxEfectivo)

				return `
        <tr>
          <td style="padding:8px 10px; border-bottom:1px solid #ddd; font-size:12px; color:#444;">${this.formatDate(item.fecha_servicio)}</td>
          <td style="padding:8px 10px; border-bottom:1px solid #ddd; font-size:12px; color:#2c3e50;">${desc}</td>
          <td style="padding:8px 10px; border-bottom:1px solid #ddd; font-size:12px; text-align:center; color:#444;">${code}</td>
          <td style="padding:8px 10px; border-bottom:1px solid #ddd; font-size:12px; text-align:right; color:#444;">${this.formatCurrency(price, currency)}</td>
          <td style="padding:8px 10px; border-bottom:1px solid #ddd; font-size:12px; text-align:right; color:#2c3e50;">${this.formatCurrency(rowTotal, currency)}</td>
        </tr>`
			})
			.join('')

		// Financial summary rows
		const taxPercent = this.quote.porcentaje_impuesto || 0
		const commPercent = this.quote.porcentaje_comision || 0
		const exchangeRate = this.quote.tipo_cambio || 0

		const summaryRows = `
      ${
				this.quote.tiene_tour_conductor
					? `<tr>
        <td style="padding:4px 10px; font-size:12px; text-align:right;">Subtotal Servicios:</td>
        <td style="padding:4px 10px; font-size:12px; text-align:right;">${this.formatCurrency(summary.subtotalServicios ?? summary.subtotalNeto, currency)}</td>
      </tr>
      <tr>
        <td style="padding:4px 10px; font-size:12px; text-align:right;">Tour Conductor (Fijo):</td>
        <td style="padding:4px 10px; font-size:12px; text-align:right;">${this.formatCurrency(summary.costoTourConductor ?? 0, currency)}</td>
      </tr>`
					: ''
			}
      <tr>
        <td style="padding:4px 10px; font-size:12px; text-align:right; font-weight:${this.quote.tiene_tour_conductor ? 'bold' : 'normal'};">Subtotal Neto:</td>
        <td style="padding:4px 10px; font-size:12px; text-align:right; font-weight:${this.quote.tiene_tour_conductor ? 'bold' : 'normal'};">${this.formatCurrency(summary.subtotalNeto, currency)}</td>
      </tr>
      ${
				taxPercent > 0
					? `<tr>
        <td style="padding:4px 10px; font-size:12px; text-align:right;">Impuestos (${taxPercent}%):</td>
        <td style="padding:4px 10px; font-size:12px; text-align:right;">${this.formatCurrency(summary.taxAmount, currency)}</td>
      </tr>`
					: ''
			}
      <tr>
        <td style="padding:4px 10px; font-size:12px; text-align:right; font-weight:bold; border-top:1px solid #ccc;">Total Bruto:</td>
        <td style="padding:4px 10px; font-size:12px; text-align:right; font-weight:bold; border-top:1px solid #ccc;">${this.formatCurrency(summary.totalBruto, currency)}</td>
      </tr>
      ${
				commPercent > 0
					? `<tr>
        <td style="padding:4px 10px; font-size:12px; text-align:right; color:#c0392b; font-weight:bold;">Comisión (${commPercent}%):</td>
        <td style="padding:4px 10px; font-size:12px; text-align:right; color:#c0392b; font-weight:bold;">- ${this.formatCurrency(summary.commAmount, currency)}</td>
      </tr>`
					: ''
			}
      <tr>
        <td style="padding:6px 10px; font-size:14px; text-align:right; font-weight:bold; color:#2980b9; border-top:2px solid #2980b9; border-bottom:2px solid #2980b9;">TOTAL:</td>
        <td style="padding:6px 10px; font-size:14px; text-align:right; font-weight:bold; color:#2980b9; border-top:2px solid #2980b9; border-bottom:2px solid #2980b9;">${this.formatCurrency(summary.totalFinal, currency)}</td>
      </tr>
      ${
				currency === 'USD' && summary.totalFinalBOB
					? `<tr>
        <td style="padding:3px 10px; font-size:11px; text-align:right; color:#888;">T/C: ${exchangeRate.toFixed(2)}</td>
        <td style="padding:3px 10px; font-size:11px; text-align:right; color:#888;">(${this.formatCurrency(summary.totalFinalBOB, 'BOB')})</td>
      </tr>`
					: ''
			}
    `

		return `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #2c3e50; max-width: 700px; margin: 0 auto;">
        <!-- Company Header: Logo | Info | Ref (3-column like PDF) -->
        <table style="width: 100%; border-bottom: 2px solid #2980b9; margin-bottom: 12px; padding-bottom: 8px;">
          <tr>
            <td style="width: 25%; vertical-align: middle; padding: 5px;">
              ${this.logoUrl ? `<img src="${this.logoUrl}" alt="Logo" style="max-width: 150px; max-height: 100px;" />` : `<div style="font-size: 18px; font-weight: bold; color: #2980b9;">${this.agencyConfig?.empresa_nombre || 'Turismo Sucre'}</div>`}
            </td>
            <td style="width: 50%; text-align: center; vertical-align: middle; padding: 5px;">
              <div style="font-size: 14px; font-weight: bold; color: #2c3e50;">"${this.agencyConfig?.empresa_nombre || 'Turismo Sucre Ltda.'}"</div>
              <div style="font-size: 12px; color: #555;">${this.agencyConfig?.empresa_descripcion || 'Operadora de Turismo'}</div>
              <div style="font-size: 10px; color: #888; margin-top: 3px;">Calle: ${this.agencyConfig?.empresa_direccion || 'Dalence #349'}</div>
              <div style="font-size: 10px; color: #888;">Telf. ${this.agencyConfig?.empresa_telefonos || '75441733'}${this.agencyConfig?.empresa_fax ? ` | Fax ${this.agencyConfig.empresa_fax}` : ''}</div>
              <div style="font-size: 10px; color: #888;">Celular ${this.agencyConfig?.empresa_celular || '75441733'}  ${this.agencyConfig?.empresa_correo || 'reserva@turismosucre.com.bo'}</div>
              <div style="font-size: 10px; color: #888;">${this.agencyConfig?.empresa_ciudad || 'Sucre'} - ${this.agencyConfig?.empresa_pais || 'Bolivia'}</div>
            </td>
            <td style="width: 25%; text-align: right; vertical-align: middle; padding: 5px;">
              <div style="font-size: 11px; color: #555;">Ref:</div>
              <div style="font-size: 16px; font-weight: bold; color: #2c3e50;">${this.quote.codigo_referencia || `Nº ${this.quote.cotizacion_id}`}</div>
              <div style="font-size: 10px; color: #888; margin-top: 4px;">Fecha: ${this.formatDate(this.quote.fecha_creacion)}</div>
            </td>
          </tr>
        </table>

        <!-- Client Info -->
        <div style="margin-bottom: 15px;">
          <div style="text-align: center;">
          <h1 style="margin: 0; font-size: 24px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">${docTypeNameCap}</h1>
          </div>
          <div style="font-size: 13px; font-weight: bold; color: #2980b9; text-decoration: underline; margin-bottom: 8px;">INFORMACIÓN DEL CLIENTE</div>
          <table style="width: 100%; font-size: 12px;">
            <tr>
              <td style="padding: 2px 0;"><strong>Cliente:</strong> ${this.quote.clientes?.nombre_completo || 'Cliente General'}</td>
              <td style="padding: 2px 0;"><strong>Grupo:</strong> ${this.quote.nombre_grupo || '-'}</td>
            </tr>
            <tr>
              <td style="padding: 2px 0;"><strong>Email:</strong> ${this.quote.clientes?.email || '-'}</td>
              <td style="padding: 2px 0;"><strong>Pasajeros:</strong> ${paxAdultos}${paxNinos > 0 ? ` Ad. + ${paxNinos} Niñ. (${pctNinos}%)` : ''}</td>
            </tr>
            <tr>
              <td style="padding: 2px 0;"></td>
              <td style="padding: 2px 0;"><strong>Moneda:</strong> ${currency}</td>
            </tr>
          </table>
        </div>

        <!-- Intro Message -->
        ${introMessage ? `<div style="margin-bottom: 15px; font-size: 13px; line-height: 1.5; white-space: pre-wrap;">${introMessage}</div>` : ''}

        <!-- Services Table -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
          <thead>
            <tr style="background-color: #2980b9;">
              <th style="padding: 8px 10px; color: white; font-size: 11px; text-align: left; font-weight: 600;">Fecha</th>
              <th style="padding: 8px 10px; color: white; font-size: 11px; text-align: left; font-weight: 600;">Descripción</th>
              <th style="padding: 8px 10px; color: white; font-size: 11px; text-align: center; font-weight: 600;">Código</th>
              <th style="padding: 8px 10px; color: white; font-size: 11px; text-align: right; font-weight: 600;">Precio Unit.</th>
              <th style="padding: 8px 10px; color: white; font-size: 11px; text-align: right; font-weight: 600;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <!-- Financial Summary (right-aligned) -->
        <table style="margin-left: auto; border-collapse: collapse; margin-bottom: 20px;">
          <tbody>
            ${summaryRows}
          </tbody>
        </table>

        <!-- Notes -->
        ${
					this.quote.notas_para_cliente
						? `
          <div style="margin-bottom: 15px; font-size: 12px;">
            <strong>Notas:</strong><br>
            <span style="color: #555; font-style: italic;">${this.quote.notas_para_cliente.replace(/\n/g, '<br>')}</span>
          </div>
        `
						: ''
				}

        <!-- Bank Info -->
        ${
					this.bankAccount
						? `
          <div style="margin-bottom: 15px; font-size: 12px; border-top: 1px solid #ddd; padding-top: 10px;">
            <strong>DATOS BANCARIOS:</strong><br>
            <span style="color: #444;">Banco: ${this.bankAccount.banco}<br>
            Cuenta (${this.bankAccount.moneda}): ${this.bankAccount.numero_cuenta}<br>
            Titular: ${this.bankAccount.titular}<br>
            ${this.bankAccount.tipo_cuenta ? `Tipo: ${this.bankAccount.tipo_cuenta}` : ''}</span>
          </div>
        `
						: ''
				}

        <!-- Footer -->
        <div style="font-size: 10px; color: #aaa; text-align: center; border-top: 1px solid #ddd; padding-top: 8px;">
          ${this.quote.estado !== 'Liquidated' ? '<p style="margin: 0;">Esta cotización está sujeta a disponibilidad y cambios sin previo aviso.</p>' : ''}
        </div>
      </div>
    `
	}

	/** Dispatcher: generates HTML based on selected template style */
	public generate(
		style: EmailTemplateStyle,
		introMessage: string = '',
	): string {
		if (style === 'classic') return this.generateClassicHtml(introMessage)
		return this.generateHtml(introMessage)
	}
}
