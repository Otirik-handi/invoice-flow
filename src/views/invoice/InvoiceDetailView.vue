<template>
  <div class="detail-page">
    <div class="page-header">
      <span class="page-title">发票详情</span>
      <div class="header-actions">
        <n-button size="small">编辑</n-button>
        <n-button size="small">导出 PDF</n-button>
        <n-button size="small">打印</n-button>
        <n-button size="small" type="error">删除</n-button>
        <n-dropdown :options="statusOptions">
          <n-button size="small" type="primary">
            更改状态
            <template #suffix>
              <n-icon :component="DownOutlined" />
            </template>
          </n-button>
        </n-dropdown>
      </div>
    </div>

    <div class="invoice-card">
      <div class="invoice-head">
        <div class="invoice-head-left">
          <div class="invoice-title">发票</div>
          <div class="invoice-number">{{ mock.invoiceNumber }}</div>
        </div>
        <div class="invoice-head-right">
          <n-tag :type="statusMap[mock.status].type" round size="medium">
            {{ statusMap[mock.status].label }}
          </n-tag>
        </div>
      </div>

      <n-divider />

      <div class="info-grid">
        <div class="info-block">
          <div class="info-label">发票编号</div>
          <div class="info-value">{{ mock.invoiceNumber }}</div>
        </div>
        <div class="info-block">
          <div class="info-label">创建日期</div>
          <div class="info-value">{{ mock.createdAt }}</div>
        </div>
        <div class="info-block">
          <div class="info-label">到期日期</div>
          <div class="info-value">{{ mock.dueDate }}</div>
        </div>
        <div class="info-block">
          <div class="info-label">货币</div>
          <div class="info-value">{{ mock.currency }}</div>
        </div>
      </div>

      <n-divider />

      <div class="section-title">客户信息</div>
      <div class="info-grid">
        <div class="info-block">
          <div class="info-label">客户名称</div>
          <div class="info-value">{{ mock.client.name }}</div>
        </div>
        <div class="info-block">
          <div class="info-label">客户邮箱</div>
          <div class="info-value">{{ mock.client.email }}</div>
        </div>
        <div class="info-block">
          <div class="info-label">客户地址</div>
          <div class="info-value">{{ mock.client.address || '—' }}</div>
        </div>
        <div class="info-block">
          <div class="info-label">客户电话</div>
          <div class="info-value">{{ mock.client.phone || '—' }}</div>
        </div>
      </div>

      <n-divider />

      <div class="section-title">商品明细</div>
      <n-data-table
        :columns="itemColumns"
        :data="mock.items"
        :bordered="false"
        :single-line="false"
        size="small"
        :bottom-bordered="true"
      />

      <n-divider />

      <div class="amount-summary">
        <div class="amount-row">
          <span class="amount-label">小计</span>
          <span class="amount-value">{{ formatMoney(mock.subtotal, mock.currency) }}</span>
        </div>
        <div class="amount-row">
          <span class="amount-label">税率</span>
          <span class="amount-value">{{ mock.taxRate }}%</span>
        </div>
        <div class="amount-row">
          <span class="amount-label">税额</span>
          <span class="amount-value">{{ formatMoney(mock.taxAmount, mock.currency) }}</span>
        </div>
        <n-divider style="margin: 8px 0" />
        <div class="amount-row total">
          <span class="amount-label">总计</span>
          <span class="amount-value total-value">{{ formatMoney(mock.total, mock.currency) }}</span>
        </div>
      </div>

      <n-divider v-if="mock.notes" />

      <div v-if="mock.notes" class="notes-block">
        <div class="section-title">备注</div>
        <div class="notes-content">{{ mock.notes }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { h } from 'vue';
import {
  NButton,
  NDataTable,
  NDivider,
  NDropdown,
  NIcon,
  NTag,
} from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';
import { DownOutlined } from '@vicons/antd';

const statusMap: Record<string, { label: string; type: 'default' | 'info' | 'success' | 'error' }> = {
  draft: { label: '草稿', type: 'default' },
  sent: { label: '已发送', type: 'info' },
  paid: { label: '已付款', type: 'success' },
  overdue: { label: '已逾期', type: 'error' },
};

const statusOptions = [
  { label: '标记为已发送', key: 'sent' },
  { label: '标记为已付款', key: 'paid' },
  { label: '标记为已逾期', key: 'overdue' },
];

interface MockItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface MockClient {
  name: string;
  email: string;
  address: string;
  phone: string;
}

interface MockInvoice {
  invoiceNumber: string;
  status: string;
  createdAt: string;
  dueDate: string;
  currency: string;
  client: MockClient;
  items: MockItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  notes: string;
}

const mock: MockInvoice = {
  invoiceNumber: 'INV-20260511-3829',
  status: 'sent',
  createdAt: '2026-05-11',
  dueDate: '2026-06-10',
  currency: 'CNY',
  client: {
    name: '张三设计工作室',
    email: 'zhangsan@example.com',
    address: '北京市朝阳区建国路88号',
    phone: '138-0000-0000',
  },
  items: [
    { description: 'UI 设计服务 - 首页改版', quantity: 1, unitPrice: 8000, total: 8000 },
    { description: '移动端适配设计', quantity: 1, unitPrice: 3000, total: 3000 },
    { description: '图标素材包（24枚）', quantity: 24, unitPrice: 50, total: 1200 },
  ],
  subtotal: 12200,
  taxRate: 6,
  taxAmount: 732,
  total: 12932,
  notes: '感谢您的信任！请在到期日前完成支付。',
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

const itemColumns: DataTableColumns<MockItem> = [
  { title: '描述', key: 'description' },
  { title: '数量', key: 'quantity', width: 80, align: 'center' },
  {
    title: '单价',
    key: 'unitPrice',
    width: 120,
    align: 'right',
    render(row) {
      return formatMoney(row.unitPrice, mock.currency);
    },
  },
  {
    title: '金额',
    key: 'total',
    width: 120,
    align: 'right',
    render(row) {
      return formatMoney(row.total, mock.currency);
    },
  },
];
</script>

<style scoped>
.detail-page {
  padding: 24px;
  max-width: 860px;
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

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.invoice-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 32px;
}

.invoice-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.invoice-title {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
}

.invoice-number {
  margin-top: 4px;
  font-size: 14px;
  color: #6b7280;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 32px;
}

.info-label {
  font-size: 12px;
  color: #9ca3af;
  margin-bottom: 2px;
}

.info-value {
  font-size: 14px;
  color: #1f2937;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
}

.amount-summary {
  width: 280px;
  margin-left: auto;
}

.amount-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.amount-label {
  font-size: 14px;
  color: #6b7280;
}

.amount-value {
  font-size: 14px;
  color: #1f2937;
}

.amount-row.total {
  padding: 8px 0;
}

.total-value {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
}

.notes-block {
  margin-top: 4px;
}

.notes-content {
  font-size: 14px;
  color: #6b7280;
  white-space: pre-wrap;
}
</style>
