# Listingpagina – Neutrale header + alleen themafilter

- Header is licht/neutraal en bevat alléén de **thema-selector**.
- Alle themakleuren/styling zijn **gescope't** naar `.themed` onder de header.
- **Feed fallback**: `?feed=...` → `?realtor=...` → `data/feed.json` (meegeleverd) → externe feed(s) + `r.jina.ai` proxy.
- Badge linksboven in de afbeelding toont **Available / Under bid / Sold**.
- **12 geavanceerde thema's** zijn inbegrepen.

## Snel starten op GitHub Pages
1. Upload alle bestanden naar je repo (root) en zet Pages aan.
2. Open: `https://<user>.github.io/<repo>/` — toont meegeleverde `data/feed.json`.

3. Test thema: `?theme=theme-7`
4. Test eigen feed: `?feed=https://<user>.github.io/<repo>/data/feed.json`
5. Test makelaar: `?realtor=<uuid>` (werkt als je in `data/` `realtor-<uuid>.json` plaatst).

*Gegenereerd: 2025-09-23T23:46:19.499561Z*
