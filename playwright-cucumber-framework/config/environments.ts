import * as dotenv from 'dotenv';
dotenv.config();

export interface EnvironmentConfig {
  baseUrl: string;
  apiBaseUrl: string;
  apiKey?: string;
  authToken?: string;
  credentials: {
    username: string;
    password: string;
  };
  timeouts: {
    default: number;
    navigation: number;
    api: number;
  };
  ai: {
    apiKey: string;
    model: string;
    maxTokens: number;
  };
}

const environments: Record<string, EnvironmentConfig> = {
  local: {
    baseUrl: 'http://localhost:3000',
    apiBaseUrl: 'http://localhost:8080/api',
    credentials: {
      username: process.env.TEST_USERNAME || 'admin@local.com',
      password: process.env.TEST_PASSWORD || 'Admin@123',
    },
    timeouts: { default: 15000, navigation: 30000, api: 10000 },
    ai: {
      apiKey: process.env.ANTHROPIC_API_KEY || '',
      model: process.env.AI_MODEL || 'claude-sonnet-4-20250514',
      maxTokens: parseInt(process.env.AI_MAX_TOKENS || '2048'),
    },
  },
  staging: {
    baseUrl: process.env.BASE_URL || 'https://staging.your-app.com',
    apiBaseUrl: process.env.API_BASE_URL || 'https://staging-api.your-app.com',
    apiKey: process.env.API_KEY,
    authToken: process.env.AUTH_TOKEN,
    credentials: {
      username: process.env.TEST_USERNAME || '',
      password: process.env.TEST_PASSWORD || '',
    },
    timeouts: { default: 30000, navigation: 60000, api: 20000 },
    ai: {
      apiKey: process.env.ANTHROPIC_API_KEY || '',
      model: process.env.AI_MODEL || 'claude-sonnet-4-20250514',
      maxTokens: parseInt(process.env.AI_MAX_TOKENS || '2048'),
    },
  },
  production: {
    baseUrl: process.env.BASE_URL || 'https://your-app.com',
    apiBaseUrl: process.env.API_BASE_URL || 'https://api.your-app.com',
    apiKey: process.env.API_KEY,
    authToken: process.env.AUTH_TOKEN,
    credentials: {
      username: process.env.TEST_USERNAME || '',
      password: process.env.TEST_PASSWORD || '',
    },
    timeouts: { default: 30000, navigation: 60000, api: 20000 },
    ai: {
      apiKey: process.env.ANTHROPIC_API_KEY || '',
      model: process.env.AI_MODEL || 'claude-sonnet-4-20250514',
      maxTokens: parseInt(process.env.AI_MAX_TOKENS || '2048'),
    },
  },
};

const env = process.env.ENV || 'staging';
export const config: EnvironmentConfig = environments[env] || environments.staging;
export default config;
