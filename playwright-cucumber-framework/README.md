# 🧪 Playwright + Cucumber + AI Test Framework  v2.0

> Production-grade automation framework for **UI**, **API**, **AI-powered**, **Performance**, and **Visual Regression** testing — built with Playwright, Cucumber BDD, TypeScript, and Anthropic Claude.

---

## 📁 Project Structure

```
playwright-cucumber-ai-framework/
│
├── .github/workflows/          # GitHub Actions CI/CD
│   ├── ci.yml                  # Push/PR pipeline (quality → smoke → parallel suites)
│   ├── nightly.yml             # Sharded nightly regression (3 browsers × 3 shards)
│   └── release-gate.yml        # Tag-triggered production smoke + GitHub Release
│
├── cicd/
│   ├── azure/azure-pipelines.yml   # Azure DevOps multi-stage pipeline
│   ├── gitlab/.gitlab-ci.yml       # GitLab CI stages + Pages
│   ├── jenkins/Jenkinsfile          # Jenkins Declarative Pipeline
│   ├── docker/Dockerfile            # Container image (Playwright + Node 20)
│   ├── docker/docker-compose.yml    # Service orchestration
│   ├── scripts/run-tests.sh         # Universal test runner
│   ├── scripts/ci-setup.sh          # Bootstrap validator
│   ├── README.md                    # CI/CD setup guide
│   └── SECRETS_SETUP.md             # Secrets config for all platforms
│
├── config/
│   ├── environments.ts          # Typed config for local/staging/production
│   ├── playwright.config.ts     # Playwright browsers + viewport + artifacts
│   └── allure.config.ts         # Allure categories + link templates
│
├── features/
│   ├── ui/                      # Browser UI scenarios
│   │   ├── login.feature
│   │   ├── register.feature
│   │   ├── dashboard.feature
│   │   ├── products.feature
│   │   ├── checkout.feature
│   │   ├── profile.feature
│   │   └── email-verification.feature
│   ├── api/                     # REST API scenarios
│   │   ├── auth.feature
│   │   ├── users.feature
│   │   ├── products.feature
│   │   ├── orders.feature
│   │   └── search.feature
│   ├── ai/                      # AI-powered scenarios
│   │   ├── ai-ui-analysis.feature
│   │   ├── ai-api-analysis.feature
│   │   └── ai-test-generation.feature
│   ├── performance/             # Web Vitals + budget checks
│   │   └── web-vitals.feature
│   └── visual/                  # Visual regression baselines
│       └── visual-regression.feature
│
├── src/
│   ├── hooks/
│   │   ├── world.ts             # Custom Cucumber World (browser, context, page, data)
│   │   └── hooks.ts             # Before/After/BeforeAll/AfterAll lifecycle
│   ├── pages/                   # Page Object Models
│   │   ├── base.page.ts         # Core interactions + smart waits + assertions
│   │   ├── login.page.ts
│   │   ├── register.page.ts
│   │   ├── dashboard.page.ts
│   │   ├── products.page.ts
│   │   ├── cart.page.ts
│   │   ├── checkout.page.ts
│   │   └── index.ts             # Barrel export
│   ├── steps/                   # Cucumber step definitions
│   │   ├── ui.steps.ts          # Navigation, click, fill, assert
│   │   ├── api.steps.ts         # HTTP request/response steps
│   │   ├── ai.steps.ts          # AI analysis + verification steps
│   │   ├── common.steps.ts      # Network mocks, visual, performance, a11y, viewport
│   │   ├── products.steps.ts    # Product browse, cart, checkout
│   │   ├── email.steps.ts       # Email wait, link/OTP extraction
│   │   ├── performance.steps.ts # Web Vitals collection + budget assertions
│   │   └── db.steps.ts          # Database seed/cleanup steps
│   ├── api/
│   │   ├── api.client.ts        # Axios wrapper with logging + auth
│   │   ├── api.assertions.ts    # Fluent assertion chain (status, body, JSONPath, headers)
│   │   ├── schema.validator.ts  # AJV JSON Schema validation
│   │   └── auth.service.ts      # Token caching + authenticated client factory
│   ├── ai/
│   │   └── ai.client.ts         # Claude — screenshot, accessibility, API, test-gen, verify
│   ├── fixtures/
│   │   └── test-data.factory.ts # Generates users, products, addresses, payment cards
│   ├── mocks/
│   │   └── mock.server.ts       # In-process mock HTTP server for offline API testing
│   ├── performance/
│   │   └── perf.monitor.ts      # Core Web Vitals + action timing + budget assertions
│   ├── utils/
│   │   ├── logger.ts            # Winston structured logger
│   │   ├── helpers.ts           # Retry, random data, JSON extract, masking
│   │   ├── date.helper.ts       # Date formatting, parsing, relative dates
│   │   ├── retry.helper.ts      # Configurable retry with backoff + jitter
│   │   ├── network.interceptor.ts  # Route mock / abort / throttle / capture
│   │   ├── visual.comparator.ts    # Screenshot baseline + diff
│   │   ├── email.helper.ts         # Mailhog / Mailosaur integration
│   │   ├── database.helper.ts      # DB seeding + cleanup (pg/mysql/mongo stub)
│   │   └── report-generator.ts     # Custom HTML summary report
│   └── types/
│       └── index.ts             # All TypeScript interfaces
│
├── test-data/
│   ├── users.json
│   ├── api-payloads.json
│   ├── fixtures/test-users.json
│   └── schemas/
│       ├── user.schema.json
│       ├── product.schema.json
│       └── order.schema.json
│
├── .env.example                 # All supported env vars with descriptions
├── .eslintrc.js                 # TypeScript ESLint config
├── .prettierrc.json             # Prettier formatting rules
├── .gitignore
├── cucumber.config.js           # 10 named profiles (smoke/ui/api/ai/performance/visual/…)
├── tsconfig.json
├── package.json                 # v2.0.0 — all scripts
├── CONTRIBUTING.md              # Team contribution guide
└── CHANGELOG.md                 # Version history
```

---

## ⚡ Quick Start

```bash
# 1 — Install
npm install
npx playwright install --with-deps

# 2 — Configure
cp .env.example .env
# Edit .env with your BASE_URL, credentials, and ANTHROPIC_API_KEY

# 3 — Run
npm run test:smoke       # Fast smoke tests (~2 min)
npm run test:ui          # All UI/browser tests
npm run test:api         # All REST API tests
npm run test:ai          # AI-powered tests (needs ANTHROPIC_API_KEY)
npm run test:performance # Web Vitals tests
npm run test:visual      # Visual regression tests
npm run test:regression  # Full regression suite
npm run test:parallel    # Run 4 workers in parallel

# 4 — Report
npm run report           # Generate HTML summary → reports/summary-report.html
```

---

## 🛠️ Environment Variables

| Variable              | Required | Description                               |
|-----------------------|----------|-------------------------------------------|
| `BASE_URL`            | ✅       | Application under test URL                |
| `API_BASE_URL`        | ✅       | REST API base URL                         |
| `TEST_USERNAME`       | ✅       | Test user email                           |
| `TEST_PASSWORD`       | ✅       | Test user password                        |
| `API_KEY`             | ⚠️       | API authentication key                    |
| `AUTH_TOKEN`          | ⚠️       | Bearer token for authenticated API tests  |
| `ANTHROPIC_API_KEY`   | 🤖       | Anthropic Claude key (AI tests only)      |
| `BROWSER`             | ❌       | `chromium` / `firefox` / `webkit`         |
| `HEADLESS`            | ❌       | `true` / `false` (default `true`)         |
| `ENV`                 | ❌       | `local` / `staging` / `production`        |
| `SLOW_MO`             | ❌       | Milliseconds between actions (debugging)  |
| `SCREENSHOT_ON_FAIL`  | ❌       | `true` to capture screenshots on failure  |
| `VIDEO_ON_FAIL`       | ❌       | `true` to record video on failure         |
| `TRACE_ON_FAIL`       | ❌       | `true` to save Playwright traces          |
| `MAILHOG_API`         | ❌       | Mailhog API URL for email tests           |
| `DB_HOST`             | ❌       | Database host for seed/cleanup steps      |

---

## 📝 Writing Tests

### UI Feature
```gherkin
@ui @smoke
Feature: Login
  Scenario: Valid credentials redirect to dashboard
    Given I am on the login page
    When  I enter username "user@example.com"
    And   I enter password "Test@1234"
    And   I click the login button
    Then  I should be redirected to the dashboard
```

### API Feature
```gherkin
@api @regression
Feature: Users API
  Background:
    Given I have a valid API client
    And   I authenticate with bearer token "valid-token"

  Scenario: Create user returns 201
    When I send a POST request to "/api/users" with body:
      """
      { "email": "new@test.com", "firstName": "New" }
      """
    Then the response status code should be 201
    And  the response should match the user schema
```

### AI Feature
```gherkin
@ai
Feature: AI Verification
  Scenario: AI detects no critical UI issues on dashboard
    Given I am logged in as "standard_user"
    When  I analyze the current page screenshot for "layout bugs, broken widgets"
    Then  the AI analysis should have no critical issues
    And   the AI confidence score should be at least 0.8

  Scenario: AI verifies API response quality
    When  I send a GET request to "/api/users"
    And   AI should verify that "all users have valid email addresses and no passwords exposed"
```

### Performance Feature
```gherkin
@performance
Feature: Web Vitals
  Scenario: Homepage meets performance budget
    Given I navigate to "/"
    When  I measure the performance of the current page
    Then  the page should meet the "normal" performance budget
    And   the First Contentful Paint should be under 2500 milliseconds
```

### Network Mock Feature
```gherkin
@ui @regression
Scenario: App handles API errors gracefully
  Given the API endpoint "/api/products" is unavailable
  And   I navigate to "/products"
  Then  I should see "something went wrong"
```

---

## 🤖 AI Capabilities

| Capability                  | Step pattern                                                  |
|-----------------------------|---------------------------------------------------------------|
| Screenshot analysis         | `When I analyze the current page screenshot for "..."`        |
| Accessibility audit         | `When AI analyzes the page for accessibility`                 |
| API anomaly detection       | `When AI analyzes the API response for anomalies`             |
| Natural language assertion  | `Then AI should verify that "..."`                            |
| Test case generation        | `When AI generates test cases for: """`                       |
| Gherkin generation          | `When AI generates Gherkin scenarios for: """`                |
| Visual comparison           | Uses `AiClient.compareVisuals()` in page objects              |

---

## 🏷️ Tagging Strategy

| Tag            | When to use                                    | Runs in CI          |
|----------------|------------------------------------------------|---------------------|
| `@smoke`       | Critical happy paths, < 5 min total            | Every push / PR     |
| `@regression`  | Full coverage                                  | Nightly + release   |
| `@ui`          | Browser/DOM interaction required               | UI job              |
| `@api`         | REST API — no browser needed                   | API job             |
| `@ai`          | Uses Anthropic Claude                          | AI job (nightly)    |
| `@performance` | Collects / asserts Web Vitals                  | Performance job     |
| `@visual`      | Screenshot baseline comparisons                | Visual job          |
| `@email`       | Needs Mailhog / email service                  | Email job           |
| `@wip`         | In progress — excluded from all CI runs        | Never               |

---

## 🚀 CI/CD Platforms

| Platform        | File                                   |
|-----------------|----------------------------------------|
| GitHub Actions  | `.github/workflows/ci.yml`             |
| GitHub Nightly  | `.github/workflows/nightly.yml`        |
| GitHub Release  | `.github/workflows/release-gate.yml`   |
| GitLab CI       | `cicd/gitlab/.gitlab-ci.yml`           |
| Jenkins         | `cicd/jenkins/Jenkinsfile`             |
| Azure DevOps    | `cicd/azure/azure-pipelines.yml`       |
| Docker          | `cicd/docker/Dockerfile`               |
| Docker Compose  | `cicd/docker/docker-compose.yml`       |

See `cicd/README.md` and `cicd/SECRETS_SETUP.md` for setup instructions.

---

## 📊 Reports

| Report                           | Location                          |
|----------------------------------|-----------------------------------|
| Cucumber HTML                    | `reports/cucumber-report.html`    |
| Custom summary (pass rate, etc.) | `reports/summary-report.html`     |
| Cucumber JSON (CI integration)   | `reports/cucumber-report.json`    |
| JUnit XML (Azure / Jenkins)      | `reports/junit.xml`               |
| Failure screenshots              | `reports/screenshots/`            |
| Failure videos                   | `reports/videos/`                 |
| Playwright traces                | `reports/traces/`                 |
| Structured logs                  | `reports/logs/`                   |
| Visual baselines                 | `reports/visual/baselines/`       |
| Allure results                   | `allure-results/` (with profile)  |

```bash
# Open Allure report
npm run test -- --profile allure
npx allure generate allure-results --clean -o allure-report
npx allure open allure-report
```

---

## 📦 Tech Stack

| Library                    | Version  | Purpose                                 |
|----------------------------|----------|-----------------------------------------|
| Playwright                 | ^1.41    | Browser automation + API testing        |
| @cucumber/cucumber         | ^10.3    | BDD test runner                         |
| TypeScript                 | ^5.3     | Type-safe test code                     |
| @anthropic-ai/sdk          | ^0.39    | Claude AI for intelligent testing       |
| Axios                      | ^1.6     | HTTP client for API tests               |
| AJV                        | ^8.12    | JSON Schema validation                  |
| Winston                    | ^3.11    | Structured logging                      |
| allure-cucumberjs          | ^3.0     | Rich test reporting                     |
| ESLint + Prettier          | ^8/^3    | Code quality + formatting               |

---

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for:
- Adding page objects
- Writing step definitions
- Feature file conventions
- PR checklist
- Local debugging tips
