import { ApiClient } from './api.client';
import { Logger } from '../utils/logger';
import config from '../../config/environments';

const logger = Logger.getInstance();

interface TokenCache {
  token: string;
  expiresAt: number;
}

/**
 * Centralised authentication service.
 * Handles login, token caching and refresh so steps
 * don't repeatedly hit the auth endpoint.
 */
export class AuthService {
  private static tokenCache: Map<string, TokenCache> = new Map();
  private readonly client: ApiClient;

  constructor() {
    this.client = new ApiClient();
  }

  /**
   * Obtain a bearer token for the given credentials.
   * Uses an in-memory cache keyed by email (valid for 15 min).
   */
  async getToken(email: string, password: string): Promise<string> {
    const cacheKey = `${email}:${config.apiBaseUrl}`;
    const cached = AuthService.tokenCache.get(cacheKey);

    if (cached && Date.now() < cached.expiresAt) {
      logger.debug(`Using cached token for ${email}`);
      return cached.token;
    }

    logger.info(`Authenticating: ${email}`);
    const response = await this.client.post('/api/auth/login', { email, password });

    if (response.status !== 200) {
      throw new Error(`Authentication failed: ${response.status} — ${JSON.stringify(response.body)}`);
    }

    const body = response.body as Record<string, unknown>;
    const token = (body.token ?? body.accessToken ?? body.access_token) as string;

    if (!token) {
      throw new Error('No token found in auth response');
    }

    AuthService.tokenCache.set(cacheKey, {
      token,
      expiresAt: Date.now() + 15 * 60 * 1000,   // 15 minutes
    });

    logger.info(`Authenticated successfully: ${email}`);
    return token;
  }

  /** Authenticate using the default test credentials from config */
  async getDefaultToken(): Promise<string> {
    return this.getToken(config.credentials.username, config.credentials.password);
  }

  /** Clear cached tokens (e.g., between test suites) */
  static clearCache(): void {
    AuthService.tokenCache.clear();
    logger.debug('Auth token cache cleared');
  }

  /** Build an authenticated ApiClient */
  async authenticatedClient(email?: string, password?: string): Promise<ApiClient> {
    const token = email
      ? await this.getToken(email, password ?? '')
      : await this.getDefaultToken();

    const client = new ApiClient();
    client.setAuthToken(token);
    return client;
  }
}
