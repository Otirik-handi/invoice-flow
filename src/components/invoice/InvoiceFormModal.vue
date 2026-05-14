<template>
  <n-modal
    :show="show"
    @update:show="$emit('update:show', $event)"
    preset="card"
    :title="isEdit ? '编辑发票' : '创建发票'"
    style="max-width: 900px; width: 100%;"
    :mask-closable="false"
    :segmented="{ content: true }"
  >
    <n-spin :show="pageLoading">
      <div class="form-body">
        <!-- 左栏 -->
        <div class="form-main">
          <div class="form-section">
            <div class="section-title">客户信息</div>
            <n-grid :cols="2" :x-gap="16" :y-gap="12">
              <n-grid-item>
                <n-form-item label="客户名称" required :feedback="errors.clientName">
                  <n-input v-model:value="form.client.name" placeholder="请输入客户名称" />
                </n-form-item>
              </n-grid-item>
              <n-grid-item>
                <n-form-item label="客户邮箱" required :feedback="errors.clientEmail">
                  <n-input v-model:value="form.client.email" placeholder="请输入客户邮箱" />
                </n-form-item>
              </n-grid-item>
              <n-grid-item>
                <n-form-item label="客户地址">
                  <n-input v-model:value="form.client.address" placeholder="选填" />
                </n-form-item>
              </n-grid-item>
              <n-grid-item>
                <n-form-item label="客户电话">
                  <n-input v-model:value="form.client.phone" placeholder="选填" />
                </n-form-item>
              </n-grid-item>
            </n-grid>
          </div>

          <div class="form-section">
            <div class="section-title">商品明细</div>
            <n-data-table
              :columns="itemColumns"
              :data="form.items"
              :bordered="false"
              :single-line="false"
              size="small"
              :bottom-bordered="true"
            />
            <n-button class="add-row-btn" text type="primary" size="small" @click="addItem">
              <template #icon>
                <n-icon :component="PlusOutlined" />
              </template>
              添加一行
            </n-button>
          </div>

          <div class="form-section">
            <div class="section-title">备注</div>
            <n-input
              v-model:value="form.notes"
              type="textarea"
              placeholder="选填"
              :rows="3"
            />
          </div>
        </div>

        <!-- 右栏 -->
        <div class="form-sidebar">
          <div class="summary-card">
            <div class="summary-title">金额汇总</div>
            <n-divider style="margin: 12px 0" />
            <div class="summary-row">
              <span class="summary-label">小计</span>
              <span class="summary-value">{{ formatMoney(subtotal) }}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">税率</span>
              <n-input-number
                v-model:value="form.taxRate"
                :style="{ width: '100px' }"
                :min="0"
                :max="100"
                size="small"
                placeholder="0"
              >
                <template #suffix>%</template>
              </n-input-number>
            </div>
            <div class="summary-row">
              <span class="summary-label">税额</span>
              <span class="summary-value">{{ formatMoney(taxAmount) }}</span>
            </div>
            <n-divider style="margin: 8px 0" />
            <div class="summary-row total">
              <span class="summary-label">总计</span>
              <span class="summary-value total-value">{{ formatMoney(total) }}</span>
            </div>
          </div>

          <div class="form-section">
            <div class="section-title">其他信息</div>
            <n-form-item label="货币">
              <n-select
                v-model:value="form.currency"
                :options="currencyOptions"
                placeholder="选择货币"
              />
            </n-form-item>
            <n-form-item label="到期日期" required :feedback="errors.dueDate">
              <n-date-picker
                v-model:value="form.dueDate"
                type="date"
                placeholder="选择日期"
                :style="{ width: '100%' }"
              />
            </n-form-item>
          </div>

          <n-alert v-if="submitError" type="error" closable @close="submitError = ''" :bordered="false">
            {{ submitError }}
          </n-alert>

          <div class="form-actions">
            <n-button :loading="submitting" :disabled="submitting" @click="submit('draft')">
              {{ isEdit ? '保存修改' : '保存为草稿' }}
            </n-button>
            <n-button
              type="primary"
              :loading="submitting"
              :disabled="submitting"
              @click="submit('sent')"
            >
              {{ isEdit ? '保存并发送' : '创建并发送' }}
            </n-button>
          </div>
        </div>
      </div>
    </n-spin>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, h } from 'vue';
import { useMessage } from 'naive-ui';
import type { Component } from 'vue';
import {
  NAlert,
  NButton,
  NDataTable,
  NDatePicker,
  NDivider,
  NFormItem,
  NGrid,
  NGridItem,
  NIcon,
  NInput,
  NInputNumber,
  NModal,
  NSelect,
  NSpin,
} from 'naive-ui';
import type { DataTableColumns, SelectOption } from 'naive-ui';
import { DeleteOutlined, PlusOutlined } from '@vicons/antd';
import { useInvoiceStore } from '../../stores/invoiceStore';
import { getCurrentUser } from '../../api';
import { Timestamp } from 'firebase/firestore';
import type { InvoiceStatus, Item } from '../../types';

const props = withDefaults(
  defineProps<{
    show: boolean;
    invoiceId: string | null;
  }>(),
  { invoiceId: null },
);

const emit = defineEmits<{
  'update:show': [value: boolean];
}>();

const message = useMessage();
const store = useInvoiceStore();

const isEdit = computed(() => !!props.invoiceId);
const currencySymbol = '¥';

const currencyOptions: SelectOption[] = [
  { label: 'CNY (¥)', value: 'CNY' },
  { label: 'USD ($)', value: 'USD' },
  { label: 'EUR (€)', value: 'EUR' },
];

interface ItemForm {
  description: string;
  quantity: number;
  unitPrice: number;
}

interface FormData {
  client: { name: string; email: string; address: string; phone: string };
  items: ItemForm[];
  taxRate: number;
  currency: 'CNY' | 'USD' | 'EUR';
  dueDate: number | null;
  notes: string;
}

const form = reactive<FormData>({
  client: { name: '', email: '', address: '', phone: '' },
  items: [{ description: '', quantity: 1, unitPrice: 0 }],
  taxRate: 0,
  currency: 'CNY',
  dueDate: null,
  notes: '',
});

const errors = reactive({
  clientName: '',
  clientEmail: '',
  dueDate: '',
});

const pageLoading = ref(false);
const submitting = ref(false);
const submitError = ref('');

const subtotal = computed(() =>
  form.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
);
const taxAmount = computed(() => subtotal.value * (form.taxRate / 100));
const total = computed(() => subtotal.value + taxAmount.value);

function formatMoney(amount: number): string {
  return `${currencySymbol} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function resetForm() {
  form.client = { name: '', email: '', address: '', phone: '' };
  form.items = [{ description: '', quantity: 1, unitPrice: 0 }];
  form.taxRate = 0;
  form.currency = 'CNY';
  form.dueDate = null;
  form.notes = '';
  errors.clientName = '';
  errors.clientEmail = '';
  errors.dueDate = '';
  submitError.value = '';
}

watch(
  () => props.show,
  async (val) => {
    if (!val) return;
    resetForm();

    if (!isEdit.value) return;

    pageLoading.value = true;
    try {
      await store.fetchInvoiceById(props.invoiceId!);
      const inv = store.currentInvoice;
      if (!inv) {
        message.error('发票不存在');
        close();
        return;
      }
      form.client.name = inv.client.name;
      form.client.email = inv.client.email;
      form.client.address = inv.client.address || '';
      form.client.phone = inv.client.phone || '';
      form.items = inv.items.map((item: Item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }));
      form.taxRate = inv.taxRate;
      form.currency = inv.currency;
      form.dueDate = inv.dueDate?.toDate?.()?.getTime() ?? null;
      form.notes = inv.notes || '';
    } catch {
      message.error('加载发票失败');
      close();
    } finally {
      pageLoading.value = false;
    }
  },
);

function close() {
  emit('update:show', false);
}

function addItem() {
  form.items.push({ description: '', quantity: 1, unitPrice: 0 });
}

function removeItem(index: number) {
  if (form.items.length <= 1) return;
  form.items.splice(index, 1);
}

function validate(): boolean {
  let valid = true;
  errors.clientName = '';
  errors.clientEmail = '';
  errors.dueDate = '';
  submitError.value = '';

  if (!form.client.name.trim()) {
    errors.clientName = '请输入客户名称';
    valid = false;
  }
  if (!form.client.email.trim()) {
    errors.clientEmail = '请输入客户邮箱';
    valid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.client.email)) {
    errors.clientEmail = '邮箱格式不正确';
    valid = false;
  }
  if (!form.dueDate) {
    errors.dueDate = '请选择到期日期';
    valid = false;
  }

  const hasEmptyItem = form.items.some(
    (item) => !item.description.trim() || item.quantity < 1 || item.unitPrice < 0,
  );
  if (hasEmptyItem) {
    submitError.value = '请完善所有商品明细（描述、数量、单价）';
    valid = false;
  }

  return valid;
}

async function submit(status: InvoiceStatus) {
  if (!validate()) return;

  const fbUser = await getCurrentUser();
  if (!fbUser) {
    submitError.value = '用户未登录';
    return;
  }

  submitting.value = true;
  submitError.value = '';

  const items = form.items.map((item) => ({
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    total: item.quantity * item.unitPrice,
  }));

  try {
    if (isEdit.value) {
      await store.updateInvoice(props.invoiceId!, {
        client: form.client,
        items,
        taxRate: form.taxRate,
        currency: form.currency,
        dueDate: Timestamp.fromDate(new Date(form.dueDate!)),
        notes: form.notes,
        status,
      } as any);
      message.success('发票已更新');
    } else {
      await store.createInvoice({
        userId: fbUser.uid,
        invoiceNumber: '',
        status,
        client: form.client,
        items,
        subtotal: 0,
        taxRate: form.taxRate,
        taxAmount: 0,
        total: 0,
        currency: form.currency,
        notes: form.notes,
        dueDate: Timestamp.fromDate(new Date(form.dueDate!)),
      });
      message.success('发票已创建');
    }
    close();
  } catch (e: unknown) {
    const err = e as { message?: string };
    submitError.value = err.message || '操作失败，请稍后重试';
  } finally {
    submitting.value = false;
  }
}

function renderIcon(icon: Component) {
  return () => h(NIcon, null, { default: () => h(icon) });
}

const itemColumns: DataTableColumns<ItemForm> = [
  {
    title: '描述',
    key: 'description',
    render(_row, index) {
      return h(NInput, {
        value: form.items[index].description,
        'onUpdate:value': (v: string) => (form.items[index].description = v),
        placeholder: '请输入商品描述',
        size: 'small',
      });
    },
  },
  {
    title: '数量',
    key: 'quantity',
    width: 90,
    align: 'center',
    render(_row, index) {
      return h(NInputNumber, {
        value: form.items[index].quantity,
        'onUpdate:value': (v: number | null) => (form.items[index].quantity = v ?? 1),
        min: 1,
        size: 'small',
        style: { width: '80px' },
      });
    },
  },
  {
    title: '单价',
    key: 'unitPrice',
    width: 120,
    align: 'right',
    render(_row, index) {
      return h(NInputNumber, {
        value: form.items[index].unitPrice,
        'onUpdate:value': (v: number | null) => (form.items[index].unitPrice = v ?? 0),
        min: 0,
        placeholder: '0.00',
        size: 'small',
        style: { width: '110px' },
      });
    },
  },
  {
    title: '金额',
    key: 'total',
    width: 100,
    align: 'right',
    render(_row, index) {
      const item = form.items[index];
      return formatMoney(item.quantity * item.unitPrice);
    },
  },
  {
    title: '',
    key: 'action',
    width: 50,
    align: 'center',
    render(_row, index) {
      return h(
        NButton,
        {
          text: true,
          size: 'small',
          type: 'error',
          onClick: () => removeItem(index),
        },
        { default: () => h(NIcon, null, { default: () => h(DeleteOutlined) }) },
      );
    },
  },
];
</script>

<style scoped>
.form-body {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.form-main {
  flex: 1;
  min-width: 0;
}

.form-sidebar {
  width: 320px;
  flex-shrink: 0;
}

.form-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--color-border);
}

.add-row-btn {
  margin-top: 8px;
}

.summary-card {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.summary-title {
  font-size: 16px;
  font-weight: 600;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
}

.summary-label {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.summary-value {
  font-size: 14px;
  color: var(--color-text);
}

.summary-row.total {
  padding: 8px 0;
}

.total-value {
  font-size: 20px;
  font-weight: 700;
}

.form-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
}
</style>
