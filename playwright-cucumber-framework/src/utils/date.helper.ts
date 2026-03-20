/**
 * Date and time utilities for test automation.
 * Avoids external dependencies — uses the native Date API only.
 */
export class DateHelper {
  // ─── Formatting ─────────────────────────────────────────────────────────────

  /** 'YYYY-MM-DD' */
  static today(): string {
    return new Date().toISOString().split('T')[0];
  }

  /** 'YYYY-MM-DDTHH:mm:ss.sssZ' */
  static nowIso(): string {
    return new Date().toISOString();
  }

  /** Format as 'YYYY-MM-DD' */
  static format(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /** Format as human-readable: 'Mar 20, 2026' */
  static formatHuman(date: Date, locale = 'en-US'): string {
    return date.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  /** Format as 'YYYY-MM-DD HH:mm:ss' */
  static formatDateTime(date: Date = new Date()): string {
    const d   = date.toISOString();
    const day = d.split('T')[0];
    const time= d.split('T')[1].substring(0, 8);
    return `${day} ${time}`;
  }

  // ─── Relative dates ──────────────────────────────────────────────────────────

  /** Add/subtract days from a date */
  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /** 'YYYY-MM-DD' N days from today */
  static daysFromToday(days: number): string {
    return DateHelper.format(DateHelper.addDays(new Date(), days));
  }

  /** 'YYYY-MM-DD' N days in the past */
  static daysAgo(days: number): string {
    return DateHelper.daysFromToday(-days);
  }

  /** Expiry date string 'MM/YY' for credit card (always future) */
  static futureCardExpiry(yearsAhead = 3): string {
    const future = DateHelper.addDays(new Date(), yearsAhead * 365);
    const month  = String(future.getMonth() + 1).padStart(2, '0');
    const year   = String(future.getFullYear()).slice(-2);
    return `${month}/${year}`;
  }

  // ─── Parsing ─────────────────────────────────────────────────────────────────

  /** Parse an ISO date string safely, returns null on failure */
  static parseIso(dateStr: string): Date | null {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  }

  // ─── Comparisons ─────────────────────────────────────────────────────────────

  /** True if dateStr represents a date in the past */
  static isInPast(dateStr: string): boolean {
    const d = DateHelper.parseIso(dateStr);
    return d !== null && d < new Date();
  }

  /** True if dateStr represents a date in the future */
  static isInFuture(dateStr: string): boolean {
    const d = DateHelper.parseIso(dateStr);
    return d !== null && d > new Date();
  }

  /** Difference in days between two dates (b − a) */
  static daysBetween(a: Date, b: Date): number {
    return Math.round((b.getTime() - a.getTime()) / 86_400_000);
  }

  // ─── Timestamps ──────────────────────────────────────────────────────────────

  /** Unix timestamp in seconds */
  static unixNow(): number {
    return Math.floor(Date.now() / 1000);
  }

  /** Convert a Unix timestamp (seconds) to a Date */
  static fromUnix(ts: number): Date {
    return new Date(ts * 1000);
  }

  // ─── Test-specific ────────────────────────────────────────────────────────────

  /**
   * Assert that a date string is recent (within the last N seconds).
   * Useful for verifying `createdAt` fields in API responses.
   */
  static assertRecent(dateStr: string, withinSeconds = 60): void {
    const d = DateHelper.parseIso(dateStr);
    if (!d) throw new Error(`"${dateStr}" is not a valid date`);
    const diffSeconds = (Date.now() - d.getTime()) / 1000;
    if (diffSeconds > withinSeconds || diffSeconds < -5) {
      throw new Error(
        `Expected "${dateStr}" to be within ${withinSeconds}s of now, but was ${Math.round(diffSeconds)}s away`
      );
    }
  }

  /**
   * Assert a date string is in ISO 8601 format.
   */
  static assertIso8601(dateStr: string): void {
    const iso8601 = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2}))?$/;
    if (!iso8601.test(dateStr)) {
      throw new Error(`"${dateStr}" is not a valid ISO 8601 date`);
    }
  }
}
