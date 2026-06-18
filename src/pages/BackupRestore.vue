<template>
  <div class="backup-page">
    <h1>Backup, Restore &amp; Change Password</h1>

    <div class="backup-section">
      <h2>Backup Database</h2>
      <p>Download a backup of all data and files for this site.</p>
      <button class="btn btn-primary" @click="doBackup" :disabled="backingUp">
        {{ backingUp ? 'Creating Backup...' : 'Create Backup Now' }}
      </button>
      <p v-if="backupResult" class="success-msg">{{ backupResult }}</p>
    </div>

    <div class="backup-section">
      <h2>Existing Backups</h2>
      <div v-if="loading" class="loading">Loading backups...</div>
      <table v-else-if="backups.length" class="data-table">
        <thead>
          <tr>
            <th>Filename</th>
            <th>Size</th>
            <th>Date</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="b in backups" :key="b.filename">
            <td>
              <span v-if="b.is_db" class="badge badge-blue">DB</span>
              <span v-if="b.is_files" class="badge badge-green">Files</span>
              <span v-if="b.is_config" class="badge badge-orange">Config</span>
              {{ b.filename }}
            </td>
            <td>{{ b.size_display }}</td>
            <td>{{ b.modified }}</td>
            <td>
              <button @click="doDownload(b.filename)" class="btn btn-sm btn-primary">Download</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="empty">No backups found.</div>
    </div>

    <div class="backup-section">
      <h2>Change Password</h2>
      <form @submit.prevent="doChangePassword" class="password-form">
        <div v-if="pwError" class="error-msg">{{ pwError }}</div>
        <div v-if="pwSuccess" class="success-msg">{{ pwSuccess }}</div>
        <div class="field">
          <label>Current Password</label>
          <input v-model="oldPassword" type="password" class="input" required />
        </div>
        <div class="field">
          <label>New Password</label>
          <input v-model="newPassword" type="password" class="input" required minlength="6" />
        </div>
        <div class="field">
          <label>Confirm New Password</label>
          <input v-model="confirmPassword" type="password" class="input" required minlength="6" />
        </div>
        <button type="submit" class="btn btn-primary" :disabled="pwChanging">
          {{ pwChanging ? 'Changing...' : 'Change Password' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { listBackups, createBackup, downloadBackup, changePassword } from '@/api/frappe'

const backups = ref([])
const loading = ref(true)
const backingUp = ref(false)
const backupResult = ref('')

const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const pwChanging = ref(false)
const pwError = ref('')
const pwSuccess = ref('')

onMounted(async () => {
  await loadBackups()
})

async function loadBackups() {
  loading.value = true
  try {
    const res = await listBackups()
    backups.value = res.message?.backups || []
  } catch { backups.value = [] }
  loading.value = false
}

async function doBackup() {
  backingUp.value = true
  backupResult.value = ''
  try {
    const res = await createBackup()
    const msg = res.message
    const count = msg?.files?.length || 0
    backupResult.value = `Backup created successfully! ${count} file(s) saved.`
    await loadBackups()
  } catch (e) {
    backupResult.value = ''
    pwError.value = e?.response?.data?.message || e?.message || 'Backup failed'
  }
  backingUp.value = false
}

async function doDownload(filename) {
  try {
    await downloadBackup(filename)
  } catch (e) {
    pwError.value = e?.response?.data?.message || e?.message || 'Download failed'
  }
}

async function doChangePassword() {
  pwError.value = ''
  pwSuccess.value = ''
  if (newPassword.value !== confirmPassword.value) {
    pwError.value = 'Passwords do not match'
    return
  }
  if (newPassword.value.length < 6) {
    pwError.value = 'Password must be at least 6 characters'
    return
  }
  pwChanging.value = true
  try {
    await changePassword(oldPassword.value, newPassword.value)
    pwSuccess.value = 'Password changed successfully!'
    oldPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (e) {
    pwError.value = e?.response?.data?.message || e?.message || 'Password change failed'
  }
  pwChanging.value = false
}
</script>

<style scoped>
.backup-page { padding: 1.5rem 2rem; max-width: 900px; }
.backup-page h1 { font-size: 1.3rem; margin-bottom: 1.5rem; color: #1e293b; }
.backup-section { background: #fff; border-radius: 8px; padding: 1.25rem 1.5rem; margin-bottom: 1.25rem; border: 1px solid #e2e8f0; }
.backup-section h2 { font-size: 1rem; margin: 0 0 0.5rem; color: #334155; }
.backup-section p { color: #64748b; font-size: 0.85rem; margin: 0 0 0.75rem; }
.success-msg { background: #f0fdf4; color: #16a34a; padding: 0.5rem 0.75rem; border-radius: 6px; font-size: 0.85rem; margin-top: 0.75rem; }
.error-msg { background: #fef2f2; color: #dc2626; padding: 0.5rem 0.75rem; border-radius: 6px; font-size: 0.85rem; margin-bottom: 0.75rem; }
.loading { color: #64748b; font-size: 0.9rem; }
.empty { color: #94a3b8; font-size: 0.9rem; padding: 1rem 0; }
.data-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.data-table th, .data-table td { padding: 0.5rem 0.75rem; text-align: left; border-bottom: 1px solid #f1f5f9; }
.data-table th { font-weight: 600; color: #475569; background: #f8fafc; }
.data-table td { color: #334155; }
.badge { display: inline-block; padding: 0.15rem 0.45rem; border-radius: 4px; font-size: 0.7rem; font-weight: 600; margin-right: 0.4rem; }
.badge-blue { background: #dbeafe; color: #1d4ed8; }
.badge-green { background: #dcfce7; color: #16a34a; }
.badge-orange { background: #ffedd5; color: #ea580c; }
.password-form { max-width: 400px; }
.field { margin-bottom: 1rem; }
.field label { display: block; font-size: 0.85rem; font-weight: 500; color: #475569; margin-bottom: 0.3rem; }
.input { width: 100%; padding: 0.55rem 0.75rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.9rem; box-sizing: border-box; }
.input:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
.btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1rem; border: none; border-radius: 6px; font-size: 0.85rem; cursor: pointer; }
.btn-primary { background: #2563eb; color: #fff; }
.btn-primary:hover { background: #1d4ed8; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-sm { padding: 0.35rem 0.75rem; font-size: 0.8rem; }
</style>
