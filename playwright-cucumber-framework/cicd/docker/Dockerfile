# ─── Dockerfile ──────────────────────────────────────────────────────────────
# Playwright + Cucumber + AI Test Runner Container
# Usage:
#   docker build -t pw-cucumber-framework .
#   docker run --rm \
#     -e BASE_URL=https://app.example.com \
#     -e API_BASE_URL=https://api.example.com \
#     -e TEST_USERNAME=user@example.com \
#     -e TEST_PASSWORD=secret \
#     -e ANTHROPIC_API_KEY=sk-ant-... \
#     -e ENV=staging \
#     -v $(pwd)/reports:/app/reports \
#     pw-cucumber-framework npm run test:smoke

FROM mcr.microsoft.com/playwright:v1.41.0-jammy

# Metadata
LABEL maintainer="QA Team"
LABEL description="Playwright + Cucumber + AI Test Framework"
LABEL version="1.0.0"

# Set working directory
WORKDIR /app

# Install Node.js 20
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy package files first (layer caching)
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --omit=dev

# Install Playwright browsers
RUN npx playwright install --with-deps chromium firefox

# Copy source code
COPY . .

# Create reports directory
RUN mkdir -p reports/screenshots reports/videos reports/traces reports/logs

# Environment defaults
ENV HEADLESS=true \
    ENV=staging \
    BROWSER=chromium \
    SCREENSHOT_ON_FAIL=true \
    VIDEO_ON_FAIL=true \
    TRACE_ON_FAIL=true \
    NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('playwright')" || exit 1

# Default command: smoke tests
CMD ["npm", "run", "test:smoke"]
