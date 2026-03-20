import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { CustomWorld } from '../hooks/world';
import { ApiClient } from '../api/api.client';
import { ApiAssertions } from '../api/api.assertions';
import { SchemaValidator, CommonSchemas } from '../api/schema.validator';
import { Logger } from '../utils/logger';
import config from '../../config/environments';

const logger = Logger.getInstance();
const schemaValidator = new SchemaValidator();

// ─── Setup Steps ──────────────────────────────────────────────────────────────

Given('I have a valid API client', function (this: CustomWorld) {
  const client = new ApiClient();
  this.setData('apiClient', client);
  logger.info('API client initialized');
});

Given('I authenticate with bearer token {string}', function (this: CustomWorld, token: string) {
  const client = this.getData<ApiClient>('apiClient') || new ApiClient();
  client.setAuthToken(token);
  this.setData('apiClient', client);
});

Given('I authenticate with API key {string}', function (this: CustomWorld, apiKey: string) {
  const client = this.getData<ApiClient>('apiClient') || new ApiClient();
  client.setApiKey(apiKey);
  this.setData('apiClient', client);
});

Given('I set request header {string} to {string}', function (this: CustomWorld, header: string, value: string) {
  const headers = this.getData<Record<string, string>>('requestHeaders') || {};
  headers[header] = value;
  this.setData('requestHeaders', headers);
});

Given('I set the base URL to {string}', function (this: CustomWorld, url: string) {
  const client = new ApiClient(url);
  this.setData('apiClient', client);
});

// ─── Request Steps ────────────────────────────────────────────────────────────

When('I send a GET request to {string}', async function (this: CustomWorld, endpoint: string) {
  const client = this.getData<ApiClient>('apiClient') || new ApiClient();
  const headers = this.getData<Record<string, string>>('requestHeaders');
  this.apiResponse = await client.get(endpoint, undefined, headers);
  logger.info(`GET ${endpoint} → ${this.apiResponse.status} (${this.apiResponse.duration}ms)`);
});

When('I send a POST request to {string} with body:', async function (this: CustomWorld, endpoint: string, docString: string) {
  const client = this.getData<ApiClient>('apiClient') || new ApiClient();
  const headers = this.getData<Record<string, string>>('requestHeaders');
  const body = JSON.parse(docString);
  this.apiResponse = await client.post(endpoint, body, headers);
  logger.info(`POST ${endpoint} → ${this.apiResponse.status} (${this.apiResponse.duration}ms)`);
});

When('I send a PUT request to {string} with body:', async function (this: CustomWorld, endpoint: string, docString: string) {
  const client = this.getData<ApiClient>('apiClient') || new ApiClient();
  const headers = this.getData<Record<string, string>>('requestHeaders');
  const body = JSON.parse(docString);
  this.apiResponse = await client.put(endpoint, body, headers);
  logger.info(`PUT ${endpoint} → ${this.apiResponse.status}`);
});

When('I send a PATCH request to {string} with body:', async function (this: CustomWorld, endpoint: string, docString: string) {
  const client = this.getData<ApiClient>('apiClient') || new ApiClient();
  const headers = this.getData<Record<string, string>>('requestHeaders');
  const body = JSON.parse(docString);
  this.apiResponse = await client.patch(endpoint, body, headers);
  logger.info(`PATCH ${endpoint} → ${this.apiResponse.status}`);
});

When('I send a DELETE request to {string}', async function (this: CustomWorld, endpoint: string) {
  const client = this.getData<ApiClient>('apiClient') || new ApiClient();
  const headers = this.getData<Record<string, string>>('requestHeaders');
  this.apiResponse = await client.delete(endpoint, headers);
  logger.info(`DELETE ${endpoint} → ${this.apiResponse.status}`);
});

When('I send a {string} request to {string}', async function (this: CustomWorld, method: string, endpoint: string) {
  const client = this.getData<ApiClient>('apiClient') || new ApiClient();
  const headers = this.getData<Record<string, string>>('requestHeaders');
  this.apiResponse = await client.request({
    method: method as any,
    url: endpoint,
    headers,
  });
  logger.info(`${method} ${endpoint} → ${this.apiResponse.status}`);
});

When('I send a GET request to {string} with query params:', async function (this: CustomWorld, endpoint: string, table: DataTable) {
  const client = this.getData<ApiClient>('apiClient') || new ApiClient();
  const params = table.rowsHash();
  this.apiResponse = await client.get(endpoint, params);
});

// ─── Response Assertion Steps ─────────────────────────────────────────────────

Then('the response status code should be {int}', function (this: CustomWorld, statusCode: number) {
  if (!this.apiResponse) throw new Error('No API response. Send a request first.');
  ApiAssertions.from(this.apiResponse).statusIs(statusCode);
});

Then('the response should be successful', function (this: CustomWorld) {
  if (!this.apiResponse) throw new Error('No API response found');
  ApiAssertions.from(this.apiResponse).isSuccess();
});

Then('the response body should contain {string}', function (this: CustomWorld, key: string) {
  if (!this.apiResponse) throw new Error('No API response found');
  ApiAssertions.from(this.apiResponse).bodyContains(key);
});

Then('the response body field {string} should equal {string}', function (this: CustomWorld, field: string, value: string) {
  if (!this.apiResponse) throw new Error('No API response found');
  const body = this.apiResponse.body as Record<string, unknown>;
  const actual = field.split('.').reduce((obj: any, key) => obj?.[key], body);
  if (String(actual) !== value) {
    throw new Error(`Expected ${field} to be "${value}", got "${actual}"`);
  }
});

Then('the response body should be an array', function (this: CustomWorld) {
  if (!this.apiResponse) throw new Error('No API response found');
  ApiAssertions.from(this.apiResponse).bodyIsArray();
});

Then('the response array should have {int} items', function (this: CustomWorld, count: number) {
  if (!this.apiResponse) throw new Error('No API response found');
  ApiAssertions.from(this.apiResponse).arrayLengthIs(count);
});

Then('the response array should have at least {int} items', function (this: CustomWorld, count: number) {
  if (!this.apiResponse) throw new Error('No API response found');
  ApiAssertions.from(this.apiResponse).arrayLengthAtLeast(count);
});

Then('the response time should be less than {int} milliseconds', function (this: CustomWorld, maxMs: number) {
  if (!this.apiResponse) throw new Error('No API response found');
  ApiAssertions.from(this.apiResponse).responseTimeLessThan(maxMs);
});

Then('the response header {string} should be {string}', function (this: CustomWorld, header: string, value: string) {
  if (!this.apiResponse) throw new Error('No API response found');
  ApiAssertions.from(this.apiResponse).headerIs(header, value);
});

Then('the response JSONPath {string} should equal {string}', function (this: CustomWorld, jsonPath: string, value: string) {
  if (!this.apiResponse) throw new Error('No API response found');
  ApiAssertions.from(this.apiResponse).jsonPathEquals(jsonPath, value);
});

Then('the response should match the user schema', function (this: CustomWorld) {
  if (!this.apiResponse) throw new Error('No API response found');
  schemaValidator.assertValid(this.apiResponse.body, CommonSchemas.userSchema, 'User Response');
});

Then('the response should match the product schema', function (this: CustomWorld) {
  if (!this.apiResponse) throw new Error('No API response found');
  schemaValidator.assertValid(this.apiResponse.body, CommonSchemas.productSchema, 'Product Response');
});

Then('I store the response field {string} as {string}', function (this: CustomWorld, field: string, alias: string) {
  if (!this.apiResponse) throw new Error('No API response found');
  const body = this.apiResponse.body as Record<string, unknown>;
  const value = field.split('.').reduce((obj: any, key) => obj?.[key], body);
  this.setData(alias, value);
  logger.info(`Stored ${field} = ${value} as "${alias}"`);
});
