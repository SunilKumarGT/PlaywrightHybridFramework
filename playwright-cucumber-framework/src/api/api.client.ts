import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiRequestConfig, ApiResponse } from '../types';
import { Logger } from '../utils/logger';
import { Helpers } from '../utils/helpers';
import config from '../../config/environments';

const logger = Logger.getInstance();

/**
 * Central HTTP client for all API testing.
 * Wraps Axios with logging, retry, and response normalization.
 */
export class ApiClient {
  private readonly client: AxiosInstance;
  private authToken?: string;

  constructor(baseUrl?: string) {
    this.client = axios.create({
      baseURL: baseUrl || config.apiBaseUrl,
      timeout: config.timeouts.api,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (req) => {
        logger.debug(`→ ${req.method?.toUpperCase()} ${req.baseURL}${req.url}`);
        if (req.data) {
          logger.debug(`  Body: ${JSON.stringify(Helpers.maskSensitive(req.data))}`);
        }
        return req;
      },
      (err) => {
        logger.error(`Request error: ${err.message}`);
        return Promise.reject(err);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (res) => {
        logger.debug(`← ${res.status} ${res.statusText} (${res.config.url})`);
        return res;
      },
      (err) => {
        if (err.response) {
          logger.warn(`← ${err.response.status} ${err.response.statusText} (${err.config?.url})`);
        } else {
          logger.error(`Network error: ${err.message}`);
        }
        return Promise.reject(err);
      }
    );
  }

  setAuthToken(token: string): void {
    this.authToken = token;
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    logger.debug('Auth token set');
  }

  setApiKey(key: string, headerName = 'X-API-Key'): void {
    this.client.defaults.headers.common[headerName] = key;
  }

  clearAuth(): void {
    delete this.client.defaults.headers.common['Authorization'];
    delete this.client.defaults.headers.common['X-API-Key'];
    this.authToken = undefined;
  }

  async request(cfg: ApiRequestConfig): Promise<ApiResponse> {
    const start = Date.now();

    const axiosCfg: AxiosRequestConfig = {
      method: cfg.method,
      url: cfg.url,
      headers: cfg.headers,
      params: cfg.queryParams,
      data: cfg.body,
      timeout: cfg.timeout,
    };

    // Apply auth
    if (cfg.auth) {
      switch (cfg.auth.type) {
        case 'bearer':
          axiosCfg.headers = { ...axiosCfg.headers, Authorization: `Bearer ${cfg.auth.token}` };
          break;
        case 'basic':
          axiosCfg.auth = { username: cfg.auth.username!, password: cfg.auth.password! };
          break;
        case 'apiKey':
          if (cfg.auth.in === 'query') {
            axiosCfg.params = { ...axiosCfg.params, [cfg.auth.key!]: cfg.auth.value };
          } else {
            axiosCfg.headers = { ...axiosCfg.headers, [cfg.auth.key!]: cfg.auth.value };
          }
          break;
      }
    }

    try {
      const response: AxiosResponse = await this.client.request(axiosCfg);
      return this.normalizeResponse(response, Date.now() - start);
    } catch (err: any) {
      if (err.response) {
        return this.normalizeResponse(err.response, Date.now() - start);
      }
      throw new Error(`API request failed: ${err.message}`);
    }
  }

  async get(url: string, params?: Record<string, string>, headers?: Record<string, string>): Promise<ApiResponse> {
    return this.request({ method: 'GET', url, queryParams: params, headers });
  }

  async post(url: string, body?: unknown, headers?: Record<string, string>): Promise<ApiResponse> {
    return this.request({ method: 'POST', url, body, headers });
  }

  async put(url: string, body?: unknown, headers?: Record<string, string>): Promise<ApiResponse> {
    return this.request({ method: 'PUT', url, body, headers });
  }

  async patch(url: string, body?: unknown, headers?: Record<string, string>): Promise<ApiResponse> {
    return this.request({ method: 'PATCH', url, body, headers });
  }

  async delete(url: string, headers?: Record<string, string>): Promise<ApiResponse> {
    return this.request({ method: 'DELETE', url, headers });
  }

  private normalizeResponse(res: AxiosResponse, duration: number): ApiResponse {
    return {
      status: res.status,
      statusText: res.statusText,
      body: res.data,
      headers: res.headers as Record<string, string>,
      duration,
    };
  }
}
