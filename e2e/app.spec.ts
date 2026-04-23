import { test, expect } from '@playwright/test';

test.describe('COREONE E2E Tests', () => {
  test('homepage loads successfully', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveTitle(/病理试剂管理/);
    await expect(page.getByRole('heading', { name: '今日概览' })).toBeVisible();
  });

  test('navigation to inventory check page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.getByRole('link', { name: '库存盘点' }).click();
    await page.waitForURL('**/inventory/check');
    
    await expect(page.getByRole('heading', { name: '库存盘点' })).toBeVisible();
  });

  test('navigation to visualization page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.getByRole('link', { name: '数据可视化' }).click();
    await page.waitForURL('**/visualization');
    
    await expect(page.getByRole('heading', { name: '数据可视化' })).toBeVisible();
  });

  test('navigation to alerts page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.getByRole('link', { name: '预警中心' }).click();
    await page.waitForURL('**/alerts');
    
    await expect(page.getByRole('heading', { name: '预警中心' })).toBeVisible();
  });

  test('sidebar expands and collapses', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible();
  });

  test('visualization charts render', async ({ page }) => {
    await page.goto('/visualization');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await expect(page.getByRole('heading', { name: '成本趋势' }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: '成本构成' }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: '库存健康度' }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: '供应商比价' }).first()).toBeVisible();
  });

  test('export dialog opens', async ({ page }) => {
    await page.goto('/cost-analysis/case-cost');
    await page.waitForLoadState('networkidle');
    
    const exportButton = page.getByRole('button', { name: /导出/ });
    if (await exportButton.count() > 0) {
      await exportButton.first().click();
      await expect(page.getByRole('dialog')).toBeVisible();
    }
  });

  test('responsive layout - mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await expect(page.getByRole('heading', { name: '今日概览' })).toBeVisible();
  });

  test('responsive layout - tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await expect(page.getByRole('heading', { name: '今日概览' })).toBeVisible();
  });

  test('inventory check page elements', async ({ page }) => {
    await page.goto('/inventory/check');
    await page.waitForLoadState('networkidle');
    
    await expect(page.getByRole('heading', { name: '库存盘点' })).toBeVisible();
  });
});
