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

Put `index.htm`, `index.html`, and `icons/` on the static host. The Cloudflare
Worker URL is embedded directly in both HTML files, so no `config.js` file is
needed.

The browser calls:

```text
GET /api/market/quote?symbols=VUSA.L
GET /api/market/search?q=Vanguard
GET /api/market/history-monthly?symbols=VUSA.L&from=2025-01-01
```

The Worker caches quotes briefly, monthly history for longer, and search
results for a few minutes. The browser stores the latest successful portfolio
state locally for offline viewing.

## Data coverage

Yahoo Finance data may be delayed, rate-limited, or changed without notice.
London-listed symbols such as `VUSA.L` are requested server-side and Yahoo's
`GBp` pence prices are converted to pounds for the Pocket ISA display.

Documentation:
https://finance.yahoo.com/