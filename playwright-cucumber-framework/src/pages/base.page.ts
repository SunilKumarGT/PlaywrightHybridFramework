import { Page, Locator, expect } from '@playwright/test';
import { Logger } from '../utils/logger';

const logger = Logger.getInstance();

/**
 * Base Page Object — all page objects extend this class.
 * Provides common interactions and smart waits.
 */
export abstract class BasePage {
  protected readonly page: Page;
  protected readonly baseUrl: string;

  constructor(page: Page, baseUrl: string = '') {
    this.page = page;
    this.baseUrl = baseUrl;
  }

  // ─── Navigation ──────────────────────────────────────────────────────────────

  async navigate(path = ''): Promise<void> {
    const url = `${this.baseUrl}${path}`;
    logger.info(`Navigating to: ${url}`);
    await this.page.goto(url, { waitUntil: 'networkidle' });
  }

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }

  async goBack(): Promise<void> {
    await this.page.goBack({ waitUntil: 'networkidle' });
  }

  async reload(): Promise<void> {
    await this.page.reload({ waitUntil: 'networkidle' });
  }

  // ─── Element Interactions ─────────────────────────────────────────────────────

  async click(selector: string, options: { force?: boolean; timeout?: number } = {}): Promise<void> {
    logger.debug(`Clicking: ${selector}`);
    await this.page.click(selector, options);
  }

  async doubleClick(selector: string): Promise<void> {
    logger.debug(`Double-clicking: ${selector}`);
    await this.page.dblclick(selector);
  }

  async fill(selector: string, value: string): Promise<void> {
    logger.debug(`Filling "${selector}" with: ${value}`);
    await this.page.fill(selector, value);
  }

  async type(selector: string, value: string, delay = 50): Promise<void> {
    await this.page.type(selector, value, { delay });
  }

  async clear(selector: string): Promise<void> {
    await this.page.fill(selector, '');
  }

  async selectOption(selector: string, value: string | string[]): Promise<void> {
    logger.debug(`Selecting option in "${selector}": ${value}`);
    await this.page.selectOption(selector, value);
  }

  async check(selector: string): Promise<void> {
    await this.page.check(selector);
  }

  async uncheck(selector: string): Promise<void> {
    await this.page.uncheck(selector);
  }

  async uploadFile(selector: string, filePath: string): Promise<void> {
    await this.page.setInputFiles(selector, filePath);
  }

  async hover(selector: string): Promise<void> {
    await this.page.hover(selector);
  }

  async pressKey(key: string): Promise<void> {
    await this.page.keyboard.press(key);
  }

  async scrollTo(selector: string): Promise<void> {
    await this.page.locator(selector).scrollIntoViewIfNeeded();
  }

  // ─── Element Reads ────────────────────────────────────────────────────────────

  async getText(selector: string): Promise<string> {
    const text = await this.page.textContent(selector);
    return text?.trim() || '';
  }

  async getValue(selector: string): Promise<string> {
    return this.page.inputValue(selector);
  }

  async getAttribute(selector: string, attr: string): Promise<string | null> {
    return this.page.getAttribute(selector, attr);
  }

  async isVisible(selector: string): Promise<boolean> {
    return this.page.isVisible(selector);
  }

  async isEnabled(selector: string): Promise<boolean> {
    return this.page.isEnabled(selector);
  }

  async isChecked(selector: string): Promise<boolean> {
    return this.page.isChecked(selector);
  }

  async getCount(selector: string): Promise<number> {
    return this.page.locator(selector).count();
  }

  async getAllTexts(selector: string): Promise<string[]> {
    return this.page.locator(selector).allTextContents();
  }

  // ─── Waits ────────────────────────────────────────────────────────────────────

  async waitForSelector(selector: string, timeout?: number): Promise<void> {
    await this.page.waitForSelector(selector, { timeout });
  }

  async waitForVisible(selector: string, timeout?: number): Promise<void> {
    await this.page.waitForSelector(selector, { state: 'visible', timeout });
  }

  async waitForHidden(selector: string, timeout?: number): Promise<void> {
    await this.page.waitForSelector(selector, { state: 'hidden', timeout });
  }

  async waitForNavigation(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  async waitForUrl(urlPattern: string | RegExp, timeout?: number): Promise<void> {
    await this.page.waitForURL(urlPattern, { timeout });
  }

  async waitForText(text: string, selector = 'body'): Promise<void> {
    await this.page.waitForFunction(
      ({ sel, txt }) => document.querySelector(sel)?.textContent?.includes(txt),
      { sel: selector, txt: text }
    );
  }

  // ─── Assertions ───────────────────────────────────────────────────────────────

  async assertVisible(selector: string, message?: string): Promise<void> {
    await expect(this.page.locator(selector), message).toBeVisible();
  }

  async assertHidden(selector: string, message?: string): Promise<void> {
    await expect(this.page.locator(selector), message).toBeHidden();
  }

  async assertText(selector: string, expected: string): Promise<void> {
    await expect(this.page.locator(selector)).toHaveText(expected);
  }

  async assertContainsText(selector: string, expected: string): Promise<void> {
    await expect(this.page.locator(selector)).toContainText(expected);
  }

  async assertUrl(expected: string | RegExp): Promise<void> {
    await expect(this.page).toHaveURL(expected);
  }

  async assertTitle(expected: string | RegExp): Promise<void> {
    await expect(this.page).toHaveTitle(expected);
  }

  async assertValue(selector: string, expected: string): Promise<void> {
    await expect(this.page.locator(selector)).toHaveValue(expected);
  }

  // ─── Screenshots ──────────────────────────────────────────────────────────────

  async screenshot(name: string): Promise<Buffer> {
    return this.page.screenshot({ path: `reports/screenshots/${name}.png`, fullPage: true });
  }

  // ─── iFrame ───────────────────────────────────────────────────────────────────

  getFrame(nameOrUrl: string): ReturnType<Page['frame']> {
    return this.page.frame({ name: nameOrUrl }) ?? this.page.frame({ url: nameOrUrl });
  }
}
