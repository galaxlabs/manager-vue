<template>
  <div class="page">
    <div class="page-header">
      <h1>Payment Terms</h1>
      <button class="btn btn-primary" @click="showForm(null)">New Payment Term</button>
    </div>
    <div v-if="loading" class="loading">Loading...</div>
    <table v-else class="data-table">
      <thead>
        <tr>
          <th>Term Name</th>
          <th>Due Days</th>
          <th>Discount %</th>
          <th>Discount Days</th>
          <th>Default</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="pt in terms" :key="pt.name">
          <td>{{ pt.term_name }}</td>
          <td>{{ pt.due_days }}</td>
          <td>{{ pt.discount_percentage || 0 }}%</td>
          <td>{{ pt.discount_days || 0 }}</td>
          <td><span class="badge" :class="pt.is_default ? 'badge-blue' : 'badge-gray'">{{ pt.is_default ? 'Yes' : 'No' }}</span></td>
          <td class="actions">
            <button class="btn btn-sm btn-outline" @click="showForm(pt)">Edit</button>
            <button class="btn btn-sm btn-danger-outline" @click="doDelete(pt)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>

    <Modal v-if="formVisible" @close="formVisible = false">
      <template #title>{{ editing ? 'Edit Payment Term' : 'New Payment Term' }}</template>
      <template #body>
        <div class="field">
          <label>Term Name</label>
          <input v-model="form.term_name" class="input" placeholder="e.g. Net 30" />
        </div>
        <div class="field-row">
          <div class="field half">
            <label>Due Days</label>
            <input v-model.number="form.due_days" type="number" class="input" />
          </div>
          <div class="field half">
            <label>Discount Days</label>
            <input v-model.number="form.discount_days" type="number" class="input" />
          </div>
        </div>
        <div class="field-row">
          <div class="field half">
            <label>Discount %</label>
            <input v-model.number="form.discount_percentage" type="number" class="input" step="0.01" />
          </div>
          <div class="field half" style="padding-top:1.5rem">
            <label class="checkbox-label">
              <input type="checkbox" v-model="form.is_default" /> Set as default
            </label>
          </div>
        </div>
      </template>
      <template #footer>
        <button class="btn btn-outline" @click="formVisible = false">Cancel</button>
        <button class="btn btn-primary" @click="saveForm" :disabled="saving">{{ saving ? 'Saving...' : 'Save' }}</button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { frappeCall } from '@/api/frappe'
import Modal from '@/components/Modal.vue'

const terms = ref([])
const loading = ref(true)
const formVisible = ref(false)
const editing = ref(null)
const saving = ref(false)
const form = ref({ term_name: '', due_days: 30, discount_percentage: 0, discount_days: 0, is_default: false })

onMounted(load)

async function load() {
  loading.value = true
  try {
    const res = await frappeCall('manager.api.list_payment_terms')
    terms.value = res.message?.data || []
  } catch { terms.value = [] }
  loading.value = false
}

function showForm(pt) {
  editing.value = pt
  form.value = pt
    ? { term_name: pt.term_name, due_days: pt.due_days || 30, discount_percentage: pt.discount_percentage || 0, discount_days: pt.discount_days || 0, is_default: !!pt.is_default }
    : { term_name: '', due_days: 30, discount_percentage: 0, discount_days: 0, is_default: false }
  formVisible.value = true
}

async function saveForm() {
  saving.value = true
  try {
    await frappeCall('manager.api.save_payment_term', { data: JSON.stringify({
      name: editing.value?.name || null,
      term_name: form.value.term_name,
      due_days: form.value.due_days,
      discount_percentage: form.value.discount_percentage,
      discount_days: form.value.discount_days,
      is_default: form.value.is_default ? 1 : 0,
    })})
    formVisible.value = false
    await load()
  } catch (e) {
    alert(e?.response?.data?.message || e?.message || 'Save failed')
  }
  saving.value = false
}

async function doDelete(pt) {
  if (!confirm(`Delete payment term "${pt.term_name}"?`)) return
  try {
    await frappeCall('manager.api.delete_payment_term', { name: pt.name })
    await load()
  } catch (e) {
    alert(e?.response?.data?.message || e?.message || 'Delete failed')
  }
}
</script>

<style scoped>
.page { padding: 1.5rem 2rem; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; }
.page-header h1 { font-size: 1.3rem; margin: 0; color: #1e293b; }
.loading { color: #64748b; font-size: 0.9rem; padding: 2rem 0; }
.data-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.data-table th, .data-table td { padding: 0.5rem 0.75rem; text-align: left; border-bottom: 1px solid #f1f5f9; }
.data-table th { font-weight: 600; color: #475569; background: #f8fafc; }
.data-table td { color: #334155; }
.actions { display: flex; gap: 0.35rem; }
.field { margin-bottom: 0.75rem; }
.field label { display: block; font-size: 0.85rem; font-weight: 500; color: #475569; margin-bottom: 0.25rem; }
.field-row { display: flex; gap: 1rem; }
.field.half { flex: 1; }
.checkbox-label { display: flex; align-items: center; gap: 0.4rem; font-size: 0.85rem; color: #475569; cursor: pointer; }
.input { padding: 0.5rem 0.75rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.85rem; width: 100%; box-sizing: border-box; }
.input:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
.badge { display: inline-block; padding: 0.15rem 0.45rem; border-radius: 4px; font-size: 0.7rem; font-weight: 600; }
.badge-blue { background: #dbeafe; color: #1d4ed8; }
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
