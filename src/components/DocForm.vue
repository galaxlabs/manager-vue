<template>
  <div class="page form-page">
    <div class="page-header">
      <h1>{{ isNew ? 'New' : 'Edit' }} {{ title }}</h1>
      <div class="actions">
        <button class="btn" @click="$router.back()">Back</button>
        <button v-if="isSubmittable && docstatus === 0 && auth.can(props.doctype, 'submit')" class="btn btn-success" @click="submitDoc" :disabled="submitting">
          {{ submitting ? 'Submitting...' : 'Submit' }}
        </button>
        <button v-if="docstatus === 0" class="btn btn-primary" @click="save" :disabled="saving">
          {{ saving ? 'Saving...' : 'Save' }}
        </button>
        <button v-if="isSubmittable && docstatus === 1 && auth.can(props.doctype, 'cancel')" class="btn btn-danger" @click="cancelDoc" :disabled="cancelling">
          {{ cancelling ? 'Cancelling...' : 'Cancel' }}
        </button>
        <button v-if="docstatus === 0 && !isNew && auth.can(props.doctype, 'delete')" class="btn btn-danger-outline" @click="showDeleteModal = true">Delete</button>
        <button v-if="!isNew && doctype === 'Fixed Asset'" class="btn btn-secondary" @click="generateDepreciation">Generate Depreciation</button>
        <button v-if="!isNew && doctype === 'Employee'" class="btn btn-secondary" @click="generatePayslip">Generate Payslip</button>
        <button v-if="!isNew && (doctype === 'Sales Invoice' || doctype === 'Purchase Invoice')" class="btn btn-secondary" @click="calculateTaxes">Calculate Tax</button>
        <button v-if="!isNew && docstatus === 1 && doctype === 'Sales Order'" class="btn btn-success" @click="convertSO" :disabled="converting">Convert to Invoice</button>
        <button v-if="!isNew && docstatus === 1 && doctype === 'Purchase Order'" class="btn btn-success" @click="convertPO" :disabled="converting">Convert to Invoice</button>
      </div>
    </div>
    <div class="form-body">
      <div v-if="!isNew" class="status-badge" :class="'status-' + (form.status ? form.status.toLowerCase() : statusLabel)">
        {{ form.status || statusLabel }}
      </div>
      <div class="form-grid">
        <template v-for="field in fields" :key="field.fieldname">
          <div v-if="field.fieldtype === 'Section Break' && !isNew" class="section-break"><span>{{ field.label }}</span></div>
          <div v-else-if="field.fieldtype === 'Column Break'" class="col-break"></div>
          <div v-else-if="field.fieldtype === 'Attach Image'" class="fg-full image-field">
            <label>{{ field.label }}</label>
            <div class="image-wrap">
              <img v-if="form[field.fieldname]" :src="form[field.fieldname]" class="preview-img" />
              <div v-else class="no-img">No image</div>
              <input type="file" accept="image/*" @change="uploadImage($event, field.fieldname)" :disabled="docstatus !== 0" />
            </div>
          </div>
          <div v-else-if="field.fieldtype !== 'Table' && field.fieldtype !== 'Section Break'" class="fg" :class="fieldClass(field)">
            <label>{{ field.label }} <span v-if="field.reqd" class="reqd">*</span></label>
            <input v-if="field.fieldtype === 'Data' || field.fieldtype === 'Small Text'" v-model="form[field.fieldname]" class="input" :class="{'input-err': errors[field.fieldname]}" :placeholder="field.label" :disabled="docstatus !== 0" />
            <input v-else-if="field.fieldtype === 'Currency'" v-model.number="form[field.fieldname]" class="input" :class="{'input-err': errors[field.fieldname]}" type="number" step="0.01" :placeholder="field.label" :disabled="docstatus !== 0" />
            <input v-else-if="field.fieldtype === 'Float'" v-model.number="form[field.fieldname]" class="input" :class="{'input-err': errors[field.fieldname]}" type="number" step="0.01" :placeholder="field.label" :disabled="docstatus !== 0" />
            <input v-else-if="field.fieldtype === 'Int'" v-model.number="form[field.fieldname]" class="input" :class="{'input-err': errors[field.fieldname]}" type="number" :placeholder="field.label" :disabled="docstatus !== 0" />
            <input v-else-if="field.fieldtype === 'Date'" v-model="form[field.fieldname]" class="input" :class="{'input-err': errors[field.fieldname]}" type="date" :disabled="docstatus !== 0" />
            <input v-else-if="field.fieldtype === 'Datetime'" v-model="form[field.fieldname]" class="input" type="datetime-local" :disabled="docstatus !== 0" />
            <textarea v-else-if="field.fieldtype === 'Text' || field.fieldtype === 'Long Text'" v-model="form[field.fieldname]" class="input" :class="{'input-err': errors[field.fieldname]}" rows="5" :placeholder="field.label" :disabled="docstatus !== 0"></textarea>
            <select v-else-if="field.fieldtype === 'Select'" v-model="form[field.fieldname]" class="input" :class="{'input-err': errors[field.fieldname]}" :disabled="docstatus !== 0">
              <option value="">Select {{ field.label }}</option>
              <option v-for="opt in (field.options || '').split('\n')" :key="opt" :value="opt">{{ opt }}</option>
            </select>
            <div v-else-if="field.fieldtype === 'Link'" class="link-wrap">
              <input v-model="form[field.fieldname + '_search']" class="input" :class="{'input-err': errors[field.fieldname]}" :placeholder="'Search ' + field.label" :disabled="docstatus !== 0" @input="form[field.fieldname + '_open'] = true" @focus="form[field.fieldname + '_open'] = true" @blur="setTimeout(() => form[field.fieldname + '_open'] = false, 200)" />
              <div v-if="form[field.fieldname + '_open']" class="link-dropdown wide">
                <div v-for="opt in filteredMainOptions(field)" :key="opt.name" class="link-opt" @mousedown.prevent="selectMainLink(field, opt)">
                  <span class="link-code">{{ opt.name }}</span>
                  <span v-if="opt.item_name || opt.customer_name || opt.supplier_name || opt.account_name" class="link-name">— {{ opt.item_name || opt.customer_name || opt.supplier_name || opt.account_name }}</span>
                </div>
              </div>
            </div>
            <label v-else-if="field.fieldtype === 'Check'" class="chk-label">
              <input v-model="form[field.fieldname]" type="checkbox" :true-value="1" :false-value="0" :disabled="docstatus !== 0" /> {{ field.label }}
            </label>
            <div v-if="errors[field.fieldname]" class="field-err">{{ errors[field.fieldname] }}</div>
          </div>
          <div v-else-if="field.fieldtype === 'Table'" class="fg-full child-table-section">
            <label>{{ field.label }} <span v-if="field.reqd" class="reqd">*</span></label>
            <div class="child-table-wrap">
              <table class="child-table">
                <thead><tr>
                  <th v-for="cf in childFields[field.fieldname] || []" :key="cf.fieldname" class="cth">{{ cf.label }}</th>
                  <th v-if="docstatus === 0" class="action-col"></th>
                </tr></thead>
                <tbody>
                  <tr v-for="(row, ri) in (form[field.fieldname] || [])" :key="ri" class="ctr">
                    <td v-for="cf in childFields[field.fieldname] || []" :key="cf.fieldname" class="ctd">
                      <input v-if="cf.fieldtype === 'Data' || cf.fieldtype === 'Small Text'" v-model="row[cf.fieldname]" class="is" tabindex="1" :disabled="docstatus !== 0" @keydown.tab.prevent="tabToNext($event, field, ri, cf.fieldname)" @input="recalcRow(field, ri)" />
                      <input v-else-if="cf.fieldtype === 'Currency' || cf.fieldtype === 'Float'" v-model.number="row[cf.fieldname]" class="is" type="number" step="0.01" tabindex="1" :disabled="docstatus !== 0" @keydown.tab.prevent="tabToNext($event, field, ri, cf.fieldname)" @input="recalcRow(field, ri)" />
                      <input v-else-if="cf.fieldtype === 'Int'" v-model.number="row[cf.fieldname]" class="is" type="number" tabindex="1" :disabled="docstatus !== 0" @keydown.tab.prevent="tabToNext($event, field, ri, cf.fieldname)" @input="recalcRow(field, ri)" />
                      <input v-else-if="cf.fieldtype === 'Date'" v-model="row[cf.fieldname]" class="is" type="date" :disabled="docstatus !== 0" />
                      <select v-else-if="cf.fieldtype === 'Select'" v-model="row[cf.fieldname]" class="is" :disabled="docstatus !== 0">
                        <option value=""></option>
                        <option v-for="opt in (cf.options || '').split('\n')" :key="opt" :value="opt">{{ opt }}</option>
                      </select>
                      <div v-else-if="cf.fieldtype === 'Link'" class="link-cell">
                      <input v-model="row[cf.fieldname + '_search']" class="is" :placeholder="'Search ' + cf.label" :disabled="docstatus !== 0" @input="searchLink($event, cf, row)" @focus="openLink(cf, row)" @blur="closeLink(cf, row)" />
                      <div v-if="row[cf.fieldname + '_open']" class="link-dropdown">
                        <div v-for="opt in filteredLinkOpts(cf, row)" :key="opt.name" class="link-opt" @mousedown.prevent="selectLink(cf, row, opt)">
                          <span class="link-code">{{ opt.name }}</span>
                          <span v-if="opt.item_name || opt.customer_name || opt.supplier_name || opt.account_name" class="link-name">— {{ opt.item_name || opt.customer_name || opt.supplier_name || opt.account_name }}</span>
                        </div>
                      </div>
                    </div>
                      <input v-else-if="cf.fieldtype === 'Check'" v-model="row[cf.fieldname]" type="checkbox" :true-value="1" :false-value="0" :disabled="docstatus !== 0" />
                      <span v-else>{{ row[cf.fieldname] }}</span>
                    </td>
                    <td v-if="docstatus === 0" class="action-col"><button class="btn-icon" @click="removeRow(field.fieldname, ri)" title="Remove">&times;</button></td>
                  </tr>
                </tbody>
              </table>
              <button v-if="docstatus === 0" class="btn btn-sm" @click="addRow(field.fieldname)">+ Add row</button>
            </div>
          </div>
        </template>
      </div>
    </div>

    <Modal :visible="showDeleteModal" :title="'Delete ' + title" confirmText="Delete" confirmClass="btn-danger" @confirm="deleteDoc" @cancel="showDeleteModal = false">
      <p>Are you sure you want to delete this {{ title }}? This cannot be undone.</p>
    </Modal>
    <Modal :visible="showSubmitModal" :title="'Submit ' + title" confirmText="Submit" @confirm="confirmSubmit" @cancel="showSubmitModal = false">
      <p>Submit this {{ title }}? This action cannot be reversed.</p>
    </Modal>
    <Modal :visible="showCancelModal" :title="'Cancel ' + title" confirmText="Cancel" confirmClass="btn-danger" @confirm="confirmCancel" @cancel="showCancelModal = false">
      <p>Cancel this {{ title }}? This will reverse all accounting entries.</p>
    </Modal>
    <div v-if="outstandingBalance > 0" class="balance-info">
      Outstanding balance: <strong>{{ formatCurrency(outstandingBalance) }}</strong>
    </div>
    <div v-if="!isNew" class="audit-trail">
      <span class="audit-item">Created {{ formatDate(form.creation) }} by {{ form.owner }}</span>
      <span class="audit-sep">|</span>
      <span class="audit-item">Modified {{ formatDate(form.modified) }} by {{ form.modified_by }}</span>
      <span class="audit-sep">|</span>
      <a class="audit-link" @click="showAttachments = !showAttachments">{{ attachments.length }} file(s)</a>
      <span class="audit-sep">|</span>
      <a class="audit-link" @click="showActivity = !showActivity">Activity</a>
      <span class="audit-sep">|</span>
      <a class="audit-link" @click="showEmailForm = !showEmailForm">Email</a>
    </div>
    <div v-if="showAttachments" class="collapsible-section">
      <h4>Attachments</h4>
      <div v-if="attachments.length" class="file-list">
        <div v-for="f in attachments" :key="f.name" class="file-item">
          <a :href="f.file_url" target="_blank">{{ f.file_name }}</a>
          <span class="file-size">({{ Math.round(f.file_size / 1024) }}KB)</span>
        </div>
      </div>
      <div v-else class="no-data">No attachments.</div>
      <div class="upload-area">
        <input type="file" ref="fileInput" @change="uploadFile" />
      </div>
    </div>
    <div v-if="showActivity" class="collapsible-section">
      <h4>Activity Log</h4>
      <div v-if="versions.length" class="activity-list">
        <div v-for="v in versions" :key="v.modified" class="activity-item">
          <span class="activity-user">{{ v.owner }}</span>
          <span class="activity-date">{{ formatDate(v.modified) }}</span>
          <div v-if="v.changes.length" class="activity-changes">
            <span v-for="c in v.changes" :key="c.field" class="change-badge">{{ c.field }}</span>
          </div>
        </div>
      </div>
      <div v-else class="no-data">Loading...</div>
    </div>
    <div v-if="showEmailForm" class="collapsible-section">
      <h4>Send via Email</h4>
      <div class="email-form">
        <input v-model="emailTo" class="input" placeholder="To: email@example.com" />
        <input v-model="emailSubject" class="input" placeholder="Subject" />
        <textarea v-model="emailMessage" class="input" rows="2" placeholder="Message"></textarea>
        <button class="btn btn-primary btn-sm" @click="sendEmail" :disabled="sendingEmail">{{ sendingEmail ? 'Sending...' : 'Send' }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api, { frappeCall, getList } from '@/api/frappe'
import Modal from '@/components/Modal.vue'
import { useAuthStore } from '@/stores/auth'

const toast = inject('toast')

const props = defineProps({
  doctype: { type: String, required: true },
  title: { type: String, default: '' },
})

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const isNew = ref(!route.params.id || route.params.id === 'new')
const form = ref({})
const fields = ref([])
const linkOptions = ref({})
const childFields = ref({})
const childLinkOptions = ref({})
const saving = ref(false)
const submitting = ref(false)
const cancelling = ref(false)
const converting = ref(false)
const isSubmittable = ref(false)
const docstatus = ref(0)
const showDeleteModal = ref(false)
const showSubmitModal = ref(false)
const showCancelModal = ref(false)
const errors = ref({})
const outstandingBalance = ref(0)

watch(() => form.value?.customer, async (cust) => {
  outstandingBalance.value = 0
  if (!cust || (props.doctype !== 'Sales Invoice' && props.doctype !== 'Purchase Invoice')) return
  try {
    const res = await frappeCall('manager.api.get_customer_outstanding', { customer: cust })
    outstandingBalance.value = res.message?.outstanding || 0
  } catch {}
})
const showAttachments = ref(false)
const showActivity = ref(false)
const showEmailForm = ref(false)
const attachments = ref([])
const versions = ref([])
const emailTo = ref('')
const emailSubject = ref('')
const emailMessage = ref('')
const sendingEmail = ref(false)
const statusLabel = computed(() => {
  return ['Draft', 'Submitted', 'Cancelled'][docstatus.value] || 'Unknown'
})

async function loadMeta() {
  const meta = await frappeCall('manager.api.get_meta', { doctype: props.doctype })
  isSubmittable.value = meta.message.is_submittable
  fields.value = meta.message.fields
  for (const f of fields.value) {
    if (f.fieldtype === 'Link') {
      try {
        const nameFields = ['name']
        if (f.options === 'Item') nameFields.push('item_name')
        else if (f.options === 'Customer') nameFields.push('customer_name')
        else if (f.options === 'Supplier') nameFields.push('supplier_name')
        else if (f.options === 'Employee') nameFields.push('employee_name')
        else if (f.options === 'Account') nameFields.push('account_name')
        else if (f.options === 'Division') nameFields.push('division_name')
        const opts = await getList(f.options, {}, nameFields, 999)
        linkOptions.value[f.fieldname] = Array.isArray(opts) ? opts : (opts.message?.data || opts.message || [])
      } catch (e) {
        linkOptions.value[f.fieldname] = []
      }
    }
    if (f.fieldtype === 'Table') {
      const childDoctype = f.options
      try {
        const cm = await frappeCall('manager.api.get_child_meta', { doctype: childDoctype })
        childFields.value[f.fieldname] = cm.message.fields
        for (const cf of cm.message.fields) {
          if (cf.fieldtype === 'Link') {
              if (!childLinkOptions.value[cf.options]) {
                const nameFields = ['name']
                if (cf.options === 'Item') nameFields.push('item_name')
                else if (cf.options === 'Customer') nameFields.push('customer_name')
                else if (cf.options === 'Supplier') nameFields.push('supplier_name')
                else if (cf.options === 'Employee') nameFields.push('employee_name')
                else if (cf.options === 'Account') nameFields.push('account_name')
                else if (cf.options === 'Division') nameFields.push('division_name')
              const opts = await getList(cf.options, {}, nameFields, 999)
              const list = Array.isArray(opts) ? opts : (opts.message?.data || opts.message || [])
              childLinkOptions.value[cf.options] = list
    }
  }
  // Auto-populate business field from current business context for new records
  if (isNew.value && form.value['business'] === '' && auth.business?.name) {
    form.value['business'] = auth.business.name
  }
}
      } catch (e) {
        childFields.value[f.fieldname] = []
      }
      form.value[f.fieldname] = form.value[f.fieldname] || []
    } else if (f.fieldtype === 'Select') {
      form.value[f.fieldname] = ''
    } else if (f.fieldtype === 'Check') {
      form.value[f.fieldname] = 0
    } else {
      form.value[f.fieldname] = ''
    }
  }
}

function addRow(fieldname) {
  if (!form.value[fieldname]) form.value[fieldname] = []
  const row = {}
  const cfs = childFields.value[fieldname] || []
  for (const cf of cfs) {
    if (cf.fieldtype === 'Check') {
      row[cf.fieldname] = 0
    } else if (cf.fieldtype === 'Currency' || cf.fieldtype === 'Float' || cf.fieldtype === 'Int') {
      row[cf.fieldname] = 0
    } else {
      row[cf.fieldname] = ''
    }
  }
  form.value[fieldname].push(row)
}

function removeRow(fieldname, idx) {
  form.value[fieldname].splice(idx, 1)
}

function recalcRow(field, ri) {
  const tableField = field.fieldname
  const cfs = childFields.value[tableField] || []
  const hasQty = cfs.some(cf => cf.fieldname === 'quantity')
  const hasRate = cfs.some(cf => cf.fieldname === 'rate')
  const hasAmount = cfs.some(cf => cf.fieldname === 'amount')
  const row = form.value[tableField][ri]
  if (hasQty && hasRate && hasAmount) {
    row.amount = (parseFloat(row.quantity) || 0) * (parseFloat(row.rate) || 0)
  }
}

function ensureChildTableData() {
  for (const f of fields.value) {
    if (f.fieldtype === 'Table' && (!form.value[f.fieldname] || form.value[f.fieldname].length === 0)) {
      delete form.value[f.fieldname]
    }
  }
}

async function loadDoc() {
  if (!isNew.value) {
    const doc = await frappeCall('manager.api.get_doc', { doctype: props.doctype, name: route.params.id })
    const d = doc.message || doc
    docstatus.value = d.docstatus || 0
    // Parse custom fields JSON into flat form fields
    if (d.custom_fields_json) {
      try {
        const cf = JSON.parse(d.custom_fields_json)
        Object.assign(d, cf)
      } catch (e) {}
    }
    form.value = d
    // Initialize link search fields
    for (const f of fields.value) {
      if (f.fieldtype === 'Link' && d[f.fieldname]) {
        const opt = (linkOptions.value[f.fieldname] || []).find(o => o.name === d[f.fieldname])
        if (opt) {
          const display = opt.item_name || opt.customer_name || opt.supplier_name || opt.account_name || ''
          d[f.fieldname + '_search'] = opt.name + (display ? ' - ' + display : '')
        } else {
          d[f.fieldname + '_search'] = d[f.fieldname]
        }
      }
    }
  }
}

function submitDoc() { showSubmitModal.value = true }
function cancelDoc() { showCancelModal.value = true }

async function confirmSubmit() {
  showSubmitModal.value = false
  submitting.value = true
  try {
    await frappeCall('manager.api.submit_doc', { doctype: props.doctype, name: route.params.id })
    docstatus.value = 1
    form.value.docstatus = 1
  } catch (e) {
    alert('Submit failed: ' + (e.response?.data?.message || e.message))
  } finally {
    submitting.value = false
  }
}

async function confirmCancel() {
  showCancelModal.value = false
  cancelling.value = true
  try {
    await frappeCall('manager.api.cancel_doc', { doctype: props.doctype, name: route.params.id })
    docstatus.value = 2
    form.value.docstatus = 2
  } catch (e) {
    alert('Cancel failed: ' + (e.response?.data?.message || e.message))
  } finally {
    cancelling.value = false
  }
}

async function deleteDoc() {
  showDeleteModal.value = false
  try {
    await frappeCall('manager.api.delete_doc', { doctype: props.doctype, name: route.params.id })
    router.push(route.path.replace(/\/[^/]+$/, ''))
  } catch (e) {
    toast.error('Delete failed: ' + (e.response?.data?.message || e.message))
  }
}

async function generateDepreciation() {
  try {
    const res = await frappeCall('manager.api.generate_depreciation_schedule', { fixed_asset: route.params.id })
    toast.success(res.message?.entries_created + ' depreciation entries created')
  } catch (e) {
    toast.error(e.response?.data?.message || e.message)
  }
}

async function generatePayslip() {
  try {
    const now = new Date()
    const start = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-01'
    const end = now.toISOString().slice(0, 10)
    const res = await frappeCall('manager.api.generate_payslip', { employee: route.params.id, start_date: start, end_date: end })
    toast.success(res.message?.name || 'Payslip created')
  } catch (e) {
    toast.error(e.response?.data?.message || e.message)
  }
}

async function calculateTaxes() {
  try {
    const res = await frappeCall('manager.api.calculate_invoice_taxes', { doctype: props.doctype, name: route.params.id })
    toast.success('Tax calculated: ' + (res.message?.tax_total || 0))
  } catch (e) {
    toast.error(e.response?.data?.message || e.message)
  }
}

async function convertSO() {
  converting.value = true
  try {
    const res = await frappeCall('manager.api.convert_sales_order_to_invoice', { sales_order: route.params.id })
    toast.success('Converted to Invoice: ' + res.message?.invoice)
    router.push('/sales/invoices/' + res.message?.invoice)
  } catch (e) {
    toast.error(e.response?.data?.message || e.message)
  } finally {
    converting.value = false
  }
}

async function convertPO() {
  converting.value = true
  try {
    const res = await frappeCall('manager.api.convert_purchase_order_to_invoice', { purchase_order: route.params.id })
    toast.success('Converted to Invoice: ' + res.message?.invoice)
    router.push('/purchases/invoices/' + res.message?.invoice)
  } catch (e) {
    toast.error(e.response?.data?.message || e.message)
  } finally {
    converting.value = false
  }
}

async function uploadImage(e, fieldname) {
  const file = e.target.files?.[0]
  if (!file) return
  const formData = new FormData()
  formData.append('file', file)
  formData.append('doctype', props.doctype)
  formData.append('docname', route.params.id)
  try {
    const res = await api.post('manager.api.upload_attachment', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    if (res.data?.message?.file_url) {
      form.value[fieldname] = res.data.message.file_url
      save()
    } else {
      toast.success('Image uploaded')
    }
  } catch (e) {
    toast.error('Upload failed')
  }
}

async function loadAttachments() {
  if (!isNew.value) {
    try {
      const res = await frappeCall('manager.api.get_attachments', { doctype: props.doctype, name: route.params.id })
      attachments.value = res.message || []
    } catch {}
  }
}

async function loadVersions() {
  if (!isNew.value) {
    try {
      const res = await frappeCall('manager.api.get_doc_versions', { doctype: props.doctype, name: route.params.id })
      versions.value = res.message || []
    } catch {}
  }
}

async function uploadFile(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const formData = new FormData()
  formData.append('file', file)
  formData.append('doctype', props.doctype)
  formData.append('docname', route.params.id)
  try {
    await api.post('manager.api.upload_attachment', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    toast.success('File uploaded')
    loadAttachments()
  } catch (e) {
    toast.error('Upload failed')
  }
}

async function sendEmail() {
  if (!emailTo.value) { toast.warning('Enter an email address'); return }
  sendingEmail.value = true
  try {
    await frappeCall('manager.api.send_document_email', {
      doctype: props.doctype,
      name: route.params.id,
      to_email: emailTo.value,
      subject: emailSubject.value || (props.doctype + ' ' + route.params.id),
      message: emailMessage.value || '',
    })
    toast.success('Email sent to ' + emailTo.value)
    showEmailForm.value = false
  } catch (e) {
    toast.error(e.response?.data?.message || e.message)
  } finally {
    sendingEmail.value = false
  }
}

function formatDate(v) {
  if (!v) return ''
  return new Date(v).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function fieldClass(field) {
  const ft = field.fieldtype
  if (ft === 'Text' || ft === 'Long Text' || ft === 'Text Editor') return 'fg-full fg-hi'
  if (ft === 'Currency' || ft === 'Float' || ft === 'Int') return 'fg-sm'
  if (ft === 'Date' || ft === 'Datetime') return 'fg-sm'
  if (ft === 'Check') return 'fg-sm'
  if (ft === 'Data' || ft === 'Small Text' || ft === 'Select' || ft === 'Link') return 'fg-md'
  if (ft === 'Table') return 'fg-full'
  return ''
}

function searchLink(e, cf, row) {
  row[cf.fieldname + '_open'] = true
}
function openLink(cf, row) { row[cf.fieldname + '_open'] = true }
function closeLink(cf, row) { setTimeout(() => { row[cf.fieldname + '_open'] = false }, 200) }
function selectLink(cf, row, opt) {
  row[cf.fieldname] = opt.name
  row[cf.fieldname + '_search'] = opt.name + (opt.item_name || opt.customer_name || opt.supplier_name || opt.account_name ? ' - ' + (opt.item_name || opt.customer_name || opt.supplier_name || opt.account_name) : '')
  row[cf.fieldname + '_open'] = false
}
function filteredLinkOpts(cf, row) {
  const opts = childLinkOptions.value[cf.options] || []
  const q = (row[cf.fieldname + '_search'] || '').toLowerCase()
  if (!q) return opts.slice(0, 50)
  return opts.filter(o => (o.name + ' ' + (o.item_name || o.customer_name || o.supplier_name || o.account_name || '')).toLowerCase().includes(q)).slice(0, 50)
}
function filteredMainOptions(field) {
  const opts = linkOptions.value[field.fieldname] || []
  const q = (form.value[field.fieldname + '_search'] || '').toLowerCase()
  if (!q) return opts.slice(0, 50)
  return opts.filter(o => (o.name + ' ' + (o.item_name || o.customer_name || o.supplier_name || o.account_name || '')).toLowerCase().includes(q)).slice(0, 50)
}
function selectMainLink(field, opt) {
  form.value[field.fieldname] = opt.name
  const disp = opt.item_name || opt.customer_name || opt.supplier_name || opt.account_name || ''
  form.value[field.fieldname + '_search'] = opt.name + (disp ? ' - ' + disp : '')
  form.value[field.fieldname + '_open'] = false
}

function tabToNext(e, tableField, rowIdx, fieldname) {
  const rows = form.value[tableField.fieldname]
  if (!rows) return
  const tr = e.target.closest('tr')
  const tb = tr?.closest('tbody')
  const cfs = childFields.value[tableField.fieldname] || []
  const ci = cfs.findIndex(cf => cf.fieldname === fieldname)
  if (ci < 0 || !tr || !tb) return
  if (e.shiftKey) {
    if (ci > 0) tr.querySelectorAll('.is')[ci - 1]?.focus()
    else if (rowIdx > 0) tb.children[rowIdx - 1]?.querySelectorAll('.is')[cfs.length - 1]?.focus()
  } else {
    if (ci < cfs.length - 1) tr.querySelectorAll('.is')[ci + 1]?.focus()
    else if (rowIdx < rows.length - 1) tb.children[rowIdx + 1]?.querySelectorAll('.is')[0]?.focus()
    else { addRow(tableField.fieldname); setTimeout(() => tb?.lastElementChild?.querySelector('.is')?.focus(), 50) }
  }
}

function validate() {
  const missing = []
  errors.value = {}
  for (const f of fields.value) {
    if (f.reqd && f.fieldtype !== 'Table') {
      const val = form.value[f.fieldname]
      if (val === undefined || val === null || val === '') {
        missing.push(f.label)
        errors.value[f.fieldname] = 'Required'
      }
    }
  }
  if (missing.length) {
    toast.warning('Please fill required fields')
    return false
  }
  return true
}

async function save() {
  if (!validate()) return
  saving.value = true
  try {
    ensureChildTableData()
    const data = {}
    const customData = {}
    for (const f of fields.value) {
      if (form.value[f.fieldname] !== undefined) {
        if (f.is_custom) {
          customData[f.fieldname] = form.value[f.fieldname]
        } else {
          data[f.fieldname] = form.value[f.fieldname]
        }
      }
    }
    if (isNew.value) {
      const result = await frappeCall('manager.api.create_doc', { doctype: props.doctype, ...data })
      const docName = result.message?.name || result.name
      if (Object.keys(customData).length) {
        await frappeCall('manager.api.save_custom_field_values', { doctype: props.doctype, name: docName, custom_fields: JSON.stringify(customData) })
      }
      router.push(route.path.replace(/\/new$/, '/' + docName))
    } else {
      await frappeCall('manager.api.update_doc', { doctype: props.doctype, name: route.params.id, ...data })
      if (Object.keys(customData).length) {
        await frappeCall('manager.api.save_custom_field_values', { doctype: props.doctype, name: route.params.id, custom_fields: JSON.stringify(customData) })
      }
      router.back()
    }
  } catch (e) {
    alert('Save failed: ' + (e.response?.data?.message || e.message))
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await loadMeta()
  await loadDoc()
  if (!isNew.value) {
    loadAttachments()
    loadVersions()
  }
})
</script>

<style scoped>
.form-page { max-width: 860px; margin: 0 auto; }
.form-body { padding: 1.25rem; }
.form-grid { display: flex; flex-wrap: wrap; gap: 0.5rem 0.75rem; }
.fg { flex: 1 1 220px; min-width: 140px; }
.fg-sm { flex: 1 1 140px; min-width: 100px; }
.fg-md { flex: 1 1 200px; min-width: 140px; }
.fg-full { flex: 1 1 100%; }
.fg-hi textarea { min-height: 120px; }
.fg label, .child-table-section > label { display: block; font-size: 0.75rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem; letter-spacing: 0.2px; }
.fg .input { width: 100%; padding: 0.55rem 0.65rem; border: 1px solid #d0d0d0; border-radius: 6px; font-size: 0.88rem; transition: border-color 0.15s; }
.fg .input:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 2px rgba(37,99,235,0.1); }
.fg .input-err { border-color: #dc2626; }
.fg .input-err:focus { box-shadow: 0 0 0 2px rgba(220,38,38,0.1); }
.image-field { margin-bottom: 0.75rem; }
.image-wrap { display: flex; align-items: center; gap: 0.75rem; }
.preview-img { max-width: 120px; max-height: 120px; border-radius: 6px; border: 1px solid #e2e8f0; object-fit: cover; }
.no-img { width: 80px; height: 80px; background: #f1f5f9; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #94a3b8; font-size: 0.7rem; border: 1px dashed #d0d0d0; }
.image-wrap input[type="file"] { font-size: 0.8rem; }
.input-err + .field-err { color: #dc2626; font-size: 0.7rem; margin-top: 0.15rem; }
.link-wrap, .link-cell { position: relative; }
.link-dropdown { position: absolute; top: 100%; left: 0; right: 0; z-index: 50; background: #fff; border: 1px solid #d0d0d0; border-radius: 5px; max-height: 200px; overflow-y: auto; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.link-dropdown.wide { min-width: 300px; }
.link-opt { padding: 0.4rem 0.6rem; cursor: pointer; display: flex; gap: 0.3rem; font-size: 0.82rem; border-bottom: 1px solid #f1f5f9; }
.link-opt:hover { background: #eef2ff; }
.link-opt:last-child { border-bottom: none; }
.link-code { font-weight: 600; color: #1e293b; white-space: nowrap; }
.link-name { color: #64748b; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.chk-label { display: flex; align-items: center; gap: 0.4rem; font-size: 0.85rem; padding-top: 0.15rem; cursor: pointer; }
.chk-label input { width: 16px; height: 16px; accent-color: #2563eb; }
.section-break { width: 100%; margin: 0.5rem 0 0; padding-top: 0.5rem; border-top: 1px solid #e2e8f0; font-size: 0.85rem; font-weight: 700; color: #1e293b; }
.section-break span { display: inline-block; background: #fff; padding-right: 0.5rem; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; font-weight: 600; margin-bottom: 0.25rem; font-size: 13px; color: #555; }
.form-group .input { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #d0d0d0; border-radius: 6px; font-size: 14px; box-sizing: border-box; }
.form-group select.input { min-height: 38px; }
.form-group textarea.input { resize: vertical; }
.reqd { color: #e74c3c; }
.actions { display: flex; gap: 0.5rem; align-items: center; }
.btn-success { background: #27ae60; color: #fff; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-size: 14px; }
.btn-danger { background: #e74c3c; color: #fff; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-size: 14px; }
.status-badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 12px; font-weight: 600; margin-bottom: 1rem; }
.status-draft { background: #f0f0f0; color: #666; }
.status-submitted { background: #e8f5e9; color: #27ae60; }
.status-paid { background: #e3f2fd; color: #1976d2; }
.status-cancelled { background: #fce4ec; color: #e74c3c; }
.status-pending { background: #fff3e0; color: #f57c00; }
.btn-sm { padding: 0.3rem 0.75rem; font-size: 12px; }
.btn-icon { background: none; border: none; color: #e74c3c; font-size: 18px; cursor: pointer; padding: 0 4px; }
.child-table-section { margin-bottom: 1rem; }
.child-table-wrap { overflow-x: auto; }
.child-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
.cth { background: #f8fafc; text-align: left; padding: 0.4rem 0.5rem; border-bottom: 1px solid #e2e8f0; font-weight: 600; white-space: nowrap; font-size: 0.72rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.3px; }
.ctd { padding: 0.3rem 0.4rem; border-bottom: 1px solid #f1f5f9; min-width: 80px; }
.ctd:first-child { padding-left: 0.6rem; }
.ctd:nth-child(1) { min-width: 100px; }
.ctd:nth-child(2) { min-width: 140px; }
.ctd:nth-child(3) { min-width: 70px; }
.ctd:nth-child(4) { min-width: 70px; }
.ctd:nth-child(5) { min-width: 90px; }
.ctr:nth-child(even) { background: #fafbfc; }
.is { width: 100%; padding: 0.5rem 0.55rem; border: 1px solid #d4d4d4; border-radius: 5px; font-size: 0.82rem; box-sizing: border-box; }
.is:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 2px rgba(37,99,235,0.08); }
select.is { min-height: 34px; }
.action-col { width: 32px; text-align: center; }
.btn-danger-outline { background: #fff; color: #dc2626; border: 1px solid #dc2626; }
.btn-danger-outline:hover { background: #fef2f2; }
.audit-trail { padding: 0.6rem 1.25rem; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 0.8rem; color: #94a3b8; display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; }
.balance-info { padding: 0.5rem 1.25rem; background: #fef9c3; border-bottom: 1px solid #e2e8f0; font-size: 0.85rem; color: #854d0e; display: flex; gap: 0.35rem; align-items: center; }
.audit-sep { color: #cbd5e1; }
.audit-link { color: #2563eb; cursor: pointer; text-decoration: none; }
.audit-link:hover { text-decoration: underline; }
.collapsible-section { padding: 1rem 1.25rem; border-top: 1px solid #e2e8f0; background: #fafafa; }
.collapsible-section h4 { margin: 0 0 0.5rem; font-size: 0.85rem; color: #475569; }
.no-data { color: #94a3b8; font-size: 0.8rem; font-style: italic; }
.file-list { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.5rem; }
.file-item { background: #f1f5f9; padding: 0.35rem 0.65rem; border-radius: 4px; font-size: 0.8rem; }
.file-size { color: #94a3b8; margin-left: 0.25rem; }
.upload-area { margin-top: 0.5rem; }
.upload-area input[type="file"] { font-size: 0.8rem; }
.activity-list { display: flex; flex-direction: column; gap: 0.5rem; }
.activity-item { font-size: 0.8rem; padding: 0.25rem 0; border-bottom: 1px solid #f1f5f9; }
.activity-user { font-weight: 600; color: #475569; margin-right: 0.5rem; }
.activity-date { color: #94a3b8; font-size: 0.75rem; }
.activity-changes { display: flex; gap: 0.3rem; margin-top: 0.25rem; }
.change-badge { background: #e0f2fe; color: #0369a1; padding: 0.15rem 0.4rem; border-radius: 3px; font-size: 0.7rem; }
.email-form { display: flex; flex-direction: column; gap: 0.5rem; max-width: 400px; }
.email-form .input { padding: 0.4rem 0.6rem; border: 1px solid #d0d0d0; border-radius: 5px; font-size: 0.85rem; }
</style>
