# LapTap

LapTap is a simple Progressive Web App stopwatch designed for track and field training. It prioritizes fast, reliable operation without requiring the athlete or timekeeper to look closely at the screen.

The entire screen acts as a large touch target, making it easy to start, stop, and record laps with one hand.

## Features

- Full-screen tap to start
- Tap the upper half to stop
- Tap the lower half to record a lap
- Large, mobile-first stopwatch display
- Total and split time for every lap
- Latest lap displayed first
- Unlimited laps within a session
- Scrollable lap history while stopped
- Recent session persistence with `localStorage`
- Installable PWA with offline support
- Portrait-oriented dark interface optimized for mobile devices
- Accurate timing based on `performance.now()`
- Display updates driven by `requestAnimationFrame`

## Controls

### While Stopped

| Action | Result |
| --- | --- |
| Tap anywhere outside the lap history or RESET button | Start or resume the stopwatch |
| Scroll the lap history | Review recorded laps |
| Tap `RESET` | Clear the current time and lap history |

### While Running

| Action | Result |
| --- | --- |
| Tap the upper half of the screen | Stop the stopwatch |
| Tap the lower half of the screen | Record a lap |

Lap input is disabled for the first 300 milliseconds after starting to help prevent accidental laps.

## Lap Data

Each recorded lap includes:

- **Lap**: Sequential lap number
- **Total**: Elapsed time since the stopwatch started
- **Split**: Time elapsed since the previous lap

The newest lap is shown at the top of the list. While the stopwatch is running, scrolling is disabled so tap input always takes priority. After stopping, the lap history becomes scrollable.

## Tech Stack

- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)
- CSS
- Web Storage API

## Local Development

### Requirements

- Node.js
- npm

### Setup

```bash
git clone <repository-url>
cd laptap
npm install
npm run dev
```

Open the local URL shown by Vite in a browser.

### Available Commands

```bash
npm run dev      # Start the development server
npm run lint     # Run ESLint
npm run build    # Create a production build
npm run preview  # Preview the production build locally
```

## Production Build

Create an optimized production build:

```bash
npm run build
```

The generated files are written to the `dist/` directory.

Preview the production build locally:

```bash
npm run preview
```

## PWA Support

LapTap uses `vite-plugin-pwa` to generate its web app manifest and service worker.

- Installable from supported mobile and desktop browsers
- Standalone display mode
- Portrait orientation
- Automatic service worker updates
- Core application assets cached for offline use

For the best experience, install LapTap on a mobile device and launch it from the home screen.

## Screenshots

> Screenshot placeholder: stopped state and lap history

<!-- Add screenshot: docs/screenshots/laptap-stopped.png -->

> Screenshot placeholder: running state with STOP and LAP zones

<!-- Add screenshot: docs/screenshots/laptap-running.png -->

## Planned Improvements

- Optional sound and vibration feedback
- Session history viewer
- Export lap results as CSV
- Custom workout and interval presets
- Improved accessibility options
- Additional PWA icons and platform-specific install polish

## License

No open-source license has been selected for this project yet. All rights reserved.
