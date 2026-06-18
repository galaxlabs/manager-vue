<template>
  <div v-if="total > pageSize" class="pagination">
    <button class="page-btn" :disabled="page <= 1" @click="go(page - 1)">&laquo;</button>
    <button v-for="p in pages" :key="p" class="page-btn" :class="{ active: p === page }" @click="go(p)">{{ p }}</button>
    <button class="page-btn" :disabled="page >= totalPages" @click="go(page + 1)">&raquo;</button>
    <span class="page-info">{{ total }} records</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  page: { type: Number, default: 1 },
  pageSize: { type: Number, default: 50 },
  total: { type: Number, default: 0 },
})
const emit = defineEmits(['update:page'])

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))

const pages = computed(() => {
  const tp = totalPages.value
  const cur = props.page
  if (tp <= 7) return Array.from({ length: tp }, (_, i) => i + 1)
  if (cur <= 3) return [1, 2, 3, 4, '...', tp]
  if (cur >= tp - 2) return [1, '...', tp - 3, tp - 2, tp - 1, tp]
  return [1, '...', cur - 1, cur, cur + 1, '...', tp]
})

function go(p) { if (p >= 1 && p <= totalPages.value && p !== props.page) emit('update:page', p) }
</script>

<style scoped>
.pagination { display: flex; align-items: center; gap: 0.25rem; padding: 0.75rem 0; justify-content: center; }
.page-btn { background: #fff; border: 1px solid #e2e8f0; color: #475569; padding: 0.35rem 0.65rem; border-radius: 5px; cursor: pointer; font-size: 0.8rem; }
.page-btn.active { background: #2563eb; color: #fff; border-color: #2563eb; }
.page-btn:disabled { opacity: 0.4; cursor: default; }
.page-info { margin-left: 0.75rem; font-size: 0.8rem; color: #94a3b8; }
</style>
