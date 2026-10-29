'use strict';
const { isAdmin, send, sameSiteWrite, readJson, cleanProducts, photoUrlsIn } = require('./_lib');
const store = require('./_store');

const PATH = 'content/products.json';

module.exports = async function products(req, res) {
  if (req.method === 'GET') {
    /* Only the admin page, asking with ?all=1, sees hidden watches. The public site never does,
       even when its owner is logged in, so what they preview is what visitors get. */
    const admin = isAdmin(req) && /[?&]all=1(&|$)/.test(req.url || '');
    try {
      const data = await store.readJson(PATH);
      /* Nothing saved yet: tell the page to use the products built into the site. */
      if (!data || !Array.isArray(data.products)) {
        return send(res, 200, { products: null }, { 'Cache-Control': admin ? 'no-store' : 'public, s-maxage=5' });
      }
      /* Visitors never see hidden watches; the admin sees everything. */
      const list = admin ? data.products : data.products.filter((p) => p.visible !== false);
      return send(res, 200, { products: list, updatedAt: data.updatedAt || null },
        { 'Cache-Control': admin ? 'no-store' : 'public, s-maxage=10, stale-while-revalidate=30' });
    } catch (e) {
      /* Storage missing or unreachable: the site simply shows its built-in products. */
      return send(res, 200, { products: null }, { 'Cache-Control': 'public, s-maxage=5' });
    }
  }

  if (req.method === 'PUT') {
    if (!isAdmin(req)) return send(res, 401, { error: 'Please log in again.' });
    if (!sameSiteWrite(req)) return send(res, 403, { error: 'Request not allowed.' });
    if (!store.available()) return send(res, 503, { error: 'Storage is not connected yet. Link a Blob store to the Vercel project first.' });

    let next;
    try { next = cleanProducts(await readJson(req)); } catch (e) { return send(res, 400, { error: e.message }); }

    try {
      let previous = null;
      try { previous = await store.readJson(PATH); } catch (e) { previous = null; }
      await store.writeJson(PATH, next);
      /* Free the storage taken by pictures that no watch uses any more. */
      const keep = photoUrlsIn(next);
      const drop = [...photoUrlsIn(previous)].filter((u) => !keep.has(u));
      if (drop.length) await store.removePhotos(drop);
      return send(res, 200, next, { 'Cache-Control': 'no-store' });
    } catch (e) {
      return send(res, 500, { error: 'Could not save. ' + (e && e.message ? e.message : '') });
    }
  }

  return send(res, 405, { error: 'Use GET or PUT.' });
};
