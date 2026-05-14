<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-loading-bar-provider>
      <n-message-provider>
        <n-notification-provider>
          <n-modal-provider>
            <n-dialog-provider>
              <router-view />
            </n-dialog-provider>
          </n-modal-provider>
        </n-notification-provider>
      </n-message-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from './stores/authStore';
import { themeOverrides, cssVars } from './theme';
import {
  NConfigProvider,
  NLoadingBarProvider,
  NMessageProvider,
  NNotificationProvider,
  NModalProvider,
  NDialogProvider,
} from 'naive-ui';

const authStore = useAuthStore();
authStore.init();

onMounted(() => {
  const root = document.documentElement;
  Object.entries(cssVars).forEach(([key, val]) => {
    root.style.setProperty(key, val);
  });
});
</script>
