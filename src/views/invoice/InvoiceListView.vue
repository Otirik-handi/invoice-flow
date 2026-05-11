<template>
  <div class="invoice-list">
    <div class="page-header">
      <span class="page-title">发票列表</span>
      <n-button type="primary" @click="router.push('/invoices/new')">
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
            :type="tab.key === activeTab ? 'primary' : 'default'"
            size="small"
          >
            {{ tab.label }}
          </n-button>
        </n-button-group>

        <n-input
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

      <n-data-table
        :columns="columns"
        :data="mockData"
        :bordered="false"
        :single-line="false"
        size="medium"
      />
    </n-space>
  </div>
</template>

<script setup lang="ts">
import { h } from 'vue';
import type { Component } from 'vue';
import { useRouter } from 'vue-router';
import { NButton, NButtonGroup, NDataTable, NIcon, NInput, NSpace, NTag } from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';
import {
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@vicons/antd';

const statusTabs = [
  { label: '全部', key: 'all' },
  { label: '草稿', key: 'draft' },
  { label: '已发送', key: 'sent' },
  { label: '已付款', key: 'paid' },
  { label: '已逾期', key: 'overdue' },
];

const router = useRouter();
const activeTab = 'all';

function renderIcon(icon: Component) {
  return () => h(NIcon, null, { default: () => h(icon) });
}

const statusMap: Record<string, { label: string; type: 'default' | 'info' | 'success' | 'error' }> =
  {
    draft: { label: '草稿', type: 'default' },
    sent: { label: '已发送', type: 'info' },
    paid: { label: '已付款', type: 'success' },
    overdue: { label: '已逾期', type: 'error' },
  };

const columns: DataTableColumns<MockInvoice> = [
  {
    title: '发票编号',
    key: 'invoiceNumber',
    width: 180,
  },
  {
    title: '客户名称',
    key: 'clientName',
    width: 140,
  },
  {
    title: '金额',
    key: 'amount',
    width: 120,
    align: 'right',
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
  },
  {
    title: '创建日期',
    key: 'createdAt',
    width: 120,
  },
  {
    title: '操作',
    key: 'actions',
    width: 140,
    render(row) {
      return h('div', { style: 'display: flex; gap: 8px; align-items: center;' }, [
        h(
          NButton,
          { text: true, size: 'small', type: 'primary', onClick: () => router.push(`/invoices/${row.id}`) },
          { default: () => h(NIcon, null, { default: () => h(EyeOutlined) }) },
        ),
        h(
          NButton,
          { text: true, size: 'small', type: 'primary', onClick: () => router.push(`/invoices/${row.id}/edit`) },
          { default: () => h(NIcon, null, { default: () => h(EditOutlined) }) },
        ),
        h(
          NButton,
          { text: true, size: 'small', type: 'error' },
          { default: () => h(NIcon, null, { default: () => h(DeleteOutlined) }) },
        ),
      ]);
    },
  },
];

interface MockInvoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  amount: string;
  status: string;
  dueDate: string;
  createdAt: string;
}

const mockData: MockInvoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-20260511-3829',
    clientName: '张三设计工作室',
    amount: '¥ 12,500.00',
    status: 'sent',
    dueDate: '2026-06-10',
    createdAt: '2026-05-11',
  },
  {
    id: '2',
    invoiceNumber: 'INV-20260510-1745',
    clientName: '李四科技公司',
    amount: '¥ 8,200.00',
    status: 'paid',
    dueDate: '2026-06-09',
    createdAt: '2026-05-10',
  },
  {
    id: '3',
    invoiceNumber: 'INV-20260509-6532',
    clientName: '王五咨询',
    amount: '¥ 3,600.00',
    status: 'draft',
    dueDate: '2026-06-08',
    createdAt: '2026-05-09',
  },
  {
    id: '4',
    invoiceNumber: 'INV-20260507-8210',
    clientName: '赵六贸易',
    amount: '¥ 25,000.00',
    status: 'overdue',
    dueDate: '2026-05-07',
    createdAt: '2026-05-07',
  },
  {
    id: '5',
    invoiceNumber: 'INV-20260505-4471',
    clientName: '陈七传媒',
    amount: '¥ 6,750.00',
    status: 'sent',
    dueDate: '2026-06-04',
    createdAt: '2026-05-05',
  },
  {
    id: '6',
    invoiceNumber: 'INV-20260503-9903',
    clientName: '孙八建筑',
    amount: '¥ 42,000.00',
    status: 'paid',
    dueDate: '2026-06-02',
    createdAt: '2026-05-03',
  },
  {
    id: '7',
    invoiceNumber: 'INV-20260428-2658',
    clientName: '周九教育',
    amount: '¥ 9,800.00',
    status: 'draft',
    dueDate: '2026-05-28',
    createdAt: '2026-04-28',
  },
  {
    id: '8',
    invoiceNumber: 'INV-20260425-5317',
    clientName: '吴十物流',
    amount: '¥ 15,300.00',
    status: 'overdue',
    dueDate: '2026-04-25',
    createdAt: '2026-04-25',
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
