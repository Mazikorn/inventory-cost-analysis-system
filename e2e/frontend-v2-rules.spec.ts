import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './frontend-v2-auth.fixture';

/**
 * 真实前端 E2E 验收测试 - 预警规则管理
 */

test.describe('预警规则管理 - 真实前端', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('进入预警规则管理页面并验证基本结构', async ({ page }) => {
    await page.goto('/rules');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toContainText('预警规则');
    const statCount = await page.locator('.stat-card').count();
    expect(statCount).toBeGreaterThanOrEqual(2);
    const hasTable = await page.locator('table').isVisible().catch(() => false);
    const hasEmpty = await page.locator('.empty-state').isVisible().catch(() => false);
    expect(hasTable || hasEmpty).toBe(true);
  });
});
