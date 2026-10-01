# Groov v10 — Auth UI + Dynamic Share Card

## Login/Register social buttons
- Moved the "Entrar com" / "Começar com" label above the provider buttons.
- Google, Discord and Twitch now stay in a single 3-column row on desktop.
- Mobile keeps the three providers side-by-side with compact labels.

## Cartão compartilhável
- Removed hardcoded sample albums, totals and average.
- `/api/cards` now calculates the current month from the authenticated user's real Listening Logs.
- Top 5 is based on unique albums, using average rating when an album was listened to more than once.
- Total and average are calculated from the month's actual logs.
- Username and month are rendered dynamically.
- Added `Baixar imagem` to export the card as a high-resolution PNG directly in the browser.
- Empty months show a clear empty state instead of fake data.
