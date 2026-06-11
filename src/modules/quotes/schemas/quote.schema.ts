import { z } from 'zod'

export const quoteSchema = z.object({
  cliente_id: z.number({ required_error: 'El cliente es obligatorio' }),
  nombre_grupo: z.string().optional(),
  cantidad_pax: z.number().min(1, 'Mínimo 1 pasajero'),
  cantidad_pax_ninos: z.number().min(0, 'Mínimo 0').default(0),
  porcentaje_pago_ninos: z.number().min(0).max(100, 'Máximo 100%').default(50.0),
  fecha_validez_hasta: z.string().optional(),
  moneda: z.enum(['USD', 'BOB']),
  tipo_cambio: z.number().min(0.1, 'Tipo de cambio inválido'),
  porcentaje_impuesto: z.number().min(0).max(100),
  porcentaje_comision: z.number().min(0).max(100),
  id_cuenta_bancaria: z.string().uuid().optional(),
  estado: z.enum(['Draft', 'In_Review', 'Liquidated', 'Rejected']).default('Draft'),
  notas_para_cliente: z.string().optional(),
  notas_internas_agencia: z.string().optional(),
  codigo_referencia: z.string().optional(),
  tiene_tour_conductor: z.boolean().default(false),
  costo_tour_conductor: z.number().min(0, 'Monto inválido').default(0.00),
})

export type QuoteFormValues = z.infer<typeof quoteSchema>
