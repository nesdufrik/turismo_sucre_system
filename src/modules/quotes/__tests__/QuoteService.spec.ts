import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QuoteService } from '../QuoteService'
import { supabase } from '@/lib/supabase'

// Helper to create a mock chain
const mocks = vi.hoisted(() => {
  const select = vi.fn()
  const insert = vi.fn()
  const update = vi.fn()
  const deleteFn = vi.fn()
  const eq = vi.fn()
  const order = vi.fn()
  const single = vi.fn()
  const limit = vi.fn()
  const lte = vi.fn()
  const gte = vi.fn()
  const from = vi.fn()
  const or = vi.fn()
  
  const chainable = {
    select,
    insert,
    update,
    delete: deleteFn,
    eq,
    order,
    single,
    limit,
    lte,
    gte,
    from,
    or
  }

  from.mockReturnValue(chainable)
  select.mockReturnValue(chainable)
  insert.mockReturnValue(chainable)
  update.mockReturnValue(chainable)
  deleteFn.mockReturnValue(chainable)
  eq.mockReturnValue(chainable)
  order.mockReturnValue(chainable)
  single.mockReturnValue(chainable)
  limit.mockReturnValue(chainable)
  lte.mockReturnValue(chainable)
  gte.mockReturnValue(chainable)
  or.mockReturnValue(chainable)

  return {
    ...chainable
  }
})

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: mocks.from,
  },
}))

describe('QuoteService', () => {
  beforeEach(() => {
    vi.clearAllMocks() // Clears usage
    
    // Reset implementations to clear any mockResolvedValueOnce from previous tests
    mocks.from.mockReset()
    mocks.select.mockReset()
    mocks.insert.mockReset()
    mocks.update.mockReset()
    mocks.delete.mockReset()
    mocks.eq.mockReset()
    mocks.lte.mockReset()
    mocks.gte.mockReset()
    mocks.order.mockReset()
    mocks.single.mockReset()
    mocks.limit.mockReset()
    mocks.or.mockReset()

    // Re-establish fluent interface
    mocks.from.mockReturnValue(mocks)
    mocks.select.mockReturnValue(mocks)
    mocks.insert.mockReturnValue(mocks)
    mocks.update.mockReturnValue(mocks)
    mocks.delete.mockReturnValue(mocks)
    mocks.eq.mockReturnValue(mocks)
    mocks.lte.mockReturnValue(mocks)
    mocks.gte.mockReturnValue(mocks)
    mocks.order.mockReturnValue(mocks)
    mocks.single.mockReturnValue(mocks)
    mocks.limit.mockReturnValue(mocks)
    mocks.or.mockReturnValue(mocks)

    // Setup default terminal returns
    mocks.order.mockResolvedValue({ data: [], error: null })
    mocks.single.mockResolvedValue({ data: {}, error: null })
  })

  describe('Quote Header', () => {
    it('getQuotes should return quotes with client info', async () => {
      const mockData = [{ cotizacion_id: 1, clientes: { nombre_completo: 'Test' } }]
      mocks.order.mockResolvedValue({ data: mockData, error: null })

      const result = await QuoteService.getQuotes()

      expect(supabase.from).toHaveBeenCalledWith('cotizaciones')
      expect(mocks.select).toHaveBeenCalled() 
      expect(result).toEqual(mockData)
    })

    it('createQuote should insert', async () => {
      const input = { cliente_id: 1, total_general: 0 }
      const output = { cotizacion_id: 1, ...input }
      mocks.single.mockResolvedValue({ data: output, error: null })

      const result = await QuoteService.createQuote(input as any)
      expect(mocks.insert).toHaveBeenCalledWith(input)
      expect(result).toEqual(output)
    })
  })

  describe('Items & Calculations', () => {
    it('addQuoteItem should insert item and recalculate total using domain logic', async () => {
      const newItem = { cotizacion_id: 1 }
      const savedItem = { item_id: 1, ...newItem }
      
      // Mock for initial insert
      mocks.single.mockResolvedValueOnce({ data: savedItem, error: null })

      // --- Recalculate Logic ---
      // 1. Fetch header settings
      // Chain: from().select().eq().single()
      // eq() call #1 MUST return mocks to allow .single()
      mocks.eq.mockReturnValueOnce(mocks) 
      mocks.single.mockResolvedValueOnce({ 
        data: { cantidad_pax: 2, porcentaje_impuesto: 16, porcentaje_comision: 10 }, 
        error: null 
      })

      // 2. Fetch items (returning 1 item: price 50, qty 1, per_pax true)
      // Chain: from().select().eq() -> Terminal
      // eq() call #2
      mocks.eq.mockResolvedValueOnce({ 
        data: [{ precio_unitario_snapshot: 50, cantidad: 1, es_por_pax: true }], 
        error: null 
      })
      
      // 3. Header update result
      // Chain: from().update().eq() -> Terminal
      // eq() call #3
      mocks.eq.mockResolvedValueOnce({ data: {}, error: null })
      
      await QuoteService.addQuoteItem(newItem as any)

      expect(mocks.insert).toHaveBeenCalledWith(newItem)
      expect(supabase.from).toHaveBeenCalledWith('itemscotizacion')
      expect(supabase.from).toHaveBeenCalledWith('cotizaciones')
      
      // Verification of total final: 104.4
      expect(mocks.update).toHaveBeenCalledWith({ total_general: 104.4 })
    })
  })

  describe('Price Lookup', () => {
    it('findServicePrice should query with ranges and dates', async () => {
      const mockPrice = { precio_id: 1, precio_por_persona: 50 }
      
      // Chain sequence: eq, eq, lte, gte, or, or, limit
      // The query function in findServicePrice ends with .limit(1)
      mocks.limit.mockResolvedValueOnce({ data: [mockPrice], error: null })

      await QuoteService.findServicePrice(1, 1, 2, '2025-12-01')

      expect(supabase.from).toHaveBeenCalledWith('preciosservicio')
      expect(mocks.eq).toHaveBeenCalledWith('servicio_id', 1)
      expect(mocks.lte).toHaveBeenCalledWith('min_pax', 2)
      expect(mocks.limit).toHaveBeenCalledWith(1)
    })
  })
})