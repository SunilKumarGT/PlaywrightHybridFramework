import * as http from 'http';
import * as url from 'url';
import { Logger } from '../utils/logger';

const logger = Logger.getInstance();

export interface MockRoute {
  method:   'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | '*';
  path:     string | RegExp;
  status:   number;
  body:     unknown;
  headers?: Record<string, string>;
  delay?:   number;                  // ms to wait before responding
  once?:    boolean;                 // remove route after first match
}

/**
 * Lightweight in-process HTTP mock server.
 * Use for isolated API tests that don't need a real back-end.
 *
 * @example
 * const server = new MockServer(4000);
 * await server.start();
 *
 * server.addRoute({ method: 'GET', path: '/api/users', status: 200, body: [{ id: '1' }] });
 *
 * // In API tests:
 * // API_BASE_URL=http://localhost:4000
 *
 * await server.stop();
 */
export class MockServer {
  private server:    http.Server | null = null;
  private routes:    MockRoute[] = [];
  private callLog:   Array<{ method: string; path: string; body: unknown; timestamp: number }> = [];
  private readonly port: number;

  constructor(port = 4000) {
    this.port = port;
  }

  // ─── Lifecycle ────────────────────────────────────────────────────────────

  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = http.createServer(this.handleRequest.bind(this));
      this.server.listen(this.port, '127.0.0.1', () => {
        logger.info(`🎭 Mock server started at http://127.0.0.1:${this.port}`);
        resolve();
      });
      this.server.once('error', reject);
    });
  }

  stop(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.server) { resolve(); return; }
      this.server.close(() => {
        logger.info('Mock server stopped');
        resolve();
      });
    });
  }

  get baseUrl(): string {
    return `http://127.0.0.1:${this.port}`;
  }

  // ─── Route management ────────────────────────────────────────────────────

  addRoute(route: MockRoute): this {
    this.routes.push(route);
    logger.debug(`Mock route added: ${route.method} ${route.path}`);
    return this;
  }

  /** Convenience: add a GET route */
  get(path: string | RegExp, body: unknown, status = 200): this {
    return this.addRoute({ method: 'GET', path, status, body });
  }

  /** Convenience: add a POST route */
  post(path: string | RegExp, body: unknown, status = 201): this {
    return this.addRoute({ method: 'POST', path, status, body });
  }

  /** Convenience: add an error route */
  error(method: MockRoute['method'], path: string | RegExp, status = 500, message = 'Internal Server Error'): this {
    return this.addRoute({ method, path, status, body: { error: message } });
  }

  clearRoutes(): this {
    this.routes = [];
    return this;
  }

  reset(): this {
    this.routes   = [];
    this.callLog  = [];
    return this;
  }

  // ─── Inspection ──────────────────────────────────────────────────────────

  getCalls(): typeof this.callLog {
    return [...this.callLog];
  }

  getCallsTo(pathPattern: string | RegExp): typeof this.callLog {
    return this.callLog.filter((c) =>
      typeof pathPattern === 'string'
        ? c.path.includes(pathPattern)
        : pathPattern.test(c.path)
    );
  }

  wasCalledWith(method: string, pathPattern: string | RegExp): boolean {
    return this.getCallsTo(pathPattern).some(
      (c) => c.method.toUpperCase() === method.toUpperCase()
    );
  }

  // ─── Request handler ─────────────────────────────────────────────────────

  private handleRequest(req: http.IncomingMessage, res: http.ServerResponse): void {
    const parsedUrl = url.parse(req.url ?? '/', true);
    const pathname  = parsedUrl.pathname ?? '/';
    const method    = req.method ?? 'GET';

    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', async () => {
      let parsedBody: unknown;
      try { parsedBody = JSON.parse(body); } catch { parsedBody = body; }

      this.callLog.push({ method, path: pathname, body: parsedBody, timestamp: Date.now() });
      logger.debug(`Mock server: ${method} ${pathname}`);

      const route = this.findRoute(method, pathname);
      if (!route) {
        logger.warn(`No mock route for: ${method} ${pathname}`);
        this.send(res, 404, { error: 'Not Found', path: pathname });
        return;
      }

      if (route.once) {
        this.routes = this.routes.filter((r) => r !== route);
      }

      if (route.delay) {
        await new Promise((r) => setTimeout(r, route.delay));
      }

      this.send(res, route.status, route.body, route.headers);
    });
  }

  private findRoute(method: string, pathname: string): MockRoute | undefined {
    return this.routes.find((r) => {
      const methodMatch = r.method === '*' || r.method === method.toUpperCase();
      const pathMatch   = typeof r.path === 'string'
        ? r.path === pathname
        : r.path.test(pathname);
      return methodMatch && pathMatch;
    });
  }

  private send(
    res: http.ServerResponse,
    status: number,
    body: unknown,
    extraHeaders: Record<string, string> = {}
  ): void {
    const json = JSON.stringify(body);
    res.writeHead(status, {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(json),
      ...extraHeaders,
    });
    res.end(json);
  }
}
