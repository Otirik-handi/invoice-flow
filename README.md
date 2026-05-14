# InvoiceFlow

基于 Vue 3 的发票管理系统，面向自由职业者与小企业主，支持在线创建、管理、追踪发票。

## 技术栈

| 层面 | 技术 |
| --- | --- |
| 前端框架 | Vue 3 (Composition API + script setup) |
| 状态管理 | Pinia |
| 路由 | Vue Router 4 |
| UI 框架 | Naive UI（统一主题系统，亮/暗双色板） |
| 图表 | ECharts |
| 后端 | Firebase (Auth + Firestore) |
| 构建工具 | Vite 8 |
| 类型检查 | TypeScript |
| E2E 测试 | Playwright |

## 功能

- **用户认证** — 注册、登录、退出，路由守卫保护，刷新持久化
- **仪表盘** — 统计卡片、月度收入趋势图、发票状态分布图、最近发票
- **发票管理** — 创建/编辑（模态框表单）、详情查看（模态框打印）、删除确认（带 loading）
- **发票列表** — 实时 Firestore 订阅、状态筛选、搜索、状态标签排序
- **金额自动计算** — 小计、税额、总计实时计算
- **状态流转** — 草稿 → 已发送 → 已付款 / 已逾期
- **客户管理** — 完整 CRUD，Firestore 实时同步，弹窗表单
- **系统设置** — 个人信息编辑、默认货币/税率/到期天数配置
- **暗色模式** — 侧边栏一键切换，Naive UI 组件 + ECharts 图表同步适配
- **PDF 导出** — 发票导出为 PDF（开发中）

## 开始使用

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 生产构建
npm run build

# 预览构建结果
npm run preview

# 运行 E2E 测试（需先配置 e2e/.env.test）
HTTP_PROXY="" HTTPS_PROXY="" npx playwright test
```

## 项目结构

```
src/
├── api/               # Firebase 封装层（auth / invoice / dashboard / client / seed）
│   └── index.ts       # 统一导出 + logApi HOF 包装
├── components/
│   ├── invoice/       # InvoiceDetailModal / InvoiceFormModal
│   └── layout/        # AppLayout（面包屑 + 侧边栏 + 顶栏 + 暗色切换）
├── lib/               # 工具库
│   ├── logger.ts      # 分级日志系统
│   └── apiLogger.ts   # 日志 HOF 包装器
├── router/            # 路由配置 + 守卫
├── stores/            # Pinia 状态管理（authStore / invoiceStore / themeStore / clientStore）
├── theme/             # 统一主题配置（亮/暗双色板：NaiveUI overrides + CSS vars）
├── types/             # TypeScript 类型定义
├── views/
│   ├── auth/          # 登录 / 注册
│   ├── invoice/       # 发票列表（内嵌详情/表单模态框）
│   ├── DashboardView.vue   # 仪表盘（ECharts 图表）
│   ├── ClientsView.vue     # 客户管理
│   └── SettingsView.vue    # 系统设置
├── App.vue            # 根组件（NaiveUI Provider + 暗色主题绑定 + CSS 变量注入）
├── main.ts            # 入口
├── firestore.rules    # Firestore 安全规则
└── firestore.indexes.json  # Firestore 复合索引
```

## 环境要求

- Node.js >= 18
- npm >= 9
