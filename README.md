# ParkSpot

Remember where you parked. One tap saves your spot; a live arrow walks you back.

Built as a 3-4 hour project: an offline-first PWA with no backend, no accounts and no API keys.

## Features

- **One-tap save** — captures GPS position and accuracy, plus optional floor, bay number, note and a photo of the spot.
- **Find my car** — live distance, walking-time estimate and a compass arrow that rotates as you turn (uses the device magnetometer when available, falls back to a north-relative bearing).
- **Map view** — OpenStreetMap with your position, the car, and a straight line between them.
- **Walk me there** — hands off to Google Maps (or Apple Maps on iOS) in walking mode for street-level directions.
- **Parking timer** — optional 30 min / 1 hr / 2 hr countdown with a browser notification when it expires.
- **No-GPS fallback** — underground garage with no signal? Tap the map to drop the pin manually.
- **Offline first** — everything lives in IndexedDB on the device, map tiles are cached, and the app installs to the home screen as a PWA.

## Stack

React + TypeScript + Vite, Leaflet for maps, `idb` for IndexedDB, `vite-plugin-pwa` for the service worker and manifest.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
npm run lint
```

Geolocation and the camera require a secure context: `localhost` works, and any other host needs HTTPS.

## Testing it on your phone

```bash
npm run build && npm run preview -- --host
```

Serve over HTTPS (e.g. via a tunnel) and open the URL on your phone, then "Add to Home Screen".

## How it works

- `src/db.ts` — IndexedDB store; photos are kept as `Blob`s so nothing is uploaded anywhere.
- `src/geo.ts` — haversine distance, initial bearing, walking-time estimate and the maps deep link.
- `src/hooks/useGeolocation.ts` — `watchPosition` wrapper with high accuracy enabled.
- `src/hooks/useHeading.ts` — device compass, including the iOS 13+ permission prompt.
- `src/components/` — the save flow, the find-my-car screen, history and the shared map.

## Ideas for extending it

- Auto-detect parking by watching for a Bluetooth car audio disconnect.
- Share a spot with a friend via a link that encodes the coordinates.
- Photo OCR of the bay number so the floor/bay fills itself in.
