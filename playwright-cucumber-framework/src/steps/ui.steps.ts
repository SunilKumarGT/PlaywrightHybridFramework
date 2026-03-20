import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../hooks/world';
import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';
import { Logger } from '../utils/logger';
import config from '../../config/environments';

const logger = Logger.getInstance();

// ─── Navigation Steps ─────────────────────────────────────────────────────────

Given('I navigate to {string}', async function (this: CustomWorld, path: string) {
  await this.page.goto(`${config.baseUrl}${path}`);
  await this.page.waitForLoadState('networkidle');
  logger.info(`Navigated to: ${config.baseUrl}${path}`);
});

Given('I am on the login page', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page, config.baseUrl);
  await loginPage.navigateToLogin();
});

Given('I am logged in as {string}', async function (this: CustomWorld, role: string) {
  const credentials = this.getData<{ username: string; password: string }>(role) || {
    username: config.credentials.username,
    password: config.credentials.password,
  };
  const loginPage = new LoginPage(this.page, config.baseUrl);
  await loginPage.navigateToLogin();
  await loginPage.login(credentials);
  await this.page.waitForURL(/dashboard|home|main/, { timeout: 15000 });
});

// ─── Login Steps ──────────────────────────────────────────────────────────────

When('I enter username {string}', async function (this: CustomWorld, username: string) {
  const loginPage = new LoginPage(this.page, config.baseUrl);
  await loginPage.fill('[data-testid="username-input"], input[type="email"], #username', username);
});

When('I enter password {string}', async function (this: CustomWorld, password: string) {
  const loginPage = new LoginPage(this.page, config.baseUrl);
  await loginPage.fill('[data-testid="password-input"], input[type="password"], #password', password);
});

When('I click the login button', async function (this: CustomWorld) {
  await this.page.click('button[type="submit"], .login-btn, [data-testid="login-btn"]');
  await this.page.waitForLoadState('networkidle').catch(() => {});
});

When('I login with credentials:', async function (this: CustomWorld, table: DataTable) {
  const data = table.rowsHash();
  const loginPage = new LoginPage(this.page, config.baseUrl);
  await loginPage.login({ username: data['username'], password: data['password'] });
});

Then('I should be redirected to the dashboard', async function (this: CustomWorld) {
  await this.page.waitForURL(/dashboard|home|main/, { timeout: 15000 });
  logger.info(`Redirected to: ${this.page.url()}`);
});

Then('I should see an error message {string}', async function (this: CustomWorld, errorText: string) {
  const loginPage = new LoginPage(this.page, config.baseUrl);
  const errorMsg = await loginPage.getErrorMessage();
  expect(errorMsg.toLowerCase()).toContain(errorText.toLowerCase());
});

Then('I should remain on the login page', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page, config.baseUrl);
  const isOnLogin = await loginPage.isOnLoginPage();
  expect(isOnLogin).toBe(true);
});

// ─── Interaction Steps ────────────────────────────────────────────────────────

When('I click on {string}', async function (this: CustomWorld, selector: string) {
  // Try as text first, then as CSS selector
  try {
    await this.page.click(`text=${selector}`, { timeout: 5000 });
  } catch {
    await this.page.click(selector);
  }
});

When('I fill {string} with {string}', async function (this: CustomWorld, selector: string, value: string) {
  await this.page.fill(selector, value);
});

When('I type {string} in {string}', async function (this: CustomWorld, text: string, selector: string) {
  await this.page.type(selector, text, { delay: 50 });
});

When('I select {string} from {string}', async function (this: CustomWorld, value: string, selector: string) {
  await this.page.selectOption(selector, value);
});

When('I check the checkbox {string}', async function (this: CustomWorld, selector: string) {
  await this.page.check(selector);
});

When('I press {string} key', async function (this: CustomWorld, key: string) {
  await this.page.keyboard.press(key);
});

When('I scroll to {string}', async function (this: CustomWorld, selector: string) {
  await this.page.locator(selector).scrollIntoViewIfNeeded();
});

When('I hover over {string}', async function (this: CustomWorld, selector: string) {
  await this.page.hover(selector);
});

When('I wait {int} seconds', async function (this: CustomWorld, seconds: number) {
  await this.page.waitForTimeout(seconds * 1000);
});

When('I fill in the form:', async function (this: CustomWorld, table: DataTable) {
  const fields = table.rowsHash();
  for (const [selector, value] of Object.entries(fields)) {
    await this.page.fill(selector, value);
  }
});

// ─── Assertion Steps ──────────────────────────────────────────────────────────

Then('I should see {string}', async function (this: CustomWorld, text: string) {
  await expect(this.page.locator(`text=${text}`).first()).toBeVisible({ timeout: 10000 });
});

Then('I should not see {string}', async function (this: CustomWorld, text: string) {
  await expect(this.page.locator(`text=${text}`).first()).toBeHidden({ timeout: 5000 });
});

Then('the element {string} should be visible', async function (this: CustomWorld, selector: string) {
  await expect(this.page.locator(selector)).toBeVisible({ timeout: 10000 });
});

Then('the element {string} should not be visible', async function (this: CustomWorld, selector: string) {
  await expect(this.page.locator(selector)).toBeHidden({ timeout: 5000 });
});

Then('the element {string} should be enabled', async function (this: CustomWorld, selector: string) {
  await expect(this.page.locator(selector)).toBeEnabled();
});

Then('the element {string} should be disabled', async function (this: CustomWorld, selector: string) {
  await expect(this.page.locator(selector)).toBeDisabled();
});

Then('the URL should contain {string}', async function (this: CustomWorld, urlPart: string) {
  expect(this.page.url()).toContain(urlPart);
});

Then('the page title should be {string}', async function (this: CustomWorld, title: string) {
  await expect(this.page).toHaveTitle(title);
});

Then('the field {string} should have value {string}', async function (this: CustomWorld, selector: string, value: string) {
  await expect(this.page.locator(selector)).toHaveValue(value);
});

Then('I should see {int} items in {string}', async function (this: CustomWorld, count: number, selector: string) {
  await expect(this.page.locator(selector)).toHaveCount(count);
});

Then('a screenshot is taken as {string}', async function (this: CustomWorld, name: string) {
  const screenshot = await this.page.screenshot({ fullPage: true });
  await this.attach(screenshot, 'image/png');
  this.setData('lastScreenshot', screenshot.toString('base64'));
  logger.info(`Screenshot taken: ${name}`);
});
