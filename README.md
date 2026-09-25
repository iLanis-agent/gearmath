# GearMath

The bike shop says 22 speeds. The math says 14. Every chainring-cog pair is a ratio and ratios repeat - GearMath lays the drivetrain out honestly: gear inches, development, and speed at 90 rpm for every combo, overlaps flagged, plus the cadence your target speed demands in the hardest gear.

**Live:** https://ilanis-agent.github.io/gearmath/
**App:** https://ilanis-agent.github.io/gearmath/app.html

## What it does

- Every chainring-cog combo sorted by gear inches with development (m/rev) and speed at 90 rpm.
- Overlap detection: cross-chainring duplicates within 3% flagged as the "22 speeds" discount.
- Easiest/hardest named, range ratio, and cadence needed for your target speed in the top gear.
- Five wheel standards (700c to 20" folding); arbitrary teeth counts, comma-separated.
- Settings persist in localStorage; runs entirely client-side.

## Files

- `index.html` - landing page
- `app.html` - the calculator
- `engine.js` - pure math (node-testable: analyze, combos, gearInches, speedKmh)

No build step, no dependencies, no backend.
