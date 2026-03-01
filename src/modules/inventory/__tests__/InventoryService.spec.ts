import { describe, it, expect, vi, beforeEach } from 'vitest'
import { InventoryService } from '../InventoryService'
import { supabase } from '@/lib/supabase'

// Helper to create a mock chain
const mocks = vi.hoisted(() => {
	const select = vi.fn()
	const insert = vi.fn()
	const update = vi.fn()
	const deleteFn = vi.fn()
	const eq = vi.fn()
	const single = vi.fn()
	const limit = vi.fn()
	const order = vi.fn()

	// Setup chaining for order
	order.mockReturnValue({
		limit,
		single,
		eq,
	})

	const from = vi.fn(() => ({
		select,
		insert,
		update,
		delete: deleteFn,
		eq,
		order,
		single,
		limit,
	}))

	return {
		from,
		select,
		insert,
		update,
		delete: deleteFn,
		eq,
		order,
		single,
		limit,
	}
})

// Mock @/lib/supabase
vi.mock('@/lib/supabase', () => ({
	supabase: {
		from: mocks.from,
	},
}))

describe('InventoryService', () => {
	beforeEach(() => {
		vi.clearAllMocks()

		// Reset default chaining
		mocks.limit.mockReturnValue({
			order: mocks.order,
			single: mocks.single,
			eq: mocks.eq,
		})
		mocks.order.mockReturnValue({
			limit: mocks.limit,
			single: mocks.single,
			eq: mocks.eq,
		})
		mocks.select.mockReturnValue({
			order: mocks.order,
			single: mocks.single,
			eq: mocks.eq,
			limit: mocks.limit,
		})

		// Insert chain: insert -> select -> single
		const insertSelect = vi.fn(() => ({ single: mocks.single }))
		mocks.insert.mockReturnValue({ select: insertSelect })

		// Update chain: update -> eq -> select -> single
		const updateSelect = vi.fn(() => ({ single: mocks.single }))
		const updateEq = vi.fn(() => ({ select: updateSelect }))
		mocks.update.mockReturnValue({ eq: updateEq })

		// Delete chain: delete -> eq
		mocks.delete.mockReturnValue({ eq: mocks.eq })

		// Select by ID chain: select -> eq -> single
		const selectEq = vi.fn(() => ({
			single: mocks.single,
			order: mocks.order,
			limit: mocks.limit,
		}))
		mocks.select.mockReturnValue({
			eq: selectEq,
			order: mocks.order,
			limit: mocks.limit,
		})

		// Complex Select for Prices: select -> eq -> order
		mocks.select.mockImplementation(() => ({
			order: mocks.order,
			eq: selectEq,
			single: mocks.single,
			limit: mocks.limit,
		}))
	})

	describe('Services', () => {
		it('getServices should return data ordered by name', async () => {
			const mockData = [{ servicio_id: 1, nombre: 'City Tour' }]
			mocks.order.mockResolvedValue({ data: mockData, error: null })

			const result = await InventoryService.getServices()

			expect(supabase.from).toHaveBeenCalledWith('servicios')
			expect(mocks.select).toHaveBeenCalled()
			expect(result).toEqual(mockData)
		})

		it('createService should insert and return new service', async () => {
			const newService = { nombre: 'Test Service' }
			const createdService = { servicio_id: 1, ...newService }
			mocks.single.mockResolvedValue({ data: createdService, error: null })

			const result = await InventoryService.createService(newService)

			expect(supabase.from).toHaveBeenCalledWith('servicios')
			expect(mocks.insert).toHaveBeenCalledWith(newService)
			expect(result).toEqual(createdService)
		})
	})

	describe('Service Prices', () => {
		it('getServicePrices should return prices for a service', async () => {
			const mockData = [{ precio_id: 1, precio_por_persona: 100 }]
			mocks.order.mockResolvedValue({ data: mockData, error: null })

			await InventoryService.getServicePrices(1)

			expect(supabase.from).toHaveBeenCalledWith('preciosservicio')
			expect(mocks.select).toHaveBeenCalled()
		})
	})

	describe('Hotels', () => {
		it('getHotels should return data ordered by name', async () => {
			const mockData = [{ hotel_id: 1, nombre: 'Hotel Sucre' }]
			mocks.order.mockResolvedValue({ data: mockData, error: null })

			const result = await InventoryService.getHotels()

			expect(supabase.from).toHaveBeenCalledWith('hoteles')
			expect(mocks.select).toHaveBeenCalled()
			expect(result).toEqual(mockData)
		})

		it('createHotel should insert and return new hotel', async () => {
			const newHotel = { nombre: 'New Hotel' }
			const createdHotel = { hotel_id: 1, ...newHotel }
			mocks.single.mockResolvedValue({ data: createdHotel, error: null })

			const result = await InventoryService.createHotel(newHotel)

			expect(supabase.from).toHaveBeenCalledWith('hoteles')
			expect(mocks.insert).toHaveBeenCalledWith(newHotel)
			expect(result).toEqual(createdHotel)
		})
	})

	describe('Room Types', () => {
		it('getRoomTypes should return rooms for a hotel', async () => {
			const mockData = [{ habitacion_id: 1, tipo: 'Simple' }]
			mocks.order.mockResolvedValue({ data: mockData, error: null })

			const result = await InventoryService.getRoomTypes(1)

			expect(supabase.from).toHaveBeenCalledWith('tiposhabitacion')
			expect(mocks.select).toHaveBeenCalled()
			expect(result).toEqual(mockData)
		})
	})

	describe('Packages', () => {
		it('getPackages should return data ordered by name', async () => {
			const mockData = [{ paquete_id: 1, nombre_paquete: 'Pack 1' }]
			mocks.order.mockResolvedValue({ data: mockData, error: null })

			const result = await InventoryService.getPackages()

			expect(supabase.from).toHaveBeenCalledWith('paquetes')
			expect(mocks.select).toHaveBeenCalled()
			expect(mocks.order).toHaveBeenCalledWith('nombre_paquete')
			expect(result).toEqual(mockData)
		})

		it('addPackageComponent should insert component', async () => {
			const comp = { paquete_id: 1, servicio_id: 2, cantidad: 1 }
			mocks.single.mockResolvedValue({ data: comp, error: null })

			const result = await InventoryService.addPackageComponent(comp)

			expect(supabase.from).toHaveBeenCalledWith('componentespaquete')
			expect(mocks.insert).toHaveBeenCalledWith(comp)
			expect(result).toEqual(comp)
		})
	})
})
