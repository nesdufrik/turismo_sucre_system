import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SettingsService } from '../SettingsService'
import { supabase } from '@/lib/supabase'

const mocks = vi.hoisted(() => {
  const select = vi.fn()
  const insert = vi.fn()
  const update = vi.fn()
  const deleteFn = vi.fn()
  const eq = vi.fn()
  const order = vi.fn()
  const single = vi.fn()
  
  const from = vi.fn(() => ({
    select,
    insert,
    update,
    delete: deleteFn,
  }))

  return {
    from,
    select,
    insert,
    update,
    delete: deleteFn,
    eq,
    order,
    single
  }
})

// Mock @/lib/supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: mocks.from,
  },
}))

describe('SettingsService', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Reset default implementations for chaining
    mocks.select.mockReturnValue({ order: mocks.order, single: mocks.single, eq: mocks.eq })
    
    // Insert chain: insert -> select -> single
    const insertSelect = vi.fn(() => ({ single: mocks.single }))
    mocks.insert.mockReturnValue({ select: insertSelect })

    // Update chain: update -> eq -> select -> single
    const updateSelect = vi.fn(() => ({ single: mocks.single }))
    const updateEq = vi.fn(() => ({ select: updateSelect }))
    mocks.update.mockReturnValue({ eq: updateEq })
    
    // Delete chain: delete -> eq
    mocks.delete.mockReturnValue({ eq: mocks.eq })
  })

  describe('Locations (Ubicaciones)', () => {
    it('getLocations should return data ordered by city', async () => {
      const mockData = [{ ubicacion_id: 1, ciudad: 'Sucre' }]
      mocks.order.mockResolvedValue({ data: mockData, error: null })

      const result = await SettingsService.getLocations()

      expect(supabase.from).toHaveBeenCalledWith('ubicaciones')
      expect(mocks.select).toHaveBeenCalledWith('*')
      expect(mocks.order).toHaveBeenCalledWith('ciudad')
      expect(result).toEqual(mockData)
    })

    it('createLocation should insert and return new location', async () => {
      const newLoc = { ciudad: 'Potosí' }
      const createdLoc = { ubicacion_id: 2, ...newLoc }
      mocks.single.mockResolvedValue({ data: createdLoc, error: null })

      const result = await SettingsService.createLocation(newLoc)

      expect(supabase.from).toHaveBeenCalledWith('ubicaciones')
      expect(mocks.insert).toHaveBeenCalledWith(newLoc)
      expect(result).toEqual(createdLoc)
    })

    it('updateLocation should update and return modified location', async () => {
      const updateData = { ciudad: 'Sucre Updated' }
      const updatedLoc = { ubicacion_id: 1, ...updateData }
      mocks.single.mockResolvedValue({ data: updatedLoc, error: null })

      const result = await SettingsService.updateLocation(1, updateData)

      expect(supabase.from).toHaveBeenCalledWith('ubicaciones')
      expect(mocks.update).toHaveBeenCalledWith(updateData)
      expect(result).toEqual(updatedLoc)
    })

    it('deleteLocation should remove location', async () => {
      mocks.eq.mockResolvedValue({ error: null })

      await SettingsService.deleteLocation(1)

      expect(supabase.from).toHaveBeenCalledWith('ubicaciones')
      expect(mocks.delete).toHaveBeenCalled()
    })
  })

  describe('Service Categories', () => {
    it('getServiceCategories should return data ordered by name', async () => {
      const mockData = [{ categoria_id: 1, nombre: 'Transporte' }]
      mocks.order.mockResolvedValue({ data: mockData, error: null })

      const result = await SettingsService.getServiceCategories()

      expect(supabase.from).toHaveBeenCalledWith('categoriasservicio')
      expect(mocks.select).toHaveBeenCalledWith('*')
      expect(mocks.order).toHaveBeenCalledWith('nombre')
      expect(result).toEqual(mockData)
    })
  })

  describe('Price Sheets', () => {
    it('getPriceSheets should return data ordered by name', async () => {
      const mockData = [{ hoja_id: 1, nombre: '2025', es_default: true }]
      mocks.order.mockResolvedValue({ data: mockData, error: null })

      const result = await SettingsService.getPriceSheets()

      expect(supabase.from).toHaveBeenCalledWith('hojasdeprecios')
      expect(mocks.select).toHaveBeenCalledWith('*')
      expect(mocks.order).toHaveBeenCalledWith('nombre')
      expect(result).toEqual(mockData)
    })
  })
})
