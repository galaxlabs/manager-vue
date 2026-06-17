<template>
  <div class="page settings-page">
    <div class="page-header">
      <h1>Settings</h1>
      <button class="btn btn-primary" @click="save">Save Settings</button>
    </div>

    <div class="settings-grid">
      <div class="card">
        <div class="card-header"><h2>Company Information</h2></div>
        <div class="card-body">
          <div class="form-group">
            <label>Company Name</label>
            <input v-model="form.company_name" class="input" />
          </div>
          <div class="form-group">
            <label>Address</label>
            <textarea v-model="form.company_address" class="input" rows="2"></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Email</label>
              <input v-model="form.company_email" class="input" type="email" />
            </div>
            <div class="form-group">
              <label>Phone</label>
              <input v-model="form.company_phone" class="input" />
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><h2>Regional Settings</h2></div>
        <div class="card-body">
          <div class="form-row">
            <div class="form-group">
              <label>Base Currency</label>
              <select v-model="form.currency" class="input">
                <option v-for="c in currencies" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Date Format</label>
              <select v-model="form.date_format" class="input">
                <option v-for="f in dateFormats" :key="f" :value="f">{{ f }}</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>First Month of Financial Year</label>
              <select v-model="form.first_month_of_financial_year" class="input">
                <option v-for="m in months" :key="m" :value="m">{{ m }}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><h2>Modules</h2></div>
        <div class="card-body">
          <p class="text-muted">Enable or disable modules. Disabled modules will be hidden from the sidebar.</p>
          <div class="module-toggles">
            <label v-for="mod in modules" :key="mod.key" class="toggle-row">
              <input type="checkbox" v-model="form[mod.key]" :true-value="1" :false-value="0" />
              <span>{{ mod.label }}</span>
            </label>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><h2>Chart of Accounts</h2></div>
        <div class="card-body">
          <p class="text-muted">
            Import the standard Manager.io chart of accounts. This will create the core accounts for your company.
          </p>
          <div v-if="form.chart_of_accounts_imported" class="import-status imported">
            Chart of Accounts has been imported
          </div>
          <button v-else class="btn btn-primary" @click="importCoA" :disabled="importing">
            {{ importing ? 'Importing...' : 'Import Chart of Accounts' }}
          </button>
          <div v-if="importResult" class="import-result">
            Created {{ importResult.count }} accounts: {{ importResult.created?.join(', ') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'

const store = useSettingsStore()
const form = reactive({ ...store.settings })
const importing = ref(false)
const importResult = ref(null)

const currencies = ['USD', 'EUR', 'GBP', 'PKR', 'INR', 'AED']
const dateFormats = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const modules = [
  { key: 'module_sales', label: 'Sales (Invoices, Orders, Customers)' },
  { key: 'module_purchases', label: 'Purchases (Invoices, Orders, Suppliers)' },
  { key: 'module_banking', label: 'Banking (Receipts, Payments, Transfers)' },
  { key: 'module_inventory', label: 'Inventory (Items, Delivery Notes)' },
  { key: 'module_payroll', label: 'Payroll (Employees)' },
  { key: 'module_fixed_assets', label: 'Fixed Assets' },
  { key: 'module_accounting', label: 'Accounting (Chart of Accounts, Journal Entries)' },
]

async function save() {
  await store.save({ ...form })
}

async function importCoA() {
  importing.value = true
  try {
    const res = await store.importChartOfAccounts()
    importResult.value = res.message
    form.chart_of_accounts_imported = 1
  } finally {
    importing.value = false
  }
}

onMounted(async () => {
  await store.load()
  Object.assign(form, store.settings)
})
</script>
