<template>
  <div class="dashboard">
    <div class="page-header">
      <span class="page-title">仪表盘</span>
      <span class="page-desc">您的发票数据概览</span>
    </div>

    <n-spin :show="loading">
      <n-grid :cols="4" :x-gap="16" :y-gap="16" class="stats-row">
        <n-grid-item v-for="card in statCards" :key="card.label">
          <n-card class="stat-card" :bordered="true">
            <div class="stat-inner">
              <n-icon :component="card.icon" size="32" :class="card.color" />
              <div class="stat-info">
                <span class="stat-value">{{ card.value }}</span>
                <span class="stat-label">{{ card.label }}</span>
              </div>
            </div>
          </n-card>
        </n-grid-item>
      </n-grid>

      <n-grid :cols="2" :x-gap="16" :y-gap="16" class="charts-row">
        <n-grid-item>
          <n-card title="月度收入趋势" :bordered="true">
            <div ref="revenueChartRef" class="chart-container"></div>
          </n-card>
        </n-grid-item>
        <n-grid-item>
          <n-card title="发票状态分布" :bordered="true">
            <div ref="statusChartRef" class="chart-container"></div>
          </n-card>
        </n-grid-item>
      </n-grid>

      <n-card title="最近发票" :bordered="true" class="recent-card">
        <n-data-table
          :columns="recentColumns"
          :data="recentList"
          :bordered="false"
          :single-line="false"
          size="small"
          :bottom-bordered="true"
        />
        <template #footer>
          <n-button text type="primary" @click="router.push('/invoices')">查看全部发票 →</n-button>
        </template>
      </n-card>

      <n-card title="常用操作" :bordered="true" class="actions-card">
        <n-space :size="16">
          <n-button type="primary" @click="router.push('/invoices/new')">
            <template #icon>
              <n-icon :component="PlusOutlined" />
            </template>
            创建发票
          </n-button>
          <n-button @click="router.push('/clients')">
            <template #icon>
              <n-icon :component="TeamOutlined" />
            </template>
            管理客户
          </n-button>
          <n-button @click="router.push('/settings')">
            <template #icon>
              <n-icon :component="SettingOutlined" />
            </template>
            系统设置
          </n-button>
        </n-space>
      </n-card>
    </n-spin>
  </div>
</template>

<script setup lang="ts">
import { h, ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useThemeStore } from '../stores/themeStore';
import * as echarts from 'echarts';
import { NGrid, NGridItem, NCard, NIcon, NSpace, NButton, NDataTable, NTag, NSpin } from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';
import {
  FileTextOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  TeamOutlined,
  SettingOutlined,
} from '@vicons/antd';
import {
  getCurrentUser,
  fetchAllInvoices,
  computeStats,
  computeMonthlyRevenue,
  computeRecentInvoices,
} from '../api';
import type { Invoice } from '../types';

const router = useRouter();
const themeStore = useThemeStore();

const loading = ref(true);
const invoices = ref<Invoice[]>([]);

const stats = computed(() => computeStats(invoices.value));
const monthlyRevenue = computed(() => computeMonthlyRevenue(invoices.value));
const recentList = computed(() => computeRecentInvoices(invoices.value));

const statCards = computed(() => [
  {
    label: '总发票数',
    value: `${stats.value.totalInvoices} 张`,
    icon: FileTextOutlined,
    color: 'blue',
  },
  {
    label: '总收入',
    value: `¥ ${stats.value.totalRevenue.toLocaleString()}`,
    icon: DollarOutlined,
    color: 'green',
  },
  {
    label: '待处理',
    value: `${stats.value.pendingCount} 张`,
    icon: ClockCircleOutlined,
    color: 'orange',
  },
  {
    label: '已逾期',
    value: `${stats.value.overdueCount} 张`,
    icon: ExclamationCircleOutlined,
    color: 'red',
  },
]);

const statusColors: Record<
  string,
  { label: string; type: 'default' | 'info' | 'success' | 'error' | 'warning' }
> = {
  draft: { label: '草稿', type: 'default' },
  sent: { label: '已发送', type: 'info' },
  paid: { label: '已付款', type: 'success' },
  overdue: { label: '已逾期', type: 'error' },
};

const recentColumns: DataTableColumns<ReturnType<typeof computeRecentInvoices>[0]> = [
  { title: '发票编号', key: 'invoiceNumber', width: 180 },
  { title: '客户名称', key: 'client', width: 120 },
  { title: '金额', key: 'amount', width: 130, align: 'right' },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render(row) {
      const cfg = statusColors[row.status];
      return h(NTag, { type: cfg.type, size: 'small', round: true }, { default: () => cfg.label });
    },
  },
  { title: '日期', key: 'date', width: 120 },
];

// ── ECharts ──

const revenueChartRef = ref<HTMLDivElement | null>(null);
const statusChartRef = ref<HTMLDivElement | null>(null);
let revenueChart: echarts.ECharts | null = null;
let statusChart: echarts.ECharts | null = null;

function getChartColors(isDark: boolean) {
  return {
    axisLabel: isDark ? '#9ca3af' : '#909399',
    splitLine: isDark ? '#363649' : '#f0f2f5',
    barGradientFrom: isDark ? '#818cf8' : '#4f46e5',
    barGradientTo: isDark ? '#a5b4fc' : '#818cf8',
    pieLabel: isDark ? '#a1a1aa' : '#606266',
  };
}

function renderCharts() {
  if (!revenueChartRef.value || !statusChartRef.value || !invoices.value.length) return;

  const colors = getChartColors(themeStore.isDark);

  // Revenue bar chart
  const rev = monthlyRevenue.value;
  revenueChart = echarts.init(revenueChartRef.value);
  revenueChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 50, right: 16, top: 20, bottom: 28 },
    xAxis: {
      type: 'category',
      data: rev.map((r) => r.label),
      axisLabel: { fontSize: 11, color: colors.axisLabel },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      min: 0,
      splitLine: { lineStyle: { color: colors.splitLine } },
      axisLabel: {
        fontSize: 11,
        color: colors.axisLabel,
        formatter: (v: number) => (v / 1000).toFixed(0) + 'k',
      },
    },
    series: [
      {
        type: 'bar',
        data: rev.map((r) => r.value),
        barWidth: 36,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: colors.barGradientFrom },
            { offset: 1, color: colors.barGradientTo },
          ]),
          borderRadius: [4, 4, 0, 0],
        },
      },
    ],
  });

  // Status pie chart
  const dist = stats.value.statusDistribution;
  statusChart = echarts.init(statusChartRef.value);
  statusChart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} 张 ({d}%)' },
    series: [
      {
        type: 'pie',
        radius: ['45%', '70%'],
        avoidLabelOverlap: true,
        label: { show: true, formatter: '{b}\n{d}%', fontSize: 11, color: colors.pieLabel },
        emphasis: { label: { show: true, fontWeight: 'bold' } },
        data: dist.map((d) => ({ value: d.count, name: d.label, itemStyle: { color: d.color } })),
      },
    ],
  });

  window.addEventListener('resize', () => {
    revenueChart?.resize();
    statusChart?.resize();
  });
}

onMounted(async () => {
  try {
    const fbUser = await getCurrentUser();
    if (fbUser) {
      invoices.value = await fetchAllInvoices(fbUser.uid);
    }
  } catch (e) {
    console.error('Failed to load dashboard data:', e);
  } finally {
    loading.value = false;
    // render charts after data loaded, next tick for DOM
    setTimeout(renderCharts, 0);
  }
});

watch(
  () => themeStore.isDark,
  () => {
    revenueChart?.dispose();
    statusChart?.dispose();
    revenueChart = null;
    statusChart = null;
    setTimeout(renderCharts, 0);
  },
);

onUnmounted(() => {
  revenueChart?.dispose();
  statusChart?.dispose();
});
</script>

<style scoped>
.dashboard {
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  display: block;
}

.page-desc {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-top: 4px;
}

.stats-row {
  margin-bottom: 16px;
}

.stat-card {
  --n-padding-top: 16px;
  --n-padding-bottom: 12px;
  --n-padding-left: 20px;
  --n-padding-right: 20px;
}

.stat-inner {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-top: 2px;
}

.n-icon.blue {
  color: #409eff;
}
.n-icon.green {
  color: #67c23a;
}
.n-icon.orange {
  color: #e6a23c;
}
.n-icon.red {
  color: #f56c6c;
}

.charts-row {
  margin-bottom: 16px;
}

.chart-container {
  width: 100%;
  height: 260px;
}

.recent-card {
  margin-bottom: 16px;
}

.actions-card {
  margin-bottom: 16px;
}
</style>
