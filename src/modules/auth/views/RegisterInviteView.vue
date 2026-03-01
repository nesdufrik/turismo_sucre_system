<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { UserService } from '@/modules/users/UserService'
import { AuthService } from '../AuthService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'vue-sonner'
import { Loader2 } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

const token = route.query.token as string
const isLoading = ref(true)
const isSubmitting = ref(false)
const isValid = ref(false)
const inviteData = ref<{ email: string, role: string } | null>(null)

const form = ref({
  full_name: '',
  password: '',
  confirmPassword: ''
})

const checkToken = async () => {
  if (!token) {
    isLoading.value = false
    return
  }

  try {
    const res = await UserService.validateInviteToken(token)
    if (res.valid && res.email) {
      isValid.value = true
      inviteData.value = { email: res.email, role: res.role || '' }
    } else {
      toast.error('La invitación no es válida o ha expirado')
    }
  } catch (error) {
    console.error(error)
    toast.error('Error al validar invitación')
  } finally {
    isLoading.value = false
  }
}

const onSubmit = async () => {
  if (form.value.password !== form.value.confirmPassword) {
    toast.error('Las contraseñas no coinciden')
    return
  }
  if (!inviteData.value?.email) return

  isSubmitting.value = true
  try {
    // 1. Sign Up User
    await AuthService.register({
      email: inviteData.value.email,
      password: form.value.password,
      options: {
        data: {
          full_name: form.value.full_name,
          // We can pass the role here to be handled by a Trigger on DB side, 
          // or we rely on the invite verification during sign up (if implemented).
          // For now, let's assume the DB trigger handling 'public.user_invites' will assign the role.
          invite_token: token // Pass token in metadata if needed by triggers
        }
      }
    })

    toast.success('Cuenta creada exitosamente')
    router.push('/')
  } catch (error: any) {
    toast.error('Error al registrar: ' + error.message)
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  checkToken()
})
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-muted/50 p-4">
    <div class="w-full max-w-md space-y-6 rounded-lg border bg-card p-6 shadow-lg">
      <div class="space-y-2 text-center">
        <h1 class="text-2xl font-bold">Completar Registro</h1>
        <p class="text-muted-foreground">Turismo Sucre System</p>
      </div>

      <div v-if="isLoading" class="flex justify-center py-8">
        <Loader2 class="h-8 w-8 animate-spin text-primary" />
      </div>

      <div v-else-if="!isValid" class="text-center text-destructive py-8">
        <p>El enlace de invitación es inválido o ha caducado.</p>
        <Button class="mt-4" variant="outline" @click="router.push('/login')">Ir al Login</Button>
      </div>

      <form v-else @submit.prevent="onSubmit" class="space-y-4">
        <div class="bg-blue-50 text-blue-700 p-3 rounded text-sm mb-4">
          Registrando cuenta para: <strong>{{ inviteData?.email }}</strong>
          <div v-if="inviteData?.role" class="text-xs mt-1 opacity-80">Rol asignado: {{ inviteData?.role }}</div>
        </div>

        <div class="space-y-2">
          <Label>Nombre Completo</Label>
          <Input v-model="form.full_name" placeholder="Ej. Ana Gomez" required />
        </div>

        <div class="space-y-2">
          <Label>Contraseña</Label>
          <Input v-model="form.password" type="password" required />
        </div>

        <div class="space-y-2">
          <Label>Confirmar Contraseña</Label>
          <Input v-model="form.confirmPassword" type="password" required />
        </div>

        <Button type="submit" class="w-full" :disabled="isSubmitting">
          <Loader2 v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
          Crear Cuenta
        </Button>
      </form>
    </div>
  </div>
</template>
