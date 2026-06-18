<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="2" y="2" width="20" height="20" rx="4" />
          <path d="M8 8h8M8 12h8M8 16h5" />
        </svg>
        <h1>Manager</h1>
        <p class="subtitle">Sign in to your account</p>
      </div>
      <form @submit.prevent="login" class="login-form">
        <div v-if="error" class="error-msg">{{ error }}</div>
        <div class="field">
          <label>Username</label>
          <input v-model="username" type="text" class="input" placeholder="administrator" autocomplete="username" required />
        </div>
        <div class="field">
          <label>Password</label>
          <input v-model="password" type="password" class="input" placeholder="Enter password" autocomplete="current-password" required />
        </div>
        <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()
const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function login() {
  loading.value = true
  error.value = ''
  try {
    await auth.login(username.value, password.value)
    router.push('/')
  } catch (e) {
    error.value = e?.response?.data?.message || e?.message || 'Login failed. Check credentials.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  display: flex; align-items: center; justify-content: center;
  min-height: 100vh; background: #f1f5f9;
}
.login-card {
  background: #fff; border-radius: 12px; padding: 2.5rem;
  width: 100%; max-width: 400px; box-shadow: 0 4px 24px rgba(0,0,0,0.08);
}
.login-header { text-align: center; margin-bottom: 2rem; }
.login-header h1 { margin: 0.5rem 0 0; font-size: 1.5rem; color: #1e293b; }
.subtitle { color: #64748b; font-size: 0.9rem; margin: 0.25rem 0 0; }
.login-form { display: flex; flex-direction: column; gap: 1.25rem; }
.field { display: flex; flex-direction: column; gap: 0.35rem; }
.field label { font-size: 0.85rem; font-weight: 500; color: #475569; }
.input { padding: 0.65rem 0.75rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.95rem; }
.input:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
.error-msg { background: #fef2f2; color: #dc2626; padding: 0.6rem 0.8rem; border-radius: 6px; font-size: 0.85rem; }
.btn-block { width: 100%; text-align: center; padding: 0.65rem; font-size: 0.95rem; }
.btn:disabled { opacity: 0.6; }
</style>
