import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'El correo electrónico es obligatorio' })
    .email('Ingresa un correo electrónico válido'),
  password: z
    .string({ required_error: 'La contraseña es obligatoria' })
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

export type LoginSchema = z.infer<typeof loginSchema>
