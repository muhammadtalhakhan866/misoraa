/* ==========================================================================
   MISORAA — product page
   One page for every watch: product.html?id=<watch id>. Everything shown comes from the product
   list (see catalog.js), so a watch added or edited in the admin has a page straight away.
   ========================================================================== */
(function () {
  'use strict';

  var C = window.MisoraaCatalog;
  var root = document.getElementById('pdp');
  if (!C || !root) return;

  var el = C.el;
  var RELATED_MAX = 3;

  var setMeta = function (p) {
    document.title = p.name + (p.ref ? ' — Ref. ' + p.ref : '') + ' | MISORAA';
    var meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', p.caption || p.name + ' by MISORAA.');
  };

  var orderText = function (p) {
    return 'Hello MISORAA, I would like to order the ' + p.name + (p.ref ? ' (Ref. ' + p.ref + ')' : '') +
      ' — ' + C.money(p.price) + '.';
  };
  var askText = function (p) {
    return 'Hello MISORAA, I have a question about the ' + p.name + (p.ref ? ' (Ref. ' + p.ref + ')' : '') + '.';
  };

  /* ---------- Pieces ---------- */
  var gallery = function (p) {
    var wrap = el('div', 'pdp-gallery');
    var stage = el('div', 'pdp-stage');
    ['tl', 'tr', 'bl', 'br'].forEach(function (c) { stage.appendChild(el('span', 'corner ' + c)); });
    if (p.tag) stage.appendChild(el('span', 'pdp-badge', p.tag));
    var holder = el('div', 'pdp-media');
    holder.appendChild(C.media(p, true));
    stage.appendChild(holder);
    wrap.appendChild(stage);

    var photos = p.photos || [];
    if (photos.length > 1) {
      var thumbs = el('div', 'pdp-thumbs');
      photos.forEach(function (url, i) {
        var b = el('button', 'pdp-thumb' + (i === 0 ? ' active' : ''));
        b.type = 'button';
        b.setAttribute('aria-label', 'Show picture ' + (i + 1) + ' of ' + photos.length);
        var img = el('img');
        img.src = url;
        img.alt = '';
        img.loading = 'lazy';
        b.appendChild(img);
        b.addEventListener('click', function () {
          if (b.classList.contains('active')) return;
          Array.prototype.forEach.call(thumbs.children, function (t) { t.classList.remove('active'); });
          b.classList.add('active');
          stage.classList.add('swapping');
          setTimeout(function () {
            holder.textContent = '';
            holder.appendChild(C.media({ name: p.name, photos: [url] }, true));
            stage.classList.remove('swapping');
          }, 280);
        });
        thumbs.appendChild(b);
      });
      wrap.appendChild(thumbs);
    }
    return wrap;
  };

  var accordion = function (items) {
    var acc = el('div', 'acc');
    items.forEach(function (it, i) {
      var item = el('div', 'acc-item' + (i === 0 ? ' open' : ''));
      var head = el('button', 'acc-head', it.title);
      head.type = 'button';
      head.appendChild(el('i'));
      var body = el('div', 'acc-body');
      var inner = el('div', 'acc-inner');
      inner.appendChild(it.node);
      body.appendChild(inner);
      item.appendChild(head);
      item.appendChild(body);
      acc.appendChild(item);
    });

    var fit = function (item) {
      var body = item.querySelector('.acc-body');
      body.style.maxHeight = item.classList.contains('open') ? body.scrollHeight + 'px' : '0px';
    };
    Array.prototype.forEach.call(acc.children, function (item) {
      item.querySelector('.acc-head').addEventListener('click', function () {
        var wasOpen = item.classList.contains('open');
        Array.prototype.forEach.call(acc.children, function (o) { o.classList.remove('open'); fit(o); });
        if (!wasOpen) { item.classList.add('open'); fit(item); }
      });
    });
    // measure once the content is in the page, and again if the window changes size
    setTimeout(function () { Array.prototype.forEach.call(acc.children, fit); }, 0);
    window.addEventListener('resize', function () {
      Array.prototype.forEach.call(acc.querySelectorAll('.acc-item.open'), fit);
    });
    return acc;
  };

  var info = function (p) {
    var box = el('div', 'pdp-info');

    var crumbs = el('div', 'crumbs');
    var home = el('a', '', 'Home'); home.href = 'index.html';
    var coll = el('a', '', 'Collection'); coll.href = 'index.html#collection';
    crumbs.appendChild(home); crumbs.appendChild(document.createTextNode(' / '));
    crumbs.appendChild(coll); crumbs.appendChild(document.createTextNode(' / '));
    crumbs.appendChild(el('b', '', p.name));
    box.appendChild(crumbs);

    var tagLine = [];
    if (p.ref) tagLine.push('Ref. ' + p.ref);
    if (p.signature) tagLine.push('The Signature');
    else if (p.hot) tagLine.push('Hot Right Now');
    if (tagLine.length) box.appendChild(el('p', 'pdp-ref', tagLine.join(' · ')));

    var h1 = el('h1', 'pdp-title');
    C.goldLastWord(h1, p.name);
    box.appendChild(h1);

    if (p.caption) box.appendChild(el('p', 'pdp-caption', p.caption));

    var price = el('div', 'pdp-price');
    price.appendChild(el('b', 'gold-text', C.money(p.price)));
    if (p.wasPrice) {
      price.appendChild(el('s', '', C.money(p.wasPrice)));
      var off = Math.round((1 - p.price / p.wasPrice) * 100);
      if (off > 0) price.appendChild(el('em', '', 'Save ' + off + '%'));
    }
    box.appendChild(price);

    (p.description || '').split(/\n{2,}/).forEach(function (para) {
      if (para.trim()) box.appendChild(el('p', 'pdp-desc', para.trim()));
    });

    // Buy Now sends just this watch to the shop on WhatsApp; Add to Bag keeps it for a bigger order.
    var buy = el('div', 'buy-row');
    var now = el('a', 'btn btn--solid');
    now.href = C.waLink(orderText(p));
    now.target = '_blank'; now.rel = 'noopener';
    now.appendChild(el('span', '', 'Buy Now'));
    var add = el('button', 'btn');
    add.type = 'button';
    add.appendChild(el('span', '', 'Add to Bag'));
    add.addEventListener('click', function () { if (window.MisoraaBag) window.MisoraaBag.add(p.id); });
    buy.appendChild(now); buy.appendChild(add);
    box.appendChild(buy);

    var items = [];
    if (p.specs && p.specs.length) {
      var ul = el('ul', 'spec-list');
      p.specs.forEach(function (s) {
        var li = el('li');
        li.appendChild(el('span', '', s.label));
        li.appendChild(el('b', '', s.value));
        ul.appendChild(li);
      });
      items.push({ title: 'Details & Specifications', node: ul });
    }
    items.push({
      title: 'How to Order',
      node: el('p', '', 'Tap Buy Now to order this watch, or Add to Bag to order several together. Either way the order goes to us on WhatsApp, where we confirm that it is available and agree the delivery and payment with you.')
    });
    box.appendChild(accordion(items));
    return box;
  };

  var renderRelated = function (list, current) {
    var section = document.getElementById('related');
    var grid = document.getElementById('relatedGrid');
    if (!section || !grid) return;
    var others = list.filter(function (x) { return x.id !== current.id; });
    var hot = others.filter(function (x) { return x.hot; });
    var pick = hot.length ? hot : others;
    pick = pick.slice(0, RELATED_MAX);
    if (!pick.length) { section.hidden = true; return; }

    document.getElementById('relatedEyebrow').textContent = hot.length ? 'Hot Right Now' : 'The Collection';
    var title = document.getElementById('relatedTitle');
    title.textContent = '';
    if (hot.length) { title.appendChild(document.createTextNode('Most ')); title.appendChild(el('span', 'gold-text', 'Wanted')); title.appendChild(document.createTextNode('.')); }
    else { title.appendChild(document.createTextNode('More From The ')); title.appendChild(el('span', 'gold-text', 'Collection')); title.appendChild(document.createTextNode('.')); }

    grid.textContent = '';
    pick.forEach(function (x) { grid.appendChild(C.card(x)); });
    section.hidden = false;
    C.reveal(grid.children);
    C.reveal(section.querySelectorAll('.reveal'));
  };

  var notFound = function () {
    root.textContent = '';
    var box = el('div', 'pdp-missing');
    box.appendChild(el('p', 'eyebrow center', 'Not Found'));
    box.appendChild(el('h1', 'section-title', 'We could not find that watch.'));
    box.appendChild(el('p', 'section-sub', 'It may have been removed, or the link may be old.'));
    var a = el('a', 'btn btn--solid');
    a.href = 'index.html#collection';
    a.appendChild(el('span', '', 'See the Collection'));
    box.appendChild(a);
    root.appendChild(box);
    var section = document.getElementById('related');
    if (section) section.hidden = true;
  };

  /* ---------- Go ---------- */
  var id = new URLSearchParams(location.search).get('id');

  C.load().then(function (list) {
    // No id (or an old link): go to the signature watch, or the first one.
    if (!id) {
      var first = C.signatureOf(list) || list[0];
      if (first) location.replace(C.hrefFor(first)); else notFound();
      return;
    }
    var p = C.byId(list, id);
    if (!p) { notFound(); return; }

    setMeta(p);
    root.textContent = '';
    root.appendChild(gallery(p));
    root.appendChild(info(p));
    renderRelated(list, p);

    var wa = document.querySelector('.wa-float');
    if (wa) wa.href = C.waLink(askText(p));
  });
})();
