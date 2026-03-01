import { describe, it, expect } from 'vitest'
import { PriceCalculator, type QuoteCalculatableItem } from '../domain/PriceCalculator'

describe('PriceCalculator', () => {
  describe('calculateItemTotal', () => {
    it('should calculate total for item per pax', () => {
      const item: QuoteCalculatableItem = {
        precio_unitario_snapshot: 50,
        cantidad: 1,
        es_por_pax: true
      }
      const pax = 2
      expect(PriceCalculator.calculateItemTotal(item, pax)).toBe(100)
    })

    it('should calculate total for item with quantity > 1', () => {
      const item: QuoteCalculatableItem = {
        precio_unitario_snapshot: 50,
        cantidad: 3,
        es_por_pax: true
      }
      const pax = 2
      expect(PriceCalculator.calculateItemTotal(item, pax)).toBe(300)
    })

    it('should calculate total for fixed price item (not per pax)', () => {
      const item: QuoteCalculatableItem = {
        precio_unitario_snapshot: 200,
        cantidad: 1,
        es_por_pax: false
      }
      const pax = 10
      expect(PriceCalculator.calculateItemTotal(item, pax)).toBe(200)
    })

    it('should handle null values by using defaults', () => {
      const item: QuoteCalculatableItem = {
        precio_unitario_snapshot: null,
        cantidad: null,
        es_por_pax: null
      }
      expect(PriceCalculator.calculateItemTotal(item, 2)).toBe(0)
    })
  })

  describe('calculateSummary', () => {
    it('should calculate full financial summary correctly', () => {
      const items: QuoteCalculatableItem[] = [
        { precio_unitario_snapshot: 50, cantidad: 1, es_por_pax: true }, // 50 * 2 = 100
        { precio_unitario_snapshot: 200, cantidad: 1, es_por_pax: false } // 200
      ]
      const settings = {
        pax: 2,
        taxPercent: 16,
        commPercent: 10,
        exchangeRate: 7.05
      }

      const summary = PriceCalculator.calculateSummary(items, settings)

      // Subtotal Neto: 100 + 200 = 300
      expect(summary.subtotalNeto).toBeCloseTo(300)
      // Tax: 300 * 0.16 = 48
      expect(summary.taxAmount).toBeCloseTo(48)
      // Bruto: 300 + 48 = 348
      expect(summary.totalBruto).toBeCloseTo(348)
      // Commission: 348 * 0.10 = 34.8
      expect(summary.commAmount).toBeCloseTo(34.8)
      // Final: 348 - 34.8 = 313.2
      expect(summary.totalFinal).toBeCloseTo(313.2)
      // BOB: 313.2 * 7.05 = 2208.06
      expect(summary.totalFinalBOB).toBeCloseTo(2208.06)
    })

    it('should handle zero percents correctly', () => {
      const items: QuoteCalculatableItem[] = [
        { precio_unitario_snapshot: 100, cantidad: 1, es_por_pax: false }
      ]
      const settings = {
        pax: 1,
        taxPercent: 0,
        commPercent: 0
      }

      const summary = PriceCalculator.calculateSummary(items, settings)

      expect(summary.subtotalNeto).toBe(100)
      expect(summary.taxAmount).toBe(0)
      expect(summary.totalFinal).toBe(100)
    })
  })
})
