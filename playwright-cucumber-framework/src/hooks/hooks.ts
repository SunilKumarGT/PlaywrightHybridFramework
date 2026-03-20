import {
  Before,
  After,
  BeforeAll,
  AfterAll,
  BeforeStep,
  AfterStep,
  Status,
  ITestCaseHookParameter,
} from '@cucumber/cucumber';
import { chromium, firefox, webkit, Browser, BrowserContext } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';
import { CustomWorld } from './world';
import { Logger } from '../utils/logger';
import config from '../../config/environments';

const logger = Logger.getInstance();
let sharedBrowser: Browser;

// ─── BeforeAll Hook ────────────────────────────────────────────────────────────

BeforeAll(async function () {
  logger.info('🚀 Test Suite Starting...');
  logger.info(`Environment: ${process.env.ENV || 'staging'}`);
  logger.info(`Browser: ${process.env.BROWSER || 'chromium'}`);

  // Ensure reports directory exists
  const dirs = ['reports', 'reports/screenshots', 'reports/videos', 'reports/traces'];
  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });

  // Launch shared browser for non-UI tests
  const browserType = process.env.BROWSER || 'chromium';
  const browserMap: Record<string, typeof chromium> = { chromium, firefox, webkit };
  const launcher = browserMap[browserType] || chromium;

  sharedBrowser = await launcher.launch({
    headless: process.env.HEADLESS !== 'false',
    slowMo: parseInt(process.env.SLOW_MO || '0'),
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  logger.info('✅ Browser launched successfully');
});

// ─── Before Scenario Hook ─────────────────────────────────────────────────────

Before(async function (this: CustomWorld, scenario: ITestCaseHookParameter) {
  this.startTime = Date.now();
  this.scenarioName = scenario.pickle.name;
  this.scenarioTags = scenario.pickle.tags.map((t) => t.name);

  logger.info(`\n📋 Starting: ${this.scenarioName}`);
  logger.info(`Tags: ${this.scenarioTags.join(', ')}`);

  // Create a new browser context per scenario
  this.browser = sharedBrowser;
  this.context = await this.browser.newContext({
    baseURL: config.baseUrl,
    viewport: {
      width: parseInt(process.env.VIEWPORT_WIDTH || '1280'),
      height: parseInt(process.env.VIEWPORT_HEIGHT || '720'),
    },
    recordVideo: process.env.VIDEO_ON_FAIL !== 'false'
      ? { dir: 'reports/videos' }
      : undefined,
    ignoreHTTPSErrors: true,
    locale: 'en-US',
    timezoneId: 'Asia/Kolkata',
  });

  this.page = await this.context.newPage();

  // Set default timeouts
  this.page.setDefaultTimeout(config.timeouts.default);
  this.page.setDefaultNavigationTimeout(config.timeouts.navigation);

  // Intercept console errors
  this.page.on('console', (msg) => {
    if (msg.type() === 'error') {
      logger.warn(`Console error: ${msg.text()}`);
    }
  });

  // Intercept page crashes
  this.page.on('crash', () => {
    logger.error(`Page crashed in scenario: ${this.scenarioName}`);
  });
});

// ─── After Scenario Hook ──────────────────────────────────────────────────────

After(async function (this: CustomWorld, scenario: ITestCaseHookParameter) {
  const duration = Date.now() - this.startTime;
  const status = scenario.result?.status;

  logger.info(`\n${status === Status.PASSED ? '✅' : '❌'} ${this.scenarioName} — ${status} (${duration}ms)`);

  // Capture screenshot and trace on failure
  if (status === Status.FAILED) {
    try {
      // Screenshot
      if (process.env.SCREENSHOT_ON_FAIL !== 'false' && this.page) {
        const screenshotPath = path.join(
          'reports/screenshots',
          `${sanitizeFilename(this.scenarioName)}-${Date.now()}.png`
        );
        await this.page.screenshot({ path: screenshotPath, fullPage: true });
        const screenshotBuffer = fs.readFileSync(screenshotPath);
        await this.attach(screenshotBuffer, 'image/png');
        this.screenshotPath = screenshotPath;
        logger.info(`Screenshot saved: ${screenshotPath}`);
      }

      // Trace
      if (process.env.TRACE_ON_FAIL !== 'false' && this.context) {
        const tracePath = path.join(
          'reports/traces',
          `${sanitizeFilename(this.scenarioName)}-${Date.now()}.zip`
        );
        await this.context.tracing.stop({ path: tracePath });
        logger.info(`Trace saved: ${tracePath}`);
      }
    } catch (err) {
      logger.warn(`Could not capture failure artifacts: ${err}`);
    }
  }

  // Cleanup
  try {
    await this.context?.close();
  } catch (err) {
    logger.warn(`Context close error: ${err}`);
  }
});

// ─── AfterAll Hook ─────────────────────────────────────────────────────────────

AfterAll(async function () {
  logger.info('\n🏁 Test Suite Completed');
  await sharedBrowser?.close();
  logger.info('Browser closed');
});

// ─── BeforeStep Hook ──────────────────────────────────────────────────────────

BeforeStep(async function (this: CustomWorld, step) {
  logger.debug(`  Step: ${step.pickleStep.text}`);
});

// ─── AfterStep Hook ───────────────────────────────────────────────────────────

AfterStep(async function (this: CustomWorld, step) {
  if (step.result.status === Status.FAILED) {
    logger.error(`  ❌ Failed Step: ${step.pickleStep.text}`);
    logger.error(`  Error: ${step.result.message}`);
  }
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-z0-9]/gi, '_').substring(0, 50);
}
