import { Given, After } from '@cucumber/cucumber';
import { CustomWorld } from '../hooks/world';
import { DatabaseHelper } from '../utils/database.helper';
import { TestDataFactory } from '../fixtures/test-data.factory';
import { Logger } from '../utils/logger';

const logger = Logger.getInstance();

// ─── Connection ───────────────────────────────────────────────────────────────

Given('the database is connected', async function (this: CustomWorld) {
  await DatabaseHelper.connect();
  this.setData('dbConnected', true);
  logger.info('Database connected for test');
});

// ─── User Seeding ─────────────────────────────────────────────────────────────

Given('a user exists with email {string} and password {string}', async function (
  this: CustomWorld,
  email: string,
  password: string
) {
  const userId = await DatabaseHelper.seedUser({ email, password });
  const seeded  = this.getData<string[]>('seededUserIds') ?? [];
  seeded.push(userId);
  this.setData('seededUserIds', seeded);
  this.setData('seededUserEmail', email);
  logger.info(`Seeded user ${email} (id: ${userId})`);
});

Given('a locked user exists with email {string}', async function (
  this: CustomWorld,
  email: string
) {
  const userId = await DatabaseHelper.seedUser({
    email,
    password: 'Locked@1234',
    status: 'locked',
  });
  const seeded = this.getData<string[]>('seededUserIds') ?? [];
  seeded.push(userId);
  this.setData('seededUserIds', seeded);
  logger.info(`Seeded locked user: ${email}`);
});

Given('an admin user exists with email {string}', async function (
  this: CustomWorld,
  email: string
) {
  const userId = await DatabaseHelper.seedUser({
    email,
    password: 'Admin@1234',
    role:     'admin',
  });
  const seeded = this.getData<string[]>('seededUserIds') ?? [];
  seeded.push(userId);
  this.setData('seededUserIds', seeded);
});

// ─── Product Seeding ──────────────────────────────────────────────────────────

Given('a product exists with name {string} and price {float}', async function (
  this: CustomWorld,
  name: string,
  price: number
) {
  const productId = await DatabaseHelper.seedProduct({ name, price });
  const seeded    = this.getData<string[]>('seededProductIds') ?? [];
  seeded.push(productId);
  this.setData('seededProductIds', seeded);
  this.setData('seededProductId', productId);
  logger.info(`Seeded product "${name}" (id: ${productId})`);
});

Given('{int} products exist in category {string}', async function (
  this: CustomWorld,
  count: number,
  category: string
) {
  const seeded = this.getData<string[]>('seededProductIds') ?? [];
  for (let i = 0; i < count; i++) {
    const product = TestDataFactory.product({ category });
    const id      = await DatabaseHelper.seedProduct(product);
    seeded.push(id);
  }
  this.setData('seededProductIds', seeded);
  logger.info(`Seeded ${count} products in category "${category}"`);
});

// ─── Verification ─────────────────────────────────────────────────────────────

Given('the database has no users with email {string}', async function (
  this: CustomWorld,
  email: string
) {
  await DatabaseHelper.deleteUser(email);
  logger.info(`Ensured no user exists with email: ${email}`);
});

// ─── Cleanup (runs after each @db-cleanup tagged scenario) ───────────────────

After({ tags: '@db-cleanup' }, async function (this: CustomWorld) {
  // Clean up seeded users
  const userIds = this.getData<string[]>('seededUserIds') ?? [];
  const userEmail = this.getData<string>('seededUserEmail');
  if (userEmail) await DatabaseHelper.deleteUser(userEmail).catch(() => {});

  // Clean up seeded products
  const productIds = this.getData<string[]>('seededProductIds') ?? [];
  for (const id of productIds) {
    await DatabaseHelper.deleteProduct(id).catch(() => {});
  }

  if (userIds.length || productIds.length) {
    logger.info(
      `DB cleanup: removed ${userIds.length} user(s), ${productIds.length} product(s)`
    );
  }
});
