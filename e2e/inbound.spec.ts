import { test, expect } from '@playwright/test';

test.describe('入库管理功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('应该显示入库管理页面', async ({ page }) => {
    await page.goto('/inventory/inbound');
    
    await expect(page.locator('h1')).toContainText('入库管理');
    await expect(page.locator('button:has-text("新建入库")')).toBeVisible();
  });

  test('应该能够创建入库记录', async ({ page }) => {
    await page.goto('/inventory/inbound');
    
    await page.click('button:has-text("新建入库")');
    
    await expect(page.locator('.modal')).toBeVisible();
    
    await page.selectOption('[data-testid="category-select"]', 'immunology');
    await page.fill('[data-testid="specification-input"]', '6ml/瓶');
    await page.fill('[data-testid="quantity-input"]', '10');
    await page.selectOption('[data-testid="unit-select"]', 'bottle');
    await page.fill('[data-testid="unit-price-input"]', '580');
    await page.fill('[data-testid="expiry-date-input"]', '2026-12-31');
    await page.fill('[data-testid="storage-location-input"]', 'A区-1号柜-3层');
    
    await page.click('button:has-text("提交")');
    
    await expect(page.locator('.toast.success')).toBeVisible();
    await expect(page.locator('.toast')).toContainText('入库成功');
    
    await expect(page.locator('.modal')).not.toBeVisible();
    
    await expect(page.locator('table')).toContainText('6ml/瓶');
  });

  test('应该验证必填字段', async ({ page }) => {
    await page.goto('/inventory/inbound');
    
    await page.click('button:has-text("新建入库")');
    
    await page.click('button:has-text("提交")');
    
    await expect(page.locator('.form-error')).toContainText('请选择分类');
    await expect(page.locator('.form-error')).toContainText('请输入数量');
  });

  test('应该能够搜索入库记录', async ({ page }) => {
    await page.goto('/inventory/inbound');
    
    await page.fill('[data-testid="search-input"]', '免疫');
    await page.press('[data-testid="search-input"]', 'Enter');
    
    await page.waitForTimeout(500);
    
    const rows = await page.locator('table tbody tr').count();
    expect(rows).toBeGreaterThan(0);
  });

  test('应该能够筛选效期状态', async ({ page }) => {
    await page.goto('/inventory/inbound');
    
    await page.selectOption('[data-testid="expiry-status-select"]', 'normal');
    
    await page.waitForTimeout(500);
    
    const statusTags = await page.locator('table tbody tr .tag').allTextContents();
    statusTags.forEach(tag => {
      expect(tag).toContain('正常');
    });
  });

  test('应该能够删除入库记录', async ({ page }) => {
    await page.goto('/inventory/inbound');
    
    const firstRow = page.locator('table tbody tr').first();
    const batchNo = await firstRow.locator('td').first().textContent();
    
    await firstRow.locator('button:has-text("删除")').click();
    
    await expect(page.locator('.modal:has-text("确认删除")')).toBeVisible();
    
    await page.click('button:has-text("确认")');
    
    await expect(page.locator('.toast.success')).toBeVisible();
    
    await expect(page.locator(`table:has-text("${batchNo}")`)).not.toBeVisible();
  });

  test('应该显示效期状态标识', async ({ page }) => {
    await page.goto('/inventory/inbound');
    
    const statusTags = page.locator('table tbody tr .tag');
    const count = await statusTags.count();
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const tag = statusTags.nth(i);
      const text = await tag.textContent();
      
      expect(['正常', '临期', '即将过期', '已过期']).toContain(text);
    }
  });

  test('应该能够分页浏览', async ({ page }) => {
    await page.goto('/inventory/inbound');
    
    const pagination = page.locator('.pagination');
    await expect(pagination).toBeVisible();
    
    const nextButton = pagination.locator('button:has-text(">")');
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      
      await page.waitForTimeout(500);
      
      await expect(page.locator('.pagination')).toContainText('第 2 页');
    }
  });
});
