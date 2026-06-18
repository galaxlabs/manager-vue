<template>
  <div class="page">
    <div class="page-header">
      <h1>Cash Flow Statement</h1>
      <div class="header-actions">
        <input v-model="fromDate" type="date" class="input input-sm" />
        <input v-model="toDate" type="date" class="input input-sm" />
        <button class="btn btn-primary btn-sm" @click="loadData">Run</button>
      </div>
    </div>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else class="cf-grid">
      <div class="card"><div class="card-header">Operating Activities</div>
        <div class="cf-section">
          <div class="cf-row"><span>Net Income</span><span class="num">{{ fmt(data.operating?.net_income) }}</span></div>
          <div class="cf-row"><span>AR/AP Change</span><span class="num">{{ fmt(data.operating?.ar_ap_change) }}</span></div>
          <div class="cf-row total"><span>Net Operating Cash Flow</span><span class="num">{{ fmt(data.operating?.total) }}</span></div>
        </div>
      </div>
      <div class="card"><div class="card-header">Investing Activities</div>
        <div class="cf-section">
          <div class="cf-row"><span>Fixed Asset Purchases</span><span class="num">{{ fmt(data.investing?.fixed_assets) }}</span></div>
          <div class="cf-row total"><span>Net Investing Cash Flow</span><span class="num">{{ fmt(data.investing?.total) }}</span></div>
        </div>
      </div>
      <div class="card"><div class="card-header">Financing Activities</div>
        <div class="cf-section">
          <div class="cf-row"><span>Equity Changes</span><span class="num">{{ fmt(data.financing?.equity) }}</span></div>
          <div class="cf-row total"><span>Net Financing Cash Flow</span><span class="num">{{ fmt(data.financing?.total) }}</span></div>
        </div>
      </div>
      <div class="card summary">
        <div class="cf-section">
          <div class="cf-row"><span>Net Change in Cash</span><span class="num">{{ fmt(data.net_change) }}</span></div>
          <div class="cf-row"><span>Opening Cash</span><span class="num">{{ fmt(data.opening_cash) }}</span></div>
          <div class="cf-row total"><span>Closing Cash</span><span class="num">{{ fmt(data.closing_cash) }}</span></div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { frappeCall } from '@/api/frappe'

const loading = ref(false)
const data = ref({})
const fromDate = ref('')
const toDate = ref('')

onMounted(() => {
  const d = new Date()
  fromDate.value = d.getFullYear() + '-01-01'
  toDate.value = d.toISOString().slice(0, 10)
  loadData()
})

const fmt = v => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(v || 0)

async function loadData() {
  loading.value = true
  try {
    const res = await frappeCall('manager.api.cash_flow', { from_date: fromDate.value, to_date: toDate.value })
    data.value = res.message || {}
  } catch {} finally { loading.value = false }
}
</script>
<style scoped>
.cf-grid { display: flex; flex-direction: column; gap: 1rem; max-width: 600px; }
.card { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
.card-header { padding: 0.65rem 1rem; border-bottom: 1px solid #e2e8f0; font-weight: 600; font-size: 0.85rem; color: #1e293b; }
.cf-section { padding: 0.5rem 1rem; }
.cf-row { display: flex; justify-content: space-between; padding: 0.4rem 0; font-size: 0.85rem; color: #475569; border-bottom: 1px solid #f8fafc; }
.cf-row.total { font-weight: 700; color: #1e293b; border-top: 1px solid #e2e8f0; border-bottom: none; padding-top: 0.6rem; margin-top: 0.25rem; }
.num { font-variant-numeric: tabular-nums; }
.card.summary { border-left: 3px solid #2563eb; }
.loading { text-align: center; padding: 3rem; color: #94a3b8; }
</style>
