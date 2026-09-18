# Pocket ISA GitHub Pages + Netlify Yahoo Finance relay

This version uses:

```text
Squarespace or GitHub Pages → Netlify Function → Yahoo Finance
```

The Pocket ISA page remains public, and Yahoo Finance is called only from the
Netlify Function. Yahoo never receives a browser request from Squarespace or
iPhone Safari.

## Netlify relay

The Netlify relay should contain:

```text
netlify.toml
netlify/functions/market.js
```

Set the frontend origin in Netlify:

   ```text
   FRONTEND_ORIGIN=https://www.yourpocketapps.com,https://yourpocketapps.com
   ```

No Yahoo or Finnhub API key is needed in this relay.

Deploy the Netlify site. This bundle is already configured to use:

   ```text
   https://pocket-isa.netlify.app
   ```

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