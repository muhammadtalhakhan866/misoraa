/* ==========================================================================
   MISORAA — the bag
   "Add to Bag" keeps watches in the visitor's browser; the bag slides in from the right and sends the
   whole order to the shop on WhatsApp. There is no online payment: the shop confirms availability,
   delivery and payment with the customer in that chat.
   ========================================================================== */
(function () {
  'use strict';

  var C = window.MisoraaCatalog;
  if (!C) return;

  var KEY = 'misoraa_bag';
  var MAX_QTY = 10;
  var MAX_LINES = 30;
  var el = C.el;

  /* ---------- storage (every access guarded: private mode can throw) ---------- */
  var load = function () {
    try {
      var raw = window.localStorage.getItem(KEY);
      var list = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(list)) return [];
      return list.filter(function (i) {
        return i && typeof i.id === 'string' && typeof i.qty === 'number' && i.qty >= 1;
      }).map(function (i) { return { id: i.id, qty: Math.min(MAX_QTY, Math.floor(i.qty)) }; }).slice(0, MAX_LINES);
    } catch (e) { return []; }
  };
  var save = function () {
    try { window.localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) { /* ignore */ }
  };

  var items = load();
  var count = function () { return items.reduce(function (n, i) { return n + i.qty; }, 0); };

  /* ---------- the badge on the bag icon ---------- */
  var badge = document.getElementById('cartCount');
  var updateBadge = function () {
    if (!badge) return;
    var n = count();
    badge.textContent = String(n);
    badge.hidden = n === 0;
  };

  /* ---------- the drawer ---------- */
  var dlg = null;
  var listBox, totalEl, orderBtn, emptyBox, footBox;

  var build = function () {
    dlg = el('dialog', 'bag');
    dlg.setAttribute('aria-labelledby', 'bagTitle');

    var inner = el('div', 'bag-inner');

    var head = el('div', 'bag-head');
    var title = el('h2', '', 'Your Bag');
    title.id = 'bagTitle';
    head.appendChild(title);
    var close = el('button', 'bag-close', '×');
    close.type = 'button';
    close.setAttribute('aria-label', 'Close the bag');
    close.addEventListener('click', hide);
    head.appendChild(close);
    inner.appendChild(head);

    listBox = el('div', 'bag-list');
    inner.appendChild(listBox);

    emptyBox = el('div', 'bag-empty');
    emptyBox.appendChild(el('p', '', 'Your bag is empty.'));
    var browse = el('a', 'btn', '');
    browse.href = 'index.html#collection';
    browse.appendChild(el('span', '', 'Browse the Collection'));
    browse.addEventListener('click', hide);
    emptyBox.appendChild(browse);
    inner.appendChild(emptyBox);

    footBox = el('div', 'bag-foot');
    var tot = el('div', 'bag-total');
    tot.appendChild(el('span', '', 'Total'));
    totalEl = el('b', 'gold-text', '');
    tot.appendChild(totalEl);
    footBox.appendChild(tot);
    orderBtn = el('a', 'btn btn--solid');
    orderBtn.target = '_blank';
    orderBtn.rel = 'noopener';
    orderBtn.appendChild(el('span', '', 'Order on WhatsApp'));
    footBox.appendChild(orderBtn);
    footBox.appendChild(el('p', 'bag-note', 'We confirm availability, delivery and payment with you on WhatsApp.'));
    inner.appendChild(footBox);

    dlg.appendChild(inner);
    document.body.appendChild(dlg);

    dlg.addEventListener('click', function (e) { if (e.target === dlg) hide(); });
    dlg.addEventListener('close', function () { document.body.style.overflow = ''; });
  };

  var lineNode = function (p, qty) {
    var row = el('div', 'bag-line');
    var thumb = el('a', 'bag-thumb');
    thumb.href = C.hrefFor(p);
    thumb.appendChild(C.media(p));
    row.appendChild(thumb);

    var info = el('div', 'bag-info');
    var name = el('a', 'bag-name', p.name);
    name.href = C.hrefFor(p);
    info.appendChild(name);
    if (p.ref) info.appendChild(el('span', 'bag-ref', 'Ref. ' + p.ref));
    info.appendChild(el('span', 'bag-price', C.money(p.price)));

    var qtyBox = el('div', 'bag-qty');
    var minus = el('button', '', '−');
    minus.type = 'button';
    minus.setAttribute('aria-label', 'One fewer');
    minus.addEventListener('click', function () { change(p.id, -1); });
    var n = el('span', '', String(qty));
    var plus = el('button', '', '+');
    plus.type = 'button';
    plus.setAttribute('aria-label', 'One more');
    plus.disabled = qty >= MAX_QTY;
    plus.addEventListener('click', function () { change(p.id, 1); });
    qtyBox.appendChild(minus); qtyBox.appendChild(n); qtyBox.appendChild(plus);
    info.appendChild(qtyBox);
    row.appendChild(info);

    var rm = el('button', 'bag-remove', '✕');
    rm.type = 'button';
    rm.setAttribute('aria-label', 'Remove ' + p.name);
    rm.addEventListener('click', function () { remove(p.id); });
    row.appendChild(rm);
    return row;
  };

  var orderMessage = function (lines, total) {
    var out = ['Hello MISORAA, I would like to order:'];
    lines.forEach(function (l) {
      out.push(l.qty + ' × ' + l.p.name + (l.p.ref ? ' (Ref. ' + l.p.ref + ')' : '') +
        ' — ' + C.money(l.p.price) + (l.qty > 1 ? ' each' : ''));
    });
    out.push('Total: ' + C.money(total));
    return out.join('\n');
  };

  // A watch that has since been removed or hidden drops out of the bag quietly.
  var prune = function (products) {
    var before = items.length;
    items = items.filter(function (i) { return !!C.byId(products, i.id); });
    if (items.length !== before) save();
    updateBadge();
  };

  var render = function () {
    if (!dlg) return;
    C.load().then(function (products) {
      prune(products);

      listBox.textContent = '';
      var lines = items.map(function (i) { return { p: C.byId(products, i.id), qty: i.qty }; });
      var total = lines.reduce(function (t, l) { return t + l.p.price * l.qty; }, 0);

      lines.forEach(function (l) { listBox.appendChild(lineNode(l.p, l.qty)); });
      var has = lines.length > 0;
      listBox.hidden = !has;
      footBox.hidden = !has;
      emptyBox.hidden = has;
      if (has) {
        totalEl.textContent = C.money(total);
        orderBtn.href = C.waLink(orderMessage(lines, total));
      }
    });
  };

  var show = function () {
    if (!dlg) build();
    render();
    if (typeof dlg.showModal === 'function') { if (!dlg.open) dlg.showModal(); }
    else dlg.setAttribute('open', '');
    document.body.style.overflow = 'hidden';
  };
  var hide = function () {
    if (!dlg) return;
    if (typeof dlg.close === 'function' && dlg.open) dlg.close();
    else dlg.removeAttribute('open');
    document.body.style.overflow = '';
  };

  /* ---------- changing the bag ---------- */
  var add = function (id, qty) {
    qty = qty || 1;
    var found = items.filter(function (i) { return i.id === id; })[0];
    if (found) found.qty = Math.min(MAX_QTY, found.qty + qty);
    else if (items.length < MAX_LINES) items.push({ id: id, qty: Math.min(MAX_QTY, qty) });
    save();
    updateBadge();
    show();
  };
  var change = function (id, delta) {
    items.forEach(function (i) { if (i.id === id) i.qty = Math.max(1, Math.min(MAX_QTY, i.qty + delta)); });
    save();
    render();
  };
  var remove = function (id) {
    items = items.filter(function (i) { return i.id !== id; });
    save();
    render();
  };

  /* ---------- wiring ---------- */
  var btn = document.getElementById('cartBtn');
  if (btn) btn.addEventListener('click', show);

  // keep several open tabs in step
  window.addEventListener('storage', function (e) {
    if (e.key !== KEY) return;
    items = load();
    updateBadge();
    render();
  });

  updateBadge();
  C.load().then(prune);   // drops watches that were removed since the bag was last used

  window.MisoraaBag = { add: add, open: show, count: count };
})();
