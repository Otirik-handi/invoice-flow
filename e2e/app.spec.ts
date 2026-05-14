import { test, expect } from '@playwright/test';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: resolve(__dirname, '.env.test') });

const TEST_EMAIL = process.env.TEST_EMAIL ?? '';
const TEST_PASSWORD = process.env.TEST_PASSWORD ?? '';

async function login(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByPlaceholder('请输入邮箱').fill(TEST_EMAIL);
  await page.getByPlaceholder('请输入密码').fill(TEST_PASSWORD);
  await page.getByRole('button', { name: '登录' }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

test.describe('仪表盘', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/dashboard');
    await page.waitForTimeout(1000); // 等待数据加载 & ECharts 渲染
  });

  test('页面标题正确', async ({ page }) => {
    await expect(page.locator('.page-title')).toHaveText('仪表盘');
    await expect(page.getByText('您的发票数据概览')).toBeVisible();
  });

  test('统计卡片展示', async ({ page }) => {
    await expect(page.getByText('总发票数')).toBeVisible();
    await expect(page.getByText('总收入')).toBeVisible();
    await expect(page.getByText('待处理')).toBeVisible();
    await expect(page.getByText('已逾期')).toBeVisible();
  });

  test('常用操作按钮可见', async ({ page }) => {
    await expect(page.getByRole('button', { name: '创建发票' })).toBeVisible();
    await expect(page.getByRole('button', { name: '管理客户' })).toBeVisible();
    await expect(page.getByRole('button', { name: '系统设置' })).toBeVisible();
  });
});

test.describe('发票管理', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/invoices');
  });

  test('列表页标题正确', async ({ page }) => {
    await expect(page.locator('.page-title')).toHaveText('发票列表');
  });

  test('创建发票弹窗可打开', async ({ page }) => {
    await page.getByRole('button', { name: '创建发票', exact: true }).click();
    await expect(page.getByText('客户信息')).toBeVisible();
    await expect(page.getByText('商品明细')).toBeVisible();
  });
});

test.describe('客户管理', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/clients');
  });

  test('页面标题正确', async ({ page }) => {
    await expect(page.locator('.page-title')).toHaveText('客户管理');
  });

  test('添加客户弹窗可打开', async ({ page }) => {
    await page.getByRole('button', { name: '添加客户' }).click();
    // 弹窗内的表单标签
    await expect(page.getByRole('dialog').getByText('客户名称', { exact: true })).toBeVisible();
    await expect(page.getByRole('dialog').getByText('客户邮箱', { exact: true })).toBeVisible();
  });
});

test.describe('设置', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/settings');
  });

  test('页面标题和设置卡片渲染', async ({ page }) => {
    await expect(page.getByText('系统设置')).toBeVisible();
    await expect(page.getByText('个人信息')).toBeVisible();
    await expect(page.getByText('默认设置')).toBeVisible();
    await expect(page.getByText('显示名称')).toBeVisible();
    await expect(page.getByText('默认货币')).toBeVisible();
  });

  test('保存按钮可见', async ({ page }) => {
    await expect(page.getByRole('button', { name: '保存设置' })).toBeVisible();
  });
});

test.describe('暗色模式', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/dashboard');
  });

  test('侧边栏暗色模式切换按钮存在', async ({ page }) => {
    await expect(page.getByText('暗色模式').or(page.getByText('亮色模式'))).toBeVisible();
  });

  test('点击切换主题', async ({ page }) => {
    const toggle = page.getByText('暗色模式').or(page.getByText('亮色模式'));
    await toggle.click();
    await page.waitForTimeout(300);
  });
});
