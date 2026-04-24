import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './frontend-v2-auth.fixture';

/**
 * 真实前端 E2E 验收测试 - 供应商管理
 */

test.describe('供应商管理 - 真实前端', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('进入供应商管理页面并验证基本结构', async ({ page }) => {
    await test.step('导航到供应商管理页面', async () => {
      await page.goto('/suppliers');
      await page.waitForLoadState('networkidle');
    });

    await test.step('验证页面标题', async () => {
      await expect(page.locator('h1')).toContainText('供应商管理');
    });

    await test.step('验证统计卡片存在', async () => {
      const statCards = page.locator('.stat-card');
      await expect(statCards).toHaveCount(4);
    });

    await test.step('验证数据表格或空状态存在', async () => {
      const hasTable = await page.locator('table').isVisible().catch(() => false);
      const hasEmpty = await page.locator('.empty-state').isVisible().catch(() => false);
      expect(hasTable || hasEmpty).toBe(true);
    });

    await test.step('验证新增按钮存在', async () => {
      await expect(page.locator('button:has-text("新增供应商")')).toBeVisible();
    });
  });

  test('新增供应商完整流程', async ({ page }) => {
    const testSupplierName = `E2E供应商_${Date.now()}`;
    const testContact = 'E2E联系人';
    const testPhone = '13900000001';

    await test.step('导航到供应商管理', async () => {
      await page.goto('/suppliers');
      await page.waitForLoadState('networkidle');
    });

    await test.step('点击新增供应商', async () => {
      await page.click('button:has-text("新增供应商")');
      await expect(page.locator('.modal-overlay')).toBeVisible();
      await expect(page.locator('.modal-title')).toContainText('新增供应商');
    });

    await test.step('填写表单', async () => {
      const modal = page.locator('.modal-overlay');
      await modal.locator('input').nth(0).fill(testSupplierName);
      await modal.locator('input').nth(1).fill(testContact);
      await modal.locator('input').nth(2).fill(testPhone);
    });

    await test.step('提交表单', async () => {
      await page.click('.modal-footer button:has-text("保存")');
      // 等待一段时间让请求完成
      await page.waitForTimeout(2000);
    });

    await test.step('验证创建成功（Modal 关闭）', async () => {
      const modalVisible = await page.locator('.modal-overlay').isVisible().catch(() => false);
      // 如果 Modal 仍开着，可能是表单验证失败，检查错误信息
      if (modalVisible) {
        const errorText = await page.locator('.alert-error').textContent().catch(() => '');
        console.log('Modal still open, error:', errorText);
      }
      expect(modalVisible).toBe(false);
    });
  });

  test('搜索供应商功能', async ({ page }) => {
    await test.step('导航到供应商管理', async () => {
      await page.goto('/suppliers');
      await page.waitForLoadState('networkidle');
    });

    await test.step('在搜索框输入关键词并搜索', async () => {
      const searchInput = page.locator('input[placeholder*="搜索"]').first();
      await searchInput.fill('测试');
      await page.waitForTimeout(800); // 等待防抖
      // 触发搜索按钮
      const searchBtn = page.locator('button:has-text("查询")');
      if (await searchBtn.isVisible().catch(() => false)) {
        await searchBtn.click();
      }
      await page.waitForLoadState('networkidle');
    });

    await test.step('验证搜索结果或空状态', async () => {
      const hasTable = await page.locator('table tbody').isVisible().catch(() => false);
      const hasEmpty = await page.locator('.empty-state').isVisible().catch(() => false);
      expect(hasTable || hasEmpty).toBe(true);
    });
  });

  test('编辑供应商状态', async ({ page }) => {
    await test.step('导航到供应商管理', async () => {
      await page.goto('/suppliers');
      await page.waitForLoadState('networkidle');
    });

    await test.step('检查是否有编辑按钮并点击', async () => {
      const firstEditBtn = page.locator('table tbody tr').first().locator('button:has-text("编辑")');
      const hasEditBtn = await firstEditBtn.isVisible().catch(() => false);
      if (hasEditBtn) {
        await firstEditBtn.click();
        await expect(page.locator('.modal-overlay')).toBeVisible();
        await page.click('.modal-footer button:has-text("取消")');
        await expect(page.locator('.modal-overlay')).not.toBeVisible();
      } else {
        test.skip(true, '列表为空，无法测试编辑功能');
      }
    });
  });
});
