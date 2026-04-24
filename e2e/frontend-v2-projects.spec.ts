import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './frontend-v2-auth.fixture';

/**
 * 真实前端 E2E 验收测试 - 检测项目管理
 */

test.describe('检测项目管理 - 真实前端', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('进入检测项目管理页面并验证基本结构', async ({ page }) => {
    await page.goto('/projects');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toContainText('检测项目管理');
    const statCount = await page.locator('.stat-card').count();
    expect(statCount).toBeGreaterThanOrEqual(2);
    const hasTable = await page.locator('table').isVisible().catch(() => false);
    const hasEmpty = await page.locator('.empty-state').isVisible().catch(() => false);
    expect(hasTable || hasEmpty).toBe(true);
  });

  test('新增检测项目弹窗可正常打开并填写', async ({ page }) => {
    await page.goto('/projects');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("新建")');
    await expect(page.locator('.modal-overlay')).toBeVisible();

    const modal = page.locator('.modal-overlay');
    // 验证弹窗标题
    await expect(modal.locator('.modal-title')).toContainText('新建检测项目');

    // 填写表单
    await modal.locator('input').nth(0).fill(`E2E项目_${Date.now()}`);
    await modal.locator('input').nth(1).fill(`CODE${Date.now()}`);
    await modal.locator('select').nth(0).selectOption('分子病理');

    // 验证创建按钮存在且可点击
    const createBtn = modal.locator('.modal-footer button:has-text("创建")');
    await expect(createBtn).toBeVisible();
    await expect(createBtn).toBeEnabled();

    // 点击取消关闭弹窗
    await modal.locator('.modal-footer button:has-text("取消")').click();
    await expect(page.locator('.modal-overlay')).not.toBeVisible();
  });
});
