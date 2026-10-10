# Native fallbacks

What a FORM CONTROL shows when its real render throws.
- It's plain DOM, no Solid, so it renders whatever broke the Solid render.
- And the form around it keeps working.

## Which families have one

Only the form controls.
- Owen, epic `wwod-spell-ui` P15:  "ditch the fallback stuff unless it's necessary for e.g. form functionality".
- A broken control without one would drop its value from the form, its validity and its reset.
- A broken anything-else only loses its look and behaviour.

| Family | Why it keeps a fallback |
| ------ | ----------------------- |
| `ui-button` | a `type="submit"` / `"reset"` button still submits (with its `name=value`) or resets its form |
| `ui-input` (input + textarea) | its value is still submitted, validated (`required`, `pattern` ...) and typed into |
| `ui-checkbox` (checkbox, radio;  a `toggle` is a checkbox) | its checked state and value are still submitted, validated and changed |
| `ui-dropdown` | a native `<select>` keeps the chosen value(s) in the form, with `required` validity |
| `ui-select` | the same native `<select>`:  the value is still submitted and validated |
| `ui-search` | a native `type=search` input keeps the typed value in the form, with `required` validity |
| `ui-calendar` | the browser's own date / time input keeps the ISO value in the form, with `min` / `max` / `required` |
| `ui-slider` | native range input(s) keep the value (two for a `range`) in the form |
| `ui-rating` | native radios keep the chosen number in the form, with `required` validity |
| `ui-brand-color-picker` (brand) | the browser's colour input keeps `#RRGGBB` in the form |
| `ui-brand-composer` (brand) | a native `<textarea>` keeps the spell in the form;  its button still casts and submits |

Considered and left out:

- `ui-form` / `ui-field` / `ui-fields`:  the controls are the page's light DOM,
  so a bare `<slot>` still shows them, each with its own fallback.
  - The native `<form>` around them still submits.
  - Lost:  the layout classes, and `disabled` making the box `inert`.
    A `<fieldset disabled>` still disables the controls in it.
- `ui-brand-field`:  layout around a slotted control, as `ui-field`.
- Content from attributes:  not form functionality.  A broken one shows its children only.
  - `ui-image`'s `<img>`, `ui-icon`, `ui-flag`
  - the `header` / `message` shorthands
- Dialogs (`ui-modal`, `ui-flyout`, `ui-sidebar`):  their content is the page's light DOM,
  so a bare `<slot>` shows it in place, without the dialog.

Every other family has none.
- When it breaks, it shows a bare `<slot>` (`UIComponent.renderFallback()`), so its children still show.
- Tested by the case "a family without a fallback ..." in [the fallback cases](../test/fallback.cases.ts).

## API

```ts
// src/elements/NativeFallback.ts
static render({ domElement, root, error?, internals? }): NativeFallbackHandle
// handle: { dispose(): void, degraded: readonly string[] }
```

- One `NativeFallbackProps` object, the constructor's too:
  `new ButtonFallback({ domElement, root, error, internals })`.
- A class serving several tags sets `@proto static vocabularies`, the first the default.
  - The base picks the DOM element's tag's into `vocabulary`, so no subclass needs a constructor for it.
- `root.replaceChildren(...)`:  the component's adopted sheets stay,
  so the same `ui-*` classes and `part`s style the fallback.
- With `internals`, it adds the custom state `errored`, for page styling.
- Form-associated DOM elements get real form behaviour, through `internals`.
  - That's `elementSetup.isAFormControl`:  the platform's `formAssociated`.
- The classes, each in its family's `UI<Name>.fallback.ts`:
  - `ButtonFallback`
  - `InputFallback`:  input + textarea
  - `CheckboxFallback`:  checkbox + radio
  - `DropdownFallback`, `SelectFallback`, `SearchFallback`
  - `CalendarFallback`, `SliderFallback`, `RatingFallback`
  - brand's `BrandColorPickerFallback`, `BrandComposerFallback`
- It reads canonical English attribute names:  a translated element maps them back first.
  - Booleans go through `Converters` (`disabled="no"` is false).

## What each keeps and what degrades

| Family    | Keeps                                                                                       | Degrades                                                                                                                                        |
| --------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| button    | `<button>` / `<a href>`, class grammar, `part`, `aria-*`, disabled, submit / reset with `name=value`, toggle `aria-pressed` + `active` | `ui-toggle` event, icon glyph and icon / label slots, joined `label`, `animated`, spinner;  a `click` handler on the element cannot `preventDefault()` submit |
| dropdown  | native `<select>` (`multiple`, placeholder option, optgroups), options from property and `<ui-item>`s, form value (`FormData` for multiple), validity, `domElement.value`, `ui-change` | search, `allow-additions`, `clearable`, `max-selections`, multiple-value labels, option icon / image / description, combobox keyboard pattern (native select's instead), `ui-open` / `-close` / `-search` / `-add` / `-remove`;  `readonly` becomes a disabled select |
| input     | `div.ui.input` + native `<input>` / `<textarea>` with the constraints, `label` shorthand as a joined label, form value + native validity, `domElement.value`, `ui-input` / `ui-change` | icon glyph and `icon` / `label` / `action` slots, corner labels, `rules`, `:state(invalid)`, value reset, Enter submission, `<label for>` names |
| checkbox  | `div.ui.checkbox` + native checkbox / radio + `<label for>` around the slot, `role=switch` toggles, form value + validity, `domElement.selected`, `ui-change`, `readonly` | radio grouping across elements and arrow keys, vetoing `ui-change`, `:state(invalid)`, state reset, `<label for>` names |
| select    | the same native `<select>` in the class grammar (options, `<optgroup>`s, `<hr>` dividers, the placeholder option, `multiple`), flags and descriptions as option text, form value (`FormData` for multiple) + `required` validity, `domElement.value`, `ui-change` | the customizable picker and option icons / images, host `<label for>` naming, `:state(invalid)` / `:state(customizable)`, vetoing a change |
| search    | `div.ui.search` > `div.ui.icon.input` > a native `type=search` `input.prompt` with a `<datalist>` of the local `source` titles, form value + `required` validity, `domElement.value`, `ui-change` | remote `url` results, descriptions / images / prices / categories, Fomantic's matching, `ui-search` / `ui-select` / `ui-results` / `ui-open` / `ui-close`, following a `url`, the icon and spinner |
| calendar  | `div.ui.calendar` + `div.ui.input` around the browser's own `<input type=date\|time\|datetime-local\|month>` (a `number` for `year`) holding the same ISO value, `min` / `max` / `required`, form value + native validity, `domElement.value`, `ui-change` | the grid and its keyboard pattern (the native picker's instead), `inline`, `today`, `locale`, `first-day-of-week`, disabled dates / weekdays, ranges, vetoing `ui-change`, `ui-open` / `ui-close`, form reset of the value |
| slider    | native `<input type="range" part="thumb">`s (two for a `range`, named "Minimum" / "Maximum"), form value (two entries under `name` for a range), `domElement.value` / `end`, `ui-input` / `ui-change` | Fomantic's track, fill and thumbs, `labeled` / `ticked` labels, `vertical` / `reversed`, `smooth`, `step-labels`, vetoing a change, form reset, translated thumb names |
| rating    | a `<fieldset role="radiogroup">` of visible native radios, numbered, form value + `required` validity, `domElement.value`, `ui-change` | icon glyphs, colours, sizes, hover preview, partial icons, `clearable`, Home / End, vetoing a change, `:state(invalid)`, form reset, `<label for>` names |

Everywhere:
- `aria-labelledby` / `aria-describedby` idrefs dangle:  they can't cross the shadow boundary.
- Properties other than dropdown `value` / `options` are not read:  only reflected attributes.

## Bytes

How it was measured:  esbuild, minify, `target es2022`, gzip level 9.
- "Net" excludes what the real element already ships:
  - the lowered-decorator helpers (about 2046 min / 1188 gzip, shared once per bundle)
  - shared code:  `$/ui/util`, `$/ui/vocabulary`, `ClassBuilder`, the family's vocabulary
- Measured before P15 dropped the non-form fallbacks.

| Piece                       | min (B) | gzip (B) | net gzip (B) |
| --------------------------- | ------: | -------: | -----------: |
| `NativeFallback` (base)     |    3976 |     1990 |          802 |
| button                      |    3553 |     1863 |          675 |
| dropdown                    |    4845 |     2434 |         1246 |

Bundled standalone, with everything it needs (base, `ClassBuilder`, `$/ui/util`, vocabulary):
- button is 6.7 kB gzip
- dropdown is 8.3 kB
