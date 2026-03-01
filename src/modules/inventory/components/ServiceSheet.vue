<script setup lang="ts">
import { ref, watch } from 'vue'
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ServiceGeneralForm from './ServiceGeneralForm.vue'
import ServicePricesManager from './ServicePricesManager.vue'

const props = defineProps<{
	open: boolean
	serviceId: number | null
	serviceName?: string
}>()

const emit = defineEmits<{
	(e: 'update:open', value: boolean): void
	(e: 'saved'): void
	(e: 'refresh'): void
}>()

const activeTab = ref('general')
const localServiceId = ref<number | null>(null)
const localServiceName = ref<string>('')

// Reset tab when opening for a new service or switching services
watch(
	() => props.open,
	(isOpen) => {
		if (isOpen) {
			activeTab.value = 'general'
			localServiceId.value = props.serviceId
			localServiceName.value = props.serviceName || ''
		}
	},
)

// Also watch props.serviceId in case it changes while open (unlikely but safe)
watch(
	() => props.serviceId,
	(newId) => {
		localServiceId.value = newId
	},
)

const onFormSaved = (newId?: number, newName?: string) => {
	if (newId) {
		// It was a create operation
		localServiceId.value = newId
		if (newName) localServiceName.value = newName
		activeTab.value = 'prices'
		emit('refresh') // Tell parent to update list but keep sheet open
	} else {
		// It was an update operation
		emit('saved') // Close sheet
	}
}
</script>

<template>
	<Sheet :open="open" @update:open="emit('update:open', $event)">
		<SheetContent class="w-full sm:max-w-[700px] overflow-y-auto">
			<SheetHeader>
				<SheetTitle>
					{{
						localServiceId
							? `Editar Servicio: (${localServiceName})`
							: 'Nuevo Servicio'
					}}
				</SheetTitle>
				<SheetDescription>
					{{
						localServiceId
							? 'Modifica los detalles y precios del servicio.'
							: 'Completa la información básica para crear un servicio.'
					}}
				</SheetDescription>
			</SheetHeader>

			<div>
				<Tabs v-model="activeTab">
					<TabsList class="grid w-full grid-cols-2" v-if="localServiceId">
						<TabsTrigger value="general">Información General</TabsTrigger>
						<TabsTrigger value="prices">Precios</TabsTrigger>
					</TabsList>

					<TabsContent value="general">
						<ServiceGeneralForm
							:service-id="localServiceId"
							@saved="onFormSaved"
							@cancel="emit('update:open', false)"
						/>
					</TabsContent>

					<TabsContent value="prices" v-if="localServiceId">
						<ServicePricesManager :service-id="localServiceId" />
					</TabsContent>
				</Tabs>

				<!-- If creating new, show form directly. Since TabsContent works based on value, 
             we can just use the 'general' tab content above. 
             However, if localServiceId is null, TabsList is hidden.
             So we just need to ensure activeTab is 'general' (handled in watch).
             The TabsContent for 'general' will render.
        -->
			</div>
		</SheetContent>
	</Sheet>
</template>
