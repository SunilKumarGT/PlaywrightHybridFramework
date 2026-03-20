#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# ci-setup.sh  —  CI environment bootstrap script
# Run once at the start of any CI pipeline to ensure the environment is ready
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; RESET='\033[0m'
success() { echo -e "${GREEN}✅ $*${RESET}"; }
warn()    { echo -e "${YELLOW}⚠️  $*${RESET}"; }
error()   { echo -e "${RED}❌ $*${RESET}" >&2; }

echo "🚀 CI Setup — Playwright + Cucumber Framework"
echo "================================================"

# ─── 1. Node Version ──────────────────────────────────────────────────────────
NODE_REQUIRED=18
NODE_ACTUAL=$(node -v | sed 's/v//' | cut -d'.' -f1)
if [[ "$NODE_ACTUAL" -lt "$NODE_REQUIRED" ]]; then
    error "Node.js >= $NODE_REQUIRED required, found $NODE_ACTUAL"
    exit 1
fi
success "Node.js v$(node -v | sed 's/v//')"

# ─── 2. Install Dependencies ─────────────────────────────────────────────────
echo "📦 Installing npm dependencies..."
npm ci
success "Dependencies installed"

# ─── 3. Install Playwright ───────────────────────────────────────────────────
BROWSER="${BROWSER:-chromium}"
echo "🎭 Installing Playwright browser: $BROWSER"
if [[ "$BROWSER" == "all" ]]; then
    npx playwright install --with-deps
else
    npx playwright install --with-deps "$BROWSER"
fi
success "Playwright installed"

# ─── 4. Validate Required Environment Variables ───────────────────────────────
echo "🔍 Validating environment variables..."
REQUIRED_VARS=(BASE_URL API_BASE_URL TEST_USERNAME TEST_PASSWORD)
MISSING=0

for var in "${REQUIRED_VARS[@]}"; do
    if [[ -z "${!var:-}" ]]; then
        warn "Missing required env var: $var"
        MISSING=$((MISSING + 1))
    else
        success "$var is set"
    fi
done

# Optional but warn if missing
OPTIONAL_VARS=(API_KEY AUTH_TOKEN ANTHROPIC_API_KEY)
for var in "${OPTIONAL_VARS[@]}"; do
    if [[ -z "${!var:-}" ]]; then
        warn "Optional env var not set: $var (some tests may be skipped)"
    fi
done

if [[ "$MISSING" -gt 0 ]]; then
    error "$MISSING required environment variable(s) missing"
    exit 1
fi

# ─── 5. Create Report Directories ────────────────────────────────────────────
echo "📁 Creating report directories..."
mkdir -p reports/screenshots reports/videos reports/traces reports/logs
success "Report directories ready"

# ─── 6. Summary ──────────────────────────────────────────────────────────────
echo ""
echo "================================================"
success "CI Setup complete! Ready to run tests."
echo "  ENV:     ${ENV:-staging}"
echo "  BROWSER: ${BROWSER:-chromium}"
echo "================================================"
