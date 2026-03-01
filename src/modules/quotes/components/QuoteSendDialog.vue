<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'vue-sonner'
import { Mail, Check, Clipboard } from 'lucide-vue-next'
import type { QuoteWithClient, QuoteItemWithDetails } from '../QuoteService'
import { QuoteMessageGenerator } from '../services/QuoteMessageGenerator'
import type { Tables } from '@/types/database.types'

const props = defineProps<{
  open: boolean
  quote: QuoteWithClient
  items: QuoteItemWithDetails[]
  bankAccount: Tables<'cuentas_bancarias'> | null
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

const generator = computed(() => new QuoteMessageGenerator(props.quote, props.items, props.bankAccount))
const htmlContent = computed(() => generator.value.generateHtml(introMessage.value))

// Email Form State
const recipientEmail = ref(props.quote.clientes?.email || '')
const subject = ref(`Cotización #${props.quote.cotizacion_id} - ${props.quote.nombre_grupo || 'Turismo Sucre'}`)
const introMessage = ref(`Estimado ${props.quote.clientes?.nombre_completo || 'cliente'},\n\nAdjunto le envío el detalle de los servicios cotizados para su revisión. Quedo atento a cualquier consulta.`)

const isCopied = ref(false)
const isSending = ref(false)

const handleCopyRichText = async () => {
  try {
    const blob = new Blob([htmlContent.value], { type: 'text/html' })
    const plainBlob = new Blob([introMessage.value + '\n\n' + 'Ver detalle en el mensaje adjunto.'], { type: 'text/plain' })
    
    const data = [new ClipboardItem({
      'text/html': blob,
      'text/plain': plainBlob
    })]
    
    await navigator.clipboard.write(data)
    isCopied.value = true
    toast.success('Cotización copiada con formato (Tablas incluidas)')
    setTimeout(() => (isCopied.value = false), 2000)
  } catch (err) {
    console.error(err)
    toast.error('Error al copiar contenido enriquecido')
  }
}

const handleSendEmail = async () => {
  if (!recipientEmail.value) {
    toast.error('Debe ingresar un correo electrónico de destino')
    return
  }

  isSending.value = true
  try {
    const { supabase } = await import('@/lib/supabase')
    
    const { data, error } = await supabase.functions.invoke('send-response-quote', {
      body: { 
        to: recipientEmail.value,
        subject: subject.value,
        html: htmlContent.value
      }
    })

    if (error) throw error

    if (data?.message?.includes('Simulation')) {
      toast.warning(data.message, {
        description: 'La función se ejecutó pero el SMTP no está configurado en el servidor.'
      })
    } else {
      toast.success('¡Correo enviado con éxito!', {
        description: `Se ha enviado la cotización a ${recipientEmail.value}`
      })
      emit('update:open', false)
    }
  } catch (error: any) {
    console.error('Error al enviar correo:', error)
    toast.error('Error al enviar el correo', {
      description: error.message || 'Inténtelo de nuevo más tarde'
    })
  } finally {
    isSending.value = false
  }
}

watch(() => props.quote, (newQuote) => {
  recipientEmail.value = newQuote.clientes?.email || ''
  subject.value = `Cotización #${newQuote.cotizacion_id} - ${newQuote.nombre_grupo || 'Turismo Sucre'}`
}, { immediate: true })

</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="max-w-[95vw] lg:max-w-6xl h-[90vh] flex flex-col p-0 overflow-hidden">
      <div class="p-6 border-b">
        <DialogHeader>
          <DialogTitle>Responder al Solicitante</DialogTitle>
          <DialogDescription>
            Personalice el mensaje y copie el contenido con formato para su correo.
          </DialogDescription>
        </DialogHeader>
      </div>

      <div class="grow overflow-hidden grid grid-cols-1 lg:grid-cols-5 bg-muted/20">
        <!-- Form Section -->
        <div class="lg:col-span-2 p-6 space-y-4 overflow-y-auto border-r">
          <div class="space-y-2">
            <Label for="email">Para (Email):</Label>
            <Input id="email" v-model="recipientEmail" placeholder="correo@cliente.com" />
          </div>
          <div class="space-y-2">
            <Label for="subject">Asunto del Correo:</Label>
            <Input id="subject" v-model="subject" />
          </div>
          <div class="space-y-2">
            <Label for="message">Mensaje Introductorio:</Label>
            <Textarea id="message" v-model="introMessage" class="min-h-[200px]" />
          </div>
        </div>

        <!-- Preview Section -->
        <div class="lg:col-span-3 flex flex-col ">
           <div class="bg-muted px-4 py-2 text-[10px] uppercase font-bold text-muted-foreground border-b flex justify-between items-center shrink-0">
              <span>Vista Previa del Mensaje</span>
              <span class="text-primary italic">Formato enriquecido activado</span>
           </div>
           
           <ScrollArea class="grow bg-white h-72 rounded-md border">
              <div class="p-8 min-w-fit">
                <div class="max-w-[768px] mx-auto">
                   <div v-html="htmlContent" class="overflow-x-auto"></div>
                </div>
              </div>
           </ScrollArea>
        </div>
      </div>

      <div class="p-6 border-t shrink-0">
        <DialogFooter class="flex flex-col sm:flex-row justify-between items-center gap-4">
          <Button variant="outline" @click="emit('update:open', false)">Cerrar</Button>
          <div class="flex gap-2 w-full sm:w-auto">
            <Button variant="secondary" class="flex-1 sm:flex-none" @click="handleCopyRichText">
              <Check v-if="isCopied" class="w-4 h-4 mr-2" />
              <Clipboard v-else class="w-4 h-4 mr-2" />
              {{ isCopied ? '¡Copiado!' : 'Copiar con Formato' }}
            </Button>
            <Button :disabled="isSending" class="flex-1 sm:flex-none" @click="handleSendEmail">
              <Mail class="w-4 h-4 mr-2" />
              {{ isSending ? 'Enviando...' : 'Enviar por Correo' }}
            </Button>
          </div>
        </DialogFooter>
      </div>
    </DialogContent>
  </Dialog>
</template>
