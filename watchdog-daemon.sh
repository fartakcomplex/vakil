#!/bin/bash
cd /home/z/my-project
LOG=/home/z/my-project/watchdog.log

echo "[$(date)] Watchdog daemon started" >> $LOG

while true; do
    # Check if port 3000 is responding
    if curl -s --connect-timeout 2 --max-time 3 http://127.0.0.1:3000/ >/dev/null 2>&1; then
        echo "[$(date)] Server OK" >> $LOG
        sleep 20
        continue
    fi

    echo "[$(date)] Server NOT responding, restarting..." >> $LOG
    
    # Kill stale processes
    pkill -f "next-server" 2>/dev/null || true
    sleep 3

    # Start server
    NODE_OPTIONS="--max-old-space-size=256" nohup npx next start -p 3000 -H 127.0.0.1 >> $LOG 2>&1 &
    echo "[$(date)] Started server PID=$!" >> $LOG

    # Wait for it to come up
    for i in $(seq 1 20); do
        sleep 3
        if curl -s --connect-timeout 2 --max-time 3 http://127.0.0.1:3000/ >/dev/null 2>&1; then
            echo "[$(date)] Server is back up" >> $LOG
            break
        fi
    done
    
    sleep 5
done
