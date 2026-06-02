// LegalHub Monolithic Server
// Next.js + Reverse Proxy + Keepalive all in one process
const { createServer } = require('http');
const next = require('next');

const dev = false;
const dir = __dirname;
const app = next({ dev, dir });
const handle = app.getRequestHandler();

// Self-ping interval to keep server warm and process alive
let selfPingInterval = null;

async function main() {
  await app.prepare();

  const server = createServer((req, res) => {
    try {
      handle(req, res).catch(err => {
        console.error('[handler-err]', req.url, err.message);
        if (!res.headersSent) { res.writeHead(500); res.end('Error'); }
      });
    } catch (err) {
      console.error('[sync-err]', req.url, err.message);
      if (!res.headersSent) { res.writeHead(500); res.end('Error'); }
    }
  });

  await new Promise((resolve) => {
    server.listen(3000, '127.0.0.1', () => {
      console.log('> Ready on http://127.0.0.1:3000');
      resolve(undefined);
    });
  });

  // Self-ping every 20s to keep the event loop active and server warm
  selfPingInterval = setInterval(() => {
    const http = require('http');
    const req = http.get('http://127.0.0.1:3000/', (res) => {
      res.resume(); // drain
    });
    req.on('error', () => {}); // ignore self-ping errors
    req.setTimeout(5000, () => req.destroy());
  }, 20000);

  console.log('> Self-ping keepalive active');
}

main().catch(err => {
  console.error('[fatal]', err);
  process.exit(1);
});
