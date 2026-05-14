<template>
  <n-flex id="regist-page-wrapper" :size="0">
    <!-- 左侧面板 -->
    <n-flex class="left-panel" justify="center" align="start" :vertical="true" :size="36">
      <n-flex class="brand-header">
        <n-icon class="logo-box" :component="AccountBookOutlined" size="48"></n-icon>
        <span class="brand-name">InvoiceFlow</span>
      </n-flex>
      <h1 class="tagline">加入 InvoiceFlow</h1>
      <h4 class="subtagline">创建账户，开启发票与客户管理之旅</h4>
      <n-list class="steps-list" :show-divider="false">
        <n-list-item class="step">
          <div class="order">1</div>
          <p>
            填写信息
            <n-divider :vertical="true"></n-divider>
            设置邮箱与密码
          </p>
        </n-list-item>
        <n-list-item class="step">
          <div class="order">2</div>
          <p>
            完善资料
            <n-divider :vertical="true"></n-divider>
            填写显示名称
          </p>
        </n-list-item>
        <n-list-item class="step">
          <div class="order">3</div>
          <p>
            开始使用
            <n-divider :vertical="true"></n-divider>
            管理发票与客户
          </p>
        </n-list-item>
      </n-list>
      <n-flex class="trial-badge" align="center" justify="center">免费注册，无需绑定信用卡</n-flex>
    </n-flex>
    <!-- 右侧面板 -->
    <n-flex class="right-panel" justify="center" align="center">
      <n-form class="reg-card" @submit.prevent="handleRegister">
        <n-flex class="title-row">
          <h1 class="form-title">创建新账户</h1>
          <h3 class="form-subtitle">填写以下信息，快速完成注册</h3>
        </n-flex>

        <n-alert v-if="errorMsg" type="error" closable @close="errorMsg = ''" :bordered="false">
          {{ errorMsg }}
        </n-alert>

        <n-form-item label="邮箱" :feedback="emailError">
          <n-input
            v-model:value="email"
            placeholder="请输入邮箱"
            size="large"
            :disabled="loading"
          >
            <template #prefix>
              <n-icon :component="UserOutlined"></n-icon>
            </template>
          </n-input>
        </n-form-item>
        <n-form-item label="名称" :feedback="nameError">
          <n-input
            v-model:value="displayName"
            placeholder="请输入您的名称"
            size="large"
            :disabled="loading"
          >
            <template #prefix>
              <n-icon :component="UserOutlined"></n-icon>
            </template>
          </n-input>
        </n-form-item>
        <n-flex justify="center" align="center">
          <n-form-item label="设置密码" class="flex-grow-1" :feedback="passwordError">
            <n-input
              v-model:value="password"
              placeholder="至少8位字符"
              size="large"
              type="password"
              show-password-on="click"
              :disabled="loading"
            >
              <template #prefix>
                <n-icon :component="LockOutlined"></n-icon>
              </template>
            </n-input>
          </n-form-item>
          <n-form-item label="确认密码" class="flex-grow-1" :feedback="confirmError">
            <n-input
              v-model:value="confirmPassword"
              placeholder="再次输入密码"
              size="large"
              type="password"
              show-password-on="click"
              :disabled="loading"
            >
              <template #prefix>
                <n-icon :component="LockOutlined"></n-icon>
              </template>
            </n-input>
          </n-form-item>
        </n-flex>
        <n-checkbox v-model:checked="agreed" class="argee-row"
          >我已阅读并同意《服务协议》和《隐私政策》</n-checkbox
        >
        <n-button
          size="large"
          color="#4f46e5"
          :loading="loading"
          :disabled="loading"
          attr-type="submit"
        >
          <template #icon>
            <n-icon :component="UserAddOutlined"></n-icon>
          </template>
          {{ loading ? '注册中…' : '注册' }}
        </n-button>
        <n-divider></n-divider>
        <n-flex class="login-row" justify="center">
          已有账户？
          <router-link to="/login">去登录</router-link>
        </n-flex>
      </n-form>
    </n-flex>
  </n-flex>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/authStore';
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
  NCheckbox,
  NAlert,
} from 'naive-ui';
import { AccountBookOutlined, UserOutlined, LockOutlined, UserAddOutlined } from '@vicons/antd';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const displayName = ref('');
const password = ref('');
const confirmPassword = ref('');
const agreed = ref(false);
const loading = ref(false);
const errorMsg = ref('');

const emailError = ref('');
const nameError = ref('');
const passwordError = ref('');
const confirmError = ref('');

function validate(): boolean {
  let valid = true;
  emailError.value = '';
  nameError.value = '';
  passwordError.value = '';
  confirmError.value = '';

  if (!email.value.trim()) {
    emailError.value = '请输入邮箱';
    valid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    emailError.value = '邮箱格式不正确';
    valid = false;
  }
  if (!displayName.value.trim()) {
    nameError.value = '请输入名称';
    valid = false;
  }
  if (!password.value) {
    passwordError.value = '请设置密码';
    valid = false;
  } else if (password.value.length < 8) {
    passwordError.value = '密码至少8位字符';
    valid = false;
  }
  if (!confirmPassword.value) {
    confirmError.value = '请确认密码';
    valid = false;
  } else if (password.value !== confirmPassword.value) {
    confirmError.value = '两次密码输入不一致';
    valid = false;
  }
  if (!agreed.value) {
    errorMsg.value = '请阅读并同意服务协议和隐私政策';
    valid = false;
  }
  return valid;
}

async function handleRegister() {
  errorMsg.value = '';
  if (!validate()) return;

  loading.value = true;
  try {
    await authStore.register(email.value.trim(), password.value, displayName.value.trim());
    router.push('/dashboard');
  } catch (e: unknown) {
    const err = e as { code?: string; message?: string };
    const code = err.code;
    if (code === 'auth/email-already-in-use') {
      errorMsg.value = '该邮箱已被注册';
    } else if (code === 'auth/weak-password') {
      errorMsg.value = '密码强度不足，至少需要8位字符';
    } else if (code === 'auth/invalid-email') {
      errorMsg.value = '邮箱格式无效';
    } else {
      errorMsg.value = err.message || '注册失败，请稍后重试';
    }
  } finally {
    loading.value = false;
  }
}
</script>

<style>
#regist-page-wrapper {
  width: 90rem;
  height: 56.25rem;
}

.left-panel {
  box-sizing: border-box;
  width: 31.25rem;
  height: 100%;
  padding: 3.5rem 3.75rem;
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

.left-panel .steps-list {
  color: #fff;
  background-color: transparent;
}

.left-panel .steps-list .step .n-list-item__main {
  display: flex;
  justify-content: start;
  align-items: center;
  flex-direction: row;
  gap: 0.85rem;
  line-height: 2rem;
}

.left-panel .steps-list .step .n-icon {
  margin-right: 0.375rem;
}

.step .order {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  font-size: 1.25rem;
}

.steps-list .step:first-child .order {
  background-color: #fff;
  color: var(--color-primary);
}

.trial-badge {
  width: 100%;
  height: 2.6rem;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-md);
}
.reg-card {
  box-sizing: border-box;
  width: 30rem;
  padding: 44px 48px;
}

.reg-card > * {
  width: 100%;
}

.flex-grow-1 {
  flex-grow: 1;
}

.argee-row {
  margin-bottom: 1rem;
}
</style>
