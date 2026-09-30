# Follow-up interaction and layout refinements

- Testimonials display first names only; original author identities remain in the source data for attribution.
- Removed fixed review-stage heights. Controls follow actual content with a 22px mobile / 24px desktop gap.
- Mobile Cut Room is now a single column of consistent cards with visible titles, full-frame media and equal media heights.
- Mobile close buttons have no border or touch-induced outline. Keyboard focus remains visible through explicit keyboard-navigation detection.
- Process details expand/collapse over 320ms; repeated clicks cancel prior animations safely. Resizing finishes transitions, and reduced motion / the site pause control skip animation. Native details remain usable without JavaScript.
- Services now use three clear desktop cards, stacked on mobile, directly below their shared heading. All service copy is preserved; decorative REC/slashes/spark removed.

## Validation

- Static generation and both validators passed for 30 pages / 16 projects.
- Added parser-based first-name regression check.
- Browser viewport checks at 320, 390, 768, 1440 and 1920px: no horizontal document overflow.
- Mobile Cut Room: all five media containers measured 304px high at 390px viewport.
- Mobile short/long review stage measured 174px / 292px with the same 22px control gap.
- All 13 displayed names contain first names only.
- Both mobile close buttons measured 0px border and outline-style none after pointer interaction.
- Process expansion observed in progress on mobile and desktop; repeated toggle completed with no stale animation.
- Pause-animation mode completed immediately; Enter toggled the selected process step.
- No browser console errors observed.

Validation used Chromium viewport emulation, not physical mobile devices.
