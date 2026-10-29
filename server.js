/* Local preview server:  node server.js  →  http://localhost:5173

   Serves the static site and runs the /api handlers the way Vercel would, so the admin page can be
   tried on this machine. With no Blob token the API keeps its data in .devdata/ (see api/_store.js).
   This file is only for local use: it is not deployed. */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5173;
const ROOT = __dirname;
const DEV_ROOT = path.join(ROOT, '.devdata');

/* A fixed password for trying the admin locally. It never applies on Vercel, which does not run this file. */
if (!process.env.ADMIN_PASSWORD) process.env.ADMIN_PASSWORD = 'misoraa-local';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm'
};

function sendFile(req, res, file) {
  fs.stat(file, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found');
      return;
    }
    const type = TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream';
    const range = req.headers.range;

    // Video needs byte ranges to seek — Safari refuses to play without them.
    if (range) {
      const m = /^bytes=(\d*)-(\d*)$/.exec(range);
      if (m) {
        const start = m[1] ? parseInt(m[1], 10) : 0;
        const end = m[2] ? parseInt(m[2], 10) : stat.size - 1;
        if (isNaN(start) || isNaN(end) || start > end || end >= stat.size) {
          res.writeHead(416, { 'Content-Range': `bytes */${stat.size}` }).end();
          return;
        }
        res.writeHead(206, {
          'Content-Type': type,
          'Content-Length': end - start + 1,
          'Content-Range': `bytes ${start}-${end}/${stat.size}`,
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'no-store'
        });
        fs.createReadStream(file, { start, end }).pipe(res);
        return;
      }
    }

    res.writeHead(200, {
      'Content-Type': type,
      'Content-Length': stat.size,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'no-store'
    });
    fs.createReadStream(file).pipe(res);
  });
}

/* Vercel parses JSON bodies for a handler; do the same here. Other bodies (picture uploads) are left
   as a stream for the handler to read itself. */
function parseJsonBody(req) {
  return new Promise((resolve) => {
    if (!/json/.test(req.headers['content-type'] || '') || req.method === 'GET') return resolve();
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      try { req.body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'); } catch (e) { req.body = '{bad'; }
      resolve();
    });
  });
}

async function runApi(req, res, name) {
  if (!/^[a-z0-9-]+$/.test(name)) { res.writeHead(404).end('Not found'); return; }
  const file = path.join(ROOT, 'api', name + '.js');
  if (!fs.existsSync(file)) { res.writeHead(404, { 'Content-Type': 'application/json' }).end('{"error":"No such route."}'); return; }
  await parseJsonBody(req);
  try {
    delete require.cache[require.resolve(file)];   // pick up edits without restarting
    await require(file)(req, res);
  } catch (e) {
    console.error('[api/' + name + ']', e);
    if (!res.headersSent) res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end('{"error":"Server error."}');
  }
}

http.createServer((req, res) => {
  let rel = decodeURIComponent(req.url.split('?')[0]);
  if (rel === '/') rel = '/index.html';

  if (rel.startsWith('/api/')) { runApi(req, res, rel.slice(5)); return; }

  if (rel.startsWith('/devdata/')) {
    const file = path.resolve(DEV_ROOT, rel.slice('/devdata/'.length));
    if (!file.startsWith(DEV_ROOT + path.sep)) { res.writeHead(403).end('Forbidden'); return; }
    sendFile(req, res, file);
    return;
  }

  // Admin lives at /admin/ — serve its index.
  if (rel.endsWith('/')) rel += 'index.html';

  const file = path.join(ROOT, path.normalize(rel).replace(/^[\\/]+/, ''));
  if (!file.startsWith(ROOT)) { res.writeHead(403).end('Forbidden'); return; }
  // Never hand out source, secrets or local data, as the deployed site would not either.
  const top = path.relative(ROOT, file).split(path.sep)[0];
  if (top.startsWith('.') || ['api', 'node_modules', 'server.js', 'package.json', 'package-lock.json'].includes(top)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found');
    return;
  }
  sendFile(req, res, file);
}).listen(PORT, () => {
  console.log(`MISORAA running at http://localhost:${PORT}`);
  console.log(`Admin: http://localhost:${PORT}/admin/   (local password: ${process.env.ADMIN_PASSWORD})`);
});
