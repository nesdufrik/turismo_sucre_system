import { supabase } from '@/lib/supabase'
import { startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, format } from 'date-fns'

export interface DashboardMetrics {
  totalQuoted: number
  totalSold: number
  quoteCount: number
  soldCount: number
  conversionRate: number
  pendingCount: number
  statusDistribution: Record<string, number> // New field
}

export interface ChartDataPoint {
  date: string
  quoted: number
  sold: number
}

export type DateRangeOption = 'this_month' | 'last_month' | 'this_year' | 'custom'

export const DashboardService = {
  /**
   * Get date range object based on preset
   */
  getDateRange(option: DateRangeOption, customStart?: Date, customEnd?: Date) {
    const now = new Date()
    
    switch (option) {
      case 'this_month':
        return { start: startOfMonth(now), end: endOfMonth(now) }
      case 'last_month':
        const last = subMonths(now, 1)
        return { start: startOfMonth(last), end: endOfMonth(last) }
      case 'this_year':
        return { start: startOfYear(now), end: endOfYear(now) }
      case 'custom':
        return { start: customStart || startOfMonth(now), end: customEnd || endOfMonth(now) }
      default:
        return { start: startOfMonth(now), end: endOfMonth(now) }
    }
  },

  /**
   * Fetch Aggregate Metrics
   */
  async getMetrics(start: Date, end: Date): Promise<DashboardMetrics> {
    const startDate = start.toISOString()
    const endDate = end.toISOString()

    const { data: quotes, error } = await supabase
      .from('cotizaciones')
      .select('estado, total_general, moneda, tipo_cambio')
      .gte('fecha_creacion', startDate)
      .lte('fecha_creacion', endDate)

    if (error) throw error

    let totalQuoted = 0
    let totalSold = 0
    let quoteCount = 0
    let soldCount = 0
    let pendingCount = 0
    
    // Status counters
    const statusDistribution: Record<string, number> = {
      'Draft': 0,
      'In_Review': 0,
      'Approved': 0,
      'Rejected': 0,
      'Sold': 0
    }

    quotes.forEach(q => {
      // Normalize to USD for aggregation
      let amount = Number(q.total_general) || 0
      if (q.moneda === 'BOB' && q.tipo_cambio) {
        amount = amount / q.tipo_cambio
      }

      quoteCount++
      totalQuoted += amount

      const status = q.estado || 'Unknown'
      if (statusDistribution[status] !== undefined) {
        statusDistribution[status]++
      } else {
        statusDistribution[status] = 1
      }

      if (q.estado === 'Sold') {
        soldCount++
        totalSold += amount
      } else if (q.estado === 'In_Review' || q.estado === 'Approved') {
        pendingCount++
      }
    })

    const conversionRate = quoteCount > 0 ? (soldCount / quoteCount) * 100 : 0

    return {
      totalQuoted,
      totalSold,
      quoteCount,
      soldCount,
      conversionRate,
      pendingCount,
      statusDistribution
    }
  },

  /**
   * Fetch data grouped by time for charts
   */
  async getChartData(start: Date, end: Date): Promise<ChartDataPoint[]> {
    const { data: quotes, error } = await supabase
      .from('cotizaciones')
      .select('fecha_creacion, estado, total_general, moneda, tipo_cambio')
      .gte('fecha_creacion', start.toISOString())
      .lte('fecha_creacion', end.toISOString())
      .order('fecha_creacion')

    if (error) throw error

    // Grouping map
    const map = new Map<string, { quoted: number, sold: number }>()

    // Fill dates in range (optional, for continuous lines) - skipped for brevity but recommended for charts
    
    quotes.forEach(q => {
      // Group by day (YYYY-MM-DD)
      const dateKey = format(new Date(q.fecha_creacion || ''), 'yyyy-MM-dd')
      
      if (!map.has(dateKey)) {
        map.set(dateKey, { quoted: 0, sold: 0 })
      }

      let amount = Number(q.total_general) || 0
      if (q.moneda === 'BOB' && q.tipo_cambio) {
        amount = amount / q.tipo_cambio
      }

      const entry = map.get(dateKey)!
      entry.quoted += amount
      if (q.estado === 'Sold') {
        entry.sold += amount
      }
    })

    // Transform to array
    return Array.from(map.entries()).map(([date, values]) => ({
      date,
      quoted: values.quoted,
      sold: values.sold
    })).sort((a, b) => a.date.localeCompare(b.date))
  }
}