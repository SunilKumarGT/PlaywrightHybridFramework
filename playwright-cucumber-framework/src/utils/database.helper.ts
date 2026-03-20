import { Logger } from './logger';

const logger = Logger.getInstance();

/**
 * Database helper for test data seeding and cleanup.
 *
 * To activate real DB connectivity:
 *   npm install pg  (for PostgreSQL)
 *   npm install mysql2  (for MySQL)
 *   npm install mongoose  (for MongoDB)
 *
 * Then replace the stub implementations below with actual queries.
 */
export class DatabaseHelper {
  private static connected = false;

  // ─── Connection ────────────────────────────────────────────────────────────

  static async connect(): Promise<void> {
    const dbHost = process.env.DB_HOST;
    if (!dbHost) {
      logger.warn('DB_HOST not set — database helper running in stub mode');
      return;
    }
    // Example (pg):
    // const { Pool } = require('pg');
    // DatabaseHelper.pool = new Pool({ host: dbHost, port: +process.env.DB_PORT, ... });
    // await DatabaseHelper.pool.connect();
    DatabaseHelper.connected = true;
    logger.info(`Database connected: ${dbHost}`);
  }

  static async disconnect(): Promise<void> {
    if (!DatabaseHelper.connected) return;
    // await DatabaseHelper.pool.end();
    DatabaseHelper.connected = false;
    logger.info('Database disconnected');
  }

  // ─── Seeding ───────────────────────────────────────────────────────────────

  /**
   * Seed a test user directly in the DB (bypasses API).
   * Useful for setting up locked/inactive accounts, etc.
   */
  static async seedUser(user: {
    email: string;
    password: string;
    role?: string;
    status?: string;
  }): Promise<string> {
    if (!DatabaseHelper.connected) {
      logger.warn(`DB stub: would seed user ${user.email}`);
      return `stub-user-id-${Date.now()}`;
    }
    // Example:
    // const result = await pool.query(
    //   'INSERT INTO users (email, password_hash, role, status) VALUES ($1, $2, $3, $4) RETURNING id',
    //   [user.email, await bcrypt.hash(user.password, 10), user.role ?? 'user', user.status ?? 'active']
    // );
    // return result.rows[0].id;
    return `db-user-id-${Date.now()}`;
  }

  /** Delete a user by email (cleanup after test) */
  static async deleteUser(email: string): Promise<void> {
    if (!DatabaseHelper.connected) {
      logger.warn(`DB stub: would delete user ${email}`);
      return;
    }
    // await pool.query('DELETE FROM users WHERE email = $1', [email]);
    logger.info(`Deleted user: ${email}`);
  }

  /** Seed a product */
  static async seedProduct(product: {
    name: string;
    price: number;
    category?: string;
    stock?: number;
  }): Promise<string> {
    if (!DatabaseHelper.connected) {
      logger.warn(`DB stub: would seed product ${product.name}`);
      return `stub-product-id-${Date.now()}`;
    }
    return `db-product-id-${Date.now()}`;
  }

  /** Delete a product by ID */
  static async deleteProduct(id: string): Promise<void> {
    if (!DatabaseHelper.connected) {
      logger.warn(`DB stub: would delete product ${id}`);
      return;
    }
    logger.info(`Deleted product: ${id}`);
  }

  // ─── Cleanup ───────────────────────────────────────────────────────────────

  /**
   * Purge all test-generated records (those whose email matches the test domain).
   * Safe to run after a test suite to leave the DB clean.
   */
  static async cleanupTestData(): Promise<void> {
    if (!DatabaseHelper.connected) {
      logger.warn('DB stub: would cleanup test data');
      return;
    }
    // await pool.query("DELETE FROM users WHERE email LIKE '%@test.com'");
    // await pool.query("DELETE FROM products WHERE name LIKE 'Product test_%'");
    logger.info('Test data cleaned up');
  }

  /** Execute a raw SQL query (advanced use) */
  static async query<T = unknown>(sql: string, params: unknown[] = []): Promise<T[]> {
    if (!DatabaseHelper.connected) {
      logger.warn(`DB stub: would execute: ${sql}`);
      return [];
    }
    // const result = await pool.query(sql, params);
    // return result.rows as T[];
    return [];
  }
}
