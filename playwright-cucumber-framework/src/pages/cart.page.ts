import { Page } from 'playwright';
import { expect } from '@playwright/test';
import { BasePage } from './base.page';

export class CartPage extends BasePage {
  private readonly selectors = {
    cartItem:        '[data-testid="cart-item"],     .cart-item,       .cart-row',
    itemName:        '[data-testid="item-name"],     .item-name,       .cart-product-name',
    itemPrice:       '[data-testid="item-price"],    .item-price,      .cart-price',
    itemQty:         '[data-testid="item-qty"],      input.quantity,   input[name="quantity"]',
    removeItemBtn:   '[data-testid="remove-item"],   .remove-item,     button.remove',
    increaseQtyBtn:  '[data-testid="qty-increase"],  .qty-increase,    button.plus',
    decreaseQtyBtn:  '[data-testid="qty-decrease"],  .qty-decrease,    button.minus',
    subtotal:        '[data-testid="subtotal"],      .subtotal,        .cart-subtotal',
    totalAmount:     '[data-testid="total"],         .cart-total,      .order-total',
    checkoutBtn:     '[data-testid="checkout-btn"],  .checkout-btn,    button.proceed-checkout',
    continueShopBtn: '[data-testid="continue-shop"], .continue-shopping, a.back-to-shop',
    emptyCartMsg:    '[data-testid="empty-cart"],    .empty-cart,      .cart-empty-message',
    couponInput:     '[data-testid="coupon-input"],  input[name="coupon"], #coupon',
    applyCouponBtn:  '[data-testid="apply-coupon"],  .apply-coupon,    button.coupon-btn',
    couponSuccess:   '[data-testid="coupon-msg"],    .coupon-success,  .discount-applied',
    discount:        '[data-testid="discount"],      .discount-amount, .coupon-discount',
  };

  constructor(page: Page, baseUrl?: string) {
    super(page, baseUrl);
  }

  async navigateToCart(): Promise<void> {
    await this.navigate('/cart');
  }

  async getCartItemCount(): Promise<number> {
    return this.getCount(this.selectors.cartItem);
  }

  async getItemNames(): Promise<string[]> {
    return this.getAllTexts(this.selectors.itemName);
  }

  async getTotal(): Promise<number> {
    const text = await this.getText(this.selectors.totalAmount);
    return parseFloat(text.replace(/[^0-9.]/g, ''));
  }

  async removeItemByIndex(index: number): Promise<void> {
    const btns = this.page.locator(this.selectors.removeItemBtn);
    await btns.nth(index).click();
    await this.page.waitForLoadState('networkidle');
  }

  async removeItemByName(name: string): Promise<void> {
    const item = this.page.locator(this.selectors.cartItem).filter({ hasText: name });
    await item.locator(this.selectors.removeItemBtn).click();
    await this.page.waitForLoadState('networkidle');
  }

  async updateQuantity(index: number, qty: number): Promise<void> {
    const inputs = this.page.locator(this.selectors.itemQty);
    await inputs.nth(index).fill(String(qty));
    await this.pressKey('Enter');
    await this.page.waitForLoadState('networkidle');
  }

  async applyCoupon(code: string): Promise<void> {
    await this.fill(this.selectors.couponInput, code);
    await this.click(this.selectors.applyCouponBtn);
    await this.page.waitForLoadState('networkidle');
  }

  async isCouponApplied(): Promise<boolean> {
    return this.isVisible(this.selectors.couponSuccess);
  }

  async proceedToCheckout(): Promise<void> {
    await this.click(this.selectors.checkoutBtn);
    await this.waitForNavigation();
  }

  async isCartEmpty(): Promise<boolean> {
    return this.isVisible(this.selectors.emptyCartMsg);
  }

  async continueShopping(): Promise<void> {
    await this.click(this.selectors.continueShopBtn);
    await this.waitForNavigation();
  }

  async assertItemInCart(name: string): Promise<void> {
    const names = await this.getItemNames();
    expect(names.some((n) => n.includes(name))).toBe(true);
  }
}
