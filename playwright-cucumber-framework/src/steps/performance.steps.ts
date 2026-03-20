import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../hooks/world';
import { PerformanceMonitor, PerformanceBudgets, PerformanceMetrics } from '../performance/perf.monitor';
import { Logger } from '../utils/logger';

const logger = Logger.getInstance();

// ─── Collection Steps ─────────────────────────────────────────────────────────

When('I measure page performance', async function (this: CustomWorld) {
  const monitor = new PerformanceMonitor(this.page);
  const metrics = await monitor.collectMetrics();
  this.setData('perfMetrics', metrics);
  await this.attach(
    JSON.stringify(metrics, null, 2),
    'application/json'
  );
});

When('I measure the action {string}', async function (this: CustomWorld, label: string) {
  const monitor  = new PerformanceMonitor(this.page);
  const history  = this.getData<Record<string, number>>('actionDurations') ?? {};

  // Caller must have already triggered the action;
  // we just snapshot timing here for assertion later
  const metrics  = await monitor.collectMetrics();
  history[label] = metrics.loadComplete;
  this.setData('actionDurations', history);
  logger.info(`Action "${label}" load: ${metrics.loadComplete.toFixed(0)}ms`);
});

// ─── Budget Assertions ────────────────────────────────────────────────────────

Then('the page should meet {string} performance budget', function (this: CustomWorld, budgetType: string) {
  const metrics = this.getData<PerformanceMetrics>('perfMetrics');
  if (!metrics) throw new Error('No metrics captured. Run a measurement step first.');

  const map: Record<string, () => object> = {
    fast:   PerformanceBudgets.fastPage,
    normal: PerformanceBudgets.normalPage,
    heavy:  PerformanceBudgets.heavyPage,
  };
  const budget = map[budgetType];
  if (!budget) throw new Error(`Unknown budget "${budgetType}". Valid: fast | normal | heavy`);

  const monitor = new PerformanceMonitor(this.page);
  monitor.assertBudget(metrics, budget());
});

// ─── Individual Metric Assertions ─────────────────────────────────────────────

Then('FCP should be under {int} milliseconds', function (this: CustomWorld, ms: number) {
  const m = this.getData<PerformanceMetrics>('perfMetrics');
  if (!m) throw new Error('No performance metrics found');
  expect(m.firstContentfulPaint, `FCP ${m.firstContentfulPaint}ms > ${ms}ms`).toBeLessThanOrEqual(ms);
  logger.info(`✅ FCP ${m.firstContentfulPaint.toFixed(0)}ms ≤ ${ms}ms`);
});

Then('LCP should be under {int} milliseconds', function (this: CustomWorld, ms: number) {
  const m = this.getData<PerformanceMetrics>('perfMetrics');
  if (!m) throw new Error('No performance metrics found');
  expect(m.largestContentfulPaint, `LCP ${m.largestContentfulPaint}ms > ${ms}ms`).toBeLessThanOrEqual(ms);
  logger.info(`✅ LCP ${m.largestContentfulPaint.toFixed(0)}ms ≤ ${ms}ms`);
});

Then('CLS should be below {float}', function (this: CustomWorld, score: number) {
  const m = this.getData<PerformanceMetrics>('perfMetrics');
  if (!m) throw new Error('No performance metrics found');
  expect(m.cumulativeLayoutShift, `CLS ${m.cumulativeLayoutShift} > ${score}`).toBeLessThanOrEqual(score);
  logger.info(`✅ CLS ${m.cumulativeLayoutShift.toFixed(3)} ≤ ${score}`);
});

Then('TBT should be under {int} milliseconds', function (this: CustomWorld, ms: number) {
  const m = this.getData<PerformanceMetrics>('perfMetrics');
  if (!m) throw new Error('No performance metrics found');
  expect(m.totalBlockingTime, `TBT ${m.totalBlockingTime}ms > ${ms}ms`).toBeLessThanOrEqual(ms);
  logger.info(`✅ TBT ${m.totalBlockingTime.toFixed(0)}ms ≤ ${ms}ms`);
});

Then('DOM content loaded should be under {int} milliseconds', function (this: CustomWorld, ms: number) {
  const m = this.getData<PerformanceMetrics>('perfMetrics');
  if (!m) throw new Error('No performance metrics found');
  expect(m.domContentLoaded).toBeLessThanOrEqual(ms);
  logger.info(`✅ DCL ${m.domContentLoaded.toFixed(0)}ms ≤ ${ms}ms`);
});

Then('total page weight should be under {int} kilobytes', function (this: CustomWorld, kb: number) {
  const m = this.getData<PerformanceMetrics>('perfMetrics');
  if (!m) throw new Error('No performance metrics found');
  const actualKb = m.totalTransferSize / 1024;
  expect(actualKb, `Page weight ${actualKb.toFixed(1)}KB > ${kb}KB`).toBeLessThanOrEqual(kb);
  logger.info(`✅ Page weight ${actualKb.toFixed(1)}KB ≤ ${kb}KB`);
});

Then('JS heap usage should be under {int} megabytes', function (this: CustomWorld, mb: number) {
  const m = this.getData<PerformanceMetrics>('perfMetrics');
  if (!m) throw new Error('No performance metrics found');
  const actualMb = m.jsHeapUsed / (1024 * 1024);
  expect(actualMb, `Heap ${actualMb.toFixed(1)}MB > ${mb}MB`).toBeLessThanOrEqual(mb);
  logger.info(`✅ JS heap ${actualMb.toFixed(1)}MB ≤ ${mb}MB`);
});

Then('the performance metrics should be logged', async function (this: CustomWorld) {
  const m = this.getData<PerformanceMetrics>('perfMetrics');
  if (!m) throw new Error('No performance metrics found');

  const summary = [
    `Performance Report for: ${m.url}`,
    `──────────────────────────────────`,
    `FCP:         ${m.firstContentfulPaint.toFixed(0)}ms`,
    `LCP:         ${m.largestContentfulPaint.toFixed(0)}ms`,
    `CLS:         ${m.cumulativeLayoutShift.toFixed(3)}`,
    `TBT:         ${m.totalBlockingTime.toFixed(0)}ms`,
    `TTI:         ${m.timeToInteractive.toFixed(0)}ms`,
    `DOM Ready:   ${m.domContentLoaded.toFixed(0)}ms`,
    `Load:        ${m.loadComplete.toFixed(0)}ms`,
    `Resources:   ${m.resourceCount}`,
    `Transfer:    ${(m.totalTransferSize / 1024).toFixed(1)}KB`,
    `JS Heap:     ${(m.jsHeapUsed / (1024 * 1024)).toFixed(1)}MB`,
  ].join('\n');

  await this.attach(summary, 'text/plain');
  logger.info(summary);
});
