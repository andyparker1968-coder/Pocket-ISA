# Pocket ISA GitHub Pages + Cloudworker + Yahoo Finance relay

This version uses:

Cloudworker

## GitHub Pages frontend

Put `index.html` and `config.js` on GitHub Pages. The `config.js` file already
points to the Netlify relay:

```js
window.POCKET_ISA_API_BASE = 'https://pocket-isa.netlify.app';
```

The browser calls:

```text
GET /api/market/quote?symbols=VUSA.L
GET /api/market/search?q=Vanguard
GET /api/market/history-monthly?symbols=VUSA.L&from=2025-01-01
```

The Netlify function caches quotes for about 30 seconds, monthly history for
ten minutes, and search results for one hour. The browser stores the latest
successful portfolio state locally for offline viewing.

## Data coverage

Yahoo Finance data may be delayed, rate-limited, or changed without notice.
London-listed symbols such as `VUSA.L` are requested server-side and Yahoo's
`GBp` pence prices are converted to pounds for the Pocket ISA display.

Documentation:
https://finance.yahoo.com/
