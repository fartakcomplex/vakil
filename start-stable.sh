#!/bin/bash
cd /home/z/my-project
while true; do
  echo "[$(date)] Starting LegalHub server..."
  NODE_OPTIONS="--max-old-space-size=512" node server.js 2>&1
  EXIT_CODE=$?
  echo "[$(date)] Server exited with code $EXIT_CODE, restarting..."
  sleep 2
done
