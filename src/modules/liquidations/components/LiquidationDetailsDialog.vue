<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRouter } from 'vue-router'
import { usePermission } from '@/composables/usePermission'
import { useAuthStore } from '@/stores/auth'
import { QuoteService } from '@/modules/quotes/QuoteService'
import QuoteReopenDialog from '@/modules/quotes/components/QuoteReopenDialog.vue'
import { toast } from 'vue-sonner'
import {
  Loader2,
  Calendar,
  User,
  Building,
  CreditCard,
  Upload,
  ExternalLink,
  LockOpen
} from 'lucide-vue-next'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { LiquidationService, type LiquidationWithDetails } from '../LiquidationService'
import LiquidationStatusBadge from './LiquidationStatusBadge.vue'

const props = defineProps<{
  open: boolean
  liquidation: LiquidationWithDetails | null
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'refresh'): void
}>()

const router = useRouter()
const { can } = usePermission()
const authStore = useAuthStore()

const showJustificationDialog = ref(false)
const justificationAction = ref<'reopen_quote' | 'edit_payment' | 'revert_payment' | null>(null)
const justificationTitle = ref('')
const justificationDescription = ref('')
const justificationPlaceholder = ref('')
const justificationConfirmText = ref('')
const isEditingPayment = ref(false)

const loading = ref(false)
const selectedFile = ref<File | null>(null)
const fileName = ref('')
const paymentMethod = ref('')
const referenceCode = ref('')
const notes = ref('')

// Reset form when dialog opens/closes
watch(
  () => props.open,
  (newVal) => {
    if (newVal) {
      selectedFile.value = null
      fileName.value = ''
      paymentMethod.value = ''
      referenceCode.value = ''
      notes.value = ''
      isEditingPayment.value = false
      showJustificationDialog.value = false
      justificationAction.value = null
    }
  }
)

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    if (file) {
      // Limit file size to 5MB
      if (file.size > 5 * 1024 * 1024) {
        toast.error('El archivo excede el tamaño máximo de 5MB')
        return
      }
      selectedFile.value = file
      fileName.value = file.name
    }
  }
}

const startEditPayment = () => {
  if (!props.liquidation) return
  paymentMethod.value = props.liquidation.metodo_pago || ''
  referenceCode.value = props.liquidation.comprobante_pago || ''
  notes.value = props.liquidation.notas || ''
  fileName.value = props.liquidation.comprobante_url ? 'Comprobante actual (haga clic para cambiar)' : ''
  isEditingPayment.value = true
}

const handleRegisterPayment = async () => {
  if (!props.liquidation) return

  if (!paymentMethod.value) {
    toast.error('Seleccione un método de pago')
    return
  }

  if (!referenceCode.value) {
    toast.error('El número de comprobante o referencia es obligatorio')
    return
  }

  loading.value = true
  try {
    let publicUrl = ''
    if (selectedFile.value) {
      toast.info('Subiendo archivo de comprobante...')
      publicUrl = await LiquidationService.uploadReceipt(selectedFile.value)
    }

    await LiquidationService.registerPayment(props.liquidation.liquidacion_id, {
      metodo_pago: paymentMethod.value,
      comprobante_pago: referenceCode.value,
      comprobante_url: publicUrl || props.liquidation.comprobante_url || undefined,
      notas: notes.value
    })

    toast.success(isEditingPayment.value ? 'Pago actualizado con éxito' : 'Pago registrado con éxito')
    isEditingPayment.value = false
    emit('refresh')
    emit('update:open', false)
  } catch (error: any) {
    console.error(error)
    toast.error('Error al registrar el pago', { description: error.message })
  } finally {
    loading.value = false
  }
}

const startReopenQuote = () => {
  justificationAction.value = 'reopen_quote'
  justificationTitle.value = 'Reabrir Cotización para Edición'
  justificationDescription.value = 'Esta cotización se encuentra liquidada. Ingresa una justificación para devolverla al estado Borrador.'
  justificationPlaceholder.value = 'Ej: Se requiere corregir el número de pasajeros o cambiar un servicio...'
  justificationConfirmText.value = 'Confirmar Reapertura'
  showJustificationDialog.value = true
}

const startSaveEditPayment = () => {
  if (!paymentMethod.value) {
    toast.error('Seleccione un método de pago')
    return
  }
  if (!referenceCode.value) {
    toast.error('El número de comprobante o referencia es obligatorio')
    return
  }
  justificationAction.value = 'edit_payment'
  justificationTitle.value = 'Justificar Modificación de Pago'
  justificationDescription.value = 'Ingresa una justificación detallada explicando por qué se están modificando los datos del pago registrado.'
  justificationPlaceholder.value = 'Ej: Corrección de error de tipeo en el número de referencia bancaria...'
  justificationConfirmText.value = 'Guardar Modificación'
  showJustificationDialog.value = true
}

const startRevertPayment = () => {
  justificationAction.value = 'revert_payment'
  justificationTitle.value = 'Anular Registro de Pago'
  justificationDescription.value = 'Ingresa una justificación para anular este cobro y devolver la liquidación al estado No Pagada. Los datos del comprobante anterior serán archivados.'
  justificationPlaceholder.value = 'Ej: El pago fue rechazado por el banco o se cargó a una liquidación incorrecta...'
  justificationConfirmText.value = 'Confirmar Anulación de Pago'
  showJustificationDialog.value = true
}

const handleJustificationConfirm = async (justification: string) => {
  if (justificationAction.value === 'reopen_quote') {
    await executeReopenQuote(justification)
  } else if (justificationAction.value === 'edit_payment') {
    await executeEditPayment(justification)
  } else if (justificationAction.value === 'revert_payment') {
    await executeRevertPayment(justification)
  }
}

const executeReopenQuote = async (justification: string) => {
  if (!props.liquidation) return
  loading.value = true
  try {
    const userId = authStore.user?.id
    if (!userId) throw new Error('Usuario no autenticado')
    await QuoteService.reopenQuote(props.liquidation.cotizacion_id, justification, userId)
    toast.success('¡Cotización reabierta con éxito! Redirigiendo...')
    emit('update:open', false)
    router.push(`/quotes/${props.liquidation.cotizacion_id}`)
  } catch (error: any) {
    console.error(error)
    toast.error('Error al reabrir cotización', { description: error.message })
  } finally {
    loading.value = false
  }
}

const executeEditPayment = async (justification: string) => {
  if (!props.liquidation) return
  loading.value = true
  try {
    let publicUrl = ''
    if (selectedFile.value) {
      toast.info('Subiendo archivo de comprobante...')
      publicUrl = await LiquidationService.uploadReceipt(selectedFile.value)
    }
    const userId = authStore.user?.id
    if (!userId) throw new Error('Usuario no autenticado')

    await LiquidationService.editPayment(props.liquidation.liquidacion_id, {
      metodo_pago: paymentMethod.value,
      comprobante_pago: referenceCode.value,
      comprobante_url: publicUrl || props.liquidation.comprobante_url || undefined,
      notas: notes.value
    }, justification, userId)

    toast.success('Pago actualizado con éxito')
    isEditingPayment.value = false
    emit('refresh')
    emit('update:open', false)
  } catch (error: any) {
    console.error(error)
    toast.error('Error al actualizar el pago', { description: error.message })
  } finally {
    loading.value = false
  }
}

const executeRevertPayment = async (justification: string) => {
  if (!props.liquidation) return
  loading.value = true
  try {
    const userId = authStore.user?.id
    if (!userId) throw new Error('Usuario no autenticado')

    await LiquidationService.revertPayment(props.liquidation.liquidacion_id, justification, userId)
    toast.success('Pago anulado con éxito (marcado como No Pagado)')
    emit('refresh')
    emit('update:open', false)
  } catch (error: any) {
    console.error(error)
    toast.error('Error al anular el pago', { description: error.message })
  } finally {
    loading.value = false
  }
}

const formatCurrency = (amount: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-lg overflow-y-auto max-h-[90vh]">
      <DialogHeader>
        <DialogTitle class="flex items-center justify-between pr-6">
          <span>Detalle de Liquidación</span>
          <LiquidationStatusBadge v-if="liquidation" :status="liquidation.estado_pago" />
        </DialogTitle>
        <DialogDescription v-if="liquidation">
          Referencia de Cotización: <span class="font-mono font-bold text-primary">{{ liquidation.codigo_referencia }}</span>
        </DialogDescription>
      </DialogHeader>

      <div v-if="liquidation" class="space-y-6 py-4">
        <!-- Detalles Generales -->
        <div class="grid grid-cols-2 gap-4 rounded-lg border bg-muted/30 p-4 text-sm">
          <div class="space-y-1">
            <span class="text-xs text-muted-foreground">Cliente</span>
            <div class="font-medium flex items-center gap-1">
              <User class="w-3.5 h-3.5 text-muted-foreground" />
              {{ liquidation.cliente_nombre || 'Cliente General' }}
            </div>
            <div v-if="liquidation.cliente_empresa" class="text-xs text-muted-foreground flex items-center gap-1">
              <Building class="w-3 h-3" />
              {{ liquidation.cliente_empresa }}
            </div>
          </div>
          <div class="space-y-1">
            <span class="text-xs text-muted-foreground">Total Liquidado</span>
            <div class="text-lg font-bold text-primary">
              {{ formatCurrency(liquidation.monto_total, liquidation.moneda || 'USD') }}
            </div>
          </div>
          <div class="space-y-1 col-span-2 border-t pt-2 mt-2">
            <span class="text-xs text-muted-foreground">Fecha Liquidación</span>
            <div class="flex items-center gap-1">
              <Calendar class="w-3.5 h-3.5 text-muted-foreground" />
              {{ format(new Date(liquidation.fecha_liquidacion), 'dd/MM/yyyy HH:mm', { locale: es }) }}
            </div>
          </div>
        </div>

        <!-- Información de Pago (Si ya está pagada y no se está editando) -->
        <div v-if="liquidation.estado_pago === 'paid' && !isEditingPayment" class="space-y-4 border rounded-lg p-4 bg-green-50/20 dark:bg-green-950/10 border-green-200/50">
          <h4 class="text-sm font-bold text-green-700 dark:text-green-400 flex items-center justify-between gap-1.5 w-full">
            <span class="flex items-center gap-1.5">
              <CreditCard class="w-4 h-4" />
              Información del Pago
            </span>
            <div class="flex items-center gap-2">
              <Button
                v-if="can('quotes.approve')"
                variant="link"
                size="sm"
                class="h-auto p-0 text-xs text-blue-600 hover:text-blue-700 font-medium"
                @click="startEditPayment"
              >
                Editar Pago
              </Button>
              <span v-if="can('quotes.approve')" class="text-muted-foreground text-xs">|</span>
              <Button
                v-if="can('quotes.approve')"
                variant="link"
                size="sm"
                class="h-auto p-0 text-xs text-red-600 hover:text-red-700 font-medium"
                @click="startRevertPayment"
              >
                Anular Pago
              </Button>
            </div>
          </h4>
          <div class="grid grid-cols-2 gap-4 text-xs">
            <div class="space-y-0.5">
              <span class="text-muted-foreground">Método de Pago:</span>
              <div class="font-medium capitalize">{{ liquidation.metodo_pago }}</div>
            </div>
            <div class="space-y-0.5">
              <span class="text-muted-foreground">Referencia/Comprobante:</span>
              <div class="font-medium font-mono">{{ liquidation.comprobante_pago }}</div>
            </div>
            <div class="space-y-0.5" v-if="liquidation.fecha_pago">
              <span class="text-muted-foreground">Fecha de Pago:</span>
              <div>{{ format(new Date(liquidation.fecha_pago), 'dd/MM/yyyy HH:mm', { locale: es }) }}</div>
            </div>
            <div class="space-y-0.5 col-span-2" v-if="liquidation.comprobante_url">
              <span class="text-muted-foreground block mb-1">Archivo de Comprobante:</span>
              <Button size="sm" variant="outline" as-child class="h-8 text-green-700 hover:text-green-800 border-green-200 hover:bg-green-50">
                <a :href="liquidation.comprobante_url" target="_blank" rel="noopener noreferrer">
                  <ExternalLink class="w-3.5 h-3.5 mr-1" />
                  Ver Comprobante Adjunto
                </a>
              </Button>
            </div>
            <div class="space-y-0.5 col-span-2 border-t pt-2 mt-2" v-if="liquidation.notas">
              <span class="text-muted-foreground">Notas:</span>
              <p class="text-muted-foreground italic mt-0.5">{{ liquidation.notas }}</p>
            </div>
          </div>
        </div>

        <!-- Formulario para Registrar/Editar Pago -->
        <div v-else-if="liquidation.estado_pago !== 'paid' || isEditingPayment" class="space-y-4 border rounded-lg p-4 bg-card">
          <h4 class="text-sm font-bold flex items-center gap-1.5 border-b pb-2">
            <CreditCard class="w-4 h-4 text-primary" />
            {{ isEditingPayment ? 'Editar Pago' : 'Registrar Cobro' }}
          </h4>
          
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="method">Método de Pago</Label>
                <Select v-model="paymentMethod">
                  <SelectTrigger id="method">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transferencia">Transferencia Bancaria</SelectItem>
                    <SelectItem value="efectivo">Efectivo</SelectItem>
                    <SelectItem value="deposito">Depósito Bancario</SelectItem>
                    <SelectItem value="tarjeta">Tarjeta de Crédito</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div class="space-y-2">
                <Label for="ref">Nro. Comprobante / Ref</Label>
                <Input id="ref" v-model="referenceCode" placeholder="Ej: TX-90382" />
              </div>
            </div>

            <!-- Carga de Archivo Comprobante -->
            <div class="space-y-2">
              <Label>Archivo Comprobante (Opcional - PDF o Imagen, Max 5MB)</Label>
              <div class="flex items-center gap-2">
                <Input 
                  id="receipt-file" 
                  type="file" 
                  accept="image/*,application/pdf"
                  class="hidden" 
                  @change="handleFileChange" 
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  class="w-full flex items-center justify-center gap-2 border-dashed h-20"
                  @click="() => $el.querySelector('#receipt-file').click()"
                >
                  <Upload class="w-4 h-4 text-muted-foreground" />
                  <div class="text-left">
                    <div class="text-sm font-medium">{{ fileName || 'Seleccionar Archivo' }}</div>
                    <div class="text-xs text-muted-foreground">{{ fileName ? 'Hacer clic para cambiar' : 'Arrastre o seleccione imagen/pdf' }}</div>
                  </div>
                </Button>
              </div>
            </div>

            <div class="space-y-2">
              <Label for="notes">Notas / Observaciones</Label>
              <Textarea id="notes" v-model="notes" placeholder="Detalles de facturación, cuenta de depósito, etc." rows="2" />
            </div>
          </div>
        </div>
      </div>

      <DialogFooter class="gap-2 sm:gap-0 flex-wrap">
        <Button
          v-if="liquidation && can('quotes.reopen')"
          variant="outline"
          class="border-blue-600 text-blue-600 hover:bg-blue-50 mr-auto"
          @click="startReopenQuote"
          :disabled="loading"
        >
          <LockOpen class="w-4 h-4 mr-2" />
          Reabrir Cotización
        </Button>
        <Button variant="outline" @click="emit('update:open', false)" :disabled="loading">
          Cerrar
        </Button>
        <Button 
          v-if="isEditingPayment" 
          variant="ghost"
          class="mr-2"
          @click="isEditingPayment = false" 
          :disabled="loading"
        >
          Cancelar
        </Button>
        <Button 
          v-if="liquidation && (liquidation.estado_pago !== 'paid' || isEditingPayment)" 
          class="bg-green-600 hover:bg-green-700 text-white" 
          @click="isEditingPayment ? startSaveEditPayment() : handleRegisterPayment()"
          :disabled="loading"
        >
          <Loader2 v-if="loading" class="w-4 h-4 mr-2 animate-spin" />
          {{ isEditingPayment ? 'Guardar Cambios' : 'Registrar Pago' }}
        </Button>
      </DialogFooter>

      <QuoteReopenDialog
        v-model:open="showJustificationDialog"
        :title="justificationTitle"
        :description="justificationDescription"
        :placeholder="justificationPlaceholder"
        :confirm-text="justificationConfirmText"
        @confirm="handleJustificationConfirm"
      />
    </DialogContent>
  </Dialog>
</template>
