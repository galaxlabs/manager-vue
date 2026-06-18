<template>
  <div class="dt-wrap">
    <div class="dt-scroll">
      <table class="dt" :class="{ compact: compact }">
        <thead>
          <tr>
            <th v-if="selectable" class="chk-th"><input type="checkbox" :checked="allSelected" @change="$emit('select-all')" /></th>
            <th v-for="col in columns" :key="col.key" @click="col.sortable !== false && toggleSort(col.key)" :class="col.align || ''">
              <span class="th-label">{{ col.label }}</span>
              <span v-if="col.sortable !== false && sortKey === col.key" class="sort-arrow">{{ sortDir === 'asc' ? '▲' : '▼' }}</span>
            </th>
            <th v-if="deletable" class="action-th"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!rows.length"><td :colspan="colspan" class="empty-row">No records</td></tr>
          <tr v-for="(row, i) in sortedRows" :key="row.name || i" @click="$emit('row-click', row)" class="dr">
            <td v-if="selectable" class="chk-td" @click.stop><input type="checkbox" :checked="selected?.has(row.name)" @change="$emit('select', row.name)" /></td>
            <td v-for="col in columns" :key="col.key" :class="col.align || ''">
              <span v-if="col.format === 'currency'" class="num">{{ fmtCurr(row[col.key]) }}</span>
              <span v-else-if="col.format === 'date'" class="date">{{ fmtDate(row[col.key]) }}</span>
              <span v-else-if="col.format === 'boolean'">{{ row[col.key] ? 'Yes' : 'No' }}</span>
              <span v-else-if="col.format === 'badge'" class="badge" :class="'badge-' + (row[col.key] || '').toLowerCase()">{{ row[col.key] }}</span>
              <span v-else class="cell-text">{{ row[col.key] }}</span>
            </td>
            <td v-if="deletable" class="action-td" @click.stop="$emit('delete', row)">×</td>
          </tr>
          <tr v-if="hasTotals" class="totals-row">
            <td v-if="selectable"></td>
            <td v-for="col in columns" :key="col.key" :class="col.align || ''">
              <span v-if="col.format === 'currency'" class="num total-num">{{ fmtCurr(totals[col.key]) }}</span>
              <span v-else-if="col.key === 'name' || col.key === 'modified'" class="total-label">Total</span>
              <span v-else></span>
            </td>
            <td v-if="deletable"></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  columns: Array, rows: { type: Array, default: () => [] },
  deletable: Boolean, compact: { type: Boolean, default: true },
  selectable: Boolean, selected: { type: Set, default: () => new Set() },
  totals: { type: Object, default: () => ({}) },
})
defineEmits(['row-click', 'delete', 'select', 'select-all'])

const sortKey = ref('')
const sortDir = ref('asc')
const colspan = computed(() => props.columns.length + (props.deletable ? 1 : 0) + (props.selectable ? 1 : 0))
const allSelected = computed(() => props.rows.length > 0 && props.selected?.size === props.rows.length)
const hasTotals = computed(() => props.rows.length > 1 && Object.keys(props.totals).length > 0)

function toggleSort(key) {
  if (sortKey.value === key) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  else { sortKey.value = key; sortDir.value = 'asc' }
}

const sortedRows = computed(() => {
  if (!sortKey.value) return props.rows
  return [...props.rows].sort((a, b) => {
    const va = a[sortKey.value], vb = b[sortKey.value]
    if (va == null) return 1; if (vb == null) return -1
    const cmp = typeof va === 'number' ? va - vb : String(va).localeCompare(String(vb))
    return sortDir.value === 'asc' ? cmp : -cmp
  })
})

function fmtCurr(v) {
  if (v == null || v === 0) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(v)
}
function fmtDate(v) {
  if (!v) return ''
  return new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<style scoped>
.dt-wrap { overflow: hidden; }
.dt-scroll { overflow-x: auto; }
.dt { width: 100%; border-collapse: collapse; font-size: 0.8rem; table-layout: auto; }
.dt.compact th, .dt.compact td { padding: 0.38rem 0.5rem; }
.dt th { text-align: left; font-weight: 600; color: #64748b; background: #f8fafc; border-bottom: 1px solid #e2e8f0; white-space: nowrap; user-select: none; cursor: pointer; position: sticky; top: 0; z-index: 1; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.3px; }
.dt th:first-child, .dt td:first-child { padding-left: 0.75rem; }
.dt th .sort-arrow { font-size: 0.55rem; margin-left: 0.15rem; color: #2563eb; }
.dt td { border-bottom: 1px solid #f1f5f9; color: #334155; }
.num-col { text-align: right; white-space: nowrap; }
.dr { cursor: pointer; transition: background 0.08s; }
.dr:nth-child(even) { background: #fafbfc; }
.dr:hover { background: #eef2ff; }
.num { font-variant-numeric: tabular-nums; font-weight: 500; white-space: nowrap; }
.date { color: #64748b; white-space: nowrap; font-size: 0.77rem; }
.cell-text { overflow: hidden; text-overflow: ellipsis; max-width: 220px; display: inline-block; white-space: nowrap; }
.badge { display: inline-block; padding: 0.1rem 0.35rem; border-radius: 3px; font-size: 0.67rem; font-weight: 500; line-height: 1.3; }
.badge-draft { background: #f1f5f9; color: #64748b; }
.badge-submitted { background: #dbeafe; color: #1d4ed8; }
.badge-paid, .badge-paid-in-full { background: #dcfce7; color: #16a34a; }
.badge-overdue, .badge-duetomorrow { background: #fef2f2; color: #dc2626; }
.badge-cancelled { background: #f1f5f9; color: #94a3b8; }
.badge-active { background: #dcfce7; color: #16a34a; }
.badge-inactive { background: #f1f5f9; color: #94a3b8; }
.chk-th, .chk-td { width: 32px; text-align: center; }
.chk-td input, .chk-th input { width: 15px; height: 15px; cursor: pointer; accent-color: #2563eb; }
.action-th { width: 26px; }
.action-td { width: 26px; text-align: center; color: #cbd5e1; cursor: pointer; font-size: 0.95rem; }
.action-td:hover { color: #dc2626; }
.totals-row td { border-top: 2px solid #e2e8f0; font-weight: 600; color: #1e293b; background: #f8fafc; }
.total-num { font-size: 0.82rem; }
.total-label { font-size: 0.72rem; text-transform: uppercase; color: #64748b; letter-spacing: 0.3px; }
.empty-row { text-align: center; padding: 2rem !important; color: #94a3b8; font-style: italic; }
</style>
