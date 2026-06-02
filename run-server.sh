#!/bin/bash
cd /home/z/my-project
while true; do
  echo "[$(date)] Starting LegalHub..." >> /tmp/legalhub-watchdog.log
  NODE_OPTIONS="--max-old-space-size=512" node start-combined.js 2>&1
  EXIT_CODE=$?
  echo "[$(date)] Exit code: $EXIT_CODE, restarting in 3s..." >> /tmp/legalhub-watchdog.log
  sleep 3
done
