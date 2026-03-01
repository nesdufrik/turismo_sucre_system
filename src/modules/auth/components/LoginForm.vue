<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { toast } from 'vue-sonner'
import { Loader2 } from 'lucide-vue-next'

import { AuthService } from '@/modules/auth/AuthService'
import { loginSchema } from '../schemas/auth.schemas'
import { cn } from '@/lib/utils'

// UI Components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const props = defineProps<{
  class?: string
}>()

const router = useRouter()
const isLoading = ref(false)

const form = useForm({
  validationSchema: toTypedSchema(loginSchema),
})

const onSubmit = form.handleSubmit(async (values) => {
  isLoading.value = true
  try {
    await AuthService.login(values.email, values.password)
    toast.success('Bienvenido de nuevo')
    router.push({ name: 'Dashboard' })
  } catch (error: any) {
    toast.error('Error de autenticación', {
      description: error.message || 'Credenciales incorrectas',
    })
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div :class="cn('flex flex-col gap-6', props.class)">
    <Card>
      <CardHeader class="text-center">
        <CardTitle class="text-xl">
          Bienvenido
        </CardTitle>
        <CardDescription>
          Inicia sesión con tu cuenta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit="onSubmit">
          <div class="grid gap-6">
            <div class="grid gap-6">
              <FormField v-slot="{ componentField }" name="email">
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="m@example.com" 
                      v-bind="componentField" 
                      :disabled="isLoading"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="password">
                <FormItem>
                  <div class="flex items-center">
                    <FormLabel>Contraseña</FormLabel>
                    <RouterLink
                      :to="{ name: 'ForgotPassword' }"
                      class="ml-auto text-sm underline-offset-4 hover:underline"
                    >
                      ¿Olvidaste tu contraseña?
                    </RouterLink>
                  </div>
                  <FormControl>
                    <Input 
                      type="password" 
                      v-bind="componentField" 
                      :disabled="isLoading"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <Button type="submit" class="w-full" :disabled="isLoading">
                <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
                {{ isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
              </Button>
            </div>

            <!-- Sign Up Link (Optional based on business logic) 
            <div class="text-center text-sm">
              ¿No tienes una cuenta?
              <a href="#" class="underline underline-offset-4">
                Regístrate
              </a>
            </div>
            -->
          </div>
        </form>
      </CardContent>
    </Card>
    <div class="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
      Al hacer clic en continuar, aceptas nuestros <a href="#">Términos de Servicio</a>
      y <a href="#">Política de Privacidad</a>.
    </div>
  </div>
</template>
