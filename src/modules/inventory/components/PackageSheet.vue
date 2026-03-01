<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import PackageGeneralForm from './PackageGeneralForm.vue'
import PackageComponentsManager from './PackageComponentsManager.vue'

const props = defineProps<{
  open: boolean
  packageId: number | null
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'saved'): void
  (e: 'refresh'): void
}>()

const activeTab = ref('general')
const localPackageId = ref<number | null>(null)

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    activeTab.value = 'general'
    localPackageId.value = props.packageId
  }
})

watch(() => props.packageId, (newId) => {
  localPackageId.value = newId
})

const onFormSaved = (newId?: number) => {
  if (newId) {
    localPackageId.value = newId
    activeTab.value = 'components'
    emit('refresh')
  } else {
    emit('saved')
  }
}
</script>

<template>
  <Sheet :open="open" @update:open="emit('update:open', $event)">
    <SheetContent class="w-full sm:max-w-[700px] overflow-y-auto">
      <SheetHeader>
        <SheetTitle>{{ localPackageId ? 'Editar Paquete' : 'Nuevo Paquete' }}</SheetTitle>
        <SheetDescription>
          {{ localPackageId
            ? 'Modifica los detalles y servicios del paquete.'
            : 'Completa la información básica para crear un paquete.' }}
        </SheetDescription>
      </SheetHeader>

      <div>
        <Tabs v-model="activeTab" class="w-full">
          <TabsList class="grid w-full grid-cols-2" v-if="localPackageId">
            <TabsTrigger value="general">Información General</TabsTrigger>
            <TabsTrigger value="components">Servicios Incluidos</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <PackageGeneralForm :package-id="localPackageId" @saved="onFormSaved"
              @cancel="emit('update:open', false)" />
          </TabsContent>

          <TabsContent value="components" v-if="localPackageId">
            <PackageComponentsManager :package-id="localPackageId" />
          </TabsContent>
        </Tabs>
      </div>
    </SheetContent>
  </Sheet>
</template>
