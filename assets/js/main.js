/* ==========================================================================
   MISORAA — interactions
   ========================================================================== */
(function () {
  'use strict';

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Preloader ---------- */
  window.addEventListener('load', function () {
    setTimeout(function () {
      var l = $('#loader');
      if (l) l.classList.add('done');
      document.body.style.overflow = '';
    }, 900);
  });
  if (document.getElementById('loader')) document.body.style.overflow = 'hidden';

  /* ---------- Sticky nav ---------- */
  var nav = $('#nav');
  var onScroll = function () {
    if (!nav) return;
    if (nav.getAttribute('data-nav') === 'solid') { nav.classList.add('scrolled'); return; }
    nav.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var burger = $('#burger');
  var menu   = $('#mobileMenu');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });
    $$('a', menu).forEach(function (a) {
      a.addEventListener('click', function () {
        menu.classList.remove('open');
        burger.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---------- Scroll reveal ---------- */
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        // Reveal on entry, and also anything already scrolled past — otherwise
        // an anchor jump leaves the sections above it permanently invisible.
        if (e.isIntersecting || e.boundingClientRect.top < 0) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px' });
    reveals.forEach(function (el) { io.observe(el); });

    // A hash jump lands past several sections before the observer has reported
    // on them, so sweep anything at or above the fold once the page settles.
    var sweep = function () {
      $$('.reveal:not(.in)').forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight) {
          el.classList.add('in');
          io.unobserve(el);
        }
      });
    };
    window.addEventListener('load', function () { setTimeout(sweep, 80); });
    window.addEventListener('hashchange', function () { setTimeout(sweep, 400); });
    window.addEventListener('scroll', sweep, { passive: true });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Stat counters ---------- */
  var counters = $$('[data-count]');
  var runCounter = function (el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    var start  = null;
    var step = function (ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / 1600, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { runCounter(e.target); cio.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(function (el) {
      el.textContent = el.getAttribute('data-count') + (el.getAttribute('data-suffix') || '');
    });
  }

  /* ---------- Collection filter ---------- */
  var cards = $$('#grid .card');
  $$('.filter').forEach(function (btn) {
    btn.addEventListener('click', function () {
      $$('.filter').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var f = btn.getAttribute('data-filter');
      cards.forEach(function (card) {
        var match = f === 'all' || (card.getAttribute('data-cat') || '').indexOf(f) > -1;
        card.classList.toggle('hide', !match);
        if (match) card.classList.add('in');
      });
    });
  });

  /* ---------- Toast ---------- */
  var toast = $('#toast');
  var toastTimer;
  var say = function (msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2800);
  };

  /* ---------- Cart ---------- */
  var count = 0;
  var badge = $('#cartCount');
  $$('[data-add]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      count += 1;
      if (badge) badge.textContent = String(count);
      say(btn.getAttribute('data-add') + ' added to bag');
    });
  });
  var cartBtn = $('#cartBtn');
  if (cartBtn) {
    cartBtn.addEventListener('click', function () {
      say(count ? count + ' piece(s) reserved in your bag' : 'Your bag is empty');
    });
  }

  /* ---------- Wishlist ---------- */
  $$('.card-fav').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var on = btn.classList.toggle('on');
      say(on ? 'Saved to your wishlist' : 'Removed from wishlist');
    });
  });

  /* ---------- Newsletter ---------- */
  var form = $('#newsForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = $('#newsEmail');
      var msg   = $('#newsMsg');
      var val   = (input.value || '').trim();
      var ok    = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val);
      if (!msg) return;
      if (!ok) {
        msg.style.color = '#C0392B';
        msg.textContent = 'Please enter a valid email address';
        return;
      }
      msg.style.color = '';
      msg.textContent = 'Welcome to the inner circle';
      input.value = '';
      say('Subscription confirmed');
    });
  }

  /* ======================================================================
     PRODUCT DETAIL PAGE
     Every block below no-ops on pages that do not have these elements.
     ====================================================================== */

  /* ---------- Gallery: thumbnails swap the stage artwork ---------- */
  var stage    = $('#stage');
  var stageUse = $('#stageUse');
  var stageNote = stage ? $('.pdp-note', stage) : null;
  $$('#thumbs .pdp-thumb').forEach(function (thumb) {
    thumb.addEventListener('click', function () {
      if (thumb.classList.contains('active')) return;
      $$('#thumbs .pdp-thumb').forEach(function (t) { t.classList.remove('active'); });
      thumb.classList.add('active');
      stage.classList.add('swapping');
      setTimeout(function () {
        stageUse.setAttribute('href', '#' + thumb.getAttribute('data-art'));
        if (stageNote) stageNote.textContent = thumb.getAttribute('data-view');
        stage.classList.remove('swapping');
      }, 320);
    });
  });

  /* ---------- Case finish: recolours the artwork ---------- */
  var stageArt = $('#stageArt');
  $$('#finishes .swatch').forEach(function (sw) {
    sw.addEventListener('click', function () {
      $$('#finishes .swatch').forEach(function (s) { s.classList.remove('active'); });
      sw.classList.add('active');
      var f = sw.getAttribute('data-finish');
      if (stageArt) stageArt.style.filter = f === 'none' ? '' : f;
      var label = $('#finishName');
      if (label) label.textContent = sw.getAttribute('data-name');
    });
  });

  /* ---------- Strap / size chip groups ---------- */
  var chipGroup = function (groupId, labelId) {
    var group = $(groupId);
    if (!group) return;
    $$('.chip', group).forEach(function (chip) {
      chip.addEventListener('click', function () {
        if (chip.disabled) return;
        $$('.chip', group).forEach(function (c) { c.classList.remove('active'); });
        chip.classList.add('active');
        var label = labelId && $(labelId);
        if (label) label.textContent = chip.getAttribute('data-name');
      });
    });
  };
  chipGroup('#straps', '#strapName');
  chipGroup('#sizes', null);

  /* ---------- Quantity ---------- */
  var qtyVal = $('#qtyVal');
  var qty = 1;
  var setQty = function (n) {
    qty = Math.min(5, Math.max(1, n));
    if (qtyVal) qtyVal.textContent = String(qty);
  };
  if ($('#qtyMinus')) $('#qtyMinus').addEventListener('click', function () { setQty(qty - 1); });
  if ($('#qtyPlus')) $('#qtyPlus').addEventListener('click', function () { setQty(qty + 1); });

  /* ---------- Add to bag / save on the detail page ---------- */
  var addBtn = $('#addToBag');
  if (addBtn) {
    addBtn.addEventListener('click', function () {
      var title  = $('.pdp-title');
      var finish = $('#finishName');
      var size   = $('#sizes .chip.active');
      count += qty;
      if (badge) badge.textContent = String(count);
      say(
        (title ? title.textContent.trim() : 'Piece') +
        ' · ' + (finish ? finish.textContent : '') +
        ' · ' + (size ? size.getAttribute('data-name') : '') +
        ' ×' + qty + ' added'
      );
    });
  }
  var wishBtn = $('#wishBtn');
  if (wishBtn) {
    wishBtn.addEventListener('click', function () {
      var on = wishBtn.classList.toggle('btn--solid');
      var span = $('span', wishBtn);
      if (span) span.textContent = on ? 'Saved' : 'Save';
      say(on ? 'Saved to your wishlist' : 'Removed from wishlist');
    });
  }

  /* ---------- Accordion ---------- */
  var setAccHeight = function (item) {
    var body = $('.acc-body', item);
    if (!body) return;
    body.style.maxHeight = item.classList.contains('open') ? body.scrollHeight + 'px' : '0px';
  };
  $$('#acc .acc-item').forEach(function (item) {
    setAccHeight(item);
    var head = $('.acc-head', item);
    if (!head) return;
    head.addEventListener('click', function () {
      var wasOpen = item.classList.contains('open');
      $$('#acc .acc-item').forEach(function (other) {
        other.classList.remove('open');
        setAccHeight(other);
      });
      if (!wasOpen) { item.classList.add('open'); setAccHeight(item); }
    });
  });
  window.addEventListener('resize', function () {
    $$('#acc .acc-item.open').forEach(setAccHeight);
  });

  /* ---------- Smooth anchor offset ---------- */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (!id || id === '#') return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      var top = el.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  /* ---------- Year ---------- */
  var y = $('#year');
  if (y) y.textContent = String(new Date().getFullYear());

  /* ---------- Product clip replaces the hero illustration, if it can play ----------
     The source is a 10s file, but only its first two seconds hold the whole watch
     in frame — after that the camera pushes into the dial. So the clip is trimmed
     to 0s-2s and looped.

     The scroll wheel drives it: the clip holds a still frame until the page is
     scrolled, then runs while the scrolling lasts and eases back to a stop a
     moment after it ends. Speed follows how hard you scroll.

     Scroll position is deliberately not mapped to currentTime — this encode
     keeps one keyframe per 2.5s, and seeking it per frame lands at barely one
     completed seek a second. Playing the decoder forward is the smooth path.

     Anything goes wrong — no file, no codec, autoplay refused — and the SVG stays. */
  var heroVideo = $('#heroVideo');
  var heroSvg   = $('#heroSvg');
  if (heroVideo) {
    var CLIP_IN = 0, CLIP_OUT = 2;
    var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var showVideo = function () {
      if (heroVideo.readyState < 2) return;            // nothing decodable yet
      heroVideo.removeAttribute('hidden');
      if (heroSvg) heroSvg.setAttribute('hidden', '');   // SVG has no .hidden property
      var wrap = heroVideo.parentNode;
      if (wrap) wrap.classList.add('has-video');      // switches on the circular crop
    };

    /* --- scroll → playback speed and direction ---
       Scrolling down runs the clip forward, scrolling up runs it backward.
       Forward is ordinary playback. Backward cannot be: no browser accepts a
       negative playbackRate, so the clip is stepped frame by frame with seeks,
       one at a time, never queued. On this file a step lands in about 23 ms,
       which is quicker than the 24 fps the clip was shot at. */
    var RATE_IDLE  = 0.55;  // a scroll barely moving still turns the watch
    var RATE_MAX   = 2.4;   // a hard flick, and no faster
    var SPEED_FULL = 1400;  // px a second of scrolling that earns RATE_MAX
    var COAST_MS   = 110;   // silence this long and the clip starts easing down
    var rate = 0, want = 0, dir = 1, ticking = false, seeking = false, lastStep = 0;
    var lastY = window.pageYOffset, lastT = Date.now(), lastPush = 0;

    // Chain the next step off the last one landing, not off the next animation
    // frame: waiting for rAF in between costs a third of the reverse frame rate.
    heroVideo.addEventListener('seeked', function () {
      seeking = false;
      if (ticking && dir < 0 && rate > 0) stepBack();
    });

    function stepBack() {
      if (seeking) return;
      var now = Date.now();
      var span = lastStep ? Math.min((now - lastStep) / 1000, 0.1) : 1 / 24;
      lastStep = now;
      var t = heroVideo.currentTime - span * rate;
      if (t <= CLIP_IN) t = CLIP_OUT - 0.02;           // wrap round the other way
      seeking = true;
      heroVideo.currentTime = t;
    }

    // Speed, not distance: smooth scrolling delivers one flick as a run of small
    // deltas, so pixels per event would read a fast scroll as a crawl.
    var push = function (speed, down) {
      if (calm || heroVideo.hidden) return;
      // Scrolling the rest of the page should not keep a decoder busy off-screen.
      if (heroVideo.getBoundingClientRect().bottom < 0) { want = 0; return; }
      var reach = Math.min(speed, SPEED_FULL) / SPEED_FULL;
      want = RATE_IDLE + reach * (RATE_MAX - RATE_IDLE);
      dir = down ? 1 : -1;
      lastPush = Date.now();
      if (!ticking) { ticking = true; lastStep = 0; requestAnimationFrame(tick); }
    };

    function tick() {
      if (Date.now() - lastPush > COAST_MS) want = 0;
      rate += (want - rate) * 0.14;                   // ease, never jump

      // Below a quarter speed the decoder judders more than it moves: hold still.
      if (rate < 0.22 && want === 0) {
        rate = 0;
        ticking = false;
        if (!heroVideo.paused) heroVideo.pause();
        return;
      }

      if (dir > 0) {
        // Forward: let the decoder run, which is what it is good at.
        // Wrap here rather than on timeupdate — that only fires every quarter
        // second or so, long enough to let the close-up past the trim show.
        if (heroVideo.currentTime >= CLIP_OUT) heroVideo.currentTime = CLIP_IN;
        heroVideo.playbackRate = Math.max(0.22, Math.min(RATE_MAX, rate));
        if (heroVideo.paused) heroVideo.play().catch(function () {});
      } else {
        // Backward: hand-wound, one seek at a time. The step is measured in
        // wall-clock time, so a slow seek drops frames instead of going limp.
        if (!heroVideo.paused) heroVideo.pause();
        stepBack();
      }
      requestAnimationFrame(tick);
    }

    window.addEventListener('scroll', function () {
      var y = window.pageYOffset, now = Date.now();
      var dy = y - lastY, dt = Math.max(now - lastT, 8);
      if (dy) push(Math.abs(dy) / dt * 1000, dy > 0);
      lastY = y; lastT = now;
    }, { passive: true });

    // A wheel against the top or bottom stop scrolls nothing, so it would
    // otherwise be silent — give it a middling push of its own.
    window.addEventListener('wheel', function (e) {
      push(SPEED_FULL * 0.45, e.deltaY >= 0);
    }, { passive: true });

    heroVideo.addEventListener('loadeddata', function () {
      if (heroVideo.currentTime < CLIP_IN) heroVideo.currentTime = CLIP_IN;
      showVideo();
      // Nothing plays on its own now — the first frame stands until a scroll.
      heroVideo.pause();
    });

    // A media fragment stops at CLIP_OUT but does not loop, so wrap by hand —
    // and never let the close-up that follows the out-point reach the screen.
    heroVideo.addEventListener('timeupdate', function () {
      if (heroVideo.currentTime >= CLIP_OUT) {
        heroVideo.currentTime = CLIP_IN;
        if (rate > 0 && heroVideo.paused) heroVideo.play().catch(function () {});
      }
    });

    heroVideo.addEventListener('ended', function () {
      heroVideo.currentTime = CLIP_IN;
      if (rate > 0) heroVideo.play().catch(function () {});
    });
  }

  /* ---------- Subtle parallax on the hero watch ---------- */
  var heroWatch = $('.hero-watch');
  if (heroWatch && window.matchMedia('(min-width:1100px)').matches) {
    window.addEventListener('mousemove', function (e) {
      var x = (e.clientX / window.innerWidth - 0.5) * 16;
      var y = (e.clientY / window.innerHeight - 0.5) * 16;
      heroWatch.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
    }, { passive: true });
  }
})();
