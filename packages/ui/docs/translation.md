# Translation contract

Designed now, built later:  the same components under translated names.
- E.g. `<ie-tarjeta color="rojo" tamano="grande">` ~== `<ui-card color="red" size="big">`.

The code is in [the vocabulary folder](../src/vocabulary/):
- [`vocabulary.types.ts`](../src/vocabulary/vocabulary.types.ts):  the schema, `Dictionary`
- [`Vocabulary`](../src/vocabulary/Vocabulary.ts):  the registry + resolver
- [`ValueSets`](../src/vocabulary/ValueSets.ts):  shared values
- [`Converters`](../src/vocabulary/Converters.ts)

## The pieces

- **Vocabulary**:  each component's `UI<Name>.en.ts` (named for its language) declares EVERY name it uses.
  - tag, noun, attributes (kind + allowed values), events, slots, parts, states, text strings, owned parts
  - Templates and `ClassBuilder` read names through it, never literals.
- **Value sets**:  values shared across components live once, in `ValueSets`.
  - hues, sizes, positions, alignments, floats, widths, devices, booleans
  - So a dictionary translates `red` once, for every component.
- **Dictionary**:  a translation, canonical English name => localized name.
  - Missing entries fall back to canonical,
    so the English identity dictionary is just `{ lang: "en" }`.

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

- The prefix applies to tags AND events:  `ie-tarjeta`, `ie-cambio`.
  - Defaults:  `ui`, and the English identity.
  - Only Spell UI's own events (`ui-*`) take the prefix untranslated:
    another package's tag (a component pack's `<spell-app>`) keeps its own (`spell-open`),
    unless the dictionary translates it.
- `define()` throws on collisions:  two attributes / values / components landing on one localized name.
  - Why:  one of them would become unreachable in that language.
- Canonical attribute aliases (`checked` for `selected`) stay accepted, untranslated.
- The attributes EVERY element shares (`SharedVocabulary`) are named once per language, in a small file of their own.
  - So `<ie-boton desactivado>` is disabled.
  - The file:  `SharedVocabulary.<lang>.ts`, in [the vocabulary folder](../src/vocabulary/).
  - Spanish, [`SharedVocabulary.es.ts`](../src/vocabulary/SharedVocabulary.es.ts):

    ```ts
    { disabled: "desactivado", loading: "cargando", visible: "visible", animation: "animacion" }
    ```

  - Every dictionary of that `lang` reads it, for every tag.
    The dictionary's own `attributes` (or `components[tag]`) win over it.
  - The same word names a tag's OWN `disabled` too (`<ui-button>`'s):  one word means disabled on every tag.
  - Their states stay English (`:state(disabled)`), as every state does.
- `multiple` values translate token by token, with multi-word tokens (`large screen`) kept whole.

How the runtime will use it (not built yet):

1. `UI.vocabulary.defineComponents({ prefix: "ie", dictionary: es })` calls `define()`.
2. For each `LocalizedVocabulary`, it defines a SUBCLASS of the canonical element under the localized tag,
   whose `observedAttributes` are the localized attribute names.
3. `attributeChangedCallback` runs `canonicalize()` first, then the ordinary converters.
   - So everything inside the element is canonical:  properties, `ClassBuilder`, CSS, `:state()`s.
4. Rendering uses the inverse maps:
   - the localized slot name, on `<slot name>`
   - the localized event name, in `send()`
   - the localized part, ADDED next to the canonical one:  `part="header encabezado"`

## Topics and other names

- A vocabulary's `topics` are ids from `ValueSets.topics`, translated ONCE, like any shared value.
  - In `Dictionary.values.topics`:  `{ forms: "formularios", "date & time": "fecha y hora" }`.
- `aka` (other names people search by) is per tag and per language.
  - `ComponentDictionary.aka` replaces the English list:
    `components: { "ui-modal": { aka: ["diálogo", "ventana emergente"] } }`.

## Emoji names (name sets built, translations planned, 2026-10-01)

`<ui-emoji name>` takes an OPEN set of ~5,000 values:  too many for a `Dictionary`.

- Today:  two NAME SETS, never merged, picked page-wide like icon packs (`EmojiData.use()`, `<ui-root emoji>`).
  - `cldr`:  English CLDR shortcodes, the default
  - `fomantic`:  Fomantic's names
  - Each is `<set>/<chunk>.json` in [the emoji data](../src/components/ui-emoji/data/):
    name => emoji, one chunk per first letter.
  - Generated by [`gen-emoji.ts`](../scripts/gen-emoji.ts), loaded lazily by `EmojiData`.
- A translated set becomes another value of `names` (`names="es"`), from emojibase's `es` data.
- The plan:  the same generator writes `<lang>/<chunk>.json` into the emoji data.
  - From `emojibase-data`'s `cldr.json`, in its `<lang>/shortcodes/`.
  - 30 languages ship:  `es` has `perro`, `pulgar_hacia_arriba`, `cohete`.
  - `EmojiData` looks a name up in the element's dictionary language first, then English.
    So `name="dog"` keeps working in a translated page.
- Open:
  - chunk by the localized name's first letter?  Accents (`ñ`, `é`):  their own chunks, or folded?
  - which languages ship by default?  Each adds ~39 kB gzip of chunks, loaded one at a time.

## What stays canonical

- CSS classes (`ClassBuilder` output):  the CSS is a port of Fomantic's `.less`, and never translates.
- Custom states (`:state(open)`, `:state(in-card)`):  a CSS contract.
- JS property names (`el.selected`, `el.options`):  code, not markup.  Frameworks bind them by name.
- `event.detail` keys (`{ value, open }`).
- Tokens (`--ui-*`), and utility classes (`ui-stack`).
- Part names:  the canonical part is always present.  Translation only adds.
- Text strings are NOT in the dictionary:  `UI.i18n` owns them (`TextSpec` keys), with `Intl` formatting.
  - Keys are SCOPED per component:
    a vocabulary's texts are that component's English defaults, under its canonical tag.
    - So two families may share a key:  `label` is "Table" for `<ui-table>`, "Breadcrumb" for `<ui-breadcrumb>`.
    - No prefixing needed.
  - A translation registers a key SHARED, for every component using it:
    `UI.i18n.register("es", { label: "Etiqueta" })`.
  - Or for one component, which wins:  `UI.i18n.register("es", { label: "Migas" }, "ui-breadcrumb")`.
  - Any registered string beats the English defaults, `en` included (an app rewording a default).

## Open questions

- Events:  dispatch only the localized name, or both localized and canonical?
  - Both is friendlier to mixed-language apps, but doubles listeners' work.
  - The current resolver returns only the localized name.
- Should a localized element also accept canonical attribute names (`<ie-tarjeta size="big">`)?
  - Currently NO (strict), to keep one spelling per language:
    `canonicalize("ie-tarjeta", "size")` is `undefined`.
- Case and accents in localized values:
  - `tamaño` / `pequeño` are valid attribute VALUES.
  - But attribute NAMES must stay ASCII-safe, for `setAttribute` in all frameworks.
  - Decide whether dictionaries may use `ñ` in names.
- Reflection:  when a localized element reflects `selected`, it must write the LOCALIZED attribute name.
  - The inverse maps cover it.
  - But Lit's `@property({ attribute })` is fixed at class definition:
    the translated subclass must redeclare properties (a spike question).
- Custom-elements manifest / IDE data per language:  generate one manifest per dictionary?
- Where dictionaries live:
  - `UI<Name>.<lang>.ts` per component, merged into one `Dictionary`:
    `UIButton.es.ts` beside `UIButton.en.ts`, as planned
  - or one file per language?
  - The `components` section supports both.
- `ValueSets.add()` at runtime (theme hues), after `define()`:
  the translated maps won't include the new hue until `define()` runs again.
