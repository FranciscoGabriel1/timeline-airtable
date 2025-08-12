# Airtable Timeline (Challenge)

A compact, zoomable **timeline component** built with **React + TypeScript**.

Features:
- Greedy **lane compaction** (`assignLanes`) so items share lanes when `prevEnd < nextStart`.
- **Zoom** via toolbar buttons and **Ctrl+mouse wheel**.
- **Adaptive date ruler** with UTC-safe labels (`MM-DD`) and dynamic tick spacing.
- **Drag** items to move in whole-day increments (snap-to-day).
- **Resize** via left/right handles.
- **Inline title editing** (double-click; Enter/blur to confirm; Esc to cancel).
- Basic **a11y**: focusable items, `aria-label`s, keyboard move (←/→ = ±1 day).
- Clean dark theme without using prebuilt timeline libraries.

---

## Quick start

Requirements:
- **Node.js ≥ 18**
- **npm ≥ 9**

Run:

```bash
# install
npm install
```

# dev server (Parcel)
```bash
npm start
# usually http://localhost:1234/
```

# If your package.json includes a build script (e.g., parcel build):
```bash
npx parcel build src/index.html
```


