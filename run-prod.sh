#!/bin/bash
cd /home/z/my-project
export NODE_OPTIONS="--unhandled-rejections=warn"
export NODE_ENV=production
while true; do
  node .next/standalone/server.js
  echo "[$(date)] Server stopped, restarting in 3s..."
  sleep 3
done
