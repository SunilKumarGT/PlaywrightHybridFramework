import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../hooks/world';
import { ProductsPage } from '../pages/products.page';
import { CartPage } from '../pages/cart.page';
import { CheckoutPage } from '../pages/checkout.page';
import { TestDataFactory } from '../fixtures/test-data.factory';
import { Logger } from '../utils/logger';
import config from '../../config/environments';

const logger = Logger.getInstance();

// ─── Navigation ───────────────────────────────────────────────────────────────

Given('I am on the products page', async function (this: CustomWorld) {
  const page = new ProductsPage(this.page, config.baseUrl);
  await page.navigateToProducts();
  this.setData('productsPage', page);
});

Given('I am on the cart page', async function (this: CustomWorld) {
  const page = new CartPage(this.page, config.baseUrl);
  await page.navigateToCart();
  this.setData('cartPage', page);
});

// ─── Product Browsing ─────────────────────────────────────────────────────────

When('I search for {string}', async function (this: CustomWorld, query: string) {
  const page = this.getData<ProductsPage>('productsPage') || new ProductsPage(this.page, config.baseUrl);
  await page.searchProducts(query);
});

When('I filter products by category {string}', async function (this: CustomWorld, category: string) {
  const page = this.getData<ProductsPage>('productsPage') || new ProductsPage(this.page, config.baseUrl);
  await page.filterByCategory(category);
});

When('I sort products by {string}', async function (this: CustomWorld, sortOption: string) {
  const page = this.getData<ProductsPage>('productsPage') || new ProductsPage(this.page, config.baseUrl);
  await page.sortBy(sortOption);
});

When('I filter products by price between {int} and {int}', async function (this: CustomWorld, min: number, max: number) {
  const page = this.getData<ProductsPage>('productsPage') || new ProductsPage(this.page, config.baseUrl);
  await page.filterByPriceRange(min, max);
});

When('I click on the first product', async function (this: CustomWorld) {
  const page = this.getData<ProductsPage>('productsPage') || new ProductsPage(this.page, config.baseUrl);
  await page.clickProductByIndex(0);
});

When('I click on product {string}', async function (this: CustomWorld, name: string) {
  const page = this.getData<ProductsPage>('productsPage') || new ProductsPage(this.page, config.baseUrl);
  await page.clickProductByName(name);
});

// ─── Cart ─────────────────────────────────────────────────────────────────────

When('I add the first product to the cart', async function (this: CustomWorld) {
  const page = this.getData<ProductsPage>('productsPage') || new ProductsPage(this.page, config.baseUrl);
  await page.addFirstProductToCart();
  logger.info('First product added to cart');
});

When('I add {int} products to the cart', async function (this: CustomWorld, count: number) {
  const page = this.getData<ProductsPage>('productsPage') || new ProductsPage(this.page, config.baseUrl);
  for (let i = 0; i < count; i++) {
    await page.addProductToCartByIndex(i);
  }
});

When('I remove item {int} from the cart', async function (this: CustomWorld, index: number) {
  const page = this.getData<CartPage>('cartPage') || new CartPage(this.page, config.baseUrl);
  await page.removeItemByIndex(index - 1);
});

When('I remove {string} from the cart', async function (this: CustomWorld, name: string) {
  const page = this.getData<CartPage>('cartPage') || new CartPage(this.page, config.baseUrl);
  await page.removeItemByName(name);
});

When('I apply coupon code {string}', async function (this: CustomWorld, code: string) {
  const page = this.getData<CartPage>('cartPage') || new CartPage(this.page, config.baseUrl);
  await page.applyCoupon(code);
});

When('I proceed to checkout', async function (this: CustomWorld) {
  const page = this.getData<CartPage>('cartPage') || new CartPage(this.page, config.baseUrl);
  await page.proceedToCheckout();
});

When('I complete checkout with default details', async function (this: CustomWorld) {
  const checkout = new CheckoutPage(this.page, config.baseUrl);
  await checkout.fillShippingAddress(TestDataFactory.shippingAddress());
  await checkout.continueToPayment();
  await checkout.fillPaymentDetails(TestDataFactory.paymentDetails());
  await checkout.placeOrder();
  const orderNum = await checkout.getOrderNumber();
  this.setData('orderNumber', orderNum);
  logger.info(`Order placed: ${orderNum}`);
});

// ─── Assertions ───────────────────────────────────────────────────────────────

Then('I should see {int} products', async function (this: CustomWorld, count: number) {
  const page = this.getData<ProductsPage>('productsPage') || new ProductsPage(this.page, config.baseUrl);
  const actual = await page.getProductCount();
  expect(actual).toBe(count);
});

Then('I should see at least {int} products', async function (this: CustomWorld, min: number) {
  const page = this.getData<ProductsPage>('productsPage') || new ProductsPage(this.page, config.baseUrl);
  const actual = await page.getProductCount();
  expect(actual).toBeGreaterThanOrEqual(min);
});

Then('products should be sorted by price ascending', async function (this: CustomWorld) {
  const page = this.getData<ProductsPage>('productsPage') || new ProductsPage(this.page, config.baseUrl);
  await page.assertProductsAreSortedByPriceAscending();
});

Then('the cart should have {int} item(s)', async function (this: CustomWorld, count: number) {
  const cartPage = this.getData<CartPage>('cartPage') || new CartPage(this.page, config.baseUrl);
  const actual = await cartPage.getCartItemCount();
  expect(actual).toBe(count);
});

Then('the cart should be empty', async function (this: CustomWorld) {
  const cartPage = this.getData<CartPage>('cartPage') || new CartPage(this.page, config.baseUrl);
  const isEmpty = await cartPage.isCartEmpty();
  expect(isEmpty).toBe(true);
});

Then('no results message should be visible', async function (this: CustomWorld) {
  const page = this.getData<ProductsPage>('productsPage') || new ProductsPage(this.page, config.baseUrl);
  const visible = await page.isNoResultsVisible();
  expect(visible).toBe(true);
});

Then('the order should be confirmed', async function (this: CustomWorld) {
  const checkout = new CheckoutPage(this.page, config.baseUrl);
  const confirmed = await checkout.isOrderConfirmed();
  expect(confirmed).toBe(true);
});

Then('the coupon should be applied successfully', async function (this: CustomWorld) {
  const cartPage = this.getData<CartPage>('cartPage') || new CartPage(this.page, config.baseUrl);
  const applied = await cartPage.isCouponApplied();
  expect(applied).toBe(true);
});
