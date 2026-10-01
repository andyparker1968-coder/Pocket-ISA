# Pocket ISA + Cloudflare Yahoo Finance relay

This version uses:

```text
Static hosting → Cloudflare Worker → Yahoo Finance
```

The Pocket ISA page remains public, and Yahoo Finance is called only from the
Cloudflare Worker. Yahoo never receives a browser request from iPhone Safari.

## Cloudflare relay

The relay is:

```text
https://yahoo-proxy.andyparker1968.workers.dev
```

No Yahoo or Finnhub API key is needed.

## Static frontend

Put `index.html` and `apple-touch-icon.png` together at the root of the static
host. The in-app logo embeds a retina-sized copy of the Apple Touch artwork, so
it works without a separate image URL. The 180 × 180 PNG is used for the Home
Screen icon; the browser favicon also has an embedded fallback. No `icons/`
folder is needed. The Cloudflare Worker URL is embedded directly in `index.html`,
so no `config.js` file is needed.

The default appearance uses a white background, light-grey panels (`#eef0f2`),
black text, the blue accent, Rounded font, and bold labels and totals. The
lighter panels and darker supporting text improve contrast; on phones the
portfolio table keeps its Symbol heading on one line and the layout uses more of
the available screen. The appearance panel saves any other choices with this
browser's Pocket ISA data.

When embedding the app in a Squarespace code block, the in-app logo already
works without an image URL. Upload `apple-touch-icon.png` to Squarespace, set it
as the site's iOS icon, or add this tag to Squarespace's head code injection
with the image's public URL:

```html
<link rel="apple-touch-icon" sizes="180x180" href="https://YOUR-PUBLIC-ICON-URL">
```

The HTML code block cannot set the page's head icon. After changing the icon,
remove the old Home Screen shortcut and add it again so iOS fetches the new
image.

The browser calls:

```text
GET /api/market/quote?symbols=VUSA.L
GET /api/market/search?q=Vanguard
GET /api/market/history-monthly?symbols=VUSA.L&from=2025-01-01
```

The Worker caches quotes briefly, monthly history for longer, and search
results for a few minutes. The browser stores the latest successful portfolio
state locally for offline viewing.

Today's gain and percentage are recalculated from the latest saved/refreshed
holding quotes whenever the page renders. Cash is excluded from the daily
market move. The displayed quote timestamp helps distinguish an unchanged
market close from a failed refresh.

## Data coverage

Yahoo Finance data may be delayed, rate-limited, or changed without notice.
London-listed symbols such as `VUSA.L` are requested server-side and Yahoo's
`GBp` pence prices are converted to pounds for the Pocket ISA display.

Documentation:
https://finance.yahoo.com/