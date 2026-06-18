<template>
  <div class="page">
    <div class="page-header">
      <h1>Stock Balance</h1>
    </div>
    <div v-if="loading" class="loading">Loading...</div>
    <table v-else-if="items.length" class="data-table">
      <thead>
        <tr>
          <th>Item</th>
          <th>Type</th>
          <th class="num">Quantity</th>
          <th class="num">Value</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="it in items" :key="it.name">
          <td>{{ it.item_name }}</td>
          <td>{{ it.item_type || '-' }}</td>
          <td class="num">{{ it.quantity }}</td>
          <td class="num">{{ fmt(it.value) }}</td>
        </tr>
      </tbody>
    </table>
    <div v-else class="empty">No items found.</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { frappeCall } from '@/api/frappe'

const items = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await frappeCall('manager.api.get_stock_balance')
    items.value = res.message?.data || []
  } catch { items.value = [] }
  loading.value = false
})

function fmt(v) {
  if (v == null) return '-'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v)
}
</script>

<style scoped>
.page { padding: 1.5rem 2rem; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; }
.page-header h1 { font-size: 1.3rem; margin: 0; color: #1e293b; }
.loading, .empty { color: #64748b; font-size: 0.9rem; padding: 2rem 0; }
.data-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.data-table th, .data-table td { padding: 0.5rem 0.75rem; text-align: left; border-bottom: 1px solid #f1f5f9; }
.data-table th { font-weight: 600; color: #475569; background: #f8fafc; }
.data-table td { color: #334155; }
.num { text-align: right; }
</style>
