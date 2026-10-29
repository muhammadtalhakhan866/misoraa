/* ==========================================================================
   MISORAA — customer reviews
   Renders the review grid, the rating summary and the "Drop a Review" form.
   There is no backend yet. Until REVIEW_ENDPOINT is set, a submitted review
   only appears for the visitor who wrote it (kept in their own browser) and
   nothing is sent anywhere. Once set, each review is POSTed there as JSON:
     { name, whatsapp, rating, review, submittedAt }
   The WhatsApp number is required but is never rendered on the page.
   ========================================================================== */
(function () {
  'use strict';

  /* URL that accepts the POST, e.g. '/api/reviews'. Empty = browser-only. */
  var REVIEW_ENDPOINT = '';

  var STORE_KEY = 'misoraa_my_reviews';
  var PX_PER_SEC = 60;   // marquee speed

  var REVIEWS = [
    { name: 'Muhammad Talha Khan', rating: 5, review: 'The watch looks even better in person. The finishing is clean and the overall design gives a premium feel. Definitely worth the price.' },
    { name: 'Ahmed Raza Sheikh', rating: 5, review: 'Really liked the design and overall look. It has that luxury-style appearance without costing too much. Good experience overall.' },
    { name: 'Usman Ali Qureshi', rating: 5, review: 'Received my watch in good condition. The packaging was neat and the watch looks stylish on the wrist. Happy with my purchase.' },
    { name: 'Hamza Shahid Malik', rating: 4, review: 'Nice watch for everyday use. The design is classy and goes well with both casual and formal outfits.' },
    { name: 'Bilal Ahmed Siddiqui', rating: 5, review: 'Honestly, the watch looks quite premium for its price. The dial design is my favourite part. Would consider buying another one.' },
    { name: 'Hassan Tariq Butt', rating: 4, review: 'Good-looking watch with a decent finish. It looks just like the pictures, which is always a plus when ordering online.' },
    { name: 'Muhammad Saad Farooq', rating: 5, review: 'I wanted something stylish without spending a huge amount, and this was a good choice. Simple, elegant and easy to wear.' },
    { name: 'Danish Imran Chaudhry', rating: 4, review: 'The overall design is impressive. It looks great with a shirt and trousers, especially when going out for dinner or meetings.' },
    { name: 'Ahsan Waheed Khan', rating: 5, review: 'Really satisfied with the look of the watch. It has a clean, modern style and feels like a good addition to my collection.' },
    { name: 'Fahad Mustafa Abbasi', rating: 4, review: 'A decent option if you like designer-inspired watches. The appearance is attractive and the price feels reasonable.' },
    { name: 'Zain Hassan Mirza', rating: 5, review: 'Ordered one for myself and liked the design straight away. The dial looks sharp and gives the watch a distinctive appearance.' },
    { name: 'Omer Khalid Memon', rating: 4, review: 'Good style and nice presentation. It is a solid option for someone looking for an affordable fashion watch in Pakistan.' },
    { name: 'Abdul Rehman Siddiqui', rating: 5, review: 'The watch looks elegant without being too flashy. I like how easily it matches different outfits. Overall, a good purchase.' },
    { name: 'Saad Naveed Khan', rating: 4, review: 'I liked the design and the way it sits on the wrist. A nice choice for daily wear if you prefer a more premium-looking style.' },
    { name: 'Shahzaib Arif Malik', rating: 5, review: 'The design caught my attention, and the watch looks just as good in person. Good option for personal use or gifting.' },
    { name: 'Muneeb Aslam Sheikh', rating: 4, review: 'Stylish watch at a reasonable price. The overall appearance is what I liked most. It looks especially good with formal clothes.' },
    { name: 'Ali Hamza Javed', rating: 5, review: 'Clean design, attractive dial and a nice overall look. MISORAA has some good options for people who want stylish watches on a budget.' },
    { name: 'Rizwan Ahmed Baloch', rating: 4, review: 'The watch looks good and is easy to pair with everyday outfits. A decent purchase for anyone who likes modern watch designs.' },
    { name: 'Usama Khalid Butt', rating: 5, review: 'Bought it because I liked the design, and I am happy with how it looks on my wrist. The presentation was also nice.' },
    { name: 'Abdullah Faisal Rajput', rating: 5, review: 'A good-looking watch with a premium-inspired appearance. It makes a nice impression without needing to spend a lot. Overall satisfied.' }
  ];

  var $ = function (s, c) { return (c || document).querySelector(s); };

  var marquee = $('#reviewMarquee');
  var track   = $('#reviewTrack');
  if (!marquee || !track) return;

  var openBtn = $('#openReview');
  var dialog  = $('#reviewDialog');
  var form    = $('#reviewForm');
  var summary = $('#ratingSum');
  var readDlg = $('#readDialog');

  /* ---------- Storage (every access guarded: private mode can throw) ---------- */
  var loadMine = function () {
    try {
      var raw = window.localStorage.getItem(STORE_KEY);
      var list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch (e) { return []; }
  };
  var saveMine = function (list) {
    try { window.localStorage.setItem(STORE_KEY, JSON.stringify(list)); } catch (e) { /* ignore */ }
  };
  var mine = loadMine();

  /* ---------- Rendering ---------- */
  var el = function (tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  };

  var starRow = function (rating, cls) {
    var row = el('div', cls || 'stars');
    row.setAttribute('role', 'img');
    row.setAttribute('aria-label', rating + ' out of 5 stars');
    for (var i = 1; i <= 5; i++) {
      row.appendChild(el('span', i <= rating ? '' : 'off', '\u2605'));
    }
    return row;
  };

  var tagFor = function (isMine) { return isMine ? 'Your review \u00B7 pending' : 'Customer review'; };

  /* ---------- Full-review popup ---------- */
  var setLock = function (locked) { document.body.style.overflow = locked ? 'hidden' : ''; };

  var openRead = function (r, isMine) {
    if (!readDlg) return;
    var holder = $('#rdStars');
    holder.textContent = '';
    holder.appendChild(starRow(r.rating));
    $('#rdText').textContent = '\u201C' + r.review + '\u201D';
    $('#rdAvatar').textContent = r.name.charAt(0).toUpperCase();
    $('#rdName').textContent = r.name;
    $('#rdTag').textContent = tagFor(isMine);

    marquee.classList.add('is-paused');
    if (typeof readDlg.showModal === 'function') readDlg.showModal();
    else readDlg.setAttribute('open', '');
    setLock(true);
  };

  var closeRead = function () {
    if (typeof readDlg.close === 'function' && readDlg.open) readDlg.close();
    else readDlg.removeAttribute('open');
    marquee.classList.remove('is-paused');
    setLock(false);
  };

  if (readDlg) {
    $('#rdClose').addEventListener('click', closeRead);
    readDlg.addEventListener('click', function (e) { if (e.target === readDlg) closeRead(); });
    readDlg.addEventListener('close', function () { marquee.classList.remove('is-paused'); setLock(false); });
  }

  /* ---------- Cards ---------- */
  // clone = the second copy that makes the loop seamless: clickable, but kept
  // out of the keyboard order and the accessibility tree.
  var card = function (r, isMine, clone) {
    var c = el('div', 'quote');
    c.appendChild(starRow(r.rating));
    c.appendChild(el('p', 'quote-text', '\u201C' + r.review + '\u201D'));
    c.appendChild(el('span', 'rv-more', 'Read full review'));
    var by = el('div', 'quote-by');
    by.appendChild(el('div', 'avatar', r.name.charAt(0).toUpperCase()));
    var who = el('div');
    who.appendChild(el('b', '', r.name));
    who.appendChild(el('span', '', tagFor(isMine)));
    by.appendChild(who);
    c.appendChild(by);

    // A mouse click leaves the card focused; let go of it so nothing keeps the
    // line paused afterwards. Keyboard users keep focus so the popup hands it back.
    var open = function (viaKeyboard) {
      if (!viaKeyboard && document.activeElement && document.activeElement.blur) document.activeElement.blur();
      openRead(r, isMine);
    };
    c.addEventListener('click', function () { open(false); });
    if (clone) {
      c.setAttribute('aria-hidden', 'true');
    } else {
      c.tabIndex = 0;
      c.setAttribute('role', 'button');
      c.setAttribute('aria-label', 'Read the full review by ' + r.name);
      c.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(true); }
      });
    }
    return c;
  };

  // Flag cards whose text is cut off, and size the loop so speed stays constant.
  var fit = function () {
    var sets = track.children;
    if (!sets.length) return;
    var w = sets[0].getBoundingClientRect().width;
    if (w > 0) track.style.setProperty('--rv-duration', Math.max(30, w / PX_PER_SEC).toFixed(1) + 's');
    Array.prototype.forEach.call(track.querySelectorAll('.quote'), function (c) {
      var t = c.querySelector('.quote-text');
      c.classList.toggle('is-clamped', t.scrollHeight > t.clientHeight + 1);
    });
  };

  var render = function () {
    track.textContent = '';
    var all = mine.map(function (r) { return { r: r, mine: true }; })
      .concat(REVIEWS.map(function (r) { return { r: r, mine: false }; }));
    [false, true].forEach(function (clone) {
      var set = el('div', 'rv-set');
      all.forEach(function (o) { set.appendChild(card(o.r, o.mine, clone)); });
      track.appendChild(set);
    });
    fit();
  };

  var renderSummary = function () {
    if (!summary) return;
    var sum = REVIEWS.reduce(function (t, r) { return t + r.rating; }, 0);
    var avg = (sum / REVIEWS.length).toFixed(1);
    summary.textContent = '';
    summary.appendChild(el('b', 'gold-text', avg));
    summary.appendChild(starRow(Math.round(sum / REVIEWS.length)));
    summary.appendChild(el('small', '', 'Based on ' + REVIEWS.length + ' reviews'));
  };

  // Fonts change line breaks, and breakpoints change card widths: re-measure.
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(fit, 150);
  });

  /* ---------- Dialog ---------- */
  if (!dialog || !form || !openBtn) { renderSummary(); render(); return; }

  var nameIn   = $('#rvName');
  var phoneIn  = $('#rvPhone');
  var textIn   = $('#rvText');
  var counter  = $('#rvCount');
  var errBox   = $('#rvError');
  var rateLbl  = $('#rvRateLabel');
  var submitBtn = form.querySelector('button[type="submit"]');

  var RATE_WORDS = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Very good', 5: 'Excellent' };

  var setError = function (msg) { errBox.textContent = msg || ''; };

  /* Returns digits with country code ('923001234567'), or '' if it is not a
     usable number. Accepts 0300 1234567, +92 300 1234567, 0092300..., and any
     other international number written with a leading +. */
  var normalisePhone = function (raw) {
    var s = String(raw).replace(/[\s\-().]/g, '');
    var plus = s.charAt(0) === '+';
    s = s.replace(/\D/g, '');
    if (!s) return '';
    if (s.indexOf('0092') === 0) s = s.slice(2);
    else if (!plus && s.charAt(0) === '0') s = '92' + s.slice(1);
    if (s.indexOf('92') === 0) return /^923\d{9}$/.test(s) ? s : '';
    return plus && /^\d{10,15}$/.test(s) ? s : '';
  };

  var openDialog = function () {
    setError('');
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    document.body.style.overflow = 'hidden';
    nameIn.focus();
  };
  var closeDialog = function () {
    if (typeof dialog.close === 'function' && dialog.open) dialog.close();
    else dialog.removeAttribute('open');
    document.body.style.overflow = '';
  };

  openBtn.addEventListener('click', openDialog);
  $('#rvClose').addEventListener('click', closeDialog);
  dialog.addEventListener('close', function () { document.body.style.overflow = ''; });
  // A click on the backdrop lands on the <dialog> itself, not on the form inside it.
  dialog.addEventListener('click', function (e) { if (e.target === dialog) closeDialog(); });

  textIn.addEventListener('input', function () {
    counter.textContent = textIn.value.length + ' / 500';
  });

  form.addEventListener('change', function (e) {
    if (e.target && e.target.name === 'rvRating') {
      rateLbl.textContent = RATE_WORDS[e.target.value] || '';
      setError('');
    }
  });

  var resetForm = function () {
    form.reset();
    counter.textContent = '0 / 500';
    rateLbl.textContent = 'Tap a star';
    setError('');
  };

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var picked = form.querySelector('input[name="rvRating"]:checked');
    var name   = nameIn.value.trim();
    var phone  = normalisePhone(phoneIn.value);
    var text   = textIn.value.trim();

    if (!picked)          { setError('Please choose how many stars you would give.'); return; }
    if (name.length < 2)  { setError('Please enter your name.'); nameIn.focus(); return; }
    if (!phoneIn.value.trim()) { setError('Your WhatsApp number is required.'); phoneIn.focus(); return; }
    if (!phone)           { setError('Please enter a valid WhatsApp number, e.g. 0300 1234567.'); phoneIn.focus(); return; }
    if (text.length < 20) { setError('Please write a little more — at least 20 characters.'); textIn.focus(); return; }

    var rating = parseInt(picked.value, 10);

    // The number is deliberately left out of what is kept and shown locally.
    var finish = function () {
      mine.unshift({ name: name, rating: rating, review: text });
      saveMine(mine);
      render();
      resetForm();
      closeDialog();
      marquee.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    if (!REVIEW_ENDPOINT) { finish(); return; }

    submitBtn.disabled = true;
    fetch(REVIEW_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name,
        whatsapp: phone,
        rating: rating,
        review: text,
        submittedAt: new Date().toISOString()
      })
    }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      submitBtn.disabled = false;
      finish();
    }).catch(function () {
      submitBtn.disabled = false;
      setError('Sorry, we could not send your review. Please try again.');
    });
  });

  renderSummary();
  render();
})();
