import { Page, Route, Request } from 'playwright';
import { Logger } from './logger';

const logger = Logger.getInstance();

export interface MockResponse {
  status?: number;
  headers?: Record<string, string>;
  body?: unknown;
  delay?: number;
}

export interface InterceptedRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: unknown;
  timestamp: number;
}

/**
 * Network interceptor for mocking API responses and capturing traffic.
 */
export class NetworkInterceptor {
  private readonly page: Page;
  private capturedRequests: InterceptedRequest[] = [];
  private capturedResponses: Array<{ url: string; status: number; body: unknown }> = [];

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Mock a specific URL pattern with a canned response
   */
  async mockRoute(
    urlPattern: string | RegExp,
    mockResponse: MockResponse
  ): Promise<void> {
    await this.page.route(urlPattern, async (route: Route) => {
      logger.debug(`🎭 Mocking: ${route.request().url()}`);
      if (mockResponse.delay) {
        await new Promise((r) => setTimeout(r, mockResponse.delay));
      }
      await route.fulfill({
        status:      mockResponse.status  ?? 200,
        contentType: 'application/json',
        headers:     mockResponse.headers ?? {},
        body:        JSON.stringify(mockResponse.body ?? {}),
      });
    });
    logger.info(`Route mocked: ${urlPattern}`);
  }

  /**
   * Abort requests matching a URL pattern (simulate network failure)
   */
  async abortRoute(urlPattern: string | RegExp): Promise<void> {
    await this.page.route(urlPattern, (route) => route.abort('failed'));
    logger.info(`Route aborted: ${urlPattern}`);
  }

  /**
   * Slow down a route to test timeout / loading behaviours
   */
  async throttleRoute(
    urlPattern: string | RegExp,
    delayMs: number
  ): Promise<void> {
    await this.page.route(urlPattern, async (route) => {
      await new Promise((r) => setTimeout(r, delayMs));
      await route.continue();
    });
    logger.info(`Route throttled by ${delayMs}ms: ${urlPattern}`);
  }

  /**
   * Capture all requests to a URL pattern
   */
  async captureRequests(urlPattern: string | RegExp): Promise<void> {
    this.page.on('request', (req: Request) => {
      if (this.matchesPattern(req.url(), urlPattern)) {
        let body: unknown;
        try { body = req.postDataJSON(); } catch { body = req.postData(); }
        this.capturedRequests.push({
          url:       req.url(),
          method:    req.method(),
          headers:   req.headers() as Record<string, string>,
          body,
          timestamp: Date.now(),
        });
        logger.debug(`Captured request: ${req.method()} ${req.url()}`);
      }
    });
  }

  /**
   * Wait for a specific request to be made
   */
  async waitForRequest(
    urlPattern: string | RegExp,
    timeoutMs = 10000
  ): Promise<InterceptedRequest> {
    const req = await this.page.waitForRequest(urlPattern, { timeout: timeoutMs });
    let body: unknown;
    try { body = req.postDataJSON(); } catch { body = req.postData(); }
    return {
      url:       req.url(),
      method:    req.method(),
      headers:   req.headers() as Record<string, string>,
      body,
      timestamp: Date.now(),
    };
  }

  /**
   * Wait for a specific response
   */
  async waitForResponse(
    urlPattern: string | RegExp,
    timeoutMs = 10000
  ): Promise<{ url: string; status: number; body: unknown }> {
    const res = await this.page.waitForResponse(urlPattern, { timeout: timeoutMs });
    let body: unknown;
    try { body = await res.json(); } catch { body = await res.text(); }
    return { url: res.url(), status: res.status(), body };
  }

  /**
   * Remove all route mocks
   */
  async clearMocks(): Promise<void> {
    await this.page.unroute('**/*');
    logger.debug('All route mocks cleared');
  }

  getCapturedRequests(): InterceptedRequest[] {
    return [...this.capturedRequests];
  }

  getLastCapturedRequest(): InterceptedRequest | undefined {
    return this.capturedRequests[this.capturedRequests.length - 1];
  }

  clearCaptured(): void {
    this.capturedRequests = [];
    this.capturedResponses = [];
  }

  private matchesPattern(url: string, pattern: string | RegExp): boolean {
    if (typeof pattern === 'string') return url.includes(pattern);
    return pattern.test(url);
  }
}

// ─── Pre-built mock responses ─────────────────────────────────────────────────

export const MockResponses = {
  unauthorised: (): MockResponse => ({
    status: 401,
    body:   { error: 'Unauthorized', message: 'Authentication required' },
  }),

  serverError: (): MockResponse => ({
    status: 500,
    body:   { error: 'Internal Server Error', message: 'Something went wrong' },
  }),

  notFound: (): MockResponse => ({
    status: 404,
    body:   { error: 'Not Found', message: 'Resource not found' },
  }),

  rateLimited: (): MockResponse => ({
    status: 429,
    headers: { 'Retry-After': '60' },
    body:   { error: 'Too Many Requests', message: 'Rate limit exceeded' },
  }),

  emptyList: (): MockResponse => ({
    status: 200,
    body:   { data: [], total: 0, page: 1, pageSize: 10 },
  }),

  networkTimeout: (delayMs = 35000): MockResponse => ({
    status: 200,
    delay:  delayMs,
    body:   {},
  }),
};
