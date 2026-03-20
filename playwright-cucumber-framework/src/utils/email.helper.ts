import { ApiClient } from '../api/api.client';
import { Logger } from './logger';

const logger = Logger.getInstance();

export interface EmailMessage {
  id: string;
  to: string;
  from: string;
  subject: string;
  body: string;
  html?: string;
  receivedAt: Date;
}

/**
 * Email testing helper.
 * Works with Mailhog (local dev) or can be adapted for Mailosaur/Mailtrap.
 *
 * Mailhog setup:
 *   docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog
 *   Set SMTP_HOST=localhost SMTP_PORT=1025 MAILHOG_API=http://localhost:8025
 */
export class EmailHelper {
  private readonly client: ApiClient;
  private readonly apiBase: string;

  constructor() {
    this.apiBase = process.env.MAILHOG_API ?? process.env.MAILOSAUR_API ?? 'http://localhost:8025';
    this.client = new ApiClient(this.apiBase);
  }

  /**
   * Wait until an email arrives to the specified address (polls every second).
   */
  async waitForEmail(
    toAddress: string,
    subjectContains?: string,
    timeoutMs = 30000
  ): Promise<EmailMessage> {
    const start = Date.now();

    while (Date.now() - start < timeoutMs) {
      const emails = await this.getEmails(toAddress);
      const match = emails.find((e) =>
        !subjectContains || e.subject.toLowerCase().includes(subjectContains.toLowerCase())
      );
      if (match) {
        logger.info(`Email found: "${match.subject}" → ${toAddress}`);
        return match;
      }
      await new Promise((r) => setTimeout(r, 1000));
    }

    throw new Error(
      `Email to "${toAddress}"${subjectContains ? ` with subject "${subjectContains}"` : ''} not received within ${timeoutMs}ms`
    );
  }

  /** Fetch all emails for a recipient */
  async getEmails(toAddress: string): Promise<EmailMessage[]> {
    try {
      const response = await this.client.get('/api/v2/messages');
      const items = (response.body as any)?.items ?? [];

      return items
        .filter((msg: any) =>
          msg.To?.some((r: any) => r.Mailbox + '@' + r.Domain === toAddress)
        )
        .map((msg: any): EmailMessage => ({
          id:         msg.ID,
          to:         toAddress,
          from:       msg.From?.Mailbox + '@' + msg.From?.Domain ?? '',
          subject:    msg.Content?.Headers?.Subject?.[0] ?? '',
          body:       msg.Content?.Body ?? '',
          html:       msg.MIME?.Parts?.[0]?.Body,
          receivedAt: new Date(msg.Created),
        }));
    } catch {
      logger.warn('Email API unreachable — running in stub mode');
      return [];
    }
  }

  /** Extract a link from email body (e.g., verification or reset links) */
  extractLink(email: EmailMessage, pattern: RegExp = /https?:\/\/[^\s"<>]+/): string {
    const match = (email.html ?? email.body).match(pattern);
    if (!match) throw new Error(`No link matching ${pattern} found in email`);
    return match[0];
  }

  /** Extract a numeric OTP code from email body */
  extractOTP(email: EmailMessage, digits = 6): string {
    const pattern = new RegExp(`\\b\\d{${digits}}\\b`);
    const match = email.body.match(pattern);
    if (!match) throw new Error(`No ${digits}-digit OTP found in email body`);
    return match[0];
  }

  /** Delete all emails (Mailhog) */
  async clearAll(): Promise<void> {
    try {
      await this.client.delete('/api/v1/messages');
      logger.info('All emails cleared');
    } catch {
      logger.warn('Could not clear emails (stub mode)');
    }
  }
}
