<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { AgencyService } from '../AgencyService'
import type { Tables } from '@/types/database.types'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Loader2, Camera, BrushCleaning } from 'lucide-vue-next'

const isLoading = ref(false)
const isUploading = ref(false)
const configData = ref<Tables<'configuracion_sistema'> | null>(null)

const fileInput = ref<HTMLInputElement | null>(null)

onMounted(async () => {
	await fetchAgencyData()
})

const fetchAgencyData = async () => {
	try {
		configData.value = await AgencyService.getAgencyProfile()
	} catch (e: any) {
		toast.error('Error al cargar datos de la agencia: ' + e.message)
	}
}

const triggerFileInput = () => {
	fileInput.value?.click()
}

const handleFileSelect = async (event: Event) => {
	const input = event.target as HTMLInputElement
	if (!input.files?.length || !configData.value) return

	const originalFile = input.files[0] as File
	isUploading.value = true

	try {
		const oldUrl = configData.value.empresa_logo_url

		// Subir el nuevo archivo
		const url = await AgencyService.uploadLogo(originalFile)

		// Actualizar base de datos
		await AgencyService.updateAgencyProfile(configData.value.id, {
			empresa_logo_url: url,
		})

		// Borrar el archivo viejo del Storage
		if (oldUrl) {
			await AgencyService.deleteLogoFile(oldUrl)
		}

		configData.value.empresa_logo_url = url
		toast.success('Logo actualizado exitosamente')
	} catch (error: any) {
		toast.error('Error al subir logo: ' + error.message)
	} finally {
		isUploading.value = false
		if (fileInput.value) fileInput.value.value = ''
	}
}

const removeLogo = async () => {
	if (!configData.value?.empresa_logo_url) return

	isUploading.value = true
	try {
		const oldUrl = configData.value.empresa_logo_url

		// 1. Quitar de la base de datos primero
		await AgencyService.updateAgencyProfile(configData.value.id, {
			empresa_logo_url: null,
		})

		// 2. Borrar archivo físico del Storage
		await AgencyService.deleteLogoFile(oldUrl)

		configData.value.empresa_logo_url = ''
		toast.success('Logo eliminado')
	} catch (error: any) {
		toast.error('Error al eliminar logo: ' + error.message)
	} finally {
		isUploading.value = false
	}
}

const updateAgencyProfile = async () => {
	if (!configData.value) return
	isLoading.value = true

	try {
		const { id, created_at, updated_at, ...updates } = configData.value
		await AgencyService.updateAgencyProfile(id, updates)
		toast.success('Perfil de agencia actualizado correctamente')
	} catch (error: any) {
		toast.error('Error al actualizar: ' + error.message)
	} finally {
		isLoading.value = false
	}
}
</script>

<template>
	<div class="space-y-6">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Perfil de la Agencia</h1>
			<p class="text-muted-foreground">
				Gestiona los datos visibles y el logotipo de la agencia para las
				cotizaciones y PDFs.
			</p>
		</div>

		<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-7" v-if="configData">
			<!-- Logo Card -->
			<Card class="col-span-2">
				<CardHeader>
					<CardTitle>Logotipo</CardTitle>
				</CardHeader>
				<CardContent class="flex flex-col items-center gap-4">
					<div
						class="relative group cursor-pointer w-full flex justify-center"
						@click="triggerFileInput"
					>
						<div
							v-if="configData.empresa_logo_url"
							class="h-40 w-40 rounded-lg border-2 border-dashed flex items-center justify-center p-2 relative overflow-hidden bg-white shadow-sm"
						>
							<img
								:src="configData.empresa_logo_url"
								class="object-contain w-full h-full"
								alt="Logo de Agencia"
							/>
							<div
								class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
							>
								<Camera class="h-8 w-8 text-white" />
							</div>
						</div>
						<div
							v-else
							class="h-40 w-full rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-muted-foreground relative overflow-hidden group-hover:bg-accent/50 transition-colors"
						>
							<Camera class="h-8 w-8 mb-2 opacity-50" />
							<span class="text-sm font-medium">Subir Logo</span>
						</div>

						<div
							v-if="isUploading"
							class="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg z-10"
						>
							<Loader2 class="h-8 w-8 animate-spin text-primary" />
						</div>
					</div>
					<input
						type="file"
						ref="fileInput"
						class="hidden"
						accept="image/*"
						@change="handleFileSelect"
					/>
					<div class="flex gap-2 w-full justify-center">
						<Button
							variant="outline"
							size="sm"
							@click="triggerFileInput"
							:disabled="isUploading"
						>
							Cambiar Logo
						</Button>
						<Button
							v-if="configData.empresa_logo_url"
							variant="destructive"
							size="sm"
							@click="removeLogo"
							:disabled="isUploading"
							title="Eliminar logo"
						>
							<BrushCleaning class="h-4 w-4" />
						</Button>
					</div>
				</CardContent>
			</Card>

			<!-- Company Info Card -->
			<Card class="col-span-5">
				<CardHeader>
					<CardTitle>Datos de la Empresa</CardTitle>
					<CardDescription>
						Esta información aparecerá en las cotizaciones generadas.
					</CardDescription>
				</CardHeader>
				<CardContent class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div class="space-y-2 col-span-2">
						<Label for="empresa_nombre">Nombre Comercial</Label>
						<Input
							id="empresa_nombre"
							v-model="configData.empresa_nombre"
							placeholder="Ej. Turismo Sucre S.R.L."
						/>
					</div>
					<div class="space-y-2 col-span-2">
						<Label for="empresa_descripcion">Descripción/Slogan</Label>
						<Textarea
							id="empresa_descripcion"
							v-model="configData.empresa_descripcion"
							placeholder="Tu agencia de confianza..."
						/>
					</div>

					<div class="space-y-2">
						<Label for="empresa_correo">Correo de Contacto</Label>
						<Input
							id="empresa_correo"
							type="email"
							v-model="configData.empresa_correo"
						/>
					</div>
					<div class="space-y-2">
						<Label for="empresa_celular">Celular (WhatsApp)</Label>
						<Input id="empresa_celular" v-model="configData.empresa_celular" />
					</div>

					<div class="space-y-2">
						<Label for="empresa_telefonos">Teléfonos (Fijos)</Label>
						<Input
							id="empresa_telefonos"
							v-model="configData.empresa_telefonos"
						/>
					</div>
					<div class="space-y-2">
						<Label for="empresa_fax">Fax</Label>
						<Input id="empresa_fax" v-model="configData.empresa_fax" />
					</div>

					<div class="space-y-2 col-span-2">
						<Label for="empresa_direccion">Dirección Física</Label>
						<Input
							id="empresa_direccion"
							v-model="configData.empresa_direccion"
						/>
					</div>

					<div class="space-y-2">
						<Label for="empresa_ciudad">Ciudad</Label>
						<Input id="empresa_ciudad" v-model="configData.empresa_ciudad" />
					</div>
					<div class="space-y-2">
						<Label for="empresa_pais">País</Label>
						<Input id="empresa_pais" v-model="configData.empresa_pais" />
					</div>
				</CardContent>
				<CardFooter class="flex justify-end">
					<Button @click="updateAgencyProfile" :disabled="isLoading">
						<Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
						Guardar Configuraciones
					</Button>
				</CardFooter>
			</Card>
		</div>
		<div v-else class="flex justify-center items-center h-64">
			<Loader2 class="h-8 w-8 animate-spin text-primary" />
		</div>
	</div>
</template>
