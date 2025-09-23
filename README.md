# Advanced Themes Bundle (12 thema's)

- `/index.html` — kant-en-klare listingpagina met filters + themaswitcher
- `/assets/css/base.css` — enhanced basisstijl
- `/assets/css/themes/theme-1..12.css` — geavanceerde merk-thema's
- `/assets/js/themes.js` — 12 themanamen en paden
- `/assets/js/app.js` — feed loader met lokale mirror-voorkeur en JSON-parsing fallback

## Gebruik
Publiceer als GitHub Pages of open lokaal. Werk met querystring:
- `?theme=theme-12`
- `?feed=https://<user>.github.io/<repo>/data/feed.json`
- `?realtor=<uuid>` (probeert eerst `data/realtor-<uuid>.json`)

