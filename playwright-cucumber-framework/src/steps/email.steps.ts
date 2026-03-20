import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../hooks/world';
import { EmailHelper } from '../utils/email.helper';
import { Logger } from '../utils/logger';

const logger = Logger.getInstance();

// ─── Email verification step definitions ──────────────────────────────────────

When('I wait for an email to {string}', async function (this: CustomWorld, address: string) {
  const helper = new EmailHelper();
  const email = await helper.waitForEmail(address);
  this.setData('lastEmail', email);
  logger.info(`Email received: "${email.subject}"`);
});

When('I wait for an email to {string} with subject {string}', async function (
  this: CustomWorld,
  address: string,
  subject: string
) {
  const helper = new EmailHelper();
  const email = await helper.waitForEmail(address, subject);
  this.setData('lastEmail', email);
});

When('I extract the verification link from the email', function (this: CustomWorld) {
  const email = this.getData<ReturnType<EmailHelper['extractLink']>>('lastEmail') as any;
  if (!email) throw new Error('No email in context. Run a "wait for email" step first.');
  const helper = new EmailHelper();
  const link = helper.extractLink(email);
  this.setData('emailLink', link);
  logger.info(`Extracted link: ${link}`);
});

When('I click the verification link from the email', async function (this: CustomWorld) {
  const link = this.getData<string>('emailLink');
  if (!link) throw new Error('No email link stored. Extract it first.');
  await this.page.goto(link);
  await this.page.waitForLoadState('networkidle');
});

When('I extract the OTP from the email', function (this: CustomWorld) {
  const email = this.getData<any>('lastEmail');
  if (!email) throw new Error('No email in context');
  const helper = new EmailHelper();
  const otp = helper.extractOTP(email);
  this.setData('otp', otp);
  logger.info(`OTP extracted: ${otp}`);
});

When('I enter the OTP from the email', async function (this: CustomWorld) {
  const otp = this.getData<string>('otp');
  if (!otp) throw new Error('No OTP stored. Extract it first.');
  await this.page.fill(
    '[data-testid="otp-input"], input[name="otp"], input[placeholder*="OTP"], input[placeholder*="code"]',
    otp
  );
});

Then('the email should have subject {string}', function (this: CustomWorld, subject: string) {
  const email = this.getData<{ subject: string }>('lastEmail');
  if (!email) throw new Error('No email in context');
  expect(email.subject.toLowerCase()).toContain(subject.toLowerCase());
});

Then('the email body should contain {string}', function (this: CustomWorld, text: string) {
  const email = this.getData<{ body: string }>('lastEmail');
  if (!email) throw new Error('No email in context');
  expect(email.body.toLowerCase()).toContain(text.toLowerCase());
});
