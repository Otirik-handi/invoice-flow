import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import * as api from '../api/invoice';
import type { Invoice, CreateInvoicePayload, InvoiceStatus } from '../types';

export type SortField = 'createdAt' | 'dueDate' | 'total';

export const useInvoiceStore = defineStore('invoice', () => {
  const invoices = ref<Invoice[]>([]);
  const currentInvoice = ref<Invoice | null>(null);
  const loading = ref(false);

  // 前端筛选状态
  const statusFilter = ref<InvoiceStatus | 'all'>('all');
  const searchQuery = ref('');
  const sortField = ref<SortField>('createdAt');
  const sortOrder = ref<'asc' | 'desc'>('desc');

  // 实时订阅
  let unsubscribe: (() => void) | null = null;

  function startListening(userId: string) {
    stopListening();
    loading.value = true;
    unsubscribe = api.subscribeInvoices(userId, (data) => {
      invoices.value = data;
      loading.value = false;
    });
  }

  function stopListening() {
    unsubscribe?.();
    unsubscribe = null;
  }

  async function fetchInvoices(userId: string) {
    loading.value = true;
    try {
      invoices.value = await api.fetchInvoices(userId);
    } finally {
      loading.value = false;
    }
  }

  async function fetchInvoiceById(id: string) {
    currentInvoice.value = null;
    currentInvoice.value = await api.fetchInvoiceById(id);
  }

  async function createInvoice(data: CreateInvoicePayload) {
    loading.value = true;
    try {
      await api.createInvoice(data);
    } finally {
      loading.value = false;
    }
  }

  async function updateInvoice(id: string, data: Partial<Invoice>) {
    await api.updateInvoice(id, data);
  }

  async function deleteInvoice(id: string) {
    await api.deleteInvoice(id);
  }

  // 筛选 + 搜索 + 排序
  const filteredInvoices = computed(() => {
    let list = invoices.value;

    if (statusFilter.value !== 'all') {
      list = list.filter((inv) => inv.status === statusFilter.value);
    }

    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase();
      list = list.filter(
        (inv) =>
          inv.client.name.toLowerCase().includes(q) || inv.invoiceNumber.toLowerCase().includes(q),
      );
    }

    const field = sortField.value;
    const order = sortOrder.value;
    list = [...list].sort((a, b) => {
      const aVal = a[field]?.toString() ?? '';
      const bVal = b[field]?.toString() ?? '';
      return order === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });

    return list;
  });

  return {
    invoices,
    currentInvoice,
    loading,
    statusFilter,
    searchQuery,
    sortField,
    sortOrder,
    filteredInvoices,
    startListening,
    stopListening,
    fetchInvoices,
    fetchInvoiceById,
    createInvoice,
    updateInvoice,
    deleteInvoice,
  };
});
