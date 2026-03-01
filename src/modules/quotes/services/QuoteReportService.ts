import { supabase } from '@/lib/supabase'

export const QuoteReportService = {
	async getQuotesForDateRange(startDate: string, endDate: string) {
		const { data, error } = await supabase
			.from('cotizaciones')
			.select(
				`
        cotizacion_id,
        estado,
        moneda,
        total_general,
        fecha_creacion,
        clientes!inner (
          nombre_completo,
          empresa
        )
      `,
			)
			.gte('fecha_creacion', startDate)
			.lte('fecha_creacion', endDate)
			.order('fecha_creacion', { ascending: false })

		if (error) throw error
		return data
	},
}
