import { createEffect } from "solid-js"

import { camelCase, dedent, snakeCase } from "spell/util"
import { E } from "spell/element"
import { P } from "spell-parser/parser"
import { SP } from "spell-parser/spell"
import type { Core } from "spell-parser/core"
import { SpellElement } from "./SpellElement"
import {
  LAYOUT_HOLE as HOLE,
  LAYOUT_MARKDOWN_TAG as MARKDOWN_TAG,
  LAYOUT_SPELL_TAG as SPELL_TAG,
  LAYOUT_WHOLE_HOLE as WHOLE_HOLE
} from "./runner.types"

/****************
 * ### `LayoutSpell`
 * The spell written in a `<spell-viewer>`'s layout, compiled in the page against its program (epic `drawable-thing` P9):
 *
 * ```html
 * <spell-viewer project="@spell/examples/Solitaire">
 *   <ui-text>Score {the score of the game}</ui-text>          <!-- a hole:  shown, and kept up to date -->
 *   <ui-button action={auto-play}>AutoPlay</ui-button>       <!-- an action:  run on a click -->
 *   <solitaire-stock-pile>
 *     <spell>
 *       when clicked
 *         play from the stock pile                           <!-- a handler, on its element -->
 *     </spell>
 *   </solitaire-stock-pile>
 * </spell-viewer>
 * ```
 *
 * - Names resolve innermost first (Q18):
 *   1. the component:  `it` / `its`, the view tag the spell sits in
 *   2. its class:  through `it`, its type's members
 *   3. the page:  each view tag written with an `id` is a name, e.g. `T1`;  not one the program drew
 *   4. the program:  its top-level things, its functions and types -- from its declarations
 * - A hole is any spell EXPRESSION;  an action or a handler, any spell statements (Q11).
 * - Any element in the layout may handle events (P12):  a Spell UI tag, a plain one or a view's.
 *   - in a `<spell>` block inside it:
 *     `when clicked: play a song`, or the statements indented under `when clicked`
 *     - `on drag:` as well as `when dragged:`
 *     - an event in several words:  `when double clicked`
 *   - in an attribute:  `on-click="{play a song}"` or `when-clicked="{play a song}"` (Q20 C)
 *   - `it` is the view tag's thing, on one;  elsewhere the page's and the program's names are what's seen.
 * - A hole is spell exactly, as everywhere else:  `{the score of the game}`, never `{score of the game}` (J26).
 * - Kept live by Solid effects:  a hole re-runs when what it read changes.
 * - Holds spell's PARSER:  the runner loads it lazily, only for a layout with spell in it (`layoutHasSpell()`).
 * - `bind()` returns what takes it all back:  the layout's markup as it was written.
 ****************/
export class LayoutSpell {
  /** Its options -- see `LayoutSpellOptions`. */
  readonly options: LayoutSpellOptions

  /** What `bind()` did, to take back. */
  private undoes: Array<() => void> = []

  /** The program's scope:  its declarations, and its top-level things as variables. */
  private programScope: P.BlockScope

  /** The page's scope:  each view tag with an `id`, as a variable. */
  private pageScope: P.BlockScope

  /** Each component's scope, by its element:  `it` its thing. */
  private componentScopes = new WeakMap<Element, P.Scope>()

  /** Every name the compiled spell may read but `it`, by its javascript name:  the page's, then the program's. */
  private names = new Map<string, () => unknown>()

  /** The text of each `<markdown>` block drawn:  its holes are bound already -- see `bindMarkdown()`. */
  private markdownTexts = new WeakSet<Text>()

  constructor(options: LayoutSpellOptions) {
    this.options = options
    const { root, declarations, projectId, core } = options
    const data = SP.SpellDeclarations.read(JSON.stringify(declarations))
    const imports = SP.SpellDeclarations.importScope(
      SP.SpellParser.rootScope,
      data ? [{ from: projectId, declarations: data }] : []
    )
    this.programScope = new P.BlockScope({ name: "program", parentScope: imports, parser: imports.parser })
    const exported = core.things.exported
    for (const [name, value] of Object.entries(exported)) {
      this.names.set(name, () => exported[name])
      if (!value || typeof value !== "object") continue
      this.programScope.variables.add({ name: snakeCase(name), datatype: LayoutSpell.datatypeOf(value) })
    }
    this.pageScope = new P.BlockScope({ name: "page", parentScope: this.programScope, parser: imports.parser })
    for (const element of root.querySelectorAll("[id]")) {
      const Class = SpellElement.classOf(element)
      // a tag the program drew is named after its thing (`queen-of-spades`):  that's no name the page gave
      if (!Class || SpellElement.isHandedAThing(element)) continue
      this.pageScope.variables.add({ name: element.id, datatype: Class.name })
      this.names.set(P.JSWriter.instance.nameOf(element.id), () => SpellElement.thingOf(element))
    }
  }

  /**
   * Compile and run the layout's spell:  holes live, actions and handlers listening.
   * - Spell that can't be read shows `⚠` where it was, and a line on the program's console.
   * - Returns what takes it back.
   */
  bind(): () => void {
    E.Reactive.ownRoot((dispose) => {
      this.undoes.push(dispose)
      const { root } = this.options
      // markdown first:  its holes are its own, not text's
      for (const block of root.querySelectorAll(MARKDOWN_TAG)) this.bindMarkdown(block)
      for (const block of root.querySelectorAll(SPELL_TAG)) this.bindBlock(block)
      for (const element of root.querySelectorAll("*")) this.bindAttributes(element)
      for (const text of this.holeTexts(root)) this.bindText(text)
    })
    return () => {
      for (const undo of this.undoes.splice(0).reverse()) undo()
    }
  }

  ////////////////
  // ## Holes
  ////////////////

  /** Text nodes under `root` with a hole in them -- not in a `<spell>` block, a script or a style. */
  private holeTexts(root: Element): Text[] {
    const texts: Text[] = []
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const text = node as Text
      if (text.parentElement?.closest(`${SPELL_TAG}, script, style`) || this.markdownTexts.has(text)) continue
      if (HOLE.test(text.data)) texts.push(text)
    }
    return texts
  }

  /** Text `text`'s holes, each its own live text node -- `Score {the score of the game}`. */
  private bindText(text: Text): void {
    const parts = text.data.split(HOLES)
    const nodes = parts.map((part, index) => {
      // `split()` with a group:  every odd part is a hole's spell
      if (index % 2 === 0) return document.createTextNode(part)
      const node = document.createTextNode("")
      const read = this.compileOrShow(part, "expression", text.parentElement, (shown) => (node.data = shown))
      if (read) this.live(read, (value) => (node.data = this.textOf(value)))
      return node
    })
    text.replaceWith(...nodes)
    this.undoes.push(() => {
      nodes[0]!.before(text)
      for (const node of nodes) node.remove()
    })
  }

  /**
   * `element`'s attributes written as a hole, bound:
   * - `value={...}`:  live
   * - `action={...}`:  run on a click
   * - `on-click={...}` / `when-clicked={...}`:  run on that event (P12)
   */
  private bindAttributes(element: Element): void {
    for (const { name, value } of LayoutSpell.holeAttributes(element)) {
      const spell = WHOLE_HOLE.exec(value)?.[1]
      if (!spell) continue
      this.undoes.push(LayoutSpell.takeAttributes(element, name))
      if (name === ACTION) {
        const run = this.compileOrShow(spell, "block", element.parentElement)
        if (run) this.listen(element, "click", run)
        continue
      }
      const event = LayoutSpell.eventOfAttribute(name)
      if (event) {
        const run = this.compileOrShow(spell, "block", element)
        if (run) this.listen(element, LayoutSpell.domEventFor(event), run)
        continue
      }
      const read = this.compileOrShow(spell, "expression", element.parentElement)
      if (read) this.live(read, (shown) => LayoutSpell.setAttribute(element, name, shown))
    }
  }

  /**
   * `element`'s attributes, each hole written WITHOUT quotes put back together.
   * - `on-click={play a song}` reaches us as three attributes:  `on-click="{play"`, `a` and `song}`.
   * - Its `name` is the first attribute's;  its `parts`, every attribute it was made of.
   * - The browser keeps only the first of two attributes of the same name, so a repeated word is lost:
   *   `{the score of the game}` unquoted reads as `{the score of game}` (C15).
   *   Quotes keep it whole.
   */
  static holeAttributes(element: Element): Array<{ name: string; value: string; parts: string[] }> {
    const attributes = [...element.attributes]
    const holes: Array<{ name: string; value: string; parts: string[] }> = []
    for (let index = 0; index < attributes.length; index++) {
      const { name, value } = attributes[index]!
      if (!/^\s*\{/.test(value) || WHOLE_HOLE.test(value)) {
        holes.push({ name, value, parts: [name] })
        continue
      }
      // the rest of an unquoted hole:  the attributes after it, up to the one that ends with `}`
      const words = [value]
      const parts = [name]
      while (index + 1 < attributes.length && !words.at(-1)!.endsWith("}")) {
        const next = attributes[++index]!
        words.push(next.value ? `${next.name}=${next.value}` : next.name)
        parts.push(next.name)
      }
      holes.push({ name, value: words.join(" "), parts })
    }
    return holes
  }

  /** Take attribute `name` off `element` -- and, for an unquoted hole, the words after it;  returns what puts them back. */
  static takeAttributes(element: Element, name: string): () => void {
    const hole = LayoutSpell.holeAttributes(element).find((each) => each.name === name)
    const taken = (hole?.parts ?? [name]).map((part) => [part, element.getAttribute(part) ?? ""] as const)
    for (const [part] of taken) element.removeAttribute(part)
    return () => {
      for (const [part, value] of taken) element.setAttribute(part, value)
    }
  }

  /** The event an attribute handles, by its name:  `on-click` => `click`, `when-double-clicked` => `double-clicked`. */
  static eventOfAttribute(name: string): string | undefined {
    return EVENT_ATTRIBUTE.exec(name)?.[1]
  }

  ////////////////
  // ## `<markdown>` blocks
  ////////////////

  /**
   * A `<markdown>` block, drawn by Spell UI's `<ui-markdown>` instead:  its holes live, as text's are (P14, Q22, Q23).
   * - Its holes split as a drawing's `<markdown>` splits them (`SP.MarkdownBlock.partsOf()`):
   *   code keeps its braces, and `\{` is a brace.
   * - Its text is the page's:  the browser has read it as HTML, so a `<` in it is `&lt;`.
   * - The whole markdown is drawn again when a hole's value changes.
   */
  private bindMarkdown(block: Element): void {
    const drawn = document.createElement(UI_MARKDOWN_TAG)
    const text = document.createTextNode("")
    drawn.append(text)
    this.markdownTexts.add(text)
    const reads = SP.MarkdownBlock.partsOf(block.textContent ?? "").map((part) =>
      typeof part === "string" ? part : this.compileOrShow(part.hole, "expression", block.parentElement)
    )
    block.replaceWith(drawn)
    this.undoes.push(() => drawn.replaceWith(block))
    const read = () =>
      reads.map((part) => (typeof part === "string" ? part : part ? this.textOf(part(undefined)) : "⚠")).join("")
    this.live(read, (shown) => (text.data = shown as string))
  }

  ////////////////
  // ## `<spell>` blocks
  ////////////////

  /**
   * A `<spell>` block's handlers, each listening on the element it sits in:
   * `when clicked: play a song` on one line, or `when clicked` then its statements, indented under it.
   * - Hidden:  it's spell, not something to show.
   * - Anything but a handler is an error, for now:  a method or variable it makes belongs to its element (Q12),
   *   which needs more than this.
   */
  private bindBlock(block: Element): void {
    const target = block.parentElement
    ;(block as HTMLElement).hidden = true
    if (!target) return
    for (const { event, body, error } of LayoutSpell.handlersIn(block.textContent ?? "")) {
      if (error) {
        this.report(error)
        continue
      }
      const run = this.compileOrShow(body, "block", target)
      if (run) this.listen(target, LayoutSpell.domEventFor(event), run)
    }
  }

  /**
   * The handlers in a `<spell>` block's `text`:  `when <event>` lines, each with the lines indented under it.
   * - Or on one line:  `when clicked: play a song`, the statement after the colon.
   * - Each first line is read by spell's own `on` rule, in any language spell reads -- see `eventOfHandler()`:
   *   - `on <event>` as well as `when <event>`:  `on drag:` is `when dragged:`
   *   - Spanish's `al <event>` and `cuando <event>`:  `al carta elegida:`
   * - An event may be several words, joined with dashes:  `when double clicked` is `double-clicked`.
   * - Indents are tabs to spell:  each run of the first indent's spaces is a tab.
   */
  static handlersIn(text: string): Array<{ event: string; body: string; error?: string }> {
    const outdented = dedent(text)
      .split("\n")
      .filter((line) => line.trim())
    const unit = /^(\s+)/.exec(outdented.find((line) => /^\s/.test(line)) ?? "")?.[1] ?? "\t"
    const handlers: Array<{ event: string; body: string; error?: string }> = []
    for (const line of outdented) {
      if (!/^\s/.test(line)) {
        const [head, ...inline] = line.split(":")
        const event = LayoutSpell.eventOfHandler(head!)
        if (event) handlers.push({ event, body: inline.join(":").trim() })
        else handlers.push({ event: "", body: "", error: `a <spell> block holds "when <event>" handlers:  "${line}"` })
        continue
      }
      const handler = handlers.at(-1)
      if (!handler || handler.error) continue
      const body = line
        .slice(unit.length)
        .replace(new RegExp(`^(${unit.replace(/\t/g, "\\t")})+`), (run) => "\t".repeat(run.length / unit.length))
      handler.body += `${handler.body ? "\n" : ""}${body}`
    }
    return handlers
  }

  /**
   * The event a handler's first line hears, e.g. `double-clicked` for `when double clicked`, its statement left out:
   * read by spell's `on` rule, in each language spell reads, the default first.
   * - `undefined` for a line that isn't a handler's.
   * - Any case:  `When Clicked` is `clicked`.
   */
  static eventOfHandler(head: string): string | undefined {
    const languages = new Set([SP.Language.default, ...SP.Language.all.values()])
    for (const { parser, rootScope } of languages) {
      const scope = new P.BlockScope({ name: "handler", parentScope: rootScope, parser })
      const match = parser.parse(head.trim().toLowerCase(), ON_RULE, scope)
      // the event it declares, by what the rule says it declares:  never by its rule's name
      const declared = match?.rule.getDeclaration(match)
      if (declared?.kind === "event") return LayoutSpell.eventOf(String(declared.nameMatch.raw))
    }
    return undefined
  }

  /** An event written in `words`, as we look it up:  lower case, joined with dashes -- `Double Clicked` => `double-clicked`. */
  static eventOf(words: string): string {
    return words
      .trim()
      .toLowerCase()
      .split(/[\s-]+/)
      .join("-")
  }

  /**
   * The DOM event a handler's `event` means:  `clicked` => `click`, `double-clicked` => `dblclick`;
   * any other, the browser's own name as written (`drag`, `keydown`), or an event the program triggers.
   */
  static domEventFor(event: string): string {
    return DOM_EVENTS[event] ?? event
  }

  ////////////////
  // ## Compiling and running
  ////////////////

  /**
   * `spell` compiled, in the scope of the component around `place`, as a function of `it`.
   * - `undefined` if it can't be read:  then `show` shows `⚠`, and the program's console says why.
   */
  private compileOrShow(
    spell: string,
    rule: "expression" | "block",
    place: Element | null,
    show?: (shown: string) => void
  ): ((it: unknown) => unknown) | undefined {
    const component = place && SpellElement.closestView(place)
    try {
      const run = this.compile(spell.trim(), rule, this.scopeFor(component))
      return () => run(component ? SpellElement.thingOf(component) : undefined)
    } catch (error) {
      this.report(`can't read {${spell.trim()}}`, error)
      show?.("⚠")
      return undefined
    }
  }

  /**
   * `spell` as javascript, in `scope`, as a function of `it` and every name we know.
   * - throws if it doesn't read, or reads with errors.
   */
  private compile(spell: string, rule: "expression" | "block", scope: P.Scope): (it: unknown) => unknown {
    const match = this.parsed(spell, rule, scope)
    if (!match) throw new SyntaxError(`spell doesn't read:  "${spell}"`)
    const javascript = String(match.compile())
    const names = [...this.names.keys()].filter((name) => name !== IT && P.jsText.isLegalIdentifier(name))
    const body = rule === "expression" ? `return (${javascript})` : javascript
    const Maker = rule === "expression" ? Function : AsyncFunction
    const fn = new Maker(IT, "core", ...names, body) as (...args: unknown[]) => unknown
    const { core } = this.options
    return (it) => fn(it, core, ...names.map((name) => this.names.get(name)!()))
  }

  /**
   * `spell`, parsed as `rule` in `scope` -- `undefined` if it doesn't read, reads with errors,
   * or reads only its start (`no such thing` is NOT `no`).
   */
  private parsed(spell: string, rule: "expression" | "block", scope: P.Scope): P.Match | undefined {
    const match = scope.parse(spell, rule)
    if (!match || match.rule.name === "parse_error") return undefined
    if (rule === "expression" && (match.end ?? 0) < spell.length) return undefined
    if (rule === "block" && SP.Block.getParseErrors(match)?.length) return undefined
    return match
  }

  /** The scope of spell in `component`'s view tag:  `it` its thing -- else the page's. */
  private scopeFor(component: Element | null | undefined): P.Scope {
    const Class = component && SpellElement.classOf(component)
    if (!component || !Class) return this.pageScope
    let scope = this.componentScopes.get(component)
    if (!scope) {
      const own = new P.BlockScope({ name: "component", parentScope: this.pageScope, parser: this.pageScope.parser })
      own.variables.add({ name: IT, datatype: Class.name })
      this.componentScopes.set(component, (scope = own))
    }
    return scope
  }

  /** Show what `read` reads, with `show`, and again whenever what it read changes. */
  private live(read: (it: unknown) => unknown, show: (value: unknown) => void): void {
    createEffect(
      () => {
        try {
          return { value: read(undefined) }
        } catch (error) {
          return { error }
        }
      },
      (result) => {
        if ("error" in result) {
          this.report("a hole failed", result.error)
          show("⚠")
        } else show(result.value)
      }
    )
  }

  /** Run `run` on each `event` on `element`. */
  private listen(element: Element, event: string, run: (it: unknown) => unknown): void {
    const listener = () => {
      Promise.resolve()
        .then(() => run(undefined))
        .catch((error: unknown) => this.report(`<${element.localName}>'s ${event} failed`, error))
    }
    element.addEventListener(event, listener)
    this.undoes.push(() => element.removeEventListener(event, listener))
  }

  /** One line on the program's console:  the layout's spell went wrong. */
  private report(message: string, error?: unknown): void {
    this.options.core.console.error(`layout:  ${message}`, ...(error === undefined ? [] : [error]))
  }

  /** `value` set as `element`'s attribute `name`:  an object as a property, nothing / `false` as no attribute. */
  static setAttribute(element: Element, name: string, value: unknown): void {
    if (value === undefined || value === null || value === false) element.removeAttribute(name)
    else if (typeof value === "object" || typeof value === "function") {
      ;(element as unknown as Record<string, unknown>)[camelCase(name)] = value
    } else element.setAttribute(name, value === true ? "" : `${value as string | number}`)
  }

  /** `value` as a hole shows it:  nothing as nothing, a thing by its label (`Q♠️`), anything else as text or JSON. */
  private textOf(value: unknown): string {
    if (value === undefined || value === null) return ""
    if (typeof value !== "object") return `${value as string | number | boolean}`
    const { things } = this.options.core
    return things.isThing(value) ? things.labelOf(value) : JSON.stringify(value)
  }

  /** The datatype a program's top-level `value` is, in spell's words:  its class, e.g. `Game`;  a plain list `list`. */
  static datatypeOf(value: object): string {
    const name = value.constructor?.name
    return !name || name === "Object" ? "object" : name === "List" || name === "Array" ? "list" : name
  }
}

/** What a `LayoutSpell` binds. */
export type LayoutSpellOptions = {
  /** The layout:  the `<spell-viewer>` whose markup it is. */
  root: Element
  /** Its project's id, e.g. `@spell/examples/Solitaire`. */
  projectId: string
  /** Its project's declarations, as its `.declarations.json5` holds them. */
  declarations: unknown
  /** The runtime its program ran on. */
  core: Core
}

/** The attribute a click runs. */
const ACTION = "action"

/** Spell UI's markdown element, which draws a `<markdown>` block. */
const UI_MARKDOWN_TAG = "ui-markdown"

/** What `it` is called, to spell and in the compiled javascript. */
const IT = "it"

/** Each hole in text, its spell captured -- for `split()`. */
const HOLES = /\{([^{}]+)\}/

/** Spell's rule for a handler's first line, `when clicked`, `al carta elegida` -- see `eventOfHandler()`. */
const ON_RULE = "on"

/** An attribute that handles an event, the event captured:  `on-click`, `when-double-clicked`. */
const EVENT_ATTRIBUTE = /^(?:on|when)-([a-z][\w-]*)$/

/** DOM events a handler's words mean, when not the words themselves. */
const DOM_EVENTS: Record<string, string> = {
  clicked: "click",
  "double-clicked": "dblclick",
  "double-click": "dblclick",
  "right-clicked": "contextmenu",
  "right-click": "contextmenu",
  hovered: "mouseenter",
  hover: "mouseenter",
  unhovered: "mouseleave",
  focused: "focus",
  blurred: "blur",
  changed: "change",
  typed: "input",
  submitted: "submit",
  dragged: "drag",
  dropped: "drop"
}

/** `async function`'s constructor:  an action's statements may `await`. */
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor as FunctionConstructor
