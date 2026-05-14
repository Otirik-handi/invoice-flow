import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import type { Invoice } from '../types';

export interface DashboardStats {
  totalInvoices: number;
  totalRevenue: number;
  pendingCount: number;
  overdueCount: number;
  statusDistribution: Array<{ label: string; count: number; color: string; percent: number }>;
}

export interface MonthlyRevenue {
  label: string;
  value: number;
  display: string;
  percent: number;
}

function formatMoney(amount: number): string {
  if (amount >= 1000) {
    return '¥' + (amount / 1000).toFixed(0) + 'k';
  }
  return '¥' + amount.toFixed(0);
}

function calcPercent(value: number, max: number): number {
  if (max === 0) return 0;
  return Math.round((value / max) * 100);
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: '草稿', color: '#909399' },
  sent: { label: '已发送', color: '#409eff' },
  paid: { label: '已付款', color: '#67c23a' },
  overdue: { label: '已逾期', color: '#f56c6c' },
};

export async function fetchAllInvoices(userId: string): Promise<Invoice[]> {
  const q = query(
    collection(db, 'invoices'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Invoice);
}

export function computeStats(invoices: Invoice[]): DashboardStats {
  const totalInvoices = invoices.length;
  const totalRevenue = invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.total, 0);
  const pendingCount = invoices.filter((inv) => inv.status === 'sent').length;
  const overdueCount = invoices.filter((inv) => inv.status === 'overdue').length;

  const statusCounts: Record<string, number> = {};
  for (const inv of invoices) {
    statusCounts[inv.status] = (statusCounts[inv.status] || 0) + 1;
  }

  const statusDistribution = Object.entries(STATUS_LABELS).map(([key, cfg]) => ({
    label: cfg.label,
    count: statusCounts[key] || 0,
    color: cfg.color,
    percent: totalInvoices ? +((statusCounts[key] || 0) / totalInvoices * 100).toFixed(1) : 0,
  }));

  return { totalInvoices, totalRevenue, pendingCount, overdueCount, statusDistribution };
}

export function computeMonthlyRevenue(invoices: Invoice[]): MonthlyRevenue[] {
  const now = new Date();
  const months: Array<{ year: number; month: number }> = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
  }

  const revenueByMonth = months.map(({ year, month }) => {
    const monthLabel = `${month}月`;
    const total = invoices
      .filter((inv) => {
        const ts = (inv.createdAt as unknown as { toDate?: () => Date }).toDate?.();
        if (!ts) return false;
        return ts.getFullYear() === year && ts.getMonth() + 1 === month;
      })
      .reduce((sum, inv) => sum + inv.total, 0);

    return { label: monthLabel, value: total, display: formatMoney(total), percent: 0 };
  });

  const maxVal = Math.max(...revenueByMonth.map((r) => r.value), 1);
  revenueByMonth.forEach((r) => (r.percent = calcPercent(r.value, maxVal)));

  return revenueByMonth;
}

export function computeRecentInvoices(invoices: Invoice[], count = 5) {
  return invoices.slice(0, count).map((inv) => {
    const ts = (inv.createdAt as unknown as { toDate?: () => Date }).toDate?.();
    return {
      invoiceNumber: inv.invoiceNumber,
      client: inv.client?.name || '-',
      amount: '¥ ' + inv.total.toLocaleString('en-US', { minimumFractionDigits: 2 }),
      status: inv.status,
      date: ts ? ts.toISOString().slice(0, 10) : '-',
    };
  });
}
