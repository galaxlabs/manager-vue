<template>
  <div class="price-lists-page">
    <div class="page-header">
      <h1>Price Lists</h1>
      <button class="btn btn-primary" @click="showForm(null)">New Price List</button>
    </div>

    <div v-if="loading" class="loading">Loading...</div>
    <table v-else class="data-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Currency</th>
          <th>Active</th>
          <th>Default</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="pl in priceLists" :key="pl.name">
          <td>{{ pl.price_list_name }}</td>
          <td>{{ pl.currency || '-' }}</td>
          <td><span class="badge" :class="pl.is_active ? 'badge-green' : 'badge-gray'">{{ pl.is_active ? 'Yes' : 'No' }}</span></td>
          <td><span class="badge" :class="pl.is_default ? 'badge-blue' : 'badge-gray'">{{ pl.is_default ? 'Yes' : 'No' }}</span></td>
          <td class="actions">
            <button class="btn btn-sm btn-outline" @click="showForm(pl)">Edit</button>
            <button class="btn btn-sm btn-outline" @click="manageItems(pl)">Items</button>
            <button class="btn btn-sm btn-danger-outline" @click="doDelete(pl)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>

    <Modal v-if="formVisible" @close="formVisible = false">
      <template #title>{{ editing ? 'Edit Price List' : 'New Price List' }}</template>
      <template #body>
        <div class="field">
          <label>Name</label>
          <input v-model="form.name" class="input" :disabled="!!editing" />
        </div>
        <div class="field">
          <label>Currency</label>
          <input v-model="form.currency" class="input" placeholder="e.g. USD" />
        </div>
        <div class="field-row">
          <label class="checkbox-label">
            <input type="checkbox" v-model="form.is_active" /> Active
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="form.is_default" /> Default
          </label>
        </div>
      </template>
      <template #footer>
        <button class="btn btn-outline" @click="formVisible = false">Cancel</button>
        <button class="btn btn-primary" @click="saveForm" :disabled="saving">{{ saving ? 'Saving...' : 'Save' }}</button>
      </template>
    </Modal>

    <Modal v-if="itemsVisible" @close="itemsVisible = false" wide>
      <template #title>Items in {{ currentPL?.price_list_name }}</template>
      <template #body>
        <div class="item-list-controls">
          <select v-model="newItem.item" class="input item-select">
            <option value="">-- Select Item --</option>
            <option v-for="it in allItems" :key="it.name" :value="it.name">{{ it.item_name || it.name }}</option>
          </select>
          <input v-model="newItem.rate" type="number" class="input item-rate" placeholder="Rate" />
          <input v-model="newItem.effective_from" type="date" class="input item-date" placeholder="From" />
          <input v-model="newItem.effective_to" type="date" class="input item-date" placeholder="To" />
          <button class="btn btn-primary btn-sm" @click="addItem">Add</button>
        </div>
        <table class="data-table" v-if="items.length">
          <thead>
            <tr>
              <th>Item</th>
              <th>Rate</th>
              <th>From</th>
              <th>To</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(it, i) in items" :key="i">
              <td>{{ it.item_name || it.item }}</td>
              <td>{{ it.rate }}</td>
              <td>{{ it.effective_from }}</td>
              <td>{{ it.effective_to }}</td>
              <td><button class="btn btn-sm btn-danger-outline" @click="removeItem(i)">Remove</button></td>
            </tr>
          </tbody>
        </table>
        <div v-else class="empty">No items in this price list yet.</div>
      </template>
      <template #footer>
        <button class="btn btn-outline" @click="itemsVisible = false">Close</button>
        <button class="btn btn-primary" @click="saveItems" :disabled="savingItems">{{ savingItems ? 'Saving...' : 'Save Items' }}</button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { listPriceLists, savePriceList, deletePriceList, getItems, getPriceListItems } from '@/api/frappe'
import Modal from '@/components/Modal.vue'
import { toast } from '@/utils/toast'

const priceLists = ref([])
const loading = ref(true)

const formVisible = ref(false)
const editing = ref(null)
const saving = ref(false)
const form = ref({ name: '', currency: '', is_active: 1, is_default: 0 })

const itemsVisible = ref(false)
const currentPL = ref(null)
const items = ref([])
const savingItems = ref(false)
const newItem = ref({ item: '', rate: '', effective_from: '', effective_to: '' })
const allItems = ref([])

onMounted(async () => {
  await load()
  try {
    const res = await getItems()
    allItems.value = res.message?.data || []
  } catch {}
})

async function load() {
  loading.value = true
  try {
    const res = await listPriceLists()
    priceLists.value = res.message || []
  } catch { priceLists.value = [] }
  loading.value = false
}

function showForm(pl) {
  editing.value = pl
  form.value = pl ? { name: pl.price_list_name, currency: pl.currency || '', is_active: pl.is_active ?? 1, is_default: pl.is_default ?? 0 } : { name: '', currency: '', is_active: 1, is_default: 0 }
  formVisible.value = true
}

async function saveForm() {
  saving.value = true
  try {
    await savePriceList({
      name: editing.value ? editing.value.name : null,
      price_list_name: form.value.name,
      currency: form.value.currency,
      is_active: form.value.is_active ? 1 : 0,
      is_default: form.value.is_default ? 1 : 0,
    })
    formVisible.value = false
    await load()
  } catch (e) {
    toast.error(e?.response?.data?.message || e?.message || "Save failed")
  }
  saving.value = false
}

async function doDelete(pl) {
  if (!confirm(`Delete price list "${pl.price_list_name}"?`)) return
  try {
    await deletePriceList(pl.name)
    await load()
  } catch (e) {
    toast.error(e?.response?.data?.message || e?.message || "Delete failed")
  }
}

async function manageItems(pl) {
  currentPL.value = pl
  items.value = []
  itemsVisible.value = true
  try {
    const res = await getPriceListItems(pl.name)
    items.value = res.message?.items || []
  } catch {}
}

function addItem() {
  if (!newItem.value.item || !newItem.value.rate) return
  items.value.push({ ...newItem.value })
  newItem.value = { item: '', rate: '', effective_from: '', effective_to: '' }
}

function removeItem(idx) {
  items.value.splice(idx, 1)
}

async function saveItems() {
  savingItems.value = true
  try {
    await savePriceList({
      name: currentPL.value.name,
      price_list_name: currentPL.value.price_list_name,
      items: items.value.map(it => ({
        item: it.item,
        rate: parseFloat(it.rate),
        effective_from: it.effective_from || null,
        effective_to: it.effective_to || null,
      })),
    })
    itemsVisible.value = false
  } catch (e) {
    toast.error(e?.response?.data?.message || e?.message || "Save failed")
  }
  savingItems.value = false
}
</script>

<style scoped>
.price-lists-page { padding: 1.5rem 2rem; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; }
.page-header h1 { font-size: 1.3rem; margin: 0; color: #1e293b; }
.loading { color: #64748b; font-size: 0.9rem; padding: 2rem 0; }
.data-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.data-table th, .data-table td { padding: 0.5rem 0.75rem; text-align: left; border-bottom: 1px solid #f1f5f9; }
.data-table th { font-weight: 600; color: #475569; background: #f8fafc; }
.data-table td { color: #334155; }
.actions { display: flex; gap: 0.35rem; }
.badge { display: inline-block; padding: 0.15rem 0.45rem; border-radius: 4px; font-size: 0.7rem; font-weight: 600; }
.badge-green { background: #dcfce7; color: #16a34a; }
.badge-blue { background: #dbeafe; color: #1d4ed8; }
.badge-gray { background: #f1f5f9; color: #94a3b8; }
.field { margin-bottom: 0.75rem; }
.field label { display: block; font-size: 0.85rem; font-weight: 500; color: #475569; margin-bottom: 0.25rem; }
.field-row { display: flex; gap: 1.5rem; margin-bottom: 0.75rem; }
.checkbox-label { display: flex; align-items: center; gap: 0.4rem; font-size: 0.85rem; color: #475569; cursor: pointer; }
.input { padding: 0.5rem 0.75rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.85rem; width: 100%; box-sizing: border-box; }
.input:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
.item-list-controls { display: flex; gap: 0.5rem; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; }
.item-select { flex: 2; min-width: 150px; }
.item-rate { width: 100px; }
.item-date { width: 130px; }
.btn { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.5rem 1rem; border: none; border-radius: 6px; font-size: 0.85rem; cursor: pointer; }
.btn-primary { background: #2563eb; color: #fff; }
.btn-primary:hover { background: #1d4ed8; }
.btn-outline { background: transparent; color: #475569; border: 1px solid #cbd5e1; }
.btn-outline:hover { background: #f8fafc; }
.btn-danger-outline { background: transparent; color: #dc2626; border: 1px solid #fca5a5; }
.btn-danger-outline:hover { background: #fef2f2; }
.btn-sm { padding: 0.35rem 0.75rem; font-size: 0.8rem; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.empty { color: #94a3b8; font-size: 0.9rem; padding: 1rem 0; }
</style>

