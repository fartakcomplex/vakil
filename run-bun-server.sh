#!/bin/bash
cd /home/z/my-project/.next/standalone
while true; do
    echo "$(date '+%H:%M:%S') Starting bun server..." >> /home/z/my-project/bun-watchdog.log
    HOSTNAME="127.0.0.1" PORT=3000 bun --max-old-space-size=256 server.js >> /home/z/my-project/server.log 2>&1
    EXIT_CODE=$?
    SIGNAL=$(kill -l $EXIT_CODE 2>/dev/null)
    echo "$(date '+%H:%M:%S') Exited code=$EXIT_CODE signal=$SIGNAL" >> /home/z/my-project/bun-watchdog.log
    sleep 5
done
