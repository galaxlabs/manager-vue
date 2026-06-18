import { defineStore } from 'pinia'
import api from '@/api/frappe'

const STORAGE_KEY = 'manager_auth'

function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function saveStored(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function clearStored() {
  localStorage.removeItem(STORAGE_KEY)
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    business: null,
    businesses: [],
    api_key: null,
    api_secret: null,
    permissions: {},
    userRole: null,
    checked: false,
    stored: loadStored(),
  }),
  getters: {
    isLoggedIn: (state) => !!(state.user || state.api_key || state.stored?.api_key || import.meta.env.VITE_FRAPPE_API_KEY),
    displayUser: (state) => state.user || state.stored?.user || state.stored?.api_key || 'Guest',
    sessionKey: (state) => state.api_key || state.stored?.api_key || import.meta.env.VITE_FRAPPE_API_KEY || '',
    sessionSecret: (state) => state.api_secret || state.stored?.api_secret || import.meta.env.VITE_FRAPPE_API_SECRET || '',
    token: (state) => {
      const key = state.api_key || state.stored?.api_key || import.meta.env.VITE_FRAPPE_API_KEY || ''
      const secret = state.api_secret || state.stored?.api_secret || import.meta.env.VITE_FRAPPE_API_SECRET || ''
      return key && secret ? `${key}:${secret}` : null
    },
  },
  actions: {
    async loadBusinesses() {
      try {
        const res = await api.get('manager.api.get_user_businesses')
        this.businesses = res.data?.message || []
        if (!this.business && this.businesses.length) {
          this.business = this.businesses[0]
        }
      } catch { this.businesses = [] }
    },

    async loadBusiness() {
      if (this.businesses.length) return this.business
      await this.loadBusinesses()
      return this.business
    },

    async loadPermissions() {
      try {
        const res = await api.get('manager.api.get_user_permissions')
        const data = res.data?.message || {}
        this.permissions = data.permissions || {}
        this.userRole = data.role || null
        if (data.full_name) this.user = data.full_name
      } catch { this.permissions = {} }
    },

    can(doctype, action = 'read') {
      return this.permissions[doctype]?.[action] === 1
    },

    async login(usr, pwd) {
      const res = await api.post('manager.api.login_with_api_key', { usr, pwd })
      const data = res.data?.message || {}
      this.user = data.user
      this.business = data.business
      this.loadBusinesses()
      this.loadPermissions()
      if (data.api_secret) {
        this.api_key = data.api_key
        this.api_secret = data.api_secret
        saveStored({ user: data.user, api_key: data.api_key, api_secret: data.api_secret })
      } else {
        this.api_key = data.api_key
        this.api_secret = this.stored?.api_secret || import.meta.env.VITE_FRAPPE_API_SECRET || null
      }
      this.checked = true
      return data
    },
    async logout() {
      try { await api.post('logout') } catch {}
      this.user = null
      this.business = null
      this.businesses = []
      this.api_key = null
      this.api_secret = null
      this.checked = false
      clearStored()
    },
    async checkSession() {
      if (this.checked) return this.isLoggedIn
      // Check env API keys first
      if (import.meta.env.VITE_FRAPPE_API_KEY) {
        this.checked = true
        try {
          const res = await api.get('manager.api.get_user_info')
          this.user = res.data?.message?.user || 'Admin'
          this.business = res.data?.message?.business || null
          this.loadBusinesses()
          this.loadPermissions()
        } catch {}
        return true
      }
      // Check stored credentials
      const stored = this.stored
      if (stored?.api_key && stored?.api_secret) {
        this.api_key = stored.api_key
        this.api_secret = stored.api_secret
        this.checked = true
        return true
      }
      this.checked = true
      return false
    },
    clear() {
      this.user = null
      this.business = null
      this.api_key = null
      this.api_secret = null
      this.checked = false
      clearStored()
    },
  },
})
