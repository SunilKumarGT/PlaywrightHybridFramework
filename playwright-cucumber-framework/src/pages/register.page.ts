import { Page } from 'playwright';
import { BasePage } from './base.page';
import { User } from '../types';

export class RegisterPage extends BasePage {
  private readonly selectors = {
    firstNameInput:   '[data-testid="first-name"], input[name="firstName"], #firstName',
    lastNameInput:    '[data-testid="last-name"],  input[name="lastName"],  #lastName',
    emailInput:       '[data-testid="email"],       input[type="email"],     #email',
    passwordInput:    '[data-testid="password"],    input[name="password"],  #password',
    confirmPassword:  '[data-testid="confirm-password"], input[name="confirmPassword"]',
    termsCheckbox:    '[data-testid="terms"], input[name="terms"], #terms',
    submitButton:     '[data-testid="register-btn"], button[type="submit"], .register-btn',
    successMessage:   '[data-testid="success-msg"], .success-message, .alert-success',
    errorMessage:     '[data-testid="error-msg"],   .error-message,   .alert-danger, [role="alert"]',
    loginLink:        'a[href*="login"], [data-testid="login-link"]',
    passwordStrength: '[data-testid="password-strength"], .password-strength',
    emailError:       '[data-testid="email-error"], .email-error, #email-error',
    passwordError:    '[data-testid="password-error"], .password-error, #password-error',
  };

  constructor(page: Page, baseUrl?: string) {
    super(page, baseUrl);
  }

  async navigateToRegister(): Promise<void> {
    await this.navigate('/register');
  }

  async register(user: Partial<User>): Promise<void> {
    if (user.firstName) await this.fill(this.selectors.firstNameInput,  user.firstName);
    if (user.lastName)  await this.fill(this.selectors.lastNameInput,   user.lastName);
    if (user.email)     await this.fill(this.selectors.emailInput,      user.email);
    if (user.password)  await this.fill(this.selectors.passwordInput,   user.password);
    await this.click(this.selectors.submitButton);
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async registerWithConfirmation(user: Partial<User>, confirmPassword: string): Promise<void> {
    await this.register(user);
    await this.fill(this.selectors.confirmPassword, confirmPassword);
    await this.click(this.selectors.submitButton);
  }

  async acceptTerms(): Promise<void> {
    await this.check(this.selectors.termsCheckbox);
  }

  async getErrorMessage(): Promise<string> {
    await this.waitForVisible(this.selectors.errorMessage, 5000);
    return this.getText(this.selectors.errorMessage);
  }

  async getSuccessMessage(): Promise<string> {
    await this.waitForVisible(this.selectors.successMessage, 10000);
    return this.getText(this.selectors.successMessage);
  }

  async getEmailError(): Promise<string> {
    return this.getText(this.selectors.emailError);
  }

  async getPasswordStrength(): Promise<string> {
    return this.getText(this.selectors.passwordStrength);
  }

  async isSubmitButtonEnabled(): Promise<boolean> {
    return this.isEnabled(this.selectors.submitButton);
  }

  async clickLoginLink(): Promise<void> {
    await this.click(this.selectors.loginLink);
  }
}
