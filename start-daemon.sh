#!/bin/bash
cd /home/z/my-project/.next/standalone
export NODE_OPTIONS="--unhandled-rejections=warn --trace-uncaught --max-old-space-size=512"
exec node server.js >> /tmp/next-server.log 2>&1
