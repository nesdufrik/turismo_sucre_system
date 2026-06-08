<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { QuoteService, type Quote } from '../QuoteService'
import { ClientService } from '@/modules/crm/ClientService'
import { useQuoteWorkflow } from '../composables/useQuoteWorkflow'
import { quoteSchema } from '../schemas/quote.schema'

// Components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { toast } from 'vue-sonner'
import { ArrowLeft, Save, Plus } from 'lucide-vue-next'
import type { Tables } from '@/types/database.types'
import { Switch } from '@/components/ui/switch'

import QuoteItemsList from './QuoteItemsList.vue'
import ClientSheet from '@/modules/crm/components/ClientSheet.vue'
import QuoteActions from './QuoteActions.vue'
import QuoteStatusBadge from './QuoteStatusBadge.vue'
import QuoteSourceViewer from './QuoteSourceViewer.vue'
import SearchableSelect from '@/components/common/SearchableSelect.vue'

const props = defineProps<{
	quoteId?: number
}>()

const router = useRouter()
const isLoading = ref(false)
const showNewClient = ref(false)
const showSourcePanel = ref(false)

const clients = ref<Tables<'clientes'>[]>([])
const bankAccounts = ref<Tables<'cuentas_bancarias'>[]>([])
const currentQuote = ref<Quote | null>(null)
const currentHojaId = ref<number | null>(null)
const selectedClientObject = ref<Tables<'clientes'> | null>(null)

// Workflow Logic
const { canEdit } = useQuoteWorkflow(currentQuote as any)

// Form Schema
const formSchema = toTypedSchema(quoteSchema)

const form = useForm({
	validationSchema: formSchema,
	initialValues: {
		moneda: 'USD',
		estado: 'Draft',
		cantidad_pax: 1,
		cantidad_pax_ninos: 0,
		porcentaje_pago_ninos: 50.0,
		porcentaje_impuesto: 16.0,
		porcentaje_comision: 0.0,
		tipo_cambio: 7.05,
		codigo_referencia: '',
		tiene_tour_conductor: false,
		costo_tour_conductor: 0.00,
	},
})

const paxEfectivo = computed(() => {
	const adults = Number(form.values.cantidad_pax) || 1
	const kids = Number(form.values.cantidad_pax_ninos) || 0
	const pctKids = Number(form.values.porcentaje_pago_ninos) ?? 50.0
	return adults + kids * (pctKids / 100)
})

const loadDependencies = async () => {
	try {
		const [clientsData, banksData] = await Promise.all([
			ClientService.searchClients(''), // Load 20 recent instead of all
			QuoteService.getBankAccounts(),
		])
		clients.value = clientsData
		bankAccounts.value = banksData

		// If it's a new quote, load system defaults
		if (!props.quoteId) {
			const config = await QuoteService.getSystemConfig()
			if (config) {
				form.setValues({
					tipo_cambio: config.tipo_cambio_oficial,
					porcentaje_impuesto: config.porcentaje_impuesto_default,
					porcentaje_comision: config.porcentaje_comision_default,
				})
			}

			const defaultBank = banksData.find((b) => b.es_default)
			if (defaultBank) {
				form.setFieldValue('id_cuenta_bancaria', defaultBank.id)
			}
		}
	} catch (error) {
		toast.error('Error al cargar dependencias')
	}
}

const searchClients = async (query: string) => {
	return await ClientService.searchClients(query)
}

// Watch for client selection to update Hoja ID
watch(
	() => form.values.cliente_id,
	(newId) => {
		if (newId) {
			// Check if we have the full object from @select
			if (
				selectedClientObject.value &&
				selectedClientObject.value.cliente_id === newId
			) {
				currentHojaId.value = selectedClientObject.value.hoja_id
				return
			}
			// Fallback to local clients list
			const client = clients.value.find((c) => c.cliente_id === newId)
			if (client) {
				currentHojaId.value = client.hoja_id
			}
		} else {
			currentHojaId.value = null
		}
	},
)

const onClientSaved = async (newClientId: number) => {
	await loadDependencies()
	form.setFieldValue('cliente_id', newClientId)
}

const loadQuote = async (id: number) => {
	isLoading.value = true
	try {
		const quote = await QuoteService.getQuoteById(id)
		currentQuote.value = quote // Update state for workflow

		// Ensure the selected client is in our objects for hoja_id lookup
		if (quote.clientes) {
			selectedClientObject.value = quote.clientes as any
			if (!clients.value.find((c) => c.cliente_id === quote.cliente_id)) {
				clients.value = [quote.clientes as any, ...clients.value]
			}
		}

		form.setValues({
			cliente_id: quote.cliente_id || undefined,
			nombre_grupo: quote.nombre_grupo || '',
			cantidad_pax: quote.cantidad_pax || 1,
			cantidad_pax_ninos: quote.cantidad_pax_ninos || 0,
			porcentaje_pago_ninos: Number(quote.porcentaje_pago_ninos) ?? 50.0,
			fecha_validez_hasta: quote.fecha_validez_hasta || undefined,
			moneda: (quote.moneda as any) || 'USD',
			tipo_cambio: quote.tipo_cambio ?? 7.05,
			porcentaje_impuesto: quote.porcentaje_impuesto ?? 16.0,
			porcentaje_comision: quote.porcentaje_comision ?? 0.0,
			id_cuenta_bancaria: quote.id_cuenta_bancaria || undefined,
			estado: (quote.estado as any) || 'Draft',
			notas_para_cliente: quote.notas_para_cliente || '',
			notas_internas_agencia: quote.notas_internas_agencia || '',
			codigo_referencia: quote.codigo_referencia || '',
			tiene_tour_conductor: quote.tiene_tour_conductor || false,
			costo_tour_conductor: Number(quote.costo_tour_conductor) || 0.00,
		})
	} catch (error: any) {
		toast.error('Error al cargar cotización', { description: error.message })
		router.push({ name: 'Quotes' })
	} finally {
		isLoading.value = false
	}
}

onMounted(async () => {
	await loadDependencies()
	if (props.quoteId) {
		loadQuote(props.quoteId)
	}
})

const onSubmit = form.handleSubmit(async (values) => {
	isLoading.value = true
	try {
		if (props.quoteId) {
			await QuoteService.updateQuote(props.quoteId, values as any)
			toast.success('Cotización actualizada')
			loadQuote(props.quoteId) // Refresh to ensure sync
		} else {
			const newQuote = await QuoteService.createQuote(values as any)
			toast.success('Cotización creada')
			// Redirect to edit mode to add items
			router.replace({
				name: 'QuoteEdit',
				params: { id: newQuote.cotizacion_id },
			})
		}
	} catch (error: any) {
		toast.error('Error al guardar', { description: error.message })
	} finally {
		isLoading.value = false
	}
})
</script>

<template>
	<div class="space-y-6">
		<!-- Header Actions -->
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-4">
				<Button variant="outline" size="icon" @click="router.back()">
					<ArrowLeft class="w-4 h-4" />
				</Button>
				<div>
					<div class="flex items-center gap-2">
						<h3 class="text-lg font-medium">
							{{
								currentQuote?.codigo_referencia
									? `Cotización ${currentQuote.codigo_referencia}`
									: quoteId
										? `Cotización #${quoteId}`
										: 'Nueva Cotización'
							}}
						</h3>
						<QuoteStatusBadge
							v-if="currentQuote"
							:status="currentQuote.estado"
						/>
					</div>
					<p class="text-sm text-muted-foreground">Gestión y configuración.</p>
				</div>
			</div>

			<div class="flex items-center gap-2">
				<QuoteActions
					v-if="quoteId"
					:quote="currentQuote"
					@refresh="loadQuote(quoteId!)"
					@toggle-source="showSourcePanel = true"
				/>

				<Button
					v-if="canEdit"
					@click="onSubmit"
					:disabled="isLoading"
					size="sm"
				>
					<Save />
					Guardar
				</Button>
			</div>
		</div>

		<!-- Alert for Rejected Reason -->
		<div
			v-if="currentQuote?.estado === 'Rejected' && currentQuote.motivo_rechazo"
			class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
			role="alert"
		>
			<strong class="font-bold">Cotización Rechazada: </strong>
			<span class="block sm:inline">{{ currentQuote.motivo_rechazo }}</span>
		</div>

		<!-- Main Form -->
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<!-- Left Column: Header Info -->
			<div class="lg:col-span-1 space-y-6">
				<Card>
					<CardHeader>
						<CardTitle>Datos Generales</CardTitle>
					</CardHeader>
					<CardContent class="space-y-4">
						<form @submit="onSubmit">
							<fieldset :disabled="!canEdit" class="space-y-4">
								<FormField name="cliente_id">
									<FormItem>
										<div class="flex items-center justify-between">
											<FormLabel>Para (Agencia/Cliente)</FormLabel>
											<Button
												v-if="canEdit"
												variant="ghost"
												size="sm"
												class="h-6 px-2 text-xs text-primary"
												@click.prevent="showNewClient = true"
											>
												<Plus class="w-3 h-3 mr-1" /> Nuevo
											</Button>
										</div>
										<FormControl>
											<SearchableSelect
												:model-value="form.values.cliente_id"
												:items="clients"
												label-key="nombre_completo"
												value-key="cliente_id"
												placeholder="Seleccionar Cliente"
												search-placeholder="Buscar por nombre o NIT..."
												mode="async"
												:search-fn="searchClients"
												:disabled="!canEdit"
												@update:model-value="
													form.setFieldValue('cliente_id', $event)
												"
												@select="(item) => (selectedClientObject = item)"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								</FormField>

								<FormField v-slot="{ componentField }" name="nombre_grupo">
									<FormItem>
										<FormLabel>Nombre del Grupo / Evento</FormLabel>
										<FormControl>
											<Input
												placeholder="Ej. GRP ROTARY"
												v-bind="componentField"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								</FormField>

								<div class="grid grid-cols-2 gap-4">
									<FormField v-slot="{ componentField }" name="cantidad_pax">
										<FormItem>
											<FormLabel>Pax Adultos</FormLabel>
											<FormControl>
												<Input type="number" v-bind="componentField" />
											</FormControl>
											<FormMessage />
										</FormItem>
									</FormField>

									<FormField
										v-slot="{ componentField }"
										name="cantidad_pax_ninos"
									>
										<FormItem>
											<FormLabel>Pax Niños</FormLabel>
											<FormControl>
												<Input type="number" v-bind="componentField" />
											</FormControl>
											<FormMessage />
										</FormItem>
									</FormField>
								</div>

								<div
									v-if="(form.values.cantidad_pax_ninos || 0) > 0"
									class="grid grid-cols-2 gap-4"
								>
									<FormField
										v-slot="{ componentField }"
										name="porcentaje_pago_ninos"
									>
										<FormItem>
											<FormLabel>% Pago Niños</FormLabel>
											<FormControl>
												<Input type="number" step="1" v-bind="componentField" />
											</FormControl>
											<FormMessage />
										</FormItem>
									</FormField>
								</div>

								<Separator class="my-4" />
								<h4 class="text-sm font-semibold mb-3">
									Tour Conductor (TC)
								</h4>

								<FormField v-slot="{ value, handleChange }" name="tiene_tour_conductor">
									<FormItem class="flex flex-row items-center justify-between rounded-lg border p-3 shadow-xs">
										<div class="space-y-0.5">
											<FormLabel>¿Tiene Tour Conductor (TC)?</FormLabel>
											<div class="text-[11px] text-muted-foreground">
												Activar si el grupo tiene un TC asignado
											</div>
										</div>
										<FormControl>
											<Switch
												:modelValue="value"
												@update:modelValue="handleChange"
											/>
										</FormControl>
									</FormItem>
								</FormField>

								<FormField
									v-slot="{ componentField }"
									v-if="form.values.tiene_tour_conductor"
									name="costo_tour_conductor"
								>
									<FormItem>
										<FormLabel>Monto Fijo a Cobrar (TC)</FormLabel>
										<FormControl>
											<Input type="number" step="0.01" min="0" placeholder="0.00" v-bind="componentField" />
										</FormControl>
										<FormMessage />
									</FormItem>
								</FormField>

								<!-- Estado Field Hidden or Readonly in UI (Managed by Workflow) -->
								<div class="hidden">
									<FormField v-slot="{ componentField }" name="estado">
										<Input v-bind="componentField" />
									</FormField>
								</div>

								<Separator class="my-4" />
								<h4 class="text-sm font-semibold mb-3">
									Configuración Financiera
								</h4>

								<div class="grid grid-cols-2 gap-4">
									<FormField v-slot="{ componentField }" name="moneda">
										<FormItem>
											<FormLabel>Moneda Base</FormLabel>
											<Select v-bind="componentField">
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Moneda" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="USD">Dólares (USD)</SelectItem>
													<SelectItem value="BOB">Bolivianos (BOB)</SelectItem>
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									</FormField>

									<FormField v-slot="{ componentField }" name="tipo_cambio">
										<FormItem>
											<FormLabel>T/C (Bs.)</FormLabel>
											<FormControl>
												<Input
													type="number"
													step="0.01"
													v-bind="componentField"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									</FormField>
								</div>

								<div class="grid grid-cols-2 gap-4 mt-4">
									<FormField
										v-slot="{ componentField }"
										name="porcentaje_impuesto"
									>
										<FormItem>
											<FormLabel>% IVA (Factura)</FormLabel>
											<FormControl>
												<Input
													type="number"
													step="0.1"
													v-bind="componentField"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									</FormField>

									<FormField
										v-slot="{ componentField }"
										name="porcentaje_comision"
									>
										<FormItem>
											<FormLabel>% Comisión Ag.</FormLabel>
											<FormControl>
												<Input
													type="number"
													step="0.1"
													v-bind="componentField"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									</FormField>
								</div>

								<FormField
									v-slot="{ componentField }"
									name="id_cuenta_bancaria"
								>
									<FormItem class="mt-4">
										<FormLabel>Cuenta para Depósito</FormLabel>
										<Select v-bind="componentField">
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Seleccionar Cuenta" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem
													v-for="bank in bankAccounts"
													:key="bank.id"
													:value="bank.id"
												>
													{{ bank.banco }} ({{ bank.moneda }})
												</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								</FormField>


								<Separator class="my-4" />

								<FormField
									v-slot="{ componentField }"
									name="notas_para_cliente"
								>
									<FormItem>
										<FormLabel>Notas para el Cliente</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Mensaje visible en el PDF..."
												v-bind="componentField"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								</FormField>

								<FormField
									v-slot="{ componentField }"
									name="notas_internas_agencia"
								>
									<FormItem class="mt-4">
										<FormLabel>Notas Internas</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Solo visible para la agencia..."
												v-bind="componentField"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								</FormField>
							</fieldset>
						</form>
					</CardContent>
				</Card>
			</div>

			<!-- Right Column: Items (Only visible if quote exists) -->
			<div class="lg:col-span-2">
				<div v-if="quoteId">
					<QuoteItemsList
						:quote-id="quoteId"
						:hoja-id="currentHojaId"
						:pax="paxEfectivo"
						:cantidad-pax-adultos="form.values.cantidad_pax || 1"
						:cantidad-pax-ninos="form.values.cantidad_pax_ninos || 0"
						:porcentaje-pago-ninos="form.values.porcentaje_pago_ninos || 50"
						:tax-percent="form.values.porcentaje_impuesto || 0"
						:comm-percent="form.values.porcentaje_comision || 0"
						:exchange-rate="form.values.tipo_cambio || 7.05"
						:currency="form.values.moneda || 'USD'"
						:tiene-tour-conductor="form.values.tiene_tour_conductor || false"
						:costo-tour-conductor="form.values.costo_tour_conductor || 0"
						:readonly="!canEdit"
						@refresh="quoteId && loadQuote(quoteId)"
					/>
				</div>
				<div
					v-else
					class="flex items-center justify-center h-full min-h-[300px] border-2 border-dashed rounded-lg text-muted-foreground bg-muted/10"
				>
					<p>Guarda la cabecera para comenzar a agregar items.</p>
				</div>
			</div>
		</div>

		<!-- Modals & Sheets -->
		<ClientSheet
			v-model:open="showNewClient"
			:client-id="null"
			@saved="onClientSaved"
		/>

		<QuoteSourceViewer
			v-if="currentQuote"
			v-model:open="showSourcePanel"
			:data="currentQuote.meta_origen"
		/>
	</div>
</template>
