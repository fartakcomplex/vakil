#!/bin/bash
cd /home/z/my-project
while true; do
    NODE_OPTIONS="--max-old-space-size=300" npx next start -p 3000 2>&1
    echo "[watchdog] $(date) - restarted"
    sleep 1
done
