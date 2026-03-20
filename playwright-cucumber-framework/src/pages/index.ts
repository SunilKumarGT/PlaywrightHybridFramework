// ─── Page Object barrel export ────────────────────────────────────────────────
// Import all page objects from one place:
//   import { LoginPage, ProductsPage, CartPage } from '../pages';

export { BasePage } from './base.page';
export { LoginPage } from './login.page';
export { RegisterPage } from './register.page';
export { DashboardPage } from './dashboard.page';
export { ProductsPage } from './products.page';
export { CartPage } from './cart.page';
export { CheckoutPage, type ShippingAddress, type PaymentDetails } from './checkout.page';
export { ProfilePage } from './profile.page';
