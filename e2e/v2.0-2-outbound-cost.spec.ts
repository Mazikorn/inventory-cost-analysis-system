import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8080/pages';

// Test data constants
const TEST_PROJECT_NAME = '验收测试项目';
const TEST_BOM_NAME = '验收测试BOM';
const TEST_MATERIAL_NAME = '验收测试试剂盒';
const TEST_USER_ZHANG = '张三';
const TEST_USER_LI = '李四';

/**
 * V2.0-2 出库消耗与成本归集 E2E 测试
 *
 * 前置条件：已完成 V2.0-1 验收，库存为 30 盒
 */
test.describe('V2.0-2 出库消耗与成本归集', () => {

  /**
   * TC-OUT-001 / 步骤1.1: 创建检测项目
   */
  test('创建检测项目：验收测试项目（分子诊断）', async ({ page }) => {
    await test.step('进入项目管理页面', async () => {
      await page.goto(`${BASE_URL}/projects.html`);
      await page.waitForLoadState('networkidle');
      // Verify page loaded by checking page title element
      await expect(page.locator('.page-header h1')).toContainText('检测项目管理');
    });

    await test.step('点击新建服务按钮', async () => {
      await page.click('button:has-text("新建服务")');
      await expect(page.locator('#create-project-modal')).toHaveClass(/active/);
    });

    await test.step('填写服务基本信息', async () => {
      // Select service type: 分子诊断
      const typeSelect = page.locator('#step1-content select').first();
      await typeSelect.selectOption({ label: '分子诊断' });

      // Enter service name
      const nameInput = page.locator('#step1-content input[placeholder="请输入服务名称"]');
      await nameInput.fill(TEST_PROJECT_NAME);

      // Enter cycle
      const cycleInput = page.locator('#step1-content input[placeholder="请输入检测周期"]');
      await cycleInput.fill('3-5个工作日');
    });

    await test.step('进入BOM配置步骤并完成创建', async () => {
      await page.click('#next-step-btn');
      // Step 2 - BOM configuration (skip BOM for now, we'll create it separately)
      await page.evaluate(() => {
        // Skip BOM selection
        const skipRadio = document.querySelector('input[type="radio"][value="skip"]') as HTMLInputElement;
        if (skipRadio) skipRadio.checked = true;
        // Trigger toggleBomOption if available
        if ((window as any).toggleBomOption) {
          (window as any).toggleBomOption('skip');
        }
      });

      await page.click('#next-step-btn');

      // Step 3 - completion
      await expect(page.locator('#step3-content')).toBeVisible();
      await expect(page.locator('#step3-content')).toContainText('创建成功');
    });

    await test.step('验证项目已创建', async () => {
      await page.goto(`${BASE_URL}/projects.html`);
      await page.waitForLoadState('networkidle');
      await expect(page.locator('table.data-table')).toContainText(TEST_PROJECT_NAME);
    });
  });

  /**
   * TC-OUT-002 / 步骤1.2: 创建BOM并关联检测项目
   */
  test('创建BOM：验收测试BOM并关联验收测试项目', async ({ page }) => {
    await test.step('进入BOM管理页面', async () => {
      await page.goto(`${BASE_URL}/bom.html`);
      await page.waitForLoadState('networkidle');
      await expect(page.locator('.page-header h1')).toContainText('BOM管理');
    });

    await test.step('点击新建BOM按钮', async () => {
      await page.click('button:has-text("新建BOM")');
      await expect(page.locator('#create-bom-modal')).toHaveClass(/active/);
    });

    await test.step('填写BOM信息', async () => {
      // BOM name
      const nameInput = page.locator('#create-bom-modal input[placeholder="请输入BOM名称"]');
      await nameInput.fill(TEST_BOM_NAME);

      // Associated project
      const projectSelect = page.locator('#create-bom-modal select').nth(0);
      await projectSelect.selectOption({ label: TEST_PROJECT_NAME });

      // Type
      const typeSelect = page.locator('#create-bom-modal select').nth(1);
      await typeSelect.selectOption({ label: '试剂盒' });

      // Description
      const descInput = page.locator('#create-bom-modal textarea');
      await descInput.fill('验收测试用BOM清单');
    });

    await test.step('保存BOM', async () => {
      // Click save button in modal footer
      await page.click('#create-bom-modal .modal-footer button:has-text("保存")');
      // Wait for success toast
      await page.waitForSelector('.toast-success', { timeout: 5000 });
    });

    await test.step('验证BOM已创建', async () => {
      await page.goto(`${BASE_URL}/bom.html`);
      await page.waitForLoadState('networkidle');
      await expect(page.locator('table.data-table')).toContainText(TEST_BOM_NAME);
    });
  });

  /**
   * TC-OUT-003 / 步骤1.3: 添加物料到BOM
   */
  test('BOM添加物料：验收测试试剂盒，单例用量2盒', async ({ page }) => {
    await test.step('进入BOM编辑页面', async () => {
      await page.goto(`${BASE_URL}/bom.html`);
      await page.waitForLoadState('networkidle');

      // Find and click edit button for our test BOM
      const bomRow = page.locator('table.data-table tbody tr', {
        hasText: TEST_BOM_NAME
      });
      await expect(bomRow).toBeVisible();
      await bomRow.locator('button:has-text("编辑")').click();
      await expect(page.locator('#edit-bom-modal')).toHaveClass(/active/);
    });

    await test.step('添加物料到BOM', async () => {
      // Click add material button
      await page.click('#edit-bom-modal button:has-text("添加物料")');
      await expect(page.locator('#add-material-modal')).toHaveClass(/active/);

      // Search and select material
      const searchInput = page.locator('#add-material-modal .material-search input');
      await searchInput.fill(TEST_MATERIAL_NAME);

      // Select the material from results
      const materialOption = page.locator('#add-material-modal .material-option', {
        hasText: TEST_MATERIAL_NAME
      });
      await expect(materialOption).toBeVisible();
      await materialOption.click();
    });

    await test.step('设置单例用量为2盒', async () => {
      // Set unit usage to 2 boxes per sample
      const usageInput = page.locator('#add-material-modal input[placeholder="请输入用量"]');
      await usageInput.fill('2');

      // Select unit
      const unitSelect = page.locator('#add-material-modal select').last();
      await unitSelect.selectOption({ label: '盒' });
    });

    await test.step('保存物料配置', async () => {
      await page.click('#add-material-modal button:has-text("确认")');
      await page.waitForSelector('.toast-success', { timeout: 5000 });
    });

    await test.step('验证物料已添加', async () => {
      await expect(page.locator('#edit-bom-modal table.data-table')).toContainText(TEST_MATERIAL_NAME);
      await expect(page.locator('#edit-bom-modal table.data-table')).toContainText('2');
      await expect(page.locator('#edit-bom-modal table.data-table')).toContainText('盒/样本');
    });
  });

  /**
   * TC-OUT-004 ~ TC-OUT-008: 第一次出库（5盒，张医生）
   */
  test('第一次出库：5盒，领用人张医生，库存从30变为25', async ({ page }) => {
    await test.step('进入出库管理页面', async () => {
      await page.goto(`${BASE_URL}/outbound.html`);
      await page.waitForLoadState('networkidle');
      await expect(page.locator('.page-header h1')).toContainText('出库管理');
    });

    await test.step('打开出库登记弹窗', async () => {
      await page.click('button:has-text("出库登记")');
      await expect(page.locator('#multi-outbound-modal')).toHaveClass(/active/);
    });

    await test.step('添加物料到出库清单', async () => {
      // Click add material button in outbound modal
      await page.locator('#multi-outbound-modal button:has-text("添加物料")').click();
      await expect(page.locator('#add-material-modal')).toHaveClass(/active/);

      // Switch to BOM tab if needed, or select from list
      // Use "按检测项目添加" tab for project-specific material
      const bomTab = page.locator('.material-tab', { hasText: '按检测项目添加' });
      await bomTab.click();

      // Select project
      await page.click('#project-search-input');
      const projectOption = page.locator('#project-dropdown-list .dropdown-item', {
        hasText: TEST_PROJECT_NAME
      });
      // If project not in dropdown, it may need to be searched
      if (await projectOption.isVisible().catch(() => false)) {
        await projectOption.click();
      } else {
        // Type project name to search
        await page.fill('#project-search-input', TEST_PROJECT_NAME);
        await page.keyboard.press('Enter');
      }

      // Check material checkbox and add to selected
      const materialRow = page.locator('#bom-list-tbody .material-row', {
        hasText: TEST_MATERIAL_NAME
      });
      if (await materialRow.isVisible().catch(() => false)) {
        await materialRow.locator('.material-bom-cb').check();
        await page.click('#tab-bom-content button:has-text("添加到已选")');
      }

      // Confirm add materials
      await page.click('#add-material-modal button:has-text("确认添加")');
    });

    await test.step('填写出库数量5盒，领用人张医生', async () => {
      // Wait for material to appear in outbound list
      await expect(page.locator('#outbound-materials-list')).toContainText(TEST_MATERIAL_NAME);

      // Set quantity to 5
      const qtyInput = page.locator('#outbound-materials-list .outbound-quantity').first();
      await qtyInput.fill('5');

      // Set user to 张三 (张医生)
      const userSelect = page.locator('#outbound-materials-list .outbound-user').first();
      await userSelect.selectOption({ label: TEST_USER_ZHANG });

      // Set project association
      const projectSelect = page.locator('#outbound-materials-list .outbound-project').first();
      if (await projectSelect.isVisible().catch(() => false)) {
        await projectSelect.selectOption({ label: TEST_PROJECT_NAME });
      }
    });

    await test.step('确认出库', async () => {
      await page.click('#multi-outbound-modal button:has-text("确认出库")');
      await page.waitForSelector('.toast-success', { timeout: 5000 });
    });

    await test.step('验证库存扣减为25', async () => {
      await page.goto(`${BASE_URL}/inventory-list.html`);
      await page.waitForLoadState('networkidle');

      // Search for the material
      const searchInput = page.locator('.search-box input');
      await searchInput.fill(TEST_MATERIAL_NAME);
      await page.keyboard.press('Enter');

      // Verify stock shows 25
      await expect(page.locator('table.data-table')).toContainText('25');
    });
  });

  /**
   * TC-OUT-009 ~ TC-OUT-010: 第二次出库（10盒，李医生）
   */
  test('第二次出库：10盒，领用人李医生，库存从25变为15', async ({ page }) => {
    await test.step('进入出库管理页面', async () => {
      await page.goto(`${BASE_URL}/outbound.html`);
      await page.waitForLoadState('networkidle');
    });

    await test.step('打开出库登记弹窗', async () => {
      await page.click('button:has-text("出库登记")');
      await expect(page.locator('#multi-outbound-modal')).toHaveClass(/active/);
    });

    await test.step('添加物料到出库清单', async () => {
      await page.locator('#multi-outbound-modal button:has-text("添加物料")').click();
      await expect(page.locator('#add-material-modal')).toHaveClass(/active/);

      // Try to select from list tab
      const listTab = page.locator('.material-tab', { hasText: '物料列表' });
      await listTab.click();

      // Search for material
      await page.fill('#material-search-input', TEST_MATERIAL_NAME);

      // Check material checkbox
      const materialRow = page.locator('#material-list-tbody .material-row', {
        hasText: TEST_MATERIAL_NAME
      });
      if (await materialRow.isVisible().catch(() => false)) {
        await materialRow.locator('.material-list-cb').check();
        await page.click('#tab-list-content button:has-text("添加到已选")');
      }

      // Confirm add
      await page.click('#add-material-modal button:has-text("确认添加")');
    });

    await test.step('填写出库数量10盒，领用人李医生', async () => {
      await expect(page.locator('#outbound-materials-list')).toContainText(TEST_MATERIAL_NAME);

      // Set quantity to 10
      const qtyInput = page.locator('#outbound-materials-list .outbound-quantity').first();
      await qtyInput.fill('10');

      // Set user to 李四 (李医生)
      const userSelect = page.locator('#outbound-materials-list .outbound-user').first();
      await userSelect.selectOption({ label: TEST_USER_LI });
    });

    await test.step('确认出库', async () => {
      await page.click('#multi-outbound-modal button:has-text("确认出库")');
      await page.waitForSelector('.toast-success', { timeout: 5000 });
    });

    await test.step('验证库存扣减为15', async () => {
      await page.goto(`${BASE_URL}/inventory-list.html`);
      await page.waitForLoadState('networkidle');

      const searchInput = page.locator('.search-box input');
      await searchInput.fill(TEST_MATERIAL_NAME);
      await page.keyboard.press('Enter');

      // Verify stock shows 15
      await expect(page.locator('table.data-table')).toContainText('15');
    });
  });

  /**
   * TC-OUT-011: 累计出库验证
   */
  test('累计出库验证：出库记录显示两次出库共15盒', async ({ page }) => {
    await test.step('进入出库记录页面', async () => {
      await page.goto(`${BASE_URL}/outbound.html`);
      await page.waitForLoadState('networkidle');
    });

    await test.step('验证出库记录存在', async () => {
      // Check that outbound records exist with our test material
      await expect(page.locator('table.data-table')).toContainText(TEST_MATERIAL_NAME);
    });

    await test.step('验证库存最终为15', async () => {
      await page.goto(`${BASE_URL}/inventory-list.html`);
      await page.waitForLoadState('networkidle');

      const searchInput = page.locator('.search-box input');
      await searchInput.fill(TEST_MATERIAL_NAME);
      await page.keyboard.press('Enter');

      await expect(page.locator('table.data-table')).toContainText('15');
    });
  });

});
