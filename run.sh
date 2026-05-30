#!/bin/bash
cd /home/z/my-project
while true; do
    npx next start -p 3000 2>&1
    echo "[Watchdog] Server exited, restarting in 1s..."
    sleep 1
done
