import { defineStore } from 'pinia'
import { frappeCall } from '@/api/frappe'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    loaded: false,
    settings: {
      company_name: 'My Company',
      company_address: '',
      company_email: '',
      company_phone: '',
      currency: 'USD',
      date_format: 'MM/DD/YYYY',
      fiscal_year_start: '',
      first_month_of_financial_year: 'January',
      module_sales: 1,
      module_purchases: 1,
      module_banking: 1,
      module_inventory: 1,
      module_payroll: 0,
      module_fixed_assets: 1,
      module_accounting: 1,
      chart_of_accounts_imported: 0,
    },
  }),
  getters: {
    isModuleEnabled: (state) => {
      const map = {
        'Sales': 'module_sales',
        'Purchases': 'module_purchases',
        'Banking': 'module_banking',
        'Inventory': 'module_inventory',
        'Payroll': 'module_payroll',
        'Fixed Assets': 'module_fixed_assets',
        'Accounting': 'module_accounting',
      }
      return (module) => state.settings[map[module]] !== 0
    },
  },
  actions: {
    async load() {
      try {
        const res = await frappeCall('manager.api.get_settings')
        if (res && res.message) {
          this.settings = { ...this.settings, ...res.message }
        }
        this.loaded = true
      } catch (e) {
        console.error('Failed to load settings:', e)
      }
    },
    async save(data) {
      const res = await frappeCall('manager.api.save_settings', { data })
      if (res && res.message) {
        this.settings = { ...this.settings, ...res.message.settings }
      }
      return res
    },
    async importChartOfAccounts() {
      return await frappeCall('manager.api.import_chart_of_accounts')
    },
  },
})
