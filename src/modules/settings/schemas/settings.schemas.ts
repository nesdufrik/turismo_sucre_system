import { z } from 'zod'

export const serviceCategorySchema = z.object({
  nombre: z.string().min(1, 'El nombre de la categoría es requerido'),
  descripcion: z.string().optional(),
  color: z.string().optional(),
})

export const priceSheetSchema = z.object({
  nombre: z.string().min(1, 'El nombre de la hoja de precios es requerido'),
  es_default: z.boolean().optional(),
})

export const locationSchema = z.object({
  ciudad: z.string().min(1, 'El nombre de la ciudad es requerido'),
  pais: z.string().default('Bolivia'),
  codigo: z.string().optional(),
})

export type ServiceCategoryFormValues = z.infer<typeof serviceCategorySchema>
export type PriceSheetFormValues = z.infer<typeof priceSheetSchema>
export type LocationFormValues = z.infer<typeof locationSchema>
