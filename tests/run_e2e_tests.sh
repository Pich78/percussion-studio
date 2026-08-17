#!/usr/bin/env bash
# tests/run_e2e_tests.sh
#
# Dedicated E2E test runner. Uses Node.js ONLY to run the Playwright suite
# under tests/ (see docs/testing.md). launch_local.py is started/stopped
# automatically by the test runner as the web server.
set -euo pipefail

export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
# shellcheck source=/dev/null
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

if ! command -v node >/dev/null 2>&1; then
    echo "[E2E] Node not found. Install it first: nvm install 22" >&2
    exit 1
fi

cd "$(dirname "$0")"
npm test
