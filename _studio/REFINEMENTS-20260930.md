# Layout refinements — 2026-09-30

## Changes

- Mobile hero: equal-width, 54px-high actions; fewer repeated arrows.
- Minimal SVG menu, navigation, rating and decorative icons; menu autofocus is on the close button rather than the logo. Keyboard focus indicators remain enabled.
- Hero now says "Produtora audiovisual", without a status dot; desktop heading line-height increased.
- "Projetos em destaque" replaces "Trabalhos que falam"; lead video limited to 1040px.
- Caption divider moved directly below the lead video. Title and editorial note stay together; section spacing increased slightly.
- Desktop selected works, Cut Room, cases and portfolio use aligned rows, without staggered positioning. Video content retains its full frame through object-fit: contain.
- All 13 publicly visible Google reviews verified on the Take Cut listing on 2026-09-30, represented as short attributed excerpts with a link to the original listing. No automatic synchronization is implied.

## Verification

- Build completed for 30 pages and 16 projects.
- Both static validators passed (links, media, SEO, CSP, script hashes and syntax).
- Added review-data and no-emoji text checks to the parser-based validator.
- Local browser checks on Home and portfolio at 320, 390, 768, 1440 and 1920px: no horizontal document overflow.
- Mobile Home actions measured at equal width and 54px height.
- Menu opens with focus on "Fechar menu"; logo is not focus-visible and has outline-style: none.
- Desktop: lead width 1040px; selected vertical cards share their top edge; Cut Room uses equal columns; case media share top edge and 520px height; portfolio media share equal row sizes.
- Portfolio IA filter returns four projects; project viewer opens and closes.
- Review controls cycled through 13 distinct authors and returned to 01 / 13.
- No browser console errors observed in the tested session.

Testing used a Chromium-based browser with viewport resizing, not physical iOS/Android devices or Opera.
