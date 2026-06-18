<template>
  <router-view v-if="route.meta?.noLayout" />
  <div v-else class="app-layout">
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-header">
        <div class="logo">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="2" width="20" height="20" rx="4" />
            <path d="M8 8h8M8 12h8M8 16h5" />
          </svg>
          <span v-if="!sidebarCollapsed">Manager</span>
        </div>
        <button class="collapse-btn" @click="sidebarCollapsed = !sidebarCollapsed">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <path v-if="!sidebarCollapsed" d="M15 18l-6-6 6-6" />
            <path v-else d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
        <nav class="sidebar-nav">
          <router-link to="/" class="nav-item" exact-active-class="active">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
            </svg>
            <span v-if="!sidebarCollapsed">Dashboard</span>
          </router-link>

          <div class="nav-section" v-if="settings.isTabVisible('accounts') || settings.isTabVisible('receipts') || settings.isTabVisible('payments') || settings.isTabVisible('transfers') || settings.isTabVisible('reconciliations') || settings.isTabVisible('expense_claims')">
            <div class="nav-section-title" v-if="!sidebarCollapsed">Banking &amp; Cash</div>
            <router-link to="/banking/accounts" class="nav-item" active-class="active" v-if="settings.isTabVisible('accounts')">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" /><line x1="2" y1="11" x2="22" y2="11" /></svg>
              <span v-if="!sidebarCollapsed">Bank and Cash Accounts</span>
            </router-link>
            <router-link to="/banking/receipts" class="nav-item" active-class="active" v-if="settings.isTabVisible('receipts')">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
              <span v-if="!sidebarCollapsed">Receipts</span>
            </router-link>
            <router-link to="/banking/payments" class="nav-item" active-class="active" v-if="settings.isTabVisible('payments')">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" /></svg>
              <span v-if="!sidebarCollapsed">Payments</span>
            </router-link>
            <router-link to="/banking/transfers" class="nav-item" active-class="active" v-if="settings.isTabVisible('transfers')">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 014-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 01-4 4H3" /></svg>
              <span v-if="!sidebarCollapsed">Inter Account Transfers</span>
            </router-link>
            <router-link to="/banking/reconciliations" class="nav-item" active-class="active" v-if="settings.isTabVisible('reconciliations')">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
              <span v-if="!sidebarCollapsed">Bank Reconciliations</span>
            </router-link>
            <router-link to="/banking/expense-claims" class="nav-item" active-class="active" v-if="settings.isTabVisible('expense_claims')">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /></svg>
              <span v-if="!sidebarCollapsed">Expense Claims</span>
            </router-link>
          </div>


        <div class="nav-section" v-if="settings.isTabVisible('customers') || settings.isTabVisible('sales_quotes') || settings.isTabVisible('sales_orders') || settings.isTabVisible('sales_invoices') || settings.isTabVisible('credit_notes') || settings.isTabVisible('late_fees') || settings.isTabVisible('billable_time') || settings.isTabVisible('withholding') || settings.isTabVisible('delivery_notes')">
          <div class="nav-section-title" v-if="!sidebarCollapsed">Sales</div>
          <router-link to="/sales/customers" v-if="settings.isTabVisible('customers')" class="nav-item" active-class="active">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>
            <span v-if="!sidebarCollapsed">Customers</span>
          </router-link>
          <router-link to="/sales/quotes" v-if="settings.isTabVisible('sales_quotes')" class="nav-item" active-class="active">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="10" y1="12" x2="14" y2="12" /></svg>
            <span v-if="!sidebarCollapsed">Sales Quotes</span>
          </router-link>
          <router-link to="/sales/orders" v-if="settings.isTabVisible('sales_orders')" class="nav-item" active-class="active">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="16" y2="17" /></svg>
            <span v-if="!sidebarCollapsed">Sales Orders</span>
          </router-link>
          <router-link to="/sales/invoices" v-if="settings.isTabVisible('sales_invoices')" class="nav-item" active-class="active">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
            <span v-if="!sidebarCollapsed">Sales Invoices</span>
          </router-link>
          <router-link to="/sales/credit-notes" v-if="settings.isTabVisible('credit_notes')" class="nav-item" active-class="active">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="10" y1="17" x2="14" y2="17" /></svg>
            <span v-if="!sidebarCollapsed">Credit Notes</span>
          </router-link>
          <router-link to="/sales/late-payment-fees" v-if="settings.isTabVisible('late_fees')" class="nav-item" active-class="active">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            <span v-if="!sidebarCollapsed">Late Payment Fees</span>
          </router-link>
          <router-link to="/sales/billable-time" v-if="settings.isTabVisible('billable_time')" class="nav-item" active-class="active">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            <span v-if="!sidebarCollapsed">Billable Time</span>
          </router-link>
          <router-link to="/sales/withholding-tax-receipts" v-if="settings.isTabVisible('withholding')" class="nav-item" active-class="active">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
            <span v-if="!sidebarCollapsed">Withholding Tax Receipts</span>
          </router-link>
          <router-link to="/sales/delivery-notes" v-if="settings.isTabVisible('delivery_notes')" class="nav-item" active-class="active">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
            <span v-if="!sidebarCollapsed">Delivery Notes</span>
          </router-link>
        </div>

        <div class="nav-section" v-if="settings.isTabVisible('suppliers') || settings.isTabVisible('purchase_quotes') || settings.isTabVisible('purchase_orders') || settings.isTabVisible('purchase_invoices') || settings.isTabVisible('debit_notes') || settings.isTabVisible('goods_receipts')">
          <div class="nav-section-title" v-if="!sidebarCollapsed">Purchases</div>
          <router-link to="/purchases/suppliers" v-if="settings.isTabVisible('suppliers')" class="nav-item" active-class="active">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>
            <span v-if="!sidebarCollapsed">Suppliers</span>
          </router-link>
          <router-link to="/purchases/quotes" v-if="settings.isTabVisible('purchase_quotes')" class="nav-item" active-class="active">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="10" y1="12" x2="14" y2="12" /></svg>
            <span v-if="!sidebarCollapsed">Purchase Quotes</span>
          </router-link>
          <router-link to="/purchases/orders" v-if="settings.isTabVisible('purchase_orders')" class="nav-item" active-class="active">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="16" y2="17" /></svg>
            <span v-if="!sidebarCollapsed">Purchase Orders</span>
          </router-link>
          <router-link to="/purchases/invoices" v-if="settings.isTabVisible('purchase_invoices')" class="nav-item" active-class="active">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
            <span v-if="!sidebarCollapsed">Purchase Invoices</span>
          </router-link>
          <router-link to="/purchases/debit-notes" v-if="settings.isTabVisible('debit_notes')" class="nav-item" active-class="active">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="10" y1="17" x2="14" y2="17" /></svg>
            <span v-if="!sidebarCollapsed">Debit Notes</span>
          </router-link>
          <router-link to="/purchases/goods-receipts" v-if="settings.isTabVisible('goods_receipts')" class="nav-item" active-class="active">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
            <span v-if="!sidebarCollapsed">Goods Receipts</span>
          </router-link>
        </div>

        <div class="nav-section" v-if="settings.isTabVisible('projects')">
          <div class="nav-section-title" v-if="!sidebarCollapsed">Projects</div>
          <router-link to="/projects" v-if="settings.isTabVisible('projects')" class="nav-item" active-class="active">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" /></svg>
            <span v-if="!sidebarCollapsed">Projects</span>
          </router-link>
        </div>

        <div class="nav-section" v-if="settings.isTabVisible('items') || settings.isTabVisible('inventory_transfers') || settings.isTabVisible('write_offs') || settings.isTabVisible('production')">
          <div class="nav-section-title" v-if="!sidebarCollapsed">Inventory</div>
          <router-link to="/inventory/items" v-if="settings.isTabVisible('items')" class="nav-item" active-class="active">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>
            <span v-if="!sidebarCollapsed">Inventory Items</span>
          </router-link>
          <router-link to="/inventory/transfers" v-if="settings.isTabVisible('inventory_transfers')" class="nav-item" active-class="active">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 014-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 01-4 4H3" /></svg>
            <span v-if="!sidebarCollapsed">Inventory Transfers</span>
          </router-link>
          <router-link to="/inventory/write-offs" v-if="settings.isTabVisible('write_offs')" class="nav-item" active-class="active">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
            <span v-if="!sidebarCollapsed">Inventory Write-offs</span>
          </router-link>
          <router-link to="/inventory/production" v-if="settings.isTabVisible('production')" class="nav-item" active-class="active">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" /></svg>
            <span v-if="!sidebarCollapsed">Production Orders</span>
          </router-link>
        </div>

        <div class="nav-section" v-if="settings.isTabVisible('employees') || settings.isTabVisible('payslips')">
          <div class="nav-section-title" v-if="!sidebarCollapsed">Payroll</div>
          <router-link to="/payroll/employees" v-if="settings.isTabVisible('employees')" class="nav-item" active-class="active">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
            <span v-if="!sidebarCollapsed">Employees</span>
          </router-link>
          <router-link to="/payroll/payslips" v-if="settings.isTabVisible('payslips')" class="nav-item" active-class="active">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
            <span v-if="!sidebarCollapsed">Payslips</span>
          </router-link>
        </div>

        <div class="nav-section" v-if="settings.isTabVisible('investments') || settings.isTabVisible('fixed_assets') || settings.isTabVisible('depreciation') || settings.isTabVisible('intangible_assets') || settings.isTabVisible('amortization') || settings.isTabVisible('capital_accts') || settings.isTabVisible('special_accts')">
          <div class="nav-section-title" v-if="!sidebarCollapsed">Capital &amp; Investments</div>
          <router-link to="/capital/investments" v-if="settings.isTabVisible('investments')" class="nav-item" active-class="active">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
            <span v-if="!sidebarCollapsed">Investments</span>
          </router-link>
          <router-link to="/capital/fixed-assets" v-if="settings.isTabVisible('fixed_assets')" class="nav-item" active-class="active">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3" /></svg>
            <span v-if="!sidebarCollapsed">Fixed Assets</span>
          </router-link>
          <router-link to="/capital/depreciation" v-if="settings.isTabVisible('depreciation')" class="nav-item" active-class="active">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
            <span v-if="!sidebarCollapsed">Depreciation Entries</span>
          </router-link>
          <router-link to="/capital/intangible-assets" v-if="settings.isTabVisible('intangible_assets')" class="nav-item" active-class="active">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /></svg>
            <span v-if="!sidebarCollapsed">Intangible Assets</span>
          </router-link>
          <router-link to="/capital/amortization" v-if="settings.isTabVisible('amortization')" class="nav-item" active-class="active">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
            <span v-if="!sidebarCollapsed">Amortization Entries</span>
          </router-link>
          <router-link to="/capital/accounts" v-if="settings.isTabVisible('capital_accts')" class="nav-item" active-class="active">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
            <span v-if="!sidebarCollapsed">Capital Accounts</span>
          </router-link>
          <router-link to="/capital/special-accounts" v-if="settings.isTabVisible('special_accts')" class="nav-item" active-class="active">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
            <span v-if="!sidebarCollapsed">Special Accounts</span>
          </router-link>
        </div>

        <div class="nav-section" v-if="settings.isTabVisible('chart') || settings.isTabVisible('journal') || settings.isTabVisible('folders') || settings.isTabVisible('currencies')">
          <div class="nav-section-title" v-if="!sidebarCollapsed">Accounting</div>
          <router-link to="/accounting/chart" v-if="settings.isTabVisible('chart')" class="nav-item" active-class="active">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /></svg>
            <span v-if="!sidebarCollapsed">Chart of Accounts</span>
          </router-link>
          <router-link to="/accounting/journal-entries" v-if="settings.isTabVisible('journal')" class="nav-item" active-class="active">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="16" y2="17" /></svg>
            <span v-if="!sidebarCollapsed">Journal Entries</span>
          </router-link>
          <router-link to="/accounting/folders" v-if="settings.isTabVisible('folders')" class="nav-item" active-class="active">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" /></svg>
            <span v-if="!sidebarCollapsed">Folders</span>
          </router-link>
          <router-link to="/accounting/recurring" v-if="settings.isTabVisible('recurring')" class="nav-item" active-class="active">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" /></svg>
            <span v-if="!sidebarCollapsed">Recurring</span>
          </router-link>
          <router-link to="/accounting/budgets" v-if="settings.isTabVisible('budgets')" class="nav-item" active-class="active">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
            <span v-if="!sidebarCollapsed">Budgets</span>
          </router-link>
          <router-link to="/accounting/currencies" v-if="settings.isTabVisible('currencies')" class="nav-item" active-class="active">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" /><path d="M8 8c1.5-1 4-1.5 6 0s3 2.5 0 4-6 1-4.5 3.5 5.5 2 6.5 0" /><line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" /></svg>
            <span v-if="!sidebarCollapsed">Currencies</span>
          </router-link>
        </div>

        <div class="nav-section" v-if="settings.isTabVisible('trial_balance') || settings.isTabVisible('profit_loss') || settings.isTabVisible('balance_sheet') || settings.isTabVisible('aging') || settings.isTabVisible('cash_flow')">
          <div class="nav-section-title" v-if="!sidebarCollapsed">Reports</div>
          <router-link v-if="settings.isTabVisible('trial_balance')" to="/reports/trial-balance" class="nav-item" active-class="active">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
            <span v-if="!sidebarCollapsed">Trial Balance</span>
          </router-link>
          <router-link to="/reports/profit-loss" class="nav-item" active-class="active">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
            <span v-if="!sidebarCollapsed">Profit &amp; Loss</span>
          </router-link>
          <router-link v-if="settings.isTabVisible('balance_sheet')" to="/reports/balance-sheet" class="nav-item" active-class="active">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
            <span v-if="!sidebarCollapsed">Balance Sheet</span>
          </router-link>
          <router-link v-if="settings.isTabVisible('aging')" to="/reports/aging" class="nav-item" active-class="active">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            <span v-if="!sidebarCollapsed">Aging Report</span>
          </router-link>
          <router-link v-if="settings.isTabVisible('cash_flow')" to="/reports/cash-flow" class="nav-item" active-class="active">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
            <span v-if="!sidebarCollapsed">Cash Flow</span>
          </router-link>
        </div>

        <div class="nav-section">
          <router-link v-if="settings.isTabVisible('customize')" to="/customize" class="nav-item" active-class="active">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
            <span v-if="!sidebarCollapsed">Customize</span>
          </router-link>
          <router-link v-if="settings.isTabVisible('extensions')" to="/extensions" class="nav-item" active-class="active">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2H2v10l9.29 9.29a2 2 0 002.83 0l6.17-6.17a2 2 0 000-2.83L12 2z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>
            <span v-if="!sidebarCollapsed">Extensions</span>
          </router-link>
          <router-link v-if="settings.isTabVisible('businesses')" to="/businesses" class="nav-item" active-class="active">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" /></svg>
            <span v-if="!sidebarCollapsed">Businesses</span>
          </router-link>
          <router-link v-if="settings.isTabVisible('users')" to="/users" class="nav-item" active-class="active">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>
            <span v-if="!sidebarCollapsed">Users</span>
          </router-link>
          <router-link to="/backup" class="nav-item" active-class="active">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
            <span v-if="!sidebarCollapsed">Backup &amp; Password</span>
          </router-link>
          <router-link to="/settings" class="nav-item" active-class="active">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" /></svg>
            <span v-if="!sidebarCollapsed">Settings</span>
          </router-link>
          <router-link v-if="settings.isTabVisible('settings')" to="/settings/print" class="nav-item" active-class="active">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            <span v-if="!sidebarCollapsed">Print Settings</span>
          </router-link>
        </div>
      </nav>
    </aside>

    <main class="main-content" :class="{ 'dark-mode': darkMode }">
      <TopBar :dark-mode="darkMode" @toggle-sidebar="sidebarCollapsed = !sidebarCollapsed" @toggle-dark="darkMode = !darkMode" />
      <div class="page-content">
        <router-view />
      </div>
    </main>
    <Toast ref="toastRef" />
  </div>
</template>

<script setup>
import { ref, onMounted, provide } from 'vue'
import { useRoute } from 'vue-router'
import TopBar from '@/components/TopBar.vue'
import Toast from '@/components/Toast.vue'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'

const route = useRoute()
const auth = useAuthStore()
const settings = useSettingsStore()
const sidebarCollapsed = ref(false)
const darkMode = ref(false)

// Expose toast globally
import { useToastStore } from '@/stores/toast'
const toast = useToastStore()
provide('toast', toast)

onMounted(async () => {
  await auth.checkSession()
  try {
    await settings.load()
  } catch (e) {
    console.warn('Settings not loaded:', e)
  }
})
</script>
