import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './frontend-v2-auth.fixture';

/**
 * 真实前端 E2E 验收测试 - 入库管理
 */

test.describe('入库管理 - 真实前端', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('进入入库管理页面并验证基本结构', async ({ page }) => {
    await page.goto('/inbound');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toContainText('入库管理');
    const statCount = await page.locator('.stat-card').count();
    expect(statCount).toBeGreaterThanOrEqual(2);
    const hasTable = await page.locator('table').isVisible().catch(() => false);
    const hasEmpty = await page.locator('.empty-state').isVisible().catch(() => false);
    expect(hasTable || hasEmpty).toBe(true);
  });

  test('打开入库登记弹窗', async ({ page }) => {
    await page.goto('/inbound');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("入库"), button:has-text("登记")');
    await expect(page.locator('.modal-overlay')).toBeVisible();
    await expect(page.locator('.modal-title')).toContainText('入库');

    await page.click('.modal-footer button:has-text("取消")');
    await expect(page.locator('.modal-overlay')).not.toBeVisible();
  });
});
