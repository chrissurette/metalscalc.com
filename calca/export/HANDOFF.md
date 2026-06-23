# Scrap Metal Calculator Widget — Handoff Document

## What's in this folder

| File | Purpose |
|------|---------|
| `scrap-calculator.iife.js` | Self-contained widget bundle (React + all logic included, ~488 kB, ~150 kB gzipped) |
| `style.css` | Range slider styles — must be loaded separately |
| `HANDOFF.md` | This document |

The full source project (`calca/`) can also be handed off as-is. Any developer can run it with `npm install && npm run dev` (Vite, port 5174).

---

## Embedding on a page

Add these three things to any HTML page:

```html
<!-- 1. Styles (in <head>) -->
<link rel="stylesheet" href="/path/to/style.css">

<!-- 2. Mount point (anywhere in <body>) -->
<div id="scrap-calculator"></div>

<!-- 3. Script (before </body>) -->
<script src="/path/to/scrap-calculator.iife.js"></script>
```

The widget mounts itself into `#scrap-calculator` automatically on script load. No further initialization needed.

---

## Wiring up live spot prices (ticker.js integration)

The widget is pre-wired to receive live metal prices from the parent page's `ticker.js`. Two mechanisms are supported — the widget handles both automatically:

### Mechanism 1 — CustomEvent (primary)

When `ticker.js` fetches new prices, dispatch a `metalprices:update` CustomEvent on `window`:

```js
window.dispatchEvent(new CustomEvent('metalprices:update', {
  detail: {
    gold:     <price per troy oz>,
    silver:   <price per troy oz>,
    platinum: <price per troy oz>,
  }
}))
```

The widget listens for this event and updates its spot price display in real time. Any subset of the three keys is valid — missing keys are ignored and the widget keeps its previous value for that metal.

### Mechanism 2 — window.metalPrices (fallback on load)

If prices are already available when the widget loads, the widget reads them from:

```js
window.metalPrices = { gold: 3300.00, silver: 25.00, platinum: 1050.00 }
```

Set this before or alongside loading the script. The widget checks `window.metalPrices` once on mount as a fallback in case the event fired before the widget was ready.

### Default fallback prices (no ticker)

If neither mechanism is present, the widget uses these hardcoded defaults:

| Metal | Default spot |
|-------|-------------|
| Gold | $3,300.00 / ozt |
| Silver | $25.00 / ozt |
| Platinum | $1,050.00 / ozt |

---

## Widget features

### Metal toggle
Three-way toggle at the top: **Gold / Silver / Platinum**. Switching metal resets purity to that metal's default and clears the current result.

### Weight input
Accepts decimal input. Units switchable via dropdown:
- **Grams** (g)
- **Pennyweight** (dwt) — 1 dwt = 1.55517 g
- **Troy Ounce** (ozt) — 1 ozt = 31.1035 g

### Purity selector
Dropdown of common grades per metal:

| Gold | Silver | Platinum |
|------|--------|----------|
| 8K–24K | .800–.999 Fine | 750–950 Plat |
| Custom % | Custom % | Custom % |

Custom option reveals a free-text field for entering any purity percentage (e.g., `58.5`).

### Calculation
Button: **CALCULATE SCRAP VALUE**

Formula:
```
troy_oz   = weight × conversion_factor
scrap_value = troy_oz × purity_decimal × spot_price
```

The **Estimated Scrap Value** shown is the raw metal value — no payout factor applied.

### Payout slider (Step 4)
Slider 0–100%. Shows:
- `Payout: 80% ($237.91)` — parenthetical value updates live as slider moves
- The raw scrap value does NOT change when the slider moves

### ADD + button
Saves the current calculation as a row in the list below. Disabled until a result is calculated. Shows **LIST FULL** when 20 items are saved.

Saved row format (fields configurable — see Settings):
```
[Metal]  [weight][unit] · [purity label] · [$scrap_value] · [payout%]    [$payout_amount]  [×]
```

Each row also stores: metal, weight, unit, purity label, scrap value, payout %, payout dollar amount.

After adding, the weight field and result clear; purity resets to that metal's default.

### Saved items list
- Max 20 items
- × button deletes individual rows
- **Total row** (shown when 2+ items): total weight in grams (all units converted) + total payout dollar amount
- "List is full" message when cap is reached

### CLEAR & RESET button
Opens a confirmation modal. On confirm: deletes all saved items, resets all fields to defaults, scrolls to top.

### SETTINGS panel
Modal with:

**Dark Mode toggle** — switches the widget background to pure black (`#000000`). All field backgrounds and text colors update automatically.

**Row Display Fields** — 5 individual toggles (all on by default) for each column in saved item rows:
- Show Weight
- Show Purity
- Show Scrap Value
- Show % Payout
- Show $ Payout

When weight is hidden, the weight total in the Total row also hides.

---

## localStorage

The widget uses three keys — no conflicts with common names, but be aware if the page already uses these:

| Key | Value | Description |
|-----|-------|-------------|
| `scrap-calc-items` | JSON array | Saved item rows — persists across page reloads and browser restarts |
| `scrap-calc-dark` | `"true"` / `"false"` | Dark mode preference |
| `scrap-calc-fields` | JSON object | Row field visibility settings |

---

## Notes for future development

- **Build command:** `npm run build` — outputs to `dist/`. Copy both files to the target site on every rebuild.
- **Dev server:** `npm run dev` — runs on port 5174 (`strictPort: true`).
- **Build format:** Vite library mode, IIFE. React is bundled in — no external React dependency needed on the host page.
- **Mount point:** `<div id="scrap-calculator">` — ID is hardcoded in `src/main.jsx`.
- **No iframe** — the widget inherits the host page's font stack (`Inter`, system-ui fallback) but manages its own colors internally.
- The widget does **not** push any data to external servers — all calculation is client-side.
