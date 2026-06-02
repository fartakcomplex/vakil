// LegalHub Startup - Combined server + keepalive
const { createServer } = require('http');
const path = require('path');

const dir = __dirname;

// Self-ping keepalive
function startSelfPing(port) {
  const http = require('http');
  setInterval(() => {
    const req = http.get(`http://127.0.0.1:${port}/`, (res) => { res.resume(); });
    req.on('error', () => {});
    req.setTimeout(5000, () => req.destroy());
  }, 15000);
}

// Health check
function startHealthCheck() {
  const http = require('http');
  const s = createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', uptime: process.uptime() }));
  });
  s.listen(3001, '127.0.0.1', () => console.log('> Health: http://127.0.0.1:3001'));
}

// Next.js
async function startNext() {
  const next = require('next');
  const app = next({ dev: false, dir });
  const handle = app.getRequestHandler();
  await app.prepare();

  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      try {
        handle(req, res).catch(err => {
          console.error('[err]', req.url, err.message);
          if (!res.headersSent) { res.writeHead(500); res.end('Error'); }
        });
      } catch (err) {
        if (!res.headersSent) { res.writeHead(500); res.end('Error'); }
      }
    });
    server.listen(3000, '127.0.0.1', () => {
      console.log('> App: http://127.0.0.1:3000');
      resolve(server);
    });
  });
}

async function main() {
  console.log('LegalHub starting...');
  startHealthCheck();
  await startNext();
  startSelfPing(3000);
  console.log('LegalHub ready!');
}

main().catch(err => { console.error('[fatal]', err); process.exit(1); });
