import { Page } from 'playwright';
import { expect } from '@playwright/test';
import { BasePage } from './base.page';

export class ProductsPage extends BasePage {
  private readonly selectors = {
    productGrid:       '[data-testid="product-grid"],  .product-grid,   .products-list',
    productCard:       '[data-testid="product-card"],  .product-card,   .product-item',
    productTitle:      '[data-testid="product-title"], .product-title,  .product-name',
    productPrice:      '[data-testid="product-price"], .product-price,  .price',
    productImage:      '[data-testid="product-img"],   .product-image   img',
    addToCartBtn:      '[data-testid="add-to-cart"],   .add-to-cart,    button.cart-btn',
    cartCount:         '[data-testid="cart-count"],    .cart-badge,     .cart-count',
    cartIcon:          '[data-testid="cart-icon"],     .cart-icon,      #cart',
    searchInput:       '[data-testid="search"],        input[type="search"], .search-input',
    categoryFilter:    '[data-testid="category-filter"], .category-filter, select[name="category"]',
    sortDropdown:      '[data-testid="sort-by"],       select[name="sort"], .sort-dropdown',
    pagination:        '[data-testid="pagination"],    .pagination',
    nextPageBtn:       '[data-testid="next-page"],     .pagination .next, a[aria-label="Next"]',
    prevPageBtn:       '[data-testid="prev-page"],     .pagination .prev, a[aria-label="Previous"]',
    noResultsMsg:      '[data-testid="no-results"],    .no-results,     .empty-state',
    loadingSpinner:    '[data-testid="loading"],       .spinner',
    priceRangeMin:     '[data-testid="price-min"],     input[name="priceMin"]',
    priceRangeMax:     '[data-testid="price-max"],     input[name="priceMax"]',
    applyFilterBtn:    '[data-testid="apply-filter"],  .apply-filter,   button.filter-btn',
    productDetailName: '[data-testid="detail-name"],   .product-detail  h1',
    productDetailDesc: '[data-testid="detail-desc"],   .product-description',
    breadcrumb:        '[data-testid="breadcrumb"],    .breadcrumb,     nav[aria-label="breadcrumb"]',
    wishlistBtn:       '[data-testid="wishlist"],      .wishlist-btn,   button.favourite',
    stockStatus:       '[data-testid="stock-status"],  .stock-status,   .availability',
  };

  constructor(page: Page, baseUrl?: string) {
    super(page, baseUrl);
  }

  async navigateToProducts(): Promise<void> {
    await this.navigate('/products');
  }

  async searchProducts(query: string): Promise<void> {
    await this.fill(this.selectors.searchInput, query);
    await this.pressKey('Enter');
    await this.waitForNavigation();
  }

  async filterByCategory(category: string): Promise<void> {
    await this.selectOption(this.selectors.categoryFilter, category);
    await this.page.waitForLoadState('networkidle');
  }

  async sortBy(option: string): Promise<void> {
    await this.selectOption(this.selectors.sortDropdown, option);
    await this.page.waitForLoadState('networkidle');
  }

  async filterByPriceRange(min: number, max: number): Promise<void> {
    await this.fill(this.selectors.priceRangeMin, String(min));
    await this.fill(this.selectors.priceRangeMax, String(max));
    await this.click(this.selectors.applyFilterBtn);
    await this.page.waitForLoadState('networkidle');
  }

  async getProductCount(): Promise<number> {
    return this.getCount(this.selectors.productCard);
  }

  async getProductTitles(): Promise<string[]> {
    return this.getAllTexts(this.selectors.productTitle);
  }

  async getProductPrices(): Promise<number[]> {
    const texts = await this.getAllTexts(this.selectors.productPrice);
    return texts.map((t) => parseFloat(t.replace(/[^0-9.]/g, '')));
  }

  async addFirstProductToCart(): Promise<void> {
    const btns = this.page.locator(this.selectors.addToCartBtn);
    await btns.first().click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async addProductToCartByIndex(index: number): Promise<void> {
    const btns = this.page.locator(this.selectors.addToCartBtn);
    await btns.nth(index).click();
  }

  async getCartCount(): Promise<number> {
    const text = await this.getText(this.selectors.cartCount);
    return parseInt(text) || 0;
  }

  async openCart(): Promise<void> {
    await this.click(this.selectors.cartIcon);
    await this.waitForNavigation();
  }

  async clickProductByName(name: string): Promise<void> {
    await this.click(`text=${name}`);
    await this.waitForNavigation();
  }

  async clickProductByIndex(index: number): Promise<void> {
    const cards = this.page.locator(this.selectors.productCard);
    await cards.nth(index).click();
    await this.waitForNavigation();
  }

  async goToNextPage(): Promise<void> {
    await this.click(this.selectors.nextPageBtn);
    await this.waitForNavigation();
  }

  async isNoResultsVisible(): Promise<boolean> {
    return this.isVisible(this.selectors.noResultsMsg);
  }

  async assertProductsAreSortedByPriceAscending(): Promise<void> {
    const prices = await this.getProductPrices();
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
    }
  }

  async getProductDetailName(): Promise<string> {
    return this.getText(this.selectors.productDetailName);
  }

  async getStockStatus(): Promise<string> {
    return this.getText(this.selectors.stockStatus);
  }

  async addToWishlist(): Promise<void> {
    await this.click(this.selectors.wishlistBtn);
  }
}
