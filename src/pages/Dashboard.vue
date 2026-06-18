<template>
  <div class="page dashboard">
    <div class="page-header">
      <h1>Dashboard</h1>
      <div class="header-actions">
        <button class="btn btn-secondary btn-sm" @click="refresh" :disabled="loading">
          {{ loading ? 'Loading...' : 'Refresh' }}
        </button>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-label">Total Assets</div>
        <div class="kpi-value">{{ fmt(data.total_assets) }}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Total Liabilities</div>
        <div class="kpi-value">{{ fmt(data.total_liabilities) }}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Equity</div>
        <div class="kpi-value">{{ fmt(data.total_equity) }}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Net Profit</div>
        <div class="kpi-value" :class="data.net_profit >= 0 ? 'profit' : 'loss'">{{ fmt(data.net_profit) }}</div>
      </div>
    </div>

    <div class="kpi-grid secondary">
      <div class="kpi-card sm">
        <div class="kpi-label">Income</div>
        <div class="kpi-value">{{ fmt(data.total_income) }}</div>
      </div>
      <div class="kpi-card sm">
        <div class="kpi-label">Expenses</div>
        <div class="kpi-value">{{ fmt(data.total_expenses) }}</div>
      </div>
      <div class="kpi-card sm">
        <div class="kpi-label">AR Outstanding</div>
        <div class="kpi-value">{{ fmt(data.ar_total) }}</div>
        <div class="kpi-trend">Overdue: {{ fmt(data.ar_overdue) }}</div>
      </div>
      <div class="kpi-card sm">
        <div class="kpi-label">AR + AP Net</div>
        <div class="kpi-value">{{ fmt(data.ar_total - data.ap_total) }}</div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="grid-2col">
      <div class="card">
        <div class="card-header"><h2>Monthly Income vs Expenses</h2></div>
        <div class="chart-wrap">
          <Bar v-if="monthlyLabels.length" :data="monthlyChart" :options="chartOpts" />
          <div v-else class="chart-empty">No data</div>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><h2>Top Customers</h2></div>
        <div class="chart-wrap">
          <Bar v-if="topCustLabels.length" :data="custChart" :options="custOpts" />
          <div v-else class="chart-empty">No data</div>
        </div>
      </div>
    </div>

    <!-- Entity Summary & Recent -->
    <div class="grid-2col">
      <div class="card">
        <div class="card-header"><h2>Entity Summary</h2></div>
        <div class="entity-grid">
          <div v-for="(cnt, name) in data.entity_counts" :key="name" class="entity-item">
            <span class="entity-label">{{ name }}</span>
            <span class="entity-count">{{ cnt }}</span>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><h2>Recent Transactions</h2></div>
        <div class="tx-list">
          <div v-for="tx in data.recent_transactions" :key="tx.name" class="tx-item">
            <router-link :to="'/' + tx.doctype.toLowerCase().replace(' ', '-') + 's/' + tx.name" class="tx-link">
              <span class="tx-doctype">{{ tx.doctype }}</span>
              <span class="tx-name">{{ tx.name }}</span>
            </router-link>
          </div>
          <div v-if="!data.recent_transactions?.length" class="chart-empty">No transactions</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { frappeCall } from '@/api/frappe'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const loading = ref(false)
const data = ref({
  total_assets: 0, total_liabilities: 0, total_equity: 0,
  total_income: 0, total_expenses: 0, net_profit: 0,
  ar_total: 0, ar_overdue: 0, ap_total: 0,
  entity_counts: {}, monthly_data: [], recent_transactions: [],
  top_customers: [],
})

const fmt = (v) => {
  if (v == null || v === 0) return '0'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(v)
}

const monthlyLabels = computed(() => data.value.monthly_data?.map(m => m.month) || [])
const monthlyChart = computed(() => ({
  labels: monthlyLabels.value,
  datasets: [
    { label: 'Income', data: data.value.monthly_data?.map(m => m.income) || [], backgroundColor: '#22c55e', borderRadius: 4 },
    { label: 'Expenses', data: data.value.monthly_data?.map(m => m.expense) || [], backgroundColor: '#ef4444', borderRadius: 4 },
  ]
}))

const chartOpts = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { position: 'top', labels: { boxWidth: 12, padding: 12 } } },
  scales: { x: { grid: { display: false } }, y: { beginAtZero: true, grid: { color: '#f1f5f9' } } },
}

const topCustLabels = computed(() => data.value.top_customers?.map(c => c.customer?.slice(0, 12)) || [])
const custChart = computed(() => ({
  labels: topCustLabels.value,
  datasets: [{ label: 'Revenue', data: data.value.top_customers?.map(c => c.revenue) || [], backgroundColor: '#2563eb', borderRadius: 4 }]
}))
const custOpts = { ...chartOpts, indexAxis: 'y', plugins: { ...chartOpts.plugins, legend: { display: false } } }

async function refresh() {
  loading.value = true
  try {
    const res = await frappeCall('manager.api.get_dashboard_data')
    if (res.message) data.value = res.message
  } catch (e) { console.warn('Dashboard error:', e) }
  finally { loading.value = false }
}

onMounted(refresh)
</script>

<style scoped>
.kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1rem; }
.kpi-grid.secondary { grid-template-columns: repeat(4, 1fr); }
.kpi-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 1.25rem; }
.kpi-card.sm { padding: 1rem; }
.kpi-label { font-size: 0.8rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.35rem; }
.kpi-value { font-size: 1.4rem; font-weight: 700; color: #1e293b; }
.kpi-value.profit { color: #16a34a; }
.kpi-value.loss { color: #dc2626; }
.kpi-trend { font-size: 0.75rem; color: #94a3b8; margin-top: 0.25rem; }
.grid-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
.card { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
.card-header { padding: 0.75rem 1rem; border-bottom: 1px solid #e2e8f0; }
.card-header h2 { font-size: 0.9rem; font-weight: 600; color: #1e293b; margin: 0; }
.chart-wrap { padding: 1rem; height: 220px; }
.chart-empty { display: flex; align-items: center; justify-content: center; height: 100%; color: #94a3b8; font-size: 0.85rem; }
.entity-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.25rem; padding: 0.5rem; }
.entity-item { display: flex; justify-content: space-between; padding: 0.4rem 0.5rem; font-size: 0.8rem; border-bottom: 1px solid #f8fafc; }
.entity-label { color: #475569; }
.entity-count { font-weight: 600; color: #1e293b; }
.tx-list { max-height: 300px; overflow-y: auto; }
.tx-item { padding: 0.5rem 0.75rem; border-bottom: 1px solid #f8fafc; }
.tx-item:hover { background: #f8fafc; }
.tx-link { text-decoration: none; color: inherit; display: flex; gap: 0.5rem; align-items: center; }
.tx-doctype { font-size: 0.7rem; background: #e0f2fe; color: #0369a1; padding: 0.15rem 0.4rem; border-radius: 3px; }
.tx-name { font-size: 0.85rem; color: #1e293b; font-weight: 500; }
@media (max-width: 768px) { .kpi-grid, .kpi-grid.secondary, .grid-2col { grid-template-columns: 1fr 1fr; } }
</style>
