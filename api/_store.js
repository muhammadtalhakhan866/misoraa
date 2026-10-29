'use strict';
/* Storage for the product list and the uploaded pictures.

   On Vercel this is a Blob store (BLOB_READ_WRITE_TOKEN is set when a store is linked to the
   project). On a developer's machine, where there is no token, it falls back to plain files under
   .devdata/ so the admin can be tried without touching real storage. On Vercel without a token it
   reports "not available" instead of quietly writing somewhere that disappears. */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { isBlobUrl, isDevUrl } = require('./_lib');

const DEV_ROOT = path.join(__dirname, '..', '.devdata');
const useBlob = () => !!process.env.BLOB_READ_WRITE_TOKEN;
const mode = () => (useBlob() ? 'blob' : (process.env.VERCEL ? 'none' : 'files'));
const available = () => mode() !== 'none';

function devPath(rel) {
  const full = path.resolve(DEV_ROOT, rel);
  if (full !== DEV_ROOT && !full.startsWith(DEV_ROOT + path.sep)) throw new Error('Bad path.');
  return full;
}

async function readJson(key) {
  if (useBlob()) {
    const { list } = require('@vercel/blob');
    const { blobs } = await list({ prefix: key, limit: 5 });
    const found = blobs.find((b) => b.pathname === key);
    if (!found) return null;
    /* The stored file is cached at the edge for a minute, and the listing can lag a save, so ask
       with a marker that rolls every 5 seconds; that bounds how stale a read can be. */
    const res = await fetch(found.url + '?v=' + Math.floor(Date.now() / 5000), { cache: 'no-store' });
    return res.ok ? res.json() : null;
  }
  if (mode() === 'files') {
    try { return JSON.parse(fs.readFileSync(devPath(key), 'utf8')); } catch (e) { return null; }
  }
  return null;
}

async function writeJson(key, data) {
  const body = JSON.stringify(data);
  if (useBlob()) {
    const { put } = require('@vercel/blob');
    await put(key, body, {
      access: 'public', contentType: 'application/json',
      addRandomSuffix: false, allowOverwrite: true, cacheControlMaxAge: 60
    });
    return;
  }
  if (mode() === 'files') {
    const p = devPath(key);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, body);
    return;
  }
  throw new Error('Storage is not connected yet.');
}

/* Saves a picture and returns the address the site will load it from. */
async function putPhoto(name, buffer, contentType) {
  if (useBlob()) {
    const { put } = require('@vercel/blob');
    const { url } = await put('photos/' + name, buffer, { access: 'public', contentType, addRandomSuffix: true });
    return url;
  }
  if (mode() === 'files') {
    const file = name.replace(/(\.[a-z]+)$/, '-' + crypto.randomBytes(4).toString('hex') + '$1');
    const p = devPath('photos/' + file);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, buffer);
    return '/devdata/photos/' + file;
  }
  throw new Error('Storage is not connected yet.');
}

async function removePhotos(urls) {
  const blobs = urls.filter(isBlobUrl);
  if (blobs.length && useBlob()) {
    const { del } = require('@vercel/blob');
    try { await del(blobs); } catch (e) { /* leftovers are harmless */ }
  }
  if (mode() === 'files') {
    for (const u of urls.filter(isDevUrl)) {
      try { fs.unlinkSync(devPath(u.replace(/^\/devdata\//, ''))); } catch (e) { /* already gone */ }
    }
  }
}

module.exports = { DEV_ROOT, mode, available, readJson, writeJson, putPhoto, removePhotos };
