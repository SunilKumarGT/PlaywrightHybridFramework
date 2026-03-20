# Changelog

All notable changes to this framework are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [2.0.0] — 2026-03-20

### Added
- **CI/CD Integration** — GitHub Actions (ci, nightly, release-gate), GitLab CI, Jenkins Declarative Pipeline, Azure DevOps
- **Docker support** — Dockerfile + docker-compose for containerised execution
- **Shell scripts** — `run-tests.sh` universal runner, `ci-setup.sh` bootstrap
- **Page Objects** — `RegisterPage`, `ProductsPage`, `CartPage`, `CheckoutPage`
- **Step Definitions** — `common.steps.ts` (network mocks, visual, performance, accessibility, viewport), `products.steps.ts`, `email.steps.ts`
- **Test Data Factory** — `TestDataFactory` class for users, products, addresses, payment details
- **Network Interceptor** — Mock routes, abort, throttle, capture, wait for request/response
- **Visual Comparator** — Screenshot baseline capture and diff detection
- **Performance Monitor** — Core Web Vitals collection + budget assertions
- **Auth Service** — Cached token management with automatic refresh
- **Database Helper** — Stub + structure for PostgreSQL/MySQL/MongoDB seeding
- **Email Helper** — Mailhog/Mailosaur integration for verification flows
- **JSON Schemas** — `user.schema.json`, `product.schema.json`, `order.schema.json`
- **Feature Files** — Products, Checkout, Register, Auth API, Orders API, Email Verification, Performance, Visual Regression, AI Test Generation
- **ESLint + Prettier** — Full TypeScript linting and formatting config
- **Allure** — Allure reporter profile and category config
- **CONTRIBUTING.md** — Comprehensive team contribution guide
- **Cucumber profiles** — `smoke`, `regression`, `ui`, `api`, `ai`, `performance`, `visual`, `email`, `allure`, `ci`
- **Tagging strategy** — Extended to cover `@performance`, `@visual`, `@email`, `@wip`

### Changed
- `package.json` — bumped to v2.0.0, added `prettier`, updated all scripts
- `cucumber.config.js` — refactored into named profiles; added `ci` and `allure` profiles
- `README.md` — expanded with full tech stack table, all test commands, tagging reference

---

## [1.0.0] — 2026-03-15

### Added
- Initial framework with Playwright + Cucumber + TypeScript
- UI step definitions (`ui.steps.ts`)
- API client, assertions, schema validator
- AI client (`ai.client.ts`) with Anthropic Claude
- AI step definitions (`ai.steps.ts`)
- Custom World and lifecycle hooks
- Logger (Winston), Helpers utility
- Report generator (custom HTML summary)
- Feature files: login, dashboard, users API, products API, AI analysis
- GitHub Actions CI pipeline (basic)
- `.env.example` and environment config
