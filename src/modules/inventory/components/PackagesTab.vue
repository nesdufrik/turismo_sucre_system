<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { InventoryService } from '../InventoryService'
import PackageSheet from './PackageSheet.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { toast } from 'vue-sonner'
import { Pencil, Trash2, Plus, Search, Layers } from 'lucide-vue-next'
import { Skeleton } from '@/components/ui/skeleton'
import EmptyState from '@/components/EmptyState.vue'
import { useConfirm } from '@/composables/useConfirm'

const packages = ref<any[]>([])
const isLoading = ref(false)
const searchQuery = ref('')
const isSheetOpen = ref(false)
const selectedPackageId = ref<number | null>(null)

const { confirm } = useConfirm()

const fetchPackages = async () => {
	isLoading.value = true
	try {
		packages.value = await InventoryService.getPackages()
	} catch (error: any) {
		toast.error('Error al cargar paquetes', { description: error.message })
	} finally {
		isLoading.value = false
	}
}

const filteredPackages = computed(() => {
	if (!searchQuery.value) return packages.value
	const query = searchQuery.value.toLowerCase()
	return packages.value.filter(
		(pkg) =>
			pkg.nombre_paquete.toLowerCase().includes(query) ||
			pkg.descripcion?.toLowerCase().includes(query)
	)
})

const openCreateSheet = () => {
	selectedPackageId.value = null
	isSheetOpen.value = true
}

const openEditSheet = (id: number) => {
	selectedPackageId.value = id
	isSheetOpen.value = true
}

const deletePackage = async (id: number) => {
	const confirmed = await confirm({
		title: '¿Eliminar paquete?',
		description:
			'Esta acción no se puede deshacer. Se eliminarán los precios asociados.',
		variant: 'destructive',
		confirmText: 'Eliminar',
	})

	if (!confirmed) return

	try {
		await InventoryService.deletePackage(id)
		toast.success('Paquete eliminado')
		fetchPackages()
	} catch (error: any) {
		toast.error('Error al eliminar', { description: error.message })
	}
}

const onSheetClose = (shouldRefresh: boolean) => {
	isSheetOpen.value = false
	if (shouldRefresh) {
		fetchPackages()
	}
}

onMounted(() => {
	fetchPackages()
})
</script>

<template>
	<div class="space-y-4">
		<div class="flex items-center justify-between">
			<div class="relative max-w-sm w-full">
				<Search class="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
				<Input
					placeholder="Buscar paquetes..."
					v-model="searchQuery"
					class="pl-8"
				/>
			</div>
			<HasPermission name="inventory.manage">
				<Button @click="openCreateSheet">
					<Plus />
					Nuevo Paquete
				</Button>
			</HasPermission>
		</div>

		<div class="border rounded-md bg-card">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Nombre del Paquete</TableHead>
						<TableHead>Descripción</TableHead>
						<TableHead class="text-right">Acciones</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					<template v-if="isLoading">
						<TableRow v-for="i in 5" :key="i">
							<TableCell><Skeleton class="h-5 w-48" /></TableCell>
							<TableCell><Skeleton class="h-4 w-64" /></TableCell>
							<TableCell class="text-right"
								><Skeleton class="h-8 w-20 ml-auto"
							/></TableCell>
						</TableRow>
					</template>

					<template v-else-if="filteredPackages.length === 0">
						<TableRow>
							<TableCell colspan="3" class="p-0">
								<EmptyState
									title="No hay paquetes"
									:description="
										searchQuery
											? 'No hay resultados para tu búsqueda.'
											: 'Crea paquetes combinando múltiples servicios.'
									"
									:icon="Layers"
									:action-label="searchQuery ? undefined : 'Nuevo Paquete'"
									@action="openCreateSheet"
								/>
							</TableCell>
						</TableRow>
					</template>

					<TableRow
						v-else
						v-for="pkg in filteredPackages"
						:key="pkg.paquete_id"
					>
						<TableCell class="font-medium">{{ pkg.nombre_paquete }}</TableCell>
						<TableCell class="text-muted-foreground truncate max-w-[300px]">{{
							pkg.descripcion || '-'
						}}</TableCell>
						<TableCell class="text-right">
							<div class="flex justify-end gap-2">
								<HasPermission name="inventory.manage">
									<Button
										variant="ghost"
										size="icon"
										@click="openEditSheet(pkg.paquete_id)"
									>
										<Pencil class="w-4 h-4" />
									</Button>
								</HasPermission>
								<HasPermission name="inventory.manage">
									<Button
										variant="ghost"
										size="icon"
										class="text-destructive"
										@click="deletePackage(pkg.paquete_id)"
									>
										<Trash2 class="w-4 h-4" />
									</Button>
								</HasPermission>
							</div>
						</TableCell>
					</TableRow>
				</TableBody>
			</Table>
		</div>

		<PackageSheet
			:open="isSheetOpen"
			:package-id="selectedPackageId"
			@update:open="isSheetOpen = $event"
			@saved="onSheetClose(true)"
			@refresh="fetchPackages"
		/>
	</div>
</template>