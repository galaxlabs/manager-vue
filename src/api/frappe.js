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
    const key = auth.api_key || auth.stored?.api_key || import.meta.env.VITE_FRAPPE_API_KEY || ''
    const secret = auth.api_secret || auth.stored?.api_secret || import.meta.env.VITE_FRAPPE_API_SECRET || ''
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
  return api.post(method, params).then((r) => r.data)
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
  return frappeCall('manager.api.get_list_filtered', { doctype, fields: JSON.stringify(fields), filters: JSON.stringify(filters), limit, limit_start: offset, search })
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
  const blob = new Blob([res.data])
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
