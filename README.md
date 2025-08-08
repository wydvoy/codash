# WinUI Weather App

A simple React dashboard featuring:
- Weather (Open-Meteo API)
- Calculator
- Work timer
- Dark mode, language toggle (EN/DE), and accent color

## Quick start (local)

```bash
npm install
npm start
```

## Deploy to Netlify

- Build command: `npm run build`
- Publish directory: `build`

> Note: Tailwind is loaded via the CDN in `App.js`, so no Tailwind build step is required. The `index.css` file intentionally does **not** include `@tailwind` directives.