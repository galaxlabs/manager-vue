<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { frappeCall } from '@/api/frappe'
import { formatCurrency } from '@/utils/format'

const route = useRoute()
const router = useRouter()

const doc = ref(null)
const meta = ref(null)
const loading = ref(true)
const error = ref('')

const ps = reactive({
  orientation: 'portrait',
  fontSize: 12,
  colorScheme: 'blue',
  showLogo: true, showCompanyInfo: true, showStatus: true,
  showDocumentNumber: true, showReference: true, showCustomerInfo: true,
  showItemsTable: true, showTotals: true, showFooter: true,
  showDisclaimer: true, showSignature: false, showWatermark: false,
  showPageNumbers: true,
  customNote: '', customRef: '',
  companyName: '', companyAddress: '', companyEmail: '', companyPhone: '',
  disclaimerText: 'This document is computer-generated and does not require a signature.',
})

const SCHEMES = {
  green: { accent: '#16a34a', light: '#f0fdf4', border: '#bbf7d0', text: '#166534' },
  blue: { accent: '#2563eb', light: '#eff6ff', border: '#bfdbfe', text: '#1e40af' },
  teal: { accent: '#0d9488', light: '#f0fdfa', border: '#99f6e4', text: '#0f766e' },
  black: { accent: '#1e293b', light: '#f8fafc', border: '#e2e8f0', text: '#1e293b' },
}

const scheme = computed(() => SCHEMES[ps.colorScheme] || SCHEMES.blue)
const pageStyle = computed(() => ps.orientation === 'landscape'
  ? { maxWidth: '1100px', padding: '32px 48px' }
  : { maxWidth: '860px', padding: '40px 56px' }
)

const printCSS = computed(() => `
  @media print {
    .no-print { display: none !important; }
    body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .print-page {
      box-shadow: none !important;
      margin: 0 !important;
      max-width: 100% !important;
      ${ps.orientation === 'landscape' ? 'padding: 12mm 16mm !important;' : 'padding: 16mm 18mm !important;'}
    }
    @page { size: ${ps.orientation === 'landscape' ? 'A4 landscape' : 'A4 portrait'}; margin: 0; }
    tr { page-break-inside: avoid; }
  }
`)

function fmt(d) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

const doctypeName = route.params.doctype
const docName = route.params.name

onMounted(async () => {
  try {
    const [docRes, metaRes, setRes] = await Promise.all([
      frappeCall('manager.api.get_doc', { doctype: doctypeName, name: docName }),
      frappeCall('manager.api.get_meta', { doctype: doctypeName }),
      frappeCall('manager.api.get_settings'),
    ])
    doc.value = docRes?.message
    meta.value = metaRes?.message
    const data = setRes?.message || {}
    if (data.enable_print && data.print_settings) {
      try {
        const s = typeof data.print_settings === 'string' ? JSON.parse(data.print_settings) : data.print_settings
        Object.assign(ps, s)
      } catch {}
    }
    ps.companyName = data.company_name || ps.companyName
    ps.companyAddress = data.company_address || ps.companyAddress
    ps.companyEmail = data.company_email || ps.companyEmail
    ps.companyPhone = data.company_phone || ps.companyPhone
  } catch (e) {
    error.value = e.message || 'Failed to load document'
  } finally {
    loading.value = false
  }
})

function getField(key) {
  const d = doc.value
  if (!d) return '-'
  const val = d[key]
  if (val === null || val === undefined) return '-'
  if (typeof val === 'object' && !Array.isArray(val)) return val.name || val.title || val.subject || '-'
  return val
}

function getCustomerName() {
  const d = doc.value
  if (!d) return '-'
  if (d.customer_name) return d.customer_name
  if (typeof d.customer === 'string') return d.customer
  if (d.customer && typeof d.customer === 'object') return d.customer
  if (d.supplier_name) return d.supplier_name
  if (typeof d.supplier === 'string') return d.supplier
  if (d.supplier && typeof d.supplier === 'object') return d.supplier
  return '-'
}

function getDocStatus() {
  const d = doc.value
  if (!d) return ''
  if (d.docstatus === 0) return 'Draft'
  if (d.docstatus === 1) return 'Submitted'
  if (d.docstatus === 2) return 'Cancelled'
  if (d.status) return d.status
  return ''
}

function getLineItems() {
  const d = doc.value
  if (!d) return []
  if (d.items && Array.isArray(d.items) && d.items.length > 0) return d.items
  if (d.journal_entry_accounts && Array.isArray(d.journal_entry_accounts)) return d.journal_entry_accounts
  return []
}

function getItemColumns() {
  const items = getLineItems()
  if (!items.length) return []
  const sample = items[0]
  return Object.keys(sample).filter(k =>
    !['name', 'owner', 'creation', 'modified', 'modified_by', 'docstatus', 'idx', 'parent', 'parentfield', 'parenttype', 'reference'].includes(k) &&
    typeof sample[k] !== 'object'
  ).slice(0, 8)
}

const lineItems = computed(() => getLineItems())
const itemColumns = computed(() => getItemColumns())

function getTotal() {
  const d = doc.value
  if (!d) return 0
  return d.total_amount || d.amount || d.net_pay || d.grand_total || d.total || 0
}

function getTitle() {
  const d = doc.value
  if (!d) return doctypeName
  return d.title || d.name || docName
}
</script>

<template>
  <div v-if="loading" class="loading-screen">
    <div class="spinner-large"></div>
    <p>Loading document...</p>
  </div>

  <div v-else-if="error" class="error-screen">
    <div class="error-card">
      <h2>Error</h2>
      <p>{{ error }}</p>
      <button class="btn btn-outline" @click="router.go(-1)">Go Back</button>
    </div>
  </div>

  <div v-else>
    <!-- Toolbar (hidden when printing) -->
    <div class="no-print toolbar">
      <div class="toolbar-inner">
        <button class="btn btn-ghost" @click="router.go(-1)">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back
        </button>
        <span class="doc-label">{{ doctypeName }}: {{ docName }}</span>
        <button class="btn btn-primary" @click="window.print()">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          Print / Save PDF
        </button>
      </div>
    </div>

    <!-- Printable Page -->
    <div class="print-page" :style="{ ...pageStyle, fontFamily: 'Arial, sans-serif', fontSize: ps.fontSize + 'px', lineHeight: 1.6, position: 'relative' }">
      <!-- Watermark -->
      <div v-if="ps.showWatermark" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;z-index:0">
        <div style="font-size:90px;font-weight:900;color:rgba(0,0,0,0.04);transform:rotate(-35deg);user-select:none;letter-spacing:.1em">COPY</div>
      </div>

      <div style="position:relative;z-index:1">
        <!-- Header: Logo + Company Info -->
        <div v-if="ps.showLogo || ps.showCompanyInfo" :style="{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: `3px solid ${scheme.accent}`, paddingBottom: 16, marginBottom: 20 }">
          <div>
            <div v-if="ps.companyName" style="font-size:20px;font-weight:800;color:var(--accent);letter-spacing:.03em" :style="{ color: scheme.accent }">{{ ps.companyName }}</div>
            <div v-if="ps.companyAddress" style="font-size:10px;color:#64748b;margin-top:2px">{{ ps.companyAddress }}</div>
            <div v-if="ps.companyEmail" style="font-size:10px;color:#64748b">{{ ps.companyEmail }}</div>
            <div v-if="ps.companyPhone" style="font-size:10px;color:#64748b">{{ ps.companyPhone }}</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:10px;color:#94a3b8">Document #</div>
            <div style="font-weight:700;font-size:13px;font-family:monospace;color:#1e293b">{{ docName }}</div>
            <div v-if="ps.customRef" style="margin-top:4px">
              <div style="font-size:10px;color:#94a3b8">Reference</div>
              <div style="font-weight:700;font-size:12px" :style="{ color: scheme.accent }">{{ ps.customRef }}</div>
            </div>
            <div style="margin-top:4px">
              <div style="font-size:10px;color:#94a3b8">Date</div>
              <div style="font-weight:600;font-size:12px">{{ fmt(doc?.date || doc?.creation) }}</div>
            </div>
          </div>
        </div>

        <!-- Status -->
        <div v-if="ps.showStatus && getDocStatus()" :style="{ background: scheme.light, border: `1px solid ${scheme.border}`, borderRadius: 8, padding: '8px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between' }">
          <span style="font-weight:700;font-size:12px" :style="{ color: scheme.accent }">Status: {{ getDocStatus() }}</span>
        </div>

        <!-- Customer/Supplier Info -->
        <div v-if="ps.showCustomerInfo && getCustomerName()" :style="{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '14px 18px', marginBottom: 16 }">
          <div style="font-weight:700;font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:#94a3b8;margin-bottom:8px">{{ getField('customer') ? 'Bill To / Customer' : 'Supplier / Vendor' }}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px 20px">
            <div>
              <div style="font-size:9px;color:#94a3b8;text-transform:uppercase">Name</div>
              <div style="font-size:12px;font-weight:600">{{ getCustomerName() }}</div>
            </div>
            <div>
              <div style="font-size:9px;color:#94a3b8;text-transform:uppercase">Date</div>
              <div style="font-size:12px;font-weight:600">{{ fmt(doc?.date) }}</div>
            </div>
            <div v-if="doc?.due_date || doc?.expiry_date">
              <div style="font-size:9px;color:#94a3b8;text-transform:uppercase">Due Date</div>
              <div style="font-size:12px;font-weight:600">{{ fmt(doc?.due_date || doc?.expiry_date) }}</div>
            </div>
          </div>
        </div>

        <!-- Reference / Description -->
        <div v-if="ps.showReference && doc?.notes" :style="{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: ps.fontSize - 1 + 'px', color: '#78350f' }">
          <div style="font-weight:700;font-size:10px;text-transform:uppercase;margin-bottom:4px;color:#92400e">Notes</div>
          {{ doc.notes }}
        </div>

        <!-- Items Table -->
        <div v-if="ps.showItemsTable">
          <table v-if="lineItems.length" style="width:100%;border-collapse:collapse;font-size:var(--fs);margin-bottom:16px" :style="{ fontSize: ps.fontSize + 'px' }">
            <thead>
              <tr style="background:#f1f5f9">
                <th style="padding:7px 10px;text-align:left;font-weight:700;font-size:11px;color:#475569;border:1px solid #e2e8f0">#</th>
                <th v-for="col in itemColumns" :key="col" style="padding:7px 10px;text-align:left;font-weight:700;font-size:11px;color:#475569;border:1px solid #e2e8f0;text-transform:capitalize">{{ col.replace(/_/g, ' ') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, i) in lineItems" :key="i" style="border-bottom:1px solid #e2e8f0" :style="{ background: i % 2 === 0 ? '#fff' : '#fafbfc' }">
                <td style="padding:6px 10px;font-size:11px;color:#94a3b8;border:1px solid #e2e8f0;vertical-align:top">{{ i + 1 }}</td>
                <td v-for="col in itemColumns" :key="col" style="padding:6px 10px;font-size:11px;color:#1e293b;border:1px solid #e2e8f0;vertical-align:top">
                  <template v-if="typeof item[col] === 'number' && (col.includes('amount') || col.includes('rate') || col.includes('total') || col.includes('price') || col.includes('debit') || col.includes('credit'))">
                    {{ formatCurrency(item[col]) }}
                  </template>
                  <template v-else>{{ item[col] !== undefined && item[col] !== null ? item[col] : '-' }}</template>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Totals -->
        <div v-if="ps.showTotals" style="display:flex;justify-content:flex-end;margin-bottom:20px">
          <div style="min-width:200px;border-top:2px solid #e2e8f0;padding-top:10px">
            <div style="display:flex;justify-content:space-between;font-size:14px;font-weight:700;color:#1e293b">
              <span>Total</span>
              <span :style="{ color: scheme.accent }">{{ formatCurrency(getTotal()) }}</span>
            </div>
            <div v-if="doc?.balance_due" style="display:flex;justify-content:space-between;font-size:12px;color:#64748b;margin-top:4px">
              <span>Balance Due</span>
              <span>{{ formatCurrency(doc.balance_due) }}</span>
            </div>
          </div>
        </div>

        <!-- Custom Note -->
        <div v-if="ps.customNote" :style="{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: ps.fontSize - 1 + 'px', color: '#78350f' }">
          <div style="font-weight:700;font-size:10px;text-transform:uppercase;margin-bottom:4px;color:#92400e">Note</div>
          {{ ps.customNote }}
        </div>

        <!-- Signature Lines -->
        <div v-if="ps.showSignature" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;margin:24px 0">
          <div v-for="label in ['Prepared By', 'Reviewed By', 'Authorized By']" :key="label" style="border-top:1px solid #94a3b8;padding-top:6px">
            <div style="font-size:10px;color:#94a3b8;margin-top:4px">{{ label }}</div>
            <div style="font-size:10px;color:#cbd5e1;margin-top:12px">Name / Signature / Date</div>
          </div>
        </div>

        <!-- Footer -->
        <div v-if="ps.showFooter" :style="{ borderTop: '2px solid #e2e8f0', paddingTop: 12, marginTop: 4 }">
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;font-size:10px;color:#64748b">
            <div><strong>Created:</strong><br/>{{ fmt(doc?.creation) }}</div>
            <div><strong>Modified:</strong><br/>{{ fmt(doc?.modified) }}</div>
            <div><strong>Printed:</strong><br/>{{ fmt(new Date().toISOString()) }}</div>
          </div>
        </div>

        <!-- Disclaimer -->
        <div v-if="ps.showDisclaimer" :style="{ marginTop: 12, fontSize: '9px', color: '#94a3b8', borderTop: '1px dashed #e2e8f0', paddingTop: 10 }">
          <strong>Disclaimer:</strong> {{ ps.disclaimerText || 'This document is computer-generated and does not require a signature.' }}
        </div>
      </div>
    </div>

    <component :is="'style'">{{ printCSS }}</component>
  </div>
</template>

<style scoped>
.loading-screen, .error-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #f8fafc;
}

.spinner-large {
  width: 36px; height: 36px;
  border: 3px solid #e5e7eb;
  border-top-color: #16a34a;
  border-radius: 50%;
  animation: spin .7s linear infinite;
  margin: 0 auto 12px;
}

@keyframes spin { to { transform: rotate(360deg); } }

.error-card {
  background: #fff;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0,0,0,.1);
  text-align: center;
  max-width: 400px;
}

.toolbar {
  background: #1e293b;
  position: sticky;
  top: 0;
  z-index: 100;
}

.toolbar-inner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 20px;
}

.doc-label {
  flex: 1;
  color: #94a3b8;
  font-size: 0.85rem;
  font-family: monospace;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
}

.btn-primary { background: #2563eb; color: #fff; }
.btn-primary:hover { background: #1d4ed8; }
.btn-outline { background: #fff; color: #374151; border: 1px solid #d1d5db; }
.btn-ghost { background: transparent; color: #94a3b8; border: none; }
.btn-ghost:hover { color: #e2e8f0; }

.print-page {
  background: #fff;
  margin: 16px auto 60px;
  box-shadow: 0 4px 32px rgba(0,0,0,.1);
}

@media print {
  .no-print { display: none !important; }
}
</style>
