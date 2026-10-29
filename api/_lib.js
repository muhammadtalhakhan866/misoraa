'use strict';
/* Shared helpers for the admin API: signed session cookie, request guards and product validation.
   Files starting with "_" inside /api are not exposed as routes. */
const crypto = require('crypto');

const COOKIE = 'misoraa_admin';
const MAX_AGE = 60 * 60 * 12;   /* a login lasts 12 hours */
const MAX_PHOTOS = 8;           /* pictures allowed per watch */
const MAX_PRODUCTS = 60;
const MAX_SPECS = 14;
const ART = ['w-chrono', 'w-classic', 'w-diver', 'w-skeleton', 'w-tonneau', 'w-moon'];

/* The session key is derived from the admin password itself, so there is one secret to manage
   and changing the password signs every existing session out. */
function sessionKey() {
  const pw = adminPassword();
  return pw ? crypto.createHash('sha256').update('misoraa-session:' + pw).digest() : null;
}

/* Environment variable names are case-sensitive, and a mistyped one (Admin_Password) is easy to make in
   the Vercel form, so both spellings are accepted. */
function adminPassword() { return process.env.ADMIN_PASSWORD || process.env.Admin_Password || ''; }

function configured() { return !!adminPassword(); }

function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', sessionKey()).update(body).digest('base64url');
  return body + '.' + sig;
}

function readCookie(req, name) {
  const header = req.headers.cookie || '';
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return null;
}

function isAdmin(req) {
  const key = sessionKey();
  if (!key) return false;
  const token = readCookie(req, COOKIE);
  if (!token) return false;
  const [body, sig] = token.split('.');
  if (!body || !sig) return false;
  const expected = crypto.createHmac('sha256', key).update(body).digest();
  let given;
  try { given = Buffer.from(sig, 'base64url'); } catch (e) { return false; }
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) return false;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    return typeof payload.exp === 'number' && payload.exp > Date.now() / 1000;
  } catch (e) { return false; }
}

function cookieHeader(value, maxAge, req) {
  const local = /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(req.headers.host || '');
  return COOKIE + '=' + value + '; HttpOnly; SameSite=Strict; Path=/; Max-Age=' + maxAge + (local ? '' : '; Secure');
}

function send(res, status, body, headers) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Robots-Tag', 'noindex');
  for (const k of Object.keys(headers || {})) res.setHeader(k, headers[k]);
  res.end(JSON.stringify(body));
}

/* Guard for anything that changes data: a custom header a cross-site form cannot send, and an
   Origin that matches this host. Together with SameSite=Strict this closes off cross-site requests. */
function sameSiteWrite(req) {
  if (req.headers['x-requested-with'] !== 'misoraa-admin') return false;
  const origin = req.headers.origin;
  if (origin) {
    try { if (new URL(origin).host !== req.headers.host) return false; } catch (e) { return false; }
  }
  return true;
}

/* Reads a request body whether or not the platform already parsed it. */
function readStream(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > limit) { reject(Object.assign(new Error('That file is too large.'), { status: 413 })); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

async function readJson(req) {
  let b = req.body;
  if (b === undefined) b = (await readStream(req, 1024 * 1024)).toString('utf8');
  if (Buffer.isBuffer(b)) b = b.toString('utf8');
  if (typeof b === 'string') { try { return b ? JSON.parse(b) : {}; } catch (e) { throw new Error('That was not valid JSON.'); } }
  return b && typeof b === 'object' ? b : {};
}

/* ---------- product validation ---------- */

const BLOB_URL = /^https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\/[^\s"'<>]+$/;
const DEV_URL = /^\/devdata\/photos\/[A-Za-z0-9._-]+$/;
const isBlobUrl = (v) => typeof v === 'string' && BLOB_URL.test(v);
const isDevUrl = (v) => typeof v === 'string' && DEV_URL.test(v);
function okPhoto(v) {
  if (typeof v !== 'string' || v.length > 700) return false;
  return BLOB_URL.test(v) || (!process.env.VERCEL && DEV_URL.test(v));
}

function text(v, max) {
  return typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max) : '';
}
/* Like text(), but keeps line breaks so a description can have paragraphs. */
function longText(v, max) {
  if (typeof v !== 'string') return '';
  return v.replace(/\r\n?/g, '\n').replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, ' ')
    .replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim().slice(0, max);
}
function money(v) {
  const n = typeof v === 'string' ? Number(v.replace(/[^0-9.]/g, '')) : v;
  return Number.isFinite(n) ? Math.round(n) : NaN;
}

/* Accepts only the shape the site understands, so nothing arbitrary is stored or later rendered. */
function cleanProducts(input) {
  const list = input && Array.isArray(input.products) ? input.products : null;
  if (!list) throw new Error('Send the products as { "products": [ ... ] }.');
  if (list.length > MAX_PRODUCTS) throw new Error('Too many products (' + MAX_PRODUCTS + ' at most).');

  const ids = new Set();
  let signatureTaken = false;
  const out = list.map((p, i) => {
    const n = i + 1;
    if (!p || typeof p !== 'object') throw new Error('Product ' + n + ' is not valid.');
    const id = typeof p.id === 'string' ? p.id : '';
    if (!/^[a-z0-9][a-z0-9-]{1,48}$/.test(id)) throw new Error('Product ' + n + ' has a bad id.');
    if (ids.has(id)) throw new Error('Two products share the id "' + id + '".');
    ids.add(id);

    const name = text(p.name, 80);
    if (!name) throw new Error('Product ' + n + ' needs a name.');

    const price = money(p.price);
    if (!(price >= 0 && price <= 10000000)) throw new Error('"' + name + '" needs a price between 0 and 10,000,000.');
    let was = p.wasPrice === undefined || p.wasPrice === null || p.wasPrice === '' ? 0 : money(p.wasPrice);
    if (!Number.isFinite(was) || was < 0 || was > 10000000) throw new Error('"' + name + '" has a bad old price.');
    if (was && was <= price) was = 0; /* an old price only means something if it is higher */

    const photos = Array.isArray(p.photos) ? p.photos : [];
    if (photos.length > MAX_PHOTOS) throw new Error('"' + name + '" has more than ' + MAX_PHOTOS + ' pictures.');
    photos.forEach((u) => { if (!okPhoto(u)) throw new Error('"' + name + '" has a picture address that is not allowed.'); });

    const specsIn = Array.isArray(p.specs) ? p.specs : [];
    const specs = specsIn
      .map((s) => ({ label: text(s && s.label, 40), value: text(s && s.value, 90) }))
      .filter((s) => s.label && s.value)
      .slice(0, MAX_SPECS);

    const visible = p.visible !== false;
    let signature = p.signature === true && visible && !signatureTaken;
    if (signature) signatureTaken = true;

    return {
      id,
      ref: text(p.ref, 24),
      name,
      caption: text(p.caption, 140),
      description: longText(p.description, 4000),
      price,
      wasPrice: was,
      tag: text(p.tag, 24),
      tagGold: p.tagGold === true,
      specs,
      photos,
      art: ART.indexOf(p.art) >= 0 ? p.art : '',
      signature,
      hot: p.hot === true,
      visible
    };
  });
  return { products: out, updatedAt: new Date().toISOString() };
}

function photoUrlsIn(data) {
  const urls = new Set();
  for (const p of (data && data.products) || []) for (const u of p.photos || []) urls.add(u);
  return urls;
}

module.exports = {
  COOKIE, MAX_AGE, MAX_PHOTOS, ART, configured, adminPassword, sign, isAdmin, cookieHeader, send, sameSiteWrite,
  readStream, readJson, cleanProducts, photoUrlsIn, isBlobUrl, isDevUrl, readCookie
};
