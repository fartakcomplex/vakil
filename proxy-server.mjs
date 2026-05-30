import { createServer } from 'http';
import { execSync } from 'child_process';

const PORT = 3000;
const BACKEND = 'http://127.0.0.1:3001';

let backend = null;

function startBackend() {
  if (backend) return;
  console.log('Starting Next.js backend on port 3001...');
  backend = execSync('cd /home/z/my-project && NODE_OPTIONS="--max-old-space-size=200" npx next start -p 3001', 
    { stdio: 'pipe', detached: false, timeout: 0 });
}

// Actually, let's not start Next.js as child process
// Instead, start it separately and just proxy

const proxy = createServer((req, res) => {
  res.setHeader('Connection', 'close');
  
  // Make proxied request with Connection: close
  const options = {
    hostname: '127.0.0.1',
    port: 3001,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, 'Connection': 'close', 'Host': 'localhost:3001' },
  };
  
  const proxyReq = require('http').request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });
  proxyReq.on('error', (e) => {
    res.writeHead(502);
    res.end('Backend unavailable');
  });
  req.pipe(proxyReq);
});

proxy.listen(PORT, '0.0.0.0', () => {
  console.log(`Proxy on :${PORT} -> Backend :3001`);
});
