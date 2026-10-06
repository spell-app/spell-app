import { SSR } from "$/ui/static"
// Import directly to avoid circular import:  the constants below the class read them
import { ROOT, SLOTTED } from "./static.types.server"

/****************
 * ### `StaticSelectors`
 * Rewrites one shadow-DOM selector for the flattened, light-DOM output (`StaticFlattener`), inside the
 * `@scope` its sheet is wrapped in (`StaticStylesheet`), where `:scope` is the component's root.
 * - `:host(X) > C tail` => `:scope:is(X):is(C) tail`:  the root REPLACES the host, so a host condition and the
 *   root's own compound land on the same element (host attributes, classes and states moved onto the root)
 * - `:host(X) D tail` (descendant) => both `:scope:is(X) D tail` and `:scope:is(X):is(D) tail`:  the root was
 *   itself a descendant of the host
 * - `:host(X)` alone => `:scope:is(X)`, flagged `hostOnly`:  its `display` is the host box's, not the root's
 * - `:state(x)` => `[data-state~="x"]`, the flattener's attribute for host states
 * - `::slotted(X)` => `X`:  slotted nodes are now plain children where the slot was;  alone, `:scope > X`
 * - `slot` (the element) => `[data-ui-slotted]`:  its token resets reach the assigned nodes, as inheritance through
 *   the slot did;  a rule ON the slot is flagged `hostOnly` (boxless:  first layer, no `display`)
 * - every subject is anchored (`anchor()`):  it may be the root, and only `::slotted()` / `slot` subjects may be
 *   slotted
 * - Anything else (class grammar) is kept as written.
 * - Node only (`$/ui/static`):  strings in, strings out, no DOM, no postcss;  NEVER imported by a component or
 *   `$/ui`.
 ****************/
export class StaticSelectors {
  /**
   * Rewrite `selector`;  `selectors` are the results (one, or two for a descendant host rule).
   * - `listItems`:  the sheet of a group whose items the flattener wraps in `<li data-ui-li>` (cards, list ...):
   *   each child combinator also matches through the wrapper (`A > B` => `A > B` and `A > [data-ui-li] > B`).
   */
  static rewrite(
    selector: string,
    { listItems = false, tags }: SSR.StaticSelectorOptions = {}
  ): SSR.StaticSelectorResult {
    const fromSlotted = selector.includes("::slotted(")
    let slotted = fromSlotted
    // `slot::slotted(X)` / `.x::slotted(X)` (X assigned to THAT slot) is just X now:  the slot is gone
    let text = selector.trim().replace(COMPOUND_THEN_SLOTTED, "$1::slotted(")
    text = StaticSelectors.replaceFunction(text, "::slotted", (inner, before) => {
      const target = StaticSelectors.slottedTarget(inner.trim(), tags)
      return before.trim() === "" ? `:scope > ${target}` : target
    })
    text = StaticSelectors.replaceFunction(text, ":state", (inner) => `[${SSR.STATE_ATTRIBUTE}~="${inner.trim()}"]`)
    // the slot element:  its resets reached the assigned nodes by inheritance;  a rule ON it is boxless, like a host's
    const slotSubject = SLOT_SUBJECT.test(text)
    if (HAS_SLOT.test(text)) slotted = true
    text = text.replace(SLOT_ELEMENT, `$1${SLOTTED}`)
    const result: SSR.StaticSelectorResult = text.startsWith(":host")
      ? StaticSelectors.rewriteHost(text)
      : { selectors: [text], hostOnly: false, slotted: false }
    // a rule ON the slot is boxless like a host's, but reached the slotted nodes only by inheritance:  slotted layer
    result.slotted = (fromSlotted && !result.hostOnly) || slotSubject
    result.hostOnly ||= slotSubject
    if (listItems) result.selectors = result.selectors.flatMap((each) => StaticSelectors.throughListItems(each))
    result.selectors = result.selectors.map((each) => StaticSelectors.anchor(each, { slotted }))
    return result
  }

  /**
   * What `::slotted(X)` reaches statically:  slotted nodes are plain children now.
   * - A native type (`img`) never matched a slotted COMPONENT (its host was `ui-image`), whose root may now be an
   *   `<img>`:  `:not([data-ui])`.
   * - A `ui-*` type => that family's root (`[data-ui="<noun>"]`), from `tags`;  unknown tags are kept (match nothing).
   */
  private static slottedTarget(inner: string, tags: ReadonlyMap<string, string> | undefined): string {
    const tag = /^ui-[\w-]+/.exec(inner)?.[0]
    if (tag) {
      const kind = tags?.get(tag)
      return kind ? `[${SSR.ROOT_ATTRIBUTE}="${kind}"]${inner.slice(tag.length)}` : inner
    }
    return /^[a-z]/.test(inner) ? `${inner}:not(${ROOT})` : inner
  }

  /**
   * `selector` able to match the scope's ROOT, and only what the shadow tree held.
   * - Inside `@scope`, a selector without `:scope` is read as `:scope <selector>`, a descendant, so `.ui.card`
   *   would never match the card's own root:  its subject (before a pseudo-element) gets `:where(:scope, ...)`,
   *   which adds no specificity and stays within the scope's root and limit.
   * - A shadow selector never reached slotted nodes (author content, other components):  `:where(:scope,
   *   :not([data-ui-slotted]))` keeps it to the root and the component's own markup.  A selector from `::slotted()`
   *   or `slot` (`slotted`) targets exactly those:  `:where(:scope, *)`.
   */
  private static anchor(selector: string, { slotted }: { slotted: boolean }): string {
    // the subject IS the root already (`:scope:is(...)`);  a `:scope` further left (`:scope *`) doesn't count
    if (selector.slice(StaticSelectors.subjectStart(selector)).includes(":scope")) return selector
    return StaticSelectors.onSubject(selector, slotted ? ANCHOR_SLOTTED : ANCHOR)
  }

  /** `selector` with `suffix` (a zero-specificity `:where(...)`) added to its subject, before a pseudo-element. */
  static onSubject(selector: string, suffix: string): string {
    const subject = StaticSelectors.subjectStart(selector)
    const pseudo = StaticSelectors.pseudoElementIndex(selector.slice(subject))
    const at = pseudo < 0 ? selector.length : subject + pseudo
    return selector.slice(0, at) + suffix + selector.slice(at)
  }

  /** Where `selector`'s subject (last compound) starts:  after its last top-level combinator. */
  private static subjectStart(selector: string): number {
    let depth = 0
    let subject = 0
    for (let index = 0; index < selector.length; index++) {
      const char = selector[index]!
      if (char === "(" || char === "[") depth++
      else if (char === ")" || char === "]") depth--
      else if (depth === 0 && COMBINATOR_START.test(char)) subject = index + 1
    }
    return subject
  }

  /**
   * Host `condition` with its position pseudo-classes (`:first-child` ...) tested on the list item wrapper when the
   * root has one:  the host's siblings were the other items, the wrapped root has none.
   * - `:first-child` => `:is(:not([data-ui-li]) > *:first-child, [data-ui-li]:first-child > *)`
   */
  private static hostPosition(condition: string): string {
    return condition.replace(
      POSITION,
      (position) => `:is(:not(${SSR.LIST_ITEM}) > *${position}, ${SSR.LIST_ITEM}${position} > *)`
    )
  }

  /**
   * In a list-item variant, `[data-ui-li] > B:first-child` => `[data-ui-li]:first-child > B`:  the wrapper has the
   * item's position now.
   */
  private static wrapperPosition(selector: string): string {
    const step = `${SSR.LIST_ITEM} > `
    let result = ""
    let rest = selector
    for (let at = rest.indexOf(step); at >= 0; at = rest.indexOf(step)) {
      const { compound, tail } = StaticSelectors.firstCompound(rest.slice(at + step.length))
      const { moved, kept } = StaticSelectors.splitPositions(compound)
      result += `${rest.slice(0, at)}${SSR.LIST_ITEM}${moved} > ${kept || "*"}`
      rest = tail
    }
    return result + rest
  }

  /**
   * `compound`'s top-level position pseudo-classes (`:first-child`, or `:not()` of positions only), and the rest.
   * - Only whole pseudo-classes move:  `:not(:first-child)` moves as a unit, never leaving an empty `:not()`.
   */
  private static splitPositions(compound: string): { moved: string; kept: string } {
    let moved = ""
    let kept = ""
    let index = 0
    while (index < compound.length) {
      const pseudo = compound[index] === ":" && compound[index + 1] !== ":"
      let end = index + 1
      if (pseudo) {
        while (end < compound.length && /[\w-]/.test(compound[end]!)) end++
        if (compound[end] === "(") end = StaticSelectors.closingParen(compound, end) + 1
      } else {
        while (end < compound.length && compound[end] !== ":") {
          if (compound[end] === "(" || compound[end] === "[") {
            end =
              compound[end] === "(" ? StaticSelectors.closingParen(compound, end) + 1 : compound.indexOf("]", end) + 1
          } else end++
        }
      }
      const segment = compound.slice(index, end)
      if (pseudo && StaticSelectors.isPosition(segment)) moved += segment
      else kept += segment
      index = end
    }
    return { moved, kept }
  }

  /** `segment` (one pseudo-class) tests only position:  `:first-child`, `:not(:first-child, :last-child)`. */
  private static isPosition(segment: string): boolean {
    if (POSITION_ONE.test(segment)) return true
    const inner = /^:not\((.*)\)$/.exec(segment)?.[1]
    return !!inner && inner.split(",").every((part) => POSITION_ONE.test(part.trim()))
  }

  /** `selector` and its variants with each top-level `>` also stepping over a list item wrapper (at most 3). */
  private static throughListItems(selector: string): string[] {
    let variants = [""]
    let start = 0
    let depth = 0
    let count = 0
    for (let index = 0; index < selector.length; index++) {
      const char = selector[index]!
      if (char === "(" || char === "[") depth++
      else if (char === ")" || char === "]") depth--
      else if (char === ">" && depth === 0 && count < MAX_LIST_ITEM_STEPS) {
        const before = selector.slice(start, index)
        variants = variants.flatMap((each) => [`${each}${before}>`, `${each}${before}> ${SSR.LIST_ITEM} >`])
        start = index + 1
        count++
      }
    }
    return variants.map((each) => StaticSelectors.wrapperPosition(each + selector.slice(start)))
  }

  /** A selector starting with `:host`. */
  private static rewriteHost(text: string): SSR.StaticSelectorResult {
    let rest = text.slice(":host".length)
    let condition = ""
    if (rest.startsWith("(")) {
      const end = StaticSelectors.closingParen(rest, 0)
      condition = `:is(${StaticSelectors.hostPosition(rest.slice(1, end))})`
      rest = rest.slice(end + 1)
    }
    // a COMPONENT root only:  class-grammar markup (a scope root too, `.ui.label:not([data-ui])`) never had a host
    const host = `${HOST}${condition}`
    if (!rest.trim()) return { selectors: [host], hostOnly: true, slotted: false }
    if (StaticSelectors.pseudoElementIndex(rest) === 0)
      return { selectors: [host + rest], hostOnly: false, slotted: false }
    const trimmed = rest.trimStart()
    if (trimmed.startsWith(">")) {
      const { compound, tail } = StaticSelectors.firstCompound(trimmed.slice(1).trimStart())
      return { selectors: [host + StaticSelectors.merge(compound) + tail], hostOnly: false, slotted: false }
    }
    const { compound, tail } = StaticSelectors.firstCompound(trimmed)
    return {
      selectors: [`${host} ${trimmed}`, host + StaticSelectors.merge(compound) + tail],
      hostOnly: false,
      slotted: false
    }
  }

  /** `compound` as `:is(...)` to merge onto `:scope`, its pseudo-element (`::before`) kept outside. */
  private static merge(compound: string): string {
    const pseudo = StaticSelectors.pseudoElementIndex(compound)
    const base = pseudo < 0 ? compound : compound.slice(0, pseudo)
    const after = pseudo < 0 ? "" : compound.slice(pseudo)
    return (base ? `:is(${base})` : "") + after
  }

  /** First compound selector of `text` (up to a top-level combinator) and what follows it. */
  private static firstCompound(text: string): { compound: string; tail: string } {
    let depth = 0
    for (let index = 0; index < text.length; index++) {
      const char = text[index]!
      if (char === "(" || char === "[") depth++
      else if (char === ")" || char === "]") depth--
      else if (depth === 0 && COMBINATOR_START.test(char))
        return { compound: text.slice(0, index), tail: text.slice(index) }
    }
    return { compound: text, tail: "" }
  }

  /**
   * Index of the first pseudo-element in `text` outside parentheses and brackets, else -1.
   * - Both spellings:  `::after`, and the legacy `:after` / `:before` / `:first-line` / `:first-letter`, which
   *   the minified `?inline` sheets use.
   */
  private static pseudoElementIndex(text: string): number {
    let depth = 0
    for (let index = 0; index < text.length; index++) {
      const char = text[index]!
      if (char === "(" || char === "[") depth++
      else if (char === ")" || char === "]") depth--
      else if (depth === 0 && char === ":" && PSEUDO_ELEMENT.test(text.slice(index))) return index
    }
    return -1
  }

  /**
   * Index of the `)` matching the `(` at `open`;  quoted strings (`[x="("]`) are skipped.
   * - throws a `SyntaxError` if there is none:  the selector (from a sheet) doesn't parse
   */
  private static closingParen(text: string, open: number): number {
    let depth = 0
    for (let index = open; index < text.length; index++) {
      const char = text[index]!
      if (char === '"' || char === "'") {
        index = text.indexOf(char, index + 1)
        if (index < 0) break
        continue
      }
      if (char === "(") depth++
      else if (text[index] === ")" && --depth === 0) return index
    }
    throw new SyntaxError(
      `StaticSelectors.rewrite():  unbalanced parentheses in \`${text}\`;  balance them in the sheet it came from`
    )
  }

  /**
   * Replace each `name(inner)` in `text` with `replace(inner, before)`, innermost arguments included
   * (`::slotted(:state(x))`).  `before` is the text preceding the call.
   */
  private static replaceFunction(
    text: string,
    name: string,
    replace: (inner: string, before: string) => string
  ): string {
    const call = `${name}(`
    let index = text.indexOf(call)
    while (index >= 0) {
      // `:state(` inside `::slotted(` etc.:  never match `::slotted` as `:slotted`, or a longer name
      const isPart = name.startsWith("::") || text[index - 1] !== ":"
      if (!isPart) {
        index = text.indexOf(call, index + 1)
        continue
      }
      const open = index + name.length
      const close = StaticSelectors.closingParen(text, open)
      const inner = text.slice(open + 1, close)
      const replaced = replace(inner, text.slice(0, index))
      text = text.slice(0, index) + replaced + text.slice(close + 1)
      index = text.indexOf(call, index + replaced.length)
    }
    return text
  }
}

/** What `:host` becomes:  the scope root, when it is a component root (no specificity added). */
const HOST = `:scope:where(${ROOT})`

/** Makes a shadow selector without `:scope` match the scope root too, never slotted nodes (`anchor()`). */
const ANCHOR = `:where(:scope, :not(${SLOTTED}))`

/** `ANCHOR` for a selector aimed at slotted nodes (`::slotted()`, `slot`):  they carry `data-ui-slotted`. */
const ANCHOR_SLOTTED = ":where(:scope, *)"

/** A pseudo-element at the start of the text:  `::x`, or a legacy single-colon one. */
const PSEUDO_ELEMENT = /^(?:::|:(?:before|after|first-line|first-letter)(?![\w-]))/

/** ONE position pseudo-class, whole. */
const POSITION_ONE = /^:(?:first-child|last-child|only-child|nth-child\([^()]*\)|nth-last-child\([^()]*\))$/

/** Position pseudo-classes:  they test siblings, which a list item wrapper takes away. */
const POSITION = /:(?:first-child|last-child|only-child|nth-child\([^()]*\)|nth-last-child\([^()]*\))/g

/** Child combinators per selector that get a list-item variant:  2^n selectors, so kept small. */
const MAX_LIST_ITEM_STEPS = 3

/** A combinator's first character, outside parentheses:  whitespace, `>`, `+`, `~`. */
const COMBINATOR_START = /[\s>+~]/

/** `slot` as a type selector:  at the start, after a combinator or `(` / `,`. */
const SLOT_ELEMENT = /(^|[\s>+~(,])slot(?![\w-])/g

/** `SLOT_ELEMENT`, not global:  for `.test()`, which a `g` regex would make stateful. */
const HAS_SLOT = /(^|[\s>+~(,])slot(?![\w-])/

/** `slot` as the SUBJECT:  in the last compound. */
const SLOT_SUBJECT = /(^|[\s>+~(,])slot(?![\w-])[^\s>+~]*$/

/** A compound before `::slotted(` (`slot`, `.icon`):  it described the slot, which is gone. */
const COMPOUND_THEN_SLOTTED = /(^|[\s>+~(,])[^\s>+~(,]+::slotted\(/g
