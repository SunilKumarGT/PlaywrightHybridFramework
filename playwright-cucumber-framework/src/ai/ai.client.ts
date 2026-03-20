import Anthropic from '@anthropic-ai/sdk';
import { AiAnalysisResult, AiIssue, AiTestCase, AiAccessibilityReport } from '../types';
import { Logger } from '../utils/logger';
import config from '../../config/environments';

const logger = Logger.getInstance();

/**
 * AI Testing Client using Anthropic Claude
 * Powers intelligent test analysis, generation, and verification
 */
export class AiClient {
  private readonly client: Anthropic;
  private readonly model: string;
  private readonly maxTokens: number;

  constructor() {
    this.client = new Anthropic({ apiKey: config.ai.apiKey });
    this.model = config.ai.model;
    this.maxTokens = config.ai.maxTokens;
  }

  // ─── Core AI Interaction ──────────────────────────────────────────────────────

  async ask(prompt: string, systemPrompt?: string): Promise<string> {
    logger.debug(`AI Request: ${prompt.substring(0, 100)}...`);

    const messages: Anthropic.MessageParam[] = [
      { role: 'user', content: prompt },
    ];

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: this.maxTokens,
      system: systemPrompt || 'You are an expert QA automation engineer. Be concise, technical, and precise.',
      messages,
    });

    const text = response.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as Anthropic.TextBlock).text)
      .join('');

    logger.debug(`AI Response: ${text.substring(0, 100)}...`);
    return text;
  }

  // ─── UI Analysis ──────────────────────────────────────────────────────────────

  /**
   * Analyze a screenshot for visual regressions, UI issues, or accessibility problems
   */
  async analyzeScreenshot(screenshotBase64: string, context: string): Promise<AiAnalysisResult> {
    logger.info('🤖 AI: Analyzing screenshot...');

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: this.maxTokens,
      system: 'You are an expert UI/UX quality analyst. Analyze screenshots and return structured JSON only.',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: 'image/png', data: screenshotBase64 },
            },
            {
              type: 'text',
              text: `Analyze this UI screenshot for: ${context}
              
Return ONLY valid JSON in this exact format:
{
  "analysis": "overall summary",
  "confidence": 0.95,
  "suggestions": ["suggestion1", "suggestion2"],
  "issues": [
    {
      "severity": "high",
      "description": "issue description",
      "location": "element or area",
      "recommendation": "how to fix"
    }
  ],
  "metadata": {}
}`,
            },
          ],
        },
      ],
    });

    const text = (response.content[0] as Anthropic.TextBlock).text;
    return this.parseJsonResponse<AiAnalysisResult>(text);
  }

  /**
   * Analyze page DOM/HTML for accessibility issues
   */
  async analyzeAccessibility(htmlContent: string, url: string): Promise<AiAccessibilityReport> {
    logger.info('🤖 AI: Analyzing accessibility...');

    const prompt = `Analyze this HTML for accessibility issues (WCAG 2.1 compliance):
URL: ${url}

HTML (truncated):
${htmlContent.substring(0, 3000)}

Return ONLY valid JSON:
{
  "score": 85,
  "issues": [{"severity": "high", "description": "...", "location": "...", "recommendation": "..."}],
  "wcagViolations": [{"criterion": "1.1.1", "level": "A", "description": "...", "elements": ["..."]}],
  "recommendations": ["..."]
}`;

    const text = await this.ask(prompt);
    return this.parseJsonResponse<AiAccessibilityReport>(text);
  }

  // ─── API Analysis ─────────────────────────────────────────────────────────────

  /**
   * Analyze an API response for anomalies, data quality, or security issues
   */
  async analyzeApiResponse(
    endpoint: string,
    method: string,
    requestBody: unknown,
    responseBody: unknown,
    statusCode: number,
    duration: number
  ): Promise<AiAnalysisResult> {
    logger.info(`🤖 AI: Analyzing API response for ${method} ${endpoint}...`);

    const prompt = `Analyze this API response for quality, security, and correctness issues:

Endpoint: ${method} ${endpoint}
Status Code: ${statusCode}
Response Time: ${duration}ms
Request Body: ${JSON.stringify(requestBody, null, 2).substring(0, 500)}
Response Body: ${JSON.stringify(responseBody, null, 2).substring(0, 1000)}

Check for:
1. Unexpected or missing fields
2. Data type inconsistencies
3. Security concerns (sensitive data exposure, injection risks)
4. Performance issues
5. REST conventions compliance

Return ONLY valid JSON:
{
  "analysis": "...",
  "confidence": 0.9,
  "suggestions": [],
  "issues": [{"severity": "medium", "description": "...", "location": "...", "recommendation": "..."}],
  "metadata": {"securityRisk": false, "performanceOk": true}
}`;

    const text = await this.ask(prompt);
    return this.parseJsonResponse<AiAnalysisResult>(text);
  }

  // ─── Test Generation ──────────────────────────────────────────────────────────

  /**
   * Generate test cases from a feature description or user story
   */
  async generateTestCases(userStory: string, context?: string): Promise<AiTestCase[]> {
    logger.info('🤖 AI: Generating test cases...');

    const prompt = `Generate comprehensive test cases for this user story:

${userStory}
${context ? `\nContext: ${context}` : ''}

Include positive, negative, edge cases, and boundary tests.

Return ONLY a valid JSON array:
[
  {
    "title": "Test case title",
    "description": "What this tests",
    "steps": ["Step 1", "Step 2"],
    "expectedResult": "Expected outcome",
    "tags": ["smoke", "regression"],
    "priority": "high"
  }
]`;

    const text = await this.ask(prompt);
    return this.parseJsonResponse<AiTestCase[]>(text);
  }

  /**
   * Generate Cucumber Gherkin scenarios from a description
   */
  async generateGherkinScenarios(description: string): Promise<string> {
    logger.info('🤖 AI: Generating Gherkin scenarios...');

    const prompt = `Write Cucumber Gherkin feature file scenarios for:

${description}

Use BDD best practices:
- Clear Given/When/Then structure
- Use Scenario Outline for data-driven cases
- Add appropriate tags (@smoke, @regression, @ui/@api)
- Include both happy path and error scenarios

Return only the Gherkin text (no markdown, no explanation).`;

    return this.ask(prompt);
  }

  // ─── Smart Assertions ────────────────────────────────────────────────────────

  /**
   * Use AI to verify that a response or UI state meets a natural language expectation
   */
  async verifyExpectation(
    actualData: unknown,
    expectation: string,
    context?: string
  ): Promise<{ passed: boolean; reason: string; confidence: number }> {
    logger.info(`🤖 AI: Verifying: "${expectation}"`);

    const prompt = `Verify whether the actual data meets the expectation.

Expectation: "${expectation}"
${context ? `Context: ${context}` : ''}
Actual Data: ${JSON.stringify(actualData, null, 2).substring(0, 2000)}

Return ONLY valid JSON:
{
  "passed": true,
  "reason": "explanation of why it passes or fails",
  "confidence": 0.95
}`;

    const text = await this.ask(prompt);
    return this.parseJsonResponse<{ passed: boolean; reason: string; confidence: number }>(text);
  }

  /**
   * Compare two screenshots and detect visual differences
   */
  async compareVisuals(
    baselineBase64: string,
    currentBase64: string,
    tolerance?: string
  ): Promise<{ hasDifference: boolean; description: string; severity: string }> {
    logger.info('🤖 AI: Comparing visual snapshots...');

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1024,
      system: 'You are a visual regression testing expert. Compare two screenshots carefully.',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: 'image/png', data: baselineBase64 } },
            { type: 'image', source: { type: 'base64', media_type: 'image/png', data: currentBase64 } },
            {
              type: 'text',
              text: `Compare these two screenshots (first is baseline, second is current).
Tolerance level: ${tolerance || 'medium'}
Return ONLY valid JSON:
{
  "hasDifference": false,
  "description": "summary of differences if any",
  "severity": "none|low|medium|high"
}`,
            },
          ],
        },
      ],
    });

    const text = (response.content[0] as Anthropic.TextBlock).text;
    return this.parseJsonResponse(text);
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────────

  private parseJsonResponse<T>(text: string): T {
    try {
      // Strip markdown code blocks if present
      const cleaned = text
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/gi, '')
        .trim();
      return JSON.parse(cleaned) as T;
    } catch {
      // Try to extract JSON from text
      const match = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
      if (match) {
        return JSON.parse(match[1]) as T;
      }
      throw new Error(`Could not parse AI response as JSON: ${text.substring(0, 200)}`);
    }
  }
}
