# Listingpagina – vendr.nl feed

- Header is licht/neutraal en bevat alléén de **thema-selector**.
- Themastijlen zijn **gescope't** naar `.themed` onder de header.
- **Feedvolgorde**: `?feed=...` → `?realtor=...` → `data/feed.json` (meegeleverd) → `https://vendr.nl/feed` (of `https://vendr.nl/realtor/<uuid>/feed`) inclusief `r.jina.ai` proxy-varianten.
- Badge linksboven toont **Available / Under bid / Sold**.
- **12 thema's** aanwezig; Thema 1 is aangepast volgens jouw specificaties (Roboto Slab, card #B6D6DB, badge #5D3D69 vierkant).

## Snel testen op GitHub Pages
1. Upload alle bestanden naar je repo (root) en activeer Pages.
2. Open: `https://<user>.github.io/<repo>/` (gebruikt meegeleverde `data/feed.json`).

3. Thema: `?theme=theme-1` t/m `?theme=theme-12`
4. Eigen feed: `?feed=https://<user>.github.io/<repo>/data/feed.json`
5. Makelaar: `?realtor=<uuid>` (werkt als je een `data/realtor-<uuid>.json` neerzet).

*Gegenereerd: 2025-09-24T09:08:41.387909Z*
