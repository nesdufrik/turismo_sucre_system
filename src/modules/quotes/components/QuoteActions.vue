<script setup lang="ts">
import { ref, toRef } from 'vue'
import { Button } from '@/components/ui/button'
import { toast } from 'vue-sonner'
import {
	Send,
	XCircle,
	Eye,
	Printer,
	BadgeDollarSign,
	Share2,
	Download,
	ChevronDown,
} from 'lucide-vue-next'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
	QuoteService,
	type Quote,
	type QuoteItemWithDetails,
} from '../QuoteService'
import { useQuoteWorkflow } from '../composables/useQuoteWorkflow'
import { QuotePdfGenerator } from '@/modules/quotes/services/QuotePdfGenerator'
import { useAuthStore } from '@/stores/auth'
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

const authStore = useAuthStore()

const {
	showRequestReview,
	showLiquidate,
	showReject,
	showAiContext,
} = useQuoteWorkflow(toRef(props, 'quote'))

const isProcessing = ref(false)
const showRejectDialog = ref(false)
const showLiquidateDialog = ref(false)
const showSendDialog = ref(false)

const quoteContext = ref<{
	items: QuoteItemWithDetails[]
	bankAccount: Tables<'cuentas_bancarias'> | null
	agencyConfig: Tables<'configuracion_sistema'> | null
	logoUrl: string | null
} | null>(null)

const handleGeneratePdf = async (action: 'open' | 'download' = 'open') => {
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
		generator.generate(action)
		toast.success(action === 'download' ? 'PDF descargado correctamente' : 'PDF generado correctamente')
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

		// Fetch and convert logo to base64/URL if available
		let logoUrl: string | null = null
		if (context.config?.empresa_logo_url) {
			logoUrl = context.config.empresa_logo_url
		}

		quoteContext.value = {
			items: context.items,
			bankAccount: context.bankAccount,
			agencyConfig: context.config,
			logoUrl,
		}
		showSendDialog.value = true
	} catch (error: any) {
		toast.error('Error al cargar datos de la cotización')
	} finally {
		isProcessing.value = false
	}
}

const handleStatusChange = async (
	status: 'Draft' | 'In_Review' | 'Liquidated' | 'Rejected',
	reason?: string,
) => {
	if (!props.quote) return

	isProcessing.value = true
	try {
		await QuoteService.updateStatus(props.quote.cotizacion_id, status, reason)
		toast.success(`Estado actualizado a: ${status}`)
		emit('refresh')
	} catch (error: any) {
		toast.error('Error al actualizar estado', { description: error.message })
	} finally {
		isProcessing.value = false
		showRejectDialog.value = false
	}
}

const handleLiquidate = async () => {
	if (!props.quote) return

	isProcessing.value = true
	try {
		const userId = authStore.user?.id
		if (!userId) throw new Error('Usuario no autenticado')

		await QuoteService.liquidateQuote(props.quote.cotizacion_id, userId)
		toast.success('¡Cotización Liquidada con éxito!')
		emit('refresh')
	} catch (error: any) {
		toast.error('Error al liquidar cotización', { description: error.message })
	} finally {
		isProcessing.value = false
		showLiquidateDialog.value = false
	}
}
</script>

<template>
	<div class="flex flex-wrap items-center gap-2" v-if="quote">
		<!-- PDF Actions Dropdown -->
		<DropdownMenu>
			<DropdownMenuTrigger as-child>
				<Button
					variant="outline"
					size="sm"
					:disabled="isProcessing"
					title="Opciones de PDF"
				>
					<Printer class="w-4 h-4 mr-2" />
					PDF
					<ChevronDown class="w-4 h-4 ml-2" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start">
				<DropdownMenuItem @click="handleGeneratePdf('open')">
					<Eye class="w-4 h-4 mr-2" />
					Ver PDF (Nueva Pestaña)
				</DropdownMenuItem>
				<DropdownMenuItem @click="handleGeneratePdf('download')">
					<Download class="w-4 h-4 mr-2" />
					Descargar PDF
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>

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
				v-if="showLiquidate"
				class="bg-green-600 hover:bg-green-700 text-white"
				size="sm"
				:disabled="isProcessing"
				@click="showLiquidateDialog = true"
			>
				<BadgeDollarSign class="w-4 h-4 mr-2" />
				Liquidar
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
			:agency-config="quoteContext.agencyConfig"
			:logo-url="quoteContext.logoUrl"
		/>

		<ConfirmDialog
			v-model:open="showLiquidateDialog"
			:loading="isProcessing"
			title="¿Liquidar Cotización?"
			description="Al liquidar la cotización se creará una liquidación de servicios y el estado cambiará a Liquidada. Esta acción no se puede deshacer."
			confirm-text="Confirmar Liquidación"
			@confirm="handleLiquidate"
		/>
	</div>
</template>
