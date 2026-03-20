# 🤝 Contributing to the Test Framework

## Project Structure

```
src/
├── hooks/          World + lifecycle hooks (don't edit without team review)
├── pages/          Page Object Models  ← add new pages here
├── steps/          Step definitions    ← add new steps here
├── api/            API client, assertions, auth service
├── ai/             Anthropic Claude AI client
├── utils/          Logger, helpers, network interceptor, email, DB, visual
├── fixtures/       Test data factory
├── performance/    Performance monitor
└── types/          TypeScript interfaces

features/
├── ui/             Browser / UI feature files
├── api/            REST API feature files
├── ai/             AI-powered feature files
├── performance/    Performance feature files
└── visual/         Visual regression feature files
```

---

## Adding a New Page Object

1. Create `src/pages/my-page.page.ts` extending `BasePage`:
   ```typescript
   import { Page } from 'playwright';
   import { BasePage } from './base.page';

   export class MyPage extends BasePage {
     private readonly selectors = {
       myButton: '[data-testid="my-btn"], .my-btn',
     };
     constructor(page: Page, baseUrl?: string) { super(page, baseUrl); }
     async clickMyButton() { await this.click(this.selectors.myButton); }
   }
   ```
2. Use resilient selectors: prefer `data-testid` → ARIA → CSS (avoid XPath).
3. Export through `src/pages/index.ts` if adding many pages.

---

## Adding New Step Definitions

1. Add steps to an existing `src/steps/*.steps.ts` file if they fit the category.
2. For a new category, create `src/steps/my-category.steps.ts`.
3. Follow the naming conventions:
   - `Given` — preconditions / state setup
   - `When`  — user actions / API calls
   - `Then`  — assertions / verifications
4. Always type `this: CustomWorld` on every step function.
5. Store intermediate state in `this.setData(key, value)`, not module-level variables.

---

## Writing Feature Files

```gherkin
@ui @smoke               ← always tag with layer + priority
Feature: Feature Name
  As a <role>
  I want <goal>
  So that <benefit>

  Background:
    Given I am logged in as "standard_user"

  @smoke
  Scenario: Happy path  ← specific, self-contained
    When I ...
    Then I should see ...

  @regression
  Scenario Outline: Data-driven
    When I enter "<value>"
    Then I should see "<result>"
    Examples:
      | value | result |
      | ...   | ...    |
```

**Rules:**
- One scenario = one behaviour. Don't chain unrelated actions.
- Avoid `And I wait X seconds` — use explicit waits in page objects.
- Background steps should be universal to all scenarios in the file.
- Use `@wip` for in-progress work; it is excluded from CI runs.

---

## Tagging Reference

| Tag            | When to use                                      |
|----------------|--------------------------------------------------|
| `@smoke`       | Core paths, < 5 min total, run on every push     |
| `@regression`  | Full coverage, run nightly and on release        |
| `@ui`          | Needs a browser                                  |
| `@api`         | REST API only, no browser needed                 |
| `@ai`          | Uses Anthropic Claude (requires API key)         |
| `@performance` | Collects/asserts Web Vitals                      |
| `@visual`      | Screenshot comparison tests                      |
| `@email`       | Requires Mailhog or email service                |
| `@wip`         | Excluded from all CI — work in progress          |

---

## Environment Variables

Always add new variables to **all three**:
1. `.env.example` (with placeholder value and comment)
2. `config/environments.ts` (typed access)
3. `cicd/SECRETS_SETUP.md` (for all CI platforms)

---

## Code Quality Checklist

Before opening a PR:
- [ ] `npm run type-check` passes
- [ ] `npm run lint` passes (0 warnings)
- [ ] `npm run test:smoke` passes locally
- [ ] New page objects have selector fallbacks (`primary, .fallback`)
- [ ] New steps use `this: CustomWorld` typing
- [ ] New features have correct tags
- [ ] `.env.example` updated if new env vars added
- [ ] `README.md` updated if framework behaviour changes

---

## Running Tests Locally

```bash
# Quick check
npm run test:smoke

# Full UI suite (headless)
HEADLESS=true npm run test:ui

# Debug a single scenario (headed + slow)
HEADLESS=false SLOW_MO=500 npx cucumber-js --tags "@wip"

# With a specific browser
BROWSER=firefox npm run test:ui

# Against production (read-only smoke)
ENV=production npm run test:smoke
```
