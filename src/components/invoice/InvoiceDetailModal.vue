<template>
  <n-modal
    :show="show"
    @update:show="$emit('update:show', $event)"
    preset="card"
    title="发票详情"
    style="max-width: 780px; width: 100%;"
    :mask-closable="false"
    :segmented="{ content: true }"
  >
    <!-- loading -->
    <div v-if="loading" style="text-align: center; padding: 40px 0">
      <n-spin size="large" />
    </div>

    <!-- error -->
    <n-result v-else-if="error" status="404" title="发票未找到" :description="error">
      <template #footer>
        <n-button @click="close">关闭</n-button>
      </template>
    </n-result>

    <!-- detail -->
    <template v-else-if="invoice">
      <div class="action-bar">
        <n-button size="small" @click="handleEdit">编辑</n-button>
        <n-button size="small" @click="handlePrint">打印</n-button>
        <n-button size="small" type="error" @click="handleDelete">删除</n-button>
        <n-dropdown :options="statusOptions" @select="handleStatusChange">
          <n-button size="small" type="primary">
            更改状态
            <template #suffix>
              <n-icon :component="DownOutlined" />
            </template>
          </n-button>
        </n-dropdown>
      </div>

      <div class="invoice-head">
        <div class="invoice-head-left">
          <div class="invoice-title">发票</div>
          <div class="invoice-number">{{ invoice.invoiceNumber }}</div>
        </div>
        <n-tag :type="statusMap[invoice.status]?.type || 'default'" round size="medium">
          {{ statusMap[invoice.status]?.label || invoice.status }}
        </n-tag>
      </div>

      <n-divider />

      <div class="info-grid">
        <div class="info-block">
          <div class="info-label">发票编号</div>
          <div class="info-value">{{ invoice.invoiceNumber }}</div>
        </div>
        <div class="info-block">
          <div class="info-label">创建日期</div>
          <div class="info-value">{{ formatTs(invoice.createdAt) }}</div>
        </div>
        <div class="info-block">
          <div class="info-label">到期日期</div>
          <div class="info-value">{{ formatTs(invoice.dueDate) }}</div>
        </div>
        <div class="info-block">
          <div class="info-label">货币</div>
          <div class="info-value">{{ invoice.currency }}</div>
        </div>
      </div>

      <n-divider />

      <div class="section-title">客户信息</div>
      <div class="info-grid">
        <div class="info-block">
          <div class="info-label">客户名称</div>
          <div class="info-value">{{ invoice.client.name }}</div>
        </div>
        <div class="info-block">
          <div class="info-label">客户邮箱</div>
          <div class="info-value">{{ invoice.client.email }}</div>
        </div>
        <div class="info-block">
          <div class="info-label">客户地址</div>
          <div class="info-value">{{ invoice.client.address || '—' }}</div>
        </div>
        <div class="info-block">
          <div class="info-label">客户电话</div>
          <div class="info-value">{{ invoice.client.phone || '—' }}</div>
        </div>
      </div>

      <n-divider />

      <div class="section-title">商品明细</div>
      <n-data-table
        :columns="itemColumns"
        :data="invoice.items"
        :bordered="false"
        :single-line="false"
        size="small"
        :bottom-bordered="true"
      />

      <n-divider />

      <div class="amount-summary">
        <div class="amount-row">
          <span class="amount-label">小计</span>
          <span class="amount-value">{{ formatMoney(invoice.subtotal, invoice.currency) }}</span>
        </div>
        <div class="amount-row">
          <span class="amount-label">税率</span>
          <span class="amount-value">{{ invoice.taxRate }}%</span>
        </div>
        <div class="amount-row">
          <span class="amount-label">税额</span>
          <span class="amount-value">{{ formatMoney(invoice.taxAmount, invoice.currency) }}</span>
        </div>
        <n-divider style="margin: 8px 0" />
        <div class="amount-row total">
          <span class="amount-label">总计</span>
          <span class="amount-value total-value">{{ formatMoney(invoice.total, invoice.currency) }}</span>
        </div>
      </div>

      <n-divider v-if="invoice.notes" />

      <div v-if="invoice.notes" class="notes-block">
        <div class="section-title">备注</div>
        <div class="notes-content">{{ invoice.notes }}</div>
      </div>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useDialog, useMessage } from 'naive-ui';
import {
  NButton,
  NDataTable,
  NDivider,
  NDropdown,
  NIcon,
  NModal,
  NResult,
  NSpace,
  NSpin,
  NTag,
} from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';
import { DownOutlined } from '@vicons/antd';
import { useInvoiceStore } from '../../stores/invoiceStore';
import type { Invoice, InvoiceStatus } from '../../types';
import { format } from 'date-fns';

const props = withDefaults(
  defineProps<{
    show: boolean;
    invoiceId: string | null;
  }>(),
  { invoiceId: null },
);

const emit = defineEmits<{
  'update:show': [value: boolean];
  edit: [invoiceId: string];
}>();

const dialog = useDialog();
const message = useMessage();
const store = useInvoiceStore();

const loading = ref(false);
const error = ref('');
const invoice = ref<Invoice | null>(null);

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

function close() {
  emit('update:show', false);
}

watch(
  () => props.show,
  async (val) => {
    if (val && props.invoiceId) {
      loading.value = true;
      error.value = '';
      invoice.value = null;
      try {
        await store.fetchInvoiceById(props.invoiceId);
        if (store.currentInvoice) {
          invoice.value = { ...store.currentInvoice };
        } else {
          error.value = '该发票不存在或已被删除';
        }
      } catch {
        error.value = '加载发票失败，请稍后重试';
      } finally {
        loading.value = false;
      }
    }
  },
);

async function handleStatusChange(key: string) {
  if (!props.invoiceId) return;
  try {
    await store.updateInvoice(props.invoiceId, { status: key as InvoiceStatus });
    if (invoice.value) invoice.value.status = key as InvoiceStatus;
    message.success('状态更新成功');
  } catch {
    message.error('状态更新失败');
  }
}

function handleDelete() {
  if (!props.invoiceId) return;
  dialog.warning({
    title: '确认删除',
    content: '确定要删除此发票吗？此操作不可撤销。',
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await store.deleteInvoice(props.invoiceId!);
        message.success('发票已删除');
        close();
      } catch {
        message.error('删除失败');
      }
    },
  });
}

function handleEdit() {
  if (props.invoiceId) {
    emit('edit', props.invoiceId);
  }
}

function handlePrint() {
  window.print();
}

const itemColumns: DataTableColumns<Invoice['items'][0]> = [
  { title: '描述', key: 'description' },
  { title: '数量', key: 'quantity', width: 80, align: 'center' },
  {
    title: '单价',
    key: 'unitPrice',
    width: 120,
    align: 'right',
    render(row) {
      return formatMoney(row.unitPrice, invoice.value?.currency || 'CNY');
    },
  },
  {
    title: '金额',
    key: 'total',
    width: 120,
    align: 'right',
    render(row) {
      return formatMoney(row.total, invoice.value?.currency || 'CNY');
    },
  },
];
</script>

<style scoped>
.action-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
}

.invoice-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.invoice-title {
  font-size: 24px;
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

.notes-content {
  font-size: 14px;
  color: #6b7280;
  white-space: pre-wrap;
}
</style>
