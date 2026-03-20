import { Page } from 'playwright';
import { Logger } from '../utils/logger';

const logger = Logger.getInstance();

export interface PerformanceMetrics {
  url:                    string;
  navigationStart:        number;
  domContentLoaded:       number;
  loadComplete:           number;
  firstContentfulPaint:   number;
  largestContentfulPaint: number;
  totalBlockingTime:      number;
  cumulativeLayoutShift:  number;
  timeToInteractive:      number;
  resourceCount:          number;
  totalTransferSize:      number;
  jsHeapUsed:             number;
}

export interface PerformanceBudget {
  domContentLoaded?:       number;   // ms
  loadComplete?:           number;   // ms
  firstContentfulPaint?:   number;   // ms
  largestContentfulPaint?: number;   // ms
  totalBlockingTime?:      number;   // ms
  cumulativeLayoutShift?:  number;   // score (< 0.1 is good)
  timeToInteractive?:      number;   // ms
  totalTransferSize?:      number;   // bytes
}

export class PerformanceMonitor {
  private readonly page: Page;
  private metrics: PerformanceMetrics[] = [];

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Collect Core Web Vitals and navigation timing from the current page
   */
  async collectMetrics(): Promise<PerformanceMetrics> {
    const metrics = await this.page.evaluate((): PerformanceMetrics => {
      const nav   = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      const fcp   = paint.find((e) => e.name === 'first-contentful-paint')?.startTime ?? 0;
      const lcp   = (window as any).__LCP ?? 0;
      const cls   = (window as any).__CLS ?? 0;
      const tbt   = (window as any).__TBT ?? 0;
      const tti   = (window as any).__TTI ?? 0;

      const resources     = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const totalTransfer = resources.reduce((sum, r) => sum + (r.transferSize ?? 0), 0);

      const memory = (performance as any).memory;

      return {
        url:                    window.location.href,
        navigationStart:        nav?.startTime                        ?? 0,
        domContentLoaded:       (nav?.domContentLoadedEventEnd - nav?.startTime) ?? 0,
        loadComplete:           (nav?.loadEventEnd        - nav?.startTime)      ?? 0,
        firstContentfulPaint:   fcp,
        largestContentfulPaint: lcp,
        totalBlockingTime:      tbt,
        cumulativeLayoutShift:  cls,
        timeToInteractive:      tti,
        resourceCount:          resources.length,
        totalTransferSize:      totalTransfer,
        jsHeapUsed:             memory?.usedJSHeapSize ?? 0,
      };
    });

    this.metrics.push(metrics);
    logger.info(`⚡ Performance for ${metrics.url}:`);
    logger.info(`   FCP: ${metrics.firstContentfulPaint.toFixed(0)}ms | LCP: ${metrics.largestContentfulPaint.toFixed(0)}ms | CLS: ${metrics.cumulativeLayoutShift.toFixed(3)}`);
    logger.info(`   DOM Ready: ${metrics.domContentLoaded.toFixed(0)}ms | Load: ${metrics.loadComplete.toFixed(0)}ms`);
    logger.info(`   Resources: ${metrics.resourceCount} | Transfer: ${(metrics.totalTransferSize / 1024).toFixed(1)}KB`);

    return metrics;
  }

  /**
   * Assert metrics against a performance budget
   */
  assertBudget(metrics: PerformanceMetrics, budget: PerformanceBudget): void {
    const violations: string[] = [];

    const check = (name: string, actual: number, limit?: number) => {
      if (limit !== undefined && actual > limit) {
        violations.push(`${name}: ${actual.toFixed(0)} > ${limit} (budget exceeded by ${(actual - limit).toFixed(0)})`);
      }
    };

    check('DOM Content Loaded',    metrics.domContentLoaded,       budget.domContentLoaded);
    check('Page Load',             metrics.loadComplete,           budget.loadComplete);
    check('First Contentful Paint',metrics.firstContentfulPaint,   budget.firstContentfulPaint);
    check('Largest Contentful Paint', metrics.largestContentfulPaint, budget.largestContentfulPaint);
    check('Total Blocking Time',   metrics.totalBlockingTime,      budget.totalBlockingTime);
    check('Cumulative Layout Shift', metrics.cumulativeLayoutShift, budget.cumulativeLayoutShift);
    check('Time to Interactive',   metrics.timeToInteractive,      budget.timeToInteractive);
    check('Transfer Size',         metrics.totalTransferSize,      budget.totalTransferSize);

    if (violations.length > 0) {
      throw new Error(`Performance budget violations:\n${violations.map((v) => `  ❌ ${v}`).join('\n')}`);
    }
    logger.info('✅ All performance budgets met');
  }

  /**
   * Measure how long a specific action takes
   */
  async measureAction(label: string, action: () => Promise<void>): Promise<number> {
    const start = Date.now();
    await action();
    const duration = Date.now() - start;
    logger.info(`⏱  "${label}" took ${duration}ms`);
    return duration;
  }

  getMetricsHistory(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  clearMetrics(): void {
    this.metrics = [];
  }
}

// ─── Default performance budgets by page type ─────────────────────────────────
export const PerformanceBudgets = {
  /** Tight budget for landing / login pages */
  fastPage: (): PerformanceBudget => ({
    firstContentfulPaint:   1500,
    largestContentfulPaint: 2500,
    domContentLoaded:       2000,
    loadComplete:           3000,
    cumulativeLayoutShift:  0.1,
    totalBlockingTime:      200,
    totalTransferSize:      500 * 1024,   // 500 KB
  }),

  /** Moderate budget for feature-rich pages */
  normalPage: (): PerformanceBudget => ({
    firstContentfulPaint:   2500,
    largestContentfulPaint: 4000,
    domContentLoaded:       3000,
    loadComplete:           5000,
    cumulativeLayoutShift:  0.25,
    totalBlockingTime:      500,
    totalTransferSize:      1024 * 1024,  // 1 MB
  }),

  /** Relaxed budget for dashboards/data-heavy pages */
  heavyPage: (): PerformanceBudget => ({
    firstContentfulPaint:   3000,
    largestContentfulPaint: 6000,
    domContentLoaded:       5000,
    loadComplete:           10000,
    cumulativeLayoutShift:  0.5,
  }),
};
