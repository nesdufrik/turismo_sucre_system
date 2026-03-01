<script setup lang="ts">
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'vue-sonner'
import { Loader2, Mail, ArrowLeft } from 'lucide-vue-next'

const email = ref('')
const isLoading = ref(false)
const isSent = ref(false)

const handleResetRequest = async () => {
  if (!email.value) {
    toast.error('Por favor ingresa tu correo electrónico')
    return
  }

  isLoading.value = true
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email.value, {
      redirectTo: `${window.location.origin}/update-password`,
    })

    if (error) throw error

    isSent.value = true
    toast.success('Correo enviado', {
      description: 'Revisa tu bandeja de entrada para continuar.'
    })

  } catch (error: any) {
    toast.error('Error al solicitar recuperación', {
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
          <Mail class="w-5 h-5 text-primary" />
          Recuperar Acceso
        </CardTitle>
        <CardDescription>
          Te enviaremos un enlace para restablecer tu contraseña.
        </CardDescription>
      </CardHeader>
      
      <CardContent class="space-y-4" v-if="!isSent">
        <div class="space-y-2">
          <Label for="email">Correo Electrónico</Label>
          <Input 
            id="email" 
            v-model="email" 
            type="email" 
            placeholder="nombre@empresa.com" 
            :disabled="isLoading"
            @keyup.enter="handleResetRequest"
          />
        </div>
      </CardContent>

      <CardContent v-else class="text-center py-6 space-y-4">
        <div class="p-3 bg-green-50 rounded-full w-fit mx-auto">
          <Mail class="w-8 h-8 text-green-600" />
        </div>
        <p class="text-sm text-muted-foreground">
          Si el correo <b>{{ email }}</b> existe en nuestro sistema, recibirás un mensaje en breve.
        </p>
      </CardContent>

      <CardFooter class="flex flex-col gap-4">
        <Button v-if="!isSent" class="w-full" @click="handleResetRequest" :disabled="isLoading">
          <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
          Enviar Enlace
        </Button>
        <Button variant="ghost" class="w-full" @click="$router.push({ name: 'Login' })">
          <ArrowLeft class="mr-2 h-4 w-4" />
          Volver al Inicio
        </Button>
      </CardFooter>
    </Card>
  </div>
</template>
