# MISORAA — Timeless Elegance

A single-page luxury watch brand site, built around the logo's palette: obsidian black with a champagne-gold gradient.

## Run it

```bash
node server.js
```

Then open <http://localhost:5173>. Opening `index.html` directly from disk also works.

## Files

| Path | What it is |
|---|---|
| `index.html` | Home — hero, collection, signature piece, craftsmanship, heritage, testimonials, newsletter, footer |
| `product-msr-01c.html` … `product-msr-06m.html` | One detail page per reference — gallery, case-finish / strap / size options, quantity, spec accordion, three related pieces. Same markup throughout; only the content differs |
| `product.html` | Kept so older links still work: redirects to `product-msr-04s.html`, the Signature piece |
| `about.html` | The Maison — story, craftsmanship, atelier, heritage timeline, the bench, appointment CTA |
| `assets/css/style.css` | Design system + shared layout. Colour tokens live in `:root` at the top |
| `assets/css/pages.css` | Extra styles for the product and about pages only |
| `assets/js/sprite.js` | Every SVG in the site: the logo marks, six hand-drawn watches, and the UI icons. The nav lockup (`#logo-lockup`) has no slogan; the stacked footer/loader mark (`#logo-stack`) keeps it |
| `assets/js/main.js` | Preloader, sticky nav, mobile menu, scroll reveals, stat counters, collection filter, cart, wishlist, newsletter, and the product-page gallery / options / accordion. Each block no-ops on pages that lack its elements |
| `server.js` | A ~30-line static server, only for local preview |

No build step, no dependencies.

## Palette

Sampled from the logo. Change these in `:root` and the whole site follows.

```
--gold-100  #FBF3DA   lightest highlight in the gradient
--gold-400  #D4AF62   the main brand gold
--gold-700  #7E5B21   deep gold, used for hairlines and borders
--ink-900   #000000   page background
--text-dim  #BCB5A8   body copy
```

The gold gradient itself is `--grad-gold`, used for headings, the logo and the primary button.

## Things you'll probably want to change

- **Prices and currency** — in `index.html`, search for `PKR`. Six products, each in a `<article class="card">`.
- **Products** — each card has a `data-cat` attribute (`automatic`, `chronograph`, `diver`, `limited`) that drives the filter buttons. Each card title links to its own detail page (`product-msr-01c.html` … `product-msr-06m.html`); copy one of those files and add a card when you add a reference.
- **Case finishes** on the product page recolour the artwork with a CSS `filter` set in `data-finish` on each swatch — swap those for real images if you shoot the variants.
- **Hero clip** — `assets/video/hero-watch.mp4`. It replaces the SVG illustration once it can play; if the file is missing, the codec is unsupported or playback is refused, the illustration stays and nothing breaks. Three things are tuned for this particular source. The **trim**: only the first two seconds hold the whole watch, so the clip runs 0s-2s and wraps (`CLIP_IN`/`CLIP_OUT` in `main.js`, mirrored in the `#t=0,2` fragment on the `<video>` tag). The **circular crop** in `.hero-watch.has-video` in `style.css`, where `object-fit:cover` fills the circle with the full width of the 1080x1920 frame and `object-position:50% 43%` centres it on the watch case. And the **scroll drive**: the clip holds a still frame until the page is scrolled, then runs while the scrolling lasts — forward when you scroll down, backward when you scroll up — at a speed set by how fast you scroll (`RATE_IDLE`, `RATE_MAX`, `SPEED_FULL`, `COAST_MS` in `main.js`), easing to a stop about a tenth of a second after it ends. Forward is ordinary playback. Backward cannot be — no browser takes a negative `playbackRate` — so it is stepped frame by frame with seeks, each one chained off the last landing rather than off the next animation frame, which is the difference between 15 and 23 steps a second on this file. Either direction wraps at the trim: forward from 2s to 0, backward from 0 to 2s. Reduced-motion visitors get a single still frame and no scroll reaction.
- **Watch artwork** — the six watches are SVG symbols in `sprite.js` (`#w-chrono`, `#w-classic`, `#w-diver`, `#w-skeleton`, `#w-tonneau`, `#w-moon`). To use photography instead, replace the `<svg><use …></svg>` inside `.card-media` with an `<img>`.
- **Social links** — the four `<a href="#">` in the footer's `.socials`.
- **Newsletter** — currently validates and shows a confirmation locally. Point `#newsForm` at your mailing-list endpoint to make it real.
- **Cart** — the bag counter and toasts are front-end only; there's no checkout behind them.

## Notes

- The logo is redrawn as vector (`#logo-mark` in `sprite.js`) rather than using the raster file, so it stays sharp at any size and inherits the gold gradient.
- The `#sprite` container must **not** be `display:none` — SVG gradients defined inside it stop resolving. It's clipped out of view instead.
