# 🚀 CI/CD Integration Guide

This framework ships with full CI/CD integration for four platforms.

---

## Platform Support

| Platform         | File Location                              | Features                                              |
|------------------|--------------------------------------------|-------------------------------------------------------|
| **GitHub Actions** | `.github/workflows/ci.yml`              | Push/PR triggers, matrix browser testing, PR comments |
| **GitHub Actions** | `.github/workflows/nightly.yml`         | Sharded nightly regression across 3 browsers          |
| **GitHub Actions** | `.github/workflows/release-gate.yml`    | Tag-triggered production smoke + release creation     |
| **GitLab CI**    | `cicd/gitlab/.gitlab-ci.yml`              | Stages, parallel jobs, Pages publishing               |
| **Jenkins**      | `cicd/jenkins/Jenkinsfile`                | Declarative pipeline, credentials, Slack + email      |
| **Azure DevOps** | `cicd/azure/azure-pipelines.yml`          | Stages, matrix strategy, artifact publishing          |
| **Docker**       | `cicd/docker/Dockerfile`                  | Containerised test execution                          |
| **Docker Compose**| `cicd/docker/docker-compose.yml`         | Local + CI multi-service orchestration                |

---

## Quick Setup by Platform

### GitHub Actions
1. Copy `.github/` folder to your repository root (already at root in this zip)
2. Add secrets — see `cicd/SECRETS_SETUP.md`
3. Push to `main` or `develop` — pipeline triggers automatically

### GitLab CI
```bash
# Copy the GitLab CI file to repo root
cp cicd/gitlab/.gitlab-ci.yml .gitlab-ci.yml
# Add CI/CD variables in GitLab Settings → CI/CD → Variables
```

### Jenkins
```bash
# In Jenkins: New Item → Pipeline → Pipeline script from SCM
# Script Path: cicd/jenkins/Jenkinsfile
# Add credentials in Manage Jenkins → Credentials
```

### Azure DevOps
```bash
# In Azure DevOps: Pipelines → New Pipeline → YAML
# Point to: cicd/azure/azure-pipelines.yml
# Create variable group: test-framework-vars
```

### Docker
```bash
# Build the image
docker build -f cicd/docker/Dockerfile -t pw-framework .

# Run smoke tests
docker run --rm \
  -e BASE_URL=https://staging.myapp.com \
  -e TEST_USERNAME=qa@myapp.com \
  -e TEST_PASSWORD=secret \
  -e ANTHROPIC_API_KEY=sk-ant-... \
  -v $(pwd)/reports:/app/reports \
  pw-framework npm run test:smoke

# Using Docker Compose
docker-compose -f cicd/docker/docker-compose.yml up test-api
docker-compose -f cicd/docker/docker-compose.yml --profile full up
```

### Shell Script (any CI)
```bash
chmod +x cicd/scripts/run-tests.sh cicd/scripts/ci-setup.sh

# Setup
./cicd/scripts/ci-setup.sh

# Run tests
./cicd/scripts/run-tests.sh smoke staging chromium
./cicd/scripts/run-tests.sh all staging chromium
./cicd/scripts/run-tests.sh api
```

---

## Pipeline Flow (GitHub Actions)

```
Push/PR
   │
   ▼
🔍 Code Quality (type-check + lint)
   │
   ▼
💨 Smoke Tests  ──── (gate: blocks all below if failing)
   │
   ├──────────────────────────────────┐
   ▼                  ▼              ▼
🌐 UI Tests      🔌 API Tests    🤖 AI Tests
[chromium]        (all envs)     (nightly/main)
[firefox]
   │
   └──────────────────────────────────┐
                                      ▼
                              📊 Publish Report
                              PR Comment + GitHub Pages
                                      │
                          (on failure only)
                                      ▼
                              🔔 Slack Notification
```

---

## Tagging Strategy for CI

| Tag            | Runs in                              |
|----------------|--------------------------------------|
| `@smoke`       | Every push, PRs, smoke stage         |
| `@regression`  | Nightly, release branches            |
| `@ui`          | UI job stage                         |
| `@api`         | API job stage                        |
| `@ai`          | AI job stage (nightly + main)        |
| `@wip`         | Excluded from all CI runs            |

---

## Notification Channels

- **Slack**: Configure `SLACK_WEBHOOK_URL` secret for real-time alerts
- **Email**: Jenkins pipeline sends email on failure via `emailext`
- **GitHub PR Comments**: Auto-posted summary table on every PR
- **GitHub Pages**: Reports published at `https://<org>.github.io/<repo>/reports/<run-number>/`

---

See `cicd/SECRETS_SETUP.md` for full secrets configuration per platform.
