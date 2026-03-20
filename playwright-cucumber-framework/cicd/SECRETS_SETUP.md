# 🔐 CI/CD Secrets & Variables Setup Guide

This document describes all secrets and variables required across CI/CD platforms.

---

## GitHub Actions

Go to: **Settings → Secrets and Variables → Actions → New repository secret**

### Required Secrets

| Secret Name           | Description                              | Example Value                    |
|-----------------------|------------------------------------------|----------------------------------|
| `BASE_URL`            | Application under test URL               | `https://staging.myapp.com`      |
| `API_BASE_URL`        | API base URL                             | `https://api-staging.myapp.com`  |
| `TEST_USERNAME`       | Test user email                          | `qa-test@myapp.com`              |
| `TEST_PASSWORD`       | Test user password                       | `SecurePass@123`                 |
| `API_KEY`             | API authentication key                   | `sk-abc123...`                   |
| `AUTH_TOKEN`          | Bearer token for API auth                | `eyJhbGciOiJIUzI1...`            |
| `ANTHROPIC_API_KEY`   | Anthropic Claude API key (AI tests)      | `sk-ant-api03-...`               |
| `SLACK_WEBHOOK_URL`   | Slack incoming webhook for notifications | `https://hooks.slack.com/...`    |

### Production-Specific Secrets (for release-gate.yml)

| Secret Name             | Description                         |
|-------------------------|-------------------------------------|
| `PROD_BASE_URL`         | Production application URL          |
| `PROD_API_BASE_URL`     | Production API URL                  |
| `PROD_TEST_USERNAME`    | Production test user email          |
| `PROD_TEST_PASSWORD`    | Production test user password       |
| `PROD_API_KEY`          | Production API key                  |

---

## GitLab CI/CD

Go to: **Settings → CI/CD → Variables**

Set the same variables with the same names. For GitLab, prefix staging variables:

| Variable Name              | Protected | Masked | Description               |
|----------------------------|-----------|--------|---------------------------|
| `STAGING_BASE_URL`         | ✅        | ❌     | Staging app URL           |
| `STAGING_API_BASE_URL`     | ✅        | ❌     | Staging API URL           |
| `STAGING_TEST_USERNAME`    | ✅        | ✅     | Staging test username     |
| `STAGING_TEST_PASSWORD`    | ✅        | ✅     | Staging test password     |
| `STAGING_API_KEY`          | ✅        | ✅     | Staging API key           |
| `STAGING_AUTH_TOKEN`       | ✅        | ✅     | Staging auth token        |
| `ANTHROPIC_API_KEY`        | ✅        | ✅     | Claude API key            |
| `SLACK_WEBHOOK_URL`        | ✅        | ✅     | Slack webhook URL         |

---

## Jenkins

Go to: **Manage Jenkins → Credentials → System → Global credentials**

Add credentials as **Secret Text** with IDs matching the variable names:

| Credential ID       | Kind          | Description                    |
|---------------------|---------------|--------------------------------|
| `BASE_URL`          | Secret Text   | App URL                        |
| `API_BASE_URL`      | Secret Text   | API URL                        |
| `TEST_USERNAME`     | Secret Text   | Test username                  |
| `TEST_PASSWORD`     | Secret Text   | Test password                  |
| `API_KEY`           | Secret Text   | API key                        |
| `AUTH_TOKEN`        | Secret Text   | Auth token                     |
| `ANTHROPIC_API_KEY` | Secret Text   | Anthropic Claude API key       |
| `SLACK_WEBHOOK_URL` | Secret Text   | Slack webhook URL              |

---

## Azure DevOps

Go to: **Pipelines → Library → Variable Groups**

Create a variable group named `test-framework-vars` and add:

| Variable            | Secret? | Description                    |
|---------------------|---------|--------------------------------|
| `BASE_URL`          | ❌      | App URL                        |
| `API_BASE_URL`      | ❌      | API URL                        |
| `TEST_USERNAME`     | ✅      | Test username                  |
| `TEST_PASSWORD`     | ✅      | Test password                  |
| `API_KEY`           | ✅      | API key                        |
| `AUTH_TOKEN`        | ✅      | Auth token                     |
| `ANTHROPIC_API_KEY` | ✅      | Anthropic Claude API key       |
| `SLACK_WEBHOOK_URL` | ✅      | Slack webhook URL              |

Then link the variable group in `azure-pipelines.yml`:
```yaml
variables:
  - group: test-framework-vars
```

---

## Local Development (.env file)

Copy `.env.example` to `.env` and fill in values:
```bash
cp .env.example .env
```

> ⚠️ **Never commit `.env` to version control.** It is in `.gitignore`.

---

## Rotating Secrets

When rotating secrets:
1. Generate the new value
2. Update in all CI/CD platforms simultaneously
3. Verify pipelines pass before removing old value
4. Update `.env.example` if variable names change
