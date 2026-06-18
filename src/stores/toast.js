import { defineStore } from 'pinia'

export const useToastStore = defineStore('toast', {
  state: () => ({
    toasts: [],
    nextId: 0,
  }),
  actions: {
    show(message, type = 'info', duration = 3000) {
      const id = ++this.nextId
      this.toasts.push({ id, message, type })
      setTimeout(() => this.remove(id), duration)
    },
    success(msg) { this.show(msg, 'success') },
    error(msg) { this.show(msg, 'error', 5000) },
    info(msg) { this.show(msg, 'info') },
    warning(msg) { this.show(msg, 'warning', 4000) },
    remove(id) {
      this.toasts = this.toasts.filter(t => t.id !== id)
    },
  },
})
