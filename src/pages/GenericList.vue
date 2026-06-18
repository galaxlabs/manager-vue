<template>
  <div class="list-page">
    <div class="page-header">
      <h1>{{ displayTitle }}</h1>
      <div class="header-actions">
        <div class="search-box">
          <input v-model="search" class="input" placeholder="Search..." @input="onSearch" />
        </div>
        <button v-if="auth.can(props.doctype, 'create')" class="btn btn-primary" @click="goNew">+ New {{ displaySingular }}</button>
        <button v-if="selected.size && bulkDeletable && auth.can(props.doctype, 'delete')" class="btn btn-danger-outline btn-sm" @click="confirmBulkDelete">Delete {{ selected.size }} selected</button>
        <button class="btn btn-secondary btn-sm" @click="exportCSV">Export CSV</button>
      </div>
    </div>
    <div class="card">
      <div v-if="loading" class="loading-spinner"><div class="spinner"></div> Loading...</div>
      <DataTable v-if="!loading && rows.length" :columns="displayColumns" :rows="rows" :compact="compact" :deletable="auth.can(props.doctype, 'delete')" :selectable="bulkDeletable" :selected="selected" :totals="totals"
          @row-click="goEdit" @delete="confirmDelete" @select="toggleSelect" @select-all="toggleSelectAll" />
        <div v-if="!loading && !rows.length" class="empty">{{ search ? 'No results found.' : 'No ' + displayTitle.toLowerCase() + '.' }}</div>
    </div>
    <div class="list-footer">
      <div class="page-size-select">
        <select v-model="pageSize" class="input-sm">
          <option :value="10">10</option><option :value="25">25</option><option :value="50">50</option><option :value="100">100</option>
        </select>
        <span class="page-info">{{ total }} records</span>
      </div>
      <Pagination v-model:page="page" :page-size="pageSize" :total="total" />
    </div>
    <Modal :visible="showDeleteModal" title="Delete" confirmText="Delete" confirmClass="btn-danger" @confirm="doDelete" @cancel="showDeleteModal = false">
      <p>Delete this record? This cannot be undone.</p>
    </Modal>
    <Modal :visible="showBulkModal" title="Delete Selected" confirmText="Delete All" confirmClass="btn-danger" @confirm="doBulkDelete" @cancel="showBulkModal = false">
      <p>Delete {{ selected.size }} selected records? This cannot be undone.</p>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import DataTable from '@/components/DataTable.vue'
import Pagination from '@/components/Pagination.vue'
import Modal from '@/components/Modal.vue'
import { getList, frappeCall } from '@/api/frappe'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  doctype: { type: String, required: true },
  title: { type: String, default: '' },
  singular: { type: String, default: '' },
  baseEditPath: { type: String, default: '' },
  compact: { type: Boolean, default: true },
  bulkDeletable: { type: Boolean, default: true },
  totalFields: { type: Array, default: () => [] },
})

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const rows = ref([])
const displayColumns = ref([])
const page = ref(1)
const pageSize = ref(50)
const total = ref(0)
const search = ref('')
const loading = ref(false)
const showDeleteModal = ref(false)
const showBulkModal = ref(false)
const selected = ref(new Set())
let deleteTarget = null
let searchTimer = null

const displayTitle = computed(() => props.title || props.doctype + 's')
const displaySingular = computed(() => props.singular || props.doctype)

const basePath = computed(() => {
  if (props.baseEditPath) return props.baseEditPath
  return route.path.replace(/\/new$/, '')
})

const totals = computed(() => {
  if (!props.totalFields.length) return {}
  const t = {}
  for (const field of props.totalFields) {
    t[field] = rows.value.reduce((s, r) => s + (parseFloat(r[field]) || 0), 0)
  }
  return t
})

onMounted(() => loadMeta())
watch(page, () => loadData())
watch(pageSize, () => { page.value = 1; loadData() })

function onSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => { page.value = 1; loadData() }, 300)
}

async function loadMeta() {
  try {
    const metaRes = await frappeCall('manager.api.get_meta', { doctype: props.doctype })
    const metaFields = (metaRes.message && metaRes.message.fields) || []
    const shown = metaFields.filter(f => ['Table','Section Break','Column Break','Button','HTML','Image','Fold','Page Break','Tab Break','Heading'].indexOf(f.fieldtype) === -1).slice(0, 6)
    displayColumns.value = shown.length ? shown.map(f => {
      const align = ['Currency','Float','Int'].indexOf(f.fieldtype) >= 0 ? 'num-col' : ''
      return { key: f.fieldname, label: f.label, align }
    }) : [{ key: 'name', label: displaySingular.value }]
  } catch {
    displayColumns.value = [{ key: 'name', label: displaySingular.value }]
  }
  await loadData()
}

async function loadData() {
  loading.value = true
  const fieldNames = [...new Set(['name', 'modified', ...displayColumns.value.map(c => c.key)])]
  if (!displayColumns.value.some(c => c.key === 'modified')) {
    displayColumns.value.push({ key: 'modified', label: 'Last Updated', format: 'date' })
  }
  try {
    const res = await getList(props.doctype, {}, fieldNames, pageSize.value, (page.value - 1) * pageSize.value, 'modified desc', search.value)
    const result = Array.isArray(res) ? res : (res.message?.data || res.message || [])
    rows.value = result
    total.value = res.message?.total || result.length
  } catch {
    rows.value = []; total.value = 0
  } finally { loading.value = false }
}

function goNew() { router.push(basePath.value + '/new') }
function goEdit(row) { router.push(basePath.value + '/' + row.name) }

function confirmDelete(row) { deleteTarget = row; showDeleteModal.value = true }
async function doDelete() {
  if (!deleteTarget) return
  showDeleteModal.value = false
  try {
    await frappeCall('manager.api.delete_doc', { doctype: props.doctype, name: deleteTarget.name })
    deleteTarget = null; loadData()
  } catch {}
}

function toggleSelect(name) {
  const s = new Set(selected.value)
  if (s.has(name)) s.delete(name); else s.add(name)
  selected.value = s
}
function toggleSelectAll() {
  if (selected.value.size === rows.value.length) selected.value = new Set()
  else selected.value = new Set(rows.value.map(r => r.name))
}
function confirmBulkDelete() { showBulkModal.value = true }
async function doBulkDelete() {
  showBulkModal.value = false
  for (const name of selected.value) {
    try { await frappeCall('manager.api.delete_doc', { doctype: props.doctype, name }) } catch {}
  }
  selected.value = new Set()
  loadData()
}

function exportCSV() {
  const cols = displayColumns.value
  let csv = cols.map(c => '"' + (c.label || c.key) + '"').join(',') + '\n'
  for (const row of rows.value) {
    csv += cols.map(c => {
      let v = row[c.key]
      if (v == null) return '""'
      if (typeof v === 'number') return String(v)
      return '"' + String(v).replace(/"/g, '""') + '"'
    }).join(',') + '\n'
  }
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = props.doctype + '.csv'
  a.click(); URL.revokeObjectURL(url)
}
</script>

<style scoped>
.page-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 0.75rem; }
.header-actions { display: flex; align-items: center; gap: 0.5rem; }
.search-box .input { padding: 0.4rem 0.6rem; border: 1px solid #d0d0d0; border-radius: 6px; font-size: 0.82rem; width: 200px; }
.card { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
.empty { text-align: center; padding: 2.5rem; color: #94a3b8; font-size: 0.9rem; }
.loading-spinner { display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 2.5rem; color: #94a3b8; font-size: 0.85rem; }
.spinner { width: 18px; height: 18px; border: 2px solid #e2e8f0; border-top-color: #2563eb; border-radius: 50%; animation: spin 0.6s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.list-footer { display: flex; align-items: center; justify-content: space-between; padding: 0.5rem 0.75rem; border-top: 1px solid #e2e8f0; }
.page-size-select { display: flex; align-items: center; gap: 0.4rem; }
.page-size-select .input-sm { padding: 0.3rem; border: 1px solid #d0d0d0; border-radius: 4px; font-size: 0.78rem; }
.page-info { font-size: 0.78rem; color: #94a3b8; }
.btn-sm { padding: 0.3rem 0.65rem; font-size: 0.78rem; }
.btn-danger-outline { background: #fff; color: #dc2626; border: 1px solid #dc2626; border-radius: 5px; cursor: pointer; }
.btn-danger-outline:hover { background: #fef2f2; }
</style>
