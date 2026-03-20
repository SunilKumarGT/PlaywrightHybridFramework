import { Browser, BrowserContext, Page } from 'playwright';

// ─── World / Context Types ─────────────────────────────────────────────────────

export interface CustomWorld {
  browser: Browser;
  context: BrowserContext;
  page: Page;
  scenarioName: string;
  scenarioTags: string[];
  testData: Record<string, unknown>;
  apiResponse: ApiResponse | null;
  aiAnalysisResult: AiAnalysisResult | null;
  screenshotPath?: string;
}

// ─── API Types ─────────────────────────────────────────────────────────────────

export interface ApiResponse {
  status: number;
  statusText: string;
  body: unknown;
  headers: Record<string, string>;
  duration: number;
}

export interface ApiRequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  headers?: Record<string, string>;
  body?: unknown;
  queryParams?: Record<string, string>;
  timeout?: number;
  auth?: {
    type: 'bearer' | 'basic' | 'apiKey';
    token?: string;
    username?: string;
    password?: string;
    key?: string;
    value?: string;
    in?: 'header' | 'query';
  };
}

// ─── AI Types ──────────────────────────────────────────────────────────────────

export interface AiAnalysisResult {
  analysis: string;
  confidence: number;
  suggestions: string[];
  issues: AiIssue[];
  metadata: Record<string, unknown>;
}

export interface AiIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  location?: string;
  recommendation: string;
}

export interface AiTestCase {
  title: string;
  description: string;
  steps: string[];
  expectedResult: string;
  tags: string[];
  priority: 'high' | 'medium' | 'low';
}

export interface AiAccessibilityReport {
  score: number;
  issues: AiIssue[];
  wcagViolations: WcagViolation[];
  recommendations: string[];
}

export interface WcagViolation {
  criterion: string;
  level: 'A' | 'AA' | 'AAA';
  description: string;
  elements: string[];
}

// ─── Page Object Types ─────────────────────────────────────────────────────────

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface FormField {
  selector: string;
  value: string;
  type?: 'text' | 'select' | 'checkbox' | 'radio' | 'file';
}

// ─── Test Data Types ───────────────────────────────────────────────────────────

export interface User {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role?: string;
  status?: 'active' | 'inactive';
}

export interface Product {
  id?: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  stock?: number;
}

// ─── Reporting Types ───────────────────────────────────────────────────────────

export interface TestResult {
  scenarioName: string;
  status: 'passed' | 'failed' | 'skipped' | 'pending';
  duration: number;
  errorMessage?: string;
  screenshotPath?: string;
  tags: string[];
  steps: StepResult[];
}

export interface StepResult {
  keyword: string;
  text: string;
  status: 'passed' | 'failed' | 'skipped' | 'pending';
  duration: number;
  errorMessage?: string;
}
