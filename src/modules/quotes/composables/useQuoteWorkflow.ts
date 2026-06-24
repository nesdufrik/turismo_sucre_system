import { computed } from 'vue'
import { usePermission } from '@/composables/usePermission'
import type { Quote } from '../QuoteService'

export function useQuoteWorkflow(quote: { value: Quote | null }) {
	const { can } = usePermission()

	// --- Computed State Checks ---

	const isDraft = computed(() => quote.value?.estado === 'Draft')
	const isInReview = computed(() => quote.value?.estado === 'In_Review')
	const isLiquidated = computed(() => quote.value?.estado === 'Liquidated')
	const isRejected = computed(() => quote.value?.estado === 'Rejected')

	// Detect if it comes from AI (n8n)
	const isAiGenerated = computed(() => {
		return (
			quote.value?.fuente_solicitud === 'n8n_agent' ||
			!!quote.value?.meta_origen
		)
	})

	// --- Permissions Logic ---

	// ¿Puede editar campos generales?
	const canEdit = computed(() => {
		// Si no hay cotización (es nueva), siempre se puede editar
		if (!quote.value) return true

		// Si está liquidada, nadie edita (Snapshot estricto contable)
		if (isLiquidated.value) return false

		// Si está en revisión:
		if (isInReview.value) {
			// Solo Ops o Admin pueden editar "en vuelo"
			return can('quotes.approve') // Usamos este permiso como proxy de "nivel supervisor"
		}

		// Si está en Borrador o Rechazada:
		// El dueño (o Admin) puede editar.
		// Simplificación: Asumimos que si tiene acceso a la vista detalle, puede editar sus borradores.
		return true
	})

	// --- Actions Availability ---

	const showRequestReview = computed(() => {
		// Visible en Draft o Rejected, y NO liquidada
		if (!quote.value) return false
		// No mostrar a usuarios que pueden liquidar directamente (supervisores/admin)
		if (can('quotes.approve')) return false
		return (
			(isDraft.value || isRejected.value) && !isLiquidated.value
		)
	})

	const showLiquidate = computed(() => {
		if (!quote.value) return false
		// Solo si tiene permiso de aprobar (supervisor)
		if (!can('quotes.approve')) return false

		// Ops/Admin pueden liquidar desde Draft (Auto-liquidate) o desde In_Review
		return isDraft.value || isInReview.value
	})

	const showReject = computed(() => {
		if (!quote.value) return false
		if (!can('quotes.approve')) return false

		// Solo tiene sentido rechazar algo que está en revisión
		// (Rechazar un borrador no tiene mucho sentido, se borra y ya)
		return isInReview.value
	})

	const showAiContext = computed(() => {
		return isAiGenerated.value
	})

	const showReopen = computed(() => {
		if (!quote.value) return false
		return isLiquidated.value && can('quotes.reopen')
	})

	return {
		isDraft,
		isInReview,
		isLiquidated,
		isRejected,
		isAiGenerated,
		canEdit,
		showRequestReview,
		showLiquidate,
		showReject,
		showAiContext,
		showReopen,
	}
}
