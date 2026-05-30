#!/bin/bash
while true; do
    echo "[$(date)] Starting Next.js server..."
    npx next start -p 3000 2>&1
    EXIT_CODE=$?
    echo "[$(date)] Server exited with code $EXIT_CODE, restarting immediately..."
    sleep 1
done
