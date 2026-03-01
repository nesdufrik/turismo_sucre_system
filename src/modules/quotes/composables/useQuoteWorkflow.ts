import { computed } from 'vue'
import { usePermission } from '@/composables/usePermission'
import type { Quote } from '../QuoteService'

export function useQuoteWorkflow(quote: { value: Quote | null }) {
	const { can } = usePermission()

	// --- Computed State Checks ---

	const isDraft = computed(() => quote.value?.estado === 'Draft')
	const isInReview = computed(() => quote.value?.estado === 'In_Review')
	const isApproved = computed(() => quote.value?.estado === 'Approved')
	const isRejected = computed(() => quote.value?.estado === 'Rejected')
	const isSold = computed(() => quote.value?.estado === 'Sold')

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

		// Si está vendida, nadie edita (Snapshot estricto contable)
		if (isSold.value) return false

		// Si está aprobada, solo Ops/Admin pueden editar el Snapshot
		if (isApproved.value) {
			return can('quotes.approve')
		}

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
		// Visible en Draft o Rejected, y NO aprobada ni vendida
		if (!quote.value) return false
		return (
			(isDraft.value || isRejected.value) && !isApproved.value && !isSold.value
		)
	})

	const showApprove = computed(() => {
		if (!quote.value) return false
		// Solo si tiene permiso de aprobar
		if (!can('quotes.approve')) return false

		// Ops/Admin pueden aprobar desde Draft (Auto-approve) o desde In_Review
		return isDraft.value || isInReview.value
	})

	const showReject = computed(() => {
		if (!quote.value) return false
		if (!can('quotes.approve')) return false

		// Solo tiene sentido rechazar algo que está en revisión
		// (Rechazar un borrador no tiene mucho sentido, se borra y ya)
		return isInReview.value
	})

	const showMarkAsSold = computed(() => {
		if (!quote.value) return false
		// Solo visible si está aprobada.
		// Todos (Agentes y Ops) deberían poder marcarla como vendida si el cliente confirma.
		return isApproved.value
	})

	const showAiContext = computed(() => {
		return isAiGenerated.value
	})

	return {
		isDraft,
		isInReview,
		isApproved,
		isRejected,
		isSold,
		isAiGenerated,
		canEdit,
		showRequestReview,
		showApprove,
		showReject,
		showMarkAsSold,
		showAiContext,
	}
}
