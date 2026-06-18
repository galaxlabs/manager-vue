<template>
  <div class="page">
    <div class="page-header">
      <h1>Budgets</h1>
      <div class="header-actions">
        <button class="btn btn-primary" @click="$router.push('/accounting/budgets/new')">+ New Budget</button>
      </div>
    </div>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="!budgets.length" class="empty">No budgets yet.</div>
    <div v-else class="budget-list">
      <div v-for="b in budgets" :key="b.name" class="budget-card">
        <div class="budget-header" @click="toggle(b.name)">
          <div class="budget-info">
            <strong class="budget-name">{{ b.budget_name }}</strong>
            <span class="budget-year">{{ b.fiscal_year }}</span>
          </div>
          <div class="budget-sums">
            <span class="sum-label">Budget</span>
            <span class="sum-val">{{ formatCurrency(b._total_budget) }}</span>
            <span class="sum-label">Actual</span>
            <span class="sum-val">{{ formatCurrency(b._total_actual) }}</span>
            <span class="sum-label">Var</span>
            <span class="sum-val" :class="b._total_variance > 0 ? 'over' : 'under'">{{ formatCurrency(b._total_variance) }}</span>
          </div>
          <div class="budget-chevron">{{ expanded === b.name ? '&#9660;' : '&#9654;' }}</div>
        </div>
        <div v-if="expanded === b.name" class="budget-body">
          <div v-if="!b._accounts" class="loading-sm">Loading details...</div>
          <table v-else class="data-table">
            <thead>
              <tr>
                <th>Account</th>
                <th class="num">Budget</th>
                <th class="num">Actual</th>
                <th class="num">Variance</th>
                <th class="num">%</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="a in b._accounts" :key="a.account">
                <td>{{ a.account }}</td>
                <td class="num">{{ formatCurrency(a.budget_amount) }}</td>
                <td class="num">{{ formatCurrency(a.actual_amount) }}</td>
                <td class="num" :class="a.variance > 0 ? 'over' : 'under'">{{ formatCurrency(a.variance) }}</td>
                <td class="num">{{ a.budget_amount ? ((a.actual_amount / a.budget_amount) * 100).toFixed(0) : '-' }}%</td>
              </tr>
            </tbody>
          </table>
          <div class="budget-actions">
            <button class="btn btn-sm btn-outline" @click="$router.push('/accounting/budgets/' + b.name)">Edit</button>
            <button class="btn btn-sm btn-danger-outline" @click="doDelete(b)">Delete</button>
          </div>
        </div>
      </div>
    </div>
    <Modal :visible="deleteTarget" title="Delete Budget" confirmText="Delete" confirmClass="btn-danger" @confirm="confirmDelete" @cancel="deleteTarget = null">
      <p>Delete budget "{{ deleteTarget?.budget_name }}"?</p>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getList, frappeCall } from '@/api/frappe'
import Modal from '@/components/Modal.vue'

const budgets = ref([])
const loading = ref(true)
const expanded = ref(null)
const deleteTarget = ref(null)

onMounted(load)

async function load() {
  loading.value = true
  try {
    const res = await getList('Budget', {}, ['name', 'budget_name', 'fiscal_year', 'business'], 999)
    const list = Array.isArray(res) ? res : (res.message?.data || res.message || [])
    budgets.value = list.map(b => ({ ...b, _total_budget: 0, _total_actual: 0, _total_variance: 0, _accounts: null }))
  } catch { budgets.value = [] }
  loading.value = false
}

function toggle(name) {
  if (expanded.value === name) { expanded.value = null; return }
  expanded.value = name
  const b = budgets.value.find(x => x.name === name)
  if (b && !b._accounts) loadDetails(b)
}

async function loadDetails(b) {
  try {
    const res = await frappeCall('manager.api.get_budget_vs_actual', { name: b.name })
    const d = res.message?.data || {}
    b._accounts = d.accounts || []
    b._total_budget = d.total_budget || 0
    b._total_actual = d.total_actual || 0
    b._total_variance = d.total_variance || 0
  } catch { b._accounts = [] }
}

function doDelete(b) { deleteTarget.value = b }

async function confirmDelete() {
  if (!deleteTarget.value) return
  try {
    await frappeCall('manager.api.delete_doc', { doctype: 'Budget', name: deleteTarget.value.name })
    deleteTarget.value = null
    await load()
  } catch {}
}

function formatCurrency(v) {
  if (v == null) return '-'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v)
}
</script>

<style scoped>
.page { padding: 1.5rem 2rem; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; }
.page-header h1 { font-size: 1.3rem; margin: 0; color: #1e293b; }
.header-actions { display: flex; gap: 0.5rem; }
.loading, .empty { color: #64748b; font-size: 0.9rem; padding: 2rem 0; }
.budget-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 0.5rem; overflow: hidden; }
.budget-header { display: flex; align-items: center; padding: 0.75rem 1rem; cursor: pointer; gap: 1rem; }
.budget-header:hover { background: #f8fafc; }
.budget-info { flex: 1; }
.budget-name { display: block; font-size: 0.9rem; color: #1e293b; }
.budget-year { font-size: 0.78rem; color: #94a3b8; }
.budget-sums { display: flex; align-items: center; gap: 0.75rem; }
.sum-label { font-size: 0.7rem; color: #94a3b8; text-transform: uppercase; }
.sum-val { font-size: 0.85rem; font-weight: 600; min-width: 80px; text-align: right; }
.sum-val.over { color: #dc2626; }
.sum-val.under { color: #16a34a; }
.budget-chevron { color: #94a3b8; font-size: 0.8rem; }
.budget-body { border-top: 1px solid #f1f5f9; padding: 0.75rem 1rem; }
.loading-sm { color: #94a3b8; font-size: 0.8rem; padding: 0.5rem 0; }
.data-table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
.data-table th, .data-table td { padding: 0.4rem 0.5rem; text-align: left; border-bottom: 1px solid #f1f5f9; }
.data-table th { font-weight: 600; color: #475569; background: #f8fafc; font-size: 0.75rem; }
.num { text-align: right; }
.over { color: #dc2626; }
.under { color: #16a34a; }
.budget-actions { display: flex; gap: 0.35rem; margin-top: 0.75rem; }
.btn { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.5rem 1rem; border: none; border-radius: 6px; font-size: 0.85rem; cursor: pointer; }
.btn-primary { background: #2563eb; color: #fff; }
.btn-primary:hover { background: #1d4ed8; }
.btn-outline { background: transparent; color: #475569; border: 1px solid #cbd5e1; }
.btn-outline:hover { background: #f8fafc; }
.btn-danger-outline { background: transparent; color: #dc2626; border: 1px solid #fca5a5; }
.btn-danger-outline:hover { background: #fef2f2; }
.btn-sm { padding: 0.35rem 0.75rem; font-size: 0.8rem; }
</style>
