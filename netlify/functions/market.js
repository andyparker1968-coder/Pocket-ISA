const FINNHUB_BASE = 'https://finnhub.io/api/v1';
const cache = globalThis.__pocketIsaFinnhubCache || new Map();
globalThis.__pocketIsaFinnhubCache = cache;

const allowedOrigins = () => String(process.env.FRONTEND_ORIGIN || '*')
  .split(',')
  .map(value => value.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const headersFor = event => {
  const requestOrigin = event.headers?.origin || event.headers?.Origin || '';
  const origins = allowedOrigins();
  const allowOrigin = origins.includes('*')
    ? '*'
    : (origins.includes(requestOrigin) ? requestOrigin : origins[0] || '*');
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
    'X-Content-Type-Options': 'nosniff'
  };
};

const reply = (event, status, body, cacheSeconds = 0) => ({
  statusCode: status,
  headers: {
    ...headersFor(event),
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': cacheSeconds > 0
      ? `public, max-age=0, s-maxage=${cacheSeconds}, stale-while-revalidate=${cacheSeconds * 2}`
      : 'no-store'
  },
  body: JSON.stringify(body)
});

const finnhubSymbol = value => {
  const original = String(value || '').trim().toUpperCase();
  return original.startsWith('LON:') ? original.slice(4) + '.L' : original;
};

const symbolsFrom = params => String(params.get('symbols') || '')
  .split(',')
  .map(item => item.trim().toUpperCase())
  .filter(Boolean);

const upstream = async (path, params, ttlMs) => {
  const token = process.env.FINNHUB_API_KEY;
  if (!token) throw Object.assign(new Error('FINNHUB_API_KEY is not configured.'), { statusCode: 503 });

  const cacheKey = path + '?' + new URLSearchParams(params).toString();
  const cached = cache.get(cacheKey);
  if (cached && cached.expires > Date.now()) return cached.value;

  const url = new URL(FINNHUB_BASE + path);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value);
  });
  url.searchParams.set('token', token);
  const response = await fetch(url);
  let payload = null;
  try { payload = await response.json(); } catch (_) {}
  if (!response.ok || (payload && payload.error)) {
    throw new Error(payload && payload.error ? String(payload.error) : 'Finnhub returned an error.');
  }
  cache.set(cacheKey, { value: payload, expires: Date.now() + ttlMs });
  return payload;
};

const quote = (requestedSymbol, payload) => {
  const price = Number(String(payload?.c ?? '').replace(/,/g, ''));
  if (!Number.isFinite(price) || price <= 0) return null;
  return {
    symbol: String(requestedSymbol).trim().toUpperCase(),
    price,
    displayPrice: price,
    currency: 'GBP',
    shortName: String(requestedSymbol).trim().toUpperCase(),
    longName: String(requestedSymbol).trim().toUpperCase(),
    changePercent: Number(payload.dp) || 0,
    asOf: payload.t ? new Date(Number(payload.t) * 1000).toISOString() : new Date().toISOString(),
    marketState: 'UNKNOWN'
  };
};

const routeName = (url, params) => {
  const fromQuery = String(params.get('path') || '').replace(/^\/+|\/+$/g, '');
  if (fromQuery) return fromQuery;
  const marker = '/.netlify/functions/market';
  const index = url.pathname.indexOf(marker);
  if (index >= 0) return url.pathname.slice(index + marker.length).replace(/^\/+/, '');
  const apiMarker = '/api/market/';
  const apiIndex = url.pathname.indexOf(apiMarker);
  return apiIndex >= 0 ? url.pathname.slice(apiIndex + apiMarker.length).replace(/^\/+/, '') : '';
};

exports.handler = async event => {
  if (event.httpMethod === 'OPTIONS') return reply(event, 204, {});
  if (event.httpMethod !== 'GET') return reply(event, 405, { error: 'GET only' });

  try {
    const url = new URL(event.rawUrl || 'https://pocket-isa.netlify.app/.netlify/functions/market');
    const routeParams = new URLSearchParams(url.search);
    const route = routeName(url, routeParams);

    if (route === 'quote') {
      const symbols = symbolsFrom(routeParams);
      if (!symbols.length) return reply(event, 400, { error: 'At least one symbol is required.' });
      const quotes = await Promise.all(symbols.map(async requestedSymbol => {
        const payload = await upstream('/quote', { symbol: finnhubSymbol(requestedSymbol) }, 30_000);
        return quote(requestedSymbol, payload);
      }));
      return reply(event, 200, quotes.filter(Boolean), 30);
    }

    if (route === 'search') {
      const query = String(routeParams.get('q') || '').trim();
      if (!query) return reply(event, 200, [], 3600);
      const payload = await upstream('/search', { q: query }, 60 * 60_000);
      const results = (Array.isArray(payload?.result) ? payload.result : []).map(item => ({
        symbol: String(item.symbol || ''),
        shortName: item.description || item.displaySymbol || item.symbol,
        longName: item.description || item.displaySymbol || item.symbol,
        exchange: item.type || '',
        currency: ''
      })).filter(item => item.symbol);
      return reply(event, 200, results, 3600);
    }

    if (route === 'history-monthly') {
      const symbols = symbolsFrom(routeParams);
      const from = String(routeParams.get('from') || '');
      const fromDate = from
        ? new Date(from + 'T00:00:00')
        : new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000);
      const to = Math.floor(Date.now() / 1000);
      const result = await Promise.all(symbols.map(async requestedSymbol => {
        const payload = await upstream('/stock/candle', {
          symbol: finnhubSymbol(requestedSymbol),
          resolution: 'M',
          from: Math.floor(fromDate.getTime() / 1000),
          to
        }, 10 * 60_000);
        const points = Array.isArray(payload?.t) && Array.isArray(payload?.c)
          ? payload.t.map((timestamp, index) => ({
            date: new Date(Number(timestamp) * 1000).toISOString().slice(0, 10),
            close: Number(String(payload.c[index] ?? '').replace(/,/g, ''))
          })).filter(item => item.date && Number.isFinite(item.close) && item.close > 0)
          : [];
        return { symbol: requestedSymbol, points };
      }));
      return reply(event, 200, result, 600);
    }

    return reply(event, 404, { error: 'Unknown market-data route.' });
  } catch (error) {
    const status = Number(error?.statusCode) || 502;
    return reply(event, status, {
      error: error instanceof Error ? error.message : 'Market-data request failed.'
    });
  }
};
