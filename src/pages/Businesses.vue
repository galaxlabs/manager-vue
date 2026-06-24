<template>
  <div class="page">
    <div class="page-header">
      <h1>Businesses</h1>
      <button class="btn btn-primary" @click="showForm = true">+ Add Business</button>
    </div>
    <div class="table-wrap" v-if="businesses.length">
      <table class="table">
        <thead>
          <tr><th>Name</th><th>Currency</th><th>Tax ID</th><th>Phone</th><th>Email</th><th>Active</th><th></th></tr>
        </thead>
        <tbody>
          <tr v-for="b in businesses" :key="b.name">
            <td>{{ b.business_name }}</td>
            <td>{{ b.currency }}</td>
            <td>{{ b.tax_id || '-' }}</td>
            <td>{{ b.phone || '-' }}</td>
            <td>{{ b.email || '-' }}</td>
            <td>{{ b.is_active ? 'Yes' : 'No' }}</td>
            <td><button class="btn btn-sm" @click="editBiz(b)">Edit</button></td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="empty">No businesses found. Add your first business above.</div>

    <div class="modal-overlay" v-if="showForm" @click.self="showForm = false">
      <div class="modal">
        <h2>{{ editing ? 'Edit Business' : 'Add Business' }}</h2>
        <div class="form-group">
          <label>Business Name</label>
          <input v-model="form.business_name" class="input" placeholder="e.g. DADA Group" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Currency</label>
            <select v-model="form.currency" class="input">
              <option v-for="c in currencies" :key="c" :value="c">{{ c }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Tax ID</label>
            <input v-model="form.tax_id" class="input" placeholder="NTN / VAT" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Phone</label>
            <input v-model="form.phone" class="input" />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input v-model="form.email" class="input" type="email" />
          </div>
        </div>
        <div class="form-group">
          <label>Address</label>
          <textarea v-model="form.address" class="input" rows="2"></textarea>
        </div>
        <div class="form-group">
          <label class="toggle-row">
            <input type="checkbox" v-model="form.is_active" :true-value="1" :false-value="0" />
            <span>Active</span>
          </label>
        </div>
        <div class="modal-actions">
          <button class="btn btn-primary" @click="saveBiz" :disabled="saving">{{ saving ? 'Saving...' : 'Save' }}</button>
          <button class="btn" @click="showForm = false">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { frappeCall } from '@/api/frappe'
import { toast } from '@/utils/toast'

const businesses = ref([])
const showForm = ref(false)
const editing = ref(null)
const saving = ref(false)
const form = reactive({ business_name: '', currency: 'USD', tax_id: '', phone: '', email: '', address: '', is_active: 1 })
const currencies = ['USD', 'EUR', 'GBP', 'PKR', 'INR', 'AED']

async function load() {
  try {
    const res = await frappeCall('frappe.client.get_list', { doctype: 'Business', fields: ['name', 'business_name', 'currency', 'tax_id', 'phone', 'email', 'is_active'], limit_page_length: 100 })
    businesses.value = res.message || []
  } catch { businesses.value = [] }
}

function editBiz(b) {
  editing.value = b.name
  Object.assign(form, { business_name: b.business_name, currency: b.currency, tax_id: b.tax_id || '', phone: b.phone || '', email: b.email || '', address: '', is_active: b.is_active ?? 1 })
  showForm.value = true
}

async function saveBiz() {
  if (!form.business_name) { toast.warning('Business name is required'); return }
  saving.value = true
  try {
    if (editing.value) {
      await frappeCall('frappe.client.set_value', { doctype: 'Business', name: editing.value, fieldname: { ...form } })
    } else {
      await frappeCall('frappe.client.insert', { doc: { doctype: 'Business', ...form } })
    }
    showForm.value = false
    editing.value = null
    Object.assign(form, { business_name: '', currency: 'USD', tax_id: '', phone: '', email: '', address: '', is_active: 1 })
    await load()
  } catch (e) {
    toast.error('Failed: ' + (e.response?.data?.message || e.message))
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.form-row { display: flex; gap: 1rem; }
.form-row .form-group { flex: 1; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; font-weight: 600; margin-bottom: 0.25rem; font-size: 13px; color: #555; }
.form-group .input { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #d0d0d0; border-radius: 6px; font-size: 14px; box-sizing: border-box; }
.toggle-row { display: flex; align-items: center; gap: 0.5rem; font-size: 14px; cursor: pointer; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: #fff; border-radius: 12px; padding: 1.5rem; width: 480px; max-width: 90vw; max-height: 80vh; overflow-y: auto; }
.modal h2 { margin-bottom: 1rem; }
.modal-actions { display: flex; gap: 0.5rem; margin-top: 1rem; }
.empty { text-align: center; padding: 3rem; color: #888; }
</style>
