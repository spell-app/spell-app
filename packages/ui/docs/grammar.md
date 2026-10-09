# Class grammar

How a component's attributes become Fomantic's class string inside its shadow root.
Implemented by `ClassBuilder` (`src/elements/ClassBuilder.ts`), driven by the component's vocabulary
(`UI<Name>.en.ts`, schema in `src/vocabulary/vocabulary.types.ts`).

## Why keep the grammar

- Shadow markup keeps Fomantic's classes on semantic elements: `<button class="ui small primary button">`.
- The CSS is then a mechanical port of the `.less`, and the app stylesheet / `::part` override language
  is the vocabulary people already know.
- Fomantic matches multi-word phrases with substring selectors (`[class*="four wide"]`,
  `[class*="left floated"]`), so words must come out in a fixed order.  Attributes are therefore
  enumerated per kind, never free text.
- Class words are ALWAYS canonical English.  Translated attribute names and values are mapped back to
  canonical before they reach `ClassBuilder` (see `translation.md`).

## Shape

```
ui  <size>  <color>  <keyOnly...>  <valueAndKey / keyOrValueAndKey...>  <multiple...>  <width...>  <textAlign>  <verticalAlign>  <extra>  <noun>
```

- `ui` -- always, unless the vocabulary says `ui: false` (context-only parts such as `column`).
- size, then color -- value only.
- keyOnly -- ALPHABETICAL by canonical attribute name, so output doesn't depend on vocabulary order.
- valueAndKey and keyOrValueAndKey -- in VOCABULARY order (interleaved, as declared).
- multiple, width, textAlign, verticalAlign -- in vocabulary order within each kind.
- `extra` -- the element's own classes, following its state, e.g. `active`, or `icon` on a button showing only an icon.
  Just before the noun, as Fomantic's markup writes them:  `ui primary icon button`.
- noun -- the vocabulary's `noun` (`button`, `card`, `column`), always last.

Example, all at once:

```html
<ui-widget size="large" color="blue" basic fluid pointing="left" floated="right"
           only="mobile" width="8" text-align="center" vertical-align="top">
```

=> `ui large blue basic fluid left pointing right floated mobile only eight wide center aligned top aligned widget`

## Attribute kinds

Semantics are copied from SUI React's `classNameBuilders.js`.  The CSS word ("key") defaults to the attribute
name with `-` replaced by a space (`very-basic` => `very basic`);  a vocabulary can set `key` explicitly.

| Kind | SUI React | Attribute | Class |
|---|---|---|---|
| `size` | value only | `size="small"` | `small` |
| | | `size="medium"` | _(nothing -- default size)_ |
| `color` | value only | `color="red"` | `red` |
| `valueOnly` | value only (where colours go) | `type="warning"` | `warning` |
| `icon` | -- | `icon="user"` / bare, `true`, `yes` (the default icon) / `false`, `no` (none) | _(no class;  a glyph name)_ |
| `keyOnly` | `useKeyOnly` -- `val && key` | `basic` | `basic` |
| | | `very-basic` | `very basic` |
| `valueAndKey` | `useValueAndKey` -- `val && val !== true && "val key"` | `floated="left"` | `left floated` |
| | | `floated` (bare) | _(nothing)_ |
| `keyOrValueAndKey` | `useKeyOrValueAndKey` -- `val === true ? key : "val key"` | `pointing` | `pointing` |
| | | `pointing="left"` | `left pointing` |
| `multiple` | `useMultipleProp` | `only="mobile tablet"` | `mobile only tablet only` |
| | | `only="large screen"` | `large screen only` |
| | | `reversed="computer vertically"` | `computer vertically reversed` |
| `width` | `useWidthProp` (+ fractions, percentages) | `width="4"` | `four wide` |
| | | `columns="equal"` (`canEqual`) | `equal width` |
| `textAlign` | `useTextAlignProp` | `text-align="left"` | `left aligned` |
| | | `text-align="justified"` | `justified` |
| `verticalAlign` | `useVerticalAlignProp` | `vertical-align="middle"` | `middle aligned` |
| `boolean`, `enum`, `string`, `number`, `json` | -- | | _(no class; typed property only)_ |

`ClassBuilder.build()` takes PROPERTY values (after conversion), keyed by canonical attribute name:
`true` means "bare" for keyOnly / keyOrValueAndKey, a string / number is the value, falsy emits nothing.

## Widths

The attribute is `width`, NEVER `wide`.  It accepts:

| Form | Example | Columns (of 16) | Class |
|---|---|---|---|
| number | `width="4"` / `.width = 4` | 4 | `four wide` |
| word | `width="four"` | 4 | `four wide` |
| fraction | `width="1/4"`, `"3/4"` | 4, 12 | `four wide`, `twelve wide` |
| percentage | `width="25%"`, `"100%"` | 4, 16 | `four wide`, `sixteen wide` |
| equal | `columns="equal"` | -- | `equal width` (only where `canEqual`) |

- Inexact values (`1/3`, `33%` => 5.33) snap to the nearest column with a dev-time warning.
- Out of range (`0`, `17`, `2/1`) emits nothing, with a dev-time warning.
- `widthClass` on the attribute spec picks the words after the number, like SUI React's `useWidthProp`:
  `"wide"` (default) => `four wide`, `"column"` => `four column` (grid `columns`), `"wide computer"` =>
  `four wide computer` (responsive column widths), `""` => bare `four`.
- `ValueSets.columns(value)` does the parsing, so converters and validators agree with `ClassBuilder`.

## Booleans

Attribute value => boolean, via `Converters.boolean()`:

- absent => false
- `""`, `"true"`, `"yes"`, or the attribute's own name (`disabled="disabled"`) => true
- `"false"`, `"no"`, `"0"` => false -- Vue sends `open="false"` when it can't find a property
- any other present value => true (HTML presence semantics)
- reflection: true => `""`, false => attribute removed;  `"false"` only for an attribute whose default is `true`
  (`visible`, `closable`):  removing it would bring the default back

keyOrValueAndKey attributes use `Converters.keyOrValue()`: bare / `"true"` / `"yes"` => `true`,
`"false"` / `"no"` => `false`, otherwise the (validated) value.

## Shared attributes:  `disabled`, `loading`, `visible`

Every element takes these, though its vocabulary may not name them (`SharedVocabulary`;  epic `spell-element` P8):

- `disabled`:  `:state(disabled)`.  By default unusable:  clicks swallowed, `aria-disabled`, everything inside
  inert and dimmed (`:state(dimmed)`), focus inside moves on.  A family with a disabled of its own keeps it
  (`elementSetup.disabled = "its own"`):  a form control disables its native control, `<ui-icon>` only dims,
  `<ui-transition>` pauses.
- `loading`:  `:state(loading)`.  By default a spinner over it, everything inside inert and dimmed, `aria-busy`
  (`:state(busy)`);  a family with its own loader keeps it (`<ui-button>`, `<ui-segment>`).
- `visible="false"`:  fades out (`elementSetup.visibleAnimation`), then `:state(hidden)`;  `visible` fades it back.
  Hidden at once when set before the element draws.  `<ui-sidebar>`, `<ui-transition>` and `<ui-reveal>` keep
  their own `visible`.
- the platform's `hidden` hides any element at once, whatever its own `display` (`reset.css`);  `<ui-divider
  hidden>` keeps Fomantic's meaning, the spacing without the line.  The platform's `inert` works, unstyled.
- `readonly`:  every form control's vocabulary declares it;  `:state(readonly)`.

## `medium`

`medium` is a real size meaning "default".  It is accepted, validated and reflected like any other size,
but `ClassBuilder` emits NO class for it -- so `size="medium"` and no `size` render identically, and CSS never
needs a `.medium` rule.

## Value sets

Enumerated values are validated against shared sets in `ValueSets` (or an inline list in the vocabulary):

- `hues` -- `primary secondary red orange yellow olive green teal blue violet purple pink brown grey black`
  (extensible: `ValueSets.add("hues", ...)`)
- `sizes` -- `mini tiny small medium large big huge massive`
- `positions` -- `top left`, `top center`, `top right`, `bottom left`, `bottom center`, `bottom right`,
  `left center`, `right center`;  plus ours, `left top`, `left bottom`, `right top`, `right bottom` (beside the
  target, lined up with its top / bottom edge -- word order matters)
- `attachments` -- `top`, `bottom`, `left`, `right`, `top left`, `top right`, `bottom left`, `bottom right`
- `alignments` -- `left center right justified`;  `verticalAlignments` -- `top middle bottom`
- `floats` -- `left right`;  `devices` -- `mobile tablet computer`, `large screen`, `widescreen`
- `widths` -- `1`..`16` (+ words, fractions, percentages)
- `booleans` -- `true false yes no`

Unknown values are dropped with a dev-time "did you mean" warning (`Converters.enumValue()`, Levenshtein via
`$/ui/util`'s `suggest()`).

## Forms:  `<ui-form>` and the native `<form>`

Class grammar for forms is Fomantic's (`ui large error form`, `required four wide field`, `inline two fields`),
but the FORM itself has to be a real `<form>` in the light DOM:

- A form-associated control (`<ui-input>`, `<ui-checkbox>`, `<ui-dropdown>` ... and native inputs) belongs to the
  nearest `<form>` ANCESTOR in its own tree.  A `<form>` rendered in `<ui-form>`'s shadow root would own none of
  the slotted controls, and a custom element can't BE a form.
- So `<ui-form>` is the form's LOOK and its VALIDATION, around a native form it finds:  one slotted inside it
  (preferred), else the one around it.  It never creates or moves one -- frameworks own that DOM.

```html
<ui-form>
  <form action="/sign-up" method="post">
    <ui-fields widths="2">
      <ui-field required><label for="name">Name</label><ui-input id="name" name="name"></ui-input></ui-field>
      <ui-field><label for="mail">E-mail</label><ui-input id="mail" name="email" type="email"></ui-input></ui-field>
    </ui-fields>
    <ui-message state="error" header="Please fix the fields"></ui-message>
    <ui-button type="submit">Sign up</ui-button>
  </form>
</ui-form>
<script>
  document.querySelector("ui-form").rules = { name: "notEmpty", email: ["notEmpty", "email"] }
</script>
```

- Submission stays native:  `FormData`, `requestSubmit()`, `form.reset()` (controls restore their starting
  values through `formResetCallback`), `<fieldset disabled>`.  `<ui-button type="submit">` and Enter in a
  `<ui-input>` submit the form.
- `<ui-form>` sets `noValidate` on the form (restored on disconnect) and validates on `submit` itself:  its
  `rules` (Fomantic's `fields` shape) plus each control's own constraint validation.  An invalid submit is
  stopped before the page's submit handlers run;  a valid one fires the cancelable `ui-success` first.
- Without a native form, `<ui-form>` still validates (`validate()`, `validate-on="blur|change"`), but nothing submits.
- Prompts render inside each `<ui-field>`'s shadow root (a basic pointing `prompt` label, `role="alert"`);
  `<ui-form>` finds a control's field with `closest(":state(field)")`.  A form / field in a state shows the
  `<ui-message>`s of that state (`native.css`).

## Items:  ONE generic `<ui-item>`

Fomantic's `.item` is shared by dropdown, list and menu (and the Items view).  Here it's one element too,
`<ui-item>` (`src/components/ui-item/`, its own lib entry `@spell-app/ui/ui-item`), rendered by OWNER CONTEXT like the content
parts -- never `ui-list-item` / `ui-menu-item`:

```html
<ui-dropdown selection><ui-item value="a">Apple</ui-item></ui-dropdown>          <!-- data:  renders <slot> only -->
<ui-list divided><ui-item icon="users">Friends</ui-item></ui-list>                <!-- a list item box -->
<ui-menu pointing><ui-item href="/inbox" active>Inbox</ui-item></ui-menu>         <!-- a menu item link -->
```

- Why one element:  the dropdown's `<ui-item>` contract ALLOWS it -- inside a dropdown it renders nothing but a
  `<slot>` (the dropdown reads it as data and draws its own `role=option` rows), so the same tag can render a box
  wherever an owner wants one.  One vocabulary names everything any owner reads (`value`, `href`, `icon`, `image`,
  `link`, `color`, `position`, `fitted`, `type`, `selected` ...).
- How:  list and menu vocabularies `ownsParts: ["item", ...]`.  The item finds its owner through `PartContext`
  (`:state(in-list)` / `:state(in-menu)`), asks the owner's component for an `ItemContext` (`ItemOwner`,
  `components.types.ts`:  the DOM element's role, the box's role, interactive or not, `aria-current` value), and adopts
  the owner's `styles`, so each owner's sheet holds its item rules (`:host(:state(in-menu)) > .item` beside the static
  `.ui.menu .item`).  A dropdown is a registered non-part component, i.e. a barrier:  its items never find an
  outer menu.
- The box:  `<a href>` with `href`;  a `<button>` for `link` or when the owner says items are interactive
  (selection list, `link` / `pagination` menu, menubar);  else a `<div>` (an item can hold inputs, buttons,
  dropdowns).  `type="header"` => `<div class="item header">`.
- Owner VARIATIONS reach the item's shadow root as inherited tokens the owner root declares (`UIMenu.css`,
  `UIList.css` headers list them):  the owner root resolves every class combination (`secondary pointing`,
  `vertical tabular`), the item rules only read tokens.  Public ones go through private aliases
  (`--_ui-menu-item-padding: var(--ui-menu-item-padding, ...)`, `docs/theming.md` "Owner tokens").
- Chosen state:  `selected` (canonical, class word `active`);  `active` is accepted as an alias on `<ui-item>`,
  Fomantic's word.  Selected => `aria-current` (`page` on a link, `true` otherwise).
- Colour:  an item has no `ui`, so a coloured one adds `ui-<color>` (the utility remap class) for `colors.css`.
- The item is a part (`isPart`):  transparent to other parts, so `<ui-item><ui-content><ui-header>` inside a list
  is the LIST's header (`.ui.list > .item > .content > .header`).
- The Items VIEW (Phase B) reuses this tag:  `<ui-items><ui-item>`, never a second item element.  `<ui-items>`
  owns `item` like list and menu;  there the item is NOT transparent -- it owns its content parts, so the
  `in-item` keys in `UIParts.css` (`.ui.items > .item > .content > .header`) apply only under `<ui-items>`.
  Decided 2026-09-29.

## Menus:  navigation by default, menubar opt-in

- `<ui-menu>` is a `<nav>` landmark by default (the DOM element's `aria-label` names it:  two navs need distinct names),
  its items links;  the selected link is `aria-current="page"`.
- `interactive` makes it an application MENUBAR (APG):  `role="menubar"` (+ `aria-orientation` when `vertical`),
  items `role="menuitem"` (their DOM elements `role="none"`), ONE Tab stop with arrows / Home / End (roving tabindex
  over the items' inner boxes -- a focusable DOM element would hide the menuitem from axe and assistive tech).
- A `<ui-menu>` inside a menu (directly, or inside an item) is a SUB-MENU:  `<div class="[position] menu">`,
  e.g. `<ui-menu position="right">` for Fomantic's `right menu`.  It hands its items the top menu's context.
- `ui-select` (`{ value, item }`) fires when a link / button item is activated;  the menu never moves `selected`.
- The look is ONE word, `appearance` (`UIT.MenuAppearances`), shared with `<ui-tabs>`:  `tabular`, `pointing`,
  `secondary`, `text`, and our `segmented` -- a bordered group of joined items, the selected one filled with `color`
  (else the primary colour) in its on-colour, hugging its items.  `kind: "valueOnly"`:  the value IS the class word,
  so the older booleans (`tabular`, `pointing` ...) stay as aliases with the same words, and combine
  (`appearance="pointing" secondary` ~== `secondary pointing`).  Not in it:  `vertical` (an orientation every look
  takes) and `basic` (`<ui-tabs basic>` is the panes').
- `alignment="fluid | left | center | right"` => `<value> aligned`:  where the items sit along a horizontal bar --
  packed at one end (`justify-content`), or filling it (`fluid`:  each item grows from its own width).  A segmented
  menu IS its items, so it moves as a whole (auto margins).  Ignored when `vertical`.
- `equal` (keyOnly):  every item the same width, from the items themselves -- no count:
  - packed (no `alignment`, or `left` / `center` / `right`):  the root becomes a grid of `1fr` columns sized to its
    content (`grid-auto-columns: 1fr` + `width: fit-content`), so each item is as wide as the widest and the bar hugs
    them;  `alignment` moves the bar.  A packed `tabular` bar's rule ends at its last tab
  - `alignment="fluid"`:  each item `flex: 1 1 0`, an equal share of the bar
  - the same attribute on `<ui-tabs>`, `<ui-buttons>`, `<ui-statistics>`, `<ui-steps>`, `<ui-fields>`:  a group that
    hugs its children (buttons, steps) packs as a grid unless `fluid`;  one that spans its row (statistics, fields)
    shares the row (fields:  Fomantic's own `equal width fields`)
- `items="3"` => `three item` (evenly divided);  `items="equal"` => `equal width`:  the older, COUNT-based aliases of
  `equal alignment="fluid"`, kept as Fomantic's words (as `width` on buttons, `widths` on statistics / steps / fields).
- A dropdown item is an item holding a `<ui-dropdown>`:  `<ui-item><ui-dropdown text="More">...`.

## Tables:  `<ui-table>` and the native `<table>`

A table's semantics stay NATIVE and in the LIGHT DOM;  the element only adds the look, sorting and a scroller:

- Shadow root:  `<div class="[resizable] [attached] [scrolling] scroller" part="scroller"><slot></slot></div>`.
  While `scrolling` / `overflowing` it caps its height, scrolls, and is a focusable, named region (the DOM element's
  `aria-label`, else the `<caption>`, else the translated `label`).
- Styling:  the element MIRRORS its class string (`ui celled striped red table`) onto the slotted `<table>`,
  adding and removing only its own words (author classes stay;  its phrase follows them in grammar order), and
  registers `UITable.css` as a PAGE sheet.  One mechanical port of `table.less` then serves element markup and
  static class grammar alike -- SSR writes `<table class="ui celled table">` and paints before any JS -- and
  translated names, `yes` / `no` and `medium` resolve through the vocabulary like everywhere else.  (Attribute
  selectors on the DOM element, `ui-table[celled] > table`, can do none of those.)
- Rows and cells keep Fomantic's classes on native `tr` / `td` / `th` (`positive`, `red marked left`,
  `collapsing`, `four wide`):  no JS, no elements.
- `stackable` answers to the VIEWPORT, as in Fomantic, for elements and static markup alike;  an element opts in to
  its DOM element's width (a size container) with `stack-by="container"` (a state of the DOM element;  or the region
  token `--ui-table-stack-by: container`, which the attribute beats).
- Sorting (`sortable`):  a header's `<button>` is its control (else the header becomes focusable);  the
  cancelable `ui-sort` (`{ column, key, direction }`) comes first, then `sort-column` / `sort-direction` and
  `aria-sort`.  `client-sort` reorders a simple table's rows by cell text;  otherwise the app sorts.
  `th[data-sortable="false"]` (or Fomantic's `th.disabled`) opts a header out.
- `columns="4"` stays Fomantic's equal-width count (`four column`);  the data mode's column list is `columnDefs`.

### Data mode

`table.rows = [...]` (and optionally `table.columnDefs = [{ key, header, textAlign, sortable, width }]`) with NO
slotted `<table>` makes the element render one -- into its LIGHT DOM, text only:  `th scope="col"` headers
(with sort buttons when `sortable`), keyed rows, shown in the current sort order.  It's removed again when
`rows` is unset or an author table appears:  the author's table always wins, and is never overwritten.
Why light DOM:  one styling path (the same page sheet and class grammar as a slotted table), native semantics
in the document (find-in-page, copy, page CSS), and a server can render the same `<table>` markup itself, so
first paint never needs the property.  No virtualization yet:  every row renders.

## Popups:  `<ui-popup>` on a target, anchored by CSS

```html
<ui-button id="save">Save</ui-button>
<ui-popup for="save" header="Saving" content="Stores a draft;  nothing is published."></ui-popup>

<ui-button>Plan</ui-button>                                   <!-- no `for`:  the previous sibling -->
<ui-popup open-on="click" position="bottom left" flowing header="Basic plan"><ui-button primary>Choose</ui-button></ui-popup>

<button data-tooltip="Add users" data-position="bottom left" data-inverted>+</button>   <!-- CSS only -->
```

- Target:  the `target` PROPERTY, else `for` (an id in the popup's own tree), else the previous element sibling
  (Fomantic's `inline` markup).
- The DOM element is the popover (`hint` for hover / focus popups when `UI.browser.supports.popoverHint`, else `manual`;
  click and manual popups are always `manual` so `ui-close` can veto) and the positioned box:  anchor positioning
  only, `position-area` from `position` (Fomantic's eight positions -- `top left` ... `right center` -- plus four
  of ours, `left top` ... `right bottom`;  the plan's "11" was a miscount), `position-try-fallbacks: flip-block,
  flip-inline`.  Anchored container queries move the arrow on a flip (`UIPopup.anchored.css`, a raw sheet Lightning
  CSS can't parse).
- Our four positions share their class WORDS with Fomantic's (`left top` ~== `top left` as classes), so their
  rules match the phrase, `[class*="left top"]` (Fomantic's own `very wide` idiom);  the tooltip's `data-position`
  is one string, so it needs no trick.
- Anchor:  the plan's named anchor (the target gets an `anchor-name` ADDED to its inline list, the DOM element a
  `position-anchor`) when the target has a box;  a `display: contents` target (`<ui-icon>`, `<ui-label>`, most
  `ui-*` elements) has none, and a tree-scoped name can't reach into its shadow root, so the popup then anchors to the
  target's first shadow box IMPLICITLY (`showPopover({ source })`, `position-anchor: auto`).
- `open-on`:  `hover` (+ keyboard focus;  `show-delay` / `hide-delay`, Fomantic's 50 / 70 ms), `focus`, `click`,
  `manual`.  A hovered popup stays open while the pointer is over it (WCAG 1.4.13), where Fomantic defaulted to
  `hoverable: false`;  `hoverable="false"` (boolean, default true) gives Fomantic's behaviour back:  it closes as
  the pointer leaves the target (after `hide-delay`).
- Accessibility follows `open-on`:  tooltip-like (`role=tooltip`, the target `aria-describedby` it) or, for `click`, a
  non-modal dialog (`role=dialog` named by `header`, the target `aria-haspopup=dialog` / `aria-expanded` /
  `aria-controls`).  The ARIA goes on the element that takes focus -- a `<ui-button>`'s inner `<button>`, by
  element reflection.  Escape and outside clicks come from `UI.overlays`.
- Content:  `header` / `content` shorthands (Fomantic's `title` / `content`), slotted content, or `<ui-header>` /
  `<ui-content>` parts (owner context `in-popup`).
- The CSS-only tooltip (`data-tooltip`, `data-position`, `data-inverted`, `data-variation`) is `native.css`, a page
  sheet;  pseudo-element text isn't reliably announced, so anything that matters belongs in a `<ui-popup>`.

## Buttons:  invoker commands

```html
<ui-button commandfor="photo" command="--show">Change photo</ui-button>
<ui-button commandfor="menu" command="toggle-popover">Menu</ui-button>
```

- `<ui-button commandfor="id" command="...">` is the native invoker on a custom element:  the inner `<button>` gets
  `command` and a `commandForElement` resolved from the DOM element's root node (a shadow button can't see a light-DOM
  id), re-resolved when `commandfor` changes and at click time.
- Without `UI.browser.supports.invokers` (`"commandForElement" in HTMLButtonElement.prototype`) a click runs it:  the
  cancelable `command` event on the target (`event.command`, `event.source`), then `show-modal` / `close` /
  `request-close` on a `<dialog>` or `show-popover` / `hide-popover` / `toggle-popover` on a popover.  Custom `--foo`
  commands stop at the event.
- Answering `command` events:  `<ui-modal>` / `<ui-flyout>`, `<ui-sidebar>`, `<ui-dimmer>`, `<ui-popup>` (opens at its own
  target), `<ui-dropdown>` (opens the menu, focused;  ignored when disabled / read-only) (`--show` / `--close` /
  `--toggle`);  `<ui-toast>` (`--close` only:  a closed toast stays `hidden`);  `<ui-transition>`, `<ui-shape>` (their
  own).  The shared first step is `ToggleCommands.action(event, open)` (`components.types.ts`).

## Modals:  `<ui-modal>` on a native `<dialog>`

```html
<button class="ui button" commandfor="photo" command="--show">Change photo</button>
<ui-modal id="photo" closable>
  <ui-header>Profile Picture</ui-header>
  <ui-content><ui-description>Is it okay to use this photo?</ui-description></ui-content>
  <ui-actions><ui-button class="deny">Nope</ui-button><ui-button positive>Yep, that's me</ui-button></ui-actions>
</ui-modal>
<script>
  await UI.modals.confirm({ title: "Delete?", message: "It can't be undone." })  // true / false
</script>
```

- Shadow `<dialog class="ui ... modal">` opened with `showModal()`:  focus trap, `inert` page and top layer are the
  browser's;  the `::backdrop` is the dimmer (no `ui-dimmer`).  Scroll lock, the keyboard scope and focus restore
  come from `UI.overlays` (kind `modal`).
- Sizes are WIDTHS (Fomantic's ratios of 850px ... on computers, 88% on tablets, 95% on phones) and header sizes;
  text never scales.  `fullscreen`, `overlay fullscreen`, `basic`, `inverted`, `scrolling`,
  `vertical-align="top|bottom"` (`top aligned`).
- `closedby` mirrors `<dialog closedby>` and replaces Fomantic's `closable` setting:  `any` (Escape or the dimmer,
  default), `closerequest` (Escape), `none`.  Natively when `UI.browser.supports.dialogClosedBy`, else through the
  overlay's outside click;  Escape always through `UI.overlays`, so only the topmost overlay closes.  `closable`
  is the close ICON (Fomantic's `closeIcon`) -- always INSIDE the box:  the dialog is its own scroll box, so
  Fomantic's outside placement would be clipped.
  `closable="false"` also restores Fomantic's `closable: false`:  no icon AND `closedby="none"`, unless `closedby` is
  set (it wins).  `closable` absent:  no icon, dismissed by `closedby`.
- Invoker commands (`--show`, `--close`, `--toggle`) arrive as the `command` event on the DOM element, from a native
  `<button commandfor command>` or a `<ui-button commandfor command>`.
- Events:  `ui-open` (cancelable;  a user action -- the `--show` invoker command), `ui-close` (cancelable, with
  `reason`:  `escape` / `outside` / `close` / `approve` / `deny` / `close-all`), then `ui-show` / `ui-hide` once
  the CSS transition has ended.  Writing `open` is the app's own decision and fires no `ui-open` / `ui-close`.
- Approve / deny:  Fomantic's `.approve` / `.ok` / `.positive` and `.deny` / `.cancel` / `.negative` classes, or
  `<ui-button positive / negative>`, anywhere inside;  their cancelable `ui-approve` / `ui-deny` come first
  (Fomantic's `onApprove` returning `false`).
- Named by the DOM element's `aria-label`, else the `header` shorthand, else a slotted `<ui-header>`.  The close icon is
  LAST in the DOM, so the initial focus lands in the content (a confirm's Cancel), not on it.
- `UI.modals.confirm()` / `alert()` / `prompt()` build a `<ui-modal>` in `<body>` (`ModalDialogs`, registered by
  the family's barrel through `UI.modals.register()`), with the translated `ok` / `cancel` texts.
- The behaviour above is `DialogComponent` (`src/components/ui-modal/DialogComponent.tsx`), which `<ui-flyout>` shares;
  `UIModal` only names and styles it.  The `::backdrop` reads the shared `--ui-dimmer-background` token, so a
  theme styles it and `<ui-dimmer>` at once (`--ui-modal-dimmer-filter` blurs it).

## Transitions:  `<ui-transition>` around content

```html
<button class="ui button" commandfor="notice" command="--toggle">Toggle</button>
<button class="ui button" commandfor="notice" command="--transition">Shake</button>
<ui-transition id="notice" animation="fade up" duration="300" visible><ui-segment>Saved</ui-segment></ui-transition>
<script>
  await notice.hide()              // resolves once animated;  notice.show(), notice.toggle()
  await notice.transition("shake") // an attention animation, in place
</script>
```

- Shadow `<div class="ui ... transition [visible] [animating]" part="transition"><slot>`:  the BOX animates (the
  `animations.css` catalogue through `UI.transitions`), and its `hidden` attribute hides the content -- out of the
  page and the accessibility tree.  `inline` makes it an inline block around an image or a button.
- `visible` drives it:  absent => hidden;  a change animates `animation` in / out;  first paint never animates.
  `animation` takes Fomantic's names, spaces and all (`fade up`, `horizontal flip`, `browse right`);  an attention
  one (`shake`, `pulse` ...) shows / hides at once and runs through `transition()`.
- DOM element METHODS (`DOMTransitionElement`), as there's no attribute for "shake now":  `show()`, `hide()`,
  `toggle()`, `transition(name?)` (Fomantic's `$(el).transition(name)`;  `animate` is taken by Web Animations).  They
  write `visible`, so it reflects.  Invoker commands do the same with no script:  `--show`, `--close`, `--toggle`,
  `--transition` (`TransitionCommands`).
- Queue, as Fomantic's `queue: true`:  each animation waits for the one before;  the same animation twice in a row is
  dropped (`allow-repeats` keeps it);  `interrupt` stops the running one instead (Fomantic's `queue: false`).
- Events:  `ui-show` / `ui-hide` once an in / out has run (`{ visible, animation }`, Fomantic's `onVisible` /
  `onHidden`), `ui-complete` after every animation.  Reduced motion:  the end state at once, events all the same.
- `looping`, `pulsating` (+ `color`, `inverted` for its ring), `disabled` (paused) are Fomantic's classes;
  `animations.css` owns their rules.  Group animations (`interval`) aren't built.

## Dimmers:  `<ui-dimmer>`, an element or a page

```html
<ui-segment>
  <p>Content</p>
  <ui-dimmer active blurring><ui-header level="4">Saved</ui-header></ui-dimmer>
</ui-segment>
<div class="card-image"><img src="..." alt="" /><ui-dimmer show-on="hover"><ui-button inverted>Add</ui-button></ui-dimmer></div>
<ui-dimmer id="busy" page aria-label="Loading"><ui-loader>Loading</ui-loader></ui-dimmer>
```

- ELEMENT dimmer (default):  `<div class="ui ... dimmer">` over its parent -- the nearest positioned box;  the
  `dimmer-page` page sheet positions a plain parent for it (Fomantic's `.dimmable`, matched by `:state(dimmer)`).
  Not modal:  what it covers stays in the page, as Fomantic's.
- PAGE dimmer (`page`):  a `<dialog class="ui page ... dimmer">` shown with `showModal()`.  MODAL, decided:  it
  covers everything, so the page must not be reachable by Tab or a screen reader either -- `inert` page, focus
  inside (the dialog itself when nothing inside is focusable), focus back on hide, scroll lock and Escape through
  `UI.overlays` (kind `dimmer`).  Named by the DOM element's `aria-label`, else "Dimmed page".
- `active` (Fomantic's word and class) is auto-controlled:  cancelable `ui-open` / `ui-close` (`reason`:  `click`,
  `escape`, `hover`, `close-all`) for user actions, then `ui-show` / `ui-hide` after the fade.
- `show-on="hover"`:  shown while the pointer is over the parent OR focus is inside it;  an inactive hover dimmer stays
  laid out (transparent, click-through), so Tab reaches its buttons -- Fomantic's was mouse-only.  `show-on="click"`:  a
  click on the parent shows it.
- `closedby` as on `<ui-modal>`:  `any` (a click on the dimmer, not its content;  Escape on a page dimmer),
  `closerequest`, `none`;  a hover dimmer ignores clicks (Fomantic's `closable: 'auto'`).
- Looks:  a dark dimmer is the dark scheme for its content (`color-scheme: dark`), so a plain `<ui-header>` reads
  light where Fomantic needed `inverted header`;  `inverted` is the light one.  `blurring` is `backdrop-filter` on
  the dimmer (Fomantic's filter on the siblings can't reach out of a shadow root).  `shade` (`medium`, `light`,
  `very light`), `simple`, `disabled`, `vertical-align="top|bottom"`.
- Shared tokens, for a theme:  `--ui-dimmer-background`, `--ui-dimmer-inverted-background`,
  `--ui-dimmer-blurred-background`, `--ui-dimmer-blur`, `--ui-dimmer-duration` -- `<ui-modal>`'s `::backdrop`,
  `<ui-flyout blurring>` and `<ui-sidebar blurring>` read them too.

## Flyouts:  `<ui-flyout>`, a side modal

```html
<button class="ui button" commandfor="help" command="--show">Help</button>
<ui-flyout id="help" position="right" width="wide" closable>
  <ui-header>Help</ui-header>
  <ui-content>...</ui-content>
  <ui-actions><ui-button class="approve" primary>Done</ui-button></ui-actions>
</ui-flyout>
```

- `<ui-modal>`'s element in a flyout's clothes:  the same `DialogComponent` base (`open`, `closedby`,
  `closable`, `header` / `content`, approve / deny, `--show` / `--close`, the six events, naming, `UI.overlays` with
  kind `flyout`), a `<dialog class="ui [position] ... flyout">` sliding in from `position` (`left`, the default,
  `right`, `top`, `bottom`) over a lighter `::backdrop` (0.4).
- The split:  `DialogComponent` (modal family) is the component base;  `UIModal` / `UIFlyout` add vocabulary,
  sheet, `rootPart` and `overlayKind`.  The flyout family imports `$/ui/components/ui-modal`, so loading it defines
  `<ui-modal>` too.
- The dialog is a column:  header, a content that grows, actions at the bottom (Fomantic's `min-height` calcs);  the
  dialog itself scrolls.
- `width`:  Fomantic's words (`very thin` 120px, `thin`, 400px default, `wide`, `very wide` 800px) or columns of the
  viewport (`4`, `1/4`, `25%` => `four wide`);  `fullscreen`, `inverted`, `blurring`.
- Parts:  a flyout owns `header`, `content`, `description`, `actions` (`:state(in-flyout)`, `UIParts.css`).

## Sidebars:  `<ui-sidebar>` in a `<ui-pushable>` beside a `<ui-pusher>`

```html
<ui-pushable style="height: 100dvh">
  <ui-sidebar id="menu" inverted aria-label="Site">
    <ui-menu vertical inverted fluid aria-label="Site"><ui-item href="/">Home</ui-item></ui-menu>
  </ui-sidebar>
  <ui-pusher>
    <button class="ui button" commandfor="menu" command="--toggle">Menu</button>
    ...the page...
  </ui-pusher>
</ui-pushable>
```

- Fomantic's three classes as three elements:  `<ui-pushable>` (the clipping box), `<ui-sidebar>` (the panel),
  `<ui-pusher>` (the page beside it).  A visible sidebar reports what it needs to its pushable, which sets inherited
  PRIVATE tokens (`PusherTokens`, `--_ui-pusher-*`) the pusher reads:  where it moves (measured, as Fomantic's
  script did), its origin, dimmed, blurred.  Fomantic's sibling rules (`.visible.left.sidebar ~ .pusher`) stay for static markup.
- `position` (`left` default, `right`, `top`, `bottom`), `width` (Fomantic's words `very thin` 60px, `thin` 150px, `wide`, `very wide`, AND columns / fractions /
  percentages of the viewport:  `4`, `1/4`, `25%` => `four wide`;  as `<ui-flyout>`'s, the word goes just before the noun:
  `ui left thin sidebar`),
  `transition` (`overlay`, `push`, `scale down`, `uncover`, `slide along`, `slide out`;  default Fomantic's:
  `uncover` on the sides, `overlay` at the top / bottom), `inverted` (a dark panel), `blurring`.
- Semantics, by APG, decided:
  - MODAL (default) -- a drawer:  `<dialog aria-modal="true">` opened with `show()`, NOT `showModal()` (the top
    layer would lift it out of its pushable);  focus moves in and Tab stays in (`UI.focus.trap`), the pushable makes
    the pusher `inert` and dims it, Escape and a click beside it close it (`UI.overlays`, kind `sidebar`, no scroll
    lock), focus returns to the toggle.  `closedby` as on `<ui-modal>`.  Named by `aria-label`, else "Sidebar".
  - `persistent` -- part of the page:  an `<aside>` landmark (a `<ui-menu>` inside is the `<nav>`), nothing
    dimmed, inert or trapped, focus stays put.
- `visible` is auto-controlled:  `ui-open` / `ui-close` (`escape`, `outside`, `close`, `close-all`) for user
  actions -- the `--show` / `--close` / `--toggle` invoker commands (`ToggleCommands`) -- then `ui-show` /
  `ui-hide` after the slide.
- A hidden sidebar is `visibility: hidden`:  out of the tab order and the tree, but laid out for measuring.
- Sizing:  the pushable's DOM element is a block (`<ui-pushable style="height: 100dvh">` for a whole page);  a sidebar's
  menu fills its width with `fluid`.

## Shapes:  `<ui-shape>` of `<ui-side>`s

```html
<button class="ui button" commandfor="dice" command="--next">Roll</button>
<ui-shape id="dice" cube direction="up">
  <ui-side><span>1</span></ui-side>
  <ui-side><span>2</span></ui-side>
</ui-shape>
<script>
  await dice.flip("over", 0) // resolves once turned;  dice.next(), dice.previous()
</script>
```

- Shadow `<div class="ui [cube] [text] shape"><div class="sides" part="sides"><slot>`;  each `<ui-side>` DOM element is
  a face (`<div class="side">` inside).  A side isn't an attribute of the shape:  a second tag, as Fomantic's markup
  has a `.side` per face.
- `active-index` (controlled, from 0) is the side shown;  changing it turns the `direction` way (`up`, `down`,
  `left` default, `right`, `over`, `back`) -- the attribute isn't `flip`, which is the DOM element's METHOD
  (`ShapeHost`:  `flip(direction?, index?)`, `next()`, `previous()`, resolving once turned).  Invoker commands:
  `--next`, `--previous` (`ShapeCommands`).
- The flip is Fomantic's geometry (`shape.js`), a CSS transition on the sides box;  flips queue;  `ui-change`
  (`{ activeIndex, side, flip }`) once turned.  Reduced motion:  an instant swap.
- The shape's type reaches its sides as a token (the private `--_ui-shape-type`, style-queried):  a side's shadow can't see the
  shape's classes.  The sides box is a polite live region, so the new side is read out.

## Cards:  `<ui-card>` in `<ui-cards>`

```html
<ui-cards columns="3" doubling stackable raised>
  <ui-card href="/people/kristy" image="kristy.jpg" header="Kristy" meta="Joined in 2013"
           extra="22 Friends"></ui-card>
  <ui-card>
    <img src="matthew.jpg" alt="Matthew" />
    <ui-content>
      <ui-header>Matthew</ui-header><ui-description>A musician living in Nashville.</ui-description>
    </ui-content>
    <ui-extra><a href="/people/matthew/friends">75 Friends</a></ui-extra>
  </ui-card>
</ui-cards>
```

- Root:  `<article class="ui ... card">` -- HTML's self-contained composition (a person, a product, a post), which
  readers can jump between;  APG has no card pattern.  With `href` the whole card is ONE link
  (`<a class="ui ... card" href>`), named by its content.  `link` is Fomantic's hover look only:  a card that goes
  somewhere needs `href` (a `<button>` card would nest the buttons inside it).
- Content:  the generic parts (`in-card`, `UIParts.css`);  a slotted `<img>` is a full-width image.
- Shorthands `image` (+ `alt`, default `""`), `header`, `meta`, `description`, `extra` render the SAME parts as
  static markup in the card's shadow root (`<div class="header in-card">`), styled by the `UIParts.css` the card
  adopts.  Order:  image, one content block, the slot, extra.  A slotted part of a shorthand's noun anywhere inside
  (or a slotted `<img>`) wins, and that shorthand isn't rendered.
  A slotted `<ui-content>` after the shorthand block keeps its rule above (`--_ui-card-leading`).
- A group owns its cards (`ownsParts:  card`):  a card in `<ui-cards>` is a `role=listitem` DOM element (the group is a
  `role=list`) with `:state(in-cards)`, and takes the group's `size`, `color`, `horizontal`, `raised`, `link`,
  `basic`, `inverted` as its OWN classes when it doesn't set them (`CardSharedVariation`) -- so `UICard.css` needs one
  `.ui.raised.card` rule where Fomantic had `.ui.raised.cards > .card` too (static markup keeps both).
- Cards per row:  `columns="3"` => `three cards` (1 ... 10, Fomantic's widths and spacings);  `doubling` /
  `stackable` answer to the GROUP's width (its DOM element is the size container `ui-cards`), not the viewport.
- Colours by remap:  a coloured card's line along its bottom edge (Fomantic's `0 2px` shadow) is `--ui-color`;
  `basic` fills with `--ui-color-background`.
- `inverted` switches the card to the dark scheme;  a plain card does NOT force the light one, so it follows a dark
  page (as segments and menus do;  those reset to light only nested in something inverted, Fomantic's white).

## Items view:  `<ui-items>` of the generic `<ui-item>`

```html
<ui-items divided relaxed link>
  <ui-item href="/camps/arrowhead" image="arrowhead.jpg">
    <ui-content vertical-align="middle">
      <ui-header>Arrowhead Valley Camp</ui-header>
      <ui-meta><span>$1200 1 month</span></ui-meta>
      <ui-description>Ours is a life of constant reruns.</ui-description>
      <ui-extra><ui-button floated="right" primary>Book now</ui-button></ui-extra>
    </ui-content>
  </ui-item>
</ui-items>
```

- The SAME `<ui-item>` as dropdown, list and menu (see "Items" above);  `<ui-items>` is its `ItemOwner`:  a `role=list`
  of `role=listitem` DOM elements, `<div>` item boxes (an `<a>` with the item's `href`:  one block link), and the
  `image` shorthand a plain `<img class="image">` (`ItemContext.imageClass`) instead of a list's avatar.
- The item OWNS its content parts here, and only here:  `ItemContext.ownsParts` makes it a CONDITIONAL owner
  (`ConditionalOwner` in `elements.types.ts`, asked by `PartContext` during every climb, from the DOM), so its
  `<ui-content>` / `<ui-header>` / `<ui-meta>` / `<ui-description>` / `<ui-extra>` get `:state(in-item)` --
  Fomantic's `.ui.items > .item > .content > .header` -- while in a list they still see through the item to the
  list.  A moved item re-resolves its parts.
- Images:  the `image` shorthand, a slotted `<img>` (175px, Fomantic's `.image:not(.ui)`), or a `<ui-image size>`
  (its own size).  `<ui-content vertical-align="middle">` aligns the content against the image;  `floated` /
  `text-align` are there too (`right floated content`), for cards and lists as well.
- `link` is Fomantic's hover look (a pointer, the header in the link colour), not interactivity:  an item that goes
  somewhere takes `href`.
- Stacking (image above content below 768px, unless `unstackable`) and the tablet image width answer to the GROUP's
  width:  its DOM element is the size container `ui-items`.

## Feeds:  `<ui-feed>` of `<ui-event>`s

```html
<ui-feed connected>
  <ui-event image="elliot.jpg">
    <ui-content>
      <ui-summary>
        <ui-author href="/elliot">Elliot Fu</ui-author> added you as a friend <ui-date>1 hour ago</ui-date>
      </ui-summary>
      <ui-extra text>Ours is a life of constant reruns.</ui-extra>
      <ui-meta><a href="#like"><ui-icon name="heart"></ui-icon> 4 Likes</a></ui-meta>
    </ui-content>
  </ui-event>
</ui-feed>
```

- A list:  `<ul role="list">` (`<ol>` when `ordered`:  the numbers mean something) of `role=listitem` `<ui-event>`s.
- The event is `<ui-event>` (class `UIFeedEvent`:  `UIEvent` is the DOM's own interface).  It's a PART owned by
  the feed, so the content parts inside see through it to the FEED:  `:state(in-feed)`, Fomantic's
  `.ui.feed > .event > .content .summary`.  Fomantic's `.user` is `<ui-author>`;  no new parts were needed.
- The label (Fomantic's `.event > .label`, not a `ui label`):  the `image` shorthand (round, `alt=""`), the `icon`
  shorthand, a `label` text in a circle (Fomantic's `data-text`), or anything in the `label` slot.  The box renders
  only when there is one (or the feed is `ordered`:  the number goes there);  the event root then declares
  `--_ui-event-label: 1` and `UIParts.css` puts the content beside it, as it does after a slotted label.
- Variations reach the events as inherited private tokens, which the event rules style-query (`--_feed-connected`,
  `--_feed-ordered` ...);  numbering is CSS counters across the shadow boundaries.  `color` colours the number
  circles and the connecting line, on the feed or per event (an event adds `ui-<color>`, having no `ui`).

## Comments:  `<ui-comments>` of `<ui-comment>`s

```html
<ui-comments threaded minimal>
  <ui-header level="3" dividing>Comments</ui-header>
  <ui-comment>
    <ui-avatar src="matt.jpg"></ui-avatar>
    <ui-content>
      <ui-author href="/matt">Matt</ui-author>
      <ui-meta><span>Today at 5:42PM</span></ui-meta>
      <ui-description>How artistic!</ui-description>
      <ui-actions><button type="button">Reply</button></ui-actions>
    </ui-content>
    <ui-comments><ui-comment>...</ui-comment></ui-comments>
  </ui-comment>
  <ui-form slot="reply"><form>...</form></ui-form>
</ui-comments>
```

- A comment is an `<article>`:  HTML's own example of one is "a user-submitted comment", with replies nested inside
  the article they answer -- which a thread is.  The list has no role.
- The comment owns its content parts:  `<ui-avatar>`, `<ui-content>`, `<ui-author>`, `<ui-meta>` (Fomantic's
  `.metadata`), `<ui-description>` (its `.text`), `<ui-actions>` (buttons for actions, links for navigation).  No
  shorthands:  a comment is all parts.
- A `<ui-comments>` inside a comment is its THREAD (it owns `comments`):  `<div class="comments">`, no `ui`, no
  variations of its own -- `threaded`, `minimal`, `inverted`, the size come down from the top list as tokens.
- `minimal` hides a comment's actions until the comment is hovered OR holds keyboard focus (Fomantic's is hover
  only, which leaves a focused action invisible).
- `collapsed` (a list, a thread or a comment) folds it away;  the `reply` slot takes a reply form, below the list or
  a comment.

## Statistics:  `<ui-statistic>` of the generic parts

```html
<ui-statistic value="5,550" label="Downloads"></ui-statistic>
<ui-statistics widths="3" stackable>
  <ui-statistic><ui-label>Views</ui-label><ui-value>40,509</ui-value></ui-statistic>   <!-- top label -->
  <ui-statistic label="Flights"><ui-value><ui-icon name="plane"></ui-icon> 5</ui-value></ui-statistic>
  <ui-statistic value="Three Thousand" text label="Signups"></ui-statistic>
</ui-statistics>
```

- ONE label concept:  a statistic's `.label` is `<ui-label>` itself -- inside a statistic (which `ownsParts` `value`
  and `label`) it renders `<div class="label">` and adopts `UIParts.css` (`UILabel`).  No `<ui-statistic-label>` or
  second label part:  it would be another spelling of the same element.
- Shorthands draw the same parts in the statistic's shadow root, with their STATIC part classes (`value
  in-statistic`):  the `value` BEFORE the slot, the `label` AFTER it, so either pairs with a slotted part and still
  reads value over label.  `text` makes the value shorthand a word value.
- The value / label look (sizes, horizontal, inverted, colour) is `UIParts.css`'s, driven by the owner tokens every
  statistic root declares (`--_ui-statistic-layout`, the aliases `--_ui-statistic-value-size` and
  `-text-value-size` of the public size tokens, `--ui-inverted`);  colour is the generic `--ui-color` remap on the statistic or its group -- never an
  ancestor's (the DOM element drops inherited colour tokens, a member takes back its group's).
- A group hands its members PRIVATE inherited tokens (`--_statistics-*`:  in-a-group, size ratios, layout,
  inversion, `widths`, stacked), since a member can't see its group's classes.
- `widths="3"` => `three statistics` (the button group's / fields' `widths`);  `stackable` stacks below 768px of the
  GROUP's width:  the group root answers the size query in its own tree and hands the answer down as a token
  (container names are tree-scoped).

## Steps:  `<ui-steps>` of `<ui-step>`s

```html
<ui-steps ordered widths="3">
  <ui-step completed header="Shipping" description="Choose your shipping options"></ui-step>
  <ui-step selected icon="credit-card" header="Billing"></ui-step>
  <ui-step href="/confirm" disabled><ui-content><ui-title>Confirm</ui-title></ui-content></ui-step>
</ui-steps>
```

- Semantics:  the group is an `<ol role="list">`, each step's DOM element a `listitem` (internals);  the CURRENT step is
  `selected` (canonical), `aria-current="step"`, class word `active` -- an `active` attribute is accepted as
  Fomantic's alias.  `completed` adds a visually hidden "Completed" (the check alone says nothing to a screen
  reader);  `disabled` is `aria-disabled` (a dimmed, inactive component).
- The step root:  `<a>` with `href`, a `<button>` with `link`, else a `<div>`.
- Content:  `header` (NOT `title`, the global tooltip attribute -- the popup's `header` precedent) and `description`
  shorthands, or the generic parts (the step `ownsParts` `content`, `title`, `description`).
- A step can't see its group's classes:  the `<ol>` root resolves every variation into inherited PRIVATE
  `--_ui-steps-*` tokens (the aliases of the public `--ui-steps-radius` / `-border` / `-accent-on`, plus one switch
  per layout:  `--_ui-steps-layout: horizontal | vertical | stacked`, `--_ui-steps-circular`, `--_ui-steps-ordered`
  ...), which the step rules read and style-query (`UIStep.css` header).  The same rules serve static markup, whose
  `.ui.steps` root declares the same tokens.
- Stacking:  Fomantic stacks steps on phones unless `unstackable`;  here below 768px of the GROUP's width (`ui-steps`
  container on the DOM element), 992px with `stackable="tablet"`.
- `vertical="right"` for Fomantic's `right vertical` (arrow on the start side);  `attached="top | bottom"`;
  `widths` as statistics.  Circular steps are ported (`circular`, `color` on the group or a step), minus their
  `center aligned` / `bottom aligned` content.
- The check of a completed step (its icon, an ordered step's number, a circular ring) is Font Awesome's `check`:
  an `<svg>` for the icon, a CSS mask elsewhere -- no icon font.

## Rails:  `<ui-rail position>`

- `position="left | right"` is the SIDE, emitted as the bare word (`ui left rail`, `kind: "color"` as the menu's
  `position`);  `internal`, `dividing`, `attached`, `close` / `close="very"`, `size`.
- The root is absolutely positioned against the nearest positioned box around the DOM element in the flat tree -- a
  `<ui-segment>`'s root, as in Fomantic.
- A `<div>`, not an `<aside>`:  the content carries the meaning, and unnamed `<aside>`s break `landmark-unique`.

## Reveals:  `<ui-reveal>` with `visible` / `hidden` slots

```html
<ui-reveal move="right">
  <img slot="visible" src="avatar.png" alt="Stevie">
  <img slot="hidden" src="profile.png" alt="Stevie's profile">
</ui-reveal>
```

- The element wraps each slot in Fomantic's `.visible.content` / `.hidden.content` box;  unslotted children join
  the visible content.
- Types as Fomantic's words:  `fade`, `move` / `move="right | up | down"`, `rotate` / `rotate="left"`, `slide` /
  `slide="right | up | down"`;  `instant`, `visible` (no clipping), `active` (revealed -- Fomantic's word, since
  it means "shown", not "chosen"), `disabled`.
- Keyboard:  revealed on `:focus-within` as on hover.  The root is a tab stop (`tabindex=0`, `role=group`, the
  DOM element's `aria-label`) unless the content has a natively focusable element, whose own focus reveals it.  Both
  contents stay in the accessibility tree:  "hidden" is visual only.
- Reduced motion:  the swap is instant (no duration or delay), same end state.

## Ads:  `<ui-ad unit>`

- `unit` is the IAB unit, emitted as its words (`unit="medium rectangle"` => `ui medium rectangle ad`) -- not
  `size`, which is `mini` ... `massive` everywhere.  Mobile units show only on phone-sized VIEWPORTS (a mobile unit
  is for the device).
- `test` is a string:  bare => Fomantic's grey placeholder saying "Ad" (the translated `adTest` text);  a value is
  the text (Fomantic's `data-text`).
- A `<div>`:  wrap an ad column in a named `<aside>` where a landmark is wanted.

## Emoji:  `<ui-emoji name>`, native Unicode

- The glyph is the platform's colour emoji, never an image:  names map to Unicode sequences in
  `src/components/ui-emoji/data/<set>/<letter>.json`, generated by `yarn gen:emoji` (`scripts/gen-emoji.ts`) from
  `emojibase-data` (a DEV-only dependency:  CLDR shortcodes -- `thumbs_up` -- and each emoji's code points and
  presentation, so U+FE0F is added exactly where the data says an emoji defaults to text) and Fomantic's
  `emoji.variables`.  A name's words may be joined any way (`thumbs up`, `thumbs-up`, `thumbsUp`, `thumbsup`):  the
  exact name first, then one with no separators.  Nothing new ships, no CDN.
- NAME SETS, one at a time, never merged:  `cldr` (the default;  every emoji emojibase names, 3,979) and `fomantic`
  (Fomantic's own 3,808 names with ITS meanings:  `dog` = 🐶, `pencil` = 📝).  Switched page-wide like icon packs:
  `<ui-root emoji="fomantic">` (for its subtree;  emoji inside redraw when it changes) or `EmojiData.use("fomantic")`
  (page-wide, for pages without a root;  a switch affects LATER lookups only).  `EmojiData.register()` names survive a switch.
- `EmojiData` loads ONE chunk per first letter on first use (`import()`, at most ~5 KB gzip), caches it, and answers
  later names synchronously;  nothing is in `core`.  `EmojiData.register(name, emoji)` adds an app's own names, for any set.
- Names:  `thumbs_up` ~== `:thumbs_up:` ~== `Thumbs Up`;  spaces ~== `_`.  Unknown => an empty box with no role.
- Accessible name:  by default the character is plain TEXT, so assistive tech reads its Unicode name in the user's
  language;  `label="Approved"` => `role=img` + `aria-label`;  bare `label` => decorative (`aria-hidden`).
- Sizes are Fomantic's emoji ladder against the text (`small` 1.5em, `large` 6em, `big` 7.5em);  `medium` is the
  1em default, as for flags.  `link` is a look only (wrap the emoji in a button);  `loading` spins (it stands
  still under reduced motion).

## Selects:  `<ui-select>`, a native `<select>`

```html
<ui-select name="size" placeholder="Size" required>
  <ui-item type="header">Shirts</ui-item>
  <ui-item value="s">Small</ui-item><ui-item value="m" flag="fr" description="French cut">Medium</ui-item>
</ui-select>
```

- Shadow root:  ONE native `<select class="ui [size state] [compact fluid inverted multiple] select">`.  Where the
  browser has the customizable select (`UI.browser.supports.baseSelect`, and `@supports (appearance: base-select)`
  in `UISelect.css`), it also gets `<button><selectedcontent>` and its picker is styled as the dropdown's menu, with
  option icons, images and flags.  Elsewhere (Safari before 27, Firefox) the SAME markup is a plain select:  the
  closed box looks the same (our caret is two gradients, not `::picker-icon`), the browser's own picker lists each
  option's TEXT (flag emoji, text, description), and icons / images simply drop out -- never a blank option.
- The noun is `select`, not Fomantic's `selection dropdown` (the LOOK is that closed box):  on a page that carries
  both sheets, `.ui.selection.dropdown` would pull the dropdown's rules onto the select.
- Options:  slotted `<ui-item>`s (read as data, as the dropdown reads them) then the `options` property;  a `header`
  item opens an `<optgroup>`, a `divider` item is an `<hr>`.  `value`, `ui-change`, `multiple` (a `FormData` entry
  per value), `required` and form reset work as the dropdown's.
- Single:  an empty first option (the `placeholder`) stands while nothing is chosen, so the browser never quietly
  chooses the first option;  `required` disables it.  `multiple` is a native list box in every browser (the
  customizable picker is single-select).
- Keyboard, type-ahead and screen-reader semantics are the browser's.

### `ui-select` or `ui-dropdown`?

| Use `<ui-select>` when | Use `<ui-dropdown>` when |
|---|---|
| a form field picks from a fixed list | the user types to filter (`search`), adds values (`allow-additions`) or clears (`clearable`) |
| the platform picker matters:  phones' wheels / sheets, native type-ahead, zero-script fallback | chosen values show as labels (`multiple`), or the menu holds rich slotted content |
| icons / flags in options are nice to have, not essential | it isn't a form field:  an action menu, `inline`, `button`, `pointing`, `simple` hover menus |

## Search:  `<ui-search>`, a combobox with results

```html
<ui-search placeholder="Countries" name="country"></ui-search>
<ui-search category url="/api/search?q={query}" min-characters="2"></ui-search>
<script>
  document.querySelector("ui-search").source = [{ title: "France", description: "EU", url: "/fr" }]
</script>
```

- Shadow root:  `<div class="ui [category fluid ...] search">` around Fomantic's `ui icon input` (the text
  `<input class="prompt">` is an APG combobox, `aria-autocomplete="list"`) and a `.results` popover anchored by CSS,
  as the dropdown's menu.  The popover is a `listbox` of `role=option` results (a `category` search:  one named
  `role=group` per category), or the no-results / error message;  a visually hidden `role=status` announces the
  count or the message.
- Results:  the `source` PROPERTY searched locally (`SearchMatcher`:  Fomantic's `searchFields`, `fullTextSearch` as
  `full-text-search="exact | fuzzy | prefix | some | all"`, `ignore-diacritics`, `max-results`), or a remote `url`
  template through `UI.api` (`{query}`;  `search-delay` debounce, a newer query aborts the running one, answers cached
  per query, `loading` while it runs;  Fomantic's response shapes).  Results are Fomantic's `{ title, description,
  image, price, category, url }`;  one with a `url` is a link (`<a class="result" tabindex="-1">`).
- Keys:  arrows move the highlight (`active`, stopping at the ends as Fomantic), Enter chooses it (else submits the
  form), Escape closes the results -- and, when they're already closed, clears the text (APG).
- Choosing:  the cancelable `ui-select` (`{ result }`) first;  then the title goes in the input (`ui-change`), the
  results hide and the `url` is followed (a click on a link follows it natively).  Typing dispatches `ui-search`
  (`{ query }`) once the query is `min-characters` long;  a remote answer, `ui-results`.
- Form-associated (decided 2026-09-30):  Fomantic's search wraps a real `<input>`, which submits its text under its
  name;  so does `<ui-search name>`, with `required`.

## Progress:  `<ui-progress>`, a `progressbar`

```html
<ui-progress value="9" total="20" bar-text="ratio" indicating label="{value} of {total} files"></ui-progress>
<ui-progress value="15,25,35" bar-colors="red green blue" aria-label="Disk usage"></ui-progress>
<ui-progress indeterminate="sliding" color="blue" aria-label="Waiting"></ui-progress>
```

- Shadow root:  Fomantic's markup -- `<div class="ui ... progress" data-percent>`, one `bar` per value (its width
  inline, as Fomantic's JS wrote it), the `bar-text` inside a bar, the `label` under the track -- so `indicating`'s
  `[data-percent^="…"]` rules port unchanged.
- The DOM element is the `progressbar` (internals):  a native `<progress>` can't hold Fomantic's bars, texts, several
  values or the indeterminate looks.  `aria-valuenow` is `value` in `total`'s units (else the percentage),
  `aria-valuetext` the `bar-text` format;  no value while `indeterminate`.  Named by the DOM element's `aria-label`,
  else the label.
- Numbers:  `value` is a share of `total`, or a percentage without one;  `percent` wins over both;  comma lists make
  several bars (`bar-colors` gives each a hue, through the `ui-<hue>` remap class).  `label` fills in `{percent}`,
  `{value}`, `{total}`, `{left}`;  `bar-text="percent | ratio"` uses the vocabulary texts.
- `state="success | warning | error"`;  unset, one bar at 100% is `success` (Fomantic's `autoSuccess`).  `active` is
  only the author's:  Fomantic's JS pulsed every bar between 0 and 100%.
- `indeterminate` (bare, `filling`, `sliding`, `swinging`) with `speed="slow | fast"`;  `attached="top | bottom"`.
- Events after the first render, whatever wrote the numbers:  `ui-change` (`{ percent, percents, value, total }`),
  `ui-complete` on reaching 100.

## Ratings:  `<ui-rating>`, a radio group

```html
<label for="food">Food</label>
<ui-rating id="food" name="food" icon="heart" color="red" max-rating="5" value="3" clearable></ui-rating>
```

- Shadow root:  `<fieldset class="ui ... rating" role="radiogroup">` with one `<label class="[active] icon">` per point,
  each around a native radio (invisible, over the glyph) and the `icon`'s `<svg>` (any `<ui-icon>` name).  Native
  radios in one shadow root ARE a group:  one Tab stop, arrows move and choose (wrapping), Space chooses;  Home / End
  are ours, and Backspace / Delete clear a `clearable` rating (clicking the current point clears it too;  always with
  one point, Fomantic's `clearable: 'auto'`).
- Form-associated:  `value` while above 0, `required`;  the attribute is the starting (and reset) value.
- Fractions (`value="3.5"`) are display:  a `partial` icon (`--full`, the glyph drawn twice, the copy clipped), no radio
  chosen, the group's `aria-description` "Rated 3.5 of 5".
- `readonly` (`read-only` class) is Fomantic's `interactive: false`:  focusable, announced, unchangeable;  `disabled`
  disables the fieldset.  Fomantic's default of 4 points is kept.

## Sliders:  `<ui-slider>`, APG slider thumbs

```html
<ui-slider name="volume" min="0" max="10" value="4" labeled ticked aria-label="Volume"></ui-slider>
<ui-slider name="price" range value="20" end="80" max="100" step="5" aria-label="Price"></ui-slider>
<ui-slider labeled max="4" id="size" aria-label="Size"></ui-slider>
<script>document.getElementById("size").stepLabels = ["XS", "S", "M", "L", "XL"]</script>
```

- Shadow root:  Fomantic's markup (`inner`, `track`, `track-fill`, `thumb`s, `ul.auto.labels`);  thumbs are
  `role=slider` with `aria-value*` (and `aria-orientation` when `vertical`).  A `range` has two, "Minimum" and
  "Maximum", in a `group` named for the DOM element;  each bounds the other.  Labels are `aria-hidden`.
- Positions are CSS:  the element writes ratios (`--_slider-at`, `--_slider-from` / `-to`), `UISlider.css` turns them
  into offsets, so `reversed` / `vertical` need no JS and static markup needs no pixel offsets.
- `value` / `end` are Fomantic's `start` / `end`;  defaults are Fomantic's (`min` 0, `max` 20, `step` 1;  `step="0"`
  allows any value).  Snapping follows `<input type=range>`:  an off-grid `max` isn't reached.
- Keys:  arrows move the thumb the way they point (Fomantic's `keyMovement`:  on a `vertical` slider, min at the top,
  Down increases;  on a `reversed` one, Left does), PageUp / PageDown 2 steps, Home / End the thumb's ends.  Pointer:
  press the track to jump the nearest thumb, drag (pointer capture);  `smooth` glides between steps.
- Events:  `ui-input` per move (auto-controlled:  re-setting `value` / `end` in a handler wins), `ui-change` per key and
  at the end of a drag that moved.  `{ value, end? }`.
- Form-associated:  `value`;  a `range` submits two entries under `name` (`FormComponent`'s multi-value convention) and
  restores them from a saved state.  Labels:  `step-labels` (a property;  Fomantic's `interpretLabel` / letter
  labels), else numbers in the page's format, spaced at least 100px apart (Fomantic's `labelDistance`).

## Accordions:  `<ui-accordion>` of title + content pairs, on native `<details>`

```html
<ui-accordion styled open="0">
  <ui-title>What is a dog?</ui-title>
  <ui-content><p>A domesticated animal.</p></ui-content>
  <ui-title>What kinds of dogs are there?</ui-title>
  <ui-content><p>Many breeds.</p></ui-content>
</ui-accordion>
```

- Children come in PAIRS, Fomantic's `.title` + `.content` one to one:  each `<ui-title>` starts a panel, the element
  after it (usually a `<ui-content>`, any element works) is its content.  No panel element.
- The shadow root wraps each pair in `<details part="panel">` > `<summary class="[active] title">` (an arrow, then the
  title's slot) + `<div class="[active] content">`, handing the two children to their `<slot>`s BY HAND
  (`slotAssignment: "manual"`, `UIComponent`'s `elementSetup.slotAssignment`).  So the platform does the disclosure:
  `<summary>` is a focusable button exposing its expanded state, Enter / Space toggle, find-in-page opens a panel,
  and `exclusive` (the default) is one shared `<details name>` group.  ArrowDown / ArrowUp / Home / End move between
  titles.
- `open` lists the open panels by index (`open="0 2"`;  the first only while `exclusive`), auto-controlled:  a title
  click is intercepted and the cancelable `ui-open` / `ui-close` go first (an exclusive switch announces the close
  too).  `collapsible="no"` keeps the open panel open.
- The summary and content box ARE the boxes:  the accordion doesn't own the `title` / `content` parts, so the
  slotted `<ui-title>` / `<ui-content>` stay plain.  (`UIParts.css`'s `in-accordion` rules are unused by the element.)
- A nested `<ui-accordion>` (`:state(in-accordion)`) renders `accordion` without `ui` and takes its parent's look
  through the inherited `--_ui-accordion-*` aliases (its root declares none), as Fomantic's
  `.ui.styled.accordion .accordion` did.
- Animated where the browser can transition to `auto` (`UI.browser.supports.interpolateSize` => `:state(animated)`,
  `::details-content`);  `prefers-reduced-motion` drops it.
- Static markup:  the same `<details>` grammar works without JS (`.ui.accordion > details > summary.title`), and so
  do Fomantic's flat `.title` + `.content` (shown by `.active`) and 2.9's single `details.ui.accordion`.

## Tabs:  `<ui-tabs>` of `<ui-tab>` panes

```html
<ui-tabs tabular attached aria-label="Profile" history>
  <ui-tab label="Bio" value="bio">...</ui-tab>
  <ui-tab label="Photos" value="photos" icon="image" lazy><template>...</template></ui-tab>
</ui-tabs>
```

- TWO tags, in Fomantic's words:  its `.ui.tab` is the PANE, and the tabs you click are the items of a menu -- so
  `<ui-tab>` is the pane (the plan's `ui-tab-pane`), and `<ui-tabs>` draws the menu from its panes' `label` / `icon`.
  One element per tab keeps label and pane together (nothing to pair up), and the whole APG tablist lives in ONE
  shadow root.  A separate tab-button element would have duplicated the generic `<ui-item>`.
- The tab list is `<div class="ui ... menu" role="tablist">` of `<button role="tab" class="[active] item">`, styled by
  `UIMenu.css` itself (adopted as is, its static `.ui.menu .item` rules):  the look words are the menu's --
  `appearance` (or its boolean aliases `tabular`, `pointing`, `secondary`, `text`), `vertical`, `inverted`, `fluid`,
  `alignment`, `equal`, sizes, colours (see "Menus").  The root is `ui ... tabs`;  the tab list the same words with
  the noun `menu`.  `appearance="segmented" alignment="fluid" equal` is the docs site's own tab bar.
- Panes:  `ui [bottom attached] tab segment` (+ `active`), adopting `UISegment.css`.  `attached` (bare ~== `top`) joins
  the menu and the panes;  `attached="bottom"` puts the menu below.  `basic` / `inverted` reach the panes too.
- Selection:  `value` (a pane's `value`, else its index) is auto-controlled, with a cancelable `ui-change`
  (`{ value, tab }`);  without it, the first `selected` (or `active`) pane, else the first enabled one.
- Keyboard (APG):  one Tab stop, the selected tab;  arrows (Up / Down when `vertical`), Home, End;  `activation=
  "manual"` moves focus only, Enter / Space select.  The shown pane's DOM element is a `tabpanel` and the next Tab stop.
- `history`:  the selection is the URL hash (`#value`, a pushed history entry);  Back / Forward and `#value` links
  select.  The pane swap runs in a View Transition where supported, unless the user prefers reduced motion.
- `lazy` panes stamp their `<template>` children the first time they're shown;  `ui-show` (`{ value, first }`) fires
  each time a pane is shown.

## Toasts:  `<ui-toast>` and `UI.toast()`

```html
<ui-toast type="success" icon header="Saved" message="All changes are saved." closable></ui-toast>
<script>
  UI.toast({ title: "Saved", message: "All good", class: "success", showProgress: "bottom" })
  UI.toast({ message: "Delete?", actions: [{ text: "Yes", class: "positive" }, { text: "No", class: "deny" }] })
</script>
```

- A `<ui-toast>` shows WHERE IT IS;  `UI.toast()` (`ToastStack`, the family's provider for `UI.toasts`) builds one per
  call in a container per `position` -- `<div popover="manual" class="ui top right toast-container" role="region">`,
  the page sheet `UIToast.container.css`, in the top layer and re-shown for each new toast.  `displayTime` defaults
  to Fomantic's 3000ms there;  on the element `display-time` is off unless set (`auto` ~== reading time).
- Shadow:  `floating toast-box [compact]` around `ui [type] [color] [inverted] toast [vertical] [actions] [attached
  top|bottom]`, Fomantic's words.  `type` (`info success warning error neutral`) and `color` remap `--ui-color`;
  `compact` (350px) is the default;  Fomantic's `title` is `header` (the DOM element's `title` is the native tooltip).
- Closing:  the countdown, the close icon (`closable`), a click (`close-on-click`, off with a close icon, actions or
  form controls), Escape while focus is inside, an action, `element.close()`:  the cancelable `ui-close` (`reason`),
  the `scale` exit, `hidden` on the DOM element, `ui-hide`.  `ui-show` after the entry animation.
- Countdown pauses on hover (`pause-on-hover`) and ALWAYS while focus is inside;  `progress="top|bottom"` shows it,
  `data-ui-motion="essential"` so reduced motion keeps it.
- Actions:  `slot="actions"`;  `actions="basic | left | vertical | attached [top]"` (Fomantic's `classActions`).
  Approve / deny classes and `<ui-button positive / negative>` fire the cancelable `ui-approve` / `ui-deny`;  any
  action closes unless its click was `preventDefault()`ed (`click: () => false` in `UI.toast()`).
- Accessibility:  `role=status`, `alert` for `type="error"`;  never takes focus.  KNOWN LIMIT:  while a modal
  `<dialog>` is open the page outside it is inert, containers included -- a toast then still counts down, but can't
  be clicked, focused or announced.

## Nags:  `<ui-nag>`, a dismissible bar that remembers

```html
<ui-nag key="cookies" storage="local" expires="30" fixed><span class="title">We use cookies.</span></ui-nag>
```

- `ui [size] [color] [bottom] [fixed] [inverted] [overlay] nag` around the slot, with a close icon (`closable`,
  default on).  The DOM element is `display: contents`.  A darker default bar than Fomantic's, for contrast.
- Remembering is opt-in:  with `key`, closing stores `value` (default `dismiss`) in `storage` (`local`, `session` or
  `cookie`, Fomantic's default, with `path` / `domain` / `secure` / `samesite`) for `expires` days (`0` never
  expires;  in `localStorage` a `<key>ExpirationDate` item, Fomantic's).  A nag whose dismissal is stored is `hidden`
  before it paints, unless it `persist`s.  Every storage access is guarded:  blocked storage just doesn't remember.
- Events:  `ui-show`;  the cancelable `ui-close` (`reason`:  `close`, `timeout` for `display-time` -- which stores
  nothing -- or `dismiss` for `element.close()`);  `ui-hide` once hidden.  `element.show()`, `element.clear()`,
  `element.dismissed`.

## Sticky:  `<ui-sticky>`, CSS `position: sticky` that reports

```html
<ui-rail position="right"><ui-sticky offset="60">Table of contents</ui-sticky></ui-rail>
```

- `ui [pushing] sticky` IS `position: sticky` (Fomantic's `native` type);  `offset` / `bottom-offset` become `top` /
  `bottom`;  `pushing` also sticks it to the bottom edge.  No scroll listener, no JS positioning.
- The DOM element is `display: contents`:  it sticks within its PARENT (the containing block), whose end pushes it out.
  Fomantic's `context` (any element) has no CSS equivalent:  put the sticky inside the element it belongs to.
- `:state(stuck)` / `:state(bound)` and `ui-stick` / `ui-unstick` (`{ edge }`) come from an `IntersectionObserver`
  on two 1px sentinels, against the nearest scroll container (else the viewport).

## Visibility:  `<ui-visibility>` and `UI.observeVisibility()`

```html
<ui-visibility once="false" offset="60">...</ui-visibility>
<ui-visibility type="image"><img data-src="/photo.jpg" alt="..." width="400" height="300" /></ui-visibility>
<script>
  const stop = UI.observeVisibility(element, { onTopPassed: (c) => ..., onBottomPassed: ..., once: false })
</script>
```

- Fomantic's callbacks on `IntersectionObserver` (`UI.visibility`, a runtime service):  `onOnScreen`, `onOffScreen`,
  `onTopVisible`, `onBottomVisible`, `onTopPassed`, `onBottomPassed`, `onPassing`, their `...Reverse`, `onUpdate`;
  `once` (default, as Fomantic's), `continuous`, `offset`, `context`.  Checks happen at crossings (the element
  entering / leaving, an edge crossing the screen top or bottom), so `continuous` means "each crossing", not "each
  scrolled pixel".
- The element (`ui visibility`, a block) fires them as `ui-visible`, `ui-hidden`, `ui-top-visible`,
  `ui-bottom-visible`, `ui-top-passed`, `ui-bottom-passed`, `ui-passing` (`detail`:  the calculations), and keeps
  `:state(visible)`.
- `type="image"` (`UI.visibility.lazyImage()`):  each `<img data-src>` (and `data-srcset`) inside gets its source on
  screen, preloaded, then fades in (`transition`, `duration`);  `ui-load`.  Native `loading="lazy"` is the
  no-script alternative.

## Embeds:  `<ui-embed>`, nothing loads before the click

```html
<ui-embed source="youtube" video-id="O6Xo21L0ybE" placeholder="/intro.jpg" label="Intro" aspect-ratio="4:3"></ui-embed>
```

- `ui [active] embed [ratio]`:  a play `<button>` (placeholder image, icon, slot) until activated, then `<div
  class="embed"><iframe title="{label}">`.  Ratios by `aspect-ratio` (`16:9` default, `4:3`, `21:9`, `square`).
- Privacy:  no frame, script or preconnect before activation (Fomantic loaded at once without a placeholder);
  YouTube plays from `youtube-nocookie.com`.
- `source` + `video-id` (Fomantic's `data-id`:  `id` is the element's own), or any `http(s)` `url` (other protocols
  are refused);  `autoplay` (default on:  the click asked for it), `branded-ui`, `parameters` (a JSON property).
- Activation:  click / Enter / Space or `element.activate()` fire the cancelable `ui-activate` (`{ url }`), then focus
  moves into the frame;  writing `active` loads without an event;  `element.reset()` (with `ui-reset`) goes back.
- Names:  `Play {label}` on the button and `label` as the frame's `title` (`label`, else `alt`, else `video` /
  `embedded content`), translated texts.

## Calendars:  `<ui-calendar>`, a field and an APG grid

```html
<ui-calendar type="date" value="2026-09-30" min="2026-09-01" today placeholder="Due" name="due"></ui-calendar>
<ui-calendar inline type="month" value="2026-09" aria-label="Billing month"></ui-calendar>

<ui-calendar id="from" end-calendar="to" type="date" placeholder="From"></ui-calendar>   <!-- a range -->
<ui-calendar id="to" start-calendar="from" type="date" placeholder="To"></ui-calendar>
```

- `ui [size color] [inverted compact fluid] calendar [active] [disabled]`:  a `ui left icon input` field whose icon
  is a real `<button>` opening a popover dialog (anchor positioning only, `position="bottom left"` ... flipping), or
  with `inline` the picker in the page.  The picker:  a header row (previous / title / next `<button>`s) ABOVE a
  `<table role=grid class="ui celled center aligned unstackable seven column table day">` -- not Fomantic's
  `<th colspan>` first row, so the grid's rows are its cells' rows -- then a Today / Now button (`today`).
- `type`:  `date`, `time`, `datetime` (Fomantic's default), `month`, `year`.  Values are ISO by type (`2026-09-30`,
  `14:30`, `2026-09-30T14:30`, `2026-09`, `2026`), the native `<input type=date|time|datetime-local|month>` shapes;
  `min` / `max` / `initial-date` take the same.  The value attribute is the starting (and reset) value.
- Views, Fomantic's modes:  years (3 x 4, the decade) => months (3 x 4) => days (7 x 6, constant height) => hours
  (4 x 6) => minutes (3 x 4, 5-minute steps), as far as `type` goes;  `disable-minute` / `disable-month` /
  `disable-year` skip one.  Choosing a coarser cell opens the next view, the finest sets the value;  the title
  goes back up.
- Dates are `Temporal` (`UI.i18n.temporal`):  native, else `temporal-polyfill` from a lazy chunk (`docs/runtime.md`).
  Names, text formats and the 12 / 24-hour clock come from `Intl` in `locale` (default `UI.i18n.locale`);  the first
  weekday from `Intl.Locale` week info unless `first-day-of-week` (`0` = Sunday) says.
- Typing:  the field reads ISO, the locale's numeric order (`9/30/2026`, `30.9.2026`), month names or 3+ letter
  prefixes, `h:mm` with the locale's day periods (or `am` / `pm`) and its own output;  unreadable or out-of-range text
  reverts on `change` / Enter.
- Disabled cells:  outside `min` / `max`, the `disabledDates` / `disabledDaysOfWeek` PROPERTIES, and other months'
  days (unless `select-adjacent-days`).  They stay focusable (APG) but can't be chosen.
- Ranges, Fomantic's `startCalendar` / `endCalendar`:  `start-calendar="id"` makes this calendar the END (the
  partner's value is its minimum), `end-calendar="id"` the START;  the span between them gets `range`.  The
  partner (an id in the same tree) is read through its component, so it follows live.
- Keyboard (WAI-ARIA APG date picker dialog):  one real tab stop in the grid (the `focus` cell);  arrows, Home / End
  (the week), PageUp / PageDown (a month;  + Shift a year), Enter / Space choose;  ArrowDown in the field or the
  icon button opens with focus in the grid, a click in the field opens and leaves focus there for typing;  Escape
  (`UI.overlays`) closes and focus returns;  focus moving out of the element closes.  Month / year grids page by a
  year / decade.
- ARIA:  `role=grid` named by the title (a `time` grid by "Hours" / "Minutes"), `gridcell`s with the whole date as
  `aria-label`, `aria-selected`, `aria-disabled`, `aria-current="date"` on today;  weekday heads `<th abbr>`.
- `ui-change` (`{ value }`), `ui-open` / `ui-close`:  all cancelable, before the change.

## State:  `<ui-button active-text inactive-text>`

```html
<ui-button toggle inactive-text="Follow" active-text="Following"></ui-button>
```

- Fomantic's `state` behaviour (`$('.button').state({ text: { inactive, active } })`) is two `<ui-button>` attributes,
  not an element:  the button already toggles `active` (`toggle`, `ui-toggle`), so only the texts were missing.
  The state text replaces the content while it applies;  with one of the two, the content shows in the other state.
- With a state text the label SAYS the state, so a `toggle` leaves `aria-pressed` off (WAI-ARIA APG:  a toggle
  button's label must not change).
- Not ported:  the hover texts (`activate` / `deactivate` / `hover`:  the name would change under the pointer),
  `flash`, `sync` across buttons, the API-request states and the `automatic` defaults for inputs / progress.
