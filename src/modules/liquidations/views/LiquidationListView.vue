<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  Search,
  Calendar,
  User,
  Users2,
  Loader2,
  Eye,
  Plus
} from 'lucide-vue-next'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'vue-sonner'
import { LiquidationService, type LiquidationWithDetails } from '../LiquidationService'
import LiquidationStatusBadge from '../components/LiquidationStatusBadge.vue'
import LiquidationDetailsDialog from '../components/LiquidationDetailsDialog.vue'

const liquidations = ref<LiquidationWithDetails[]>([])
const loading = ref(true)

// Dialog states
const showDetailsDialog = ref(false)
const selectedLiquidation = ref<LiquidationWithDetails | null>(null)

// Realtime subscription
let liquidationSubscription: any = null

const subscribeToLiquidations = () => {
  liquidationSubscription = supabase
    .channel('public:liquidaciones')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'liquidaciones' },
      () => {
        fetchLiquidations()
      }
    )
    .subscribe()
}

// Filters & Pagination
const searchQuery = ref('')
const statusFilter = ref('all')
const currentPage = ref(1)
const pageSize = ref(15)
const totalItems = ref(0)

const fetchLiquidations = async () => {
  loading.value = true
  try {
    const response = await LiquidationService.getLiquidations({
      page: currentPage.value,
      pageSize: pageSize.value,
      search: searchQuery.value,
      status: statusFilter.value,
    })

    liquidations.value = response.data
    totalItems.value = response.count || 0
  } catch (error) {
    console.error(error)
    toast.error('Error al cargar liquidaciones')
  } finally {
    loading.value = false
  }
}

// Watchers
watch([currentPage, pageSize, statusFilter], () => {
  fetchLiquidations()
})

let searchTimeout: any = null
watch(searchQuery, () => {
  currentPage.value = 1
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchLiquidations()
  }, 500)
})

const openDetails = (liquidation: LiquidationWithDetails) => {
  selectedLiquidation.value = liquidation
  showDetailsDialog.value = true
}

onMounted(() => {
  fetchLiquidations()
  subscribeToLiquidations()
})

onUnmounted(() => {
  if (liquidationSubscription) {
    supabase.removeChannel(liquidationSubscription)
  }
})
</script>

<template>
  <div class="space-y-4">
    <div>
      <h1 class="text-3xl font-bold tracking-tight">Liquidaciones</h1>
      <p class="text-muted-foreground">
        Controla los cobros y facturaciones de los servicios cotizados.
      </p>
    </div>

    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex items-center gap-2 w-full max-w-2xl">
        <div class="relative flex-1">
          <Search class="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            v-model="searchQuery"
            placeholder="Buscar por código de referencia, cliente o grupo..."
            class="pl-8"
          />
        </div>
        <div class="w-48">
          <Select v-model="statusFilter">
            <SelectTrigger>
              <SelectValue placeholder="Estado de Pago" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="unpaid">No Pagadas</SelectItem>
              <SelectItem value="paid">Pagadas</SelectItem>
              <SelectItem value="partial">Pagos Parciales</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <HasPermission name="quotes.approve">
        <router-link to="/quotes/new" v-slot="{ navigate }">
          <Button @click="navigate" class="flex items-center gap-2 w-full md:w-auto">
            <Plus class="w-4 h-4" />
            Crear Nuevo
          </Button>
        </router-link>
      </HasPermission>
    </div>

    <div class="rounded-md border bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader class="bg-muted/50">
          <TableRow>
            <TableHead class="w-20">ID</TableHead>
            <TableHead class="w-32">Ref. Cotización</TableHead>
            <TableHead>Cliente / Grupo</TableHead>
            <TableHead>Pax</TableHead>
            <TableHead>Fecha Liquidación</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Estado Pago</TableHead>
            <TableHead class="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="loading">
            <TableCell colspan="8" class="text-center py-12">
              <div class="flex flex-col items-center gap-2">
                <Loader2 class="h-8 w-8 animate-spin text-primary" />
                <span class="text-sm text-muted-foreground">Cargando liquidaciones...</span>
              </div>
            </TableCell>
          </TableRow>
          <TableRow v-else-if="liquidations.length === 0">
            <TableCell colspan="8" class="text-center py-12 text-muted-foreground">
              No se encontraron liquidaciones.
            </TableCell>
          </TableRow>
          <TableRow
            v-for="liq in liquidations"
            :key="liq.liquidacion_id"
            class="group cursor-pointer"
            @click="openDetails(liq)"
          >
            <TableCell class="font-mono text-xs font-semibold text-muted-foreground">
              #{{ liq.liquidacion_id }}
            </TableCell>
            <TableCell class="font-mono text-xs font-bold text-primary">
              {{ liq.codigo_referencia }}
            </TableCell>
            <TableCell>
              <div class="flex flex-col">
                <span class="font-medium">{{ liq.cliente_nombre || 'Cliente General' }}</span>
                <span v-if="liq.nombre_grupo" class="text-xs text-muted-foreground flex items-center gap-1">
                  <User class="w-3 h-3" /> {{ liq.nombre_grupo }}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <div class="flex items-center gap-1" v-if="liq.cantidad_pax">
                <Users2 class="w-3.5 h-3.5 text-muted-foreground" />
                <span class="text-sm font-medium">{{ liq.cantidad_pax }}</span>
              </div>
              <span v-else class="text-muted-foreground">-</span>
            </TableCell>
            <TableCell>
              <div v-if="liq.fecha_liquidacion" class="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar class="w-3 h-3" />
                {{ format(new Date(liq.fecha_liquidacion), 'dd/MM/yyyy HH:mm', { locale: es }) }}
              </div>
            </TableCell>
            <TableCell class="font-bold text-primary">
              {{
                new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: liq.moneda || 'USD',
                }).format(liq.monto_total || 0)
              }}
            </TableCell>
            <TableCell>
              <LiquidationStatusBadge :status="liq.estado_pago" />
            </TableCell>
            <TableCell class="text-right" @click.stop>
              <Button variant="ghost" size="sm" @click="openDetails(liq)">
                <Eye class="w-4 h-4 mr-1" /> Ver / Cobrar
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <!-- Pagination UI -->
    <div class="flex flex-col md:flex-row items-center justify-between px-2 py-4 gap-4">
      <div class="text-xs text-muted-foreground">
        Mostrando {{ liquidations.length }} de {{ totalItems }} liquidaciones
      </div>

      <Pagination
        v-slot="{ page }"
        v-model:page="currentPage"
        :total="totalItems"
        :items-per-page="pageSize"
        :sibling-count="1"
        show-edges
      >
        <PaginationContent v-slot="{ items }">
          <PaginationFirst />
          <PaginationPrevious />

          <template v-for="(item, index) in items">
            <PaginationItem
              v-if="item.type === 'page'"
              :key="index"
              :value="item.value"
              :is-active="item.value === page"
            >
              {{ item.value }}
            </PaginationItem>
            <PaginationEllipsis v-else :key="item.type" :index="index" />
          </template>

          <PaginationNext />
          <PaginationLast />
        </PaginationContent>
      </Pagination>
    </div>

    <!-- Details Dialog -->
    <LiquidationDetailsDialog
      v-model:open="showDetailsDialog"
      :liquidation="selectedLiquidation"
      @refresh="fetchLiquidations"
    />
  </div>
</template>
