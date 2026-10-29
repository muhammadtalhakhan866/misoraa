/* ==========================================================================
   MISORAA — the watch catalogue
   Loads the product list (from the admin's saved list, or the built-in one in products-seed.js),
   and builds the cards, the signature section and the signature links used across the site.
   ========================================================================== */
(function () {
  'use strict';

  /* The shop's WhatsApp number: digits only, country code first. Every page reads it from here. */
  window.MISORAA_WHATSAPP = '923162464884';

  var SEED = (window.MISORAA_SEED && window.MISORAA_SEED.products) || [];
  var WAIT_MS = 2500;   // how long to wait for the product service before using the built-in list

  var $ = function (s, c) { return (c || document).querySelector(s); };

  var el = function (tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  };

  var shown = function (list) {
    return list.filter(function (p) { return p && p.visible !== false; });
  };

  /* ---------- Loading ---------- */
  var pending = null;
  var load = function () {
    if (pending) return pending;
    pending = new Promise(function (resolve) {
      var done = false;
      var finish = function (list) { if (!done) { done = true; resolve(list); } };
      var fallback = function () { finish(shown(SEED)); };

      if (!window.fetch || location.protocol === 'file:') { fallback(); return; }
      var timer = setTimeout(fallback, WAIT_MS);
      fetch('/api/products', { headers: { Accept: 'application/json' } })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) {
          clearTimeout(timer);
          finish(d && Array.isArray(d.products) ? shown(d.products) : shown(SEED));
        })
        .catch(function () { clearTimeout(timer); fallback(); });
    });
    return pending;
  };

  /* ---------- Small helpers ---------- */
  var money = function (n) { return 'PKR ' + Number(n || 0).toLocaleString('en-US'); };
  var hrefFor = function (p) { return 'product.html?id=' + encodeURIComponent(p.id); };
  var signatureOf = function (list) {
    for (var i = 0; i < list.length; i++) if (list[i].signature) return list[i];
    return null;
  };
  var byId = function (list, id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  };
  var waLink = function (text) {
    return 'https://wa.me/' + window.MISORAA_WHATSAPP + '?text=' + encodeURIComponent(text);
  };

  /* The last word of a name is set in gold, as on the headings. */
  var goldLastWord = function (node, name) {
    var parts = String(name).trim().split(/\s+/);
    if (parts.length < 2) { node.textContent = name; return; }
    var last = parts.pop();
    node.appendChild(document.createTextNode(parts.join(' ') + ' '));
    node.appendChild(el('span', 'gold-text', last));
  };

  /* A watch's picture: its first photo, else the built-in illustration, else the logo. */
  var media = function (p, big) {
    if (p.photos && p.photos.length) {
      var img = el('img', 'wp-photo');
      img.src = p.photos[0];
      img.alt = p.name;
      img.loading = big ? 'eager' : 'lazy';
      img.decoding = 'async';
      // A picture that fails to load is swapped for the illustration (or the logo) rather than left broken.
      img.addEventListener('error', function () {
        if (img.parentNode) img.parentNode.replaceChild(media({ name: p.name, art: p.art, photos: [] }, big), img);
      });
      return img;
    }
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    var use = document.createElementNS(ns, 'use');
    if (p.art) {
      svg.setAttribute('viewBox', '0 0 300 440');
      use.setAttribute('href', '#' + p.art);
    } else {
      svg.setAttribute('viewBox', '0 0 200 200');
      svg.setAttribute('class', 'wp-placeholder');
      use.setAttribute('href', '#logo-mark');
    }
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', p.name);
    svg.appendChild(use);
    return svg;
  };

  /* ---------- Cards ---------- */
  var card = function (p) {
    var c = el('article', 'card reveal');

    var m = el('div', 'card-media');
    if (p.tag) m.appendChild(el('span', 'card-tag' + (p.tagGold ? ' new' : ''), p.tag));
    m.appendChild(media(p));
    var q = el('div', 'card-quick');
    q.appendChild(el('span', 'card-quick-label', 'View Details'));
    m.appendChild(q);
    c.appendChild(m);

    var b = el('div', 'card-body');
    if (p.ref) b.appendChild(el('p', 'card-ref', 'Ref. ' + p.ref));
    var h = el('h3', 'card-name');
    var a = el('a', '', p.name);
    a.href = hrefFor(p);
    h.appendChild(a);
    b.appendChild(h);
    if (p.caption) b.appendChild(el('p', 'card-desc', p.caption));

    var foot = el('div', 'card-foot');
    var price = el('span', 'card-price');
    price.appendChild(el('span', 'gold-text', money(p.price)));
    if (p.wasPrice) price.appendChild(el('s', 'card-was', money(p.wasPrice)));
    foot.appendChild(price);
    if (p.hot) foot.appendChild(el('span', 'card-hot', 'Hot'));
    b.appendChild(foot);
    c.appendChild(b);
    return c;
  };

  var reveal = function (nodes) { if (window.MisoraaReveal) window.MisoraaReveal(nodes); };

  /* ---------- Links that should always point at the signature watch ---------- */
  var applySignatureLinks = function (list) {
    var target = signatureOf(list) || list[0];
    if (!target) return;
    Array.prototype.forEach.call(document.querySelectorAll('[data-signature-link]'), function (a) {
      a.href = hrefFor(target);
    });
  };

  /* ---------- Home page ---------- */
  var renderGrid = function (list) {
    var grid = $('#grid');
    if (!grid) return;
    grid.textContent = '';
    if (!list.length) {
      grid.appendChild(el('p', 'section-sub', 'New watches are on their way. Please check back soon.'));
      return;
    }
    list.forEach(function (p) { grid.appendChild(card(p)); });
    reveal(grid.children);
  };

  var renderSignature = function (list) {
    var section = $('#signature');
    var block = $('#signatureBlock');
    if (!section || !block) return;
    var p = signatureOf(list);
    if (!p) { section.hidden = true; return; }

    block.textContent = '';
    var visual = el('div', 'split-visual');
    ['tl', 'tr', 'bl', 'br'].forEach(function (c) { visual.appendChild(el('span', 'corner ' + c)); });
    visual.appendChild(media(p, true));
    block.appendChild(visual);

    var info = el('div');
    info.appendChild(el('p', 'eyebrow', 'The Signature Piece'));
    var h = el('h2', 'section-title');
    goldLastWord(h, p.name);
    info.appendChild(h);

    var lead = p.caption || (p.description || '').split('\n')[0];
    if (lead) info.appendChild(el('p', 'section-sub', lead));

    if (p.specs && p.specs.length) {
      var ul = el('ul', 'spec-list');
      p.specs.slice(0, 5).forEach(function (s) {
        var li = el('li');
        li.appendChild(el('span', '', s.label));
        li.appendChild(el('b', '', s.value));
        ul.appendChild(li);
      });
      info.appendChild(ul);
    }

    var btn = el('a', 'btn btn--solid');
    btn.href = hrefFor(p);
    btn.appendChild(el('span', '', 'View The Piece'));
    info.appendChild(btn);
    block.appendChild(info);
    section.hidden = false;
  };

  var start = function () {
    load().then(function (list) {
      applySignatureLinks(list);
      renderGrid(list);
      renderSignature(list);
    });
  };

  window.MisoraaCatalog = {
    load: load, money: money, card: card, media: media, hrefFor: hrefFor, signatureOf: signatureOf,
    byId: byId, waLink: waLink, goldLastWord: goldLastWord, el: el, reveal: reveal
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
