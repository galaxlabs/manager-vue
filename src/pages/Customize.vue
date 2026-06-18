<template>
  <div class="page customize-page">
    <div class="page-header">
      <h1>Customize Tabs</h1>
      <div v-if="saved" class="saved-badge">Saved</div>
    </div>
    <p class="subtitle">Show or hide sidebar navigation tabs. Changes apply immediately.</p>
    <div class="groups">
      <div v-for="group in tabGroups" :key="group.name" class="group-card">
        <h3 class="group-title">{{ group.label }}</h3>
        <div class="tab-list">
          <label v-for="tab in group.tabs" :key="tab.id" class="tab-row">
            <input type="checkbox" v-model="tab.visible" @change="save" />
            <span>{{ tab.label }}</span>
          </label>
        </div>
      </div>
    </div>
    <div class="actions">
      <button class="btn btn-secondary" @click="showAll">Show All</button>
      <button class="btn btn-secondary" @click="resetDefaults">Reset</button>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { frappeCall } from '@/api/frappe'

const tabGroups = reactive([
  {
    name: 'banking', label: 'Banking & Cash',
    tabs: [
      { id: 'accounts', label: 'Bank and Cash Accounts', visible: true },
      { id: 'receipts', label: 'Receipts', visible: true },
      { id: 'payments', label: 'Payments', visible: true },
      { id: 'transfers', label: 'Inter Account Transfers', visible: true },
      { id: 'reconciliations', label: 'Bank Reconciliations', visible: true },
      { id: 'expense_claims', label: 'Expense Claims', visible: true },
    ]
  }, {
    name: 'sales', label: 'Sales',
    tabs: [
      { id: 'customers', label: 'Customers', visible: true },
      { id: 'sales_quotes', label: 'Sales Quotes', visible: true },
      { id: 'sales_orders', label: 'Sales Orders', visible: true },
      { id: 'sales_invoices', label: 'Sales Invoices', visible: true },
      { id: 'credit_notes', label: 'Credit Notes', visible: true },
      { id: 'late_fees', label: 'Late Payment Fees', visible: true },
      { id: 'billable_time', label: 'Billable Time', visible: true },
      { id: 'withholding', label: 'Withholding Tax Receipts', visible: true },
      { id: 'delivery_notes', label: 'Delivery Notes', visible: true },
    ]
  }, {
    name: 'purchases', label: 'Purchases',
    tabs: [
      { id: 'suppliers', label: 'Suppliers', visible: true },
      { id: 'purchase_quotes', label: 'Purchase Quotes', visible: true },
      { id: 'purchase_orders', label: 'Purchase Orders', visible: true },
      { id: 'purchase_invoices', label: 'Purchase Invoices', visible: true },
      { id: 'debit_notes', label: 'Debit Notes', visible: true },
      { id: 'goods_receipts', label: 'Goods Receipts', visible: true },
    ]
  }, {
    name: 'projects', label: 'Projects',
    tabs: [{ id: 'projects', label: 'Projects', visible: true }]
  }, {
    name: 'inventory', label: 'Inventory',
    tabs: [
      { id: 'items', label: 'Inventory Items', visible: true },
      { id: 'transfers', label: 'Inventory Transfers', visible: true },
      { id: 'write_offs', label: 'Inventory Write-offs', visible: true },
      { id: 'production', label: 'Production Orders', visible: true },
    ]
  }, {
    name: 'payroll', label: 'Payroll',
    tabs: [
      { id: 'employees', label: 'Employees', visible: true },
      { id: 'payslips', label: 'Payslips', visible: true },
    ]
  }, {
    name: 'capital', label: 'Capital & Investments',
    tabs: [
      { id: 'investments', label: 'Investments', visible: true },
      { id: 'fixed_assets', label: 'Fixed Assets', visible: true },
      { id: 'depreciation', label: 'Depreciation Entries', visible: true },
      { id: 'intangible_assets', label: 'Intangible Assets', visible: true },
      { id: 'amortization', label: 'Amortization Entries', visible: true },
      { id: 'capital_accts', label: 'Capital Accounts', visible: true },
      { id: 'special_accts', label: 'Special Accounts', visible: true },
    ]
  }, {
    name: 'accounting', label: 'Accounting',
    tabs: [
      { id: 'chart', label: 'Chart of Accounts', visible: true },
      { id: 'journal', label: 'Journal Entries', visible: true },
      { id: 'folders', label: 'Folders', visible: true },
      { id: 'recurring', label: 'Recurring Transactions', visible: true },
      { id: 'budgets', label: 'Budgets', visible: true },
    ]
  },
  {
    name: 'reports', label: 'Reports',
    tabs: [
      { id: 'trial_balance', label: 'Trial Balance', visible: true },
      { id: 'profit_loss', label: 'Profit & Loss', visible: true },
      { id: 'balance_sheet', label: 'Balance Sheet', visible: true },
      { id: 'aging', label: 'Aging Report', visible: true },
      { id: 'cash_flow', label: 'Cash Flow', visible: true },
    ]
  },
  {
    name: 'admin', label: 'Administration',
    tabs: [
      { id: 'settings', label: 'Settings', visible: true },
      { id: 'extensions', label: 'Extensions', visible: true },
      { id: 'businesses', label: 'Businesses', visible: true },
      { id: 'users', label: 'Users', visible: true },
      { id: 'customize', label: 'Customize', visible: true },
    ]
  },
])

const saved = ref(false)

onMounted(async () => {
  try {
    const res = await frappeCall('manager.api.get_settings')
    const cfg = res.message?.sidebar_config
    if (cfg) {
      const parsed = typeof cfg === 'string' ? JSON.parse(cfg) : cfg
      for (const group of tabGroups) {
        for (const tab of group.tabs) {
          if (parsed[tab.id] !== undefined) tab.visible = parsed[tab.id]
        }
      }
    }
  } catch {}
})

async function save() {
  const cfg = {}
  for (const group of tabGroups) {
    for (const tab of group.tabs) {
      cfg[tab.id] = tab.visible
    }
  }
  try {
    await frappeCall('manager.api.save_settings', { sidebar_config: JSON.stringify(cfg) })
    saved.value = true
    setTimeout(() => saved.value = false, 2000)
  } catch {}
}

function showAll() {
  for (const g of tabGroups) for (const t of g.tabs) t.visible = true
  save()
}
function resetDefaults() {
  for (const g of tabGroups) for (const t of g.tabs) t.visible = true
  save()
}
</script>

<style scoped>
.customize-page { max-width: 900px; margin: 0 auto; }
.subtitle { color: #666; margin-bottom: 1.5rem; }
.groups { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.25rem; }
.group-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; }
.group-title { font-size: 0.8rem; text-transform: uppercase; color: #64748b; margin: 0 0 0.75rem; letter-spacing: 0.5px; }
.tab-list { display: flex; flex-direction: column; gap: 0.4rem; }
.tab-row { display: flex; align-items: center; gap: 0.5rem; padding: 0.35rem 0; cursor: pointer; font-size: 0.9rem; color: #1e293b; }
.tab-row input[type="checkbox"] { width: 16px; height: 16px; accent-color: #2563eb; flex-shrink: 0; }
.saved-badge { background: #16a34a; color: #fff; padding: 0.2rem 0.75rem; border-radius: 4px; font-size: 0.8rem; }
.actions { margin-top: 1.5rem; display: flex; gap: 0.75rem; }
.btn-secondary { background: #f1f5f9; border: 1px solid #cbd5e1; color: #475569; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-size: 0.85rem; }
.btn-secondary:hover { background: #e2e8f0; }
</style>
