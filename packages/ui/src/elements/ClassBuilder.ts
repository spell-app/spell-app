// Import directly to avoid circular import
import { proto } from "$/ui/util"
import { E } from "$/ui/core"

/****************
 * ### `ClassBuilder`
 * Turns a component's property values into its canonical Fomantic class string, e.g. `ui small red basic button`.
 * - Why:  shadow markup keeps Fomantic's class grammar (`<button class="ui small primary button">`),
 *   so the CSS is a mechanical port of the `.less`,
 *   and multi-word phrases (`[class*="four wide"]`) need a fixed order.
 * - Semantics are SUI React's `classNameBuilders.js` exactly:
 *   `useKeyOnly`, `useValueAndKey`, `useKeyOrValueAndKey`, `useMultipleProp`, `useWidthProp`, `useTextAlignProp`,
 *   `useVerticalAlignProp`.
 * - Fixed order, as Fomantic writes it (`ui primary icon button`;  see `docs/grammar.md`):
 *   `ui`, size, color, keyOnly (alphabetical), valueAndKey / keyOrValueAndKey (vocabulary order),
 *   multiple, width, textAlign, verticalAlign, `extra`, noun (the vocabulary's, or `options.noun`).
 * - The constructor sorts the vocabulary ONCE;  `build()` only walks that list and fills one array.
 * - Reads attribute names and CSS keys from the vocabulary, never literals.
 *   The grammar's own connective words (`aligned`, `wide` ...) are `@proto static grammar`.
 * - No DOM, no Solid:  of the core (`E`), it uses only the foundation (`E.ValueSets`, `E.Warnings`),
 *   NEVER an element class.
 ****************/
export class ClassBuilder {
  /** Fomantic's connective words -- grammar, not vocabulary, so they never translate. */
  declare grammar: E.ClassGrammar

  /** The grammar's English words;  `@proto static`:  the same for every builder, and on the prototype once. */
  @proto static grammar: E.ClassGrammar = {
    ui: "ui",
    medium: "medium",
    aligned: "aligned",
    justified: "justified",
    wide: "wide",
    equal: "equal",
    equalWidth: "equal width"
  }

  /** Vocabulary it builds for. */
  readonly vocabulary: E.ComponentVocabulary

  /** Class-emitting attributes in output order. */
  private readonly specs: readonly E.AttributeSpec[]

  /** CSS key per entry of `specs`, e.g. `pointing`, `very basic`. */
  private readonly keys: readonly string[]

  constructor(vocabulary: E.ComponentVocabulary) {
    this.vocabulary = vocabulary
    this.specs = [
      ...byKind("size"),
      ...vocabulary.attributes.filter((spec) => spec.kind === "color" || spec.kind === "valueOnly"),
      ...byKind("keyOnly").sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0)),
      ...vocabulary.attributes.filter((spec) => spec.kind === "valueAndKey" || spec.kind === "keyOrValueAndKey"),
      ...byKind("multiple"),
      ...byKind("width"),
      ...byKind("textAlign"),
      ...byKind("verticalAlign")
    ]
    this.keys = this.specs.map((spec) => spec.key ?? spec.name.replaceAll("-", " "))

    /** `vocabulary`'s attributes of `kind`, in vocabulary order. */
    function byKind(kind: E.AttributeSpec["kind"]) {
      return vocabulary.attributes.filter((spec) => spec.kind === kind)
    }
  }

  ////////////////
  // ## Build
  ////////////////

  /**
   * Class string for `values` (canonical attribute name => property value).
   * - Missing / falsy values emit nothing;  `size: "medium"` emits nothing.
   * - SIDE EFFECT (dev only):  warns on unusable widths, and on widths that aren't whole columns.
   */
  build(values: E.ClassInput, options: E.ClassBuildOptions = {}): string {
    const { grammar, specs, keys } = this
    const classes: string[] = this.vocabulary.ui === false ? [] : [grammar.ui]
    for (let index = 0; index < specs.length; index++) {
      const spec = specs[index]
      const value = values[spec.name]
      if (!value) continue
      const key = keys[index]
      // `true` means "bare";  anything that isn't a string / number / array emits nothing.
      const text = value === true ? undefined : ClassBuilder.text(value)
      if (value !== true && text === undefined) continue
      switch (spec.kind) {
        case "size":
          if (text && text !== grammar.medium) classes.push(text)
          break
        case "color":
        case "valueOnly":
          if (text) classes.push(text)
          break
        case "keyOnly":
          classes.push(key)
          break
        case "valueAndKey":
          if (text) classes.push(`${text} ${key}`)
          break
        case "keyOrValueAndKey":
          classes.push(text ? `${text} ${key}` : key)
          break
        case "multiple":
          if (text) this.pushMultiple(classes, text, key)
          break
        case "width":
          if (text) this.pushWidth(classes, text, spec)
          break
        case "textAlign":
          if (text === grammar.justified) classes.push(grammar.justified)
          else if (text) classes.push(`${text} ${grammar.aligned}`)
          break
        case "verticalAlign":
          if (text) classes.push(`${text} ${grammar.aligned}`)
          break
      }
    }
    if (options.extra) classes.push(options.extra)
    classes.push(options.noun ?? this.vocabulary.noun)
    return classes.join(" ")
  }

  ////////////////
  // ## Internals
  ////////////////

  /**
   * `useMultipleProp`:  `"mobile tablet"` + `only` => `mobile only tablet only`.
   * - `large screen` and `<device> vertically` stay single tokens:  `computer vertically reversed`.
   * - An array of tokens arrives space-joined (`text()`).
   */
  private pushMultiple(classes: string[], text: string, key: string) {
    const words = text.trim().split(E.WHITESPACE)
    for (let index = 0; index < words.length; index++) {
      let token = words[index]
      if (token === "large" && words[index + 1] === "screen") token = `${token} ${words[++index]}`
      else token = token.replace("-", " ")
      if (words[index + 1] === "vertically") token = `${token} ${words[++index]}`
      classes.push(`${token} ${key}`)
    }
  }

  /**
   * `useWidthProp`, plus fractions and percentages:  `4` / `"4"` / `"four"` / `"1/4"` / `"25%"` => `four wide`.
   * - `widthClass` from the spec (default `wide`);  `""` emits the bare word.
   * - `"equal"` => `equal width` when the spec allows it (`canEqual`).
   * - Inexact values snap to the nearest column, with a dev warning.
   */
  private pushWidth(classes: string[], value: string, spec: E.AttributeSpec) {
    const { grammar } = this
    if (value === grammar.equal && spec.canEqual) {
      classes.push(grammar.equalWidth)
      return
    }
    const columns = E.ValueSets.columns(value)
    const rounded = columns === undefined ? 0 : Math.round(columns)
    const source = `<${this.vocabulary.tag} ${spec.name}>`
    if (!E.ValueSets.isColumnCount(rounded)) {
      E.Warnings.devWarn(source, `${JSON.stringify(value)} is not a width of 1..16 columns`)
      return
    }
    if (rounded !== columns) {
      E.Warnings.devWarn(source, `${JSON.stringify(value)} is ${columns!.toFixed(2)} of 16 columns;  using ${rounded}`)
    }
    const word = E.numberToWord(rounded)!
    const widthClass = spec.widthClass ?? grammar.wide
    classes.push(widthClass ? `${word} ${widthClass}` : word)
  }

  /**
   * `value` as class text:  strings as-is, numbers stringified, arrays space-joined;  else `undefined`.
   * - Static:  pure, no builder state.
   */
  private static text(value: unknown): string | undefined {
    if (typeof value === "string") return value
    if (typeof value === "number") return String(value)
    if (Array.isArray(value)) return value.map((item) => ClassBuilder.text(item) ?? "").join(" ")
    return undefined
  }
}
