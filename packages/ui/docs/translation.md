# Translation contract

Designed now, built later: the same components under translated names, e.g.
`<ie-tarjeta color="rojo" tamano="grande">` ~== `<ui-card color="red" size="big">`.

Code: `src/vocabulary/` -- `vocabulary.types.ts` (schema, `Dictionary`), `Vocabulary.ts` (registry +
resolver), `ValueSets.ts` (shared values), `Converters.ts`.

## The pieces

- **Vocabulary** -- each component's `UI<Name>.en.ts` (named for its language) declares EVERY name it uses:
  tag, noun, attributes (kind + allowed values), events, slots, parts, states, text strings, owned parts.
  Templates and `ClassBuilder` read names through it, never literals.
- **Value sets** -- values shared across components (hues, sizes, positions, alignments, floats, widths,
  devices, booleans) live once in `ValueSets`, so a dictionary translates `red` once for every component.
- **Dictionary** -- a translation: canonical English name => localized name.  Missing entries fall back to
  canonical, so the English identity dictionary is just `{ lang: "en" }`.

```ts
const es: Dictionary = {
  lang: "es",
  tags: { "ui-card": "tarjeta" },              // canonical tag  => localized STEM
  attributes: { size: "tamano" },              // name => name, every component
  values: {
    hues: { red: "rojo" },                     // per shared value set
    sizes: { big: "grande" },
    booleans: { yes: "si" }
  },
  events: { "ui-change": "cambio" },           // canonical event => localized STEM
  slots: { header: "encabezado" },
  parts: { header: "encabezado" },
  components: {                                // per-component overrides + inline enums
    "ui-button": { values: { animated: { fade: "desvanecer" } } }
  }
}
```

## `define(prefix, dictionary)`

```ts
const vocabulary = new Vocabulary()
vocabulary.register(cardVocabulary)            // every component registers its English vocabulary
const es = vocabulary.define("ie", spanish)    // Map<canonical tag, LocalizedVocabulary>
es.get("ui-card").tag                          // "ie-tarjeta"
es.get("ui-card").attributes.get("tamano")     // the `size` AttributeSpec
es.get("ui-card").values.get("color").get("rojo")   // "red"
es.get("ui-card").events.get("ie-cambio")      // the `ui-change` EventSpec
vocabulary.canonicalize("ie-tarjeta", "tamano", "grande")  // { attribute: "size", value: "big" }
vocabulary.localize("ie-tarjeta", "size", "big")           // { attribute: "tamano", value: "grande" }
```

- The prefix applies to tags AND events: `ie-tarjeta`, `ie-cambio`.  Defaults: `ui` + English identity.
  - Only Spell UI's own events (`ui-*`) take the prefix untranslated:  another package's tag (a component pack's
    `<spell-app>`) keeps its own (`spell-open`), unless the dictionary translates it.
- `define()` throws on collisions (two attributes / values / components landing on one localized name),
  since one of them would become unreachable in that language.
- Canonical attribute aliases (`checked` for `selected`) stay accepted, untranslated.
- The attributes EVERY element shares (`disabled`, `loading`, `visible`:  `SharedVocabulary`) are named once per
  language, in a small file of their own:  `src/vocabulary/SharedVocabulary.<lang>.ts` (`SharedVocabulary.es.ts`:
  `{ disabled: "desactivado", loading: "cargando", visible: "visible" }`), so `<ie-boton desactivado>` is disabled.
  - Every dictionary of that `lang` reads it, for every tag;  the dictionary's own `attributes` (or
    `components[tag]`) win over it.
  - The same word names a tag's OWN `disabled` too (`<ui-button>`'s), so one word means disabled on every tag.
  - Their states stay English (`:state(disabled)`), as every state does.
- `multiple` values translate token by token, multi-word tokens (`large screen`) kept whole.

How the runtime will use it (not built yet):

1. `UI.vocabulary.defineComponents({ prefix: "ie", dictionary: es })` calls `define()`.
2. For each `LocalizedVocabulary` it defines a SUBCLASS of the canonical element under the localized tag,
   whose `observedAttributes` are the localized attribute names.
3. `attributeChangedCallback` runs `canonicalize()` first, then the ordinary converters, so everything
   inside the element -- properties, `ClassBuilder`, CSS, `:state()`s -- is canonical.
4. Rendering uses the inverse maps: the localized slot name on `<slot name>`, the localized event name in
   `send()`, the localized part ADDED next to the canonical one (`part="header encabezado"`).

## Topics and other names

- A vocabulary's `topics` are ids from `ValueSets.topics`, translated ONCE like any shared value:
  `Dictionary.values.topics` (`{ forms: "formularios", "date & time": "fecha y hora" }`).
- `aka` (other names people search by) is per tag and per language:  `ComponentDictionary.aka` replaces the English list
  (`components: { "ui-modal": { aka: ["diálogo", "ventana emergente"] } }`).

## Emoji names (name sets built, translations planned, 2026-10-01)

`<ui-emoji name>` takes an OPEN set of ~5,000 values, too many for a `Dictionary`.

- Today:  two NAME SETS, never merged, picked page-wide like icon packs (`EmojiData.use()`, `<ui-root emoji>`):
  `cldr` (English CLDR shortcodes, the default) and `fomantic` (Fomantic's names).
  Each is `src/components/ui-emoji/data/<set>/<chunk>.json` (name => emoji, one chunk per first letter),
  generated by `scripts/gen-emoji.ts`, loaded lazily by `EmojiData`.
- A translated set becomes another value of `names` (`names="es"`), from emojibase's `es` data.
- Plan:  the same generator writes `data/<lang>/<chunk>.json` from `emojibase-data`'s `<lang>/shortcodes/cldr.json`
  (30 languages ship:  `es` `perro`, `pulgar_hacia_arriba`, `cohete`);  `EmojiData` looks a name up in the
  element's dictionary language first, then English (so `name="dog"` keeps working in a translated page).
- Open:  chunk by the localized name's first letter (accents:  `ñ`, `é` -> their own chunks, or folded?);
  which languages ship by default (each adds ~39 kB gzip of chunks, loaded one at a time).

## What stays canonical

- CSS classes (`ClassBuilder` output) -- the CSS is a port of Fomantic's `.less` and never translates.
- Custom states (`:state(open)`, `:state(in-card)`) -- a CSS contract.
- JS property names (`el.selected`, `el.options`) -- code, not markup;  frameworks bind them by name.
- `event.detail` keys (`{ value, open }`).
- Tokens (`--ui-*`) and utility classes (`ui-stack`).
- Part names: the canonical part is always present;  translation only adds.
- Text strings are NOT in the dictionary: `UI.i18n` owns them (`TextSpec` keys), with `Intl` formatting.
  - Keys are SCOPED per component:  a vocabulary's texts are that component's English defaults, under its
    canonical tag, so two families may share a key (`label` is "Table" for `<ui-table>`, "Breadcrumb" for
    `<ui-breadcrumb>`).  No prefixing needed.
  - A translation registers a key SHARED (`UI.i18n.register("es", { label: "Etiqueta" })`, every component
    using it) or for one component (`UI.i18n.register("es", { label: "Migas" }, "ui-breadcrumb")`, which wins).
  - Any registered string beats the English defaults, `en` included (an app rewording a default).

## Open questions

- Events: dispatch only the localized name, or both localized and canonical?
  - Both is friendlier to mixed-language apps but doubles listeners' work.
  - Current resolver returns only the localized name.
- Should a localized element also accept canonical attribute names (`<ie-tarjeta size="big">`)?
  Currently NO (strict): `canonicalize("ie-tarjeta", "size")` is `undefined`, to keep one spelling per language.
- Case and accents in localized values: `tamaño` / `pequeño` are valid attribute VALUES, but attribute NAMES
  must stay ASCII-safe for `setAttribute` in all frameworks -- decide whether dictionaries may use `ñ` in names.
- Reflection: when a localized element reflects `selected`, it must write the LOCALIZED attribute name;
  the inverse maps cover it, but Lit's `@property({ attribute })` is fixed at class definition --
  the translated subclass must redeclare properties (spike question).
- Custom-elements manifest / IDE data per language: generate one manifest per dictionary?
- Where dictionaries live: `UI<Name>.<lang>.ts` per component (`UIButton.es.ts` beside `UIButton.en.ts`, as planned) merged into one
  `Dictionary`, or one file per language?  The `components` section supports both.
- `ValueSets.add()` at runtime (theme hues) after `define()`:
  translated maps won't include the new hue until `define()` runs again.
