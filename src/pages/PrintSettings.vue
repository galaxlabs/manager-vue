<script setup>
import { ref, reactive, onMounted } from 'vue'
import { frappeCall } from '@/api/frappe'

const printEnabled = ref(false)
const saving = ref(false)
const toastMsg = ref('')
const toastType = ref('success')
const settings = reactive({
  orientation: 'portrait',
  fontSize: 12,
  colorScheme: 'blue',
  showLogo: true,
  showCompanyInfo: true,
  showStatus: true,
  showDocumentNumber: true,
  showReference: true,
  showCustomerInfo: true,
  showItemsTable: true,
  showTotals: true,
  showFooter: true,
  showDisclaimer: true,
  showSignature: false,
  showWatermark: false,
  showPageNumbers: true,
  customNote: '',
  customRef: '',
  companyName: '',
  companyAddress: '',
  companyEmail: '',
  companyPhone: '',
  disclaimerText: 'This document is computer-generated and does not require a signature.',
})

function toast(type, msg) { toastMsg.value = msg; toastType.value = type; setTimeout(() => toastMsg.value = '', 3000) }

onMounted(async () => {
  try {
    const res = await frappeCall('manager.api.get_settings')
    const data = res?.message || {}
    if (data.enable_print !== undefined) printEnabled.value = !!data.enable_print
    if (data.print_settings) {
      try {
        const ps = typeof data.print_settings === 'string' ? JSON.parse(data.print_settings) : data.print_settings
        Object.assign(settings, ps)
      } catch {}
    }
    settings.companyName = data.company_name || ''
    settings.companyAddress = data.company_address || ''
    settings.companyEmail = data.company_email || ''
    settings.companyPhone = data.company_phone || ''
  } catch (e) {
    toast('error', 'Failed to load print settings')
  }
})

async function save() {
  saving.value = true
  try {
    await frappeCall('manager.api.save_settings', {
      enable_print: printEnabled.value ? 1 : 0,
      print_settings: JSON.stringify({ ...settings }),
      company_name: settings.companyName,
      company_address: settings.companyAddress,
      company_email: settings.companyEmail,
      company_phone: settings.companyPhone,
    })
    toast('success', 'Print settings saved')
  } catch (e) {
    toast('error', 'Failed to save: ' + (e.message || 'Unknown error'))
  } finally {
    saving.value = false
  }
}

function resetDefaults() {
  Object.assign(settings, {
    orientation: 'portrait', fontSize: 12, colorScheme: 'blue',
    showLogo: true, showCompanyInfo: true, showStatus: true,
    showDocumentNumber: true, showReference: true, showCustomerInfo: true,
    showItemsTable: true, showTotals: true, showFooter: true,
    showDisclaimer: true, showSignature: false, showWatermark: false,
    showPageNumbers: true,
    customNote: '', customRef: '',
    disclaimerText: 'This document is computer-generated and does not require a signature.',
  })
}

const SCHEMES = {
  green: { accent: '#16a34a', light: '#f0fdf4', border: '#bbf7d0', text: '#166534' },
  blue: { accent: '#2563eb', light: '#eff6ff', border: '#bfdbfe', text: '#1e40af' },
  teal: { accent: '#0d9488', light: '#f0fdfa', border: '#99f6e4', text: '#0f766e' },
  black: { accent: '#1e293b', light: '#f8fafc', border: '#e2e8f0', text: '#1e293b' },
}
</script>

<template>
  <div class="print-settings-page">
    <div v-if="toastMsg" class="toast" :class="toastType">{{ toastMsg }}</div>
    <div class="page-header">
      <h1>Print Settings</h1>
      <p class="subtitle">Configure how printed documents (invoices, receipts, etc.) will appear</p>
    </div>

    <div class="card master-toggle">
      <div class="toggle-row">
        <div>
          <strong>Enable Print Settings</strong>
          <p class="help-text">When enabled, these settings control how all printed documents appear</p>
        </div>
        <label class="switch">
          <input type="checkbox" v-model="printEnabled" />
          <span class="slider"></span>
        </label>
      </div>
    </div>

    <div v-if="printEnabled" class="settings-grid">
      <div class="card">
        <div class="card-header">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          <span>Layout</span>
        </div>
        <div class="card-body">
          <div class="field">
            <label>Orientation</label>
            <div class="btn-group">
              <button :class="{ active: settings.orientation === 'portrait' }" @click="settings.orientation = 'portrait'">Portrait</button>
              <button :class="{ active: settings.orientation === 'landscape' }" @click="settings.orientation = 'landscape'">Landscape</button>
            </div>
          </div>
          <div class="field">
            <label>Font Size ({{ settings.fontSize }}px)</label>
            <input type="range" v-model="settings.fontSize" min="10" max="16" step="1" />
          </div>
          <div class="field">
            <label>Color Scheme</label>
            <div class="color-picker">
              <button v-for="(s, key) in SCHEMES" :key="key" class="color-dot"
                :style="{ background: s.accent, borderColor: settings.colorScheme === key ? '#fff' : 'transparent', boxShadow: settings.colorScheme === key ? '0 0 0 2px ' + s.accent : 'none' }"
                @click="settings.colorScheme = key" :title="key"></button>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          <span>Show / Hide Sections</span>
        </div>
        <div class="card-body">
          <div class="toggle-grid">
            <label class="toggle-label"><input type="checkbox" v-model="settings.showLogo" /><span>Logo</span></label>
            <label class="toggle-label"><input type="checkbox" v-model="settings.showCompanyInfo" /><span>Company Info</span></label>
            <label class="toggle-label"><input type="checkbox" v-model="settings.showStatus" /><span>Status</span></label>
            <label class="toggle-label"><input type="checkbox" v-model="settings.showDocumentNumber" /><span>Document Number</span></label>
            <label class="toggle-label"><input type="checkbox" v-model="settings.showReference" /><span>Reference</span></label>
            <label class="toggle-label"><input type="checkbox" v-model="settings.showCustomerInfo" /><span>Customer/Supplier Info</span></label>
            <label class="toggle-label"><input type="checkbox" v-model="settings.showItemsTable" /><span>Items Table</span></label>
            <label class="toggle-label"><input type="checkbox" v-model="settings.showTotals" /><span>Totals</span></label>
            <label class="toggle-label"><input type="checkbox" v-model="settings.showFooter" /><span>Footer</span></label>
            <label class="toggle-label"><input type="checkbox" v-model="settings.showDisclaimer" /><span>Disclaimer</span></label>
            <label class="toggle-label"><input type="checkbox" v-model="settings.showSignature" /><span>Signature Line</span></label>
            <label class="toggle-label"><input type="checkbox" v-model="settings.showWatermark" /><span>Watermark</span></label>
            <label class="toggle-label"><input type="checkbox" v-model="settings.showPageNumbers" /><span>Page Numbers</span></label>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="4"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>
          <span>Company Details</span>
        </div>
        <div class="card-body">
          <div class="field">
            <label>Company Name</label>
            <input type="text" v-model="settings.companyName" placeholder="Your Company Name" />
          </div>
          <div class="field">
            <label>Address</label>
            <textarea v-model="settings.companyAddress" placeholder="Company address" rows="2"></textarea>
          </div>
          <div class="field">
            <label>Email</label>
            <input type="text" v-model="settings.companyEmail" placeholder="contact@company.com" />
          </div>
          <div class="field">
            <label>Phone</label>
            <input type="text" v-model="settings.companyPhone" placeholder="+1 (555) 000-0000" />
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          <span>Custom Content</span>
        </div>
        <div class="card-body">
          <div class="field">
            <label>Custom Reference</label>
            <input type="text" v-model="settings.customRef" placeholder="e.g. INV-2025-001" />
          </div>
          <div class="field">
            <label>Custom Note</label>
            <textarea v-model="settings.customNote" placeholder="Additional remarks for printed documents..." rows="2"></textarea>
          </div>
          <div class="field">
            <label>Disclaimer Text</label>
            <textarea v-model="settings.disclaimerText" placeholder="Disclaimer footer text" rows="3"></textarea>
          </div>
        </div>
      </div>
    </div>

    <div class="actions-bar" v-if="printEnabled">
      <button class="btn btn-outline" @click="resetDefaults">Reset to Defaults</button>
      <button class="btn btn-primary" @click="save" :disabled="saving">
        <span v-if="saving" class="spinner"></span>
        {{ saving ? 'Saving...' : 'Save Print Settings' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.print-settings-page { max-width: 900px; margin: 0 auto; }
.page-header { margin-bottom: 24px; }
.page-header h1 { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); margin: 0 0 4px; }
.subtitle { color: var(--text-muted); font-size: 0.875rem; margin: 0; }

.card { background: var(--surface-card); border: 1px solid var(--border-base); border-radius: 12px; margin-bottom: 16px; overflow: hidden; }
.card-header { display: flex; align-items: center; gap: 8px; padding: 14px 18px; background: var(--surface-bg); border-bottom: 1px solid var(--border-base); font-weight: 700; font-size: 0.875rem; color: var(--text-primary); }
.card-body { padding: 16px 18px; }

.master-toggle { padding: 16px 18px; }
.toggle-row { display: flex; justify-content: space-between; align-items: center; gap: 16px; }
.toggle-row strong { font-size: 0.95rem; color: var(--text-primary); }
.help-text { color: var(--text-muted); font-size: 0.8rem; margin: 2px 0 0; }

.switch { position: relative; display: inline-block; width: 48px; height: 26px; flex-shrink: 0; }
.switch input { display: none; }
.slider { position: absolute; inset: 0; background: #e2e8f0; border-radius: 26px; cursor: pointer; transition: background 0.2s; }
.slider::before { content: ''; position: absolute; width: 20px; height: 20px; left: 3px; bottom: 3px; background: #fff; border-radius: 50%; transition: transform 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,.2); }
.switch input:checked + .slider { background: #2563eb; }
.switch input:checked + .slider::before { transform: translateX(22px); }

.settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
@media (max-width: 640px) { .settings-grid { grid-template-columns: 1fr; } }

.field { margin-bottom: 14px; }
.field:last-child { margin-bottom: 0; }
.field label { display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; }
.field input[type="text"], .field textarea { width: 100%; padding: 8px 12px; border: 1px solid var(--border-base); border-radius: 8px; font-size: 0.85rem; background: var(--surface-bg); color: var(--text-primary); box-sizing: border-box; }
.field textarea { resize: vertical; min-height: 48px; }
.field input[type="range"] { width: 100%; accent-color: #2563eb; }

.btn-group { display: flex; gap: 4px; }
.btn-group button { padding: 6px 14px; border: 1px solid var(--border-base); border-radius: 8px; background: var(--surface-bg); color: var(--text-secondary); font-size: 0.8rem; cursor: pointer; font-weight: 500; transition: all 0.15s; }
.btn-group button.active { background: #2563eb; color: #fff; border-color: #2563eb; font-weight: 700; }

.color-picker { display: flex; gap: 8px; }
.color-dot { width: 28px; height: 28px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; flex-shrink: 0; transition: all 0.15s; }

.toggle-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; }
@media (max-width: 480px) { .toggle-grid { grid-template-columns: 1fr; } }
.toggle-label { display: flex; align-items: center; gap: 8px; padding: 6px 0; cursor: pointer; font-size: 0.82rem; color: var(--text-primary); user-select: none; }
.toggle-label input[type="checkbox"] { width: 16px; height: 16px; accent-color: #2563eb; flex-shrink: 0; }

.actions-bar { display: flex; gap: 12px; justify-content: flex-end; margin-top: 8px; padding: 16px 0; }
.btn { display: inline-flex; align-items: center; gap: 6px; padding: 10px 20px; border-radius: 8px; font-size: 0.875rem; font-weight: 600; cursor: pointer; border: none; transition: all 0.15s; }
.btn-primary { background: #2563eb; color: #fff; }
.btn-primary:hover { background: #1d4ed8; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-outline { background: var(--surface-bg); color: var(--text-secondary); border: 1px solid var(--border-base); }
.btn-outline:hover { background: var(--surface-card); }

.spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.6s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.toast { padding: 10px 18px; border-radius: 8px; font-size: 0.85rem; font-weight: 500; margin-bottom: 16px; animation: fadeSlide .3s ease; }
.toast.success { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
.toast.error { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
@keyframes fadeSlide { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
</style>
