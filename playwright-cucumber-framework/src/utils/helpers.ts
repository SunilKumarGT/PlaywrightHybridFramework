import * as crypto from 'crypto';

/**
 * Utility helper functions for test automation
 */

export class Helpers {
  /**
   * Wait for a given number of milliseconds
   */
  static async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Generate a unique string with optional prefix
   */
  static uniqueString(prefix = 'test'): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  }

  /**
   * Generate a random email address
   */
  static randomEmail(domain = 'test.com'): string {
    return `${this.uniqueString('user')}@${domain}`;
  }

  /**
   * Generate a random phone number
   */
  static randomPhone(): string {
    return `+91${Math.floor(7000000000 + Math.random() * 2999999999)}`;
  }

  /**
   * Generate a random integer between min and max (inclusive)
   */
  static randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Pick a random item from an array
   */
  static randomPick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  /**
   * Deep clone an object
   */
  static deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Retry an async function n times before throwing
   */
  static async retry<T>(
    fn: () => Promise<T>,
    retries = 3,
    delay = 1000,
    onError?: (err: Error, attempt: number) => void
  ): Promise<T> {
    let lastError: Error;
    for (let i = 1; i <= retries; i++) {
      try {
        return await fn();
      } catch (err) {
        lastError = err as Error;
        if (onError) onError(lastError, i);
        if (i < retries) await this.sleep(delay * i);
      }
    }
    throw lastError!;
  }

  /**
   * Format a date as YYYY-MM-DD
   */
  static formatDate(date: Date = new Date()): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Generate an MD5 hash of a string
   */
  static md5(str: string): string {
    return crypto.createHash('md5').update(str).digest('hex');
  }

  /**
   * Parse a table from Cucumber DataTable format
   */
  static parseDataTable(table: { rows: () => string[][] }): Record<string, string>[] {
    const rows = table.rows();
    const headers = rows[0];
    return rows.slice(1).map((row) =>
      headers.reduce((acc, header, i) => {
        acc[header] = row[i];
        return acc;
      }, {} as Record<string, string>)
    );
  }

  /**
   * Parse a hashes table from Cucumber DataTable format
   */
  static parseHashes(hashes: Record<string, string>[]): Record<string, string>[] {
    return hashes;
  }

  /**
   * Mask sensitive data for logging
   */
  static maskSensitive(data: unknown, keys: string[] = ['password', 'token', 'secret', 'key']): unknown {
    if (typeof data !== 'object' || data === null) return data;
    const clone = { ...data } as Record<string, unknown>;
    for (const key of Object.keys(clone)) {
      if (keys.some((k) => key.toLowerCase().includes(k))) {
        clone[key] = '***REDACTED***';
      } else if (typeof clone[key] === 'object') {
        clone[key] = this.maskSensitive(clone[key], keys);
      }
    }
    return clone;
  }

  /**
   * Convert a string to title case
   */
  static toTitleCase(str: string): string {
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /**
   * Extract JSON from a string that may contain other content
   */
  static extractJson(str: string): unknown {
    const match = str.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (!match) throw new Error('No JSON found in string');
    return JSON.parse(match[0]);
  }
}
