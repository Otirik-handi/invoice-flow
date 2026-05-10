# Invoice App — 产品需求文档 (PRD)

## 1. 项目概述

一个基于 Vue 3 的发票管理系统，面向自由职业者和小企业主，用户可以在线创建、管理、追踪发票，并导出 PDF。

### 技术栈

| 层面      | 技术                         |
| ------- | -------------------------- |
| 前端框架    | Vue 3 (Composition API)    |
| 状态管理    | Pinia                      |
| 路由      | Vue Router 4               |
| UI 框架   | Naive UI                   |
| 后端/BaaS | Firebase（Auth + Firestore） |
| 构建工具    | Vite                       |
| 类型检查    | TypeScript                 |

---

## 2. 用户角色

**单一角色：自由职业者 / 小企业主**

- 注册登录后管理自己的发票
- 每个用户只能看到自己的发票数据
- 无管理员后台，无多用户协作

---

## 3. 功能详细说明

---

### 3.1 用户认证模块

#### 3.1.1 用户注册

**功能描述：** 新用户通过邮箱和密码创建账户。

**用户流程：**

1. 用户访问 `/register` 页面
2. 填写邮箱、密码、确认密码、显示名称
3. 点击"注册"按钮
4. 系统验证表单 → 调用 Firebase Auth API 创建用户
5. 注册成功后自动跳转到发票列表页（`/invoices`）
6. 注册失败显示错误提示（邮箱已存在、密码强度不足等）

**数据流：**

```
注册表单 → 前端校验 → Firebase Auth createUserWithEmailAndPassword()
  → 成功后：创建 Firestore users/{uid} 文档
  → 跳转 /invoices
```

**表单校验规则：**

- 邮箱：必填，格式校验
- 密码：必填，最少 6 位
- 确认密码：必填，与密码一致
- 名称：必填，1-50 字符

**UI 说明：**

- 简单的卡片式居中布局
- 底部有"已有账户？去登录"链接
- 注册按钮有 loading 状态
- 头部显示 Logo 和应用名

---

#### 3.1.2 用户登录

**功能描述：** 已注册用户通过邮箱密码登录。

**用户流程：**

1. 用户访问 `/login` 页面
2. 填写邮箱、密码
3. 可选"记住我"选项
4. 点击"登录"按钮
5. 调用 Firebase Auth 验证
6. 成功后跳转 `/invoices`，失败显示错误提示

**数据流：**

```
登录表单 → Firebase Auth signInWithEmailAndPassword()
  → 成功后 onAuthStateChanged 触发 → Pinia 更新用户状态 → 路由守卫放行
```

**异常处理：**

- 邮箱未注册 → "该邮箱尚未注册"
- 密码错误 → "邮箱或密码错误"
- 网络异常 → "网络连接失败，请稍后重试"

**UI 说明：**

- 与注册页风格统一
- 底部有"没有账户？去注册"链接

---

#### 3.1.3 退出登录

**用户流程：**

1. 用户在侧边栏或顶部导航点击"退出"
2. 弹出确认弹窗"确定退出登录？"
3. 确认后调用 Firebase Auth signOut
4. 跳转到登录页

**数据流：**

```
点击退出 → 弹窗确认 → Firebase signOut()
  → Pinia 清除用户状态 → Router 跳转 /login
```

---

#### 3.1.4 路由守卫

**逻辑描述：**

- 未登录用户访问任何受保护路由 → 自动跳转 `/login`
- 已登录用户访问 `/login` 或 `/register` → 自动跳转 `/invoices`
- 通过 `router.beforeEach` + Pinia 中的用户状态实现

---

### 3.2 发票管理模块（核心）

#### 3.2.1 创建发票

**功能描述：** 用户填写发票表单，生成一张新发票。

**用户流程：**

1. 在发票列表页点击"创建发票"按钮

2. 进入 `/invoices/new` 页面，加载空表单

3. 填写以下信息：

   **客户信息区域：**

   - 客户名称（必填）
   - 客户邮箱（必填）
   - 客户地址（选填）
   - 客户电话（选填）

   **发票明细区域（可动态增删行）：**

   - 每行包含：描述（必填）、数量（必填>0）、单价（必填>0）
   - 添加行：点击"添加一行"，表格末尾插入空行
   - 删除行：点击行末的删除图标，至少保留一行

   **金额区域（自动计算，不可编辑）：**

   - 小计（subtotal）= Σ(数量 × 单价)
   - 税率（用户输入，默认 0，百分比）
   - 税额 = 小计 × 税率%
   - 总计 = 小计 + 税额

   **其他信息：**

   - 发票备注（选填，textarea）
   - 到期日期（选填，date picker）
   - 货币类型（下拉选择：CNY / USD / EUR，默认 CNY）

4. 底部有"保存为草稿"和"创建并发送"两个按钮

   - "保存为草稿"→ 状态为 draft，保存后跳转列表
   - "创建并发送"→ 状态为 sent，保存后跳转列表

5. 表单校验通过后调用 Firestore 写入

**数据流：**

```
表单填写 → 实时计算 subtotal / taxAmount / total
  → 点击提交 → 前端完整校验
  → Firestore addDoc(collection('invoices'), {...})
  → 成功后跳转 /invoices
```

**UI 说明：**

- 表单左右分栏：左栏客户信息 + 明细表格，右栏金额汇总卡片
- 明细表格行内编辑，类似 Excel
- 金额汇总实时更新，输入即计算

**业务规则：**

- 发票编号自动生成（格式：`INV-{timestamp}-{4位随机数}`），生成后不可修改
- 创建后 30 天内未修改且状态仍为 draft → 视为废弃（前端提示可删除）
- 一旦状态从 draft 改为 sent，发票不可再编辑（仅可更新状态）

---

#### 3.2.2 发票列表

**功能描述：** 展示当前用户的所有发票，支持筛选、搜索、排序。

**用户流程：**

1. 进入 `/invoices` 页面（同时也是登录后首页）

2. 页面加载时调用 Firestore 查询当前用户的发票

3. 默认按创建时间倒序排列

4. 列表以**表格形式**展示以下列：

   - 发票编号
   - 客户名称
   - 金额总计（含货币符号）
   - 状态（带颜色标签）
   - 到期日期
   - 创建日期
   - 操作按钮（查看 / 编辑 / 删除）

5. 顶部筛选栏：

   - **状态筛选：** 全部 / 草稿 / 已发送 / 已付款 / 已逾期
   - **搜索框：** 输入客户名称或发票编号，实时过滤（防抖 300ms）
   - **排序：** 按创建时间 / 到期日期 / 金额

6. 点击行跳转到发票详情页

**数据流：**

```
页面加载 → onAuthStateChanged 获取 userId
  → Firestore query: where('userId','==',uid) + orderBy('createdAt','desc')
  → onSnapshot 实时监听数据变化 → 响应式更新表格
  → 筛选/搜索/排序在前端对 already fetched 数据做过滤
```

**UI 说明：**

- 页面顶部：标题"发票列表" + "创建发票"按钮
- 筛选栏：状态标签按钮组（All / Draft / Sent / Paid / Overdue）
- 表格支持 hover 高亮
- 空状态：无发票时显示插画 + "创建你的第一张发票"按钮
- 分页：超过 20 条时分页加载

**状态颜色规范：**

| 状态      | 标签色 | 中文  |
| ------- | --- | --- |
| draft   | 灰色  | 草稿  |
| sent    | 蓝色  | 已发送 |
| paid    | 绿色  | 已付款 |
| overdue | 红色  | 已逾期 |

---

#### 3.2.3 发票详情

**功能描述：** 以发票格式（类似真实纸质发票）展示单张发票的完整信息。

**用户流程：**

1. 从列表页点击某张发票，进入 `/invoices/:id`

2. 页面展示打印友好格式的发票视图

3. 顶部操作栏按钮：

   - "编辑"（仅 draft 状态可编辑）
   - "导出 PDF"
   - "打印"
   - "删除"
   - "更改状态"（下拉菜单）

4. 发票内容按以下布局展示：

   ```
   ┌─────────────────────────────────┐
   │  发票                            │
   │  发票编号: INV-20240504-2837      │
   │  创建日期: 2024-05-04             │
   │  到期日期: 2024-06-03             │
   │                                 │
   │  客户信息                         │
   │  名称: XXX                       │
   │  邮箱: xxx@mail.com              │
   │  地址: xxxx                      │
   │                                 │
   │  ─── 商品明细 ───                │
   │  描述     数量  单价   金额        │
   │  Item1     2   100    200       │
   │  Item2     1   300    300       │
   │  ────────────────────           │
   │  小计:                500        │
   │  税率:                6%         │
   │  税额:                30         │
   │  总计:                530        │
   │                                 │
   │  备注: xxx                       │
   └─────────────────────────────────┘
   ```

5. 点击"更改状态"弹出下拉菜单，选择目标状态后更新

**数据流：**

```
路由参数 id → Firestore getDoc(docRef)
  → 加载数据渲染视图
  → 状态更新 → Firestore updateDoc(docRef, { status })
  → 视图实时刷新
```

---

#### 3.2.4 编辑发票

**功能描述：** 修改已创建的草稿发票。

**约束规则：**

- **只有 status === 'draft' 的发票可以编辑**
- 一旦发票状态改为 sent，编辑按钮隐藏，详情页所有字段只读
- 如果非要修改已发送的发票：先复制一张新发票（内容预填），编辑后保存为 draft

**用户流程：**

1. 在发票详情页点击"编辑"，进入 `/invoices/:id/edit`
2. 表单与创建发票完全一致，预填已有数据
3. 修改后点击"保存"，执行 updateDoc
4. 保存后跳转回详情页

**数据流：**

```
编辑页面加载 → Firestore getDoc → 预填表单
  → 用户修改 → 前端校验 → updateDoc(docRef, { ... })
  → 跳转 /invoices/:id
```

---

#### 3.2.5 删除发票

**功能描述：** 删除一张发票。

**用户流程：**

1. 用户在列表页点击行末的删除图标，或在详情页点击"删除"
2. 弹出确认弹窗："确定删除发票 INV-xxxx？此操作不可撤销。"
3. 确认后执行 Firestore deleteDoc
4. 从列表中移除，如果当前在详情页则跳转回列表页

**数据流：**

```
点击删除 → 弹窗确认 → Firestore deleteDoc(docRef)
  → 列表页由于 onSnapshot 自动更新 → 自动移除
```

---

#### 3.2.6 发票状态管理

**功能描述：** 用户手动更新发票状态。

**状态流转：**

```
  [草稿] ──→ [已发送] ──→ [已付款]
    ↑              │
    └──── 编辑 ────┘
                    │
                    ↓
                 [已逾期]（自动/手动）
```

**状态转移规则：**

| 从状态   | 到状态     | 条件                   |
| ----- | ------- | -------------------- |
| draft | sent    | 用户手动操作               |
| sent  | paid    | 用户手动操作               |
| sent  | overdue | 超过到期日期自动标记（前端在加载时判断） |
| paid  | —       | 终态，不可再变更             |

**自动逾期逻辑：**

- 加载发票列表和详情时，前端检查 status === 'sent' 的发票
- 如果当前日期 > dueDate，自动显示为 overdue 状态（仅前端展示，不修改 Firestore）
- 也可以提供一个"标记为逾期"的手动按钮

---

### 3.3 增强功能（阶段二）

#### 3.3.1 仪表盘

**功能描述：** 数据概览看板，展示发票业务的统计数据。

**统计卡片：**

| 指标   | 计算方式                     |
| ---- | ------------------------ |
| 总发票数 | 当前用户所有发票 count           |
| 总金额  | 所有非 draft 发票金额之和         |
| 待收款  | status = sent 的发票金额之和    |
| 已收款  | status = paid 的发票金额之和    |
| 逾期金额 | status = overdue 的发票金额之和 |

**图表（可用 Chart.js / ECharts）：**

- 月度趋势折线图：近 6 个月每月发票金额
- 状态分布饼图：各状态发票数量占比

**数据流：**

```
Dashboard 加载 → Firestore query 所有当前用户 invoices
  → 前端对金額和状态做 aggregate → 渲染统计卡片和图表
  → onSnapshot 监听变化 → 数据实时更新
```

---

#### 3.3.2 PDF 导出

**功能描述：** 将发票详情导出为 PDF 文件下载。

**技术方案：** 使用 `html2canvas` + `jspdf` 或 `vue-html2pdf`。

**用户流程：**

1. 在发票详情页或列表页点击"导出 PDF"
2. 系统将发票内容区域转换为 PDF
3. 自动下载文件，文件名格式：`INV-20240504-2837.pdf`

**注意事项：**

- PDF 格式需适配 A4 纸张大小
- 中文需嵌入字体或使用系统字体
- 导出版本不包含页面操作按钮（仅发票内容）

---

#### 3.3.3 客户管理

**功能描述：** 管理常用客户信息，创建发票时快速选择。

**功能清单：**

| 功能   | 说明                     |
| ---- | ---------------------- |
| 客户列表 | 表格展示所有客户，支持搜索          |
| 添加客户 | 名称、邮箱、地址、电话            |
| 编辑客户 | 修改客户信息                 |
| 删除客户 | 删除客户（删除前检查有无关联发票，有则警告） |

**与发票模块的集成：**

- 创建/编辑发票时，客户名称字段后方有"选择已有客户"按钮
- 点击弹出客户选择弹窗，选择后自动填充客户信息
- 也可以在发票表单中直接输入新客户信息（不入客户库）

---

#### 3.3.4 个人设置

**功能描述：** 修改发票上显示的商家信息。

**设置项：**

| 字段      | 类型   | 说明                          |
| ------- | ---- | --------------------------- |
| 公司/个人名称 | 文本   | 发票上显示的销售方名称                 |
| 地址      | 文本   | 销售方地址                       |
| 电话      | 文本   | 销售方电话                       |
| Logo    | 图片上传 | 上传公司 Logo（Firebase Storage） |
| 默认税率    | 数字   | 创建发票时默认填充的税率                |
| 默认货币    | 下拉   | 创建发票时默认货币                   |
| 默认到期天数  | 数字   | 创建发票时默认到期日期 = 创建日 + N       |

**数据存储：** 保存在 Firestore `users/{uid}` 文档中。

---

#### 3.3.5 发票自动编号

**逻辑说明：**

- 格式：`{前缀}-{8位日期}-{4位随机数}`
- 前缀固定为 `INV`
- 示例：`INV-20240504-2837`
- 由前端在创建时生成，写入 Firestore
- 不依赖数据库自增（避免并发问题）

---

### 3.4 进阶功能（阶段三）

#### 3.4.1 邮件发送

**功能描述：** 通过 Email 将发票发送给客户。

**技术方案：** 调用 EmailJS 或 Firebase Extensions，前端直接触发邮件发送。

**用户流程：**

1. 在发票详情页点击"发送邮件"
2. 弹窗显示收件人（自动填充客户邮箱，可修改）
3. 可选添加备注信息
4. 点击发送 → 调用邮件服务
5. 发送成功后发票状态自动改为 sent
6. 发送失败显示错误提示

---

#### 3.4.2 多语言（i18n）

**功能描述：** 中英文界面切换。

**技术方案：** vue-i18n。

**覆盖范围：**

- 所有 UI 静态文本（菜单、按钮、标签）
- 表单校验错误信息
- 发票状态标签
- 货币符号根据语言设置调整

**用户流程：**

- 顶部导航增加语言切换下拉菜单
- 选择后立即切换，偏好保存到 localStorage

**文件结构：**

```
src/locales/
  zh-CN.json
  en.json
```

---

#### 3.4.3 暗黑模式

**功能描述：** 亮色/暗色主题切换。

**技术方案：** CSS 变量 + Vue 响应式切换。

**切换方式：**

1. 顶部导航主题切换图标按钮
2. 跟随系统偏好（`prefers-color-scheme`）
3. 偏好保存到 localStorage

---

#### 3.4.4 CSV 导出

**功能描述：** 将发票列表导出为 CSV 文件，可用 Excel 打开。

**导出字段：** 发票编号、客户名称、金额、状态、创建日期、到期日期。

---

## 4. 页面结构

| 路由                   | 页面       | 访问权限         | 阶段  |
| -------------------- | -------- | ------------ | --- |
| `/login`             | 登录页      | 未登录          | 一   |
| `/register`          | 注册页      | 未登录          | 一   |
| `/invoices`          | 发票列表（首页） | 需登录          | 一   |
| `/invoices/new`      | 创建发票     | 需登录          | 一   |
| `/invoices/:id`      | 发票详情     | 需登录          | 一   |
| `/invoices/:id/edit` | 编辑发票     | 需登录（仅 draft） | 一   |
| `/dashboard`         | 仪表盘      | 需登录          | 二   |
| `/clients`           | 客户管理     | 需登录          | 二   |
| `/settings`          | 个人设置     | 需登录          | 二   |

---

## 5. 数据模型

### 5.1 User（Firestore 集合：`users`）

| 字段              | 类型        | 必填  | 说明                            |
| --------------- | --------- | --- | ----------------------------- |
| uid             | string    | 是   | Firebase Auth UID，与 Auth 用户一致 |
| email           | string    | 是   | 注册邮箱                          |
| displayName     | string    | 是   | 显示名称                          |
| companyName     | string    | 否   | 公司/个人名称（设置页填写）                |
| address         | string    | 否   | 地址                            |
| phone           | string    | 否   | 电话                            |
| logoUrl         | string    | 否   | Logo 图片 Firebase Storage URL  |
| defaultTaxRate  | number    | 否   | 默认税率，默认 0                     |
| defaultCurrency | string    | 否   | 默认货币，默认 CNY                   |
| defaultDueDays  | number    | 否   | 默认到期天数，默认 30                  |
| createdAt       | timestamp | 是   | 注册时间                          |

### 5.2 Invoice（Firestore 集合：`invoices`）

| 字段                  | 类型        | 必填  | 说明                                |
| ------------------- | --------- | --- | --------------------------------- |
| id                  | string    | 自动  | Firestore 文档 ID                   |
| userId              | string    | 是   | 所属用户（用于安全规则筛选）                    |
| invoiceNumber       | string    | 是   | 发票编号，格式 `INV-{date}-{random}`     |
| status              | string    | 是   | 枚举值：draft / sent / paid / overdue |
| client.name         | string    | 是   | 客户名称                              |
| client.email        | string    | 是   | 客户邮箱                              |
| client.address      | string    | 否   | 客户地址                              |
| client.phone        | string    | 否   | 客户电话                              |
| items               | array     | 是   | 商品明细数组，至少一项                       |
| items[].description | string    | 是   | 商品描述                              |
| items[].quantity    | number    | 是   | 数量，>0                             |
| items[].unitPrice   | number    | 是   | 单价，>0                             |
| items[].total       | number    | 自动  | 数量 × 单价                           |
| subtotal            | number    | 自动  | Σ items[].total                   |
| taxRate             | number    | 是   | 税率百分比                             |
| taxAmount           | number    | 自动  | subtotal × taxRate / 100          |
| total               | number    | 自动  | subtotal + taxAmount              |
| currency            | string    | 是   | CNY / USD / EUR                   |
| notes               | string    | 否   | 备注                                |
| dueDate             | timestamp | 否   | 到期日期                              |
| createdAt           | timestamp | 自动  | Firestore serverTimestamp         |
| updatedAt           | timestamp | 自动  | Firestore serverTimestamp         |

### 5.3 Client（Firestore 集合：`clients`，阶段二）

| 字段        | 类型        | 必填  | 说明              |
| --------- | --------- | --- | --------------- |
| id        | string    | 自动  | Firestore 文档 ID |
| userId    | string    | 是   | 所属用户            |
| name      | string    | 是   | 客户名称            |
| email     | string    | 是   | 客户邮箱            |
| address   | string    | 否   | 客户地址            |
| phone     | string    | 否   | 客户电话            |
| createdAt | timestamp | 自动  | 创建时间            |

---

## 6. Firestore 安全规则

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 用户文档：仅自己可读写
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }

    // 发票文档：仅所属用户可读写
    match /invoices/{docId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null 
        && request.auth.uid == request.resource.data.userId;
    }

    // 客户文档：仅所属用户可读写
    match /clients/{docId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null 
        && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

---

## 7. 非功能需求

| 类别    | 要求                                      |
| ----- | --------------------------------------- |
| 响应式   | 桌面端为主（>1024px），平板手机可查看但不强制优化编辑体验        |
| 表单校验  | 所有表单提交前做完整校验，必填字段标红色*，错误信息行内显示          |
| 操作确认  | 删除发票必须弹窗确认；退出登录弹窗确认                     |
| 加载状态  | 列表加载显示 Skeleton；提交按钮显示 loading spin     |
| 空状态   | 无发票时显示空状态插画 + CTA 按钮；搜索结果为空时显示"未找到匹配发票" |
| 错误处理  | 网络异常显示 toast 提示；Firebase 异常捕获并显示中文错误信息  |
| 路由守卫  | 未登录 → /login；已登录访问登录页 → /invoices       |
| 防重复提交 | 按钮点击后 disabled 直到操作完成                   |
| 日志    | console.error 记录 Firebase 异常，不上报第三方     |

---

## 8. 组件架构规划（Vue 3）

```
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
```

---

## 9. 里程碑

| 阶段  | 功能                    | 交付物         | 预计工时  |
| --- | --------------------- | ----------- | ----- |
| 一   | 认证 + 发票 CRUD + 筛选搜索   | 可运行的 MVP    | 2-3 周 |
| 二   | 仪表盘 + PDF + 客户 + 设置   | 功能完善的应用     | 1-2 周 |
| 三   | 邮件 + 多语言 + 暗黑模式 + CSV | polished 产品 | 2-3 周 |

---

## 10. 成功标准

1. 用户能完整走通：注册 → 登录 → 创建发票 → 管理发票 → 导出 PDF 的完整流程
2. 表单校验完整，不能出现空数据或错误数据写入数据库
3. 页面加载（含 Firebase 请求）在 2 秒内完成
4. 所有操作都有 loading 和错误反馈，不会出现无响应的状态
5. 部署后可线上访问
