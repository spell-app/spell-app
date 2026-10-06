# Native fallbacks

What a host shows when its real render throws (plan-shared-runtime.md, 3a).  Library-neutral:  plain DOM,
no Solid, so it renders whatever broke the Solid render (the Lit spike rendered the same thing).

## API

```ts
// src/elements/NativeFallback.ts
static render({ host, root, error?, internals? }): NativeFallbackHandle
// handle: { dispose(): void, degraded: readonly string[] }
```

- One `NativeFallbackProps` object, the constructor's too:  `new ButtonFallback({ host, root, error, internals })`.
- A class serving several tags sets `@proto static vocabularies` (the first the default);  the base picks the
  host tag's into `vocabulary`, so no subclass needs a constructor for it.

- `root.replaceChildren(...)`:  the component's adopted sheets stay, so the same `ui-*` classes and `part`s
  style the fallback.
- With `internals`, adds custom state `errored` (page styling).
- Form-associated hosts (`static formAssociated`) get real form behaviour through `internals`.
- Classes: `ButtonFallback`, `DropdownFallback`, `IconFallback`, `LabelFallback`, `SegmentFallback`,
  `ContainerFallback`, `DividerFallback`, `TextFallback`, `FlagFallback`, `LoaderFallback`, `MessageFallback`
  (each in `src/components/ui-<name>/ui-<name>.fallback.ts`), and one per family keyed by the host's tag:
  `ContentPartFallback` (`ui-parts.fallback.ts`), `GridFallback`, `ImageFallback`, `PlaceholderFallback`,
  `BreadcrumbFallback`, `InputFallback` (input + textarea), `CheckboxFallback` (checkbox + radio), `FormFallback`
  (form, field, fields), `ItemFallback`, `ListFallback`, `MenuFallback`, `TableFallback`, `PopupFallback`,
  `ModalFallback`, `CardFallback` (card + cards), `SelectFallback`, `SearchFallback`, `ItemsFallback`, `FeedFallback` (feed + event),
  `CommentFallback` (comments + comment), `StatisticFallback`, `StepFallback` (steps + step), `RailFallback`,
  `RevealFallback`, `AdFallback`, `EmojiFallback`, `ToastFallback`, `NagFallback`, `StickyFallback`,
  `VisibilityFallback`, `EmbedFallback`, `TransitionFallback`, `DimmerFallback`, `FlyoutFallback` (extends
  `ModalFallback`), `SidebarFallback` (sidebar + pushable + pusher), `ShapeFallback` (shape + side),
  `CalendarFallback`.
- Reads canonical English attribute names (a translated host maps them back first);  booleans go through
  `Converters` (`disabled="no"` is false).

## What each keeps and what degrades

| Family    | Keeps                                                                                       | Degrades                                                                                                                                        |
| --------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| button    | `<button>` / `<a href>`, class grammar, `part`, `aria-*`, disabled, submit / reset with `name=value`, toggle `aria-pressed` + `active` | `ui-toggle` event, icon glyph and icon / label slots, joined `label`, `animated`, spinner;  a host `click` handler cannot `preventDefault()` submit |
| dropdown  | native `<select>` (`multiple`, placeholder option, optgroups), options from property and `<ui-item>`s, form value (`FormData` for multiple), validity, `host.value`, `ui-change` | search, `allow-additions`, `clearable`, `max-selections`, multiple-value labels, option icon / image / description, combobox keyboard pattern (native select's instead), `ui-open` / `-close` / `-search` / `-add` / `-remove`;  `readonly` becomes a disabled select |
| icon      | box, size / colour classes, `label` as `role=img` + hidden text, else `aria-hidden`         | the glyph (needs the icon data)                                                                                                                 |
| label     | `<span>` / `<a href>`, classes, `part`, slot, `detail`                                      | `removable` delete button and `ui-remove`, icon, image                                                                                          |
| segment, container | root `div`, classes, `part`, slot, `aria-busy` for `loading`                       | segment's inverted owner tokens (CSS side, none needed here)                                                                                    |
| divider   | `role=separator` (`none` when `hidden`), `aria-orientation`, classes, slot                  | `icon` shorthand                                                                                                                                |
| parts     | `div.<noun>`, standalone header as `<h1-6>` / `<a>`, owned header as `role=heading`        | `:state(in-<owner>)` styling (owned or not comes from the owner registry, `PartContext.ownerFor()`)                                             |
| grid      | grid / row / column `div`s, classes (widths included), `part`, slot:  `ui-grid.css` lays them out unchanged | --                                                                                                                                  |
| image     | `<img>` (`src`, `alt`, `width`, `height`, `loading`) or `<a href>` around it, classes, `part`;  `<ui-images>` group | --                                                                                                                          |
| text      | `<span>`, classes, `part`, slot                                                             | --                                                                                                                                              |
| flag      | emoji, `role=img` + `aria-label` (`Intl.DisplayNames` in the page language)                 | translated names of the non-country flags (English)                                                                                             |
| loader    | `role=status` + `aria-live=polite` on the root, `Loading…` name while empty, classes, slot  | translated name (English);  the name ignores later slot changes                                                                                 |
| placeholder | every shape's `div`, classes, `part`;  host `aria-hidden` + `:state(placeholder)`         | --                                                                                                                                              |
| message   | root, content block, `header` shorthand, slotted-icon box, close button with `ui-dismiss` + `hidden` | `icon` glyph, close glyph (`×`), translated `dismiss` label (English)                                                                  |
| breadcrumb | labelled `<nav>` + `<ol>`, text `divider` token, sections' divider + `<a>` / `aria-current` span, `role=listitem` | `divider-icon` (the text divider shows), translated `label` (English)                                                         |
| input     | `div.ui.input` + native `<input>` / `<textarea>` with the constraints, `label` shorthand as a joined label, form value + native validity, `host.value`, `ui-input` / `ui-change` | icon glyph and `icon` / `label` / `action` slots, corner labels, `rules`, `:state(invalid)`, value reset, Enter submission, `<label for>` names |
| checkbox  | `div.ui.checkbox` + native checkbox / radio + `<label for>` around the slot, `role=switch` toggles, form value + validity, `host.selected`, `ui-change`, `readonly` | radio grouping across elements and arrow keys, vetoing `ui-change`, `:state(invalid)`, state reset, `<label for>` names |
| form      | form / field / fields `div`s with classes, `part`, slot, `inert` when disabled;  the native `<form>` inside submits natively | validation (`rules`, prompts, events), `values` / `validate()` / `reset()` / `clear()`, `prevent-leaving` |
| item      | a bare `<slot>` unowned (a dropdown option);  in a `<ui-list>` / `<ui-menu>` / `<ui-items>` parent:  `<a class="... item" href>` (`aria-current="page"` when selected) or `<div class="... item">`, `part`, slot, `role=listitem` host in a list | owner context through translated or slotted owners, `icon` / `image` shorthands, `link` / interactive `<button>`s, `menuitem` roles |
| list      | `<ul>` / `<ol>` (`ordered`) with `role=list`, class grammar, `part`, slot;  the sub-list form (`class="list"`) inside a `<ui-item>` / `<ui-list>` parent, an `<ol>` under an ordered list;  items via `ItemFallback` | `ui-select`;  sub-lists behind translated or slotted parents;  numbering / bullets still come from `ui-list.css` |
| menu      | `<nav class="ui ... menu" part="menu" aria-label>` around the slot;  a sub-menu `<div class="[position] menu">` inside a `<ui-menu>` / `<ui-item>` parent | `interactive` (a `<nav>`, no menubar roles or roving focus), `ui-select`, sub-menus behind translated or slotted parents |
| table     | `div.scroller` part around the slot (a focusable, named `role=region` while `scrolling` / `overflowing`), class grammar mirrored onto the slotted `<table>` (author classes kept, re-applied on `className` rewrites) | sorting (`ui-sort`, `aria-sort`, focusable headers, `client-sort`), data mode (`rows` / `columnDefs`:  nothing renders without a slotted `<table>`), translated `label` (English), later attribute changes (read once) |
| popup     | the box in the class grammar (shorthands, slot) in a host that stays closed;  a tooltip-like popup's text as the target's native `title` (when it has none) | showing it at all:  popover, positioning, triggers, `ui-open` / `ui-close`, Escape;  click popups show nothing |
| modal     | native `<dialog>` in the class grammar (shorthands, slot, close button) shown with `showModal()` while the host has `open`:  focus trap, dimmer, Escape;  approve / deny still fire the cancelable `ui-approve` / `ui-deny`;  `ui-hide` | `ui-open` / `ui-close` (no veto), `ui-show`, invoker commands, `closedby`, page scroll lock and the overlay stack, transitions, the close glyph (`×`), translated `close` label, a slotted header naming it |
| transition | the box in the class grammar around the slot, hidden without `visible`;  follows `visible` at once, still firing `ui-show` / `ui-hide` / `ui-complete` | every animation, the queue, `interrupt` / `allow-repeats` / `duration`;  the host's `show()` / `hide()` / `toggle()` / `transition()` resolve `false` |
| dimmer    | `div.ui.dimmer` (or, for `page`, a native `<dialog>` shown with `showModal()`:  it still covers, blocks and traps) with the content box, following `active`;  a page dimmer's Escape drops `active` with `ui-hide` | `on` (hover / click), clicks on it, `closedby`, invoker commands, `ui-open` / `ui-close` / `ui-show`, scroll lock, the fade, the parent's positioning (a page sheet), translated `dimmedPage` name |
| flyout    | `ModalFallback`'s native `<dialog>` with the flyout's classes (`ui left visible flyout`, a word `width` after the noun) and `part="flyout"` | as the modal's, plus the slide |
| sidebar   | a sidebar's labelled `<aside>` in the class grammar following `visible` (it slides over, like `overlay`);  the pushable's and pusher's boxes around their slots | moving / dimming / `inert` on the pusher, the `transition` default by side, modality (focus move, trap, Escape, outside click, focus restore), events, invoker commands, translated `sidebar` name |
| shape     | the stage and the sides box (a polite live region) around the slot;  a side's face around its slot (a working shape still shows / hides it) | a failed shape shows every side, stacked;  flips, `ui-change`, `flip()` / `next()` / `previous()`, invoker commands |
| card      | `<article>` (`<a href>` with `href`, dropped when `disabled`) in the class grammar, the shorthands as static parts around the slot;  a group's `role=list` root, its cards `role=listitem` | the group's variations on its cards and `:state(in-cards)` spacing, groups through translated or slotted parents, shorthands yielding to slotted parts, `aria-busy` and the loading announcement |
| items     | `div.ui.items` with `role=list`, class grammar, `part`, slot;  items via `ItemFallback` (`role=listitem` `div.item` / `a.item`) | the size container (no stacking), items owning their parts (`:state(in-item)`), the `image` shorthand |
| feed      | `<ul>` / `<ol>` (`ordered`) with `role=list`, class grammar, `part`, slot;  an event's `div.event` with its label box (the `image`, a `label` text, the `label` slot, the ordered number), `aria-disabled`, `role=listitem` hosts | the `icon` shorthand's glyph, feeds through translated or slotted parents, the parts' feed context |
| comment   | the list `div` / a thread's `div.comments` (inside a `<ui-comment>` parent) / a comment's `<article>`, class grammar, `part`, slot, the `reply` box, `aria-disabled` | threads through translated or slotted parents, the parts' comment context |
| statistic | `div.ui.statistic` in the class grammar, the `value` / `label` shorthands as static parts around the slot | spacing after another statistic (`:state(statistic)`);  a group keeps its members through its default slot, without the group look |
| step      | the group's `<ol role=list>`;  a step's `<div>` / `<a href>` in the class grammar, `aria-current="step"` (`selected` or `active`), `aria-disabled`, the shorthand content, a hidden "Completed" | the `icon` glyph and the completed check (an ordered step's CSS check stays), `link` steps without `href` (a box), translated "Completed" (English) |
| rail      | `div.ui.rail` in the class grammar around the slot:  positioned as the element | -- |
| reveal    | `div.ui.reveal` with the visible / hidden content boxes around their slots, a tab stop unless `disabled`:  `ui-reveal.css` still reveals on hover, focus and `active` | skipping the tab stop when the content is focusable, the `aria-label` forwarding |
| ad        | `div.ui.ad` in the class grammar, `test` class + `data-text`, slot | the translated default test text (English) |
| emoji     | `span.ui.emoji` with the glyph (cached, or once `EmojiData` has loaded it), `role=img` + `aria-label` for `label`, `aria-hidden` for a bare `label` | later `name` / `label` changes (read once) |
| select    | the same native `<select>` in the class grammar (options, `<optgroup>`s, `<hr>` dividers, the placeholder option, `multiple`), flags and descriptions as option text, form value (`FormData` for multiple) + `required` validity, `host.value`, `ui-change` | the customizable picker and option icons / images, host `<label for>` naming, `:state(invalid)` / `:state(customizable)`, vetoing a change |
| search    | `div.ui.search` > `div.ui.icon.input` > a native `type=search` `input.prompt` with a `<datalist>` of the local `source` titles, form value + `required` validity, `host.value`, `ui-change` | remote `url` results, descriptions / images / prices / categories, Fomantic's matching, `ui-search` / `ui-select` / `ui-results` / `ui-open` / `ui-close`, following a `url`, the icon and spinner |
| toast     | box + toast in the class grammar with `role=status` / `alert`, `header` / `message` shorthands, slot, `actions` slot, close button (`hidden` + `ui-hide`), a numeric `display-time` | animations, `ui-show`, cancelable `ui-close`, `ui-approve` / `ui-deny`, pausing, progress bar, `auto` time, `close-on-click`, Escape, action layouts, glyphs (`×`), translated label |
| nag       | the bar in the class grammar around the slot, close button (`hidden` + `ui-hide`)          | remembering the dismissal (`key` / `storage`), `display-time`, animations, `ui-show`, cancelable `ui-close`, glyph (`×`), translated label |
| sticky    | the sticky box with its offsets inline:  it still sticks (CSS)                               | `:state(stuck)` / `:state(bound)`, `ui-stick` / `ui-unstick` |
| visibility | `ui visibility` box around the slot;  `type="image"` images get their `src` at once, natively `loading="lazy"` | every event, `:state(visible)`, the fade and `ui-load` |
| embed     | box in the class grammar with a named play button that swaps itself for the (http(s)-only) frame on click | `ui-activate` / `ui-reset`, `activate()` / `reset()`, the `active` property, focus into the frame, glyph, translated names, `parameters` property |
| calendar  | `div.ui.calendar` + `div.ui.input` around the browser's own `<input type=date\|time\|datetime-local\|month>` (a `number` for `year`) holding the same ISO value, `min` / `max` / `required`, form value + native validity, `host.value`, `ui-change` | the grid and its keyboard pattern (the native picker's instead), `inline`, `today`, `locale`, `first-day-of-week`, disabled dates / weekdays, ranges, vetoing `ui-change`, `ui-open` / `ui-close`, form reset of the value |

Everywhere:  `aria-labelledby` / `aria-describedby` idrefs dangle (they can't cross the shadow boundary),
properties other than dropdown `value` / `options` are not read (only reflected attributes).

## Bytes

esbuild, minify, `target es2022`, gzip level 9.  "Net" excludes the lowered-decorator helpers (about 2046 min /
1188 gzip, shared once per bundle) and shared code (`$/ui/util`, `$/ui/vocabulary`, `ClassBuilder`, the family's
vocabulary), which the real element already ships.

| Piece                       | min (B) | gzip (B) | net gzip (B) |
| --------------------------- | ------: | -------: | -----------: |
| `NativeFallback` (base)     |    3976 |     1990 |          802 |
| button                      |    3553 |     1863 |          675 |
| dropdown                    |    4845 |     2434 |         1246 |
| icon                        |    2652 |     1510 |          322 |
| label                       |    2685 |     1492 |          304 |
| parts (all 13)              |    2885 |     1587 |          399 |
| divider                     |    2492 |     1414 |          226 |
| segment                     |    2429 |     1383 |          195 |
| container                   |    2365 |     1342 |          154 |

All eight families together:  about 3.5 kB net gzip plus the base (0.8 kB).  Bundled standalone with everything
it needs (base, `ClassBuilder`, `$/ui/util`, vocabulary), button is 6.7 kB gzip and dropdown 8.3 kB.
