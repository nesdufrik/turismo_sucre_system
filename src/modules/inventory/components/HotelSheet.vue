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
import HotelGeneralForm from './HotelGeneralForm.vue'
import HotelRoomsManager from './HotelRoomsManager.vue'

const props = defineProps<{
	open: boolean
	hotelId: number | null
	hotelName?: string
}>()

const emit = defineEmits<{
	(e: 'update:open', value: boolean): void
	(e: 'saved'): void
	(e: 'refresh'): void
}>()

const activeTab = ref('general')
const localHotelId = ref<number | null>(null)
const localHotelName = ref<string>('')

watch(
	() => props.open,
	(isOpen) => {
		if (isOpen) {
			activeTab.value = 'general'
			localHotelId.value = props.hotelId
			localHotelName.value = props.hotelName || ''
		}
	}
)

watch(
	() => props.hotelId,
	(newId) => {
		localHotelId.value = newId
	}
)

const onFormSaved = (newId?: number) => {
	if (newId) {
		localHotelId.value = newId
		activeTab.value = 'rooms'
		emit('refresh')
	} else {
		emit('saved')
	}
}
</script>

<template>
	<Sheet :open="open" @update:open="emit('update:open', $event)">
		<SheetContent class="w-full sm:max-w-[700px] overflow-y-auto">
			<SheetHeader>
				<SheetTitle>
					{{ 
						localHotelId 
							? `Editar Hotel: (${localHotelName})` 
							: 'Nuevo Hotel' 
					}}
				</SheetTitle>
				<SheetDescription>
					{{
						localHotelId
							? 'Modifica los detalles, habitaciones y precios.'
							: 'Completa la información básica para crear un hotel.'
					}}
				</SheetDescription>
			</SheetHeader>

			<div>
				<Tabs v-model="activeTab" class="w-full">
					<TabsList class="grid w-full grid-cols-2" v-if="localHotelId">
						<TabsTrigger value="general">Información General</TabsTrigger>
						<TabsTrigger value="rooms">Habitaciones & Precios</TabsTrigger>
					</TabsList>

					<TabsContent value="general">
						<HotelGeneralForm :hotel-id="localHotelId" @saved="onFormSaved"
							@cancel="emit('update:open', false)" />
					</TabsContent>

					<TabsContent value="rooms" v-if="localHotelId">
						<HotelRoomsManager :hotel-id="localHotelId" />
					</TabsContent>
				</Tabs>
			</div>
		</SheetContent>
	</Sheet>
</template>
