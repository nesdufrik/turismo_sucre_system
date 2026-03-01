<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { UserService } from '@/modules/users/UserService'
import { ImageUtils } from '@/lib/image-utils'
import { supabase } from '@/lib/supabase'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Loader2, Camera, BrushCleaning } from 'lucide-vue-next'

const authStore = useAuthStore()
const isLoading = ref(false)
const isUploading = ref(false)

// Form data
const fullName = ref('')
const email = ref('')
const avatarUrl = ref('')

// Password data
const password = ref('')
const confirmPassword = ref('')

const fileInput = ref<HTMLInputElement | null>(null)

onMounted(() => {
	if (authStore.profile) {
		fullName.value = authStore.profile.full_name || ''
		avatarUrl.value = authStore.profile.avatar_url || ''
	}
	if (authStore.user) {
		email.value = authStore.user.email || ''
	}
})

const handleFileSelect = async (event: Event) => {
	const input = event.target as HTMLInputElement
	if (!input.files?.length) return

	const originalFile = input.files[0] as File
	isUploading.value = true

	try {
		// 1. Guardar referencia a la URL vieja para limpiar después
		const oldAvatarUrl = avatarUrl.value

		// 2. Procesar la nueva imagen
		const processedBlob = await ImageUtils.processAvatar(originalFile, 256)
		const fileName = `${authStore.user?.id || 'avatar'}_${Date.now()}.webp`
		const fileToUpload = new File([processedBlob], fileName, { type: 'image/webp' })

		// 3. Subir el nuevo archivo
		const url = await UserService.uploadAvatar(fileToUpload)
		
		// 4. Actualizar base de datos
		if (authStore.user) {
			await UserService.updateProfile(authStore.user.id, { avatar_url: url })
			
			// 5. SI TODO SALIÓ BIEN: Borrar el archivo viejo del Storage
			if (oldAvatarUrl) {
				await UserService.deleteAvatarFile(oldAvatarUrl)
			}

			avatarUrl.value = url
			await authStore.fetchProfile() // Refresh store
			toast.success('Avatar actualizado')
		}
	} catch (error: any) {
		toast.error('Error al subir avatar: ' + error.message)
	} finally {
		isUploading.value = false
		if (fileInput.value) fileInput.value.value = ''
	}
}

const removeAvatar = async () => {
	if (!avatarUrl.value || !authStore.user) return

	isUploading.value = true
	try {
		const oldAvatarUrl = avatarUrl.value

		// 1. Quitar de la base de datos primero
		await UserService.updateProfile(authStore.user.id, { avatar_url: null })
		
		// 2. Borrar archivo físico del Storage
		await UserService.deleteAvatarFile(oldAvatarUrl)

		avatarUrl.value = ''
		await authStore.fetchProfile()
		toast.success('Foto eliminada')
	} catch (error: any) {
		toast.error('Error al eliminar foto: ' + error.message)
	} finally {
		isUploading.value = false
	}
}

const triggerFileInput = () => {
	fileInput.value?.click()
}

const updateProfile = async () => {
	if (!authStore.user) return
	isLoading.value = true

	try {
		await UserService.updateProfile(authStore.user.id, {
			full_name: fullName.value,
		})
		await authStore.fetchProfile()
		toast.success('Perfil actualizado correctamente')
	} catch (error: any) {
		toast.error('Error al actualizar perfil: ' + error.message)
	} finally {
		isLoading.value = false
	}
}

const updatePassword = async () => {
	if (password.value !== confirmPassword.value) {
		toast.error('Las contraseñas no coinciden')
		return
	}
	if (password.value.length < 6) {
		toast.error('La contraseña debe tener al menos 6 caracteres')
		return
	}

	isLoading.value = true
	try {
		const { error } = await supabase.auth.updateUser({
			password: password.value,
		})
		if (error) throw error

		toast.success('Contraseña actualizada')
		password.value = ''
		confirmPassword.value = ''
	} catch (error: any) {
		toast.error('Error al actualizar contraseña: ' + error.message)
	} finally {
		isLoading.value = false
	}
}

// Initials for Avatar Fallback
const getInitials = (name: string) => {
	return name
		.split(' ')
		.map((n) => n[0])
		.join('')
		.toUpperCase()
		.slice(0, 2)
}
</script>

<template>
	<div class="space-y-6">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Mi Perfil</h1>
			<p class="text-muted-foreground">
				Gestiona tu información personal y seguridad de la cuenta.
			</p>
		</div>

		<Tabs default-value="general" class="space-y-4">
			<TabsList class="mb-0">
				<TabsTrigger value="general">General</TabsTrigger>
				<TabsTrigger value="security">Seguridad</TabsTrigger>
			</TabsList>

			<TabsContent value="general" class="space-y-4">
				<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
					<!-- Avatar Card -->
					<Card class="col-span-2">
						<CardHeader>
							<CardTitle>Foto de Perfil</CardTitle>
						</CardHeader>
						<CardContent class="flex flex-col items-center gap-4">
							<div
								class="relative group cursor-pointer"
								@click="triggerFileInput"
							>
								<Avatar class="h-32 w-32 border-4 border-background shadow-sm">
									<AvatarImage :src="avatarUrl" class="object-cover" />
									<AvatarFallback class="text-2xl">{{
										getInitials(fullName || 'U')
									}}</AvatarFallback>
								</Avatar>
								<div
									class="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
								>
									<Camera class="h-8 w-8 text-white" />
								</div>
								<div
									v-if="isUploading"
									class="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full"
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
							<div class="flex gap-2">
								<Button
									variant="outline"
									size="sm"
									@click="triggerFileInput"
									:disabled="isUploading"
								>
									Cambiar Foto
								</Button>
								<Button
									v-if="avatarUrl"
									variant="destructive"
									size="sm"
									@click="removeAvatar"
									:disabled="isUploading"
									title="Eliminar foto"
								>
									<BrushCleaning />
								</Button>
							</div>
						</CardContent>
					</Card>

					<!-- Personal Info Card -->
					<Card class="col-span-5">
						<CardHeader>
							<CardTitle>Información Personal</CardTitle>
							<CardDescription
								>Actualiza tu nombre y visualiza tu email.</CardDescription
							>
						</CardHeader>
						<CardContent class="space-y-4">
							<div class="space-y-2">
								<Label for="email">Email</Label>
								<Input id="email" v-model="email" disabled />
							</div>
							<div class="space-y-2">
								<Label for="fullname">Nombre Completo</Label>
								<Input
									id="fullname"
									v-model="fullName"
									placeholder="Tu nombre"
								/>
							</div>
						</CardContent>
						<CardFooter>
							<Button @click="updateProfile" :disabled="isLoading">
								<Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
								Guardar Cambios
							</Button>
						</CardFooter>
					</Card>
				</div>
			</TabsContent>

			<TabsContent value="security">
				<Card>
					<CardHeader>
						<CardTitle>Contraseña</CardTitle>
						<CardDescription
							>Cambia tu contraseña para mantener tu cuenta
							segura.</CardDescription
						>
					</CardHeader>
					<CardContent class="space-y-4 max-w-md">
						<div class="space-y-2">
							<Label for="new-password">Nueva Contraseña</Label>
							<Input id="new-password" type="password" v-model="password" />
						</div>
						<div class="space-y-2">
							<Label for="confirm-password">Confirmar Contraseña</Label>
							<Input
								id="confirm-password"
								type="password"
								v-model="confirmPassword"
							/>
						</div>
					</CardContent>
					<CardFooter>
						<Button @click="updatePassword" :disabled="isLoading">
							<Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
							Actualizar Contraseña
						</Button>
					</CardFooter>
				</Card>
			</TabsContent>
		</Tabs>
	</div>
</template>