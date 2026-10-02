# Theming `@spell-app/ui`

How the CSS foundation fits together:  tokens, remaps, layers, the app stylesheet, utilities and themes.
Everything lives in `src/styles/`;  the design rationale is in `plan.md` ("CSS system").

## The pieces

| Sheet | What | Layer |
|---|---|---|
| `layers.css` | the layer order;  MUST be first in every tree scope | -- |
| `reset.css` | box-sizing / margin reset for shadow markup (`:host`-scoped, never touches the page) | `ui.reset` |
| `tokens.css` * | type, spacing, radii, borders, ink + text / border alphas, shadows, motion, z-index, breakpoints | `ui.tokens` |
| `colors.css` * | palette, semantic and neutral colours, colour remaps, `ui-text/bg/border-<colour>` | `ui.tokens`, `ui.utilities` |
| `sizes.css` * | size ratios, size remaps, `ui-font-size-*`, spacing utilities | `ui.tokens`, `ui.utilities` |
| `animations.css` | the transition catalogue (`ui-fade-up-in` ...) and its hooks | `ui.utilities` |
| `utilities.css` | layout / text / theme / visibility utilities | `ui.utilities` |
| `typography.css` | page typography, opt-in with `class="ui-typography"` | `ui.base` |
| `native.css` | native markup slotted into components, the CSS-only tooltip, `ui-native` | `ui.components` |
| `themes/classic.css` | Fomantic's original look | `ui.theme` |
| `themes/dark.css` | force the dark scheme page-wide | `ui.theme` |
| `media.css` | `@custom-media --ui-mobile` ... (build-time only) | -- |
| `ui.css` | one `@import` entry of the page set, for pages without the runtime | -- |

\* GENERATED from `styles.vocabulary.en.ts` by `yarn gen:styles` -- never edit them by hand.  The generated
files are committed, so consumers need no build step;  `styles.test.ts` fails when they're stale.

`$/ui/styles` exports each sheet as text (`tokensCSS` ...), plus `foundationCSS` (adoption order for the document
AND every shadow root) and `pageCSS` (foundation + typography + native, for the document only).

## Units

- NEVER `rem`:  the host page can redefine it.  The ONE absolute length is `--ui-font-size` (px, default
  `16px`);  everything else is `em` of the local font size, or px for hairlines and shadows.
- A component root sets `font-size: calc(var(--ui-font-size) * var(--ui-scale, 1))` and uses `em` inside.
- Scale a whole region by overriding `--ui-font-size` on a wrapper;  components inside follow.

## Layers

```css
@layer ui.reset, ui.tokens, ui.base, ui.components, ui.utilities, ui.theme, ui.app;
```

- Later layers win regardless of specificity;  unlayered page CSS beats all of them.
- Each component adds `ui.components.<name>.types / content / variations / states`, so states beat
  variations without `!important`.
- `layers.css` must be adopted FIRST into the document and into every shadow root (each is its own scope).

## Tokens

- Declared on `:root`, plus a `:host` copy guarded by `@container not style(--ui-sheet-<name>: loaded)`:
  - where the page loaded the sheet, the guard is false, `:host` declares nothing, and page / wrapper
    overrides inherit into components
  - where it didn't (detached rendering), the component's own adopted copy supplies the defaults
  - an unguarded `:host { --ui-font-size: 16px }` would instead block every wrapper override
- Colours are `light-dark()` token streams, resolved where they're USED, so `color-scheme` on any subtree flips
  every colour below it -- in the page and through shadow boundaries.
- The concrete per-scheme bases (`--ui-red-on-light`, `--ui-red-on-dark`) are registered with `@property`
  (`<color>`), so they animate and type-check.  The `light-dark()` tokens themselves are NOT:  a registered
  `<color>` resolves `light-dark()` where it's declared (`:root`), freezing the page's scheme into `.ui-dark`
  subtrees.  NOTE: `@property` only registers from the document -- rules inside shadow-root sheets are ignored.

### Colour tokens

For every hue (`red orange yellow olive green teal blue violet purple pink brown grey black`), the aliases
(`primary` -> `blue`, `secondary` -> `black`) and the semantic colours (`positive negative info warning`,
with `success` / `error` as aliases):

| Token | Meaning | Fomantic |
|---|---|---|
| `--ui-red` | the colour, `light-dark(var(--ui-red-on-light), var(--ui-red-on-dark))` | `@red` / `@lightRed` |
| `--ui-red-hover / -focus / -down / -active` | states (darken + saturate;  `black` lightens) | `@redHover` ... |
| `--ui-red-text / -header / -border / -background` | roles, per scheme | `@redTextColor` ... |
| `--ui-red-inverted` | the colour on dark surfaces, whatever the scheme | `@lightRed` |
| `--ui-red-on` / `--ui-red-inverted-on` | text ON the solid colour (white or ink), per scheme | `@white` |

Neutrals:  `--ui-background`, `--ui-surface`, `--ui-surface-muted`, `--ui-surface-strong`, `--ui-highlight`,
`--ui-ink`, `--ui-text-color` / `--ui-text-{dark,muted,light,unselected,hovered,pressed,selected,disabled}`
(+ `--ui-text-inverted-*`), `--ui-border-color[-strong|-internal|-selected|-selected-strong|-disabled]`,
`--ui-link[-hover]`, `--ui-focus-color`, `--ui-focus-border`.

## Remaps

Component CSS never names a hue.  A colour class re-points the GENERIC tokens, and one rule set consumes them:

```css
/* generated, colors.css */
.ui.red, .ui-red {
  --ui-color: var(--ui-red);
  --ui-color-text: var(--ui-red-text);
  --ui-color-on: var(--ui-red-on);
  /* ... -header, -border, -background, -inverted, -inverted-on */
}
/* generated once for every colour:  states derive from --ui-color on the same element */
.ui.red, .ui-red, .ui.orange, /* ... */ {
  --ui-color-hover: oklch(from var(--ui-color) calc(l - 0.05) calc(c * 1.1) h);
}

/* component CSS (e.g. ui-button.css) */
.ui.button { background: var(--ui-color, var(--_ui-button-background)); color: var(--ui-color-on, inherit); }
.ui.button:hover { background: var(--ui-color-hover, var(--_ui-button-background-hover)); }
```

- Contract for components:  READ `--ui-color*` with a fallback for the uncoloured look;  NEVER declare them
  (remaps live in `ui.tokens`, below components, so a component declaration would override the colour class).
- Sizes work the same way:  `.ui.large, .ui-large { --ui-scale: var(--ui-size-large) }`;  `.medium` emits
  `--ui-scale: 1`, a no-op that also resets a size inherited from a wrapper.
- The generic tokens INHERIT:  `<div class="ui-red">` recolours every component inside it (that's the point of
  the `ui-<hue>` utility).  A component that must not inherit a parent's colour resets it on its own `:host`.
- `data-variation="red small"` (tooltips / popups) sets `--ui-variation-color` / `--ui-variation-scale`
  instead, so a coloured tooltip never recolours the element it hangs off.

### Contrast

Text on a solid colour is `--ui-<colour>-on`:  white or ink (`--ui-ink-on-light`), chosen by `StyleGenerator` at
generation time as the first of `onColors` (white first) that reaches WCAG AA 4.5:1 on the colour AND its hover /
focus / down / active states, separately for the light and dark scheme (`ColorContrast`, clipped to sRGB as axe
does).  `contrast-color()` would do it in CSS, but is Chromium-only.

- Light scheme:  white on red, green, blue, violet, purple, pink, brown, grey, black;  ink on orange, yellow,
  olive, teal, info, warning.  Dark scheme (lighter `onDark` hues):  ink on everything but black.
- `--ui-<colour>-inverted-on` is the dark-scheme pick, for the `-inverted` colour used whatever the scheme.
- `-text` roles reach 4.5:1 on `--ui-background` in both schemes, hue `-border`s 3:1 (UI boundaries).
- `colors.contrast.test.ts` measures every pair from the COMPUTED tokens, so a vocabulary change that breaks
  contrast fails a test, naming the colour.
- A theme that changes a base (`--ui-red-on-light`) should re-check its `-on`:  it's data, not derived.  The
  classic theme keeps Fomantic's palette, and with it Fomantic's contrast failures.

## Component tokens

Every family exposes PUBLIC per-component tokens, `--ui-<tag>-*`, one per Fomantic `.variables` entry that still
matters:  `--ui-button-radius`, `--ui-card-width`, `--ui-header-color`.  Each docs page lists them with their
defaults (`CssTokens.astro` reads them from the sheet).  Decided 2026-09-30 (Owen).

### Where you can set them

Anywhere above or on the box;  all of these work, for elements and static class-grammar markup alike:

| Where | Reaches | Example |
|---|---|---|
| `:root` or a theme sheet | every instance on the page | `:root { --ui-button-radius: 0 }` |
| any ancestor | a region | `<section style="--ui-button-radius: 0">` |
| the host | one kind, or one instance | `ui-button.cta { ... }`, `<ui-button style="...">` |
| `::part(<root part>)` | the inner box itself | `ui-button::part(button) { --ui-button-radius: 0 }` |
| the app stylesheet | the inner box, by class grammar | `@layer ui.app { .ui.primary.button { --ui-button-radius: 0 } }` |

A variation that SWAPS a value (`circular` buttons) wins over the base token, whatever you set:  restyle the
variation itself with plain properties, through the app stylesheet or `::part()` plus the host attribute
(`ui-button[circular]::part(button) { border-radius: 0.5em }`).

### The pattern (component authors)

A component sheet NEVER declares a public component token.  Custom properties inherit, but a declaration on the
inner box beats any inherited value:  a sheet that said `.ui.button { --ui-button-radius: var(--ui-radius) }`
blocked every value set on the host, an ancestor or `:root` (only `::part()` got through).  Instead the sheet reads
each public token through a PRIVATE ALIAS declared where the public one used to be, and every rule reads the alias:

```css
.ui.button, .ui.buttons, .or {
  --_ui-button-radius: var(--ui-button-radius, var(--ui-radius));
  --_ui-button-labeled-icon-width: var(--ui-button-labeled-icon-width, calc(1em + 2 * var(--_ui-button-padding-block)));
}
.ui.button { border-radius: var(--_ui-button-radius); }
```

- Naming:  `--_ui-<tag>-<rest>`, the public name with `_`, mechanical and grep-able.  The older ad-hoc privates
  (`--_button-*`, `--_card-*`) are variation plumbing and keep their names.
- Declare the alias on EVERY box that reads it (the token block's selector list, as before), so a nested instance
  resolves its own value, never an outer one's.
- Rules read the alias, never the public name:  a bare `var(--ui-button-radius)` would skip what a variation writes.
- A default derived from another token reads that token's ALIAS (`labeled-icon-width` above), so the user's base
  value flows into it.  Both aliases sit on the same box:  `var()` in a custom property resolves where it's declared.
- NOT component tokens, mechanism unchanged:  the remaps (`--ui-color*`, `--ui-scale`, `--ui-inverted`,
  `--ui-scheme`, `--ui-variation-*`, a local `--ui-size-*` ladder) and the global tokens.  A sheet may declare those.
- `test/component-tokens.test.ts` enforces it:  no sheet declares a `--ui-<tag>-*` name (any family's), every alias
  is named after the token it reads, and no sheet reads an aliased token bare.  `EXCEPTIONS` lists deliberate
  cross-family theming, each with why.
- A token nothing varies needs no alias:  the rule reads it where it paints, `var(--ui-modal-content-padding, 1.5em)`.
  `CssTokens.astro` lists both kinds.

### Variations

- A variation that SWAPS to another value writes the alias, on the box that declares it (a later sublayer, so it
  wins):  `.ui.wide.foo { --_ui-foo-gap: 2em }`.  If Fomantic has a variable for the swapped value, that's a
  public token of its own, read through its alias:  `--_button-pad-block: var(--_ui-button-tertiary-padding)`.
- A variation that is a FUNCTION of a base token derives from the base's alias, so the user's base value flows
  through:  `compact` sets `--_button-density: var(--_ui-button-compact-ratio)` and the padding rule computes
  `calc(var(--_ui-button-padding-block) * var(--_button-density, 1))`.
- GROUPS:  a variation on a group box (`.ui.basic.buttons`) that its members must follow can't write the alias --
  each member box re-declares `--_ui-button-*` from the public token and drops it.  Use a separate private
  variation token read IN FRONT of the alias, as the button does:  `var(--_button-radius, var(--_ui-button-radius))`.

### Owner tokens

An owner hands the components inside it (content parts, items, icons, labels) inherited tokens.  Four kinds:

| Kind | Example | Owner (declares on EVERY root) | Reader |
|---|---|---|---|
| switch | `--_ui-card-layout`, `--_ui-icon-owner-margin`, `--_ui-part` | the private name, default included;  variations write it | `@container style(--_ui-card-layout: horizontal)`, `var(--_ui-icon-owner-margin, 0)` |
| look token the owner VARIES | `--ui-modal-header-size`, `--ui-header-sub-color` | the alias:  `--_ui-modal-header-size: var(--ui-modal-header-size, 1.42857em)`;  variations write it | the alias only:  `var(--_ui-modal-header-size, 1.42857em)` (the default covers a part outside its owner) |
| look token nobody varies | `--ui-card-header-color` | nothing | `var(--ui-card-header-color, var(--ui-text-dark))` |
| owner-provided, user-settable too | `--ui-label-owner-edge` | an owner COMPONENT writes the private name | `var(--_ui-label-owner-edge, var(--ui-label-owner-edge, 0px))`, permanently:  a plain `<div>` owner sets the public one |

- Switches are private because the owner's attributes decide them:  a page setting a layout switch would lie about
  the layout.  They were public `--ui-*` names until 2026-09-30, renamed in every family (a pure rename, no look
  change):
  - owners and parts:  `--_ui-card-layout`, `--_ui-card-leading`, `--_ui-part` and every switch of `ui-parts.css`'s
    "Owner tokens" table (`PART_OWNER_TOKENS`), whose two look entries now name the aliases
    `--_ui-modal-header-size` and `--_ui-statistic-value-size`
  - icons, inputs, labels:  `--_ui-icon-owner-*`, `--_ui-icons-*` (corner icons), `--_ui-input-owner-width`,
    `--_ui-label-owner-*` (read dual, see the table), `--_ui-labels-margin`, `--_ui-label-layout`
  - groups:  `--_ui-buttons-*` (positions), `--_ui-segments-*`, `--_ui-images-*`, `--_ui-steps-*` (layout,
    `circular`, `ordered`, corners ...;  the aliases of `--ui-steps-radius` / `-border` / `-accent-on` share the
    prefix)
  - forms:  `--_ui-field-state-*`, `--_ui-fields-*` (inline, stacked, child widths, paddings), `--_ui-form-equal-width`,
    `--_ui-form-unstackable`
  - menus, lists, tabs:  `--_ui-menu-layout`, `--_ui-menu-stackable`, `--_ui-menu-divider-side`,
    `--_ui-menu-first-radius` / `-last-radius` / `-only-radius`, `--_ui-list-layout`, `--_ui-list-align`,
    `--_ui-list-marker`, `--_ui-list-animated`, `--_ui-item-*`, `--_ui-tabs-pane-flex`
  - steps:  `--_ui-step-state`, `--_ui-step-layout`
  - one-offs:  `--_ui-container-width`, `--_ui-shape-type`, `--_ui-breadcrumb-divider-layout`
  - set inline by an element:  `--_ui-dropdown-anchor`, `--_ui-search-anchor`, `--_ui-calendar-anchor` (anchor
    names), `--_ui-pusher-*` (`PUSHER_TOKENS`)
- Declared on EVERY owner root, default included (the alias re-declares from the public token), so a nested owner
  never inherits an outer owner's value.
- Where a page sets an owner look token:  on the owner, above it, or `::part()` of the owner's box -- the part
  reads the owner's alias, so NOT on the part (a look token nobody varies works on the part too).
- Parts read an owner-varied token through the alias ONLY.  A dual read, `var(--_ui-x, var(--ui-x, <default>))`,
  is for a reader that may sit OUTSIDE every declaring box, where only the public name can reach it:
  `ui-label.css`'s `--ui-label-owner-*` (a plain `<div>` owner sets the public one), `ui-form.css`'s field rules (a field
  outside a form) and `ui-label.css`'s `<ui-detail>` link rule.
- Cross-family theming:  an owner that deliberately themes a NESTED component of another family sets that
  family's PUBLIC token, as the page would (`ui-search.css`:  `--ui-input-radius` on its input) -- an `EXCEPTIONS`
  entry in the test, with why.

### Worked example

```html
<style>
  :root { --ui-button-radius: 0; }                                  /* every button square */
  .toolbar { --ui-button-padding-inline: 0.75em; }                   /* a region */
  ui-button.cta::part(button) { --ui-button-background: gold; }      /* one kind, on its box */
  ui-card { --ui-card-header-color: var(--ui-violet-text); }         /* every card's headers (an owner token) */
</style>
<div class="toolbar">
  <ui-button>Tight</ui-button>
  <ui-button compact>Tighter</ui-button>     <!-- 0.75 x 0.75em:  compact derives from the base token -->
  <ui-button circular>Round</ui-button>      <!-- still round:  circular swaps the radius -->
</div>
```

## The app stylesheet (`#ui-app-stylesheet`)

The contract (the runtime's `Styles` service implements it):

- The page has at most ONE `<link>` or `<style>` with `id="ui-app-stylesheet"`.  It may `@import` anything else.
- The runtime mirrors it into one shared constructable sheet and appends it LAST to every component's
  `adoptedStyleSheets`:  tokens -> component -> utilities -> app stylesheet.  Later edits, a late insertion
  and `<link>` loads are picked up.
- Put overrides in `@layer ui.app` (or leave them unlayered to beat everything).  Inside shadow roots the
  class grammar is Fomantic's, so the override language is the one you know:

```css
/* #ui-app-stylesheet */
@layer ui.app {
  .ui.primary.button { border-radius: var(--ui-radius-pill); }
  .ui.card > .content > .header { letter-spacing: 0.01em; }
}
```

## Overriding colours

Globally -- one base token re-colours the hue everywhere, derived states and roles included:

```css
@layer ui.app {
  :root {
    --ui-red-on-light: oklch(0.58 0.22 20);
    --ui-red-on-dark: oklch(0.72 0.17 20);
    --ui-primary: var(--ui-violet);           /* re-point an alias */
    --ui-primary-inverted: var(--ui-violet-inverted);
  }
}
```

Hand-tune one role for one hue (themes do this, e.g. classic's yellow text):

```css
:root { --ui-yellow-text: oklch(0.62 0.13 80); }
```

Per region -- tokens inherit, so override them on a wrapper:

```html
<section style="--ui-font-size: 18px; --ui-radius: 0">...</section>
<section class="ui-dark">...</section>           <!-- whole region in the dark scheme -->
<ui-root theme="dark" size="small">...</ui-root>  <!-- the same through a root:  scheme, and `--ui-scale` for all inside -->
```

Per instance -- set the generic tokens on an UNCOLOURED component;  they inherit into its shadow:

```html
<ui-button style="--ui-color: hotpink; --ui-color-hover: deeppink; --ui-color-on: black">Hot</ui-button>
```

- Don't combine it with `color="..."`:  the inner `.ui.red` element's remap re-declares `--ui-color`,
  which beats the inherited value.
- Derived states only come for free where a remap runs (they're derived from `--ui-color` on the element with
  the colour class), so set the ones you need.  `--ui-color-on` is never derived (see "Contrast"):  set it
  whenever you set `--ui-color`.

NOTE: re-pointing a BASE on an intermediate element (`.card { --ui-red: hotpink }`) changes `--ui-red` below it,
but not the derived `--ui-red-hover` / `-text` (custom properties substitute `var()` where they're declared,
at `:root`).  Override `--ui-color*` there instead, or the base on `:root`.

## Utilities

`utilities.css` (hand-written) plus the generated colour / size parts;  all `ui-*`, all in `ui.utilities`,
adopted into the page and every shadow root:

- layout:  `ui-stack`, `ui-cluster`, `ui-split` (`ui-split:row` / `ui-split:column`), `ui-flank`
  (`:start` / `:end`), `ui-frame` (`:square` / `:landscape` / `:portrait`), `ui-grid` (`--min-column-size`),
  `ui-span-grid`, `ui-gap-<space>`, `ui-align-items-*`, `ui-align-self-*`, `ui-justify-content-*`,
  `ui-flex-wrap` / `-nowrap`
- sizing:  `ui-w-1/2 1/3 2/3 1/4 3/4 full auto fit`, `ui-h-full auto fit`, `ui-m[-side]-<space>`,
  `ui-p[-side]-<space>` with sides `b i bs be is ie`
- text:  `ui-body` / `ui-heading` / `ui-caption` (+ `-<size>`), `ui-font-size-<size>`, `ui-font-weight-*`, `ui-bold`,
  `ui-italic`, `ui-muted`, `ui-text-{start,center,end,justify,nowrap,balance,pretty,truncate}`,
  `ui-text-{uppercase,lowercase,capitalize}`, `ui-link`, `ui-link-plain`, `ui-list-plain`
- colour:  `ui-<colour>` (remap), `ui-text-<colour>`, `ui-bg-<colour>` (the pale background role),
  `ui-border-<colour>`
- theme:  `ui-light`, `ui-dark`, `ui-invert` (flips relative to its parent, via a style query on `--ui-scheme`)
- shape:  `ui-rounded-{s,m,l,pill,circle,square}`
- misc:  `ui-prose` / `ui-not-prose`, `ui-visually-hidden[-force]`, `ui-cloak` (hides undefined elements,
  2s cap), `ui-hidden`, `ui-block`, `ui-flex`, `ui-hidden-{mobile,tablet,computer}`

`<space>` is `3xs 2xs xs s m l xl 2xl 3xl`;  `<size>` is `mini tiny small medium large big huge massive`.

## Themes

A theme is a sheet of token overrides in `@layer ui.theme`, loaded on the page after the foundation.
Tokens inherit into shadow roots, so components follow without adopting anything.

- `themes/classic.css`:  Lato, 14px, Fomantic's size ratios, original palette (as OKLCH), hand-picked text and
  background tints, emotive message colours, 4px radii, flat shadows.  Loads no font -- add Lato yourself.
- `themes/dark.css`:  `color-scheme: dark` on `:root`.  Every colour token is a `light-dark()` pair, so forcing
  the scheme IS the dark token set.  Tune one value with its `-on-dark` base.

Dark mode by default follows the OS (`color-scheme: light dark` on `:root`, in `ui.tokens` so a page's own
`color-scheme` wins).  A light-only page sets `:root { color-scheme: light }` or `class="ui-light"`.

## Build notes

- `@custom-media` (`media.css`) and the `@import`s in `utilities.css` / `native.css` / `ui.css` need Lightning CSS
  (Vite's `css.transformer: "lightningcss"` with `drafts.customMedia`).  Raw, those rules are dropped.
- `css.lightningcss.targets` MUST be modern browsers (the platform the plan assumes).  With Vite's default
  targets Lightning CSS lowers `light-dark()` into `--lightningcss-light` variables substituted at `:root`,
  which breaks `.ui-dark` subtrees, and adds hex / `lab()` fallbacks for every OKLCH literal.

## Converting a family (recipe)

Every family is converted (2026-09-30);  the recipe stays for a NEW family ported from Fomantic's `.variables`, or a
sheet the test catches declaring a public token.  References:  `button` (a plain family with a group), `card` (an
owner), `parts` (the header's own tokens, and the part side of owner tokens).

1. Dry run:  `yarn tokens:alias <family>` prints, per sheet, the notes to review and every OTHER file still naming
   one of the family's public tokens.  `--write` applies it (and runs oxfmt over the sheets).
   - Without the codemod:  `grep -nE -- '^\s*--ui-<tag>-[a-z0-9-]+\s*:' src/components/ui-<family>/*.css` finds the
     declarations (one grep per tag:  `button`, `buttons`, `or`);  `grep -rnE -- '--ui-<tag>-' src test site/src
     docs` finds the rest.
2. What the codemod does, per sheet:  the FIRST declaration of each public token becomes the alias
   (`--_ui-x: var(--ui-x, <value>)`), every later declaration (a variation) writes `--_ui-x`, and every
   `var(--ui-x` / `style(--ui-x` read in the family's sheets becomes `--_ui-x`.  Comments keep the public names.
3. Review every note it prints:
   - `variation writes --_ui-x`:  fine when the variation's class sits on the box that declares the alias.  On a
     GROUP box whose members must follow, see "Variations" (a separate `--_<family>-*` token in front of the alias).
   - `FIRST declaration ... is nested`:  the token has no base value (only `@media` / `@container` variants).  Add a
     base alias to the token block with the default its readers fall back to, so nested owners reset it.
   - `declares another family's token`:  an alias (a look token), a private switch, or an `EXCEPTIONS` entry.
   - Is it really a public token?  Internal plumbing named `--ui-<tag>-*` (like the button group's corner
     factors) becomes a private SWITCH instead:  rename it `--_ui-...` in every file that names it, no alias.
4. Reads OUTSIDE the declaring box:  the codemod rewrites every read in the family's sheets.  A rule whose box is
   neither a box of the token block's selector list nor inside one reads an unset alias -- give it
   `var(--_ui-x, var(--ui-x, <default>))`.  Watch sheets ADOPTED BY A PART (`<ui-item>` adopts `ui-menu.css` /
   `ui-list.css`):  the alias block must not match the part's own box, or the part re-declares the alias from the
   public token and drops the owner's variation.
5. The other files it lists:
   - `ui-parts.css`:  a look token your owner varies is read as the alias only, `var(--_ui-x, <default>)`;  add the
     owner's rule there, as `modal` does.
   - Another family's sheet reading your token:  the alias if it sits inside your box, else the dual read
     `var(--_ui-x, var(--ui-x, <default>))` (step 4).
   - Tests reading a value off the inner box (`getPropertyValue("--ui-x")`):  read `--_ui-x`, or better, assert
     the computed property it drives.
   - TS setting a public token INLINE on its own root (`style={{ "--ui-x": ... }}`) blocks the page exactly like a
     sheet:  set the private name.  Check `grep -rn -- '--ui-<tag>-' src/components/ui-<family>/*.ts*`.
   - `PART_OWNER_TOKENS` (`components.types.ts`):  a look token (`modalHeaderSize`, `statisticValueSize`) names
     the alias;  so does every switch an element sets inline (`PUSHER_TOKENS`, the anchor names).
   - Examples and docs:  public names stay (they're the API);  fix text that says "only through `::part()`" or
     "declared on the box".
6. The sheet's header comment:  add the "Public tokens ... are NEVER declared here" bullet (copy `ui-button.css`'s)
   and say "private alias" in the token block's comment.
7. Add `EXCEPTIONS` entries if any, each with why.
8. Tests, in `ui-<family>.test.tsx` (templates:  `ui-button.test.tsx` "tokens from outside", `ui-card.test.tsx`):
   - a public token set on the HOST, on an ANCESTOR, through `::part(<root part>)` and on `:root`
     (`document.documentElement.style`, removed with `onTestFinished`), each changing a COMPUTED property of the
     inner box
   - a group family:  one set on the group reaches its members
   - an owner:  one owner look token set on the owner reaches a part
   - variations:  one that swaps (wins over the base token) or derives (follows it)
   - static markup (`ui-<family>.css.test.ts`):  one set on a wrapper of class-grammar markup
9. Docs page (`site/src/content/components/ui-<family>.mdx`, Theming):  "set it on the element, any ancestor, or
   `::part()`", as `button.mdx`.  The `CssTokens` table reads the aliases on its own.
10. Look unchanged:  compare computed styles of every example before and after (the reference conversions did, for
    every property that paints);  run `yarn vitest run --project browser src/components/ui-<family> test/`.

Pitfalls met on the way:

- The group variation vs member re-declaration (step 3), and reads outside the declaring box (step 4).
- `var()` in a custom property resolves where it's DECLARED:  an alias whose default reads another alias must sit
  on the same box.  The token block is the natural place.
- A style query on an own token (`@container style(--ui-x: v)`) becomes `style(--_ui-x: v)`:  the queried element
  must be inside the declaring box.
- `!important` inside a value can't be wrapped in `var()`:  the codemod notes it, fix by hand.
- oxfmt reflows long aliases over three lines;  expected.
- A family whose ROOT has no part name (`dropdown`:  its root `<div>` carries no `part`) can't be themed through
  `::part(<root>)`:  its docs page says "on the element or any ancestor" only, and its tests skip the `::part()`
  case.  A `::part()` of an inner piece (`::part(menu)`) sits inside the alias box, so the aliases already resolved
  there:  it takes plain properties, not tokens.
- A screen-size breakpoint changes a private DEFAULT, never the alias:  `ui-modal.css` declares
  `--_ui-modal-width: var(--ui-modal-width, var(--_modal-width))` once and its `@media` rules set `--_modal-width`
  (the same for `search`'s result rows and `segment`'s scrolling height).  Writing the alias in a `@media` rule
  would beat a page's `--ui-modal-width` on that screen.
  - the exception is a token that IS one breakpoint's value:  `container`'s `scrolling` height has
    `--ui-container-scrolling-height` (mobile) and `-tablet`, `-computer`, `-widescreen`, each with its own
    private alias, which the matching `@media` rule copies into the working alias.  The docs table shows such a default through
  `CssTokens`' `defaults` prop.
