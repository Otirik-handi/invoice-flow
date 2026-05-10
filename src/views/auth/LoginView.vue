<template>
  <n-flex id="login-page-wrapper" :size="0">
    <!-- 左侧面板  -->
    <n-flex class="left-panel" :size="[0, 40]" :vertical="true" justify="center">
      <n-flex class="brand-header">
        <n-icon class="logo-box" :component="AccountBookOutlined" size="48"></n-icon>
        <span class="brand-name">InvoiceFlow</span>
      </n-flex>
      <h1 class="tagline">专业发票管理</h1>
      <h4 class="subtagline">面向自由职业者与小企业的发票管理工具</h4>
      <n-list class="feature-list" :show-divider="false">
        <n-list-item class="feat">
          <n-icon class="feat-icon" size="32" :component="BarChartOutlined"></n-icon>
          发票创建与管理
        </n-list-item>
        <n-list-item class="feat">
          <n-icon class="feat-icon" size="32" :component="CloudSyncOutlined"></n-icon>
          客户信息管理
        </n-list-item>
        <n-list-item class="feat">
          <n-icon class="feat-icon" size="32" :component="CheckCircleTwotone"></n-icon>
          数据实时同步
        </n-list-item>
      </n-list>
      <n-flex class="stats-row" align="center" justify="center">
        <n-flex class="stat" justify="center" align="center" :size="0" :vertical="true">
          <span>1000+</span>
          个人用户
        </n-flex>
        <n-divider vertical />
        <n-flex class="stat" justify="center" align="center" :size="0" :vertical="true">
          <span>50000+</span>
          发票处理
        </n-flex>
        <n-divider vertical />
        <n-flex class="stat" justify="center" align="center" :size="0" :vertical="true">
          <span>99.9%</span>
          服务稳定性
        </n-flex>
      </n-flex>
    </n-flex>

    <!-- 右侧面板 -->
    <n-flex class="right-panel" justify="center" align="center">
      <n-form class="form-card">
        <n-flex class="title-row">
          <h1 class="form-title">欢迎回来</h1>
          <h3 class="form-subtitle">登录以管理您的发票与客户</h3>
        </n-flex>
        <n-form-item label="邮箱">
          <n-input placeholder="请输入邮箱" size="large">
            <template #prefix>
              <n-icon :component="UserOutlined"></n-icon>
            </template>
          </n-input>
        </n-form-item>
        <n-form-item label="密码">
          <n-input placeholder="请输入密码" size="large" type="password" show-password-on="click">
            <template #prefix>
              <n-icon :component="LockOutlined"></n-icon>
            </template>
          </n-input>
        </n-form-item>
        <n-flex class="ops-row" justify="space-between" align="start">
          <n-checkbox>记住我</n-checkbox>
          <a href="#">忘记密码?</a>
        </n-flex>
        <n-button size="large" color="#4f46e5">登录</n-button>
        <n-divider></n-divider>
        <n-flex class="regist-row" justify="center">
          还没有账户？<router-link to="Register">去注册</router-link>
        </n-flex>
      </n-form>
    </n-flex>
  </n-flex>
</template>

<script setup lang="ts">
import {
  NFlex,
  NForm,
  NFormItem,
  NInput,
  NIcon,
  NList,
  NListItem,
  NDivider,
  NButton,
  NCheckbox
} from 'naive-ui';
import {
  AccountBookOutlined,
  BarChartOutlined,
  CloudSyncOutlined,
  CheckCircleTwotone,
  UserOutlined,
  LockOutlined
} from "@vicons/antd"
</script>

<style>
#login-page-wrapper {
  width: 90rem;
  height: 56.25rem;
}

.left-panel {
  box-sizing: border-box;
  width: 38.75rem;
  height: 100%;
  padding: 0 4rem 3.75rem;
  background: linear-gradient(45deg, var(--color-primary-light), var(--color-primary));
  color: var(--color-bg);
  border-top-left-radius: var(--radius-xl);
  border-bottom-left-radius: var(--radius-xl);
}

.left-panel .logo-box {
  margin-right: 0.875rem;
}

.left-panel .n-icon {
  background: rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-sm);
}

.left-panel .n-icon svg {
  width: 75%;
  height: 75%;
}

.left-panel .brand-name {
  font: bold 2rem/1.5 var(--font-mono);
}

.left-panel .tagline {
  font: bold 2.5rem/1.5 var(--font-sans);
}

.left-panel .subtagline {
  font: lighter 1rem/1.5 var(--font-sans);
}

.left-panel .feature-list {
  color: white;
  background-color: transparent;
}

.left-panel .feature-list .feat .n-list-item__main {
  line-height: 2rem;
}

.left-panel .feature-list .feat .n-icon {
  margin-right: 0.375rem;
}

.left-panel .stats-row {
  height: 5rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-xl);
}

.left-panel .stats-row .stat {
  flex: 1 1;
}

.left-panel .stats-row .stat span {
  font-weight: bold;
  font-size: 1.5rem;
}

.right-panel {
  box-sizing: border-box;
  flex: 1;
  height: 100%;
  padding: 2.5rem 5rem;
  background-color: #fff;
  border-top-right-radius: var(--radius-xl);
  border-bottom-right-radius: var(--radius-xl);
}

.right-panel .form-card {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  box-sizing: border-box;
  min-width: 420px;
  padding: 4rem;
}

.right-panel .form-card>* {
  width: 100%;
}

.title-row {
  margin-bottom: 2.5rem;
}

.title-row .form-title {
  width: 100%;
  font-size: 2rem;
  font-weight: bolder;
}

.title-row .form-subtitle {
  width: 100%;
  font-size: 0.85rem;
  font-weight: lighter;
  color: var(--color-text);
}

.ops-row {
  min-height: 4rem;
}
</style>
