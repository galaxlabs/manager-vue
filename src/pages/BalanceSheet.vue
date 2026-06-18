<template>
  <div class="page">
    <div class="page-header">
      <h1>Balance Sheet</h1>
    </div>
    <div class="report-grid">
      <div class="report-panel">
        <h2>Assets</h2>
        <div v-for="a in assetAccounts" :key="a.name" class="report-row">
          <span class="rl">{{ a.account_name }}</span>
          <span class="rr">{{ formatCurrency(a.balance) }}</span>
        </div>
        <div class="report-row total-row">
          <span class="rl"><strong>Total Assets</strong></span>
          <span class="rr"><strong>{{ formatCurrency(totalAssets) }}</strong></span>
        </div>
      </div>
      <div>
        <div class="report-panel">
          <h2>Liabilities</h2>
          <div v-for="a in liabilityAccounts" :key="a.name" class="report-row">
            <span class="rl">{{ a.account_name }}</span>
            <span class="rr">{{ formatCurrency(a.balance) }}</span>
          </div>
          <div class="report-row total-row">
            <span class="rl"><strong>Total Liabilities</strong></span>
            <span class="rr"><strong>{{ formatCurrency(totalLiabilities) }}</strong></span>
          </div>
        </div>
        <div class="report-panel" style="margin-top:1rem">
          <h2>Equity</h2>
          <div v-for="a in equityAccounts" :key="a.name" class="report-row">
            <span class="rl">{{ a.account_name }}</span>
            <span class="rr">{{ formatCurrency(a.balance) }}</span>
          </div>
          <div class="report-row total-row">
            <span class="rl"><strong>Total Equity</strong></span>
            <span class="rr"><strong>{{ formatCurrency(totalEquity) }}</strong></span>
          </div>
        </div>
        <div class="net-sum">
          <h3>Liabilities + Equity</h3>
          <span class="big-num">{{ formatCurrency(totalLiabilities + totalEquity) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { frappeCall } from '@/api/frappe'
import { formatCurrency } from '@/utils/format'

const accounts = ref([])

const assetTypes = ['Asset', 'Bank', 'Cash', 'Receivable', 'Fixed Asset', 'Stock', 'Accumulated Depreciation']
const liabilityTypes = ['Liability', 'Payable']
const equityTypes = ['Equity']

const assetAccounts = computed(() => accounts.value.filter(a => !a.is_group && assetTypes.includes(a.account_type)))
const liabilityAccounts = computed(() => accounts.value.filter(a => !a.is_group && liabilityTypes.includes(a.account_type)))
const equityAccounts = computed(() => accounts.value.filter(a => !a.is_group && equityTypes.includes(a.account_type)))

const totalAssets = computed(() => assetAccounts.value.reduce((s, a) => s + (a.balance || 0), 0))
const totalLiabilities = computed(() => liabilityAccounts.value.reduce((s, a) => s + (a.balance || 0), 0))
const totalEquity = computed(() => equityAccounts.value.reduce((s, a) => s + (a.balance || 0), 0))

onMounted(async () => {
  try {
    const res = await frappeCall('manager.api.balance_sheet')
    accounts.value = (res.message && res.message.accounts) || []
  } catch { accounts.value = [] }
})
</script>

<style scoped>
.page-header { margin-bottom: 1rem; }
.report-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
.report-panel { background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 1rem; }
.report-panel h2 { font-size: 15px; font-weight: 700; margin-bottom: 0.75rem; padding-bottom: 0.5rem; border-bottom: 2px solid #f0f0f0; }
.report-row { display: flex; justify-content: space-between; padding: 0.3rem 0; font-size: 14px; }
.report-row + .report-row { border-top: 1px solid #f5f5f5; }
.rr { font-variant-numeric: tabular-nums; }
.total-row { border-top: 2px solid #ccc !important; margin-top: 0.5rem; padding-top: 0.5rem; }
.net-sum { margin-top: 1rem; padding: 1rem; background: #f0faf3; border: 2px solid #27ae60; border-radius: 8px; display: flex; align-items: center; justify-content: space-between; }
.net-sum h3 { font-size: 14px; }
.big-num { font-size: 22px; font-weight: 700; }
</style>
