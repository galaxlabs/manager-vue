<template>
  <div class="list-page">
    <div class="page-header">
      <h1>{{ title }}</h1>
      <div class="header-actions">
        <div class="search-box">
          <input v-model="search" class="input" placeholder="Search..." @input="onSearch" />
        </div>
        <button class="btn btn-primary" @click="$emit('create')">+ New {{ singular }}</button>
      </div>
    </div>

    <div class="card">
      <DataTable :columns="columns" :rows="filteredRows" @row-click="(r) => $emit('row-click', r)" />
      <div v-if="!filteredRows.length" class="empty-state">{{ search ? 'No results.' : 'No ' + title.toLowerCase() + '.' }}</div>
    </div>

      <Pagination v-if="total > pageSize" :page="page" :total="total" @update:page="$emit('page-change', $event)" />

    <Modal :visible="showDeleteModal" :title="'Delete ' + singular" confirmText="Delete" confirmClass="btn-danger" @confirm="doDelete" @cancel="showDeleteModal = false">
      <p>Delete this {{ singular }}? This cannot be undone.</p>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import DataTable from '@/components/DataTable.vue'
import Pagination from '@/components/Pagination.vue'
import Modal from '@/components/Modal.vue'

const props = defineProps({
  title: String, singular: String, columns: Array, rows: { type: Array, default: () => [] },
  total: { type: Number, default: 0 }, page: { type: Number, default: 1 }, pageSize: { type: Number, default: 50 },
})

const emit = defineEmits(['create', 'row-click', 'page-change', 'delete', 'search'])

const search = ref('')
const showDeleteModal = ref(false)
let deleteTarget = null
let searchTimer = null

const filteredRows = computed(() => {
  if (!search.value) return props.rows
  const q = search.value.toLowerCase()
  return props.rows.filter((r) =>
    Object.values(r).some((v) => v != null && String(v).toLowerCase().includes(q))
  )
})

function onSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => emit('search', search.value), 300)
}

function doDelete() {
  showDeleteModal.value = false
  emit('delete', deleteTarget)
}
</script>

<style scoped>
.page-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1rem; }
.header-actions { display: flex; align-items: center; gap: 0.75rem; }
.search-box .input { padding: 0.45rem 0.65rem; border: 1px solid #d0d0d0; border-radius: 6px; font-size: 0.85rem; width: 220px; }
.card { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
.empty-state { text-align: center; padding: 2rem; color: #94a3b8; font-size: 0.9rem; }
</style>
