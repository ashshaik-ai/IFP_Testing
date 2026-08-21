const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 9090;
const ROOT = path.resolve(__dirname, '..');

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
};

const server = http.createServer((req, res) => {
  console.log(`[REQ] ${req.method} ${req.url}`);
  let safePath = decodeURIComponent(req.url.split('?')[0]);
  if (safePath === '/') {
    safePath = '/index.html';
  }

  let filePath = path.join(ROOT, safePath);

  if (!filePath.startsWith(ROOT)) {
    console.log(`[ERR] Forbidden: ${filePath}`);
    res.statusCode = 403;
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    fs.stat(filePath, (fileErr, fileStats) => {
      if (fileErr || !fileStats.isFile()) {
        console.log(`[404] Not Found: ${filePath}`);
        res.statusCode = 404;
        res.end('Not Found');
        return;
      }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    const stream = fs.createReadStream(filePath);
    stream.on('error', (streamErr) => {
      console.log(`[ERR] Stream error on ${req.url}:`, streamErr);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    });
    stream.pipe(res);
    res.on('finish', () => {
      console.log(`[RES] 200 OK: ${req.url}`);
    });
    });
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Server running at http://127.0.0.1:${PORT}/`);
});
