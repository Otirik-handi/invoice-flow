# TODO LIST

- [x] 类型定义 — src/types/index.ts 先定义 Invoice、Client、User的类型，后面所有文件都会引用这里。

- [x] Firebase 初始化 — src/api/firebase.ts,配置 Firebase SDK，导出 auth 和 db 实例。

- [x] API 封装层 — src/api/auth.ts、src/api/invoice.ts,把 Firebase 调用封装成函数，这样组件里不用直接操作Firebase。

- [x] 路由 — src/router/index.ts,配置路由表 + 路由守卫（未登录拦截）。

- [x] Store — src/stores/authStore.ts、src/stores/invoiceStore.ts,Pinia 状态管理。

- [x] App.vue 和 main.ts

- [ ] 找AI做一个UI设计稿（已完成登录页和注册页UI设计稿）

- [ ] 布局组件
  - [x] src/components/layout/AppLayout.vue   侧边栏 + 顶栏 + 内容区布局。
  - [ ] 页面组件 — src/views/ 下的页面
    - [x] Login
    - [ ] Register
    - [ ] InvoiceList
    - [ ] InvoiceDetail
    - [ ] InvoiceForm。
