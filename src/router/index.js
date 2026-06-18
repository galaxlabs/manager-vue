import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const DocForm = () => import('@/components/DocForm.vue')

function formRoute(path, doctype, title) {
  return {
    path,
    component: DocForm,
    props: { doctype, title },
  }
}

const routes = [
  { path: '/', name: 'Dashboard', component: () => import('@/pages/Dashboard.vue') },

  // Banking & Cash
  { path: '/banking/accounts', name: 'BankAccounts', component: () => import('@/pages/Accounts.vue') },
  formRoute('/banking/accounts/new', 'Account', 'Bank Account'),
  formRoute('/banking/accounts/:id', 'Account', 'Bank Account'),
  { path: '/banking/receipts', name: 'Receipts', component: () => import('@/pages/Receipts.vue') },
  formRoute('/banking/receipts/new', 'Receipt', 'Receipt'),
  formRoute('/banking/receipts/:id', 'Receipt', 'Receipt'),
  { path: '/banking/payments', name: 'Payments', component: () => import('@/pages/Payments.vue') },
  formRoute('/banking/payments/new', 'Payment', 'Payment'),
  formRoute('/banking/payments/:id', 'Payment', 'Payment'),
  { path: '/banking/transfers', name: 'AccountTransfers', component: () => import('@/pages/AccountTransfers.vue') },
  formRoute('/banking/transfers/new', 'Account Transfer', 'Transfer'),
  formRoute('/banking/transfers/:id', 'Account Transfer', 'Transfer'),
  { path: '/banking/reconciliations', name: 'BankReconciliations', component: () => import('@/pages/GenericList.vue'), props: { doctype: 'Bank Reconciliation', title: 'Bank Reconciliations' } },
  formRoute('/banking/reconciliations/new', 'Bank Reconciliation', 'Reconciliation'),
  formRoute('/banking/reconciliations/:id', 'Bank Reconciliation', 'Reconciliation'),
  { path: '/banking/expense-claims', name: 'ExpenseClaims', component: () => import('@/pages/GenericList.vue'), props: { doctype: 'Expense Claim', title: 'Expense Claims' } },
  formRoute('/banking/expense-claims/new', 'Expense Claim', 'Expense Claim'),
  formRoute('/banking/expense-claims/:id', 'Expense Claim', 'Expense Claim'),

  // Sales
  { path: '/sales/customers', name: 'Customers', component: () => import('@/pages/Customers.vue') },
  formRoute('/sales/customers/new', 'Customer', 'Customer'),
  formRoute('/sales/customers/:id', 'Customer', 'Customer'),
  { path: '/sales/quotes', name: 'SalesQuotes', component: () => import('@/pages/SalesQuotes.vue') },
  formRoute('/sales/quotes/new', 'Sales Quote', 'Quote'),
  formRoute('/sales/quotes/:id', 'Sales Quote', 'Quote'),
  { path: '/sales/orders', name: 'SalesOrders', component: () => import('@/pages/SalesOrders.vue') },
  formRoute('/sales/orders/new', 'Sales Order', 'Order'),
  formRoute('/sales/orders/:id', 'Sales Order', 'Order'),
  { path: '/sales/invoices', name: 'SalesInvoices', component: () => import('@/pages/SalesInvoices.vue') },
  formRoute('/sales/invoices/new', 'Sales Invoice', 'Invoice'),
  formRoute('/sales/invoices/:id', 'Sales Invoice', 'Invoice'),
  { path: '/sales/credit-notes', name: 'CreditNotes', component: () => import('@/pages/CreditNotes.vue') },
  formRoute('/sales/credit-notes/new', 'Credit Note', 'Credit Note'),
  formRoute('/sales/credit-notes/:id', 'Credit Note', 'Credit Note'),
  { path: '/sales/late-fees', name: 'LatePaymentFees', component: () => import('@/pages/GenericList.vue'), props: { doctype: 'Late Payment Fee', title: 'Late Payment Fees' } },
  formRoute('/sales/late-fees/new', 'Late Payment Fee', 'Late Payment Fee'),
  formRoute('/sales/late-fees/:id', 'Late Payment Fee', 'Late Payment Fee'),
  { path: '/sales/billable-time', name: 'BillableTime', component: () => import('@/pages/GenericList.vue'), props: { doctype: 'Billable Time', title: 'Billable Time' } },
  formRoute('/sales/billable-time/new', 'Billable Time', 'Billable Time'),
  formRoute('/sales/billable-time/:id', 'Billable Time', 'Billable Time'),
  { path: '/sales/withholding', name: 'WithholdingTaxReceipts', component: () => import('@/pages/GenericList.vue'), props: { doctype: 'Withholding Tax Receipt', title: 'Withholding Tax Receipts' } },
  formRoute('/sales/withholding/new', 'Withholding Tax Receipt', 'Withholding Tax Receipt'),
  formRoute('/sales/withholding/:id', 'Withholding Tax Receipt', 'Withholding Tax Receipt'),
  { path: '/sales/delivery-notes', name: 'DeliveryNotes', component: () => import('@/pages/DeliveryNotes.vue') },
  formRoute('/sales/delivery-notes/new', 'Delivery Note', 'Delivery Note'),
  formRoute('/sales/delivery-notes/:id', 'Delivery Note', 'Delivery Note'),

  // Purchases
  { path: '/purchases/suppliers', name: 'Suppliers', component: () => import('@/pages/Suppliers.vue') },
  formRoute('/purchases/suppliers/new', 'Supplier', 'Supplier'),
  formRoute('/purchases/suppliers/:id', 'Supplier', 'Supplier'),
  { path: '/purchases/quotes', name: 'PurchaseQuotes', component: () => import('@/pages/PurchaseQuotes.vue') },
  formRoute('/purchases/quotes/new', 'Purchase Quote', 'Purchase Quote'),
  formRoute('/purchases/quotes/:id', 'Purchase Quote', 'Purchase Quote'),
  { path: '/purchases/orders', name: 'PurchaseOrders', component: () => import('@/pages/PurchaseOrders.vue') },
  formRoute('/purchases/orders/new', 'Purchase Order', 'Purchase Order'),
  formRoute('/purchases/orders/:id', 'Purchase Order', 'Purchase Order'),
  { path: '/purchases/invoices', name: 'PurchaseInvoices', component: () => import('@/pages/PurchaseInvoices.vue') },
  formRoute('/purchases/invoices/new', 'Purchase Invoice', 'Purchase Invoice'),
  formRoute('/purchases/invoices/:id', 'Purchase Invoice', 'Purchase Invoice'),
  { path: '/purchases/debit-notes', name: 'DebitNotes', component: () => import('@/pages/DebitNotes.vue') },
  formRoute('/purchases/debit-notes/new', 'Debit Note', 'Debit Note'),
  formRoute('/purchases/debit-notes/:id', 'Debit Note', 'Debit Note'),
  { path: '/purchases/goods-receipts', name: 'GoodsReceipts', component: () => import('@/pages/GoodsReceipts.vue') },
  formRoute('/purchases/goods-receipts/new', 'Goods Receipt', 'Goods Receipt'),
  formRoute('/purchases/goods-receipts/:id', 'Goods Receipt', 'Goods Receipt'),

  // Projects
  { path: '/projects', name: 'Projects', component: () => import('@/pages/Projects.vue') },
  formRoute('/projects/new', 'Project', 'Project'),
  formRoute('/projects/:id', 'Project', 'Project'),

  // Inventory
  { path: '/inventory/items', name: 'Items', component: () => import('@/pages/Items.vue') },
  formRoute('/inventory/items/new', 'Item', 'Item'),
  formRoute('/inventory/items/:id', 'Item', 'Item'),
  { path: '/inventory/transfers', name: 'InventoryTransfers', component: () => import('@/pages/GenericList.vue'), props: { doctype: 'Inventory Transfer', title: 'Inventory Transfers' } },
  formRoute('/inventory/transfers/new', 'Inventory Transfer', 'Inventory Transfer'),
  formRoute('/inventory/transfers/:id', 'Inventory Transfer', 'Inventory Transfer'),
  { path: '/inventory/write-offs', name: 'InventoryWriteOffs', component: () => import('@/pages/GenericList.vue'), props: { doctype: 'Inventory Write-off', title: 'Inventory Write-offs' } },
  formRoute('/inventory/write-offs/new', 'Inventory Write-off', 'Inventory Write-off'),
  formRoute('/inventory/write-offs/:id', 'Inventory Write-off', 'Inventory Write-off'),
  { path: '/inventory/production', name: 'ProductionOrders', component: () => import('@/pages/GenericList.vue'), props: { doctype: 'Production Order', title: 'Production Orders' } },
  formRoute('/inventory/production/new', 'Production Order', 'Production Order'),
  formRoute('/inventory/production/:id', 'Production Order', 'Production Order'),
  { path: '/inventory/stock-balance', name: 'StockBalance', component: () => import('@/pages/StockBalance.vue') },

  // Import
  { path: '/import', name: 'Import', component: () => import('@/pages/Import.vue') },

  // Payroll
  { path: '/payroll/employees', name: 'Employees', component: () => import('@/pages/Employees.vue') },
  formRoute('/payroll/employees/new', 'Employee', 'Employee'),
  formRoute('/payroll/employees/:id', 'Employee', 'Employee'),
  { path: '/payroll/payslips', name: 'Payslips', component: () => import('@/pages/GenericList.vue'), props: { doctype: 'Payslip', title: 'Payslips' } },
  formRoute('/payroll/payslips/new', 'Payslip', 'Payslip'),
  formRoute('/payroll/payslips/:id', 'Payslip', 'Payslip'),

  // Capital & Investments
  { path: '/capital/investments', name: 'Investments', component: () => import('@/pages/GenericList.vue'), props: { doctype: 'Investment', title: 'Investments' } },
  formRoute('/capital/investments/new', 'Investment', 'Investment'),
  formRoute('/capital/investments/:id', 'Investment', 'Investment'),
  { path: '/capital/fixed-assets', name: 'FixedAssets', component: () => import('@/pages/FixedAssets.vue') },
  formRoute('/capital/fixed-assets/new', 'Fixed Asset', 'Fixed Asset'),
  formRoute('/capital/fixed-assets/:id', 'Fixed Asset', 'Fixed Asset'),
  { path: '/capital/depreciation', name: 'DepreciationEntries', component: () => import('@/pages/GenericList.vue'), props: { doctype: 'Depreciation Entry', title: 'Depreciation Entries' } },
  formRoute('/capital/depreciation/new', 'Depreciation Entry', 'Depreciation Entry'),
  formRoute('/capital/depreciation/:id', 'Depreciation Entry', 'Depreciation Entry'),
  { path: '/capital/intangible-assets', name: 'IntangibleAssets', component: () => import('@/pages/GenericList.vue'), props: { doctype: 'Intangible Asset', title: 'Intangible Assets' } },
  formRoute('/capital/intangible-assets/new', 'Intangible Asset', 'Intangible Asset'),
  formRoute('/capital/intangible-assets/:id', 'Intangible Asset', 'Intangible Asset'),
  { path: '/capital/amortization', name: 'AmortizationEntries', component: () => import('@/pages/GenericList.vue'), props: { doctype: 'Amortization Entry', title: 'Amortization Entries' } },
  formRoute('/capital/amortization/new', 'Amortization Entry', 'Amortization Entry'),
  formRoute('/capital/amortization/:id', 'Amortization Entry', 'Amortization Entry'),
  { path: '/capital/capital-accounts', name: 'CapitalAccounts', component: () => import('@/pages/GenericList.vue'), props: { doctype: 'Account', title: 'Capital Accounts', baseEditPath: '/banking/accounts' } },
  { path: '/capital/special-accounts', name: 'SpecialAccounts', component: () => import('@/pages/GenericList.vue'), props: { doctype: 'Account', title: 'Special Accounts', baseEditPath: '/banking/accounts' } },

  // Accounting
  { path: '/accounting/chart', name: 'ChartOfAccounts', component: () => import('@/pages/Accounts.vue') },
  { path: '/accounting/journal-entries', name: 'JournalEntries', component: () => import('@/pages/JournalEntries.vue') },
  formRoute('/accounting/journal-entries/new', 'Journal Entry', 'Journal Entry'),
  formRoute('/accounting/journal-entries/:id', 'Journal Entry', 'Journal Entry'),
  { path: '/accounting/folders', name: 'Folders', component: () => import('@/pages/GenericList.vue'), props: { doctype: 'Folder', title: 'Folders' } },
  formRoute('/accounting/folders/new', 'Folder', 'Folder'),
  formRoute('/accounting/folders/:id', 'Folder', 'Folder'),
  { path: '/accounting/payment-terms', name: 'PaymentTerms', component: () => import('@/pages/PaymentTerms.vue') },

  // Reports
  { path: '/reports/trial-balance', name: 'TrialBalance', component: () => import('@/pages/TrialBalance.vue') },
  { path: '/reports/profit-loss', name: 'ProfitAndLoss', component: () => import('@/pages/ProfitAndLoss.vue') },
  { path: '/reports/balance-sheet', name: 'BalanceSheet', component: () => import('@/pages/BalanceSheet.vue') },
  { path: '/reports/aging', name: 'AgingReport', component: () => import('@/pages/AgingReport.vue') },
  { path: '/reports/cash-flow', name: 'CashFlow', component: () => import('@/pages/CashFlow.vue') },

  // Recurring & Budget
  { path: '/accounting/recurring', name: 'RecurringTransactions', component: () => import('@/pages/RecurringTransactions.vue') },
  formRoute('/accounting/recurring/new', 'Recurring Transaction', 'Recurring Transaction'),
  formRoute('/accounting/recurring/:id', 'Recurring Transaction', 'Recurring Transaction'),
  { path: '/accounting/budgets', name: 'Budgets', component: () => import('@/pages/Budgets.vue') },
  formRoute('/accounting/budgets/new', 'Budget', 'Budget'),
  formRoute('/accounting/budgets/:id', 'Budget', 'Budget'),
  { path: '/accounting/currencies', name: 'Currencies', component: () => import('@/pages/GenericList.vue'), props: { doctype: 'Currency', title: 'Currencies' } },
  formRoute('/accounting/currencies/new', 'Currency', 'Currency'),
  formRoute('/accounting/currencies/:id', 'Currency', 'Currency'),
  { path: '/accounting/exchange-rates', name: 'ExchangeRates', component: () => import('@/pages/GenericList.vue'), props: { doctype: 'Exchange Rate', title: 'Exchange Rates' } },
  formRoute('/accounting/exchange-rates/new', 'Exchange Rate', 'Exchange Rate'),
  formRoute('/accounting/exchange-rates/:id', 'Exchange Rate', 'Exchange Rate'),

  // Login
  { path: '/login', name: 'Login', component: () => import('@/pages/Login.vue'), meta: { noAuth: true, noLayout: true } },

  // Settings, Admin, Extensions
  { path: '/customize', name: 'Customize', component: () => import('@/pages/Customize.vue') },
  { path: '/settings', name: 'Settings', component: () => import('@/pages/Settings.vue') },
  { path: '/settings/print', name: 'PrintSettings', component: () => import('@/pages/PrintSettings.vue') },
  { path: '/extensions', name: 'Extensions', component: () => import('@/pages/Extensions.vue') },
  { path: '/businesses', name: 'Businesses', component: () => import('@/pages/Businesses.vue') },
  { path: '/users', name: 'Users', component: () => import('@/pages/Users.vue') },
  { path: '/backup', name: 'BackupRestore', component: () => import('@/pages/BackupRestore.vue') },
  { path: '/price-lists', name: 'PriceLists', component: () => import('@/pages/PriceLists.vue') },

  // Print Document
  { path: '/print/:doctype/:name', name: 'PrintDocument', component: () => import('@/pages/PrintDocument.vue'), props: true },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to) => {
  if (to.meta?.noAuth) return true
  const auth = useAuthStore()
  const ok = await auth.checkSession()
  if (!ok) return '/login'
  return true
})

export default router
