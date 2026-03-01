<script setup lang="ts">
import { ref, toRef } from 'vue'
import { Button } from '@/components/ui/button'
import { toast } from 'vue-sonner'
import {
	Send,
	CheckCircle,
	XCircle,
	Eye,
	Printer,
	BadgeDollarSign,
	Share2,
} from 'lucide-vue-next'
import {
	QuoteService,
	type Quote,
	type QuoteItemWithDetails,
} from '../QuoteService'
import { useQuoteWorkflow } from '../composables/useQuoteWorkflow'
import { QuotePdfGenerator } from '@/modules/quotes/services/QuotePdfGenerator'
import QuoteRejectDialog from './QuoteRejectDialog.vue'
import QuoteSendDialog from './QuoteSendDialog.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import type { Tables } from '@/types/database.types'

const props = defineProps<{
	quote: Quote | null
}>()

const emit = defineEmits<{
	(e: 'refresh'): void
	(e: 'toggle-source'): void
}>()

const {
	showRequestReview,
	showApprove,
	showReject,
	showMarkAsSold,
	showAiContext,
} = useQuoteWorkflow(toRef(props, 'quote'))

const isProcessing = ref(false)
const showRejectDialog = ref(false)
const showSoldDialog = ref(false)
const showSendDialog = ref(false)

const quoteContext = ref<{
	items: QuoteItemWithDetails[]
	bankAccount: Tables<'cuentas_bancarias'> | null
} | null>(null)

const handleGeneratePdf = async () => {
	if (!props.quote) return

	isProcessing.value = true
	try {
		const context = await QuoteService.getFullQuoteContext(
			props.quote.cotizacion_id,
		)

		// Fetch and convert logo to base64 if it exists
		let logoBase64: string | undefined = undefined
		if (context.config?.empresa_logo_url) {
			try {
				const res = await fetch(context.config.empresa_logo_url)
				const blob = await res.blob()
				logoBase64 = await new Promise<string>((resolve, reject) => {
					const reader = new FileReader()
					reader.onloadend = () => resolve(reader.result as string)
					reader.onerror = reject
					reader.readAsDataURL(blob)
				})
			} catch (e) {
				console.error('Failed to load logo for PDF', e)
			}
		}

		const generator = new QuotePdfGenerator({
			quote: context.quote,
			items: context.items,
			bankAccount: context.bankAccount,
			agencyConfig: context.config,
			logoUrl: logoBase64,
		})
		generator.generate()
		toast.success('PDF generado correctamente')
	} catch (error: any) {
		console.error(error)
		toast.error('Error al generar PDF', { description: error.message })
	} finally {
		isProcessing.value = false
	}
}

const handleOpenSendDialog = async () => {
	if (!props.quote) return

	isProcessing.value = true
	try {
		const context = await QuoteService.getFullQuoteContext(
			props.quote.cotizacion_id,
		)
		quoteContext.value = {
			items: context.items,
			bankAccount: context.bankAccount,
		}
		showSendDialog.value = true
	} catch (error: any) {
		toast.error('Error al cargar datos de la cotización')
	} finally {
		isProcessing.value = false
	}
}

const handleStatusChange = async (
	status: 'Draft' | 'In_Review' | 'Approved' | 'Rejected' | 'Sold',
	reason?: string,
) => {
	if (!props.quote) return

	// Confirmation for Sold is handled via Dialog now
	isProcessing.value = true
	try {
		await QuoteService.updateStatus(props.quote.cotizacion_id, status, reason)
		const msg =
			status === 'Sold'
				? '¡Venta Cerrada! Felicitaciones.'
				: `Estado actualizado a: ${status}`
		toast.success(msg)
		emit('refresh')
	} catch (error: any) {
		toast.error('Error al actualizar estado', { description: error.message })
	} finally {
		isProcessing.value = false
		showRejectDialog.value = false
		showSoldDialog.value = false
	}
}
</script>

<template>
	<div class="flex items-center gap-2" v-if="quote">
		<!-- PDF Generation -->
		<Button
			variant="outline"
			size="sm"
			:disabled="isProcessing"
			@click="handleGeneratePdf"
		>
			<Printer />
			PDF
		</Button>

		<!-- Send to Client -->
		<HasPermission name="quotes.send">
			<Button
				variant="outline"
				size="sm"
				:disabled="isProcessing"
				@click="handleOpenSendDialog"
			>
				<Share2 />
				Responder
			</Button>
		</HasPermission>

		<!-- View Original Email (n8n) -->
		<Button
			v-if="showAiContext"
			variant="outline"
			size="sm"
			@click="emit('toggle-source')"
		>
			<Eye />
			Ver Solicitud Original
		</Button>

		<!-- Workflow Actions -->
		<HasPermission name="quotes.request_review">
			<Button
				v-if="showRequestReview"
				variant="secondary"
				size="sm"
				:disabled="isProcessing"
				@click="handleStatusChange('In_Review')"
			>
				<Send />
				Solicitar Revisión
			</Button>
		</HasPermission>

		<HasPermission name="quotes.approve">
			<Button
				v-if="showReject"
				variant="destructive"
				size="sm"
				:disabled="isProcessing"
				@click="showRejectDialog = true"
			>
				<XCircle />
				Rechazar
			</Button>
		</HasPermission>

		<HasPermission name="quotes.approve">
			<Button
				v-if="showApprove"
				class="bg-green-600 hover:bg-green-700 text-white"
				size="sm"
				:disabled="isProcessing"
				@click="handleStatusChange('Approved')"
			>
				<CheckCircle />
				Aprobar
			</Button>
		</HasPermission>

		<HasPermission name="quotes.approve">
			<Button
				v-if="showMarkAsSold"
				class="bg-blue-600 hover:bg-blue-700 text-white"
				size="sm"
				:disabled="isProcessing"
				@click="showSoldDialog = true"
			>
				<BadgeDollarSign />
				Cerrar Venta
			</Button>
		</HasPermission>

		<!-- Dialogs -->
		<QuoteRejectDialog
			v-model:open="showRejectDialog"
			@confirm="(reason) => handleStatusChange('Rejected', reason)"
		/>

		<QuoteSendDialog
			v-if="quoteContext"
			v-model:open="showSendDialog"
			:quote="quote as any"
			:items="quoteContext.items"
			:bank-account="quoteContext.bankAccount"
		/>

		<ConfirmDialog
			v-model:open="showSoldDialog"
			:loading="isProcessing"
			title="¿Cerrar Venta?"
			description="Estás confirmando que el cliente ha aceptado y pagado la cotización. Esto marcará la operación como exitosa."
			confirm-text="Confirmar Venta"
			@confirm="handleStatusChange('Sold')"
		/>
	</div>
</template>
