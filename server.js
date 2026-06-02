// LegalHub Server - Custom Node.js server for Next.js
const { createServer } = require('http');
const next = require('next');

const dev = false;
const hostname = '127.0.0.1';
const port = 3000;

const app = next({ dev, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    // Enhanced error handling
    try {
      handle(req, res).catch(err => {
        console.error('Handle error:', err.message);
        if (!res.headersSent) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Internal server error' }));
        }
      });
    } catch (err) {
      console.error('Sync error:', err.message);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
      }
    }
  }).listen(port, hostname, () => {
    console.log(`> LegalHub ready on http://${hostname}:${port}`);
  });
}).catch(err => {
  console.error('Prepare error:', err);
  process.exit(1);
});
