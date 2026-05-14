import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

const STORAGE_KEY = 'invoiceflow-theme';

function getInitialTheme(): boolean {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored !== null) return stored === 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(getInitialTheme());

  watch(
    isDark,
    (val) => {
      localStorage.setItem(STORAGE_KEY, val ? 'dark' : 'light');
    },
    { immediate: true },
  );

  function toggle() {
    isDark.value = !isDark.value;
  }

  return { isDark, toggle };
});
