<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'vue-sonner'
import { Loader2, Lock } from 'lucide-vue-next'

const router = useRouter()
const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)

const handleUpdatePassword = async () => {
  if (password.value.length < 6) {
    toast.error('La contraseña debe tener al menos 6 caracteres')
    return
  }

  if (password.value !== confirmPassword.value) {
    toast.error('Las contraseñas no coinciden')
    return
  }

  isLoading.value = true
  try {
    const { error } = await supabase.auth.updateUser({
      password: password.value
    })

    if (error) throw error

    toast.success('Contraseña actualizada correctamente', {
      description: 'Ahora puedes iniciar sesión con tu nueva clave.'
    })
    
    // Redirigir al login después de un momento
    setTimeout(() => {
      router.push({ name: 'Login' })
    }, 2000)

  } catch (error: any) {
    toast.error('Error al actualizar contraseña', {
      description: error.message
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="flex items-center justify-center min-h-[80vh]">
    <Card class="w-full max-w-md">
      <CardHeader class="space-y-1">
        <CardTitle class="text-2xl font-bold flex items-center gap-2">
          <Lock class="w-5 h-5 text-primary" />
          Nueva Contraseña
        </CardTitle>
        <CardDescription>
          Ingresa tu nueva clave de acceso para continuar.
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="space-y-2">
          <Label for="password">Nueva Contraseña</Label>
          <Input 
            id="password" 
            v-model="password" 
            type="password" 
            placeholder="••••••••" 
            :disabled="isLoading"
          />
        </div>
        <div class="space-y-2">
          <Label for="confirm-password">Confirmar Contraseña</Label>
          <Input 
            id="confirm-password" 
            v-model="confirmPassword" 
            type="password" 
            placeholder="••••••••" 
            :disabled="isLoading"
            @keyup.enter="handleUpdatePassword"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button class="w-full" @click="handleUpdatePassword" :disabled="isLoading">
          <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
          Actualizar Contraseña
        </Button>
      </CardFooter>
    </Card>
  </div>
</template>
