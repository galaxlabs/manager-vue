<template>
  <div class="page">
    <div class="page-header">
      <h1>Fixed Assets</h1>
      <div class="header-actions">
        <button class="btn btn-primary" @click="$router.push('/capital/fixed-assets/new')">+ New Asset</button>
      </div>
    </div>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="!assets.length" class="empty">No fixed assets yet.</div>
    <table v-else class="data-table">
      <thead>
        <tr>
          <th>Asset Code</th>
          <th>Name</th>
          <th>Acquisition Cost</th>
          <th>Depreciation</th>
          <th>Book Value</th>
          <th>Status</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="a in assets" :key="a.name">
          <td>{{ a.asset_code || '-' }}</td>
          <td>{{ a.asset_name }}</td>
          <td class="num">{{ fmt(a.acquisition_cost) }}</td>
          <td class="num">{{ fmt(a.depreciation) }}</td>
          <td class="num"><strong>{{ fmt(a.book_value) }}</strong></td>
          <td>
            <span class="badge" :class="statusClass(a.status)">{{ a.status || 'Draft' }}</span>
          </td>
          <td class="actions">
            <button class="btn btn-sm btn-outline" @click="$router.push('/capital/fixed-assets/' + a.name)">Edit</button>
            <button class="btn btn-sm btn-danger-outline" @click="doDelete(a)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="!loading && assets.length" class="summary">
      <div class="summary-item">
        <span class="summary-label">Total Cost</span>
        <span class="summary-val">{{ fmt(totalCost) }}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Total Depreciation</span>
        <span class="summary-val">{{ fmt(totalDepr) }}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Net Book Value</span>
        <span class="summary-val highlight">{{ fmt(totalBook) }}</span>
      </div>
    </div>
    <Modal :visible="deleteTarget" title="Delete Fixed Asset" confirmText="Delete" confirmClass="btn-danger" @confirm="confirmDelete" @cancel="deleteTarget = null">
      <p>Delete asset "{{ deleteTarget?.asset_name }}"? This cannot be undone.</p>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getList, frappeCall } from '@/api/frappe'
import Modal from '@/components/Modal.vue'

const assets = ref([])
const loading = ref(true)
const deleteTarget = ref(null)

onMounted(load)

async function load() {
  loading.value = true
  try {
    const res = await getList('Fixed Asset', {}, ['*'], 999)
    assets.value = Array.isArray(res) ? res : (res.message?.data || res.message || [])
  } catch { assets.value = [] }
  loading.value = false
}

const totalCost = computed(() => assets.value.reduce((s, a) => s + (a.acquisition_cost || 0), 0))
const totalDepr = computed(() => assets.value.reduce((s, a) => s + (a.depreciation || 0), 0))
const totalBook = computed(() => assets.value.reduce((s, a) => s + (a.book_value || 0), 0))

function statusClass(s) {
  if (s === 'Active' || s === 'In Use') return 'badge-green'
  if (s === 'Disposed' || s === 'Sold') return 'badge-gray'
  if (s === 'Under Maintenance') return 'badge-yellow'
  return 'badge-blue'
}

function fmt(v) {
  if (v == null) return '-'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v)
}

function doDelete(a) { deleteTarget.value = a }

async function confirmDelete() {
  if (!deleteTarget.value) return
  try {
    await frappeCall('manager.api.delete_doc', { doctype: 'Fixed Asset', name: deleteTarget.value.name })
    deleteTarget.value = null
    await load()
  } catch {}
}
</script>

<style scoped>
.page { padding: 1.5rem 2rem; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; }
.page-header h1 { font-size: 1.3rem; margin: 0; color: #1e293b; }
.header-actions { display: flex; gap: 0.5rem; }
.loading, .empty { color: #64748b; font-size: 0.9rem; padding: 2rem 0; }
.data-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.data-table th, .data-table td { padding: 0.5rem 0.75rem; text-align: left; border-bottom: 1px solid #f1f5f9; }
.data-table th { font-weight: 600; color: #475569; background: #f8fafc; }
.data-table td { color: #334155; }
.num { text-align: right; }
.actions { display: flex; gap: 0.35rem; }
.badge { display: inline-block; padding: 0.2rem 0.55rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
.badge-green { background: #dcfce7; color: #16a34a; }
.badge-blue { background: #dbeafe; color: #1d4ed8; }
.badge-yellow { background: #fef9c3; color: #ca8a04; }
.badge-gray { background: #f1f5f9; color: #94a3b8; }
.summary { display: flex; gap: 2rem; padding: 1rem 0; margin-top: 0.5rem; border-top: 2px solid #e2e8f0; }
.summary-item { display: flex; flex-direction: column; }
.summary-label { font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; }
.summary-val { font-size: 1.1rem; font-weight: 700; color: #1e293b; }
.summary-val.highlight { color: #2563eb; }
.btn { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.5rem 1rem; border: none; border-radius: 6px; font-size: 0.85rem; cursor: pointer; }
.btn-primary { background: #2563eb; color: #fff; }
.btn-primary:hover { background: #1d4ed8; }
.btn-outline { background: transparent; color: #475569; border: 1px solid #cbd5e1; }
.btn-outline:hover { background: #f8fafc; }
.btn-danger-outline { background: transparent; color: #dc2626; border: 1px solid #fca5a5; }
.btn-danger-outline:hover { background: #fef2f2; }
.btn-sm { padding: 0.35rem 0.75rem; font-size: 0.8rem; }
</style>
