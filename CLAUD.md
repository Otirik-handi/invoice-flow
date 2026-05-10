# 项目：个人发票管理系统

## 重要事项/Important

使用中文思维来完成接下来的所有任务

## 项目概述

一个基于 Vue 3 的发票管理系统，面向自由职业者和小企业主，用户可以在线创建、管理、追踪发票，并导出 PDF。

## 技术栈

| 层面 | 技术 |
| --- | --- |
| 前端框架 | Vue 3 (Composition API) |
| 状态管理 | Pinia |
| 路由 | Vue Router 4 |
| UI 框架 | Naive UI |
| 后端/BaaS | Firebase（Auth + Firestore） |
| 构建工具 | Vite |
| 类型检查 | TypeScript |

## 目录结构

src/
  components/
    layout/
      AppLayout.vue          — 登录后通用布局（侧边栏 + 顶栏 + 内容区）
      Sidebar.vue            — 侧边栏导航
      Navbar.vue             — 顶部导航栏
    auth/
      LoginForm.vue          — 登录表单
      RegisterForm.vue       — 注册表单
    invoice/
      InvoiceForm.vue        — 创建/编辑发票表单（核心复杂组件）
      InvoiceTable.vue       — 发票列表表格
      InvoiceCard.vue        — 发票详情展示卡片
      InvoiceStatusBadge.vue — 状态标签组件
      InvoiceFilter.vue      — 筛选栏
      ItemRow.vue            — 商品明细行（可编辑）
      ItemTable.vue          — 商品明细表格（含增删行）
      AmountSummary.vue      — 金额汇总区域
    common/
      ConfirmDialog.vue      — 确认弹窗
      EmptyState.vue         — 空状态占位
      LoadingSkeleton.vue    — 骨架屏
      PageHeader.vue         — 页面标题 + 操作按钮
  composables/
    useAuth.ts               — 认证相关逻辑
    useInvoices.ts           — 发票 CRUD 逻辑
    useClients.ts            — 客户管理逻辑
    useDashboard.ts          — 仪表盘统计逻辑
  stores/
    authStore.ts             — Pinia 用户状态
    invoiceStore.ts          — Pinia 发票状态（列表缓存 + 当前发票）
  api/
    auth.ts                  — Firebase Auth 封装
    invoice.ts               — Firestore 发票操作封装
    client.ts                — Firestore 客户操作封装

## 组件规范

## 常用命令

## 详细文档

- PRD文档详见`docs\PRD.md`
- Todo List详见`docs\todo.md`
