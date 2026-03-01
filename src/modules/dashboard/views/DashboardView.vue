<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { DashboardService, type DashboardMetrics, type ChartDataPoint, type DateRangeOption } from '../DashboardService'
import DashboardFilter from '../components/DashboardFilter.vue'
import KpiCard from '../components/KpiCard.vue'
import SalesChart from '../components/SalesChart.vue'
import QuoteStatusChart from '../components/QuoteStatusChart.vue'
import { 
  BadgeDollarSign, 
  FileText, 
  TrendingUp, 
  Clock,
  LayoutDashboard
} from 'lucide-vue-next'
import { toast } from 'vue-sonner'

// State
const filter = ref<DateRangeOption>('this_month')
const customRange = ref<{ start: Date, end: Date } | undefined>(undefined)
const loading = ref(false)

const metrics = ref<DashboardMetrics>({
  totalQuoted: 0,
  totalSold: 0,
  quoteCount: 0,
  soldCount: 0,
  conversionRate: 0,
  pendingCount: 0,
  statusDistribution: {}
})

const chartData = ref<ChartDataPoint[]>([])

const currencyFmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

const fetchData = async () => {
  loading.value = true
  try {
    const dates = DashboardService.getDateRange(filter.value, customRange.value?.start, customRange.value?.end)
    const [metricsData, chartsData] = await Promise.all([
        DashboardService.getMetrics(dates.start, dates.end),
        DashboardService.getChartData(dates.start, dates.end)
    ])
    
    metrics.value = metricsData
    chartData.value = chartsData
  } catch (error) {
    console.error(error)
    toast.error('Error al cargar métricas')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p class="text-muted-foreground">Resumen de operaciones y rendimiento.</p>
      </div>
      
      <!-- Filter -->
      <DashboardFilter 
        v-model="filter" 
        v-model:customRange="customRange"
        @change="fetchData" 
      />
    </div>

    <!-- KPIs Grid -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KpiCard 
        title="Ventas Cerradas" 
        :value="currencyFmt.format(metrics.totalSold)"
        :sub-value="`${metrics.soldCount} ventas confirmadas`"
        :icon="BadgeDollarSign"
        :loading="loading"
        class="border-l-4 border-l-green-600"
      />
      
      <KpiCard 
        title="Volumen Cotizado" 
        :value="currencyFmt.format(metrics.totalQuoted)"
        :sub-value="`${metrics.quoteCount} cotizaciones creadas`"
        :icon="FileText"
        :loading="loading"
        class="border-l-4 border-l-blue-600"
      />

      <KpiCard 
        title="Tasa de Conversión" 
        :value="`${metrics.conversionRate.toFixed(1)}%`"
        sub-value="De Cotización a Venta"
        :icon="TrendingUp"
        :loading="loading"
      />

      <KpiCard 
        title="Pendientes" 
        :value="metrics.pendingCount"
        sub-value="En revisión o aprobadas"
        :icon="Clock"
        :loading="loading"
      />
    </div>

    <!-- Charts Section -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <!-- Main Chart -->
      <div class="col-span-4 border rounded-xl p-6 bg-card flex flex-col">
        <div class="flex items-center gap-2 mb-6">
            <LayoutDashboard class="h-5 w-5 text-muted-foreground" />
            <h3 class="font-medium">Evolución Financiera</h3>
        </div>
        <div class="flex-1 min-h-[300px]">
            <SalesChart :data="chartData" />
        </div>
      </div>

      <!-- Secondary Chart -->
      <div class="col-span-3 border rounded-xl p-6 bg-card flex flex-col">
        <div class="flex items-center gap-2 mb-6">
            <LayoutDashboard class="h-5 w-5 text-muted-foreground" />
            <h3 class="font-medium">Distribución de Estados</h3>
        </div>
        <div class="flex-1 min-h-[300px] flex items-center justify-center">
            <QuoteStatusChart :data="metrics.statusDistribution" />
        </div>
      </div>
    </div>
  </div>
</template>
