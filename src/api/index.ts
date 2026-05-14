import { logApi } from '../lib/apiLogger';
import * as _auth from './auth';
import * as _invoice from './invoice';
import * as _dashboard from './dashboard';
import * as _seed from './seed';

// ── Auth ──────────────────────────────────────────
export const registerUser = logApi('Auth', 'registerUser', _auth.registerUser);
export const loginUser = logApi('Auth', 'loginUser', _auth.loginUser);
export const logoutUser = logApi('Auth', 'logoutUser', _auth.logoutUser);
export const fetchUserDoc = logApi('Auth', 'fetchUserDoc', _auth.fetchUserDoc);
export const getCurrentUser = logApi('Auth', 'getCurrentUser', _auth.getCurrentUser);

// ── Invoice ───────────────────────────────────────
export const fetchInvoices = logApi('Invoice', 'fetchInvoices', _invoice.fetchInvoices);
export const fetchInvoiceById = logApi('Invoice', 'fetchInvoiceById', _invoice.fetchInvoiceById);
export const createInvoice = logApi('Invoice', 'createInvoice', _invoice.createInvoice);
export const updateInvoice = logApi('Invoice', 'updateInvoice', _invoice.updateInvoice);
export const deleteInvoice = logApi('Invoice', 'deleteInvoice', _invoice.deleteInvoice);
export const subscribeInvoices = _invoice.subscribeInvoices; // 订阅模式，不套 timer

// ── Dashboard ─────────────────────────────────────
export const fetchAllInvoices = logApi('Dashboard', 'fetchAllInvoices', _dashboard.fetchAllInvoices);
// 纯计算函数，无 I/O，不需要日志
export const { computeStats, computeMonthlyRevenue, computeRecentInvoices } = _dashboard;

// ── Seed ──────────────────────────────────────────
export const seedTestData = logApi('Seed', 'seedTestData', _seed.seedTestData);
