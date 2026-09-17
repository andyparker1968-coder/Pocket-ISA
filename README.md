# Pocket ISA direct Finnhub version

This is a static GitHub Pages-compatible Pocket ISA page. It calls Finnhub
directly from the visitor's browser for quotes, instrument search, and monthly
history. It does not require a serverless relay.

## Important: rotate the key supplied in chat

The API key previously supplied in chat should be revoked or regenerated
immediately. Do not publish that key or commit it to GitHub.

After generating a replacement Finnhub key:

1. Open `config.js`.
2. Replace the placeholder:

   ```js
   window.FINNHUB_API_KEY = 'PASTE_YOUR_FINNHUB_KEY_HERE';
   ```

3. Save the file locally.
4. Upload the folder to GitHub and enable GitHub Pages.

The key will be visible in the public page and browser network requests. That
is intentional for this direct static version. Use a free key with sensible
quota limits and expect that other visitors can use the key.

## Finnhub requests used by the page

```text
GET https://finnhub.io/api/v1/quote
GET https://finnhub.io/api/v1/search
GET https://finnhub.io/api/v1/stock/candle
```

The page supports ticker and company-name search, keeps the latest successful
portfolio state in browser local storage, and offers manual prices if the
network or API is unavailable.

## Data coverage

Finnhub's free real-time coverage is strongest for US markets. London-listed
and other international instruments may be delayed or end-of-day rather than
truly live. Search returns the instruments covered by Finnhub. Check the
provider's current documentation and terms before publishing:

https://api.finnhub.io/docs/api