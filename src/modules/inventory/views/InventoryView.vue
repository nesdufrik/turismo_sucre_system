<script setup lang="ts">
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ServicesTab from '../components/ServicesTab.vue'
import HotelsTab from '../components/HotelsTab.vue'
import PackagesTab from '../components/PackagesTab.vue'
import { Card, CardContent } from '@/components/ui/card'
import CardHeader from '@/components/ui/card/CardHeader.vue'
import CardTitle from '@/components/ui/card/CardTitle.vue'
import CardDescription from '@/components/ui/card/CardDescription.vue'
import { Button } from '@/components/ui/button'
import { FileText } from 'lucide-vue-next'
import { ref } from 'vue'
import InventoryReportDialog from '../components/InventoryReportDialog.vue'

const showReportDialog = ref(false)
</script>

<template>
	<div class="space-y-6">
		<div
			class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
		>
			<div>
				<h3 class="text-3xl font-bold tracking-tight">Inventario</h3>
				<p class="text-muted-foreground">
					Administra Servicios, Hoteles y Paquetes.
				</p>
			</div>
			<Button variant="outline" @click="showReportDialog = true">
				<FileText class="w-4 h-4 mr-2" /> Imprimir Tarifario
			</Button>
		</div>

		<Tabs default-value="services" class="space-y-4">
			<TabsList class="mb-0">
				<TabsTrigger value="services">Servicios</TabsTrigger>
				<TabsTrigger value="hotels">Hoteles</TabsTrigger>
				<TabsTrigger value="packages">Paquetes</TabsTrigger>
			</TabsList>

			<TabsContent value="services" class="space-y-4">
				<Card>
					<CardHeader>
						<CardTitle class="text-xl font-bold tracking-tight"
							>Servicios</CardTitle
						>
						<CardDescription class="text-muted-foreground">
							Gestiona el catálogo de servicios turísticos y sus tarifas.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<ServicesTab />
					</CardContent>
				</Card>
			</TabsContent>

			<TabsContent value="hotels" class="space-y-4">
				<Card>
					<CardHeader>
						<CardTitle class="text-xl font-bold tracking-tight"
							>Hoteles</CardTitle
						>
						<CardDescription class="text-muted-foreground">
							Gestiona el catálogo de hoteles, sus tipos de habitaciones y sus
							tarifas.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<HotelsTab />
					</CardContent>
				</Card>
			</TabsContent>

			<TabsContent value="packages" class="space-y-4">
				<Card>
					<CardHeader>
						<CardTitle class="text-xl font-bold tracking-tight"
							>Paquetes</CardTitle
						>
						<CardDescription class="text-muted-foreground">
							Gestiona el catálogo de paquetes turísticos y sus tarifas.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<PackagesTab />
					</CardContent>
				</Card>
			</TabsContent>
		</Tabs>

		<InventoryReportDialog v-model:open="showReportDialog" />
	</div>
</template>
