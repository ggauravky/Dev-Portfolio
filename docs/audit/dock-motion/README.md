# Dock indicator and open/close: before and after (D-132, D-133)

Recordings (`.mp4`). Desktop is 1280px on /about: first hover, a hover sweep across every item and back, leave to close, reopen, close. Mobile is 390px at 4× CPU: tap open, keyboard focus walks the indicator through the grid (touch has no hover), close, reopen, close.

- `indicator-desktop-before.mp4` / `indicator-desktop-after.mp4`, and `indicator-desktop-compare.mp4` (before on top)
- `indicator-mobile-before.mp4` / `indicator-mobile-after.mp4`, and `indicator-mobile-compare.mp4` (before on the left)

The three builds compared:
- **main** = `a0d80ef` (framer `layout`/`layoutId`)
- **v1** = `e831bd8` (#40, D-132)
- **v2** = D-133 (one-element indicator, no colour transitions, 320 ms token)

## What animates (DOM inventory: `transitionrun` events, inline-style mutations, per-frame layout boxes)

| Gesture | main | v1 | v2 |
|---|---|---|---|
| Indicator per hover | framer writes `transform` inline every frame (187 writes per sweep) and re-measures | 3 elements × `transform` transition; `.dock-item` `color` transition ×42 | **1 element**, `transform` transition only (24 per sweep) |
| Indicator positioning | JS (framer projection) | CSS custom properties → `transform` | CSS custom properties → `translate()` + `scaleX()` |
| Open/close | menu mounted/unmounted (layout boxes change); panel `transform` + 4 `border-radius` values written per frame | skin `transform` + body/pill `opacity` | same as v1 |
| Layout boxes changing per frame | yes (on toggle) | none | none |
| `display`/`height` toggles | mount/unmount | none | none |

## Trace numbers

Production builds in Chromium 156, hardware GPU (`--use-angle=d3d11`), 2 runs each. Desktop is 1440×900 on /about; mobile is 390×844 at 4× CPU.

| Scenario | Metric | main | v1 | v2 |
|---|---|---|---|---|
| Desktop hover sweep | React commits | 21–22 | 1 | 0 |
| | style recalc | 325–400 ms | 222–308 ms | 135–141 ms |
| | dropped frames | 0–13 | 0 | 0–1 |
| Desktop close | dropped frames | 3–5 | 0 | 0 |
| Mobile first open | longest task | 113–234 ms | 115–150 ms | 20–44 ms |
| | dropped frames | 13–21 | 8–13 | 1 |
| Mobile close | longest task | 148–252 ms | 95–114 ms | 12–38 ms |
| | dropped frames | 12–25 | 5–6 | 0–3 |
| Mobile reopen | longest task | 73–218 ms | 37–70 ms | 24–57 ms |
| | dropped frames | 4–21 | 2–4 | 1–3 |

Known cost: the first desktop open in a fresh browser profile spends about 65 ms on the GPU thread compiling shaders (5–6 dropped frames). The main thread is idle during this, and later opens drop none.
