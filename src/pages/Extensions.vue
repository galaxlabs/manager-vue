<template>
  <div class="page">
    <div class="page-header">
      <h1>Extensions</h1>
    </div>

    <div class="card">
      <div class="card-body">
        <label class="form-label">Country / Region</label>
        <select v-model="selectedCountry" class="input country-select" @change="onCountryChange">
          <option value="">-- Select Country --</option>
          <option v-for="c in countries" :key="c" :value="c">{{ c }}</option>
        </select>
        <p class="text-muted" v-if="selectedCountry">Account types and tax codes will auto-configure for {{ selectedCountry }}. You can customize them below.</p>
      </div>
    </div>

    <div v-if="selectedCountry && countryAccounts.length" class="card">
      <div class="card-header"><h2>Recommended Accounts for {{ selectedCountry }}</h2></div>
      <div class="card-body">
        <div v-for="(acct, i) in countryAccounts" :key="i" class="account-row">
          <div class="account-field"><label>Account Name</label><input v-model="acct.account_name" class="input input-sm" /></div>
          <div class="account-field"><label>Tax Code</label><input v-model="acct.tax_code" class="input input-sm" placeholder="Auto" /></div>
          <div class="account-field"><label>Rate %</label><input v-model.number="acct.rate" type="number" step="0.01" class="input input-sm" /></div>
          <div class="account-field"><label>Type</label>
            <select v-model="acct.account_type" class="input input-sm">
              <option value="Tax Payable">Tax Payable</option>
              <option value="Tax Receivable">Tax Receivable</option>
              <option value="Expense">Expense</option>
              <option value="Income">Income</option>
              <option value="Liability">Liability</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <div v-if="selectedCountry" class="card">
      <div class="card-header"><h2>Extensions for {{ selectedCountry }}</h2></div>
      <div class="card-body">
        <div v-for="ext in countryExtensions" :key="ext.key" class="ext-row" :class="{ enabled: ext.enabled }">
          <div class="ext-icon">{{ ext.icon }}</div>
          <div class="ext-info">
            <div class="ext-name">{{ ext.name }}</div>
            <div class="ext-desc">{{ ext.desc }}</div>
          </div>
          <label class="switch">
            <input type="checkbox" v-model="ext.enabled" />
            <span class="slider"></span>
          </label>
        </div>
        <div v-if="!countryExtensions.length" class="text-muted">No country-specific extensions.</div>
      </div>
    </div>

    <div class="card">
      <div class="card-header"><h2>Global Extensions</h2></div>
      <div class="card-body">
        <div v-for="ext in globalExtensions" :key="ext.key" class="ext-row" :class="{ enabled: ext.enabled }">
          <div class="ext-icon">{{ ext.icon }}</div>
          <div class="ext-info">
            <div class="ext-name">{{ ext.name }}</div>
            <div class="ext-desc">{{ ext.desc }}</div>
          </div>
          <label class="switch">
            <input type="checkbox" v-model="ext.enabled" />
            <span class="slider"></span>
          </label>
        </div>
      </div>
    </div>

    <button class="btn btn-primary" @click="saveAll" :disabled="saving">{{ saving ? 'Saving...' : 'Save All' }}</button>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { frappeCall } from '@/api/frappe'

const saving = ref(false)
const selectedCountry = ref('')
const countries = [
  'Australia', 'Bahrain', 'Egypt', 'Ghana', 'Ireland', 'Jordan',
  'Malaysia', 'Mauritius', 'New Zealand', 'Nigeria', 'Oman',
  'Pakistan', 'Saudi Arabia', 'South Africa', 'United Arab Emirates',
  'United Kingdom', 'United States',
]

const defaultCountryAccounts = {
  'Pakistan': [
    { account_name: 'Sales Tax Payable', tax_code: 'ST-SALE', rate: 10, account_type: 'Tax Payable' },
    { account_name: 'Income Tax Payable', tax_code: 'IT-PAY', rate: 15, account_type: 'Tax Payable' },
    { account_name: 'Federal Excise Duty', tax_code: 'FED', rate: 5, account_type: 'Tax Payable' },
  ],
  'United Arab Emirates': [
    { account_name: 'VAT Output (5%)', tax_code: 'VAT-OUT', rate: 5, account_type: 'Tax Payable' },
    { account_name: 'VAT Input (5%)', tax_code: 'VAT-IN', rate: 5, account_type: 'Tax Receivable' },
  ],
  'Saudi Arabia': [
    { account_name: 'VAT Output (15%)', tax_code: 'VAT-OUT', rate: 15, account_type: 'Tax Payable' },
    { account_name: 'VAT Input (15%)', tax_code: 'VAT-IN', rate: 15, account_type: 'Tax Receivable' },
    { account_name: 'ZATCA E-Invoice Settings', tax_code: 'ZATCA', rate: 0, account_type: 'Other' },
  ],
  'United Kingdom': [
    { account_name: 'VAT Output (20%)', tax_code: 'VAT-OUT', rate: 20, account_type: 'Tax Payable' },
    { account_name: 'VAT Input (20%)', tax_code: 'VAT-IN', rate: 20, account_type: 'Tax Receivable' },
  ],
  'Australia': [
    { account_name: 'GST Collected (10%)', tax_code: 'GST-OUT', rate: 10, account_type: 'Tax Payable' },
    { account_name: 'GST Paid (10%)', tax_code: 'GST-IN', rate: 10, account_type: 'Tax Receivable' },
    { account_name: 'Payroll Tax Payable', tax_code: 'PAYG', rate: 0, account_type: 'Tax Payable' },
  ],
  'Egypt': [
    { account_name: 'VAT Output (14%)', tax_code: 'VAT-OUT', rate: 14, account_type: 'Tax Payable' },
    { account_name: 'VAT Input (14%)', tax_code: 'VAT-IN', rate: 14, account_type: 'Tax Receivable' },
  ],
  'Bahrain': [
    { account_name: 'VAT Output (10%)', tax_code: 'VAT-OUT', rate: 10, account_type: 'Tax Payable' },
    { account_name: 'VAT Input (10%)', tax_code: 'VAT-IN', rate: 10, account_type: 'Tax Receivable' },
  ],
  'Ghana': [
    { account_name: 'VAT Output (15%)', tax_code: 'VAT-OUT', rate: 15, account_type: 'Tax Payable' },
    { account_name: 'NHIL', tax_code: 'NHIL', rate: 2.5, account_type: 'Tax Payable' },
    { account_name: 'COVID-19 Levy', tax_code: 'COVID', rate: 1, account_type: 'Tax Payable' },
  ],
  'Ireland': [
    { account_name: 'VAT Output (23%)', tax_code: 'VAT-OUT', rate: 23, account_type: 'Tax Payable' },
    { account_name: 'VAT Input (23%)', tax_code: 'VAT-IN', rate: 23, account_type: 'Tax Receivable' },
  ],
  'Jordan': [
    { account_name: 'Sales Tax Output', tax_code: 'ST-OUT', rate: 16, account_type: 'Tax Payable' },
    { account_name: 'Sales Tax Input', tax_code: 'ST-IN', rate: 16, account_type: 'Tax Receivable' },
  ],
  'Malaysia': [
    { account_name: 'SST Output', tax_code: 'SST-OUT', rate: 10, account_type: 'Tax Payable' },
    { account_name: 'SST Input', tax_code: 'SST-IN', rate: 10, account_type: 'Tax Receivable' },
  ],
  'Mauritius': [
    { account_name: 'VAT Output (15%)', tax_code: 'VAT-OUT', rate: 15, account_type: 'Tax Payable' },
    { account_name: 'VAT Input (15%)', tax_code: 'VAT-IN', rate: 15, account_type: 'Tax Receivable' },
  ],
  'New Zealand': [
    { account_name: 'GST Output (15%)', tax_code: 'GST-OUT', rate: 15, account_type: 'Tax Payable' },
    { account_name: 'GST Input (15%)', tax_code: 'GST-IN', rate: 15, account_type: 'Tax Receivable' },
  ],
  'Nigeria': [
    { account_name: 'VAT Output (7.5%)', tax_code: 'VAT-OUT', rate: 7.5, account_type: 'Tax Payable' },
    { account_name: 'CIT Payable', tax_code: 'CIT', rate: 30, account_type: 'Tax Payable' },
  ],
  'Oman': [
    { account_name: 'VAT Output (5%)', tax_code: 'VAT-OUT', rate: 5, account_type: 'Tax Payable' },
    { account_name: 'VAT Input (5%)', tax_code: 'VAT-IN', rate: 5, account_type: 'Tax Receivable' },
  ],
  'South Africa': [
    { account_name: 'VAT Output (15%)', tax_code: 'VAT-OUT', rate: 15, account_type: 'Tax Payable' },
    { account_name: 'VAT Input (15%)', tax_code: 'VAT-IN', rate: 15, account_type: 'Tax Receivable' },
    { account_name: 'PAYE Payable', tax_code: 'PAYE', rate: 0, account_type: 'Tax Payable' },
  ],
  'United States': [
    { account_name: 'Sales Tax Payable', tax_code: 'SALES-TAX', rate: 0, account_type: 'Tax Payable' },
  ],
}

const countryExtensionMap = {
  'Australia': [
    { key: 'aussie_bank_feeds', name: 'Aussie Bank Feeds', desc: 'Connect Australian bank accounts for auto-fed transactions.', icon: '🏦' },
    { key: 'bas_payroll_gst', name: 'BAS, Payroll & GST Codes', desc: 'Business Activity Statement, payroll reporting and GST codes.', icon: '🧾' },
  ],
  'Bahrain': [
    { key: 'bahrain_vat', name: 'VAT Returns & VAT Codes', desc: 'Bahrain VAT return filing and VAT code management.', icon: '🧾' },
  ],
  'Egypt': [
    { key: 'egypt_einvoice', name: 'Egypt eInvoice', desc: 'Integration with Egypt\'s e-invoicing system.', icon: '📄' },
  ],
  'Ghana': [
    { key: 'ghana_vat', name: 'VAT, NHIL & Related Returns', desc: 'Ghana VAT, NHIL, COVID-19 levy returns.', icon: '🧾' },
  ],
  'Ireland': [
    { key: 'ireland_vat', name: 'VAT3, RTD & VAT Codes', desc: 'Irish VAT3 return, Real-Time Reporting and VAT codes.', icon: '🧾' },
  ],
  'Jordan': [
    { key: 'jordan_einvoice', name: 'Jofotara GO E-Invoicing', desc: 'Integration with Jordan\'s Jofotara e-invoicing platform.', icon: '📄' },
  ],
  'Malaysia': [
    { key: 'malaysia_myinvois', name: 'Malaysia MyInvois', desc: 'Integration with Malaysia\'s MyInvois e-invoicing system.', icon: '📄' },
  ],
  'Mauritius': [
    { key: 'mauritius_einvoicing', name: 'MRA Go! E-Invoicing', desc: 'Integration with Mauritius Revenue Authority e-invoicing.', icon: '📄' },
  ],
  'New Zealand': [
    { key: 'nz_gst', name: 'GST Return & GST Codes', desc: 'New Zealand GST return filing and GST code management.', icon: '🧾' },
  ],
  'Nigeria': [
    { key: 'nigeria_einvoice', name: 'FIRS Go! E-Invoicing', desc: 'Integration with Nigeria\'s FIRS e-invoicing system.', icon: '📄' },
  ],
  'Oman': [
    { key: 'oman_vat', name: 'VAT Return & VAT Codes', desc: 'Oman VAT return filing and VAT code management.', icon: '🧾' },
  ],
  'Pakistan': [
    { key: 'pakistan_fbr', name: 'Pakistan FBR', desc: 'Integration with Pakistan\'s FBR sales tax and income tax systems.', icon: '🧾' },
  ],
  'Saudi Arabia': [
    { key: 'saudi_vat', name: 'VAT Return & VAT Codes', desc: 'Saudi VAT return filing and VAT code management.', icon: '🧾' },
    { key: 'zatca_einvoice', name: 'ZATCA E-Invoice', desc: 'Integration with Saudi Arabia\'s ZATCA e-invoicing platform.', icon: '📄' },
  ],
  'South Africa': [
    { key: 'sa_vat', name: 'VAT201, IRP5 & Tax Codes', desc: 'South Africa VAT201 returns, IRP5 certificates and tax codes.', icon: '🧾' },
  ],
  'United Arab Emirates': [
    { key: 'uae_vat', name: 'VAT201 & VAT Codes', desc: 'UAE VAT return filing and VAT code management.', icon: '🧾' },
  ],
  'United Kingdom': [
    { key: 'uk_vat', name: 'VAT Worksheet & VAT Codes', desc: 'UK VAT return worksheet and VAT code management.', icon: '🧾' },
  ],
}

const globalExtensionsList = [
  { key: 'chart_of_accounts_builder', name: 'Chart of Accounts Builder', desc: 'Customize and build your chart of accounts structure.', icon: '📊' },
  { key: 'custom_themes', name: 'Custom Themes', desc: 'Personalize the look and feel with custom themes.', icon: '🎨' },
  { key: 'replicator', name: 'Replicator', desc: 'Replicate data between Manager.io instances.', icon: '🔁' },
  { key: 'dev_extension', name: 'Dev Extension', desc: 'Developer tools for extending Manager.io functionality.', icon: '⚙️' },
]

const countryAccounts = ref([])
const countryExtensions = ref([])
const globalExtensions = ref([])

function onCountryChange() {
  const defaults = defaultCountryAccounts[selectedCountry.value] || []
  countryAccounts.value = defaults.map(a => ({ ...a }))
  countryExtensions.value = (countryExtensionMap[selectedCountry.value] || []).map(e => ({
    ...e,
    enabled: false,
  }))
}

async function saveAll() {
  saving.value = true
  try {
    const extData = {}
    globalExtensions.value.forEach(e => { extData[e.key] = e.enabled ? 1 : 0 })
    countryExtensions.value.forEach(e => { extData[e.key] = e.enabled ? 1 : 0 })

    await frappeCall('manager.api.save_settings', {
      country: selectedCountry.value,
      extensions: JSON.stringify({
        accounts: countryAccounts.value,
        global: extData,
      }),
    })
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    const res = await frappeCall('manager.api.get_settings')
    const settings = res.message || {}
    selectedCountry.value = settings.country || ''
    countryAccounts.value = []
    countryExtensions.value = []

    let parsed = null
    if (settings.extensions) {
      try {
        parsed = typeof settings.extensions === 'string' ? JSON.parse(settings.extensions) : settings.extensions
        if (parsed.accounts) countryAccounts.value = parsed.accounts
        if (parsed.global) {
          const extState = parsed.global
          globalExtensions.value = globalExtensionsList.map(e => ({
            ...e,
            enabled: extState[e.key] === 1,
          }))
        }
      } catch {}
    }
    if (!globalExtensions.value.length) {
      globalExtensions.value = globalExtensionsList.map(e => ({ ...e, enabled: false }))
    }

    if (selectedCountry.value) {
      const defaults = defaultCountryAccounts[selectedCountry.value] || []
      if (!countryAccounts.value.length) {
        countryAccounts.value = defaults.map(a => ({ ...a }))
      }
      const countryKey = selectedCountry.value.toLowerCase().replace(/[^a-z]/g, '_')
      const savedCountryState = parsed ? parsed[countryKey] : null
      countryExtensions.value = (countryExtensionMap[selectedCountry.value] || []).map(e => ({
        ...e,
        enabled: savedCountryState ? savedCountryState.is_active === true : false,
      }))
    }
  } catch {
    globalExtensions.value = globalExtensionsList.map(e => ({ ...e, enabled: false }))
  }
})
</script>

<style scoped>
.card { background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; margin-bottom: 1rem; overflow: hidden; }
.card-header { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; border-bottom: 1px solid #f0f0f0; }
.card-header h2 { font-size: 15px; font-weight: 700; margin: 0; }
.card-body { padding: 1rem; }
.form-label { display: block; font-weight: 600; margin-bottom: 0.4rem; font-size: 13px; color: #555; }
.country-select { max-width: 350px; }
.text-muted { font-size: 13px; color: #888; margin-top: 0.4rem; }
.account-row { display: flex; gap: 0.75rem; padding: 0.5rem 0; border-bottom: 1px solid #f5f5f5; flex-wrap: wrap; }
.account-row:last-child { border-bottom: none; }
.account-field { flex: 1; min-width: 120px; }
.account-field label { display: block; font-size: 11px; color: #888; margin-bottom: 2px; }
.input-sm { width: 100%; padding: 0.35rem 0.5rem; border: 1px solid #d0d0d0; border-radius: 5px; font-size: 13px; box-sizing: border-box; }
.ext-row { display: flex; align-items: center; gap: 0.75rem; padding: 0.6rem 0; border-bottom: 1px solid #f5f5f5; }
.ext-row:last-child { border-bottom: none; }
.ext-row.enabled { background: #f0faf3; margin: 0 -1rem; padding: 0.6rem 1rem; border-radius: 6px; }
.ext-icon { font-size: 24px; width: 36px; text-align: center; flex-shrink: 0; }
.ext-info { flex: 1; min-width: 0; }
.ext-name { font-weight: 600; font-size: 14px; }
.ext-desc { font-size: 12px; color: #666; }
.switch { position: relative; display: inline-block; width: 36px; height: 20px; flex-shrink: 0; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; inset: 0; background: #ccc; border-radius: 20px; transition: 0.3s; }
.slider:before { content: ''; position: absolute; height: 16px; width: 16px; left: 2px; bottom: 2px; background: #fff; border-radius: 50%; transition: 0.3s; }
input:checked + .slider { background: #34a853; }
input:checked + .slider:before { transform: translateX(16px); }
</style>
