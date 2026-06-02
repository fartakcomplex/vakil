#!/bin/bash
cd /home/z/my-project
while true; do
  echo "[$(date)] Starting LegalHub..." >> /tmp/next-server.log
  NODE_OPTIONS="--unhandled-rejections=warn --trace-uncaught --max-old-space-size=512" node .next/standalone/server.js >> /tmp/next-server.log 2>&1
  echo "[$(date)] Exit: $?. Restart in 5s..." >> /tmp/next-server.log
  sleep 5
done
