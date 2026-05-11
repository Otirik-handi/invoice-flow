<template>
  <div class="form-page">
    <div class="page-header">
      <span class="page-title">创建发票</span>
    </div>

    <div class="form-body">
      <!-- 左栏 -->
      <div class="form-main">
        <div class="form-section">
          <div class="section-title">客户信息</div>
          <n-grid :cols="2" :x-gap="16" :y-gap="12">
            <n-grid-item>
              <n-form-item label="客户名称" required>
                <n-input placeholder="请输入客户名称" />
              </n-form-item>
            </n-grid-item>
            <n-grid-item>
              <n-form-item label="客户邮箱" required>
                <n-input placeholder="请输入客户邮箱" />
              </n-form-item>
            </n-grid-item>
            <n-grid-item>
              <n-form-item label="客户地址">
                <n-input placeholder="选填" />
              </n-form-item>
            </n-grid-item>
            <n-grid-item>
              <n-form-item label="客户电话">
                <n-input placeholder="选填" />
              </n-form-item>
            </n-grid-item>
          </n-grid>
        </div>

        <div class="form-section">
          <div class="section-title">商品明细</div>
          <n-data-table
            :columns="itemColumns"
            :data="mockItems"
            :bordered="false"
            :single-line="false"
            size="small"
            :bottom-bordered="true"
          />
          <n-button class="add-row-btn" text type="primary" size="small">
            <template #icon>
              <n-icon :component="PlusOutlined" />
            </template>
            添加一行
          </n-button>
        </div>
      </div>

      <!-- 右栏 -->
      <div class="form-sidebar">
        <div class="summary-card">
          <div class="summary-title">金额汇总</div>
          <n-divider style="margin: 12px 0" />
          <div class="summary-row">
            <span class="summary-label">小计</span>
            <span class="summary-value">¥ 0.00</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">税率</span>
            <n-input-number
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
            <span class="summary-value">¥ 0.00</span>
          </div>
          <n-divider style="margin: 8px 0" />
          <div class="summary-row total">
            <span class="summary-label">总计</span>
            <span class="summary-value total-value">¥ 0.00</span>
          </div>
        </div>

        <div class="form-section">
          <div class="section-title">其他信息</div>
          <n-form-item label="货币">
            <n-select
              :options="currencyOptions"
              placeholder="选择货币"
              :default-value="'CNY'"
            />
          </n-form-item>
          <n-form-item label="到期日期">
            <n-date-picker type="date" placeholder="选择日期" :style="{ width: '100%' }" />
          </n-form-item>
          <n-form-item label="备注">
            <n-input type="textarea" placeholder="选填" :rows="3" />
          </n-form-item>
        </div>
      </div>
    </div>

    <n-divider style="margin: 24px 0 16px" />

    <div class="form-actions">
      <n-button>保存为草稿</n-button>
      <n-button type="primary">创建并发送</n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { h } from 'vue';
import type { Component } from 'vue';
import {
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
  NSelect,
} from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';
import { DeleteOutlined, PlusOutlined } from '@vicons/antd';

function renderIcon(icon: Component) {
  return () => h(NIcon, null, { default: () => h(icon) });
}

const currencyOptions = [
  { label: 'CNY (¥)', value: 'CNY' },
  { label: 'USD ($)', value: 'USD' },
  { label: 'EUR (€)', value: 'EUR' },
];

interface MockItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

const mockItems: MockItem[] = [
  { description: '', quantity: 1, unitPrice: 0, total: 0 },
];

const itemColumns: DataTableColumns<MockItem> = [
  {
    title: '描述',
    key: 'description',
    render() {
      return h(NInput, {
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
    render() {
      return h(NInputNumber, {
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
    render() {
      return h(NInputNumber, {
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
    render(row) {
      return `¥ ${row.total.toFixed(2)}`;
    },
  },
  {
    title: '',
    key: 'action',
    width: 50,
    align: 'center',
    render() {
      return h(
        NButton,
        { text: true, size: 'small', type: 'error' },
        { default: () => h(NIcon, null, { default: () => h(DeleteOutlined) }) },
      );
    },
  },
];
</script>

<style scoped>
.form-page {
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
}

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
  color: #374151;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.add-row-btn {
  margin-top: 8px;
}

.summary-card {
  background: #fff;
  border: 1px solid #e5e7eb;
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
  color: #6b7280;
}

.summary-value {
  font-size: 14px;
  color: #1f2937;
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
  justify-content: flex-end;
  gap: 12px;
}
</style>
