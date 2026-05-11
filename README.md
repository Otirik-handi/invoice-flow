# InvoiceFlow

基于 Vue 3 的发票管理系统，面向自由职业者与小企业主，支持在线创建、管理、追踪发票。

## 技术栈

| 层面 | 技术 |
| --- | --- |
| 前端框架 | Vue 3 (Composition API + script setup) |
| 状态管理 | Pinia |
| 路由 | Vue Router 4 |
| UI 框架 | Naive UI |
| 后端 | Firebase (Auth + Firestore) |
| 构建工具 | Vite |
| 类型检查 | TypeScript |

## 功能

- **用户认证** — 注册、登录、退出，路由守卫保护
- **发票管理** — 创建、编辑、查看、删除发票
- **发票列表** — 状态筛选、搜索、排序
- **金额自动计算** — 小计、税额、总计实时计算
- **状态流转** — 草稿 → 已发送 → 已付款 / 已逾期
- **仪表盘** — 统计数据与图表（阶段二）
- **客户管理** — 常用客户信息管理（阶段二）
- **PDF 导出** — 发票导出为 PDF（阶段二）

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
```

## 项目结构

```
src/
├── api/              # Firebase API 封装（auth / invoice）
├── components/
│   └── layout/       # 后台布局组件（AppLayout）
├── router/           # Vue Router 配置与守卫
├── stores/           # Pinia 状态管理（auth / invoice）
├── types/            # TypeScript 接口定义
└── views/
    ├── auth/         # 登录 / 注册页
    └── invoice/      # 发票列表 / 详情 / 表单页
```

## 环境要求

- Node.js >= 18
- npm >= 9
