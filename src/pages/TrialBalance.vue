<template>
  <div class="page">
    <div class="page-header">
      <h1>Trial Balance</h1>
      <div class="report-total">Total Debit: <strong>{{ formatCurrency(totalDebit) }}</strong> &mdash; Total Credit: <strong>{{ formatCurrency(totalCredit) }}</strong></div>
    </div>
    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr><th>Account</th><th>Type</th><th>Debit</th><th>Credit</th></tr>
        </thead>
        <tbody>
          <tr v-for="a in accounts" :key="a.name" :class="{ 'group-row': a.is_group }">
            <td>{{ a.account_name }}</td>
            <td>{{ a.account_type }}</td>
            <td class="num">{{ a.is_group ? '' : (a.balance > 0 ? formatCurrency(a.balance) : '') }}</td>
            <td class="num">{{ a.is_group ? '' : (a.balance < 0 ? formatCurrency(-a.balance) : '') }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="total-row">
            <td><strong>Total</strong></td><td></td>
            <td class="num"><strong>{{ formatCurrency(totalDebit) }}</strong></td>
            <td class="num"><strong>{{ formatCurrency(totalCredit) }}</strong></td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { frappeCall } from '@/api/frappe'
import { formatCurrency } from '@/utils/format'

const accounts = ref([])

const totalDebit = computed(() => {
  return accounts.value.filter(a => !a.is_group && a.balance > 0).reduce((s, a) => s + (a.balance || 0), 0)
})
const totalCredit = computed(() => {
  return accounts.value.filter(a => !a.is_group && a.balance < 0).reduce((s, a) => s + Math.abs(a.balance || 0), 0)
})

onMounted(async () => {
  try {
    const res = await frappeCall('manager.api.trial_balance')
    accounts.value = res.message || []
  } catch { accounts.value = [] }
})
</script>

<style scoped>
.page-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem; }
.report-total { font-size: 14px; color: #555; }
.group-row td:first-child { font-weight: 600; padding-left: 1rem; }
.num { text-align: right; font-variant-numeric: tabular-nums; }
.total-row { background: #f5f7fa; }
</style>
