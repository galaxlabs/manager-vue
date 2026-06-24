<template>
  <div class="page settings-page">
    <div class="settings-layout">
      <aside class="settings-sidebar">
        <div v-for="cat in categories" :key="cat.key" class="sidebar-item" :class="{ active: activeCategory === cat.key }" @click="activeCategory = cat.key">
          {{ cat.label }}
        </div>
      </aside>
      <main class="settings-content">

        <div v-if="activeCategory === 'business'" class="card">
          <div class="card-header"><h2>Business Details</h2></div>
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
            <div class="form-group">
              <label>Company Tax ID</label>
              <input v-model="form.company_tax_id" class="input" placeholder="NTN / VAT / Tax Registration No." />
            </div>
          </div>
        </div>

        <div v-if="activeCategory === 'format'" class="card">
          <div class="card-header"><h2>Date, Time & Number Format</h2></div>
          <div class="card-body">
            <div class="form-row">
              <div class="form-group">
                <label>Language</label>
                <select v-model="form.language" class="input">
                  <option v-for="l in languages" :key="l" :value="l">{{ l }}</option>
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
                <label>Time Format</label>
                <select v-model="form.time_format" class="input">
                  <option value="12-hour (1:30 PM)">12-hour (1:30 PM)</option>
                  <option value="24-hour (13:30)">24-hour (13:30)</option>
                </select>
              </div>
              <div class="form-group">
                <label>First Day of Week</label>
                <select v-model="form.first_day_of_week" class="input">
                  <option v-for="d in weekDays" :key="d" :value="d">{{ d }}</option>
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
              <div class="form-group">
                <label>Number Format</label>
                <select v-model="form.number_format" class="input">
                  <option v-for="n in numberFormats" :key="n" :value="n">{{ n }}</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Decimal Separator</label>
                <select v-model="form.number_decimal" class="input">
                  <option value=". (dot)">. (dot)</option>
                  <option value=", (comma)">, (comma)</option>
                </select>
              </div>
              <div class="form-group">
                <label>Group Separator</label>
                <select v-model="form.number_group" class="input">
                  <option value=", (comma)">, (comma)</option>
                  <option value=". (dot)">. (dot)</option>
                  <option value="(space)">(space)</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label>Base Currency</label>
              <select v-model="form.currency" class="input">
                <option v-for="c in currencies" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>
          </div>
        </div>

        <div v-if="activeCategory === 'accounting'" class="card">
          <div class="card-header"><h2>Accounting Method</h2></div>
          <div class="card-body">
            <div class="form-row">
              <div class="form-group">
                <label>Accounting Method</label>
                <select v-model="form.accounting_method" class="input">
                  <option value="Accrual">Accrual</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>
              <div class="form-group">
                <label>Reporting Period</label>
                <select v-model="form.reporting_period" class="input">
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeCategory === 'tax'" class="card">
          <div class="card-header">
            <h2>Tax Codes</h2>
            <button class="btn btn-primary btn-sm" @click="showAddTax = true">+ Add Tax Code</button>
          </div>
          <div class="card-body">
            <p class="text-muted">Manage tax rates for VAT, GST, Sales Tax, Withholding Tax, etc.</p>
            <div v-if="showAddTax" class="inline-form">
              <input v-model="newTax.code" class="input" placeholder="Code" />
              <input v-model="newTax.name" class="input" placeholder="Name" />
              <input v-model.number="newTax.rate" class="input" type="number" step="0.01" placeholder="Rate %" />
              <select v-model="newTax.type" class="input">
                <option value="">Type</option>
                <option value="VAT">VAT</option>
                <option value="GST">GST</option>
                <option value="Sales Tax">Sales Tax</option>
                <option value="Withholding Tax">Withholding Tax</option>
                <option value="Other">Other</option>
              </select>
              <button class="btn btn-primary btn-sm" @click="saveTaxCode">Save</button>
              <button class="btn btn-sm" @click="showAddTax = false">Cancel</button>
            </div>
            <table class="mini-table" v-if="taxCodes.length">
              <thead>
                <tr><th>Code</th><th>Name</th><th>Rate</th><th>Type</th><th>Active</th></tr>
              </thead>
              <tbody>
                <tr v-for="t in taxCodes" :key="t.name">
                  <td>{{ t.tax_code }}</td><td>{{ t.tax_name }}</td><td>{{ t.rate }}%</td><td>{{ t.tax_type }}</td><td>{{ t.is_active ? 'Yes' : 'No' }}</td>
                </tr>
              </tbody>
            </table>
            <div v-else class="text-muted">No tax codes defined.</div>
          </div>
        </div>

        <div v-if="activeCategory === 'currency'" class="card">
          <div class="card-header">
            <h2>Currencies</h2>
          </div>
          <div class="card-body">
            <p class="text-muted">Base currency: <strong>{{ form.currency }}</strong></p>
            <label class="toggle-row">
              <input type="checkbox" v-model="form.enable_multi_currency" :true-value="1" :false-value="0" />
              <span>Enable Multi-Currency</span>
            </label>
            <label class="toggle-row" v-if="form.enable_multi_currency">
              <input type="checkbox" v-model="form.auto_update_rates" :true-value="1" :false-value="0" />
              <span>Auto-update Exchange Rates from API</span>
            </label>
            <div class="form-group" v-if="form.enable_multi_currency">
              <label>Exchange Rate Update Frequency</label>
              <select v-model="form.exchange_rate_update_frequency" class="input">
                <option value="Manual">Manual</option>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>

            <div v-if="form.enable_multi_currency && currencies.length" style="margin-top:1rem">
              <h3>Exchange Rates</h3>
              <table class="mini-table">
                <thead>
                  <tr><th>Currency</th><th>Rate</th><th>Date</th><th></th></tr>
                </thead>
                <tbody>
                  <tr v-for="(row, i) in exchangeRates" :key="i">
                    <td>
                      <select v-model="row.currency" class="input" style="width:100%">
                        <option v-for="c in currencyOptions" :key="c.name" :value="c.name">{{ c.name }} - {{ c.currency_name }}</option>
                      </select>
                    </td>
                    <td><input v-model.number="row.exchange_rate" class="input" type="number" step="0.0001" style="width:120px" /></td>
                    <td><input v-model="row.date" class="input" type="date" style="width:140px" /></td>
                    <td><button class="btn btn-sm btn-danger" @click="removeExchangeRate(i)" v-if="!row.name">×</button></td>
                  </tr>
                </tbody>
              </table>
              <button class="btn btn-sm" @click="addExchangeRate">+ Add Rate</button>
              <button class="btn btn-primary btn-sm" @click="saveExchangeRates" :disabled="savingExRates" style="margin-left:0.5rem">
                {{ savingExRates ? 'Saving...' : 'Save Rates' }}
              </button>
            </div>
          </div>
        </div>

        <div v-if="activeCategory === 'lock'" class="card">
          <div class="card-header"><h2>Lock Date</h2></div>
          <div class="card-body">
            <p class="text-muted">Prevent editing of transactions before this date.</p>
            <div class="form-group">
              <label>Lock Date</label>
              <input v-model="form.lock_date" class="input" type="date" />
            </div>
          </div>
        </div>

        <div v-if="activeCategory === 'sales'" class="card">
          <div class="card-header"><h2>Sales Settings</h2></div>
          <div class="card-body">
            <div class="form-group">
              <label>Default Sales Account</label>
              <select v-model="form.default_sales_account" class="input">
                <option value="">Auto-detect</option>
                <option v-for="a in accounts" :key="a.name" :value="a.name">{{ a.account_name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Default Accounts Receivable</label>
              <select v-model="form.default_ar_account" class="input">
                <option value="">Auto-detect</option>
                <option v-for="a in accounts" :key="a.name" :value="a.name">{{ a.account_name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Default Customer Payment Terms</label>
              <input v-model="form.default_customer_terms" class="input" placeholder="e.g. Net 30" />
            </div>
            <label class="toggle-row">
              <input type="checkbox" v-model="form.auto_apply_late_fees" :true-value="1" :false-value="0" />
              <span>Auto-apply late payment fees</span>
            </label>
          </div>
        </div>

        <div v-if="activeCategory === 'purchases'" class="card">
          <div class="card-header"><h2>Purchases Settings</h2></div>
          <div class="card-body">
            <div class="form-group">
              <label>Default Purchase Account</label>
              <select v-model="form.default_purchase_account" class="input">
                <option value="">Auto-detect</option>
                <option v-for="a in accounts" :key="a.name" :value="a.name">{{ a.account_name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Default Accounts Payable</label>
              <select v-model="form.default_ap_account" class="input">
                <option value="">Auto-detect</option>
                <option v-for="a in accounts" :key="a.name" :value="a.name">{{ a.account_name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Default Supplier Payment Terms</label>
              <input v-model="form.default_supplier_terms" class="input" placeholder="e.g. Net 30" />
            </div>
          </div>
        </div>

        <div v-if="activeCategory === 'inventory'" class="card">
          <div class="card-header"><h2>Inventory Settings</h2></div>
          <div class="card-body">
            <div class="form-row">
              <div class="form-group">
                <label>Default Stock Account</label>
                <select v-model="form.default_stock_account" class="input">
                  <option value="">Auto-detect</option>
                  <option v-for="a in accounts" :key="a.name" :value="a.name">{{ a.account_name }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>Costing Method</label>
                <select v-model="form.costing_method" class="input">
                  <option value="FIFO">FIFO</option>
                  <option value="Average Cost">Average Cost</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label>Default Cost of Goods Sold Account</label>
              <select v-model="form.default_cogs_account" class="input">
                <option value="">Auto-detect</option>
                <option v-for="a in accounts" :key="a.name" :value="a.name">{{ a.account_name }}</option>
              </select>
            </div>
          </div>
        </div>

        <div v-if="activeCategory === 'payroll'" class="card">
          <div class="card-header"><h2>Payroll Settings</h2></div>
          <div class="card-body">
            <div class="form-group">
              <label>Default Salary Expense Account</label>
              <select v-model="form.default_salary_account" class="input">
                <option value="">Auto-detect</option>
                <option v-for="a in accounts" :key="a.name" :value="a.name">{{ a.account_name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Default Employee Clearing Account</label>
              <select v-model="form.default_employee_clearing" class="input">
                <option value="">Auto-detect</option>
                <option v-for="a in accounts" :key="a.name" :value="a.name">{{ a.account_name }}</option>
              </select>
            </div>
            <label class="toggle-row">
              <input type="checkbox" v-model="form.auto_generate_payslips" :true-value="1" :false-value="0" />
              <span>Auto-generate monthly payslips</span>
            </label>
          </div>
        </div>

        <div v-if="activeCategory === 'custom_fields'" class="card">
          <div class="card-header"><h2>Custom Fields</h2></div>
          <div class="card-body">
            <p class="text-muted">Add custom fields to any document type. Fields appear on the edit form.</p>
            <div class="inline-form">
              <select v-model="cfTarget" class="input">
                <option value="">Select doctype</option>
                <option v-for="dt in cfDoctypes" :key="dt" :value="dt">{{ dt }}</option>
              </select>
              <input v-model="cfLabel" class="input" placeholder="Field Label e.g. Reference No" />
              <input v-model="cfName" class="input" placeholder="Field Name (snake_case)" />
              <select v-model="cfType" class="input">
                <option value="Data">Text</option>
                <option value="Currency">Number</option>
                <option value="Date">Date</option>
                <option value="Check">Checkbox</option>
                <option value="Select">Dropdown</option>
                <option value="Text">Multi-line Text</option>
              </select>
              <input v-if="cfType === 'Select'" v-model="cfOptions" class="input" placeholder="Option1,Option2,Option3" />
              <button class="btn btn-primary btn-sm" @click="addCustomField">+ Add Field</button>
            </div>
            <table class="mini-table" v-if="customFieldDefs.length">
              <thead>
                <tr><th>Doctype</th><th>Label</th><th>Name</th><th>Type</th><th>Active</th><th></th></tr>
              </thead>
              <tbody>
                <tr v-for="cf in customFieldDefs" :key="cf.name">
                  <td>{{ cf.target_doctype }}</td>
                  <td>{{ cf.field_label }}</td>
                  <td>{{ cf.field_name }}</td>
                  <td>{{ cf.field_type }}</td>
                  <td>{{ cf.is_active ? 'Yes' : 'No' }}</td>
                  <td><button class="btn btn-sm btn-danger-outline" @click="toggleCustomField(cf.name, !cf.is_active)">{{ cf.is_active ? 'Deactivate' : 'Activate' }}</button></td>
                </tr>
              </tbody>
            </table>
            <div v-else class="text-muted">No custom fields defined.</div>
          </div>
        </div>

        <div v-if="activeCategory === 'modules'" class="card">
          <div class="card-header"><h2>Modules</h2></div>
          <div class="card-body">
            <p class="text-muted">Enable or disable modules.</p>
            <div class="module-toggles">
              <label v-for="mod in modules" :key="mod.key" class="toggle-row">
                <input type="checkbox" v-model="form[mod.key]" :true-value="1" :false-value="0" />
                <span>{{ mod.label }}</span>
              </label>
            </div>
          </div>
        </div>

        <div v-if="activeCategory === 'coa'" class="card">
          <div class="card-header"><h2>Chart of Accounts</h2></div>
          <div class="card-body">
            <p class="text-muted">Import the standard Manager.io chart of accounts.</p>
            <div v-if="form.chart_of_accounts_imported" class="import-status imported">Chart of Accounts has been imported</div>
            <button v-else class="btn btn-primary" @click="importCoA" :disabled="importing">{{ importing ? 'Importing...' : 'Import Chart of Accounts' }}</button>
            <div v-if="importResult" class="import-result">Created {{ importResult.count }} accounts</div>
          </div>
        </div>

        <div v-if="activeCategory === 'users'" class="card">
          <div class="card-header"><h2>User Permissions</h2></div>
          <div class="card-body">
            <p class="text-muted">User management is handled through Frappe Desk.</p>
            <a :href="frappeUrl + '/app/user'" target="_blank" class="btn btn-primary">Manage Users in Frappe Desk</a>
          </div>
        </div>

        <div v-if="activeCategory !== 'business' && activeCategory !== 'format' && activeCategory !== 'accounting' && activeCategory !== 'tax' && activeCategory !== 'currency' && activeCategory !== 'lock' && activeCategory !== 'modules' && activeCategory !== 'coa' && activeCategory !== 'users'" class="card">
          <div class="card-header"><h2>{{ getActiveLabel }}</h2></div>
          <div class="card-body">
            <p class="text-muted">Coming soon.</p>
          </div>
        </div>

        <div class="save-bar" v-if="showSave">
          <button class="btn btn-primary" @click="save" :disabled="saving">{{ saving ? 'Saving...' : 'Save Settings' }}</button>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, inject } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { frappeCall } from '@/api/frappe'

const toast = inject('toast')

const store = useSettingsStore()
const form = reactive({ ...store.settings })
const importing = ref(false)
const importResult = ref(null)
const saving = ref(false)
const activeCategory = ref('business')
const showAddTax = ref(false)
const taxCodes = ref([])
const newTax = reactive({ code: '', name: '', rate: 0, type: '' })

const frappeUrl = import.meta.env.VITE_FRAPPE_API_URL || 'https://manager.galaxylabs.online'

const categories = [
  { key: 'business', label: 'Business Details' },
  { key: 'format', label: 'Date, Time & Number Format' },
  { key: 'accounting', label: 'Accounting Method' },
  { key: 'coa', label: 'Chart of Accounts' },
  { key: 'tax', label: 'Tax Codes' },
  { key: 'currency', label: 'Currencies' },
  { key: 'lock', label: 'Lock Date' },
  { key: 'sales', label: 'Sales' },
  { key: 'purchases', label: 'Purchases' },
  { key: 'inventory', label: 'Inventory' },
  { key: 'payroll', label: 'Payroll' },
  { key: 'modules', label: 'Modules' },
  { key: 'users', label: 'User Permissions' },
  { key: 'custom_fields', label: 'Custom Fields' },
]

const currencies = ['USD', 'EUR', 'GBP', 'PKR', 'INR', 'AED']
const dateFormats = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']
const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
const weekDays = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const languages = ['English (US)', 'English (UK)', 'Arabic', 'Urdu', 'French', 'Spanish', 'German', 'Chinese']
const numberFormats = ['1,234,567.89 (US)', '1.234.567,89 (EU)', '1 234 567.89 (UK)', '1,234,567.89 (PK)']
const modules = [
  { key: 'module_sales', label: 'Sales' },
  { key: 'module_purchases', label: 'Purchases' },
  { key: 'module_banking', label: 'Banking' },
  { key: 'module_inventory', label: 'Inventory' },
  { key: 'module_payroll', label: 'Payroll' },
  { key: 'module_fixed_assets', label: 'Fixed Assets' },
  { key: 'module_accounting', label: 'Accounting' },
]

const getActiveLabel = computed(() => categories.find(c => c.key === activeCategory.value)?.label || activeCategory.value)

const showSave = computed(() => ['business', 'format', 'accounting', 'currency', 'lock', 'modules', 'sales', 'purchases', 'inventory', 'payroll'].includes(activeCategory.value))

const accounts = ref([])
const customFieldDefs = ref([])

const exchangeRates = ref([])
const savingExRates = ref(false)
const currencyOptions = ref([])

async function loadExchangeRates() {
  try {
    const res = await frappeCall('manager.api.list_exchange_rates', {})
    exchangeRates.value = (res.message || []).map(r => ({ ...r, _dirty: false }))
  } catch { exchangeRates.value = [] }
}

async function loadCurrencyOptions() {
  try {
    const res = await frappeCall('manager.api.list_currencies', {})
    currencyOptions.value = res.message || []
  } catch { currencyOptions.value = [] }
}

function addExchangeRate() {
  exchangeRates.value.push({ currency: '', base_currency: form.currency, exchange_rate: 1.0, date: new Date().toISOString().slice(0,10), _new: true })
}

function removeExchangeRate(i) {
  exchangeRates.value.splice(i, 1)
}

async function saveExchangeRates() {
  savingExRates.value = true
  try {
    for (const row of exchangeRates.value) {
      if (row._new && row.currency) {
        await frappeCall('manager.api.save_exchange_rate', { data: { currency: row.currency, base_currency: form.currency, exchange_rate: row.exchange_rate, date: row.date } })
      }
    }
    toast.success('Exchange rates saved')
    await loadExchangeRates()
  } catch (e) {
    toast.error('Failed to save exchange rates')
  }
  savingExRates.value = false
}
const cfTarget = ref('')
const cfLabel = ref('')
const cfName = ref('')
const cfType = ref('Data')
const cfOptions = ref('')
const cfDoctypes = ['Sales Invoice', 'Purchase Invoice', 'Receipt', 'Payment', 'Sales Order', 'Purchase Order', 'Journal Entry', 'Customer', 'Supplier', 'Item', 'Employee', 'Fixed Asset', 'Delivery Note', 'Credit Note', 'Debit Note']

async function loadAccounts() {
  try {
    const res = await frappeCall('frappe.client.get_list', { doctype: 'Account', fields: ['name', 'account_name'], limit_page_length: 200 })
    accounts.value = res.message || []
  } catch { accounts.value = [] }
}

async function loadCustomFields() {
  try {
    const res = await frappeCall('frappe.client.get_list', { doctype: 'Custom Field Def', fields: ['name', 'field_label', 'field_name', 'field_type', 'target_doctype', 'is_active', 'options'], limit_page_length: 200 })
    customFieldDefs.value = res.message || []
  } catch { customFieldDefs.value = [] }
}

async function addCustomField() {
  if (!cfTarget.value || !cfLabel.value || !cfName.value) { toast.warning('Fill in all required fields'); return }
  const opts = cfType.value === 'Select' && cfOptions.value ? cfOptions.value : ''
  try {
    await frappeCall('manager.api.create_doc', {
      doctype: 'Custom Field Def',
      field_label: cfLabel.value,
      field_name: cfName.value,
      field_type: cfType.value,
      target_doctype: cfTarget.value,
      is_active: 1,
      options: opts,
    })
    cfLabel.value = ''; cfName.value = ''; cfType.value = 'Data'; cfOptions.value = ''
    toast.success('Custom field added')
    await loadCustomFields()
  } catch (e) {
    toast.error(e.response?.data?.message || e.message)
  }
}

async function toggleCustomField(name, active) {
  try {
    await frappeCall('manager.api.update_doc', { doctype: 'Custom Field Def', name, is_active: active ? 1 : 0 })
    await loadCustomFields()
  } catch (e) {
    toast.error(e.response?.data?.message || e.message)
  }
}

async function loadTaxCodes() {
  try {
    const res = await frappeCall('frappe.client.get_list', { doctype: 'Tax Code', fields: ['name', 'tax_code', 'tax_name', 'rate', 'tax_type', 'is_active'], limit_page_length: 100 })
    taxCodes.value = res.message || []
  } catch (e) {
    taxCodes.value = []
  }
}

async function saveTaxCode() {
  if (!newTax.code || !newTax.name || !newTax.rate || !newTax.type) { toast.warning('Fill all fields'); return }
  try {
    await frappeCall('manager.api.create_doc', { doctype: 'Tax Code', tax_code: newTax.code, tax_name: newTax.name, rate: newTax.rate, tax_type: newTax.type, is_active: 1 })
    showAddTax.value = false
    newTax.code = ''; newTax.name = ''; newTax.rate = 0; newTax.type = ''
    await loadTaxCodes()
  } catch (e) {
    toast.error('Failed to save tax code: ' + (e.response?.data?.message || e.message))
  }
}

async function save() {
  saving.value = true
  try {
    await store.save({ ...form })
  } finally {
    saving.value = false
  }
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
  await loadTaxCodes()
  await loadAccounts()
  await loadCustomFields()
  await loadCurrencyOptions()
  await loadExchangeRates()
})
</script>

<style scoped>
.settings-layout { display: flex; gap: 1.5rem; align-items: flex-start; }
.settings-sidebar { width: 220px; flex-shrink: 0; background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; }
.sidebar-item { padding: 0.75rem 1rem; cursor: pointer; font-size: 14px; border-bottom: 1px solid #f0f0f0; transition: background 0.15s; }
.sidebar-item:hover { background: #f5f7fa; }
.sidebar-item.active { background: #e8f0fe; color: #1a73e8; font-weight: 600; }
.settings-content { flex: 1; min-width: 0; }
.form-row { display: flex; gap: 1rem; }
.form-row .form-group { flex: 1; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; font-weight: 600; margin-bottom: 0.25rem; font-size: 13px; color: #555; }
.form-group .input { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #d0d0d0; border-radius: 6px; font-size: 14px; box-sizing: border-box; }
.text-muted { color: #888; font-size: 13px; margin-bottom: 1rem; }
.module-toggles { display: flex; flex-direction: column; gap: 0.5rem; }
.toggle-row { display: flex; align-items: center; gap: 0.5rem; font-size: 14px; cursor: pointer; }
.inline-form { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem; align-items: flex-end; }
.inline-form .input { width: auto; min-width: 100px; padding: 0.4rem 0.6rem; font-size: 13px; }
.mini-table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 0.5rem; }
.mini-table th { background: #f5f5f5; padding: 6px 8px; text-align: left; border: 1px solid #e0e0e0; }
.mini-table td { padding: 6px 8px; border: 1px solid #e0e0e0; }
.import-status { padding: 0.75rem 1rem; border-radius: 6px; font-size: 14px; }
.import-status.imported { background: #e8f5e9; color: #27ae60; }
.import-result { margin-top: 0.5rem; font-size: 13px; color: #555; }
.save-bar { margin-top: 1.5rem; padding: 1rem 0; border-top: 1px solid #e0e0e0; }
.card-header { display: flex; align-items: center; justify-content: space-between; }
.btn-sm { padding: 0.3rem 0.75rem; font-size: 12px; }
</style>
