import type { QuoteWithClient, QuoteItemWithDetails } from '../QuoteService'
import { PriceCalculator } from '../domain/PriceCalculator'
import type { Tables } from '@/types/database.types'

export class QuoteMessageGenerator {
  private quote: QuoteWithClient
  private items: QuoteItemWithDetails[]
  private bankAccount: Tables<'cuentas_bancarias'> | null

  constructor(quote: QuoteWithClient, items: QuoteItemWithDetails[], bankAccount: Tables<'cuentas_bancarias'> | null = null) {
    this.quote = quote
    this.items = items
    this.bankAccount = bankAccount
  }

  private formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount).replace('BOB', 'Bs')
  }

  private formatDate(dateStr?: string | null): string {
    if (!dateStr) return '-'
    const parts = dateStr.split('-')
    if (parts.length !== 3) return dateStr
    
    const year = parseInt(parts[0] || '0')
    const month = parseInt(parts[1] || '0') - 1
    const day = parseInt(parts[2] || '0')
    
    const date = new Date(year, month, day)
    return date.toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  public generateHtml(introMessage: string = ''): string {
    const pax = this.quote.cantidad_pax || 1
    const currency = this.quote.moneda || 'USD'
    const summary = PriceCalculator.calculateSummary(this.items, {
      pax,
      taxPercent: this.quote.porcentaje_impuesto || 0,
      commPercent: this.quote.porcentaje_comision || 0,
      exchangeRate: this.quote.tipo_cambio || 0,
    })

    const itemsHtml = this.items.map(item => `
      <tr>
        <td style="padding: 12px 8px; border-bottom: 1px solid #edf2f7; font-size: 14px;">${this.formatDate(item.fecha_servicio)}</td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #edf2f7; font-size: 14px;">
          <div style="font-weight: bold; color: #2d3748;">${item.descripcion_snapshot || item.servicios?.nombre || 'Servicio'}</div>
          <div style="font-size: 12px; color: #718096;">${item.servicios?.codigo || ''}</div>
        </td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #edf2f7; font-size: 14px; text-align: center;">${item.cantidad}</td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #edf2f7; font-size: 14px; text-align: right; color: #4a5568;">
          ${this.formatCurrency(PriceCalculator.calculateItemTotal(item, pax), currency)}
        </td>
      </tr>
    `).join('')

    return `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #2d3748; max-width: 700px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <!-- Header -->
        <div style="background-color: #1e40af; padding: 30px 20px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 1px;">Cotización de Viaje</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 14px;">Referencia: #${this.quote.cotizacion_id} | ${this.quote.nombre_grupo || 'Individual'}</p>
        </div>

        <div style="padding: 30px 25px;">
          <!-- Intro -->
          <div style="margin-bottom: 25px; line-height: 1.6;">
            ${introMessage ? `<div style="white-space: pre-wrap; margin-bottom: 20px;">${introMessage}</div>` : `<p>Estimado/a <strong>${this.quote.clientes?.nombre_completo || 'Cliente'}</strong>, es un placer saludarte. Adjuntamos el detalle de los servicios cotizados:</p>`}
          </div>

          <!-- Table -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
            <thead>
              <tr style="background-color: #f7fafc;">
                <th style="padding: 12px 8px; text-align: left; border-bottom: 2px solid #e2e8f0; font-size: 13px; color: #4a5568; text-transform: uppercase;">Fecha</th>
                <th style="padding: 12px 8px; text-align: left; border-bottom: 2px solid #e2e8f0; font-size: 13px; color: #4a5568; text-transform: uppercase;">Descripción</th>
                <th style="padding: 12px 8px; text-align: center; border-bottom: 2px solid #e2e8f0; font-size: 13px; color: #4a5568; text-transform: uppercase;">Cant.</th>
                <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #e2e8f0; font-size: 13px; color: #4a5568; text-transform: uppercase;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <!-- Summary -->
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 6px; margin-left: auto; width: 300px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
              <span style="color: #718096;">Subtotal:</span>
              <span>${this.formatCurrency(summary.totalBruto, currency)}</span>
            </div>
            ${this.quote.porcentaje_comision ? `
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
                <span style="color: #718096;">Comisión (${this.quote.porcentaje_comision}%):</span>
                <span>${this.formatCurrency(summary.commAmount, currency)}</span>
              </div>
            ` : ''}
            <div style="display: flex; justify-content: space-between; padding-top: 10px; border-top: 1px solid #e2e8f0; margin-top: 10px;">
              <strong style="color: #1e40af; font-size: 18px;">TOTAL:</strong>
              <strong style="color: #1e40af; font-size: 18px;">${this.formatCurrency(summary.totalFinal, currency)}</strong>
            </div>
          </div>

          <!-- Notes -->
          ${this.quote.notas_para_cliente ? `
            <div style="margin-top: 30px; padding: 15px; border-left: 4px solid #3b82f6; background-color: #eff6ff; font-size: 14px;">
              <strong style="color: #1e40af; display: block; margin-bottom: 5px;">Notas Importantes:</strong>
              <div style="color: #1e3a8a; font-style: italic;">${this.quote.notas_para_cliente.replace(/\n/g, '<br>')}</div>
            </div>
          ` : ''}

          <!-- Bank Info -->
          ${this.bankAccount ? `
            <div style="margin-top: 30px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 13px;">
              <strong style="display: block; margin-bottom: 10px; color: #2d3748; text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px;">Instrucciones de Pago:</strong>
              <div style="color: #4a5568;">
                <strong>Banco:</strong> ${this.bankAccount.banco}<br>
                <strong>Cuenta:</strong> ${this.bankAccount.numero_cuenta} (${this.bankAccount.tipo_cuenta})<br>
                <strong>Titular:</strong> ${this.bankAccount.titular}<br>
                <strong>Moneda:</strong> ${this.bankAccount.moneda}
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Footer -->
        <div style="background-color: #f7fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #a0aec0;">
          <p style="margin: 0 0 5px 0;">Esta cotización es válida hasta el ${this.formatDate(this.quote.fecha_validez_hasta)}</p>
          <p style="margin: 0;"><strong>Turismo Sucre</strong> | Sucre, Bolivia</p>
        </div>
      </div>
    `
  }
}
