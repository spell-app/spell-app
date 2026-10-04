# Spell Design System

**Spell** (a.k.a. *Spell App*) is a programming language for non-programmers whose source code is grammatical human language. AI writes the spell, a human can read and edit it, and Spell compiles it into code that runs in a browser. It will be internationalised (spells in Spanish, German, French…).

Brand brief: *friendly without being kitschy, and sophisticated.* Wizard-hat mark, purple palette, light + dark.

Surfaces covered here:
- **Spell App** — the builder (Build · Your Apps · Templates · Settings), plus the **Spell theme** used by apps *made with* Spell (the habit-tracker preview).
- **Docs** — documentation site.
- **Marketing** — public website.

### Sources
Also: the `ui` codebase (`@spell-app/ui`, theming in `ui/docs/theming.md`) — the Theme Creator emits sheets in its `@layer ui.theme` / `--ui-*` format.

All provided in `uploads/brand/` (copied to `assets/`):
- `brand identity prompt.txt` — the brief above.
- `Spell brand treatment 100206.png` → `assets/reference/brand-treatment.png` — primary reference: lockup, tagline, palette, light/dark app.
- `sketches.jpg` → `assets/reference/sketches.jpg` — logo exploration, "Spell App" lockup, tablet light/dark.
- `docs1–5.jpg` → `assets/reference/docs-*.jpg`, `marketing-shape.jpg` — docs + marketing directions.
- `house-of-owen.png` — Valspar *House of Owen* 8003-47D, #8E96B5.
- `logo-mark.svg / .png / -large.png` — the hat mark (SVG uses `currentColor`).

No codebase or Figma was provided; components and kits are authored from these references.

---

## CONTENT FUNDAMENTALS

**Voice:** a calm, capable guide. Warm, plain, a little delighted — never cutesy. Magic is the *metaphor*, not the vocabulary; use it in headlines and taglines, not in every sentence.

- **Person:** speak to the reader as **you**; Spell refers to itself in third person ("Spell turns it into a working app"). Avoid "we" except in legal/company copy.
- **Casing:** Sentence case for everything — headings, buttons, nav ("Your Apps" and "Spell App" are proper names and keep caps). Eyebrows are UPPERCASE mono.
- **Headlines end with a period.** "Write in plain language." "Shape the app as you go." Short, declarative.
- **Every headline gets an italic serif lede** — a 3–6 word echo: "Clear words. Better results." "Your idea, your structure, your pace."
- **Rhythm of threes:** Describe · Preview · Refine. "Keep it simple. Be specific. Use everyday words."
- **No jargon** in product copy: say *app*, *list*, *screen*, *button* — not *component*, *schema*, *deploy*. Technical terms live only in "Compiled" views.
- **Spells are quoted** in typographic quotes and set in serif: “Create a habit tracker app with add, done and streaks.”
- **Taglines:** *All magic, no fuss.* (primary — optional in the lockup) · *Make it yours.* · *Small steps. Big magic.* · *Magical tech to realize your visions.*
- **Progress copy** uses present participles: "Planning structure", "Creating screens", "Building your app…". Completion is quiet: "Your app is ready."
- **Emoji:** never. Use the four-point sparkle icon instead.
- **Microcopy examples:** "⌘↵ to cast" · "Not yet" / "Publish" · "That doesn't look like an email." · "Edited 2 min ago".

---

## VISUAL FOUNDATIONS


**Themes** (`tokens/theme.css`). Light on `:root`; dark via `data-theme="dark"` or `.spell-dark`. Dark is *aubergine*, not black — `#1C1340` canvas, `#261B52` cards, lilac accent with aubergine text on it. Always use semantic tokens (`--surface-card`, `--text-strong`, `--accent`) so both modes work.

**Type** (`tokens/typography.css`).
- **Palatino** (headlines, ledes, wordmark, spell text) — macOS "Palatino", Windows "Palatino Linotype"/"Book Antiqua", Linux "P052" (URW base35, metric clone). The `'Spell Serif'` face resolves to the installed one and only downloads bundled P052 if none exists. Bold 700 for H1–H2, Regular for H3, Italic for ledes.
- **Body: system UI** (recommended, pending your pick) — SF Pro / Segoe UI / Noto Sans·Cantarell·Ubuntu. Alternatives in `guidelines/type-body-options.html`: Optima→Candara (Zapf pairing) or Verdana→DejaVu Sans.
- **Mono: system** — SF Mono / Consolas / DejaVu Sans Mono — compiled code and eyebrows only.
- **Rule: a spell is prose, so it is always serif, never mono.** Mono is reserved for what the machine produced.

**Density.** "Refined, not airy." 4px grid; 36px controls; cards pad 20px; list rows gap 12px; sidebar 232px. Generous only at hero scale.

**Corners.** Actions are **pills** (999px). Inputs 12px. Cards 16px. Dialogs 22px. Phone/preview frames ~32px. App icon 22.5%.

**Cards.** White, 1px `--border-subtle` hairline, soft aubergine-tinted shadow (`--shadow-sm`). Variants: *tint* (lavender wash, no shadow — asides, sidebars), *warm* (ivory, no shadow — app previews, tips, quotes). Never coloured left-border cards.

**Shadows.** Low-contrast, violet-tinted, large blur, negative spread. Four steps xs→lg. Dark mode swaps to deeper near-black shadows.

**Backgrounds & motifs.** Mostly flat near-white (`#FBFAFE`). Decoration = **soft lavender organic blobs** tucked into corners (never behind body text), **ivory warmth** for anything "alive", and the **four-point sparkle**. The references also show thin flowing violet *flourish lines*; these need a real illustrated asset (not provided — don't hand-draw). Inverse panels are solid aubergine with a lilac blob rising from a corner. No gradients on surfaces; no photography in the core brand.

**Motion.** Gentle and quick: `--ease-out` (0.22,1,0.36,1), 120–360ms. The signature is the **build checklist**: completed = filled purple check, current = pulsing lavender dot, pending = outline. Switch knobs use a slight spring. No bounces on layout, no parallax.

**States.** Hover: surfaces get `--surface-tint`, borders step to `--border-strong`, primary deepens one step (`--accent-hover`). Press: `scale(0.97)`. Focus: 3px `--accent-ring` halo. Selected nav: lavender fill + purple text (light), solid purple + white (dark). Selected chips: aubergine fill (light) / lilac fill (dark). Disabled: 45% opacity.

**Transparency/blur.** Only on modal scrims (aubergine 36% + 4px blur). Dark-mode tints use lilac at 8–24% alpha.

**Controls:** prefer native form controls (`<input type="range" list>` + `<datalist>` for ticks, `accent-color` for tint) over hand-built widgets. When a custom thumb/handle is unavoidable, separate it from the track with a **soft shadow, never a white ring** (rings read as rendering errors). End ticks sit inset to match the track’s rounded ends.

**Colour chips are always square** (aspect-ratio 1, 8–12px radius) — swatches, pickers, palette cells.

**Checkboxes are round** — the to-do circle is a brand motif. Completed items strike through and fade.

---

## ICONOGRAPHY

- **Style:** 1.5–2px outline, rounded joins, 24px grid — matches the references (sparkles, calendar, grid, gear).
- **Set:** **Font Awesome 7 Free** (solid + regular), via `tokens/icons.css` (jsDelivr) — matches the `@spell-app/ui` default pack `fa7-free`. Use `<i class="fa-solid fa-gear"></i>`.
- **Signature glyph:** `fa-solid fa-wand-magic-sparkles` (four-point stars) = "Build" / magic happening. Use it for the primary Build action, progress titles, toasts. Don't overuse elsewhere.
- **Hat mark** doubles as the icon for tips/callouts and quotes.
- **Emoji:** never. **Unicode** only for keyboard hints (⌘↵) and arrows in copy (→).
- App icons inside Spell-built apps use Font Awesome 7 Free in the accent colour (e.g. `fa-solid fa-seedling` for Habit Tracker).

---

## Logo

Outlined lockups (no font needed; hat centred on the wordmark's cap height): `assets/logo/spell-lockup.svg`, `spell-app-lockup.svg`, `spell-lockup-tagline.svg` — each `currentColor`, `-aubergine`, `-white`. Mark alone: `logo-mark.svg` (+ coloured). Paths are from P052 Bold/Italic (URW base35, AGPL with font exception) — swap for licensed Palatino outlines before trademark filing.

---

## Index

- **`Design System.dc.html` — clickable index of every mockup and tool (each page links back via a bottom-right pill).**
- `styles.css` — entry point (imports only).
- `lib/palette.mjs` (generator) · `lib/palette.json` · `lib/spell-flourish.js` (mock `<spell-flourish>` web component).
- Top-level pages (show in the Pages menu): `Design System`, `Spell App`, `Spell Docs`, `Spell Marketing`, `Color Palette`, `Color Set Chooser`, `Theme Creator`, `Flourishes` (.dc.html). `pages/` and `ui_kits/*/` hold their preview cards.
- `tokens/` — `icons.css` (FA7), `fonts.css`, `palette.css` (generated), `theme.css` (light/dark semantic), `typography.css`, `spacing.css` (space, radii, controls, motion), `base.css`.
- `components/components.css` — `.sp-*` classes used by all components.
- `components/` — React primitives (`.jsx` + `.d.ts` + `.prompt.md`):
  - `core/` Button, IconButton
  - `forms/` Input, Textarea, Select, Checkbox, Radio, Switch
  - `display/` Card, Badge, Tag, Callout, NumberedStep
  - `navigation/` Tabs, SegmentedControl, NavItem
  - `feedback/` Dialog, Toast, Tooltip, BuildProgress
  - `brand/` LogoMark, Logo, AppIcon, SpellComposer
  - `panel/` Panel, PanelHeader, PanelSubHead, Fieldset (inspector panels — see Color Set Chooser)
- `guidelines/` — foundation specimen cards (colours, type, spacing, brand).
- `Spell App.dc.html` (Build w/ live cast + habit-tracker preview, Your Apps, Templates, Settings; light/dark).
- `Spell Docs.dc.html` (3 guide pages, spell/compiled example tabs, dark toggle).
- `Spell Marketing.dc.html` (hero with try-a-spell, how it works, spell vs compiled, CTA).
- `assets/logo/`, `assets/reference/` — marks and original boards.
- `SKILL.md` — agent-skill entry.

### Intentional additions
No source defined a component inventory, so a standard set was authored. Brand-specific additions: **BuildProgress** (signature checklist), **SpellComposer** (serif spell input), **Callout** and **NumberedStep** (recurring docs patterns), **Logo/AppIcon** (lockups).
