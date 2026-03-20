import * as assert from 'assert';
import { ApiResponse } from '../types';
import { Logger } from '../utils/logger';
import jsonpath from 'jsonpath';

const logger = Logger.getInstance();

/**
 * Rich assertion library for API responses
 */
export class ApiAssertions {
  private readonly response: ApiResponse;

  constructor(response: ApiResponse) {
    this.response = response;
  }

  // ─── Status Code Assertions ──────────────────────────────────────────────────

  statusIs(expected: number): this {
    assert.strictEqual(
      this.response.status,
      expected,
      `Expected status ${expected}, got ${this.response.status}. Body: ${JSON.stringify(this.response.body)}`
    );
    logger.debug(`✅ Status is ${expected}`);
    return this;
  }

  statusInRange(min: number, max: number): this {
    assert.ok(
      this.response.status >= min && this.response.status <= max,
      `Expected status in [${min}-${max}], got ${this.response.status}`
    );
    return this;
  }

  isSuccess(): this {
    return this.statusInRange(200, 299);
  }

  isCreated(): this {
    return this.statusIs(201);
  }

  isNotFound(): this {
    return this.statusIs(404);
  }

  isUnauthorized(): this {
    return this.statusIs(401);
  }

  isForbidden(): this {
    return this.statusIs(403);
  }

  isBadRequest(): this {
    return this.statusIs(400);
  }

  // ─── Body Assertions ─────────────────────────────────────────────────────────

  bodyContains(key: string, value?: unknown): this {
    const body = this.response.body as Record<string, unknown>;
    assert.ok(key in body, `Response body does not contain key "${key}"`);
    if (value !== undefined) {
      assert.deepStrictEqual(body[key], value, `Expected body.${key} to be ${JSON.stringify(value)}, got ${JSON.stringify(body[key])}`);
    }
    logger.debug(`✅ Body contains "${key}"`);
    return this;
  }

  bodyEquals(expected: unknown): this {
    assert.deepStrictEqual(this.response.body, expected, 'Response body does not match expected');
    return this;
  }

  bodyIsArray(): this {
    assert.ok(Array.isArray(this.response.body), 'Expected response body to be an array');
    return this;
  }

  arrayLengthIs(expected: number): this {
    const body = this.response.body as unknown[];
    assert.strictEqual(body.length, expected, `Expected array length ${expected}, got ${body.length}`);
    return this;
  }

  arrayLengthAtLeast(min: number): this {
    const body = this.response.body as unknown[];
    assert.ok(body.length >= min, `Expected array length >= ${min}, got ${body.length}`);
    return this;
  }

  // ─── JSONPath Assertions ──────────────────────────────────────────────────────

  jsonPathEquals(path: string, expected: unknown): this {
    const values = jsonpath.query(this.response.body as object, path);
    assert.ok(values.length > 0, `JSONPath "${path}" not found in response`);
    assert.deepStrictEqual(values[0], expected, `JSONPath "${path}" expected ${JSON.stringify(expected)}, got ${JSON.stringify(values[0])}`);
    logger.debug(`✅ JSONPath ${path} = ${JSON.stringify(expected)}`);
    return this;
  }

  jsonPathExists(path: string): this {
    const values = jsonpath.query(this.response.body as object, path);
    assert.ok(values.length > 0, `JSONPath "${path}" not found in response`);
    return this;
  }

  jsonPathContains(path: string, substring: string): this {
    const values = jsonpath.query(this.response.body as object, path);
    assert.ok(values.length > 0, `JSONPath "${path}" not found`);
    assert.ok(String(values[0]).includes(substring), `JSONPath "${path}" does not contain "${substring}"`);
    return this;
  }

  // ─── Header Assertions ────────────────────────────────────────────────────────

  headerExists(name: string): this {
    const headerName = name.toLowerCase();
    const exists = Object.keys(this.response.headers).some((h) => h.toLowerCase() === headerName);
    assert.ok(exists, `Response header "${name}" not found`);
    return this;
  }

  headerIs(name: string, expected: string): this {
    const headerName = name.toLowerCase();
    const header = Object.entries(this.response.headers).find(([k]) => k.toLowerCase() === headerName);
    assert.ok(header, `Response header "${name}" not found`);
    assert.strictEqual(header[1], expected, `Header "${name}" expected "${expected}", got "${header[1]}"`);
    return this;
  }

  contentTypeIs(type: string): this {
    return this.headerIs('content-type', type);
  }

  // ─── Performance Assertions ──────────────────────────────────────────────────

  responseTimeLessThan(maxMs: number): this {
    assert.ok(
      this.response.duration <= maxMs,
      `Response time ${this.response.duration}ms exceeded limit of ${maxMs}ms`
    );
    logger.debug(`✅ Response time ${this.response.duration}ms < ${maxMs}ms`);
    return this;
  }

  // ─── Static factory ──────────────────────────────────────────────────────────

  static from(response: ApiResponse): ApiAssertions {
    return new ApiAssertions(response);
  }
}
