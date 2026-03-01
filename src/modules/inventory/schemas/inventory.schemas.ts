import * as z from 'zod'

export const serviceSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  codigo: z.string().optional(),
  descripcion: z.string().optional(),
  duracion_texto: z.string().optional(),
  categoria_id: z.number().min(1, 'La categoría es requerida'),
  ubicacion_id: z.number().min(1, 'La ubicación es requerida'),
})

export type ServiceFormValues = z.infer<typeof serviceSchema>

export const hotelSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  categoria: z.string().optional(),
  ubicacion_id: z.coerce.number().min(1, 'La ubicación es requerida'),
  info_desayuno: z.string().optional(),
  incluye_impuestos: z.boolean().default(false),
})

export type HotelFormValues = z.infer<typeof hotelSchema>

export const packageSchema = z.object({
  nombre_paquete: z.string().min(1, 'El nombre es requerido'),
  descripcion: z.string().optional(),
})

export type PackageFormValues = z.infer<typeof packageSchema>
