<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { AuditService, type AuditLog, type AuditFilters, type OperationalAuditLog } from '../AuditService'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Loader2, 
  History, 
  Eye, 
  FilterX,
  RefreshCw,
  FileText
} from 'lucide-vue-next'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'vue-sonner'

// Active Tab
const activeTab = ref('operational')

// Technical Audit Refs
const logs = ref<AuditLog[]>([])
const loading = ref(false)
const tables = ref<string[]>([])
const filters = ref<AuditFilters>({
  tabla: undefined,
  accion: undefined,
  usuario_id: undefined,
  limit: 50
})
const selectedLog = ref<AuditLog | null>(null)
const isDetailOpen = ref(false)

// Operational Audit Refs
const operationalLogs = ref<OperationalAuditLog[]>([])
const loadingOperational = ref(false)
const selectedOperationalLog = ref<OperationalAuditLog | null>(null)
const isOperationalDetailOpen = ref(false)

// Fetch Methods
const fetchLogs = async () => {
  loading.value = true
  try {
    logs.value = await AuditService.getLogs(filters.value)
  } catch (error: any) {
    toast.error('Error al cargar auditoría técnica')
  } finally {
    loading.value = false
  }
}

const fetchOperationalLogs = async () => {
  loadingOperational.value = true
  try {
    operationalLogs.value = await AuditService.getOperationalLogs()
  } catch (error: any) {
    toast.error('Error al cargar auditoría operativa')
  } finally {
    loadingOperational.value = false
  }
}

const loadTables = async () => {
  try {
    tables.value = await AuditService.getTables() as any
  } catch (error) {}
}

const refresh = () => {
  if (activeTab.value === 'operational') {
    fetchOperationalLogs()
  } else {
    fetchLogs()
    loadTables()
  }
}

const clearFilters = () => {
  filters.value = { limit: 50 }
  fetchLogs()
}

const openDetail = (log: AuditLog) => {
  selectedLog.value = log
  isDetailOpen.value = true
}

const openOperationalDetail = (log: OperationalAuditLog) => {
  selectedOperationalLog.value = log
  isOperationalDetailOpen.value = true
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

const getEventTypeBadge = (tipo: string) => {
  switch (tipo) {
    case 'reapertura_cotizacion':
      return { 
        label: 'Reapertura', 
        class: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50' 
      }
    case 'anulacion_pago':
      return { 
        label: 'Anulación Pago', 
        class: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/50' 
      }
    case 'modificacion_pago':
      return { 
        label: 'Modificación Pago', 
        class: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/50' 
      }
    default:
      return { 
        label: tipo, 
        class: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800' 
      }
  }
}

const formatKey = (key: string | number) => {
  const mappings: Record<string, string> = {
    pagado: 'Estado de Pago',
    monto_pago: 'Monto de Pago',
    metodo_pago: 'Método de Pago',
    comprobante_pago: 'Comprobante / ID',
    referencia: 'Referencia',
    fecha_pago: 'Fecha de Pago'
  }
  return mappings[String(key)] || String(key)
}

const formatVal = (key: string | number, val: any) => {
  if (val === null || val === undefined || val === '') return '(Vacío)'
  if (String(key) === 'pagado') return val ? 'Pagado' : 'No Pagado'
  if (String(key) === 'monto_pago') return `$${Number(val).toLocaleString('es-ES', { minimumFractionDigits: 2 })}`
  return String(val)
}

onMounted(() => {
  fetchLogs()
  fetchOperationalLogs()
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
          <p class="text-muted-foreground">Rastreo de cambios y justificaciones de operaciones.</p>
        </div>
        
        <Button variant="outline" @click="refresh" :disabled="loading || loadingOperational">
          <Loader2 v-if="loading || loadingOperational" class="animate-spin" />
          <RefreshCw v-else />
          Actualizar
        </Button>
      </div>

      <Tabs v-model="activeTab" class="space-y-6">
        <TabsList class="grid w-full max-w-[400px] grid-cols-2">
          <TabsTrigger value="operational">Auditoría Operativa</TabsTrigger>
          <TabsTrigger value="technical">Auditoría Técnica</TabsTrigger>
        </TabsList>

        <!-- Operational Audit Tab Content -->
        <TabsContent value="operational" class="space-y-4">
          <div class="rounded-md border bg-card shadow-sm overflow-hidden">
            <Table>
              <TableHeader class="bg-muted/50">
                <TableRow>
                  <TableHead class="w-[180px]">Fecha y Hora</TableHead>
                  <TableHead>Evento</TableHead>
                  <TableHead>Cotización</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Justificación</TableHead>
                  <TableHead class="text-right">Detalle</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-if="loadingOperational && operationalLogs.length === 0">
                  <TableCell colspan="6" class="h-32 text-center text-sm">
                    <Loader2 class="h-5 w-5 animate-spin inline mr-2" />
                    Cargando auditoría operativa...
                  </TableCell>
                </TableRow>
                
                <TableRow v-else-if="operationalLogs.length === 0">
                  <TableCell colspan="6" class="h-32 text-center text-muted-foreground text-sm">
                    No se encontraron registros de auditoría operativa.
                  </TableCell>
                </TableRow>

                <TableRow v-for="log in operationalLogs" :key="log.evento_id" class="group">
                  <TableCell class="text-xs font-medium">
                    {{ log.fecha ? format(new Date(log.fecha), 'PPpp', { locale: es }) : '-' }}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" :class="getEventTypeBadge(log.tipo_evento).class">
                      {{ getEventTypeBadge(log.tipo_evento).label }}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <router-link 
                      v-if="log.registro_id" 
                      :to="'/quotes/' + log.registro_id" 
                      class="text-blue-600 hover:underline font-mono text-xs font-semibold dark:text-blue-400"
                    >
                      {{ log.referencia || `ID: ${log.registro_id}` }}
                    </router-link>
                    <span v-else class="text-muted-foreground font-mono text-xs">-</span>
                  </TableCell>
                  <TableCell>
                    <div class="flex flex-col">
                      <span class="text-sm font-medium">{{ log.usuario_nombre || 'Sistema' }}</span>
                      <span class="text-[10px] text-muted-foreground">{{ log.usuario_email || '-' }}</span>
                    </div>
                  </TableCell>
                  <TableCell class="max-w-[300px] truncate" :title="log.justificacion">
                    <span class="text-sm text-muted-foreground italic">
                      "{{ log.justificacion }}"
                    </span>
                  </TableCell>
                  <TableCell class="text-right">
                    <Button variant="ghost" size="icon" @click="openOperationalDetail(log)" title="Ver detalle">
                      <Eye class="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <!-- Technical Audit Tab Content -->
        <TabsContent value="technical" class="space-y-4">
          <!-- Filters Bar -->
          <div class="flex flex-wrap items-end gap-4 p-4 rounded-lg border bg-card shadow-sm">
            <div>
              <label class="text-xs font-semibold uppercase text-muted-foreground">Tabla</label>
              <Select v-model="filters.tabla" @update:model-value="fetchLogs">
                <SelectTrigger class="w-[200px]">
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
                <SelectTrigger class="w-[150px]">
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
              <FilterX class="h-4 w-4" />
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
                  <TableCell colspan="5" class="h-32 text-center text-sm">
                    <Loader2 class="h-5 w-5 animate-spin inline mr-2" />
                    Cargando registros...
                  </TableCell>
                </TableRow>
                
                <TableRow v-else-if="logs.length === 0">
                  <TableCell colspan="5" class="h-32 text-center text-muted-foreground text-sm">
                    No se encontraron registros de auditoría.
                  </TableCell>
                </TableRow>

                <TableRow v-for="log in logs" :key="log.id" class="group">
                  <TableCell class="text-xs font-medium">
                    {{ log.timestamp ? format(new Date(log.timestamp), 'PPpp', { locale: es }) : '-' }}
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
                      <span class="text-sm font-medium">{{ log.profiles?.full_name || 'Sistema' }}</span>
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
        </TabsContent>
      </Tabs>

      <!-- Technical Detail Dialog -->
      <Dialog v-model:open="isDetailOpen">
        <DialogContent class="max-w-3xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <div class="flex items-center gap-2">
              <History class="h-5 w-5 text-primary" />
              <DialogTitle>Detalle de Auditoría Técnica</DialogTitle>
            </div>
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
                <pre class="text-[10px] bg-red-50/50 p-3 rounded border border-red-100 overflow-x-auto min-h-[100px] dark:bg-red-950/10 dark:border-red-900/30">{{ 
                  selectedLog?.valores_anteriores ? JSON.stringify(selectedLog.valores_anteriores, null, 2) : '(Vacio - INSERT)'
                }}</pre>
              </div>

              <!-- Values After -->
              <div class="space-y-2">
                <h4 class="text-xs font-bold uppercase text-green-600 flex items-center gap-1">
                  Valores Nuevos
                </h4>
                <pre class="text-[10px] bg-green-50/50 p-3 rounded border border-green-100 overflow-x-auto min-h-[100px] dark:bg-green-950/10 dark:border-green-900/30">{{ 
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

      <!-- Operational Detail Dialog -->
      <Dialog v-model:open="isOperationalDetailOpen">
        <DialogContent class="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <div class="flex items-center gap-2">
              <History class="h-5 w-5 text-primary" />
              <DialogTitle>Detalle de Auditoría Operativa</DialogTitle>
            </div>
            <DialogDescription>
              Evento ID: {{ selectedOperationalLog?.evento_id }}
            </DialogDescription>
          </DialogHeader>

          <div class="flex-1 overflow-y-auto space-y-6 py-4">
            <!-- Metadata Grid -->
            <div class="grid grid-cols-2 gap-4 text-xs bg-muted/30 p-3 rounded-md border">
              <div>
                <span class="font-bold block text-muted-foreground uppercase text-[10px]">Tipo de Evento</span>
                <Badge variant="outline" class="mt-1" :class="selectedOperationalLog ? getEventTypeBadge(selectedOperationalLog.tipo_evento).class : ''">
                  {{ selectedOperationalLog ? getEventTypeBadge(selectedOperationalLog.tipo_evento).label : '' }}
                </Badge>
              </div>
              <div>
                <span class="font-bold block text-muted-foreground uppercase text-[10px]">Fecha del Cambio</span>
                <span class="text-sm font-medium mt-1 block">
                  {{ selectedOperationalLog?.fecha ? format(new Date(selectedOperationalLog.fecha), 'PPpp', { locale: es }) : '-' }}
                </span>
              </div>
              <div>
                <span class="font-bold block text-muted-foreground uppercase text-[10px]">Cotización</span>
                <div class="mt-1">
                  <router-link 
                    v-if="selectedOperationalLog?.registro_id" 
                    :to="'/quotes/' + selectedOperationalLog.registro_id" 
                    class="text-blue-600 hover:underline font-mono text-sm font-semibold dark:text-blue-400"
                    @click="isOperationalDetailOpen = false"
                  >
                    {{ selectedOperationalLog.referencia || `ID: ${selectedOperationalLog.registro_id}` }}
                  </router-link>
                  <span v-else class="text-muted-foreground">-</span>
                </div>
              </div>
              <div>
                <span class="font-bold block text-muted-foreground uppercase text-[10px]">Usuario Responsable</span>
                <span class="text-sm font-medium block mt-1">
                  {{ selectedOperationalLog?.usuario_nombre || 'Sistema' }}
                </span>
                <span class="text-xs text-muted-foreground block">
                  {{ selectedOperationalLog?.usuario_email || '-' }}
                </span>
              </div>
            </div>

            <!-- Justification Section -->
            <div class="space-y-2 bg-amber-50/50 dark:bg-amber-950/10 p-4 rounded-md border border-amber-100 dark:border-amber-900/30">
              <span class="text-xs font-semibold text-amber-800 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText class="h-3.5 w-3.5" />
                Justificación Comercial / Operativa
              </span>
              <p class="text-sm font-medium whitespace-pre-wrap italic text-amber-900 dark:text-amber-300">
                "{{ selectedOperationalLog?.justificacion }}"
              </p>
            </div>

            <!-- Changes Detail Section -->
            <div class="space-y-3">
              <h4 class="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                Detalle de los Cambios
              </h4>

              <!-- Case 1: Quote Reopening -->
              <div v-if="selectedOperationalLog?.tipo_evento === 'reapertura_cotizacion'" class="border rounded-md p-4 space-y-3 bg-card shadow-sm">
                <p class="text-sm text-muted-foreground">
                  La cotización fue reabierta a estado de <strong>Borrador</strong> para permitir su edición. A continuación se muestran los valores previos a la reapertura:
                </p>
                <div class="grid grid-cols-2 gap-4 text-sm bg-muted/20 p-3 rounded border">
                  <div>
                    <span class="text-xs text-muted-foreground block uppercase">Estado de Pago Previo</span>
                    <span class="font-semibold block capitalize mt-0.5">{{ selectedOperationalLog.detalles?.estado_pago_anterior || 'No Pagado' }}</span>
                  </div>
                  <div>
                    <span class="text-xs text-muted-foreground block uppercase">Monto Total Previo</span>
                    <span class="font-semibold block mt-0.5 text-primary">
                      ${{ selectedOperationalLog.detalles?.monto_anterior?.toLocaleString('es-ES', { minimumFractionDigits: 2 }) || '0.00' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Case 2: Payment Modification / Cancellation -->
              <div v-else-if="selectedOperationalLog?.detalles?.valores_anteriores" class="border rounded-md overflow-hidden shadow-sm">
                <Table>
                  <TableHeader class="bg-muted/50">
                    <TableRow>
                      <TableHead>Campo Modificado</TableHead>
                      <TableHead>Valor Anterior</TableHead>
                      <TableHead>Valor Nuevo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow v-for="(val, key) in selectedOperationalLog.detalles.valores_anteriores" :key="key">
                      <TableCell class="font-mono text-xs font-semibold">{{ formatKey(key) }}</TableCell>
                      <TableCell class="text-red-600 dark:text-red-400 bg-red-50/10 dark:bg-red-950/5 font-mono text-xs">
                        {{ formatVal(key, val) }}
                      </TableCell>
                      <TableCell class="text-green-600 dark:text-green-400 bg-green-50/10 dark:bg-green-950/5 font-mono text-xs">
                        {{ formatVal(key, selectedOperationalLog.detalles.valores_nuevos?.[key]) }}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <!-- Fallback to JSON if no parsed values -->
              <div v-else class="space-y-2">
                <pre class="text-[10px] bg-muted p-3 rounded border overflow-x-auto">{{ 
                  JSON.stringify(selectedOperationalLog?.detalles, null, 2)
                }}</pre>
              </div>
            </div>
          </div>

          <div class="flex justify-end border-t pt-4">
            <Button @click="isOperationalDetailOpen = false">Cerrar</Button>
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
