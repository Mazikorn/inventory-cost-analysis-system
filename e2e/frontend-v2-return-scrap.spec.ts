import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './frontend-v2-auth.fixture';

/**
 * 真实前端 E2E 验收测试 - 退库与报废管理
 */

test.describe('退库与报废管理 - 真实前端', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('进入退库管理页面', async ({ page }) => {
    await page.goto('/return');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toContainText('退库管理');
    const statCount = await page.locator('.stat-card').count();
    expect(statCount).toBeGreaterThanOrEqual(2);
  });

  test('进入报废管理页面', async ({ page }) => {
    await page.goto('/scrap');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toContainText('报废管理');
    const statCount2 = await page.locator('.stat-card').count();
    expect(statCount2).toBeGreaterThanOrEqual(2);
  });
});
