import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../hooks/world';
import { AiClient } from '../ai/ai.client';
import { Logger } from '../utils/logger';

const logger = Logger.getInstance();

let aiClient: AiClient;

function getAiClient(): AiClient {
  if (!aiClient) aiClient = new AiClient();
  return aiClient;
}

// ─── Screenshot Analysis Steps ────────────────────────────────────────────────

When('I analyze the current page screenshot for {string}', async function (this: CustomWorld, context: string) {
  const screenshot = await this.page.screenshot({ fullPage: true });
  const base64 = screenshot.toString('base64');
  this.aiAnalysisResult = await getAiClient().analyzeScreenshot(base64, context);
  await this.attach(screenshot, 'image/png');
  logger.info(`AI Analysis complete. Confidence: ${this.aiAnalysisResult.confidence}`);
});

When('AI analyzes the page for accessibility', async function (this: CustomWorld) {
  const html = await this.page.content();
  const url = this.page.url();
  const report = await getAiClient().analyzeAccessibility(html, url);
  this.setData('accessibilityReport', report);
  logger.info(`Accessibility score: ${report.score}`);
  await this.attach(
    `Accessibility Score: ${report.score}\nIssues: ${report.issues.length}\nWCAG Violations: ${report.wcagViolations.length}`,
    'text/plain'
  );
});

// ─── API Response Analysis Steps ──────────────────────────────────────────────

When('AI analyzes the API response for anomalies', async function (this: CustomWorld) {
  if (!this.apiResponse) throw new Error('No API response to analyze');
  const endpoint = this.getData<string>('lastEndpoint') || '/unknown';
  const method = this.getData<string>('lastMethod') || 'GET';
  const requestBody = this.getData<unknown>('lastRequestBody');

  this.aiAnalysisResult = await getAiClient().analyzeApiResponse(
    endpoint,
    method,
    requestBody,
    this.apiResponse.body,
    this.apiResponse.status,
    this.apiResponse.duration
  );
  logger.info(`AI API Analysis: ${this.aiAnalysisResult.issues.length} issues found`);
});

// ─── Test Generation Steps ────────────────────────────────────────────────────

When('AI generates test cases for:', async function (this: CustomWorld, userStory: string) {
  const testCases = await getAiClient().generateTestCases(userStory);
  this.setData('generatedTestCases', testCases);
  logger.info(`AI generated ${testCases.length} test cases`);
  await this.attach(JSON.stringify(testCases, null, 2), 'application/json');
});

When('AI generates Gherkin scenarios for:', async function (this: CustomWorld, description: string) {
  const gherkin = await getAiClient().generateGherkinScenarios(description);
  this.setData('generatedGherkin', gherkin);
  await this.attach(gherkin, 'text/plain');
  logger.info('Gherkin scenarios generated');
});

// ─── Smart Verification Steps ─────────────────────────────────────────────────

Then('AI should verify that {string}', async function (this: CustomWorld, expectation: string) {
  const data = this.apiResponse?.body || this.getData('lastData');
  if (!data) throw new Error('No data available for AI verification');

  const result = await getAiClient().verifyExpectation(data, expectation);
  await this.attach(
    `AI Verification:\nExpectation: ${expectation}\nResult: ${result.passed ? 'PASSED' : 'FAILED'}\nReason: ${result.reason}\nConfidence: ${result.confidence}`,
    'text/plain'
  );

  if (!result.passed) {
    throw new Error(`AI verification failed: ${result.reason}`);
  }
  logger.info(`✅ AI verified: "${expectation}" (confidence: ${result.confidence})`);
});

Then('the AI analysis should have no critical issues', function (this: CustomWorld) {
  if (!this.aiAnalysisResult) throw new Error('No AI analysis result. Run an AI analysis step first.');
  const criticalIssues = this.aiAnalysisResult.issues.filter((i) => i.severity === 'critical');
  if (criticalIssues.length > 0) {
    throw new Error(
      `AI found ${criticalIssues.length} critical issue(s):\n${criticalIssues.map((i) => `- ${i.description}`).join('\n')}`
    );
  }
  logger.info('✅ No critical issues found by AI');
});

Then('the AI analysis should have no high severity issues', function (this: CustomWorld) {
  if (!this.aiAnalysisResult) throw new Error('No AI analysis result');
  const highIssues = this.aiAnalysisResult.issues.filter((i) => i.severity === 'high' || i.severity === 'critical');
  if (highIssues.length > 0) {
    throw new Error(`AI found ${highIssues.length} high/critical issue(s):\n${highIssues.map((i) => `- [${i.severity}] ${i.description}`).join('\n')}`);
  }
});

Then('the AI confidence score should be at least {float}', function (this: CustomWorld, minConfidence: number) {
  if (!this.aiAnalysisResult) throw new Error('No AI analysis result');
  expect(this.aiAnalysisResult.confidence).toBeGreaterThanOrEqual(minConfidence);
});

Then('the accessibility score should be at least {int}', function (this: CustomWorld, minScore: number) {
  const report = this.getData<{ score: number }>('accessibilityReport');
  if (!report) throw new Error('No accessibility report found');
  expect(report.score).toBeGreaterThanOrEqual(minScore);
});

Then('AI should generate at least {int} test cases', function (this: CustomWorld, minCount: number) {
  const testCases = this.getData<unknown[]>('generatedTestCases');
  if (!testCases) throw new Error('No test cases generated');
  expect(testCases.length).toBeGreaterThanOrEqual(minCount);
});

Then('the AI analysis summary should contain {string}', function (this: CustomWorld, keyword: string) {
  if (!this.aiAnalysisResult) throw new Error('No AI analysis result');
  expect(this.aiAnalysisResult.analysis.toLowerCase()).toContain(keyword.toLowerCase());
});
