<template>
  <n-config-provider :theme="themeStore.isDark ? darkTheme : null" :theme-overrides="themeOverrides">
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
import { onMounted, watch, computed } from 'vue';
import { useAuthStore } from './stores/authStore';
import { useThemeStore } from './stores/themeStore';
import { lightThemeOverrides, darkThemeOverrides, getCssVars } from './theme';
import { darkTheme } from 'naive-ui';
import {
  NConfigProvider,
  NLoadingBarProvider,
  NMessageProvider,
  NNotificationProvider,
  NModalProvider,
  NDialogProvider,
} from 'naive-ui';

const authStore = useAuthStore();
const themeStore = useThemeStore();
authStore.init();

const themeOverrides = computed(() =>
  themeStore.isDark ? darkThemeOverrides : lightThemeOverrides,
);

function applyCssVars(isDark: boolean) {
  const vars = getCssVars(isDark);
  const root = document.documentElement;
  Object.entries(vars).forEach(([key, val]) => {
    root.style.setProperty(key, val);
  });
}

onMounted(() => {
  applyCssVars(themeStore.isDark);
});

watch(() => themeStore.isDark, applyCssVars);
</script>
