#!/bin/bash
cd /home/z/my-project

echo "$(date '+%H:%M:%S') Starting Next.js dev server..." >> /home/z/my-project/wrapper.log

NODE_OPTIONS="--max-old-space-size=1024" npx next dev -H 127.0.0.1 -p 3000 --turbopack >> /home/z/my-project/server.log 2>&1
EXIT_CODE=$?
echo "$(date '+%H:%M:%S') Server exited with code $EXIT_CODE, signal $(kill -l $EXIT_CODE 2>/dev/null)" >> /home/z/my-project/wrapper.log

# Auto-restart
sleep 3
exec /home/z/my-project/run-server.sh
