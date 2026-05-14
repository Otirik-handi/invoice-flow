<template>
  <div class="invoice-list">
    <div class="page-header">
      <span class="page-title">发票列表</span>
      <n-button type="primary" @click="openCreateModal">
        <template #icon>
          <n-icon :component="PlusOutlined" />
        </template>
        创建发票
      </n-button>
    </div>

    <n-space vertical :size="16">
      <div class="filter-bar">
        <n-button-group>
          <n-button
            v-for="tab in statusTabs"
            :key="tab.key"
            :type="store.statusFilter === tab.key ? 'primary' : 'default'"
            size="small"
            @click="store.statusFilter = tab.key"
          >
            {{ tab.label }}
          </n-button>
        </n-button-group>

        <n-input
          v-model:value="store.searchQuery"
          :style="{ width: '240px' }"
          placeholder="搜索发票编号或客户名称…"
          clearable
          size="small"
        >
          <template #prefix>
            <n-icon :component="SearchOutlined" />
          </template>
        </n-input>
      </div>

      <n-spin :show="tableLoading">
        <n-data-table
          v-if="store.filteredInvoices.length > 0"
          :columns="columns"
          :data="store.filteredInvoices"
          :bordered="false"
          :single-line="false"
          size="medium"
          :row-key="(row: any) => row.id"
        />
        <n-empty v-else description="暂无发票" style="padding: 60px 0" />
      </n-spin>
    </n-space>

    <!-- Modals -->
    <InvoiceDetailModal
      v-model:show="showDetailModal"
      :invoice-id="detailInvoiceId"
      @edit="onDetailEdit"
    />
    <InvoiceFormModal v-model:show="showFormModal" :invoice-id="formInvoiceId" />
  </div>
</template>

<script setup lang="ts">
import { h, onMounted, onUnmounted, ref, watch } from 'vue';
import type { Component } from 'vue';
import { useDialog } from 'naive-ui';
import {
  NButton,
  NButtonGroup,
  NDataTable,
  NIcon,
  NInput,
  NSpace,
  NTag,
  NSpin,
  NEmpty,
} from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';
import {
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@vicons/antd';
import { useInvoiceStore } from '../../stores/invoiceStore';
import { getCurrentUser } from '../../api';
import type { Invoice } from '../../types';
import { format } from 'date-fns';
import InvoiceDetailModal from '../../components/invoice/InvoiceDetailModal.vue';
import InvoiceFormModal from '../../components/invoice/InvoiceFormModal.vue';

const dialog = useDialog();
const store = useInvoiceStore();
const tableLoading = ref(true);

// Modal state
const showDetailModal = ref(false);
const detailInvoiceId = ref<string | null>(null);
const showFormModal = ref(false);
const formInvoiceId = ref<string | null>(null);

function openDetail(id: string) {
  detailInvoiceId.value = id;
  showDetailModal.value = true;
}

function openCreateModal() {
  formInvoiceId.value = null;
  showFormModal.value = true;
}

function openEditModal(id: string) {
  formInvoiceId.value = id;
  showFormModal.value = true;
}

function onDetailEdit(invoiceId: string) {
  showDetailModal.value = false;
  openEditModal(invoiceId);
}

const statusTabs = [
  { label: '全部', key: 'all' as const },
  { label: '草稿', key: 'draft' as const },
  { label: '已发送', key: 'sent' as const },
  { label: '已付款', key: 'paid' as const },
  { label: '已逾期', key: 'overdue' as const },
];

onMounted(async () => {
  const fbUser = await getCurrentUser();
  if (fbUser) {
    store.startListening(fbUser.uid);
    // 等待订阅首次回调，store.loading 变为 false 后关闭本地 loading
    const stop = watch(
      () => store.loading,
      (val) => {
        if (!val) {
          tableLoading.value = false;
          stop();
        }
      },
      { immediate: true },
    );
  } else {
    tableLoading.value = false;
  }
});

onUnmounted(() => {
  store.stopListening();
});

function renderIcon(icon: Component) {
  return () => h(NIcon, null, { default: () => h(icon) });
}

const statusMap: Record<
  string,
  { label: string; type: 'default' | 'info' | 'success' | 'error' | 'warning' }
> = {
  draft: { label: '草稿', type: 'default' },
  sent: { label: '已发送', type: 'info' },
  paid: { label: '已付款', type: 'success' },
  overdue: { label: '已逾期', type: 'error' },
};

const currencySymbol: Record<string, string> = {
  CNY: '¥',
  USD: '$',
  EUR: '€',
};

function formatMoney(amount: number, currency: string): string {
  const symbol = currencySymbol[currency] || currency;
  return `${symbol} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatTs(ts: unknown): string {
  if (!ts) return '-';
  const date = (ts as { toDate?: () => Date }).toDate?.();
  return date ? format(date, 'yyyy-MM-dd') : '-';
}

const columns: DataTableColumns<Invoice> = [
  {
    title: '发票编号',
    key: 'invoiceNumber',
    width: 180,
  },
  {
    title: '客户名称',
    key: 'client.name',
    width: 140,
    render(row) {
      return row.client?.name || '-';
    },
  },
  {
    title: '金额',
    key: 'total',
    width: 130,
    align: 'right',
    render(row) {
      return formatMoney(row.total, row.currency);
    },
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render(row) {
      const cfg = statusMap[row.status];
      return h(NTag, { type: cfg.type, size: 'small', round: true }, { default: () => cfg.label });
    },
  },
  {
    title: '到期日期',
    key: 'dueDate',
    width: 120,
    render(row) {
      return formatTs(row.dueDate);
    },
  },
  {
    title: '创建日期',
    key: 'createdAt',
    width: 120,
    render(row) {
      return formatTs(row.createdAt);
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 140,
    render(row) {
      return h('div', { style: 'display: flex; gap: 8px; align-items: center;' }, [
        h(
          NButton,
          {
            text: true,
            size: 'medium',
            type: 'primary',
            onClick: () => openDetail(row.id),
          },
          { default: () => h(NIcon, null, { default: () => h(EyeOutlined) }) },
        ),
        h(
          NButton,
          {
            text: true,
            size: 'medium',
            type: 'warning',
            onClick: () => openEditModal(row.id),
          },
          { default: () => h(NIcon, null, { default: () => h(EditOutlined) }) },
        ),
        h(
          NButton,
          {
            text: true,
            size: 'medium',
            type: 'error',
            onClick: () => {
              const id = row.id;
              dialog.warning({
                title: '确认删除',
                content: '确定要删除此发票吗？此操作不可撤销。',
                positiveText: '删除',
                negativeText: '取消',
                onPositiveClick: async () => {
                  await store.deleteInvoice(id);
                },
              });
            },
          },
          { default: () => h(NIcon, null, { default: () => h(DeleteOutlined) }) },
        ),
      ]);
    },
  },
];
</script>

<style scoped>
.invoice-list {
  padding: 24px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
}

.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}
</style>
