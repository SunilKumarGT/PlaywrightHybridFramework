#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# run-tests.sh  —  Universal test runner for local dev and CI environments
# Usage:
#   ./cicd/scripts/run-tests.sh [suite] [env] [browser]
#
# Examples:
#   ./cicd/scripts/run-tests.sh smoke staging chromium
#   ./cicd/scripts/run-tests.sh all production firefox
#   ./cicd/scripts/run-tests.sh api                       # defaults apply
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

# ─── Defaults ────────────────────────────────────────────────────────────────
SUITE="${1:-smoke}"
ENV="${2:-${ENV:-staging}}"
BROWSER="${3:-${BROWSER:-chromium}}"
HEADLESS="${HEADLESS:-true}"
PARALLEL="${PARALLEL:-2}"

# ─── Colors ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; RESET='\033[0m'

log()     { echo -e "${BLUE}[$(date +'%H:%M:%S')]${RESET} $*"; }
success() { echo -e "${GREEN}✅ $*${RESET}"; }
warn()    { echo -e "${YELLOW}⚠️  $*${RESET}"; }
error()   { echo -e "${RED}❌ $*${RESET}" >&2; }
header()  { echo -e "\n${CYAN}═══════════════════════════════════════${RESET}"; echo -e "${CYAN}  $*${RESET}"; echo -e "${CYAN}═══════════════════════════════════════${RESET}\n"; }

# ─── Prerequisites ────────────────────────────────────────────────────────────
check_prerequisites() {
    local missing=0

    if ! command -v node &>/dev/null; then
        error "Node.js not found. Install from https://nodejs.org"
        missing=1
    else
        local node_ver
        node_ver=$(node -v | sed 's/v//' | cut -d'.' -f1)
        if [[ "$node_ver" -lt 18 ]]; then
            error "Node.js >= 18 required (found v$node_ver)"
            missing=1
        fi
    fi

    if ! command -v npm &>/dev/null; then
        error "npm not found"
        missing=1
    fi

    if [[ "$missing" -eq 1 ]]; then
        exit 1
    fi
}

# ─── Setup ───────────────────────────────────────────────────────────────────
setup() {
    log "Installing dependencies..."
    npm ci --silent

    log "Installing Playwright browsers for: $BROWSER"
    if [[ "$BROWSER" == "all" ]]; then
        npx playwright install --with-deps
    else
        npx playwright install --with-deps "$BROWSER"
    fi

    mkdir -p reports/screenshots reports/videos reports/traces reports/logs
    success "Setup complete"
}

# ─── Run Tests ────────────────────────────────────────────────────────────────
run_tests() {
    local start_time
    start_time=$(date +%s)

    export ENV BROWSER HEADLESS

    log "Running suite: $SUITE | env: $ENV | browser: $BROWSER | headless: $HEADLESS"

    local exit_code=0
    case "$SUITE" in
        smoke)      npm run test:smoke      || exit_code=$? ;;
        ui)         npm run test:ui         || exit_code=$? ;;
        api)        npm run test:api        || exit_code=$? ;;
        ai)         npm run test:ai         || exit_code=$? ;;
        regression) npm run test:regression || exit_code=$? ;;
        parallel)   npm run test:parallel   || exit_code=$? ;;
        all)
            npm run test:smoke   || exit_code=$?
            npm run test:api     || local api_exit=$?; exit_code=$((exit_code + ${api_exit:-0}))
            npm run test:ui      || local ui_exit=$?;  exit_code=$((exit_code + ${ui_exit:-0}))
            ;;
        *)
            error "Unknown suite: $SUITE. Valid: smoke|ui|api|ai|regression|parallel|all"
            exit 1
            ;;
    esac

    local end_time duration
    end_time=$(date +%s)
    duration=$((end_time - start_time))

    echo ""
    if [[ "$exit_code" -eq 0 ]]; then
        success "Tests completed in ${duration}s"
    else
        error "Tests failed after ${duration}s (exit code: $exit_code)"
    fi

    return $exit_code
}

# ─── Generate Report ──────────────────────────────────────────────────────────
generate_report() {
    log "Generating report..."
    npm run report 2>/dev/null || warn "Report generation failed (non-fatal)"

    if [[ -f "reports/summary-report.html" ]]; then
        success "Report: reports/summary-report.html"
    fi
    if [[ -f "reports/cucumber-report.html" ]]; then
        success "Cucumber report: reports/cucumber-report.html"
    fi
}

# ─── Main ────────────────────────────────────────────────────────────────────
main() {
    header "🧪 Playwright + Cucumber + AI Framework"

    log "Config:"
    log "  Suite:    $SUITE"
    log "  Env:      $ENV"
    log "  Browser:  $BROWSER"
    log "  Headless: $HEADLESS"

    check_prerequisites
    setup

    local exit_code=0
    run_tests || exit_code=$?

    generate_report

    echo ""
    if [[ "$exit_code" -eq 0 ]]; then
        success "All done! ✨"
    else
        error "Tests completed with failures"
        exit "$exit_code"
    fi
}

main "$@"
