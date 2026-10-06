// Tiny local stand-in for the Supabase API gateway + Storage, for tests only.
//   /rest/v1/*    -> PostgREST
//   /auth/v1/*    -> GoTrue
//   /storage/v1/* -> files on disk (admin-only writes, public reads)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const PORT = Number(process.env.GATEWAY_PORT || 54321);
const REST = process.env.REST_URL || 'http://127.0.0.1:54331';
const AUTH = process.env.AUTH_URL || 'http://127.0.0.1:54332';
const STORAGE_DIR = process.env.STORAGE_DIR;
const ANON_KEY = process.env.ANON_KEY;
const LIMITS = {
  produtos: {
    max: 5 * 1024 * 1024,
    types: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
  },
  documentos: { max: 25 * 1024 * 1024, types: ['application/pdf'] },
};
const MIME = {
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.avif': 'image/avif',
  '.pdf': 'application/pdf',
};

const send = (res, status, body, headers = {}) => {
  const data = typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body);
  res.writeHead(status, { 'content-type': 'application/json', ...cors, ...headers });
  res.end(data);
};
const cors = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': '*',
  'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS,HEAD',
  'access-control-expose-headers': '*',
};
const readBody = (req) =>
  new Promise((resolve) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
  });

async function proxy(req, res, target, stripPrefix) {
  const body = ['GET', 'HEAD'].includes(req.method) ? undefined : await readBody(req);
  const headers = { ...req.headers };
  delete headers.host;
  delete headers['content-length'];
  delete headers.connection;
  if (!headers.authorization && headers.apikey) headers.authorization = `Bearer ${headers.apikey}`;
  const url = target + req.url.slice(stripPrefix.length);
  const upstream = await fetch(url, { method: req.method, headers, body, redirect: 'manual' });
  const outHeaders = { ...cors };
  upstream.headers.forEach((v, k) => {
    if (!['content-encoding', 'transfer-encoding', 'content-length', 'connection'].includes(k))
      outHeaders[k] = v;
  });
  res.writeHead(upstream.status, outHeaders);
  res.end(Buffer.from(await upstream.arrayBuffer()));
}

/** Mirrors the storage policy: only users listed in admin_users may write. */
async function isAdmin(req) {
  const auth = req.headers.authorization;
  if (!auth) return false;
  const r = await fetch(`${REST}/admin_users?select=user_id`, {
    headers: { authorization: auth, apikey: ANON_KEY },
  });
  if (!r.ok) return false;
  const rows = await r.json();
  return Array.isArray(rows) && rows.length === 1;
}

function parseMultipart(buffer, contentType) {
  const m = /boundary=(?:"([^"]+)"|([^;]+))/.exec(contentType || '');
  if (!m) return null;
  const boundary = Buffer.from(`--${m[1] || m[2]}`);
  let pos = 0;
  const parts = [];
  while (true) {
    const start = buffer.indexOf(boundary, pos);
    if (start < 0) break;
    const next = buffer.indexOf(boundary, start + boundary.length);
    if (next < 0) break;
    const part = buffer.subarray(start + boundary.length + 2, next - 2);
    const headEnd = part.indexOf('\r\n\r\n');
    if (headEnd > 0)
      parts.push({ head: part.subarray(0, headEnd).toString(), data: part.subarray(headEnd + 4) });
    pos = next;
  }
  const file = parts.find((p) => /filename=/.test(p.head)) || parts.at(-1);
  if (!file) return null;
  const type = /content-type:\s*([^\r\n]+)/i.exec(file.head)?.[1]?.trim();
  return { data: file.data, type };
}

async function storage(req, res) {
  const url = new URL(req.url, 'http://x');
  const rest = decodeURIComponent(url.pathname.replace('/storage/v1/object/', ''));
  if ((req.method === 'GET' || req.method === 'HEAD') && rest.startsWith('public/')) {
    const file = path.join(STORAGE_DIR, path.normalize(rest.slice('public/'.length)));
    if (!file.startsWith(STORAGE_DIR) || !fs.existsSync(file))
      return send(res, 404, { error: 'not_found' });
    return send(res, 200, fs.readFileSync(file), {
      'content-type': MIME[path.extname(file)] || 'application/octet-stream',
      'cache-control': 'public, max-age=3600',
    });
  }
  if (!(await isAdmin(req)))
    return send(res, 403, {
      statusCode: '403',
      error: 'Unauthorized',
      message: 'new row violates row-level security policy',
    });
  const [bucket, ...segs] = rest.split('/');
  if (req.method === 'POST' || req.method === 'PUT') {
    const raw = await readBody(req);
    const ct = req.headers['content-type'] || '';
    const parsed = ct.startsWith('multipart/') ? parseMultipart(raw, ct) : { data: raw, type: ct };
    const rule = LIMITS[bucket];
    if (!rule || !parsed) return send(res, 400, { error: 'invalid', message: 'Bucket not found' });
    if (parsed.data.length > rule.max)
      return send(res, 413, {
        statusCode: '413',
        error: 'Payload too large',
        message: 'The object exceeded the maximum allowed size',
      });
    if (!rule.types.includes(parsed.type))
      return send(res, 415, {
        statusCode: '415',
        error: 'invalid_mime_type',
        message: `mime type ${parsed.type} is not supported`,
      });
    const file = path.join(STORAGE_DIR, bucket, path.normalize(segs.join('/')));
    if (!file.startsWith(STORAGE_DIR)) return send(res, 400, { error: 'invalid' });
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, parsed.data);
    return send(res, 200, { Key: `${bucket}/${segs.join('/')}`, Id: 'local' });
  }
  if (req.method === 'DELETE') {
    const body = JSON.parse((await readBody(req)).toString() || '{}');
    const removed = [];
    for (const p of body.prefixes || []) {
      const file = path.join(STORAGE_DIR, bucket, path.normalize(p));
      if (file.startsWith(STORAGE_DIR) && fs.existsSync(file)) {
        fs.unlinkSync(file);
        removed.push({ name: p, bucket_id: bucket });
      }
    }
    return send(res, 200, removed);
  }
  return send(res, 405, { error: 'method_not_allowed' });
}

http
  .createServer(async (req, res) => {
    try {
      if (req.method === 'OPTIONS') return send(res, 204, '');
      if (req.url.startsWith('/rest/v1')) return await proxy(req, res, REST, '/rest/v1');
      if (req.url.startsWith('/auth/v1')) return await proxy(req, res, AUTH, '/auth/v1');
      if (req.url.startsWith('/storage/v1/object/')) return await storage(req, res);
      send(res, 404, { error: 'not_found' });
    } catch (error) {
      send(res, 502, { error: 'gateway', message: String(error?.message || error) });
    }
  })
  .listen(PORT, '127.0.0.1', () => console.log(`local gateway on http://127.0.0.1:${PORT}`));
