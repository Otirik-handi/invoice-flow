import { test, expect } from '@playwright/test';

test.describe('登录页', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('页面正确渲染', async ({ page }) => {
    await expect(page.getByRole('heading', { name: '欢迎回来' })).toBeVisible();
    await expect(page.getByPlaceholder('请输入邮箱')).toBeVisible();
    await expect(page.getByPlaceholder('请输入密码')).toBeVisible();
    await expect(page.getByRole('button', { name: '登录' })).toBeVisible();
    await expect(page.getByText('还没有账户？')).toBeVisible();
  });

  test('空表单提交显示校验错误', async ({ page }) => {
    await page.getByRole('button', { name: '登录' }).click();
    // Naive UI 会显示表单校验反馈
    // 点击后 Naive UI 显示表单校验反馈（第二个匹配元素是反馈信息）
    await expect(page.getByText('请输入邮箱').nth(1)).toBeVisible();
  });

  test('无效邮箱格式显示错误', async ({ page }) => {
    await page.getByPlaceholder('请输入邮箱').fill('invalid-email');
    await page.getByPlaceholder('请输入密码').fill('password123');
    await page.getByRole('button', { name: '登录' }).click();
    await expect(page.getByText('邮箱格式不正确')).toBeVisible();
  });

  test('可跳转到注册页', async ({ page }) => {
    await page.getByText('去注册').click();
    await expect(page).toHaveURL(/\/register/);
  });
});
