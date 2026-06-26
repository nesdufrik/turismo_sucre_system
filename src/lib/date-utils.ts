import { format, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

/**
 * Analiza de forma segura una cadena de fecha devuelta por Supabase,
 * asegurando un manejo correcto de la zona horaria.
 * - Para marcas de tiempo (que contienen hora con ':'), añade 'Z' si no tiene indicador de zona horaria,
 *   lo que obliga al navegador a interpretarla en UTC y luego desplazarla a la hora local del cliente.
 * - Para campos de solo fecha (tipo YYYY-MM-DD), la analiza como fecha calendario local
 *   evitando desplazamientos de zona horaria que cambien el día.
 */
export function parseISO(dateStr: string | null | undefined | Date): Date | null {
  if (!dateStr) return null
  if (dateStr instanceof Date) return isNaN(dateStr.getTime()) ? null : dateStr

  let formatted = dateStr.trim()

  // Si no contiene ':' (dos puntos), significa que no tiene componente de hora (es solo fecha como YYYY-MM-DD).
  // La analizamos localmente para evitar que la zona horaria le reste horas y cambie el día anterior.
  if (!formatted.includes(':')) {
    const parts = formatted.split('T')[0]?.split('-')
    if (!parts || parts.length !== 3) return null
    const year = parseInt(parts[0] || '0')
    const month = parseInt(parts[1] || '0') - 1 // En JS los meses empiezan en 0
    const day = parseInt(parts[2] || '0')
    const date = new Date(year, month, day)
    return isNaN(date.getTime()) ? null : date
  }

  // Tiene un componente de hora (marca de tiempo). Reemplazamos espacio entre fecha y hora por 'T' si existe.
  if (formatted.includes(' ') && !formatted.includes('T')) {
    formatted = formatted.replace(' ', 'T')
  }

  // Si no tiene indicador de zona horaria (Z o desfase +00 / -04), le concatenamos 'Z' (asumiendo que viene en UTC del servidor)
  if (
    !formatted.includes('Z') &&
    !/[+-]\d{2}:?\d{2}$/.test(formatted) &&
    !/[+-]\d{2}$/.test(formatted)
  ) {
    formatted = formatted + 'Z'
  }

  const parsed = new Date(formatted)
  return isNaN(parsed.getTime()) ? null : parsed
}

/**
 * Formatea una fecha o cadena de fecha en formato 'dd/MM/yyyy HH:mm'
 * ajustado a la zona horaria local del cliente.
 */
export function formatDateTime(dateStr: string | null | undefined | Date): string {
  const date = parseISO(dateStr)
  if (!date) return '-'
  return format(date, 'dd/MM/yyyy HH:mm', { locale: es })
}

/**
 * Formatea una fecha o cadena de fecha en formato 'dd/MM/yyyy' sin aplicar
 * desplazamientos de zona horaria en campos de solo fecha.
 */
export function formatDate(dateStr: string | null | undefined | Date): string {
  const date = parseISO(dateStr)
  if (!date) return '-'
  return format(date, 'dd/MM/yyyy', { locale: es })
}

/**
 * Formatea una marca de tiempo de forma relativa al momento actual (ej. "hace 3 minutos").
 */
export function formatDistance(dateStr: string | null | undefined | Date): string {
  const date = parseISO(dateStr)
  if (!date) return '-'
  return formatDistanceToNow(date, { addSuffix: true, locale: es })
}
