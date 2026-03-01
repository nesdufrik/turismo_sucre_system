<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { AuditService, type AuditLog, type AuditFilters } from '../AuditService'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { 
  Loader2, 
  History, 
  Eye, 
  FilterX,
  RefreshCw
} from 'lucide-vue-next'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'vue-sonner'

const logs = ref<AuditLog[]>([])
const loading = ref(false)
const tables = ref<string[]>([])

// Filters
const filters = ref<AuditFilters>({
  tabla: undefined,
  accion: undefined,
  usuario_id: undefined,
  limit: 50
})

// Detail Modal
const selectedLog = ref<AuditLog | null>(null)
const isDetailOpen = ref(false)

const fetchLogs = async () => {
  loading.value = true
  try {
    logs.value = await AuditService.getLogs(filters.value)
  } catch (error: any) {
    toast.error('Error al cargar auditoría')
  } finally {
    loading.value = false
  }
}

const loadTables = async () => {
  try {
    tables.value = await AuditService.getTables() as any
  } catch (error) {}
}

const clearFilters = () => {
  filters.value = { limit: 50 }
  fetchLogs()
}

const openDetail = (log: AuditLog) => {
  selectedLog.value = log
  isDetailOpen.value = true
}

const getActionVariant = (action: string): "default" | "secondary" | "destructive" | "outline" => {
  if (action === 'DELETE') return 'destructive'
  return 'default' // Override with class
}

const getActionClass = (action: string) => {
  switch (action) {
    case 'INSERT': 
      return 'bg-green-600 hover:bg-green-700 text-white border-transparent dark:bg-green-700 dark:text-green-50'
    case 'UPDATE': 
      return 'bg-blue-600 hover:bg-blue-700 text-white border-transparent dark:bg-blue-700 dark:text-blue-50'
    default: 
      return ''
  }
}

onMounted(() => {
  fetchLogs()
  loadTables()
})
</script>

<template>
  <HasPermission name="audit.view">
    <div class="space-y-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">
            Auditoría de Sistema
          </h1>
          <p class="text-muted-foreground">Rastreo de cambios en la base de datos.</p>
        </div>
        
        <Button variant="outline" @click="fetchLogs" :disabled="loading">
          <Loader2 v-if="loading" class="animate-spin" />
          <RefreshCw v-else />
          Actualizar
        </Button>
      </div>

      <!-- Filters Bar -->
      <div class="flex flex-wrap items-end gap-4 p-4 rounded-lg border bg-card shadow-sm">
        <div>
          <label class="text-xs font-semibold uppercase text-muted-foreground">Tabla</label>
          <Select v-model="filters.tabla" @update:model-value="fetchLogs">
            <SelectTrigger>
              <SelectValue placeholder="Todas las tablas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem v-for="table in tables" :key="table" :value="table">
                {{ table }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label class="text-xs font-semibold uppercase text-muted-foreground">Acción</label>
          <Select v-model="filters.accion" @update:model-value="fetchLogs">
            <SelectTrigger>
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="INSERT">INSERT</SelectItem>
              <SelectItem value="UPDATE">UPDATE</SelectItem>
              <SelectItem value="DELETE">DELETE</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button variant="outline" size="icon" @click="clearFilters" title="Limpiar filtros">
          <FilterX />
        </Button>
      </div>

      <!-- Logs Table -->
      <div class="rounded-md border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader class="bg-muted/50">
            <TableRow>
              <TableHead class="w-[180px]">Fecha y Hora</TableHead>
              <TableHead>Tabla</TableHead>
              <TableHead>Acción</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead class="text-right">Detalle</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="loading && logs.length === 0">
              <TableCell colspan="5" class="h-32 text-center">
                <Loader2 class="h-6 w-6 animate-spin inline mr-2" />
                Cargando registros...
              </TableCell>
            </TableRow>
            
            <TableRow v-else-if="logs.length === 0">
              <TableCell colspan="5" class="h-32 text-center text-muted-foreground">
                No se encontraron registros de auditoría.
              </TableCell>
            </TableRow>

            <TableRow v-for="log in logs" :key="log.id" class="group">
              <TableCell class="text-xs font-medium">
                {{ format(new Date(log.timestamp || ''), 'PPpp', { locale: es }) }}
              </TableCell>
              <TableCell>
                <Badge variant="secondary" class="font-mono text-[10px] uppercase">
                  {{ log.tabla_nombre }}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge 
                  :variant="getActionVariant(log.accion)"
                  :class="getActionClass(log.accion)"
                >
                  {{ log.accion }}
                </Badge>
              </TableCell>
              <TableCell>
                <div class="flex flex-col">
                  <span class="text-sm">{{ log.profiles?.full_name || 'Sistema' }}</span>
                  <span class="text-[10px] text-muted-foreground">{{ log.profiles?.email || '-' }}</span>
                </div>
              </TableCell>
              <TableCell class="text-right">
                <Button variant="ghost" size="icon" @click="openDetail(log)" title="Ver cambios">
                  <Eye class="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <!-- Detail Dialog -->
      <Dialog v-model:open="isDetailOpen">
        <DialogContent class="max-w-3xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <History class="h-5 w-5 text-primary" />
            <DialogTitle>Detalle de Auditoría</DialogTitle>
            <DialogDescription>
              ID Registro: {{ selectedLog?.registro_id }} | {{ selectedLog?.tabla_nombre }}
            </DialogDescription>
          </DialogHeader>

          <div class="flex-1 overflow-y-auto space-y-6 py-4">
            <!-- Metadata -->
            <div class="grid grid-cols-2 gap-4 text-xs bg-muted/30 p-3 rounded-md border">
               <div><span class="font-bold">IP:</span> {{ selectedLog?.ip_address || 'Local' }}</div>
               <div><span class="font-bold">User Agent:</span> {{ selectedLog?.user_agent || 'N/A' }}</div>
            </div>

            <!-- Comparison View -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Values Before -->
              <div class="space-y-2">
                <h4 class="text-xs font-bold uppercase text-red-600 flex items-center gap-1">
                  Valores Anteriores
                </h4>
                <pre class="text-[10px] bg-red-50/50 p-3 rounded border border-red-100 overflow-x-auto min-h-[100px]">{{ 
                  selectedLog?.valores_anteriores ? JSON.stringify(selectedLog.valores_anteriores, null, 2) : '(Vacio - INSERT)'
                }}</pre>
              </div>

              <!-- Values After -->
              <div class="space-y-2">
                <h4 class="text-xs font-bold uppercase text-green-600 flex items-center gap-1">
                  Valores Nuevos
                </h4>
                <pre class="text-[10px] bg-green-50/50 p-3 rounded border border-green-100 overflow-x-auto min-h-[100px]">{{ 
                  selectedLog?.valores_nuevos ? JSON.stringify(selectedLog.valores_nuevos, null, 2) : '(Vacio - DELETE)'
                }}</pre>
              </div>
            </div>
          </div>

          <div class="flex justify-end border-t pt-4">
            <Button @click="isDetailOpen = false">Cerrar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>

    <template #no-access>
      <div class="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <div class="p-4 bg-red-50 rounded-full">
          <History class="w-12 h-12 text-red-500 opacity-50" />
        </div>
        <div class="max-w-md">
          <h2 class="text-2xl font-bold">Acceso Denegado</h2>
          <p class="text-muted-foreground mt-2">
            No tienes los permisos necesarios para ver el historial de cambios del sistema. 
            Contacta con un administrador si crees que esto es un error.
          </p>
          <Button variant="outline" class="mt-6" @click="$router.back()">
            Volver
          </Button>
        </div>
      </div>
    </template>
  </HasPermission>
</template>

