<template>
  <Teleport to="body">
    <div class="toast-container">
      <div v-for="t in toasts" :key="t.id" class="toast" :class="'toast-' + t.type" @click="remove(t.id)">
        <span class="toast-msg">{{ t.message }}</span>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'

const toasts = ref([])
let nextId = 0

function show(message, type = 'info', duration = 3000) {
  const id = ++nextId
  toasts.value.push({ id, message, type })
  setTimeout(() => remove(id), duration)
}

function remove(id) {
  toasts.value = toasts.value.filter(t => t.id !== id)
}

defineExpose({ show })
</script>

<style scoped>
.toast-container { position: fixed; top: 1rem; right: 1rem; z-index: 99999; display: flex; flex-direction: column; gap: 0.5rem; }
.toast { padding: 0.65rem 1rem; border-radius: 8px; font-size: 0.85rem; color: #fff; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.15); max-width: 350px; animation: slideIn 0.2s ease; }
.toast-info { background: #2563eb; }
.toast-success { background: #16a34a; }
.toast-error { background: #dc2626; }
.toast-warning { background: #f59e0b; }
@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
</style>
