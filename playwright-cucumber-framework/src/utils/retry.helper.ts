import { Logger } from './logger';

const logger = Logger.getInstance();

export interface RetryOptions {
  /** Maximum number of attempts (including the first). Default: 3 */
  maxAttempts?: number;
  /** Base delay in ms before the first retry. Default: 500 */
  baseDelayMs?: number;
  /** Multiply delay by this factor each attempt. Default: 2 (exponential) */
  backoffFactor?: number;
  /** Add random jitter up to this many ms. Default: 200 */
  jitterMs?: number;
  /** Maximum delay cap in ms. Default: 30000 */
  maxDelayMs?: number;
  /** Only retry if this predicate returns true for the thrown error */
  retryIf?: (err: Error) => boolean;
  /** Called before each retry with the error and attempt number */
  onRetry?: (err: Error, attempt: number) => void | Promise<void>;
  /** Label for log messages */
  label?: string;
}

/**
 * Execute an async function with configurable retry, exponential backoff, and jitter.
 *
 * @example
 * const result = await RetryHelper.run(
 *   () => apiClient.get('/flaky-endpoint'),
 *   { maxAttempts: 5, baseDelayMs: 1000, label: 'GET /flaky-endpoint' }
 * );
 */
export class RetryHelper {
  static async run<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
    const {
      maxAttempts  = 3,
      baseDelayMs  = 500,
      backoffFactor= 2,
      jitterMs     = 200,
      maxDelayMs   = 30_000,
      retryIf,
      onRetry,
      label        = 'operation',
    } = options;

    let lastError: Error = new Error('No attempts made');

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await fn();
        if (attempt > 1) {
          logger.info(`✅ "${label}" succeeded on attempt ${attempt}/${maxAttempts}`);
        }
        return result;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));

        // Check if we should retry this error type
        if (retryIf && !retryIf(lastError)) {
          logger.warn(`"${label}" failed — not retryable: ${lastError.message}`);
          throw lastError;
        }

        if (attempt === maxAttempts) break;

        const rawDelay  = baseDelayMs * Math.pow(backoffFactor, attempt - 1);
        const jitter    = Math.random() * jitterMs;
        const delay     = Math.min(rawDelay + jitter, maxDelayMs);

        logger.warn(
          `"${label}" failed (attempt ${attempt}/${maxAttempts}): ${lastError.message} — retrying in ${Math.round(delay)}ms`
        );

        if (onRetry) await onRetry(lastError, attempt);
        await RetryHelper.sleep(delay);
      }
    }

    logger.error(`"${label}" failed after ${maxAttempts} attempts: ${lastError.message}`);
    throw lastError;
  }

  /**
   * Poll until a condition returns truthy or timeout is reached.
   *
   * @example
   * await RetryHelper.waitUntil(() => page.isVisible('.spinner') === false, { timeoutMs: 10000 });
   */
  static async waitUntil(
    condition: () => boolean | Promise<boolean>,
    options: { timeoutMs?: number; intervalMs?: number; label?: string } = {}
  ): Promise<void> {
    const { timeoutMs = 10_000, intervalMs = 500, label = 'condition' } = options;
    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline) {
      if (await condition()) {
        logger.debug(`Condition met: "${label}"`);
        return;
      }
      await RetryHelper.sleep(intervalMs);
    }

    throw new Error(`Timed out waiting for "${label}" after ${timeoutMs}ms`);
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ─── Common retryIf predicates ────────────────────────────────────────────────

export const RetryPredicates = {
  /** Retry on network / timeout errors but not on assertion failures */
  networkOnly: (err: Error) =>
    /timeout|ECONNREFUSED|ENOTFOUND|ECONNRESET|network/i.test(err.message),

  /** Retry on any error except those containing "AssertionError" */
  notAssertion: (err: Error) =>
    !err.name.includes('AssertionError') && !err.message.includes('Expected'),

  /** Retry on HTTP 5xx or 429 responses only */
  serverError: (err: Error) =>
    /5\d{2}|429|Too Many Requests/i.test(err.message),

  /** Always retry */
  always: () => true,
};
