<template>
  <div class="page">
    <div class="page-header">
      <h1>Profit &amp; Loss</h1>
      <div class="date-filters">
        <input v-model="fromDate" type="date" class="input input-sm" @change="load" />
        <span class="sep">to</span>
        <input v-model="toDate" type="date" class="input input-sm" @change="load" />
      </div>
    </div>
    <div class="report-grid">
      <div class="report-panel">
        <h2>Income</h2>
        <div v-for="a in incomeAccounts" :key="a.name" class="report-row">
          <span class="rl">{{ a.account_name }}</span>
          <span class="rr">{{ formatCurrency(a.balance) }}</span>
        </div>
        <div class="report-row total-row">
          <span class="rl"><strong>Total Income</strong></span>
          <span class="rr"><strong>{{ formatCurrency(totalIncome) }}</strong></span>
        </div>
      </div>
      <div class="report-panel">
        <h2>Expenses</h2>
        <div v-for="a in expenseAccounts" :key="a.name" class="report-row">
          <span class="rl">{{ a.account_name }}</span>
          <span class="rr">{{ formatCurrency(a.balance) }}</span>
        </div>
        <div class="report-row total-row">
          <span class="rl"><strong>Total Expenses</strong></span>
          <span class="rr"><strong>{{ formatCurrency(totalExpense) }}</strong></span>
        </div>
      </div>
    </div>
    <div class="net-profit" :class="{ profit: netProfit >= 0, loss: netProfit < 0 }">
      <h2>{{ netProfit >= 0 ? 'Net Profit' : 'Net Loss' }}</h2>
      <span class="big-num">{{ formatCurrency(Math.abs(netProfit)) }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { frappeCall } from '@/api/frappe'
import { formatCurrency } from '@/utils/format'

const accounts = ref([])
const fromDate = ref('')
const toDate = ref('')

const incomeAccounts = computed(() => accounts.value.filter(a => a.account_type === 'Income'))
const expenseAccounts = computed(() => accounts.value.filter(a => a.account_type !== 'Income'))
const totalIncome = computed(() => incomeAccounts.value.reduce((s, a) => s + (a.balance || 0), 0))
const totalExpense = computed(() => expenseAccounts.value.reduce((s, a) => s + (a.balance || 0), 0))
const netProfit = computed(() => totalIncome.value - totalExpense.value)

async function load() {
  try {
    const params = {}
    if (fromDate.value) params.from_date = fromDate.value
    if (toDate.value) params.to_date = toDate.value
    const res = await frappeCall('manager.api.profit_and_loss', params)
    accounts.value = (res.message && res.message.accounts) || []
  } catch { accounts.value = [] }
}

onMounted(load)
</script>

<style scoped>
.page-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem; }
.date-filters { display: flex; align-items: center; gap: 0.5rem; }
.input-sm { padding: 0.35rem 0.5rem; font-size: 13px; border: 1px solid #d0d0d0; border-radius: 5px; }
.sep { color: #888; font-size: 13px; }
.report-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 1rem; }
.report-panel { background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 1rem; }
.report-panel h2 { font-size: 15px; font-weight: 700; margin-bottom: 0.75rem; padding-bottom: 0.5rem; border-bottom: 2px solid #f0f0f0; }
.report-row { display: flex; justify-content: space-between; padding: 0.3rem 0; font-size: 14px; }
.report-row + .report-row { border-top: 1px solid #f5f5f5; }
.rr { font-variant-numeric: tabular-nums; }
.total-row { border-top: 2px solid #ccc !important; margin-top: 0.5rem; padding-top: 0.5rem; }
.net-profit { margin-top: 1.5rem; padding: 1rem 1.5rem; background: #fff; border-radius: 8px; border: 2px solid #e0e0e0; display: flex; align-items: center; justify-content: space-between; }
.net-profit.profit { border-color: #27ae60; background: #f0faf3; }
.net-profit.loss { border-color: #e74c3c; background: #fdf0ef; }
.big-num { font-size: 24px; font-weight: 700; }
</style>
