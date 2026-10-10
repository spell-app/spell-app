# The `UI` runtime (`src/runtime/`)

One shared runtime per page coordinates everything components can't do alone:
- keyboard shortcuts, the overlay stack, focus
- stylesheets, animations
- strings, ids
- toasts / modals, and fetch

## Loading

```ts
import { UI } from "$/ui/runtime"

class UIThing extends HTMLElement {
  async connectedCallback() {
    await UI.load() // first caller imports the runtime chunk; everyone else awaits the same promise
    UI.styles.adoptInto(this.shadowRoot!, ["thing"])
  }
}
```

- [`load.ts`](../src/runtime/load.ts) is the only eager code:  `load()` (exported as `loadUI`), and the `UI` accessor.
  - Everything else sits behind `import("./UIRuntime")`, so Vite puts the runtime in its own chunk.
  - A scratch build of the barrel gives about 0.3 KB for the entry, 1 KB gzip for `load`,
    and one `UIRuntime-*.js` chunk.
- `UI` is a `Proxy` onto the page's instance:
  - `UI.load()` works at any time
  - any other property throws until the runtime has loaded, so a missing `await` fails loudly
- The instance lives at `globalThis[Symbol.for("@spell-app/ui:runtime")]`.
  - `UIRuntime.instance` reuses it, so two copies of the package on one page share one runtime.
  - In dev, a version mismatch prints a warning:
    each bundle's version is `package.json`'s, inlined when it's built (`RUNTIME_VERSION`).
- The barrel exports service classes as **types only**.
  - Exporting them as values would undo the code split.
  - Reach services through the instance, e.g. `UI.keyboard.chord("Mod+K")` or `UI.focus.roving(...)`.
  - Tests import leaf files directly.
- `UI.ready` currently resolves as soon as the runtime is constructed.
  - Construction registers the foundation sheets (`$/ui/styles`, by name) with `UI.styles`.
  - And it makes the `Vocabulary` registry (`UI.vocabulary`).
  - `$/ui/styles` and `$/ui/vocabulary` stay plain data.

## `<ui-root>`:  loading and settings for a subtree

- [The root's family](../src/components/ui-root/) (`@spell-app/ui/ui-root`):  a page imports the root only.
  - Every `ui-*` tag inside loads its family on demand, once per page.
  - `RootLoader` does it, with a literal `import.meta.glob` per family.
  - Tag => family comes from `UIRoot.catalog.ts`, GENERATED from the vocabularies (`yarn gen:root`).
    - [Its test](../src/components/ui-root/UIRoot.catalog.test.ts) fails while it's stale.
    - Never from `ComponentDefinitions`, which would put every vocabulary in the root's chunk.
- Ready:  its families settled, then every element inside `ready` (an inner root:  its `settled`).
  - Or the `timeout` (5s).
  - Then `:state(ready)`, and `ui-ready { failed }`.
  - A cancelable `ui-error` per failure, before it.
- `display`:
  - `skeleton`, the default:  `<ui-placeholder>`s from each tag's vocabulary `skeleton`,
    drawn in the root's shadow by `UIRoot.Skeleton`
  - `when-ready`, `immediately`
  - `loading="..."` shows `UIRoot.Loading` (a `<ui-loader>`).
  - The root renders at once, unstyled (`UIComponent`'s `elementSetup.canRenderUnstyled`):
    the slot is hidden by an inline style before any sheet loads.
- Settings for everything inside, through [`RootSettings`](../src/elements/RootSettings.ts) (in `core`):
  - `icons="fa7-free, /packs/lucide/pack.js"`:  a child icon set, over the outer root's (or the page's).
    - It's `UI.icons.scope(packs, { assets, parent })`.
    - `parent` is a function, so it follows the outer root's current packs.
    - One SVG cache per page.
    - `IconGlyph.packsFor(element, UI.icons)` is the set an element draws from.
  - `emoji="fomantic"`:  `EmojiData.setFor(element)`.  Each set keeps its own loaded names.
  - `RootSettings.generation` changes on any root's change.
    - `IconGlyph` and `<ui-emoji>` track it (and their `isConnected`), and redraw.
- Pages without a root:  these set the PAGE's packs and names.
  - `UI.icons.use()` / `reset()`
  - `EmojiData.use()`

## Introspection

- Every element class carries its whole vocabulary, live:  `UIButton.describe()` (~== `UIButton.prototype.vocabulary`).
  - tag, attributes (kinds, allowed values, defaults), events, slots, parts, states, texts, descriptions
  - `topics`, `aka`
  - It's the same object the element reads, so it can't drift.
- Every tag at once:  [`ComponentDefinitions`](../src/components/ComponentDefinitions.ts).
  - Per tag:  `{ tag, folder, name, topics, aka, description }`.
  - From the vocabulary modules:  no element is defined by reading it.
  - `byTag()`, `byTopic()`, `byFolder()`.
  - Not in `core`.
  - A tag's `skeleton` (what `<ui-root>` draws for it) is in its vocabulary too.

## Services

| Field | Class | What it does |
|---|---|---|
| `UI.browser` | `Browser` | `supports.*` feature flags, detected once and all `false` under SSR. `isChromium` / `isFirefox` / `isSafari` / `isIOS` / `isApple` / `isTouch`. Live `isReducedMotion` and `isDark` (the `prefers-reduced-motion` / `prefers-color-scheme` media queries). `Browser.isApplePlatform()` for code that runs before the runtime (`Chord`). Call sites branch on `supports`, NEVER on the user agent. |
| `UI.keyboard` | `Keyboard` + `Chord` | Shortcut registry: `register({ chord: "Mod+Shift+K", handler, scope, target, global, inEditable, preventDefault, stopPropagation })` (`scope` defaults to `"page"`) returns a disposer. Scopes form a stack (`pushScope` / `popScope`); only the topmost scope fires, plus `global` registrations. One capture `keydown` listener. Keys typed into editable fields are ignored unless the chord has Ctrl / Meta / Alt or the registration sets `inEditable`. Dev builds warn on conflicts. |
| `UI.overlays` | `Overlays` | Top-layer stack: `open(entry)` / `close(entry)` / `topmost(kind?)` / `closeAll(pool?)` / `isOpen`. Routes Escape (or a `CloseWatcher` close request) to the topmost entry and outside clicks to the topmost entry of each pool, using the `pointerdown`-origin rule and composed paths. Also handles scroll lock (reference counted) and focus restore. It only calls `entry.onDismiss(reason)`; the component decides what happens and then calls `close()`. |
| `UI.focus` | `Focus` + `RovingTabindex` | `activeElementDeep(root?)` (`undefined` when only `<body>` has focus), `focusables(root)` (flat tree: shadow roots and slots; skips `inert`, `hidden`, unrendered, `:disabled` and `tabindex=-1`), `first` / `last`, `containsDeep`, `moveOutOf(container)` (focus inside moves on to the next tabbable after it, else blurs:  an element becoming `disabled` / `loading`), `trap(root)` (only for non-`<dialog>` cases), and `roving({ container, items, orientation, wrap, activeIndex, onChange })`. |
| `UI.styles` | `Styles` + `AppStylesheet` | Named constructable sheets: `register(name, css, { page, linked })`, `sheet(name)`, `setFoundation(names)`, `setUtilities(names)`, `adoptInto(shadowRoot, names)`, `appSheetReady`. `page` also puts a sheet on the document; `linked` marks one `ui.css` already carries (the foundation, typography, native), left off a page that links `ui.css`. Component page sheets (`table`, `scroll-lock`) always go on. |
| `UI.themes` | `Themes` | The theme sheets (`src/styles/themes/*.css`), each a lazy chunk:  `apply(name)` registers `classic` + the theme with `UI.styles`, on the page and in every shadow root (`undefined`:  our own look;  the last call wins);  `names` (the Fomantic themes), `own` (`spell`, `spell-brand`), `sheets`, `base`, `slots`, `current`, `load(name)`, `has(name)`.  See `theming.md`, "Applying a theme". |
| `UI.transitions` | `Transitions` | `animate({ element, name, direction: "in" \| "out" \| "static", duration, easing })` resolves `true` when the animation ends and `false` when interrupted. `whenTransitionEnds(el)`. |
| `UI.i18n` | `I18n` | `locale`, `register(locale, pack, scope?)`, `registerDefaults(pack, scope)` (a component's English source texts), `t(key, params, scope?)` (lookup order: `pt-BR`, then `pt`, then `en` -- each the `scope`'s string, then the shared one -- then the scope's English default, the shared default, the key itself;  `scope` is a component's canonical tag, so two families may share a key), `formatDate`, `formatNumber`, `weekdays()`, `months()`, `firstDayOfWeek()` (the date helpers take an optional `locale`, e.g. an element's own), `displayName()`.  Temporal:  `temporal` (the namespace if it's here now) and `loadTemporal()` -- see "Temporal" below. |
| `UI.ids` | `Ids` | `next(prefix)` and `ensure(el, prefix)` for ARIA id wiring. |
| `UI.toasts` / `UI.toast()` | `Toasts` | `show(options)` / `dismiss(id)` delegate to the provider `ui-toast`'s barrel registers with `register(provider)` (`ToastStack`:  a `<ui-toast>` per call, in a popover container per position). `ToastOptions` are Fomantic's settings (`title`, `message`, `class` / `type`, `displayTime`, `showIcon`, `showProgress`, `actions`, `classActions`, `position` ...);  the handle carries `id`, `closed` and the `element`. Throws until registered. |
| `UI.modals` | `Modals` | `confirm` / `alert` / `prompt` delegate to the provider `ui-modal`'s barrel registers with `register(provider)` (`ModalDialogs`:  a `<ui-modal>` per call):  `confirm` resolves `true` / `false`, `alert` nothing, `prompt` the text or `undefined` on Cancel / Escape. Throws until then. |
| `UI.visibility` / `UI.observeVisibility()` | `Visibility` | Fomantic's visibility callbacks on `IntersectionObserver`:  `observe(el, { onOnScreen, onTopVisible, onBottomPassed ..., once, continuous, offset, context })` returns the undo;  checks run at crossings (in / out, an edge crossing the screen top or bottom), not per scrolled pixel. `lazyImage(img, { transition, duration, onLoad })` sets `data-src` / `data-srcset` once on screen, then fades in. |
| `UI.icons` | `IconPacks` | Icon packs and the page's SVG cache (`docs/icons.md`):  `use(source, { prefix, base, only })`, `reset()`, `remove(id)`, `resolve` / `peek` / `get(name)`, `register(name, svg)`;  `scope(packs, { assets, parent })` makes a `<ui-root icons>`'s child set. |
| `UI.api` | `Api` | `url(template, data)` and `request({ url, urlData, method, data, throttle, key, signal, timeout, headers, responseType })`;  a non-2xx answer rejects with `ApiError` (`status`, `response`, from its `cause`). |
| `UI.sources` | `Sources` | Same-origin text files the source elements (`<ui-include>`, `<ui-code>`, `<ui-markdown>`) show and save:  `load(source, { fresh, signal })` (cached per URL, `ETag` kept), `resolve(source)` (refuses another origin / `file://`), `save({ url, text, etag, fragment })` through `saver`, the page's `SourceSaver` (none by default), `forget(source?)`.  Failures are `SourceError`s:  `kind` and `status` read from their `cause` (`{ kind, status, error }`). |


## Temporal

```ts
const Temporal = await UI.i18n.loadTemporal() // the browser's own, or temporal-polyfill's
Temporal.PlainDate.from("2026-09-30").add({ months: 1 })
UI.i18n.temporal // the same namespace, synchronously, once loaded (undefined before)
```

- `UI.browser.supports.temporal` says whether the browser has `Temporal`.
  - When it does, `temporal` is `globalThis.Temporal` at once, and nothing loads.
- Otherwise, the first `loadTemporal()` does a dynamic `import("temporal-polyfill")`.
  - The ponyfill entry:  ISO and Gregorian calendars.
  - A LAZY chunk, so neither `core` nor the runtime chunk carries it.
  - Every caller shares the one import.
  - The polyfill is kept in `I18n`, never installed on `globalThis`.
- `<ui-calendar>` is the user:  it renders its picker once `Temporal` is here.

## Overlay entries

```ts
const entry: OverlayEntry = {
  element: this,
  kind: "popover",
  anchor: triggerButton,
  onDismiss: (reason) => this.requestClose(reason)
}
UI.overlays.open(entry) // on show
UI.overlays.close(entry) // on hide, whatever caused it
```

Defaults depend on `kind`:

| Option | Default |
|---|---|
| `pool` | `"toast"` for toasts, `"default"` for everything else |
| `closeOnEscape` | `true` for every kind except `toast` |
| `closeOnOutsideClick` | `true` for every kind except `toast` |
| `modal` (scroll lock) | `true` for `modal`, `flyout` and `dimmer`;  `false` for `sidebar` (Fomantic's `scrollLock: false`) |


- Every entry that handles Escape or is modal pushes a keyboard scope, so page shortcuts go quiet while it's open.
- A click on a modal `<dialog>`'s `::backdrop` counts as outside.
  - The pointer position is compared with the dialog's box, because a backdrop click targets the dialog element itself.
- `<ui-modal>` sets `closeOnOutsideClick: false` when the browser does light dismiss itself.
  - That's `<dialog closedby>`:  `UI.browser.supports.dialogClosedBy`.
  - It routes the dialog's `cancel` through its own `ui-close`.
  - Escape always goes through `Overlays`.
- Invoker commands (`<button commandfor command>`):  `UI.browser.supports.invokers` says whether the browser does them.
  - It tests `"commandForElement" in HTMLButtonElement.prototype`.
  - When it does, `<ui-button>` forwards `commandfor` / `command` to its inner `<button>`.
    It sets `commandForElement`, since the shadow button can't see a light-DOM id.
  - Else it runs the command itself on click (`Invoker`), and dispatches the `command` event:
    - on a `<dialog>`:  `show-modal` / `close` / `request-close`
    - on a popover:  `show-popover` / `hide-popover` / `toggle-popover`
  - `<ui-modal>` / `<ui-flyout>`, `<ui-sidebar>` and `<ui-dimmer>` answer the `command` event's `--show` / `--close` / `--toggle`.
- `<ui-popup>` and the dropdown menu are `popover` entries, with their target as `anchor`,
  so a click on the target never dismisses-then-reopens.
- The other kinds:
  - `<ui-flyout>` shares `<ui-modal>`'s component base (`DialogComponent`), with kind `flyout`.
  - A page `<ui-dimmer>` is kind `dimmer`.
    Outside clicks are its own:  the dimmer covers the viewport.
  - A modal `<ui-sidebar>` is kind `sidebar`:  a non-modal `<dialog>` in its pushable.
    So it adds `UI.focus.trap()` itself, and its pushable makes the pusher `inert`.
- Scroll lock adds `ui-scroll-locked` to `<html>`, and sets `--ui-scrollbar-width`.
  - `Overlays` registers the matching rule as the page sheet `scroll-lock`, in `@layer ui.base`.

## Animation protocol

- JS sets `data-ui-animation="<name> <direction>"`, e.g. `"fade-up in"`.
  - `animations.css` owns the keyframes, and matches the attribute.
- The `duration` and `easing` options become `--ui-animation-duration` / `--ui-animation-easing` on the element.
  - So the CSS should read them:  `animation-duration: var(--ui-animation-duration, …)`.
- `AnimationNames` (in [the runtime's types](../src/runtime/runtime.types.ts)) is the catalogue.
  - Fomantic's multi-word names are kebab-cased:  `"horizontal flip"` becomes `flip-horizontal`.
  - Plain `fly` is in it too.
  - `<ui-transition>` maps Fomantic's spelling onto it:  plain `slide` / `swing` run `slide-down` / `swing-down`.
- The protocol's reset rule is `:where(.ui.transition, [data-ui-animation])`:  zero specificity.
  - So an element that is BOTH (`<ui-transition>`'s box) still takes the `[data-ui-animation="..."]` keyframes.
- The directions:
  - `in` removes `hidden` first.
  - `out` sets `hidden` when it finishes,
    plus an inline `display: none` if the element's CSS overrides `[hidden]`.
  - `static` leaves visibility alone.
- Reduced motion, or no matching keyframes, resolves at once.
  - A fail-safe timeout (the computed duration + `failSafeDelay`) catches a missing `animationend`.

## The `#ui-app-stylesheet` contract

Page CSS can't reach into shadow roots.
Instead of per-component wiring, the app marks **one** stylesheet:

```html
<link rel="stylesheet" id="ui-app-stylesheet" href="/css/app.css" />
<!-- or -->
<style id="ui-app-stylesheet">
  @import url("./brand.css") layer(ui.app);
  ui-button::part(button) { letter-spacing: 0.02em; }
  .ui.primary.button { --ui-color: var(--ui-violet); }
</style>
```

- `Styles` mirrors it into ONE shared constructable sheet,
  and appends it **last** in every component's `adoptedStyleSheets`.
  - The order:  foundation, component, any foreign sheets, utilities, app sheet.
  - Inside shadow roots, its rules can use Fomantic's class grammar on the semantic shadow markup.
- How each source is read:
  - `<style>`:  its text
  - a same-origin `<link>`:  its `cssRules`, once `load` has fired
  - a cross-origin `<link>`, where reading `cssRules` throws:  the `href` is fetched, and its text used
- The sheet stays in sync:  changes are debounced by 30 ms, and `appSheetReady` resolves once the sheet is current.
  A `MutationObserver` watches:
  - the `<style>`'s text
  - the `<link>`'s `href`, `media` and `disabled`
  - the child lists of `<head>` and `<body>`, to catch late insertion, removal or replacement
- `@import`:  constructable sheets ignore `@import`, so imports are inlined.
  - a `<link>` read through CSSOM is inlined at every depth, from each `CSSImportRule.styleSheet`
  - `<style>` text and fetched text are inlined **one level deep**, fetched relative to the importing sheet
  - an `@import` inside an imported file is dropped, with a console warning
  - `layer()`, `supports()` and media conditions become wrapping `@layer`, `@supports` and `@media` blocks
  - relative `url()`s in inlined files are made absolute, since the combined sheet has a single base URL:
    the `<link>`'s `href`, or the document for a `<style>`
- Limitations:
  - an element that gains the id later, through `setAttribute("id", …)`, is not noticed.
    Insert a new element instead.
  - a cross-origin `@import` inside a same-origin `<link>` can't be read.
    Use a `<style>` with `@import` instead:  that gets fetched.
  - its rules are not wrapped in a layer.
    - Unlayered rules beat every `ui.*` layer, which is usually what an app override wants.
    - Wrap them in `@layer ui.app { … }` to take part in the layer order instead.
