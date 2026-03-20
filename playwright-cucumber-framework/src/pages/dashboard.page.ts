import { Page } from 'playwright';
import { BasePage } from './base.page';

export class DashboardPage extends BasePage {
  private readonly selectors = {
    welcomeMessage: '[data-testid="welcome-msg"], .welcome-message, h1.greeting',
    userAvatar: '[data-testid="user-avatar"], .user-avatar, .avatar',
    userMenu: '[data-testid="user-menu"], .user-dropdown, #user-menu',
    logoutButton: '[data-testid="logout-btn"], .logout-btn, button[aria-label*="logout"]',
    navMenu: '[data-testid="nav-menu"], nav, .sidebar',
    notificationBell: '[data-testid="notifications"], .notification-bell',
    notificationCount: '[data-testid="notification-count"], .badge',
    searchBar: '[data-testid="search-input"], input[type="search"], .search-input',
    pageLoader: '[data-testid="page-loader"], .page-loading',
    statsCard: '[data-testid="stats-card"], .stats-card, .metric-card',
  };

  constructor(page: Page, baseUrl?: string) {
    super(page, baseUrl);
  }

  async navigateToDashboard(): Promise<void> {
    await this.navigate('/dashboard');
  }

  async getWelcomeMessage(): Promise<string> {
    await this.waitForVisible(this.selectors.welcomeMessage, 10000);
    return this.getText(this.selectors.welcomeMessage);
  }

  async isLoggedIn(): Promise<boolean> {
    const url = await this.getCurrentUrl();
    return !url.includes('/login') && !url.includes('/signin');
  }

  async logout(): Promise<void> {
    await this.click(this.selectors.userMenu);
    await this.waitForVisible(this.selectors.logoutButton);
    await this.click(this.selectors.logoutButton);
    await this.waitForUrl(/login|signin/);
  }

  async getNotificationCount(): Promise<number> {
    const text = await this.getText(this.selectors.notificationCount);
    return parseInt(text) || 0;
  }

  async search(query: string): Promise<void> {
    await this.fill(this.selectors.searchBar, query);
    await this.pressKey('Enter');
    await this.waitForNavigation();
  }

  async getStatsCardCount(): Promise<number> {
    return this.getCount(this.selectors.statsCard);
  }

  async navigateTo(menuItem: string): Promise<void> {
    await this.click(`text=${menuItem}`);
    await this.waitForNavigation();
  }
}
