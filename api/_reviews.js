'use strict';
/* Customer review submissions.

   A submission (which includes a WhatsApp number) lives ONLY in the private store. What the public site
   shows is a separate, number-free list in the public store (content/reviews.json), rebuilt from the
   approved submissions every time one changes. */
const crypto = require('crypto');
const store = require('./_store');
const { adminPassword } = require('./_lib');

const STATUSES = ['pending', 'approved', 'rejected'];
const PUBLISHED = 'content/reviews.json';

class Invalid extends Error {}

const ready = () => store.privAvailable();

function clean(s, max) {
  return typeof s === 'string' ? s.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max) : '';
}

/* The visible parts of a review. The admin may use shorter text than a customer is allowed to. */
function cleanVisible(input, strict) {
  const name = clean(input.name, 60);
  if (!/^[\p{L}\p{M}][\p{L}\p{M}\s.'\-]{1,59}$/u.test(name)) throw new Invalid('Please enter your name (letters only, at least 2).');
  const rating = Math.round(Number(input.rating));
  if (!(rating >= 1 && rating <= 5)) throw new Invalid('Please choose a star rating.');
  const text = clean(input.review !== undefined ? input.review : input.text, 500);
  if (text.length < (strict ? 20 : 1)) throw new Invalid(strict ? 'Please write at least a sentence or two (20 characters).' : 'The review cannot be empty.');
  if (/https?:\/\/|www\./i.test(text)) throw new Invalid('Please leave web links out of your review.');
  return { name, rating, text };
}

/* WhatsApp number as digits with the country code. A Pakistani mobile may be written 0300 1234567,
   +92 300 1234567 or 0092 300 1234567; any other number needs its + country code. */
function cleanPhone(raw) {
  const s = String(raw || '').replace(/[\s\-().]/g, '');
  const plus = s.charAt(0) === '+';
  let n = s.replace(/\D/g, '');
  if (n.indexOf('0092') === 0) n = n.slice(2);
  else if (!plus && n.charAt(0) === '0') n = '92' + n.slice(1);
  const ok = n.indexOf('92') === 0 ? /^923\d{9}$/.test(n) : (plus && /^\d{10,15}$/.test(n));
  if (!ok) throw new Invalid('Please enter a valid WhatsApp number, for example 0300 1234567.');
  return n;
}

function cleanSubmission(input) {
  if (!input || typeof input !== 'object') throw new Invalid('Invalid request.');
  return Object.assign(cleanVisible(input, true), { whatsapp: cleanPhone(input.whatsapp) });
}

const ID = /^\d{13}-[a-f0-9]{12}$/;
const newId = () => Date.now() + '-' + crypto.randomBytes(6).toString('hex');
const keyFor = (id) => 'submissions/' + id + '.json';

async function loadSubmission(id) {
  if (typeof id !== 'string' || !ID.test(id)) return null;
  try { return await store.privRead(keyFor(id)); } catch (e) { return null; }
}
const saveSubmission = (sub) => store.privWrite(keyFor(sub.id), sub);
const removeSubmission = (id) => store.privRemove(keyFor(id));

async function allSubmissions() {
  const keys = await store.privList('submissions/');
  const out = [];
  for (let i = 0; i < keys.length; i += 10) {
    const batch = await Promise.all(keys.slice(i, i + 10).map((k) => store.privRead(k).catch(() => null)));
    batch.forEach((s) => { if (s && s.id) out.push(s); });
  }
  return out.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

/* Rebuild the public list from what is approved. Only name, rating and text go public. */
async function publish() {
  const subs = await allSubmissions();
  const reviews = subs
    .filter((s) => s.status === 'approved')
    .sort((a, b) => String(b.approvedAt || b.createdAt).localeCompare(String(a.approvedAt || a.createdAt)))   // newest first
    .map((s) => ({ id: s.id, name: s.name, rating: s.rating, text: s.text }));
  await store.writeJson(PUBLISHED, { reviews, updatedAt: new Date().toISOString() });
  return reviews;
}

async function readPublished() {
  const data = await store.readJson(PUBLISHED);
  return data && Array.isArray(data.reviews) ? data : { reviews: [] };
}

/* Per-visitor limit kept in the private store, so it holds across serverless instances. The visitor is only
   ever a salted hash, and the counter is per hour. Returns true when the visitor is over the limit. */
async function overLimit(ip, limit) {
  const hour = new Date().toISOString().slice(0, 13).replace(/[-T]/g, '');
  const salt = crypto.createHash('sha256').update('misoraa-reviews:' + adminPassword()).digest('hex');
  const key = 'rl/' + crypto.createHash('sha256').update(ip + '|' + salt).digest('hex').slice(0, 24) + '-' + hour + '.json';
  let n = 0;
  try { n = Number((await store.privRead(key) || {}).n) || 0; } catch (e) { n = 0; }
  if (n >= limit) return true;
  await store.privWrite(key, { n: n + 1 });
  return false;
}

/* Counters older than two days are of no use; clear them whenever the admin loads the list. */
async function pruneLimits() {
  try {
    const cutoff = new Date(Date.now() - 48 * 3600 * 1000).toISOString().slice(0, 13).replace(/[-T]/g, '');
    const keys = await store.privList('rl/');
    const stale = keys.filter((k) => (k.match(/-(\d{10})\.json$/) || [])[1] < cutoff);
    if (stale.length) await store.privRemove(stale);
  } catch (e) { /* housekeeping only */ }
}

module.exports = {
  STATUSES, Invalid, ready, cleanSubmission, cleanVisible, newId, ID,
  loadSubmission, saveSubmission, removeSubmission, allSubmissions, publish, readPublished, overLimit, pruneLimits
};
