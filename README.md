# Pocket Crypto v2.0.0.4

Pocket Crypto is a standalone copy of Pocket ISA with Bitcoin (`BTC-GBP`) as its default holding. Quotes and monthly history are requested in pounds sterling. Display currency defaults to GBP; choose GBP, USD, or EUR in the projection settings.

## Install files

This ZIP contains exactly three files at its root:

- `index.html` — the self-contained app, including its embedded browser favicon
- `README.md` — these notes
- `apple-touch-icon.png` — the single external icon for iPhone/iPad bookmarks

Upload `index.html` and `apple-touch-icon.png` together to your static host. The browser favicon is embedded; iOS uses the separate Apple touch icon for a Home Screen bookmark.

## Prices and historical chart

When opened online, the app requests crypto quotes and monthly market history from the Yahoo Finance relay used by Pocket ISA. It then saves the latest portfolio and chart data in this browser for offline viewing. Use **Refresh prices** to update them. An internet connection is needed to populate live price and historical data on first use. A live price refresh converts quotes into the selected display currency.

As in Pocket Pension, changing display currency does not convert saved holdings, cash values, or projection inputs. Refresh prices to update live quotes; review saved amounts before relying on projections in a different currency.

When adding a crypto holding, GBP pairs are only placed first after the relay confirms they have a live quote. If no GBP pair exists, the USD pair is first and its quote is converted to the selected display currency. Unit prices in the holding list show up to five decimal places.

Tap a holding name or symbol to open its past-24-hours graph and daily gain/loss percentage. This feature requires the included `/api/market/history-day` endpoint in the Yahoo relay; deploy the accompanying relay update once. The history chart below the portfolio remains portfolio-wide, not Bitcoin-only.

The graph and quote display use the selected display currency. Saved values remain available offline; live daily chart data requires an internet connection.

## Projections

The projection controls, calculation logic, and starting assumptions are unchanged from Pocket ISA. Forecasts are estimates, not a promise of future returns.
