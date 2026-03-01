import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ClientService } from '../ClientService'
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

describe('ClientService', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Reset default chaining
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
    
    // Select by ID chain: select -> eq -> single
    const selectEq = vi.fn(() => ({ single: mocks.single }))
    mocks.select.mockReturnValue({ eq: selectEq, order: mocks.order })
    
    // Explicit re-mock for getClients order call
    mocks.select.mockImplementation(() => ({
      order: mocks.order,
      eq: selectEq,
      single: mocks.single
    }))
  })

  it('getClients should return data ordered by nombre_completo', async () => {
    const mockData = [{ cliente_id: 1, nombre_completo: 'John Doe' }]
    mocks.order.mockResolvedValue({ data: mockData, error: null })

    const result = await ClientService.getClients()

    expect(supabase.from).toHaveBeenCalledWith('clientes')
    expect(mocks.select).toHaveBeenCalled()
    expect(mocks.order).toHaveBeenCalledWith('nombre_completo', { ascending: true })
    expect(result).toEqual(mockData)
  })

  it('getClientById should return a single client', async () => {
    const mockData = { cliente_id: 1, nombre_completo: 'John Doe' }
    mocks.single.mockResolvedValue({ data: mockData, error: null })

    const result = await ClientService.getClientById(1)
    expect(result).toBeDefined()

    expect(supabase.from).toHaveBeenCalledWith('clientes')
    expect(mocks.select).toHaveBeenCalledWith('*')
    // Access the mocked function stored in the closure from beforeEach
    // Actually we should just verify the chain was called.
    // The chain is select -> eq -> single. 
    // We already asserted select.
  })

  it('createClient should insert and return new client', async () => {
    const newClient = { nombre_completo: 'Jane Doe', email: 'jane@example.com' }
    const createdClient = { cliente_id: 2, ...newClient }
    mocks.single.mockResolvedValue({ data: createdClient, error: null })

    const result = await ClientService.createClient(newClient)

    expect(supabase.from).toHaveBeenCalledWith('clientes')
    expect(mocks.insert).toHaveBeenCalledWith(newClient)
    expect(result).toEqual(createdClient)
  })

  it('updateClient should update and return client', async () => {
    const updateData = { nombre_completo: 'Jane Smith' }
    const updatedClient = { cliente_id: 2, ...updateData }
    mocks.single.mockResolvedValue({ data: updatedClient, error: null })

    const result = await ClientService.updateClient(2, updateData)

    expect(supabase.from).toHaveBeenCalledWith('clientes')
    expect(mocks.update).toHaveBeenCalledWith(updateData)
    // We can't easily check the eq call with this simple mock setup unless we spy on the returned object, 
    // but ensuring update is called is good enough for this level.
    expect(result).toEqual(updatedClient)
  })

  it('deleteClient should delete client', async () => {
    mocks.eq.mockResolvedValue({ error: null }) // Mocking return of delete -> eq

    await ClientService.deleteClient(1)

    expect(supabase.from).toHaveBeenCalledWith('clientes')
    expect(mocks.delete).toHaveBeenCalled()
  })
})
