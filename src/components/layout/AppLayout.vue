<template>
  <n-layout has-sider class="layout-warpper">
    <n-layout-sider
      bordered
      collapse-mode="width"
      :width="240"
      :collapsed-width="64"
      :collapsed="collapsed"
      show-trigger
      @collapse="collapsed = true"
      @expand="collapsed = false"
      class="app-sider"
    >
      <div class="sidebar-header">
        <n-icon class="sidebar-logo" :component="AccountBookOutlined" size="28" />
        <span v-show="!collapsed" class="sidebar-title">InvoiceFlow</span>
      </div>
      <n-divider style="margin: 0" />
      <div class="sidebar-menu-area">
        <n-menu
          :collapsed="collapsed"
          :collapsed-width="64"
          :collapsed-icon-size="22"
          :options="menuOptions"
          :value="activeKey"
          @update:value="handleMenuSelect"
        />
      </div>
      <div class="sidebar-footer">
        <n-divider style="margin: 0" />
        <div class="logout-item" :class="{ collapsed }" @click="handleMenuSelect('logout')">
          <n-icon :component="LogoutOutlined" size="18" />
          <span v-show="!collapsed">退出登录</span>
        </div>
      </div>
    </n-layout-sider>
    <n-layout>
      <n-layout-header class="navbar">
        <div class="navbar-left">
          <span class="navbar-title">页面标题</span>
        </div>
        <div class="navbar-right">
          <n-avatar size="small" round class="navbar-avatar">U</n-avatar>
          <span class="navbar-username">用户名</span>
          <n-icon :component="DownOutlined" size="12" class="navbar-caret" />
        </div>
      </n-layout-header>
      <n-layout-content>
        <router-view />
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<script setup lang="ts">
import { h, computed, ref } from 'vue';
import type { Component } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
  NLayout,
  NLayoutContent,
  NLayoutSider,
  NLayoutHeader,
  NMenu,
  NIcon,
  NDivider,
  NAvatar,
  useDialog,
} from 'naive-ui';
import type { MenuOption } from 'naive-ui';
import {
  AccountBookOutlined,
  FileTextOutlined,
  DashboardOutlined,
  TeamOutlined,
  SettingOutlined,
  LogoutOutlined,
  DownOutlined,
} from '@vicons/antd';

const router = useRouter();
const route = useRoute();
const dialog = useDialog();
const collapsed = ref(false);

function renderIcon(icon: Component) {
  return () => h(NIcon, null, { default: () => h(icon) });
}

const menuOptions: MenuOption[] = [
  { label: '发票管理', key: '/invoices', icon: renderIcon(FileTextOutlined) },
  { label: '仪表盘', key: '/dashboard', icon: renderIcon(DashboardOutlined) },
  { label: '客户管理', key: '/clients', icon: renderIcon(TeamOutlined) },
  { label: '设置', key: '/settings', icon: renderIcon(SettingOutlined) },
];

const activeKey = computed(() => {
  const path = route.path;
  if (path.startsWith('/invoices')) return '/invoices';
  return path;
});

function handleMenuSelect(key: string) {
  if (key === 'logout') {
    dialog.warning({
      title: '退出登录',
      content: '确定退出登录？',
      positiveText: '确认退出',
      negativeText: '取消',
      onPositiveClick: async () => {
        const { useAuthStore } = await import('../../stores/authStore');
        await useAuthStore().logout();
        router.push({ name: 'Login' });
      },
    });
    return;
  }
  router.push(key);
}
</script>

<style scoped>
.layout-warpper {
  width: 100vw;
  height: 100vh;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 56px;
  padding: 0 20px;
}

.sidebar-logo {
  flex-shrink: 0;
}

.sidebar-title {
  font-size: 18px;
  font-weight: 700;
  white-space: nowrap;
}

.sidebar-footer {
  border-top: 1px solid var(--color-border, #e5e7eb);
}

.logout-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  cursor: pointer;
  font-size: 14px;
  color: var(--color-text-secondary, #6b7280);
  transition:
    background-color 0.2s,
    color 0.2s;
}

.logout-item:hover {
  background-color: var(--color-primary-lighter, rgba(79, 70, 229, 0.08));
  color: var(--color-error, #dc2626);
}

.logout-item.collapsed {
  justify-content: center;
  padding: 12px 0;
}

.sidebar-menu-area {
  flex: 1;
  overflow-y: auto;
}

.app-sider {
  display: flex;
  flex-direction: column;
}

.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 24px;
  border-bottom: 1px solid var(--color-border, #e5e7eb);
}

.navbar-title {
  font-size: 18px;
  font-weight: 600;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: default;
}

.navbar-avatar {
  background-color: var(--color-primary, #4f46e5);
  color: #fff;
  font-weight: 600;
  font-size: 14px;
}

.navbar-username {
  font-size: 14px;
  color: var(--color-text, #1f2937);
}

.navbar-caret {
  color: var(--color-text-secondary, #6b7280);
}
</style>
