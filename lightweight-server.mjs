import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';

const PORT = 3000;
const DB = '/home/z/my-project/db/custom.db';

// Simple HTML serving
const serveHTML = (res, file) => {
  try {
    const html = readFileSync(file, 'utf-8');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
};

const server = createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
  
  // Health check
  if (req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', uptime: process.uptime() }));
    return;
  }
  
  // For everything else, serve the built HTML
  const htmlPath = join('/home/z/my-project/.next/server/app/index.html');
  if (existsSync(htmlPath)) {
    serveHTML(res, htmlPath);
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<html><head><meta charset="utf-8"><title>LegalHub</title></head><body><h1>LegalHub - سامانه حقوقی</h1><p>Server is running on port 3000</p></body></html>');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Lightweight server on :${PORT}`);
  // Log uptime every 30s
  setInterval(() => {
    console.log(`Uptime: ${Math.round(process.uptime())}s | Memory: ${Math.round(process.memoryUsage().heapUsed/1024/1024)}MB`);
  }, 30000);
});
