# Listingpagina (GitHub Pages)

Statische pagina met filters (plaats, status), themaswitcher (10 thema’s) en dynamische feed via querystring.

## Host op GitHub Pages
1. Maak een repo aan, bv. `vendr-integrated` (of gebruik uw bestaande).
2. Plaats de mappen/ bestanden:
   - `index.html`
   - `assets/css/base.css`
   - `assets/css/themes/theme-1.css … theme-10.css`
   - `assets/js/app.js`
   - `assets/js/themes.js`
3. Zet GitHub Pages aan op branch `main` → `/` (root).

## Gebruik
- Zonder params: gebruikt `https://venapp.accept.paqt.io/feed`.
- Met realtor: `?realtor=<UUID>` → feed wordt `https://venapp.accept.paqt.io/realtor/<UUID>/feed`.
- Optioneel: `?theme=theme-7` om direct een thema te kiezen.
- Optioneel: `?feed=<volledige-url>` om een specifieke feed te forceren.

## CORS / Mirrors
GitHub Pages is een andere origin dan `venapp.accept.paqt.io`. Als CORS de directe call blokkeert, probeert de app automatisch een read‑only mirror via `https://r.jina.ai/…`.
