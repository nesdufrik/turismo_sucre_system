import { supabase } from '@/lib/supabase'

export const InventoryReportService = {
	// Get all price sheets for the dropdown
	async getPriceSheets() {
		const { data, error } = await supabase
			.from('hojasdeprecios')
			.select('*')
			.order('hoja_id', { ascending: false })

		if (error) throw error
		return data
	},

	// Matrix Data: Services
	async getServicesMatrix(hojaId: number) {
		const { data, error } = await supabase
			.from('servicios')
			.select(
				`
        servicio_id,
        nombre,
        codigo,
        duracion_texto,
        categoriasservicio (nombre),
        ubicaciones (ciudad),
        preciosservicio (
           hoja_id,
           min_pax,
           max_pax,
           temporada,
           precio_por_persona
        )
      `,
			)
			.order('nombre', { ascending: true })

		if (error) throw error

		// Filter services that actually have prices for the selected hojaId
		const filteredData = data.filter(
			(s) =>
				s.preciosservicio &&
				s.preciosservicio.some((p) => p.hoja_id === hojaId),
		)

		// In-memory sort by City -> Type(Category) -> Name
		return filteredData.sort((a: any, b: any) => {
			const cityA = a.ubicaciones?.ciudad || ''
			const cityB = b.ubicaciones?.ciudad || ''
			if (cityA !== cityB) return cityA.localeCompare(cityB)

			const typeA = a.categoriasservicio?.nombre || ''
			const typeB = b.categoriasservicio?.nombre || ''
			if (typeA !== typeB) return typeA.localeCompare(typeB)

			const nameA = a.nombre || ''
			const nameB = b.nombre || ''
			return nameA.localeCompare(nameB)
		})
	},

	// Matrix Data: Hotels
	async getHotelsMatrix(hojaId: number) {
		const { data, error } = await supabase
			.from('hoteles')
			.select(
				`
        hotel_id,
        nombre,
        categoria,
        info_desayuno,
        incluye_impuestos,
        ubicaciones (ciudad),
        tiposhabitacion (
          habitacion_id,
          tipo,
          capacidad_personas,
          precioshabitacion (
            hoja_id,
            temporada,
            precio_por_noche
          )
        )
      `,
			)
			.order('nombre', { ascending: true })

		if (error) throw error

		// Filter hotels that have rooms with prices for the selected hojaId
		const filteredData = data.filter(
			(h) =>
				h.tiposhabitacion &&
				h.tiposhabitacion.some(
					(th) =>
						th.precioshabitacion &&
						th.precioshabitacion.some((ph) => ph.hoja_id === hojaId),
				),
		)

		// In-memory sort by City -> Category -> Name
		return filteredData.sort((a: any, b: any) => {
			const cityA = a.ubicaciones?.ciudad || ''
			const cityB = b.ubicaciones?.ciudad || ''
			if (cityA !== cityB) return cityA.localeCompare(cityB)

			const catA = a.categoria || ''
			const catB = b.categoria || ''
			// Sort category descending if they are stars like '⭐⭐⭐' vs '⭐⭐' so higher comes first? Or standard locale.
			if (catA !== catB) return catB.localeCompare(catA) // inverted to show 5 stars first usually, or localeCompare works.

			const nameA = a.nombre || ''
			const nameB = b.nombre || ''
			return nameA.localeCompare(nameB)
		})
	},

	// Simple Data: Packages
	async getPackages() {
		const { data, error } = await supabase
			.from('paquetes')
			.select(
				`
        paquete_id,
        nombre_paquete,
        descripcion
      `,
			)
			.order('nombre_paquete', { ascending: true })

		if (error) throw error
		return data
	},
}
