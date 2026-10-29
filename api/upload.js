'use strict';
const { isAdmin, send, sameSiteWrite, readStream, readJson, photoUrlsIn, isBlobUrl, isDevUrl } = require('./_lib');
const store = require('./_store');

/* The admin shrinks every picture in the browser first (to about 1600 px), so a watch photo is a few
   hundred KB. That keeps it under the 4.5 MB a serverless request may carry. */
const MAX_BYTES = 4 * 1024 * 1024;

/* Decide the real type from the file's own first bytes, never from what the browser claims. */
function sniff(b) {
  if (b.length > 12 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { type: 'image/jpeg', ext: 'jpg' };
  if (b.length > 12 && b[0] === 0x89 && b.toString('ascii', 1, 4) === 'PNG') return { type: 'image/png', ext: 'png' };
  if (b.length > 12 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') return { type: 'image/webp', ext: 'webp' };
  return null;
}

/* DELETE: the admin uploaded a picture, then cancelled before saving. Pictures a saved watch uses are
   never removed here; those are cleaned up when the watch's list is saved. */
async function discard(req, res) {
  try {
    const url = (await readJson(req)).url;
    if (!isBlobUrl(url) && !isDevUrl(url)) return send(res, 400, { error: 'Not a picture address.' });
    const saved = await store.readJson('content/products.json');
    if (photoUrlsIn(saved).has(url)) return send(res, 409, { error: 'That picture is in use.' });
    await store.removePhotos([url]);
    return send(res, 200, { ok: true }, { 'Cache-Control': 'no-store' });
  } catch (e) {
    return send(res, 500, { error: 'Could not remove it.' });
  }
}

module.exports = async function upload(req, res) {
  if (req.method !== 'POST' && req.method !== 'DELETE') return send(res, 405, { error: 'Use POST or DELETE.' });
  if (!sameSiteWrite(req)) return send(res, 403, { error: 'Request not allowed.' });
  if (!isAdmin(req)) return send(res, 401, { error: 'Please log in again.' });
  if (req.method === 'DELETE') return discard(req, res);
  if (!store.available()) return send(res, 503, { error: 'Storage is not connected yet. Link a Blob store to the Vercel project first.' });

  try {
    let buf = req.body;
    if (!Buffer.isBuffer(buf)) buf = await readStream(req, MAX_BYTES);
    if (buf.length > MAX_BYTES) return send(res, 413, { error: 'That picture is too large.' });

    const kind = sniff(buf);
    if (!kind) return send(res, 400, { error: 'Only JPG, PNG or WebP pictures can be uploaded.' });

    const base = String(req.headers['x-file-name'] || 'watch')
      .toLowerCase().replace(/\.[a-z0-9]+$/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'watch';
    const url = await store.putPhoto(base + '.' + kind.ext, buf, kind.type);
    return send(res, 200, { url }, { 'Cache-Control': 'no-store' });
  } catch (e) {
    return send(res, e && e.status ? e.status : 500, { error: e && e.message ? e.message : 'Upload failed.' });
  }
};
