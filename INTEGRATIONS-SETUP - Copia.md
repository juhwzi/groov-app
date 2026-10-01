# Groov — Spotify e Last.fm (local development)

## Spotify

Spotify no longer accepts `localhost` as an OAuth redirect URI. For local development, use the explicit loopback address:

```env
NEXT_PUBLIC_APP_URL="http://127.0.0.1:3000"
SPOTIFY_CLIENT_ID="..."
SPOTIFY_CLIENT_SECRET="..."
```

In the Spotify Developer Dashboard, register this exact redirect URI:

```text
http://127.0.0.1:3000/api/integrations/spotify/callback
```

Then open Groov at:

```text
http://127.0.0.1:3000
```

Do not use `http://localhost:3000` while testing Spotify, because the session cookie is host-specific and Spotify rejects localhost redirect URIs.

## Last.fm

```env
LASTFM_API_KEY="..."
LASTFM_API_SECRET="..."
```

For the Last.fm API application, configure the callback URL used by your local Groov instance. The application uses Last.fm's web authentication flow (`/api/auth`) and receives the authorization token directly in the callback.

For local development, use:

```text
http://127.0.0.1:3000/api/integrations/lastfm/callback
```

After changing `.env`, restart `npm run dev`.
