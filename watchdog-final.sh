#!/bin/bash
cd /home/z/my-project/.next/standalone
while true; do
  if ! pgrep -f "next-server" > /dev/null 2>&1; then
    echo "[$(date)] Restarting server..." >> /tmp/watchdog-final.log
    NODE_OPTIONS="--unhandled-rejections=warn --trace-uncaught --max-old-space-size=512" node server.js >> /tmp/next-server.log 2>&1 &
    disown $! 2>/dev/null
    sleep 5
  fi
  sleep 15
done
