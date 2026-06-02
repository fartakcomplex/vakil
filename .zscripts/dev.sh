#!/bin/bash

set -eo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_DIR"

log_step() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

wait_for_port() {
    local port="$1"
    local max_attempts="${2:-30}"
    local attempt=1
    while [ "$attempt" -le "$max_attempts" ]; do
        if curl -s --connect-timeout 2 --max-time 3 "http://127.0.0.1:$port" >/dev/null 2>&1; then
            return 0
        fi
        sleep 1
        attempt=$((attempt + 1))
    done
    return 1
}

# ========== Step 1: Install deps ==========
log_step "Installing dependencies..."
bun install --no-save 2>&1 | tail -3

# ========== Step 2: Push DB schema ==========
log_step "Syncing database schema..."
bun run db:push 2>&1 | tail -3

# ========== Step 3: Build if needed ==========
if [ ! -d ".next/BUILD_ID" ] || [ ! -f ".next/standalone/server.js" ]; then
    log_step "Building Next.js project (first time)..."
    NODE_OPTIONS="--max-old-space-size=256" npx next build 2>&1 | tail -10
else
    log_step "Build exists, skipping build step."
fi

# ========== Step 4: Start production server with watchdog ==========
log_step "Starting production server with watchdog..."

# Create a self-contained watchdog loop
(
    while true; do
        # Check if port 3000 is already in use by our server
        if curl -s --connect-timeout 2 --max-time 3 "http://127.0.0.1:3000" >/dev/null 2>&1; then
            # Server responding - sleep and check again
            sleep 15
            continue
        fi

        # Port not responding - kill any stale processes
        pkill -f "next start" 2>/dev/null || true
        pkill -f "next-server" 2>/dev/null || true
        sleep 2

        log_step "Starting Next.js production server..."
        NODE_OPTIONS="--max-old-space-size=256" npx next start -p 3000 -H 127.0.0.1 2>&1 &
        SERVER_PID=$!

        # Wait for server to be ready
        if wait_for_port 3000 30; then
            log_step "Server is running (PID: $SERVER_PID)"
        else
            log_step "Server failed to start, will retry in 10s..."
            kill $SERVER_PID 2>/dev/null || true
            sleep 10
        fi
    done
) &

WATCHDOG_PID=$!
log_step "Watchdog started (PID: $WATCHDOG_PID)"

# Wait for first server start
if wait_for_port 3000 60; then
    log_step "Server is ready on port 3000"
else
    log_step "ERROR: Server did not start in time"
    exit 1
fi

# ========== Step 5: Start mini-services ==========
MINI_SERVICES_DIR="$PROJECT_DIR/mini-services"
if [ -d "$MINI_SERVICES_DIR" ]; then
    for service_dir in "$MINI_SERVICES_DIR"/*; do
        [ ! -d "$service_dir" ] && continue
        [ ! -f "$service_dir/package.json" ] && continue
        grep -q '"dev"' "$service_dir/package.json" 2>/dev/null || continue
        svc=$(basename "$service_dir")
        log_step "Starting mini-service: $svc"
        (cd "$service_dir" && bun install && exec bun run dev) >"$PROJECT_DIR/.zscripts/mini-service-${svc}.log" 2>&1 &
        disown 2>/dev/null || true
    done
fi

log_step "All services started successfully."

# Keep this script alive by monitoring the watchdog
while kill -0 "$WATCHDOG_PID" 2>/dev/null; do
    sleep 30
done
