<template>
  <div class="page">
    <div class="page-header">
      <h1>Import Data</h1>
    </div>
    <div class="card">
      <div class="card-body">
        <div class="field">
          <label>Document Type</label>
          <select v-model="doctype" class="input">
            <option value="">-- Select --</option>
            <option value="Account">Accounts</option>
            <option value="Customer">Customers</option>
            <option value="Supplier">Suppliers</option>
            <option value="Item">Items</option>
            <option value="Employee">Employees</option>
            <option value="Project">Projects</option>
          </select>
        </div>
        <div class="field">
          <label>CSV Data</label>
          <textarea v-model="csvText" class="input textarea" rows="8" placeholder="Paste CSV data here&#10;First row must be column headers"></textarea>
        </div>
        <div v-if="sampleHeaders.length" class="sample-headers">
          <strong>Detected columns:</strong>
          <span v-for="h in sampleHeaders" :key="h" class="tag">{{ h }}</span>
        </div>
        <div class="actions">
          <button class="btn btn-primary" @click="doImport" :disabled="importing || !doctype || !csvText">{{ importing ? 'Importing...' : 'Import' }}</button>
        </div>
        <div v-if="result" class="result">
          <p v-if="result.created > 0" class="success">{{ result.created }} records imported</p>
          <p v-if="result.errors?.length" class="error">{{ result.errors.length }} errors</p>
          <div v-if="result.errors?.length" class="error-list">
            <div v-for="(e, i) in result.errors.slice(0, 10)" :key="i" class="error-item">{{ e.error }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { frappeCall } from '@/api/frappe'

const doctype = ref('')
const csvText = ref('')
const importing = ref(false)
const result = ref(null)

const sampleHeaders = computed(() => {
  const lines = csvText.value.trim().split('\n')
  return lines.length ? lines[0].split(',').map(s => s.trim()) : []
})

async function doImport() {
  const lines = csvText.value.trim().split('\n')
  if (lines.length < 2) { alert('CSV must have a header row and at least one data row'); return }
  const headers = lines[0].split(',').map(s => s.trim())
  const data = []
  for (let i = 1; i < lines.length; i++) {
    const vals = lines[i].split(',').map(s => s.trim())
    const row = {}
    headers.forEach((h, idx) => { row[h] = vals[idx] || '' })
    data.push(row)
  }
  importing.value = true
  result.value = null
  try {
    const res = await frappeCall('manager.api.import_csv', { doctype: doctype.value, data: JSON.stringify(data) })
    result.value = res.message || {}
  } catch (e) {
    result.value = { created: 0, errors: [{ error: e?.response?.data?.message || e.message }] }
  }
  importing.value = false
}
</script>

<style scoped>
.page { padding: 1.5rem 2rem; }
.page-header { margin-bottom: 1.25rem; }
.page-header h1 { font-size: 1.3rem; margin: 0; color: #1e293b; }
.card { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; max-width: 600px; }
.card-body { padding: 1.25rem; }
.field { margin-bottom: 1rem; }
.field label { display: block; font-size: 0.85rem; font-weight: 500; color: #475569; margin-bottom: 0.25rem; }
.input { padding: 0.5rem 0.75rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.85rem; width: 100%; box-sizing: border-box; }
.input:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
.textarea { font-family: monospace; }
.sample-headers { display: flex; align-items: center; gap: 0.35rem; flex-wrap: wrap; margin-bottom: 0.75rem; font-size: 0.82rem; }
.tag { background: #f1f5f9; padding: 0.15rem 0.4rem; border-radius: 4px; font-size: 0.78rem; color: #475569; }
.actions { margin-bottom: 0.75rem; }
.result { border-top: 1px solid #e2e8f0; padding-top: 0.75rem; }
.success { color: #16a34a; font-weight: 600; }
.error { color: #dc2626; }
.error-list { margin-top: 0.5rem; }
.error-item { background: #fef2f2; padding: 0.35rem 0.6rem; border-radius: 4px; font-size: 0.8rem; margin-bottom: 0.25rem; color: #dc2626; }
.btn { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.5rem 1rem; border: none; border-radius: 6px; font-size: 0.85rem; cursor: pointer; }
.btn-primary { background: #2563eb; color: #fff; }
.btn-primary:hover { background: #1d4ed8; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
