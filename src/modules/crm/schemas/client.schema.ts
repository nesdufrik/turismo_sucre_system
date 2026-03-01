import * as z from 'zod'

// Base Schema Shared by all types
const baseClientSchema = z.object({
  nombre_completo: z.string().min(1, 'El nombre es obligatorio'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefono: z.string().optional(),
  documento_identidad: z.string().optional(),
  pais: z.string().optional(),
  ciudad: z.string().optional(),
  hoja_id: z.union([z.number(), z.string()])
    .refine((val) => val !== '' && val !== null && val !== undefined, {
      message: 'La hoja de precios es obligatoria'
    })
    .transform((val) => Number(val)),
  notas_internas: z.string().optional(),
})

// Enterprise Specific Schema
const enterpriseSchema = baseClientSchema.extend({
  tipo_cliente: z.literal('empresa'),
  empresa: z.string().optional(), // Can be same as nombre_completo or legal name
  otros_datos: z.object({
    contactos: z.array(z.object({
      name: z.string(),
      role: z.string(),
      email: z.string().email().optional().or(z.literal(''))
    })).optional()
  }).optional()
})

// Individual Specific Schema
const particularSchema = baseClientSchema.extend({
  tipo_cliente: z.literal('particular'),
  empresa: z.string().optional(), // Usually empty for particular
  otros_datos: z.object({
    preferencias: z.object({
      diet: z.string().optional(),
      allergies: z.string().optional(),
      room_pref: z.string().optional()
    }).optional()
  }).optional()
})

// Discriminated Union
export const clientSchema = z.discriminatedUnion('tipo_cliente', [
  enterpriseSchema,
  particularSchema
])

export type ClientFormValues = z.infer<typeof clientSchema>
