'use strict';
const { send, readJson } = require('./_lib');
const R = require('./_reviews');

const LIMIT = 4; /* reviews per visitor per hour, counted in the private store */

module.exports = async function reviews(req, res) {
  /* Public: the approved reviews, with no contact details in them. */
  if (req.method === 'GET') {
    try {
      const data = await R.readPublished();
      return send(res, 200, { reviews: data.reviews }, { 'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30' });
    } catch (e) {
      return send(res, 200, { reviews: [] }, { 'Cache-Control': 'public, s-maxage=5' });
    }
  }

  /* Public: a customer sends a review. It waits for approval and is never shown until then. */
  if (req.method === 'POST') {
    if (!/^application\/json/i.test(req.headers['content-type'] || '')) return send(res, 415, { error: 'Invalid request.' });
    const origin = req.headers.origin;
    if (origin) {
      try { if (new URL(origin).host !== req.headers.host) return send(res, 403, { error: 'Request not allowed.' }); }
      catch (e) { return send(res, 403, { error: 'Request not allowed.' }); }
    }
    if (!R.ready()) return send(res, 503, { error: 'Reviews cannot be sent right now. Please try again later.' });

    let body;
    try { body = await readJson(req); } catch (e) { return send(res, 400, { error: e.message }); }

    /* Bots fill the hidden field: answer as if it worked and store nothing. A form sent within three
       seconds of opening is not a person typing, but a real one (autofill) deserves an honest reply. */
    if (body.website) return send(res, 200, { ok: true });
    if (!(Number(body.t) >= 3000)) return send(res, 400, { error: 'Please read your review once more, then press Submit again.' });

    let visible;
    try { visible = R.cleanSubmission(body); } catch (e) {
      if (e instanceof R.Invalid) return send(res, 400, { error: e.message });
      throw e;
    }

    /* Counted only once the review itself is valid, so a typo does not use up an attempt. */
    const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown').split(',')[0].trim();
    try {
      if (await R.overLimit(ip, LIMIT)) return send(res, 429, { error: 'You have sent several reviews already. Please try again later.' });
    } catch (e) { /* if the counter is unavailable, accept rather than lose a genuine review */ }

    const submission = Object.assign({
      id: R.newId(),
      createdAt: new Date().toISOString(),
      status: 'pending',
      original: { name: visible.name, rating: visible.rating, text: visible.text }
    }, visible);
    try {
      await R.saveSubmission(submission);
    } catch (e) {
      return send(res, 500, { error: 'Your review could not be saved. Please try again in a moment.' });
    }
    // The id lets the visitor's own browser recognise its review once it is approved. It reveals nothing.
    return send(res, 200, { ok: true, id: submission.id });
  }

  return send(res, 405, { error: 'Use GET or POST.' });
};
