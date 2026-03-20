import { Page } from 'playwright';
import { BasePage } from './base.page';
import { LoginCredentials } from '../types';
import { Logger } from '../utils/logger';

const logger = Logger.getInstance();

export class LoginPage extends BasePage {
  // ─── Selectors ────────────────────────────────────────────────────────────────
  private readonly selectors = {
    usernameInput: '[data-testid="username-input"], #username, input[name="email"], input[type="email"]',
    passwordInput: '[data-testid="password-input"], #password, input[name="password"], input[type="password"]',
    loginButton: '[data-testid="login-btn"], button[type="submit"], .login-btn, #login-button',
    errorMessage: '[data-testid="error-msg"], .error-message, .alert-danger, [role="alert"]',
    rememberMe: '[data-testid="remember-me"], input[name="rememberMe"], #remember-me',
    forgotPasswordLink: 'a[href*="forgot"], [data-testid="forgot-password"]',
    registerLink: 'a[href*="register"], a[href*="signup"], [data-testid="register-link"]',
    socialLoginGoogle: '[data-testid="google-login"], .google-btn, [aria-label*="Google"]',
    socialLoginGithub: '[data-testid="github-login"], .github-btn, [aria-label*="GitHub"]',
    loadingSpinner: '[data-testid="loading"], .spinner, .loading-indicator',
    pageTitle: 'h1, h2, .page-title, [data-testid="page-title"]',
  };

  constructor(page: Page, baseUrl?: string) {
    super(page, baseUrl);
  }

  async navigateToLogin(): Promise<void> {
    await this.navigate('/login');
    logger.info('Navigated to login page');
  }

  async login(credentials: LoginCredentials): Promise<void> {
    logger.info(`Logging in as: ${credentials.username}`);
    await this.fill(this.selectors.usernameInput, credentials.username);
    await this.fill(this.selectors.passwordInput, credentials.password);
    await this.click(this.selectors.loginButton);
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async loginWithRememberMe(credentials: LoginCredentials): Promise<void> {
    await this.fill(this.selectors.usernameInput, credentials.username);
    await this.fill(this.selectors.passwordInput, credentials.password);
    await this.check(this.selectors.rememberMe);
    await this.click(this.selectors.loginButton);
  }

  async getErrorMessage(): Promise<string> {
    await this.waitForVisible(this.selectors.errorMessage, 5000);
    return this.getText(this.selectors.errorMessage);
  }

  async isErrorVisible(): Promise<boolean> {
    return this.isVisible(this.selectors.errorMessage);
  }

  async clickForgotPassword(): Promise<void> {
    await this.click(this.selectors.forgotPasswordLink);
  }

  async clickRegister(): Promise<void> {
    await this.click(this.selectors.registerLink);
  }

  async isLoginButtonEnabled(): Promise<boolean> {
    return this.isEnabled(this.selectors.loginButton);
  }

  async clearCredentials(): Promise<void> {
    await this.clear(this.selectors.usernameInput);
    await this.clear(this.selectors.passwordInput);
  }

  async isOnLoginPage(): Promise<boolean> {
    const url = await this.getCurrentUrl();
    return url.includes('/login') || url.includes('/signin');
  }
}
