import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const API_URL = import.meta.env.VITE_FRAPPE_API_URL || ''

const api = axios.create({
  baseURL: `${API_URL}/api/method/`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const auth = useAuthStore()
    const defaultAuth = (api.defaults.headers.common['Authorization'] || '').replace('token ', '')
    const sep = defaultAuth.indexOf(':')
    const defaultKey = sep >= 0 ? defaultAuth.substring(0, sep) : defaultAuth
    const defaultSecret = sep >= 0 ? defaultAuth.substring(sep + 1) : ''
    const key = auth.api_key || defaultKey || import.meta.env.VITE_FRAPPE_API_KEY || ''
    const secret = auth.api_secret || defaultSecret || import.meta.env.VITE_FRAPPE_API_SECRET || ''
    if (key && secret) {
      config.headers.Authorization = `token ${key}:${secret}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403 && error.response?.data?.exc_type === 'AuthenticationError') {
      const auth = useAuthStore()
      auth.clear()
    }
    return Promise.reject(error)
  }
)

export function frappeCall(method, params = {}) {
  return api.post(method, params).then((r) => {
    const data = r.data
    if (data._server_messages) {
      try {
        const msgs = JSON.parse(data._server_messages)
        const errors = msgs.filter(m => {
          try { const p = JSON.parse(m); return p.indicator === 'red' || p.raise_exception } catch { return false }
        })
        if (errors.length) {
          console.warn('[API]', errors[0].message || errors[0])
        }
      } catch {}
      delete data._server_messages
    }
    return data
  })
}

export function frappeGet(path, params = {}) {
  return api.get(path, { params }).then((r) => r.data)
}

export function createDoc(doctype, data) {
  return frappeCall('frappe.client.insert', { doc: { doctype, ...data } })
}

export function getDoc(doctype, name) {
  return frappeCall('frappe.client.get', { doctype, name })
}

export function updateDoc(doctype, name, data) {
  return frappeCall('frappe.client.set_value', { doctype, name, fieldname: data })
}

export function deleteDoc(doctype, name) {
  return frappeCall('frappe.client.delete', { doctype, name })
}

export function getList(doctype, filters = {}, fields = ['*'], limit = 100, offset = 0, orderBy = 'modified desc', search = '') {
  return frappeCall('manager.api.get_list_filtered', { doctype, fields: JSON.stringify(fields), filters: JSON.stringify(filters), limit, limit_start: offset, order_by: orderBy, search })
}

export function listPriceLists() {
  return frappeCall('manager.api.list_price_lists')
}

export function savePriceList(data) {
  return frappeCall('manager.api.save_price_list', { data: JSON.stringify(data) })
}

export function deletePriceList(name) {
  return frappeCall('manager.api.delete_price_list', { name })
}

export function getPriceListItems(priceList) {
  return frappeCall('manager.api.get_price_list_items', { price_list: priceList })
}

export function getItemPriceFromList(item, priceList, date) {
  return frappeCall('manager.api.get_item_price_from_list', { item, price_list: priceList, date })
}

export function applyPriceListToInvoice(doctype, name, priceList) {
  return frappeCall('manager.api.apply_price_list_to_invoice', { doctype, name, price_list: priceList })
}

export function calculateInvoiceDiscounts(doctype, name) {
  return frappeCall('manager.api.calculate_invoice_discounts', { doctype, name })
}

export function getItems() {
  return frappeCall('manager.api.get_list_filtered', {
    doctype: 'Item',
    fields: JSON.stringify(['name', 'item_name', 'item_type']),
    filters: JSON.stringify({}),
    limit: 9999,
  })
}

export function createBackup() {
  return frappeCall('manager.api.create_backup')
}

export function listBackups() {
  return frappeCall('manager.api.list_backups')
}

export async function downloadBackup(filename) {
  const base = import.meta.env.VITE_FRAPPE_API_URL || ''
  const url = `${base}/api/method/manager.api.download_backup?filename=${encodeURIComponent(filename)}`
  const res = await api.get(url, { responseType: 'blob' })
  const blob = res.data
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
  return { status: 'ok' }
}

export function changePassword(oldPassword, newPassword) {
  return frappeCall('manager.api.change_password', { old_password: oldPassword, new_password: newPassword })
}

export default api
