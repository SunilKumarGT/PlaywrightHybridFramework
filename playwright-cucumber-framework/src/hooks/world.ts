import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page } from 'playwright';
import { ApiResponse, AiAnalysisResult } from '../types';

export class CustomWorld extends World {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
  scenarioName: string = '';
  scenarioTags: string[] = [];
  testData: Record<string, unknown> = {};
  apiResponse: ApiResponse | null = null;
  aiAnalysisResult: AiAnalysisResult | null = null;
  screenshotPath?: string;
  startTime: number = 0;

  constructor(options: IWorldOptions) {
    super(options);
  }

  /**
   * Store a value in test data store
   */
  setData(key: string, value: unknown): void {
    this.testData[key] = value;
  }

  /**
   * Retrieve a value from test data store
   */
  getData<T>(key: string): T | undefined {
    return this.testData[key] as T;
  }

  /**
   * Log a message to the Cucumber output
   */
  log(message: string): void {
    this.attach(`[${new Date().toISOString()}] ${message}`, 'text/plain');
  }

  /**
   * Attach a screenshot to the Cucumber report
   */
  async attachScreenshot(label?: string): Promise<void> {
    if (this.page) {
      const screenshot = await this.page.screenshot({ fullPage: true });
      await this.attach(screenshot, 'image/png');
      if (label) this.log(`Screenshot: ${label}`);
    }
  }
}

setWorldConstructor(CustomWorld);
