import { Helpers } from '../utils/helpers';
import { User, Product } from '../types';
import { ShippingAddress, PaymentDetails } from '../pages/checkout.page';

/**
 * Test data factory — generates realistic, unique test data for each run.
 * Uses deterministic seeds when needed for reproducibility.
 */
export class TestDataFactory {

  // ─── Users ────────────────────────────────────────────────────────────────

  static user(overrides: Partial<User> = {}): User {
    const id = Helpers.uniqueString('u');
    return {
      firstName: 'Test',
      lastName:  'User',
      email:     Helpers.randomEmail(),
      password:  'Test@1234!',
      role:      'user',
      status:    'active',
      ...overrides,
    };
  }

  static adminUser(overrides: Partial<User> = {}): User {
    return TestDataFactory.user({ role: 'admin', ...overrides });
  }

  static inactiveUser(overrides: Partial<User> = {}): User {
    return TestDataFactory.user({ status: 'inactive', ...overrides });
  }

  static userWithWeakPassword(): User {
    return TestDataFactory.user({ password: '1234' });
  }

  static userWithInvalidEmail(): User {
    return TestDataFactory.user({ email: 'not-an-email' });
  }

  // ─── Products ─────────────────────────────────────────────────────────────

  static product(overrides: Partial<Product> = {}): Product {
    const categories = ['electronics', 'clothing', 'books', 'home', 'sports'];
    return {
      name:        `Product ${Helpers.uniqueString('p')}`,
      description: 'A high-quality test product for automated testing',
      price:       parseFloat((Math.random() * 500 + 1).toFixed(2)),
      category:    Helpers.randomPick(categories),
      stock:       Helpers.randomInt(1, 999),
      ...overrides,
    };
  }

  static expensiveProduct(): Product {
    return TestDataFactory.product({ price: 9999.99 });
  }

  static freeProduct(): Product {
    return TestDataFactory.product({ price: 0 });
  }

  static outOfStockProduct(): Product {
    return TestDataFactory.product({ stock: 0 });
  }

  // ─── Addresses ────────────────────────────────────────────────────────────

  static shippingAddress(overrides: Partial<ShippingAddress> = {}): ShippingAddress {
    return {
      firstName: 'John',
      lastName:  'Doe',
      email:     Helpers.randomEmail(),
      phone:     Helpers.randomPhone(),
      address:   `${Helpers.randomInt(1, 999)} Test Street`,
      city:      'Chennai',
      state:     'Tamil Nadu',
      zip:       '600001',
      country:   'IN',
      ...overrides,
    };
  }

  // ─── Payment ──────────────────────────────────────────────────────────────

  /** Stripe/generic test card numbers */
  static paymentDetails(overrides: Partial<PaymentDetails> = {}): PaymentDetails {
    return {
      cardNumber:   '4242 4242 4242 4242',
      expiryMonth:  '12',
      expiryYear:   '26',
      cvv:          '123',
      cardName:     'John Doe',
      ...overrides,
    };
  }

  static declinedCard(): PaymentDetails {
    return TestDataFactory.paymentDetails({ cardNumber: '4000 0000 0000 0002' });
  }

  static insufficientFundsCard(): PaymentDetails {
    return TestDataFactory.paymentDetails({ cardNumber: '4000 0000 0000 9995' });
  }

  // ─── API Payloads ─────────────────────────────────────────────────────────

  static createUserPayload(overrides: Partial<User> = {}): Record<string, unknown> {
    const user = TestDataFactory.user(overrides);
    const { status, ...payload } = user;
    return payload as Record<string, unknown>;
  }

  static createProductPayload(overrides: Partial<Product> = {}): Record<string, unknown> {
    const product = TestDataFactory.product(overrides);
    const { id, ...payload } = product;
    return payload as Record<string, unknown>;
  }

  static loginPayload(email?: string, password?: string): Record<string, string> {
    return {
      email:    email    ?? 'testuser@example.com',
      password: password ?? 'Test@1234!',
    };
  }

  // ─── Bulk generation ──────────────────────────────────────────────────────

  static users(count: number, overrides: Partial<User> = {}): User[] {
    return Array.from({ length: count }, () => TestDataFactory.user(overrides));
  }

  static products(count: number, overrides: Partial<Product> = {}): Product[] {
    return Array.from({ length: count }, () => TestDataFactory.product(overrides));
  }

  // ─── Search queries ───────────────────────────────────────────────────────

  static searchQueries() {
    return {
      valid:       'laptop',
      noResults:   'xyznonexistentproduct12345',
      specialChars: '<script>alert(1)</script>',
      longQuery:   'a'.repeat(200),
      sqlInjection: "' OR '1'='1",
    };
  }
}
