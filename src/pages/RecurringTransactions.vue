<template>
  <div class="page">
    <div class="page-header">
      <h1>Recurring Transactions</h1>
      <div class="header-actions">
        <button class="btn btn-outline btn-sm" @click="runAllDue" :disabled="processing">{{ processing ? 'Processing...' : 'Run All Due' }}</button>
        <button class="btn btn-primary" @click="$router.push('/accounting/recurring/new')">+ New</button>
      </div>
    </div>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="!list.length" class="empty">No recurring transactions yet.</div>
    <table v-else class="data-table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Type</th>
          <th>Frequency</th>
          <th>Next Run</th>
          <th>Status</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in list" :key="r.name">
          <td>{{ r.title }}</td>
          <td>{{ r.reference_doctype }}</td>
          <td>{{ r.frequency }}</td>
          <td>{{ r.next_date }}</td>
          <td>
            <span class="badge" :class="r.enabled ? 'badge-green' : 'badge-gray'" @click="toggle(r)" style="cursor:pointer">
              {{ r.enabled ? 'Enabled' : 'Disabled' }}
            </span>
          </td>
          <td class="actions">
            <button class="btn btn-sm btn-outline" @click="$router.push('/accounting/recurring/' + r.name)">Edit</button>
            <button class="btn btn-sm btn-outline" @click="runNow(r)" :disabled="!r.enabled">Run Now</button>
            <button class="btn btn-sm btn-danger-outline" @click="doDelete(r)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
    <Modal :visible="deleteTarget" title="Delete" confirmText="Delete" confirmClass="btn-danger" @confirm="confirmDelete" @cancel="deleteTarget = null">
      <p>Delete recurring transaction "{{ deleteTarget?.title }}"?</p>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getList, frappeCall } from '@/api/frappe'
import Modal from '@/components/Modal.vue'

const list = ref([])
const loading = ref(true)
const processing = ref(false)
const deleteTarget = ref(null)

onMounted(load)

async function load() {
  loading.value = true
  try {
    const res = await getList('Recurring Transaction', {}, ['*'], 999)
    list.value = Array.isArray(res) ? res : (res.message?.data || res.message || [])
  } catch { list.value = [] }
  loading.value = false
}

async function toggle(r) {
  try {
    await frappeCall('manager.api.toggle_recurring_transaction', { name: r.name, enabled: r.enabled ? 0 : 1 })
    r.enabled = !r.enabled
  } catch {}
}

async function runNow(r) {
  if (!r.enabled) return
  try {
    const res = await frappeCall('manager.api.run_recurring_transaction', { name: r.name })
    alert('Created: ' + (res.message?.created || 'ok'))
    await load()
  } catch (e) {
    alert(e?.response?.data?.message || e?.message || 'Failed')
  }
}

async function runAllDue() {
  processing.value = true
  try {
    const res = await frappeCall('manager.api.process_due_recurring')
    const m = res.message || {}
    alert(`Processed ${m.total || 0} due transactions`)
    await load()
  } catch (e) {
    alert(e?.response?.data?.message || e?.message || 'Failed')
  }
  processing.value = false
}

function doDelete(r) { deleteTarget.value = r }

async function confirmDelete() {
  if (!deleteTarget.value) return
  try {
    await frappeCall('manager.api.delete_doc', { doctype: 'Recurring Transaction', name: deleteTarget.value.name })
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
.actions { display: flex; gap: 0.35rem; }
.badge { display: inline-block; padding: 0.2rem 0.55rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
.badge-green { background: #dcfce7; color: #16a34a; }
.badge-gray { background: #f1f5f9; color: #94a3b8; }
.btn { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.5rem 1rem; border: none; border-radius: 6px; font-size: 0.85rem; cursor: pointer; }
.btn-primary { background: #2563eb; color: #fff; }
.btn-primary:hover { background: #1d4ed8; }
.btn-outline { background: transparent; color: #475569; border: 1px solid #cbd5e1; }
.btn-outline:hover { background: #f8fafc; }
.btn-danger-outline { background: transparent; color: #dc2626; border: 1px solid #fca5a5; }
.btn-danger-outline:hover { background: #fef2f2; }
.btn-sm { padding: 0.35rem 0.75rem; font-size: 0.8rem; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
