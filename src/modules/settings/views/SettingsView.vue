<script setup lang="ts">
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import LocationsTable from '../components/LocationsTable.vue'
import ServiceCategoriesTable from '../components/ServiceCategoriesTable.vue'
import PriceSheetsTable from '../components/PriceSheetsTable.vue'
import BankAccountsTable from '../components/BankAccountsTable.vue'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
</script>

<template>
	<div class="space-y-6">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Configuración</h1>
			<p class="text-muted-foreground">
				Administra las opciones generales del sistema.
			</p>
		</div>

		<Tabs default-value="pricesheets" class="space-y-4">
			<TabsList class="mb-0">
				<TabsTrigger value="pricesheets"> Hojas de Precios </TabsTrigger>
				<TabsTrigger value="categories"> Categorías de Servicio </TabsTrigger>
				<TabsTrigger value="locations"> Ubicaciones </TabsTrigger>
				<TabsTrigger value="banks"> Cuentas Bancarias </TabsTrigger>
			</TabsList>

			<TabsContent value="locations" class="space-y-4">
				<Card>
					<CardHeader>
						<CardTitle class="text-xl font-bold tracking-tight">Ubicaciones</CardTitle>
						<CardDescription class="text-muted-foreground">
							Gestiona las ciudades y ubicaciones disponibles para los servicios
							y hoteles.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<LocationsTable />
					</CardContent>
				</Card>
			</TabsContent>

			<TabsContent value="categories" class="space-y-4">
				<Card>
					<CardHeader>
						<CardTitle class="text-xl font-bold tracking-tight">Categorías de Servicio</CardTitle>
						<CardDescription class="text-muted-foreground">
							Clasifica los servicios ofrecidos (ej. Transporte, Guía, Ticket).
						</CardDescription>
					</CardHeader>
					<CardContent>
						<ServiceCategoriesTable />
					</CardContent>
				</Card>
			</TabsContent>

			<TabsContent value="pricesheets" class="space-y-4">
				<Card>
					<CardHeader>
						<CardTitle class="text-xl font-bold tracking-tight">Hojas de Precios</CardTitle>
						<CardDescription class="text-muted-foreground">
							Define diferentes listas de precios (ej. General, Corporativo,
							2025).
						</CardDescription>
					</CardHeader>
					<CardContent>
						<PriceSheetsTable />
					</CardContent>
				</Card>
			</TabsContent>

			<TabsContent value="banks" class="space-y-4">
				<Card>
					<CardHeader>
						<CardTitle class="text-xl font-bold tracking-tight">Cuentas Bancarias</CardTitle>
						<CardDescription class="text-muted-foreground">
							Gestiona las cuentas donde los clientes realizarán los depósitos.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<BankAccountsTable />
					</CardContent>
				</Card>
			</TabsContent>
		</Tabs>
	</div>
</template>
