import { Page } from 'playwright';
import { BasePage } from './base.page';

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface PaymentDetails {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardName: string;
}

export class CheckoutPage extends BasePage {
  private readonly selectors = {
    // Shipping
    firstNameInput:  '[data-testid="shipping-first-name"], input[name="firstName"]',
    lastNameInput:   '[data-testid="shipping-last-name"],  input[name="lastName"]',
    emailInput:      '[data-testid="shipping-email"],      input[name="email"]',
    phoneInput:      '[data-testid="shipping-phone"],      input[name="phone"]',
    addressInput:    '[data-testid="shipping-address"],    input[name="address"]',
    cityInput:       '[data-testid="shipping-city"],       input[name="city"]',
    stateSelect:     '[data-testid="shipping-state"],      select[name="state"]',
    zipInput:        '[data-testid="shipping-zip"],        input[name="zip"]',
    countrySelect:   '[data-testid="shipping-country"],    select[name="country"]',
    // Payment
    cardNumberInput: '[data-testid="card-number"],  input[name="cardNumber"]',
    expiryInput:     '[data-testid="card-expiry"],  input[name="expiry"]',
    cvvInput:        '[data-testid="card-cvv"],     input[name="cvv"]',
    cardNameInput:   '[data-testid="card-name"],    input[name="cardName"]',
    paypalBtn:       '[data-testid="paypal-btn"],   .paypal-btn',
    // Order summary
    orderSummary:    '[data-testid="order-summary"], .order-summary',
    orderTotal:      '[data-testid="order-total"],   .order-total',
    placeOrderBtn:   '[data-testid="place-order"],   button.place-order, button[type="submit"].checkout',
    // Confirmation
    confirmationMsg: '[data-testid="order-confirm"], .order-confirmation, .success-page',
    orderNumber:     '[data-testid="order-number"],  .order-number, #order-id',
    // Steps
    stepShipping:    '[data-testid="step-shipping"], .step-shipping',
    stepPayment:     '[data-testid="step-payment"],  .step-payment',
    stepReview:      '[data-testid="step-review"],   .step-review',
    continueBtn:     '[data-testid="continue-btn"],  button.continue, .next-step',
  };

  constructor(page: Page, baseUrl?: string) {
    super(page, baseUrl);
  }

  async navigateToCheckout(): Promise<void> {
    await this.navigate('/checkout');
  }

  async fillShippingAddress(addr: ShippingAddress): Promise<void> {
    await this.fill(this.selectors.firstNameInput, addr.firstName);
    await this.fill(this.selectors.lastNameInput,  addr.lastName);
    await this.fill(this.selectors.emailInput,     addr.email);
    if (addr.phone) await this.fill(this.selectors.phoneInput, addr.phone);
    await this.fill(this.selectors.addressInput,   addr.address);
    await this.fill(this.selectors.cityInput,      addr.city);
    await this.selectOption(this.selectors.stateSelect,   addr.state);
    await this.fill(this.selectors.zipInput,       addr.zip);
    await this.selectOption(this.selectors.countrySelect, addr.country);
  }

  async fillPaymentDetails(payment: PaymentDetails): Promise<void> {
    await this.fill(this.selectors.cardNumberInput, payment.cardNumber);
    await this.fill(this.selectors.expiryInput,    `${payment.expiryMonth}/${payment.expiryYear}`);
    await this.fill(this.selectors.cvvInput,       payment.cvv);
    await this.fill(this.selectors.cardNameInput,  payment.cardName);
  }

  async placeOrder(): Promise<void> {
    await this.click(this.selectors.placeOrderBtn);
    await this.waitForVisible(this.selectors.confirmationMsg, 30000);
  }

  async getOrderNumber(): Promise<string> {
    return this.getText(this.selectors.orderNumber);
  }

  async getOrderTotal(): Promise<number> {
    const text = await this.getText(this.selectors.orderTotal);
    return parseFloat(text.replace(/[^0-9.]/g, ''));
  }

  async isOrderConfirmed(): Promise<boolean> {
    return this.isVisible(this.selectors.confirmationMsg);
  }

  async continueToPayment(): Promise<void> {
    await this.click(this.selectors.continueBtn);
    await this.waitForVisible(this.selectors.cardNumberInput);
  }
}
