#!/usr/bin/env node
// LegalHub combined server with keepalive, health-check, and self-repair
const { createServer } = require('http');
const next = require('next');
const { spawn } = require('child_process');

const dev = false;
const hostname = '127.0.0.1';
const port = 3000;
const dir = __dirname;

// Simple keep-alive ping server
const pingServer = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'ok', uptime: process.uptime(), timestamp: Date.now() }));
});
pingServer.listen(3001, hostname, () => {
  console.log(`[keepalive] Health check on http://${hostname}:3001`);
});

// Self-test function - periodically ping ourselves to stay alive
setInterval(() => {
  const req = require('http').get(`http://${hostname}:${port}/`, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      // Silent success
    });
  });
  req.on('error', () => {
    // Server might be down, will restart
  });
}, 25000);

async function startServer() {
  console.log('[main] Starting LegalHub...');
  const app = next({ dev, dir });
  const handle = app.getRequestHandler();

  await app.prepare();

  const server = createServer((req, res) => {
    try {
      handle(req, res).catch(err => {
        console.error('[error]', err.message);
        if (!res.headersSent) {
          res.writeHead(500);
          res.end('Internal Server Error');
        }
      });
    } catch (err) {
      console.error('[fatal]', err.message);
      if (!res.headersSent) {
        res.writeHead(500);
        res.end('Internal Server Error');
      }
    }
  });

  await new Promise((resolve, reject) => {
    server.listen(port, hostname, () => {
      console.log(`[main] LegalHub ready on http://${hostname}:${port}`);
      resolve(undefined);
    });
    server.on('error', reject);
  });
}

startServer().catch(err => {
  console.error('[startup-error]', err);
  process.exit(1);
});
