import { Page } from '@playwright/test';

/**
 * 真实前端 (frontend-v2) 认证辅助函数
 * 通过直接设置 localStorage token 绕过登录页
 */

export const AUTH_TOKEN = 'mock-jwt-token-e2e-test';

export async function loginAsAdmin(page: Page) {
  // 先访问登录页设置 token，然后跳转到首页
  await page.goto('/login');
  await page.evaluate((token) => {
    localStorage.setItem('token', token);
  }, AUTH_TOKEN);
  await page.goto('/');
  await page.waitForLoadState('networkidle');
}

export async function setAuthToken(page: Page) {
  await page.evaluate((token) => {
    localStorage.setItem('token', token);
  }, AUTH_TOKEN);
}
