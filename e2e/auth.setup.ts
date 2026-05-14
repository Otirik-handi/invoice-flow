import { test as setup, expect } from '@playwright/test';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: resolve(__dirname, '.env.test') });

const authFile = '.auth/user.json';

setup('authenticate', async ({ page }) => {
  const email = process.env.TEST_EMAIL;
  const password = process.env.TEST_PASSWORD;

  if (!email || !password) {
    console.warn(
      '⚠  TEST_EMAIL / TEST_PASSWORD 未设置，跳过认证 setup。\n' +
        '   创建 e2e/.env.test 文件并填写测试账号凭据。',
    );
    return;
  }

  await page.goto('/login');
  await page.getByPlaceholder('请输入邮箱').fill(email);
  await page.getByPlaceholder('请输入密码').fill(password);
  await page.getByRole('button', { name: '登录' }).click();

  // 等待跳转到仪表盘
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

  await page.context().storageState({ path: authFile });
});
