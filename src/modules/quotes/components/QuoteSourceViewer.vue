<script setup lang="ts">
import { computed } from 'vue'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Mail, User, FileText } from 'lucide-vue-next'

const props = defineProps<{
  open: boolean
  data: any
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

const sourceData = computed(() => {
  if (!props.data) return null
  
  let processed = props.data
  
  // If it's a string, try to parse it (in case it was double encoded or raw string)
  if (typeof processed === 'string') {
    try {
      processed = JSON.parse(processed)
    } catch (e) {
      // If parse fails, treat as simple string content
      return { content: processed }
    }
  }

  // If it's the expected structure
  if (typeof processed === 'object' && processed !== null) {
    return {
      sender: processed.sender || 'Desconocido',
      subject: processed.subject || 'Sin asunto',
      content: processed.content || '',
      ...processed // keep other fields just in case
    }
  }

  return { content: String(processed) }
})
</script>

<template>
  <Sheet :open="open" @update:open="(val) => emit('update:open', val)">
    <SheetContent class="sm:max-w-md w-full">
      <SheetHeader>
        <SheetTitle class="flex items-center gap-2">
          <Mail class="w-4 h-4" />
          Solicitud Original
        </SheetTitle>
        <SheetDescription>
          Datos recibidos de la fuente de origen.
        </SheetDescription>
      </SheetHeader>
      
      <ScrollArea class="h-[calc(100vh-8rem)] mt-4 pr-4">
        <div v-if="sourceData" class="space-y-6">
          <!-- Structured View -->
          <div v-if="sourceData.sender || sourceData.subject" class="space-y-4">
            
            <div class="space-y-1">
              <h4 class="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <User class="w-3 h-3" /> Remitente
              </h4>
              <p class="text-sm font-medium">{{ sourceData.sender }}</p>
            </div>

            <div class="space-y-1">
              <h4 class="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <FileText class="w-3 h-3" /> Asunto
              </h4>
              <p class="text-sm font-medium">{{ sourceData.subject }}</p>
            </div>

            <Separator />
            
            <div class="space-y-2">
               <h4 class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Contenido</h4>
               <div class="bg-muted/50 p-4 rounded-md text-sm whitespace-pre-wrap leading-relaxed">
                 {{ sourceData.content }}
               </div>
            </div>
          </div>

          <!-- Fallback / Debug Info -->
           <div v-else>
             <pre class="text-xs bg-muted p-4 rounded overflow-auto">{{ JSON.stringify(data, null, 2) }}</pre>
           </div>
        </div>
        
        <div v-else class="flex items-center justify-center h-32 text-muted-foreground text-sm">
          No hay datos de origen disponibles.
        </div>
      </ScrollArea>
    </SheetContent>
  </Sheet>
</template>