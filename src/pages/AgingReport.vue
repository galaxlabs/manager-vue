<template>
  <div class="page">
    <div class="page-header">
      <h1>Accounts Receivable Aging</h1>
      <div class="header-actions">
        <select v-model="reportType" class="input input-sm">
          <option value="Sales Invoice">Accounts Receivable</option>
          <option value="Purchase Invoice">Accounts Payable</option>
        </select>
        <button class="btn btn-primary btn-sm" @click="loadData">Run Report</button>
      </div>
    </div>
    <div v-if="loading" class="loading">Loading...</div>
    <template v-else>
      <div class="kpi-row">
        <div v-for="(val, bucket) in buckets" :key="bucket" class="kpi-card" :class="bucketClass(bucket)">
          <div class="kpi-label">{{ bucket }} days</div>
          <div class="kpi-value">{{ fmt(val) }}</div>
        </div>
      </div>
      <div class="card">
        <DataTable :columns="columns" :rows="details" compact @row-click="goDrill" />
      </div>
    </template>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { frappeCall } from '@/api/frappe'
import DataTable from '@/components/DataTable.vue'

const router = useRouter()
const reportType = ref('Sales Invoice')
const loading = ref(false)
const buckets = ref({})
const details = ref([])
const columns = [
  { key: 'name', label: 'Doc #' },
  { key: 'party', label: 'Party' },
  { key: 'date', label: 'Date', format: 'date' },
  { key: 'amount', label: 'Amount', format: 'currency', align: 'num-col' },
  { key: 'balance', label: 'Balance', format: 'currency', align: 'num-col' },
  { key: 'bucket', label: 'Bucket' },
  { key: 'status', label: 'Status', format: 'badge' },
]
const fmt = v => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(v || 0)

function bucketClass(b) {
  if (b === '0-30') return 'bucket-current'
  if (b === '31-60') return 'bucket-warn'
  if (b === '61-90') return 'bucket-late'
  return 'bucket-overdue'
}

async function loadData() {
  loading.value = true
  try {
    const res = await frappeCall('manager.api.aging_report', { doctype: reportType.value })
    if (res.message) {
      buckets.value = res.message.buckets || {}
      details.value = res.message.details || []
    }
  } catch {} finally { loading.value = false }
}
function goDrill(row) {
  const path = reportType.value === 'Sales Invoice' ? '/sales/invoices' : '/purchases/invoices'
  router.push(path + '/' + row.name)
}
loadData()
</script>
<style scoped>
.kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; margin-bottom: 1rem; }
.kpi-card { padding: 1rem; border-radius: 8px; border: 1px solid #e2e8f0; background: #fff; }
.kpi-card.bucket-current { border-left: 3px solid #22c55e; }
.kpi-card.bucket-warn { border-left: 3px solid #f59e0b; }
.kpi-card.bucket-late { border-left: 3px solid #f97316; }
.kpi-card.bucket-overdue { border-left: 3px solid #dc2626; }
.kpi-label { font-size: 0.75rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.3px; }
.kpi-value { font-size: 1.2rem; font-weight: 700; color: #1e293b; margin-top: 0.25rem; }
.card { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
.loading { text-align: center; padding: 3rem; color: #94a3b8; }
</style>
