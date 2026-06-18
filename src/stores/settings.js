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
      first_month_of_financial_year: 'January',
      language: 'English (US)',
      time_format: '12-hour (1:30 PM)',
      first_day_of_week: 'Monday',
      number_format: '1,234,567.89 (US)',
      number_decimal: '. (dot)',
      number_group: ', (comma)',
      accounting_method: 'Accrual',
      reporting_period: 'Monthly',
      enable_multi_currency: 0,
      exchange_rate_update_frequency: 'Manual',
      auto_update_rates: 0,
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
    isTabVisible: (state) => {
      return (tabId) => {
        if (!state.settings.sidebar_config) return true
        let cfg = state.settings.sidebar_config
        if (typeof cfg === 'string') {
          try { cfg = JSON.parse(cfg) } catch { return true }
        }
        return cfg[tabId] !== false
      }
    },
  },
  actions: {
    async load() {
      try {
        const res = await frappeCall('manager.api.get_settings')
        if (res && res.message) {
          this.settings = { ...this.settings, ...res.message }
          this.loaded = true
        }
      } catch (e) {
        console.error('Failed to load settings:', e)
      }
    },
    async save(data) {
      const res = await frappeCall('manager.api.save_settings', { ...data })
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
