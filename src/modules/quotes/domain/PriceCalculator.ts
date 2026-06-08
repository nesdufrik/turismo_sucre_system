export interface QuoteFinancialSettings {
  pax: number
  paxNinos?: number
  porcentajePagoNinos?: number
  taxPercent: number
  commPercent: number
  exchangeRate?: number
  tieneTourConductor?: boolean
  costoTourConductor?: number
}

export interface QuoteCalculatableItem {
  precio_unitario_snapshot: number | null
  cantidad: number | null
  es_por_pax: boolean | null
  aplica_comision?: boolean | null // Added new column
}

export interface QuoteFinancialSummary {
  subtotalNeto: number
  subtotalServicios?: number
  costoTourConductor?: number
  taxAmount: number
  totalBruto: number
  commAmount: number
  totalFinal: number
  totalFinalBOB?: number
}

/**
 * PriceCalculator handles the business logic for calculating quote totals.
 * This ensures consistency across the Service, UI, and PDF generation.
 */
export const PriceCalculator = {
  /**
   * Calculates the total for a single quote item.
   * Logic: (Unit Price * Quantity) * (if per_pax ? total_pax : 1)
   */
  calculateItemTotal(item: QuoteCalculatableItem, pax: number): number {
    const price = item.precio_unitario_snapshot || 0
    const qty = item.cantidad || 1
    // For now, we assume all items are priced per PAX.
    // In the future, we can respect item.es_por_pax
    const isPerPax = true 
    
    return isPerPax ? price * pax * qty : price * qty
  },

  /**
   * Calculates the full financial summary for a set of items and settings.
   * Sequence: 
   * 1. Subtotal Neto (Sum of all item totals)
   * 2. Tax Amount (Subtotal Neto * Tax%)
   * 3. Total Bruto (Subtotal Neto + Tax Amount)
   * 4. Commission Amount (Sum of Bruto of Commissionable Items * Comm%)
   * 5. Total Final (Total Bruto - Commission Amount)
   */
  calculateSummary(items: QuoteCalculatableItem[], settings: QuoteFinancialSettings): QuoteFinancialSummary {
    const { 
      pax, 
      paxNinos = 0, 
      porcentajePagoNinos = 50, 
      taxPercent, 
      commPercent, 
      exchangeRate,
      tieneTourConductor = false,
      costoTourConductor = 0
    } = settings

    const effectivePax = pax + (paxNinos * (porcentajePagoNinos / 100))

    const subtotalServicios = items.reduce((sum, item) => {
      return sum + this.calculateItemTotal(item, effectivePax)
    }, 0)

    const tcCost = tieneTourConductor ? costoTourConductor : 0
    const subtotalNeto = subtotalServicios + tcCost

    const taxAmount = subtotalNeto * (taxPercent / 100)
    const totalBruto = subtotalNeto + taxAmount

    // Calculate Commission only on marked items
    const commBase = items.reduce((sum, item) => {
        // Use the explicit column 'aplica_comision'. Default to true if undefined (backward compat)
        const appliesComm = item.aplica_comision ?? true
        if (!appliesComm) return sum

        const itemTotal = this.calculateItemTotal(item, effectivePax)
        // Add Tax portion to base (since Commission was on Bruto)
        // const itemBruto = itemTotal * (1 + (taxPercent / 100))
        return sum + itemTotal
    }, 0)

    const commAmount = commBase * (commPercent / 100)
    const totalFinal = totalBruto - commAmount

    const summary: QuoteFinancialSummary = {
      subtotalNeto,
      subtotalServicios,
      costoTourConductor: tcCost,
      taxAmount,
      totalBruto,
      commAmount,
      totalFinal,
    }

    if (exchangeRate) {
      summary.totalFinalBOB = totalFinal * exchangeRate
    }

    return summary
  },
}
