import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../hooks/world';
import { NetworkInterceptor, MockResponses } from '../utils/network.interceptor';
import { VisualComparator } from '../utils/visual.comparator';
import { PerformanceMonitor, PerformanceBudgets } from '../performance/perf.monitor';
import { TestDataFactory } from '../fixtures/test-data.factory';
import { Logger } from '../utils/logger';

const logger = Logger.getInstance();

// ─── Test Data Steps ──────────────────────────────────────────────────────────

Given('I have test data {string} stored as {string}', function (this: CustomWorld, type: string, alias: string) {
  let data: unknown;
  switch (type) {
    case 'user':            data = TestDataFactory.user();            break;
    case 'admin_user':      data = TestDataFactory.adminUser();       break;
    case 'product':         data = TestDataFactory.product();         break;
    case 'shipping_address':data = TestDataFactory.shippingAddress(); break;
    case 'payment_details': data = TestDataFactory.paymentDetails();  break;
    default: throw new Error(`Unknown test data type: ${type}`);
  }
  this.setData(alias, data);
  logger.info(`Test data "${type}" stored as "${alias}"`);
});

Given('I store {string} as {string}', function (this: CustomWorld, value: string, alias: string) {
  this.setData(alias, value);
});

Then('the stored value {string} should equal {string}', function (this: CustomWorld, alias: string, expected: string) {
  const actual = this.getData<string>(alias);
  expect(String(actual)).toBe(expected);
});

// ─── Network Mock Steps ───────────────────────────────────────────────────────

Given('the API endpoint {string} returns status {int}', async function (this: CustomWorld, url: string, status: number) {
  const interceptor = new NetworkInterceptor(this.page);
  await interceptor.mockRoute(url, { status, body: { message: `Mocked ${status}` } });
  this.setData('networkInterceptor', interceptor);
});

Given('the API endpoint {string} returns:', async function (this: CustomWorld, url: string, docString: string) {
  const interceptor = new NetworkInterceptor(this.page);
  const body = JSON.parse(docString);
  await interceptor.mockRoute(url, { status: 200, body });
  this.setData('networkInterceptor', interceptor);
});

Given('the API endpoint {string} is unavailable', async function (this: CustomWorld, url: string) {
  const interceptor = new NetworkInterceptor(this.page);
  await interceptor.mockRoute(url, MockResponses.serverError());
  this.setData('networkInterceptor', interceptor);
});

Given('the API endpoint {string} is slow by {int} milliseconds', async function (this: CustomWorld, url: string, delay: number) {
  const interceptor = new NetworkInterceptor(this.page);
  await interceptor.throttleRoute(url, delay);
  this.setData('networkInterceptor', interceptor);
});

Given('the API endpoint {string} returns unauthorized', async function (this: CustomWorld, url: string) {
  const interceptor = new NetworkInterceptor(this.page);
  await interceptor.mockRoute(url, MockResponses.unauthorised());
  this.setData('networkInterceptor', interceptor);
});

When('I wait for the request to {string}', async function (this: CustomWorld, urlPart: string) {
  const interceptor = this.getData<NetworkInterceptor>('networkInterceptor') || new NetworkInterceptor(this.page);
  const req = await interceptor.waitForRequest(urlPart);
  this.setData('lastCapturedRequest', req);
});

When('I wait for the response from {string}', async function (this: CustomWorld, urlPart: string) {
  const interceptor = new NetworkInterceptor(this.page);
  const res = await interceptor.waitForResponse(urlPart);
  this.setData('lastCapturedResponse', res);
});

Then('a request should have been made to {string}', async function (this: CustomWorld, urlPart: string) {
  const req = this.getData<{ url: string }>('lastCapturedRequest');
  expect(req?.url).toContain(urlPart);
});

// ─── Visual Regression Steps ──────────────────────────────────────────────────

When('I capture a visual baseline of {string}', async function (this: CustomWorld, name: string) {
  const comparator = new VisualComparator();
  await comparator.compareScreenshot(this.page, name, { fullPage: true });
  logger.info(`Visual baseline captured: ${name}`);
});

Then('the page should visually match the baseline {string}', async function (this: CustomWorld, name: string) {
  const comparator = new VisualComparator();
  const result = await comparator.compareScreenshot(this.page, name, { fullPage: true });
  if (!result.matches) {
    await this.attachScreenshot(`Visual mismatch: ${name}`);
    throw new Error(`Visual regression detected for "${name}": ${result.diffPercent.toFixed(2)}% difference\n${result.message}`);
  }
  logger.info(`✅ Visual match confirmed: ${name}`);
});

// ─── Performance Steps ────────────────────────────────────────────────────────

When('I measure the performance of the current page', async function (this: CustomWorld) {
  const monitor = new PerformanceMonitor(this.page);
  const metrics = await monitor.collectMetrics();
  this.setData('perfMetrics', metrics);
  await this.attach(JSON.stringify(metrics, null, 2), 'application/json');
});

Then('the page should meet the {string} performance budget', function (this: CustomWorld, budgetType: string) {
  const metrics = this.getData<ReturnType<PerformanceMonitor['getMetricsHistory']>[0]>('perfMetrics');
  if (!metrics) throw new Error('No performance metrics collected. Run the measurement step first.');

  const monitor = new PerformanceMonitor(this.page);
  const budgets: Record<string, () => object> = {
    fast:   PerformanceBudgets.fastPage,
    normal: PerformanceBudgets.normalPage,
    heavy:  PerformanceBudgets.heavyPage,
  };

  const budget = budgets[budgetType];
  if (!budget) throw new Error(`Unknown budget type: ${budgetType}. Use: fast|normal|heavy`);
  monitor.assertBudget(metrics as any, budget());
});

Then('the First Contentful Paint should be under {int} milliseconds', function (this: CustomWorld, ms: number) {
  const metrics = this.getData<{ firstContentfulPaint: number }>('perfMetrics');
  if (!metrics) throw new Error('No performance metrics found');
  expect(metrics.firstContentfulPaint).toBeLessThanOrEqual(ms);
});

Then('the page load time should be under {int} milliseconds', function (this: CustomWorld, ms: number) {
  const metrics = this.getData<{ loadComplete: number }>('perfMetrics');
  if (!metrics) throw new Error('No performance metrics found');
  expect(metrics.loadComplete).toBeLessThanOrEqual(ms);
});

// ─── Accessibility Steps ──────────────────────────────────────────────────────

Then('the page should have no accessibility violations', async function (this: CustomWorld) {
  // Inject axe-core via CDN and run
  await this.page.addScriptTag({ url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.8.2/axe.min.js' });
  const violations = await this.page.evaluate(async () => {
    const results = await (window as any).axe.run();
    return results.violations;
  });

  if (violations.length > 0) {
    const summary = violations.map((v: any) =>
      `[${v.impact}] ${v.description} (${v.nodes.length} element(s))`
    ).join('\n');
    await this.attach(`Accessibility violations:\n${summary}`, 'text/plain');
    throw new Error(`${violations.length} accessibility violation(s) found:\n${summary}`);
  }
  logger.info('✅ No accessibility violations');
});

Then('the page should have no critical accessibility violations', async function (this: CustomWorld) {
  await this.page.addScriptTag({ url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.8.2/axe.min.js' });
  const violations = await this.page.evaluate(async () => {
    const results = await (window as any).axe.run();
    return results.violations.filter((v: any) => v.impact === 'critical');
  });

  if (violations.length > 0) {
    throw new Error(`${violations.length} CRITICAL accessibility violation(s):\n${violations.map((v: any) => v.description).join('\n')}`);
  }
});

// ─── Cookie & Storage Steps ───────────────────────────────────────────────────

When('I clear all cookies', async function (this: CustomWorld) {
  await this.context.clearCookies();
  logger.info('Cookies cleared');
});

When('I clear local storage', async function (this: CustomWorld) {
  await this.page.evaluate(() => localStorage.clear());
  logger.info('LocalStorage cleared');
});

When('I set cookie {string} to {string}', async function (this: CustomWorld, name: string, value: string) {
  await this.context.addCookies([{ name, value, url: this.page.url() }]);
});

Then('the cookie {string} should exist', async function (this: CustomWorld, name: string) {
  const cookies = await this.context.cookies();
  const found = cookies.some((c) => c.name === name);
  expect(found, `Cookie "${name}" not found`).toBe(true);
});

// ─── Browser Steps ────────────────────────────────────────────────────────────

When('I open a new tab and navigate to {string}', async function (this: CustomWorld, url: string) {
  const newPage = await this.context.newPage();
  await newPage.goto(url);
  this.setData('extraTab', newPage);
});

When('I switch to the new tab', async function (this: CustomWorld) {
  const pages = this.context.pages();
  if (pages.length > 1) {
    this.page = pages[pages.length - 1];
  }
});

When('I resize the viewport to {int}x{int}', async function (this: CustomWorld, width: number, height: number) {
  await this.page.setViewportSize({ width, height });
  logger.info(`Viewport set to ${width}x${height}`);
});

When('I set viewport to mobile', async function (this: CustomWorld) {
  await this.page.setViewportSize({ width: 375, height: 812 });
});

When('I set viewport to tablet', async function (this: CustomWorld) {
  await this.page.setViewportSize({ width: 768, height: 1024 });
});

When('I set viewport to desktop', async function (this: CustomWorld) {
  await this.page.setViewportSize({ width: 1280, height: 720 });
});

// ─── Conditional Steps ────────────────────────────────────────────────────────

Then('if {string} is visible I click it', async function (this: CustomWorld, selector: string) {
  const visible = await this.page.isVisible(selector).catch(() => false);
  if (visible) {
    await this.page.click(selector);
    logger.info(`Conditionally clicked: ${selector}`);
  } else {
    logger.info(`Selector not visible, skipping: ${selector}`);
  }
});
