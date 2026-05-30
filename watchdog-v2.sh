#!/bin/bash
cd /home/z/my-project
while true; do
    echo "$(date): Starting server..." >> /home/z/my-project/watchdog.log
    HOSTNAME="127.0.0.1" PORT=3000 node --max-old-space-size=512 .next/standalone/server.js >> /home/z/my-project/server.log 2>&1
    EXIT_CODE=$?
    echo "$(date): Server exited with code $EXIT_CODE" >> /home/z/my-project/watchdog.log
    sleep 2
done
