<script setup lang="ts">
import { ref, watch } from 'vue'
import { useForm, useFieldArray } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { ClientService } from '../ClientService'
import { clientSchema, type ClientFormValues } from '../schemas/client.schema'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'vue-sonner'
import { Loader2, Plus, Trash2 } from 'lucide-vue-next'
import { supabase } from '@/lib/supabase'

const props = defineProps<{
  open: boolean
  clientId?: number | null
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'saved', newId: number): void
}>()

const isLoading = ref(false)
const priceSheets = ref<any[]>([])

// --- Form Setup ---
const form = useForm<ClientFormValues>({
  validationSchema: toTypedSchema(clientSchema),
  initialValues: {
    tipo_cliente: 'particular',
    otros_datos: { preferencias: {} }
  }
})

// Field Array for Contacts (only active when type is 'empresa', but defined globally)
const { fields: contactFields, push: pushContact, remove: removeContact } = useFieldArray('otros_datos.contactos')

const fetchPriceSheets = async () => {
  const { data } = await supabase.from('hojasdeprecios').select('hoja_id, nombre, es_default')
  priceSheets.value = data || []
}

const loadClient = async (id: number) => {
  isLoading.value = true
  try {
    const client = await ClientService.getClientById(id)
    if (client) {
      // Map DB entity to Form Schema
      const formData: any = {
        nombre_completo: client.nombre_completo || '',
        email: client.email || '',
        telefono: client.telefono || '',
        empresa: client.empresa || '',
        tipo_cliente: client.tipo_cliente as 'particular' | 'empresa',
        documento_identidad: client.documento_identidad || '',
        pais: client.pais || '',
        ciudad: client.ciudad || '',
        hoja_id: client.hoja_id ? String(client.hoja_id) : undefined,
        notas_internas: client.notas_internas || '',
        otros_datos: client.otros_datos || {}
      }

      // Ensure proper structure for conditional fields to avoid validation errors
      if (formData.tipo_cliente === 'empresa') {
         if (!formData.otros_datos.contactos) formData.otros_datos.contactos = []
      } else {
         if (!formData.otros_datos.preferencias) formData.otros_datos.preferencias = {}
      }

      form.setValues(formData)
    }
  } catch (error) {
    toast.error('Error al cargar cliente')
  } finally {
    isLoading.value = false
  }
}

watch(() => props.open, async (isOpen) => {
  if (isOpen) {
    await fetchPriceSheets()
    if (props.clientId) {
      await loadClient(props.clientId)
    } else {
      const defaultSheet = priceSheets.value.find(s => s.es_default)
      form.resetForm({
        values: {
          tipo_cliente: 'particular',
          hoja_id: defaultSheet ? defaultSheet.hoja_id : undefined,
          otros_datos: {
             preferencias: { diet: '', allergies: '', room_pref: '' }
          }
        }
      })
    }
  }
})

const onSubmit = form.handleSubmit(async (values) => {
  isLoading.value = true
  try {
    let savedId: number
    
    // Values are already in the correct structure thanks to Zod schema matching DB JSONB
    const payload = { ...values }

    if (props.clientId) {
      // @ts-ignore
      await ClientService.updateClient(props.clientId, payload)
      savedId = props.clientId
      toast.success('Cliente actualizado')
    } else {
      const newClient = await ClientService.createClient(payload as any)
      savedId = newClient.cliente_id
      toast.success('Cliente creado')
    }
    emit('saved', savedId)
    emit('update:open', false)
  } catch (error: any) {
    toast.error('Error al guardar', { description: error.message })
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <Sheet :open="open" @update:open="emit('update:open', $event)">
    <SheetContent class="sm:max-w-[500px] overflow-y-auto">
      <SheetHeader>
        <SheetTitle>{{ clientId ? 'Editar Cliente' : 'Nuevo Cliente' }}</SheetTitle>
        <SheetDescription>
          Información de contacto y configuración comercial.
        </SheetDescription>
      </SheetHeader>

      <div v-if="isLoading && clientId" class="flex justify-center py-10">
        <Loader2 class="h-8 w-8 animate-spin" />
      </div>

      <form v-else @submit="onSubmit" class="grid gap-4 py-4">
        <!-- Type Selection -->
        <FormField v-slot="{ componentField }" name="tipo_cliente">
          <FormItem>
            <FormLabel>Tipo de Cliente</FormLabel>
            <Select v-bind="componentField">
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="particular">Particular / Turista</SelectItem>
                <SelectItem value="empresa">Empresa / Agencia</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="nombre_completo">
          <FormItem>
            <FormLabel>Nombre Completo / Razón Social</FormLabel>
            <FormControl>
              <Input placeholder="Ej: Juan Perez o Agencia Viajes" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <div class="grid grid-cols-2 gap-4">
          <FormField v-slot="{ componentField }" name="email">
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="telefono">
            <FormItem>
              <FormLabel>Teléfono</FormLabel>
              <FormControl>
                <Input v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <FormField v-slot="{ componentField }" name="pais">
            <FormItem>
              <FormLabel>País</FormLabel>
              <FormControl>
                <Input v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="ciudad">
            <FormItem>
              <FormLabel>Ciudad</FormLabel>
              <FormControl>
                <Input v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>

        <FormField v-slot="{ componentField }" name="documento_identidad">
          <FormItem>
            <FormLabel>Documento ID / NIT</FormLabel>
            <FormControl>
              <Input v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="hoja_id">
          <FormItem>
            <FormLabel>Hoja de Precios (Tarifa)</FormLabel>
            <Select v-bind="componentField">
              <FormControl>
                 <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tarifa..." />
                 </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem v-for="sheet in priceSheets" :key="sheet.hoja_id" :value="sheet.hoja_id.toString()">
                  {{ sheet.nombre }}
                </SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        </FormField>

        <!-- CONDITIONAL FIELDS: Enterprise -->
        <div v-if="form.values.tipo_cliente === 'empresa'" class="border rounded-md p-3 bg-muted/20 space-y-3">
          <div class="flex justify-between items-center">
            <h4 class="text-sm font-semibold">Contactos de la Empresa</h4>
            <Button type="button" variant="ghost" size="sm" @click="pushContact({ name: '', role: '', email: '' })">
              <Plus class="w-3 h-3" />
            </Button>
          </div>
          
          <div v-for="(field, idx) in contactFields" :key="field.key" class="grid gap-2 border-b pb-2 last:border-0">
             <div class="grid grid-cols-7 gap-2">
                <div class="col-span-3">
                   <FormField v-slot="{ componentField }" :name="`otros_datos.contactos[${idx}].name`">
                      <FormItem>
                         <FormControl>
                            <Input placeholder="Nombre" class="h-8 text-xs" v-bind="componentField" />
                         </FormControl>
                         <FormMessage />
                      </FormItem>
                   </FormField>
                </div>
                <div class="col-span-3">
                   <FormField v-slot="{ componentField }" :name="`otros_datos.contactos[${idx}].role`">
                      <FormItem>
                         <FormControl>
                            <Input placeholder="Cargo" class="h-8 text-xs" v-bind="componentField" />
                         </FormControl>
                         <FormMessage />
                      </FormItem>
                   </FormField>
                </div>
                <Button type="button" variant="ghost" size="icon" class="h-8 w-8 text-destructive" @click="removeContact(idx)">
                  <Trash2 class="w-3 h-3" />
                </Button>
             </div>
             <FormField v-slot="{ componentField }" :name="`otros_datos.contactos[${idx}].email`">
                <FormItem>
                   <FormControl>
                      <Input placeholder="Email contacto" class="h-8 text-xs" v-bind="componentField" />
                   </FormControl>
                   <FormMessage />
                </FormItem>
             </FormField>
          </div>
        </div>

        <!-- CONDITIONAL FIELDS: Particular -->
        <div v-if="form.values.tipo_cliente === 'particular'" class="border rounded-md p-3 bg-muted/20 space-y-3">
          <h4 class="text-sm font-semibold">Preferencias</h4>
          
          <FormField v-slot="{ componentField }" name="otros_datos.preferencias.diet">
             <FormItem>
                <FormLabel class="text-xs">Dieta / Restricciones</FormLabel>
                <FormControl>
                   <Input placeholder="Ej: Vegetariano, Kosher" v-bind="componentField" />
                </FormControl>
             </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="otros_datos.preferencias.allergies">
             <FormItem>
                <FormLabel class="text-xs">Alergias</FormLabel>
                <FormControl>
                   <Input placeholder="Ej: Nueces, Mariscos" v-bind="componentField" />
                </FormControl>
             </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="otros_datos.preferencias.room_pref">
             <FormItem>
                <FormLabel class="text-xs">Preferencia Habitación</FormLabel>
                <FormControl>
                   <Input placeholder="Ej: Planta baja, Cama King" v-bind="componentField" />
                </FormControl>
             </FormItem>
          </FormField>
        </div>

        <FormField v-slot="{ componentField }" name="notas_internas">
          <FormItem>
            <FormLabel>Notas Internas</FormLabel>
            <FormControl>
              <Textarea placeholder="Información privada..." v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <SheetFooter class="mt-4">
          <Button type="submit" :disabled="isLoading">
            <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
            {{ clientId ? 'Actualizar' : 'Crear Cliente' }}
          </Button>
        </SheetFooter>
      </form>
    </SheetContent>
  </Sheet>
</template>