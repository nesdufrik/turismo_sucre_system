<script setup lang="ts">
import CardTitle from '@/components/ui/card/CardTitle.vue'
import ClientList from '../components/ClientList.vue'
import { Card, CardContent } from '@/components/ui/card'
import CardDescription from '@/components/ui/card/CardDescription.vue'
import CardHeader from '@/components/ui/card/CardHeader.vue'
import { Button } from '@/components/ui/button'
import { User } from 'lucide-vue-next'
</script>

<template>
	<HasPermission name="quotes.view">
		<div class="space-y-6">
			<div>
				<h1 class="text-3xl font-bold tracking-tight">CRM</h1>
				<p class="text-muted-foreground">
					Gestión de relaciones con clientes.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle class="text-xl font-bold tracking-tight">Clientes</CardTitle>
					<CardDescription class="text-muted-foreground">
						Gestiona tu base de datos de clientes y agencias.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<ClientList />
				</CardContent>
			</Card>
		</div>

		<template #no-access>
			<div class="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
				<div class="p-4 bg-blue-50 rounded-full">
					<User class="w-12 h-12 text-blue-500 opacity-50" />
				</div>
				<div class="max-w-md">
					<h2 class="text-2xl font-bold">Acceso Restringido</h2>
					<p class="text-muted-foreground mt-2">
						No tienes los permisos necesarios para ver la base de datos de clientes. 
						Contacta con un administrador si necesitas acceso al CRM.
					</p>
					<Button variant="outline" class="mt-6" @click="$router.back()">
						Volver
					</Button>
				</div>
			</div>
		</template>
	</HasPermission>
</template>
