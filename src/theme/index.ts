import type { GlobalThemeOverrides } from 'naive-ui';

const lightPalette = {
  primary: '#4f46e5',
  primaryHover: '#4338ca',
  primaryLight: 'rgba(79, 70, 229, 0.3)',
  primaryLighter: 'rgba(79, 70, 229, 0.08)',
  success: '#16a34a',
  warning: '#d97706',
  error: '#dc2626',
  text: '#1f2937',
  textSecondary: '#6b7280',
  textTertiary: '#9ca3af',
  bg: '#ffffff',
  bgPage: '#f8fafc',
  bgElevated: '#ffffff',
  border: '#e5e7eb',
  borderLight: '#f3f4f6',
};

const darkPalette = {
  primary: '#818cf8',
  primaryHover: '#6366f1',
  primaryLight: 'rgba(129, 140, 248, 0.3)',
  primaryLighter: 'rgba(129, 140, 248, 0.08)',
  success: '#22c55e',
  warning: '#fbbf24',
  error: '#ef4444',
  text: '#f3f4f6',
  textSecondary: '#9ca3af',
  textTertiary: '#6b7280',
  bg: '#1e1e2e',
  bgPage: '#181825',
  bgElevated: '#252536',
  border: '#363649',
  borderLight: '#2e2e42',
};

function buildOverrides(palette: typeof lightPalette): GlobalThemeOverrides {
  return {
    common: {
      primaryColor: palette.primary,
      primaryColorHover: palette.primaryHover,
      primaryColorPressed: palette.primaryHover,
      primaryColorSuppl: palette.primary,
      successColor: palette.success,
      warningColor: palette.warning,
      errorColor: palette.error,
      textColor1: palette.text,
      textColor2: palette.textSecondary,
      textColor3: palette.textTertiary,
      borderColor: palette.border,
      bodyColor: palette.bgPage,
    },
  };
}

function buildCssVars(palette: typeof lightPalette): Record<string, string> {
  return {
    '--color-primary': palette.primary,
    '--color-primary-hover': palette.primaryHover,
    '--color-primary-light': palette.primaryLight,
    '--color-primary-lighter': palette.primaryLighter,
    '--color-success': palette.success,
    '--color-warning': palette.warning,
    '--color-error': palette.error,
    '--color-text': palette.text,
    '--color-text-secondary': palette.textSecondary,
    '--color-text-tertiary': palette.textTertiary,
    '--color-bg': palette.bg,
    '--color-bg-page': palette.bgPage,
    '--color-bg-elevated': palette.bgElevated,
    '--color-border': palette.border,
    '--color-border-light': palette.borderLight,
  };
}

export const lightThemeOverrides = buildOverrides(lightPalette);
export const darkThemeOverrides = buildOverrides(darkPalette);

export const lightCssVars = buildCssVars(lightPalette);
export const darkCssVars = buildCssVars(darkPalette);

export function getCssVars(isDark: boolean): Record<string, string> {
  return isDark ? darkCssVars : lightCssVars;
}
