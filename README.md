# Pocket ISA GitHub Pages + Netlify Finnhub relay

This version uses:

```text
Squarespace or GitHub Pages → Netlify Function → Finnhub
```

The Pocket ISA page remains public, but the Finnhub key stays in Vercel and
never reaches the iPhone or any visitor's browser. This avoids the direct
Yahoo/Finnhub browser request that was failing on iPhone Safari.

## Netlify relay

The Netlify relay should contain:

```text
netlify.toml
netlify/functions/market.js
```

Add this Netlify environment variable:

   ```text
   FINNHUB_API_KEY=your_replacement_key_here
   ```

Use a newly generated key. The key previously posted in chat should be
revoked and must not be reused.

Set `FRONTEND_ORIGIN` to the site that displays Pocket ISA. For Squarespace,
use both origins if needed:

   ```text
   FRONTEND_ORIGIN=https://www.yourpocketapps.com,https://yourpocketapps.com
   ```

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

Finnhub's free real-time coverage is strongest for US markets. London-listed
and other international instruments may be delayed or end-of-day. Search
returns instruments covered by Finnhub.

Documentation:
https://api.finnhub.io/docs/api