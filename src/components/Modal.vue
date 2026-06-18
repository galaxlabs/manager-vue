<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" @click.self="onCancel">
      <div class="modal-card" :class="{ wide }">
        <div class="modal-header">
          <h3><slot name="title">{{ title }}</slot></h3>
          <button class="modal-close" @click="onCancel">&times;</button>
        </div>
        <div class="modal-body">
          <slot name="body"><slot /></slot>
        </div>
        <div v-if="$slots.footer" class="modal-footer">
          <slot name="footer" />
        </div>
        <div v-else class="modal-footer">
          <button class="btn btn-secondary" @click="onCancel">{{ cancelText }}</button>
          <button v-if="!hideConfirm" class="btn" :class="confirmClass" @click="onConfirm" :disabled="loading">
            {{ loading ? loadingText : confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  visible: Boolean,
  title: { type: String, default: 'Confirm' },
  confirmText: { type: String, default: 'OK' },
  cancelText: { type: String, default: 'Cancel' },
  loadingText: { type: String, default: 'Processing...' },
  loading: Boolean,
  hideConfirm: Boolean,
  confirmClass: { type: String, default: 'btn-primary' },
  wide: Boolean,
})
const emit = defineEmits(['confirm', 'cancel'])
function onConfirm() { emit('confirm') }
function onCancel() { emit('cancel') }
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0,0,0,0.4); display: flex;
  align-items: center; justify-content: center;
}
.modal-card {
  background: #fff; border-radius: 12px;
  width: 100%; max-width: 480px; box-shadow: 0 8px 32px rgba(0,0,0,0.15);
}
.modal-card.wide { max-width: 720px; }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.25rem; border-bottom: 1px solid #e2e8f0; }
.modal-header h3 { margin: 0; font-size: 1rem; }
.modal-close { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #94a3b8; padding: 0; line-height: 1; }
.modal-body { padding: 1.25rem; }
.modal-footer { display: flex; justify-content: flex-end; gap: 0.5rem; padding: 1rem 1.25rem; border-top: 1px solid #e2e8f0; }
.btn { padding: 0.5rem 1rem; border-radius: 6px; font-size: 0.85rem; cursor: pointer; border: none; }
.btn-primary { background: #2563eb; color: #fff; }
.btn-danger { background: #dc2626; color: #fff; }
.btn-secondary { background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }
.btn:disabled { opacity: 0.6; }
</style>
