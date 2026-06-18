<template>
  <div class="page">
    <div class="page-header">
      <h1>Users</h1>
      <button class="btn btn-primary" @click="showAddUser = true">+ Add User</button>
    </div>

    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr><th>Name</th><th>Email</th><th>Role</th><th>Active</th><th>Last Login</th><th></th></tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u.name">
            <td>{{ u.full_name }}</td>
            <td>{{ u.email }}</td>
            <td><span class="badge" :class="'badge-' + roleClass(u.role)">{{ u.role }}</span></td>
            <td>{{ u.is_active ? 'Yes' : 'No' }}</td>
            <td>{{ u.last_login ? new Date(u.last_login).toLocaleDateString() : '\u2014' }}</td>
            <td>
              <button class="btn btn-sm" @click="editUser(u)">Edit</button>
              <button class="btn btn-sm btn-danger" @click="confirmDelete(u)" v-if="u.name !== currentUser">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="!users.length" class="text-muted">No users yet.</p>
    </div>

    <Modal :visible="showAddUser" :title="editing ? 'Edit User' : 'Add User'" @confirm="saveUser" @cancel="closeUserForm" :loading="saving">
      <div class="form-group">
        <label>Full Name</label>
        <input v-model="userForm.full_name" class="input" placeholder="John Doe" />
      </div>
      <div class="form-group">
        <label>Email</label>
        <input v-model="userForm.email" class="input" type="email" placeholder="john@example.com" />
      </div>
      <div class="form-group">
        <label>Password {{ editing ? '(leave blank to keep current)' : '' }}</label>
        <input v-model="userForm.password" class="input" type="password" placeholder="Min 6 characters" />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Role</label>
          <select v-model="userForm.role" class="input">
            <option value="View Only">View Only</option>
            <option value="Sales">Sales</option>
            <option value="Purchases">Purchases</option>
            <option value="Accountant">Accountant</option>
            <option value="Manager">Manager</option>
            <option value="Administrator">Administrator</option>
          </select>
        </div>
        <div class="form-group">
          <label>Active</label>
          <select v-model="userForm.is_active" class="input">
            <option :value="1">Active</option>
            <option :value="0">Inactive</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label>Can Login</label>
        <select v-model="userForm.can_login" class="input">
          <option :value="1">Yes</option>
          <option :value="0">No</option>
        </select>
      </div>
    </Modal>

    <Modal :visible="showDelete" title="Delete User" confirm-text="Delete" confirm-class="btn-danger" @confirm="deleteUser" @cancel="showDelete = false">
      <p>Are you sure you want to delete <strong>{{ deleteTarget?.full_name }}</strong>?</p>
    </Modal>

    <Toast />
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import { frappeCall } from '@/api/frappe'
import { useAuthStore } from '@/stores/auth'
import Modal from '@/components/Modal.vue'
import Toast from '@/components/Toast.vue'

const toast = inject('toast')
const auth = useAuthStore()
const currentUser = auth.user || ''
const users = ref([])
const showAddUser = ref(false)
const showDelete = ref(false)
const deleteTarget = ref(null)
const editing = ref(false)
const saving = ref(false)
const userForm = ref({ full_name: '', email: '', password: '', role: 'View Only', is_active: 1, can_login: 1 })

const roles = ['Administrator', 'Manager', 'Accountant', 'Sales', 'Purchases', 'View Only']

function roleClass(role) {
  const map = { Administrator: 'danger', Manager: 'warning', Accountant: 'info', Sales: 'success', Purchases: 'primary', 'View Only': 'secondary' }
  return map[role] || 'secondary'
}

function editUser(u) {
  editing.value = true
  userForm.value = { full_name: u.full_name, email: u.email, password: '', role: u.role, is_active: u.is_active, can_login: u.can_login, name: u.name }
  showAddUser.value = true
}

function closeUserForm() {
  showAddUser.value = false
  editing.value = false
  userForm.value = { full_name: '', email: '', password: '', role: 'View Only', is_active: 1, can_login: 1 }
}

function confirmDelete(u) {
  deleteTarget.value = u
  showDelete.value = true
}

async function loadUsers() {
  try {
    const res = await frappeCall('manager.api.list_users', {})
    users.value = res.message || []
  } catch { users.value = [] }
}

async function saveUser() {
  if (!userForm.value.full_name) { toast.warning('Name is required'); return }
  saving.value = true
  try {
    const payload = { ...userForm.value }
    if (!payload.password) delete payload.password
    await frappeCall('manager.api.save_user', { data: payload })
    toast.success(editing.value ? 'User updated' : 'User created')
    closeUserForm()
    await loadUsers()
  } catch (e) {
    toast.error('Failed to save user')
  }
  saving.value = false
}

async function deleteUser() {
  if (!deleteTarget.value) return
  try {
    await frappeCall('manager.api.delete_user', { name: deleteTarget.value.name })
    toast.success('User deleted')
    showDelete.value = false
    await loadUsers()
  } catch { toast.error('Failed to delete user') }
}

onMounted(loadUsers)
</script>
