import { createEffect, createRoot } from "solid-js"

import { camelCase, snakeCase } from "$/util"
import { P } from "$/parser"
import { SP } from "$/spell"
import type { SpellCore } from "$/core"
import { SpellElement } from "./SpellElement"
import {
  LAYOUT_HOLE as HOLE,
  LAYOUT_MARKDOWN_TAG as MARKDOWN_TAG,
  LAYOUT_SPELL_TAG as SPELL_TAG,
  LAYOUT_WHOLE_HOLE as WHOLE_HOLE
} from "./runner.types"

/****************
 * ### `LayoutSpell`
 * The spell written in a `<spell-app>`'s layout, compiled in the page against its program (epic `drawable-thing` P9):
 *
 * ```html
 * <spell-app project="@examples/Solitaire">
 *   <ui-text>Score {the score of the game}</ui-text>          <!-- a hole:  shown, and kept up to date -->
 *   <ui-button action={auto-play}>AutoPlay</ui-button>       <!-- an action:  run on a click -->
 *   <solitaire-stock-pile>
 *     <spell>
 *       when clicked
 *         play from the stock pile                           <!-- a handler, on its element -->
 *     </spell>
 *   </solitaire-stock-pile>
 * </spell-app>
 * ```
 *
 * - Names resolve innermost first (Q18):
 *   1. the component:  `it` / `its`, the drawable tag the spell sits in
 *   2. its class:  through `it`, its type's members
 *   3. the page:  each drawable tag with an `id` is a name, e.g. `T1`
 *   4. the program:  its top-level things, its functions and types -- from its declarations
 * - A hole is any spell EXPRESSION;  an action or a handler, any spell statements (Q11).
 *   A hole that doesn't read as written is tried again with `the` before it:  `{score of the game}`.
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

  /** The page's scope:  each drawable tag with an `id`, as a variable. */
  private pageScope: P.BlockScope

  /** Each component's scope, by its element:  `it` its thing. */
  private componentScopes = new WeakMap<Element, P.Scope>()

  /** Every name the compiled spell may read but `it`, by its javascript name:  the page's, then the program's. */
  private names = new Map<string, () => unknown>()

  /** The text of each `<markdown>` block drawn:  its holes are bound already -- see `bindMarkdown()`. */
  private markdownTexts = new WeakSet<Text>()

  constructor(options: LayoutSpellOptions) {
    this.options = options
    const { root, declarations, projectId, spellCore } = options
    const data = SP.SpellDeclarations.read(JSON.stringify(declarations))
    const imports = SP.SpellDeclarations.importScope(
      SP.SpellParser.rootScope,
      data ? [{ from: projectId, declarations: data }] : []
    )
    this.programScope = new P.BlockScope({ name: "program", parentScope: imports, parser: imports.parser })
    const exported = spellCore.things.exported
    for (const [name, value] of Object.entries(exported)) {
      this.names.set(name, () => exported[name])
      if (!value || typeof value !== "object") continue
      this.programScope.variables.add({ name: snakeCase(name), datatype: LayoutSpell.datatypeOf(value) })
    }
    this.pageScope = new P.BlockScope({ name: "page", parentScope: this.programScope, parser: imports.parser })
    for (const element of root.querySelectorAll("[id]")) {
      const Class = SpellElement.classOf(element)
      if (!Class) continue
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
    createRoot((dispose) => {
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

  /** `element`'s attributes written as a hole, `value={...}`:  live;  `action={...}`:  run on a click. */
  private bindAttributes(element: Element): void {
    for (const { name, value } of [...element.attributes]) {
      const spell = WHOLE_HOLE.exec(value)?.[1]
      if (!spell) continue
      element.removeAttribute(name)
      this.undoes.push(() => element.setAttribute(name, value))
      if (name === ACTION) {
        const run = this.compileOrShow(spell, "block", element.parentElement)
        if (run) this.listen(element, "click", run)
        continue
      }
      const read = this.compileOrShow(spell, "expression", element.parentElement)
      if (read) this.live(read, (shown) => LayoutSpell.setAttribute(element, name, shown))
    }
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
   * `when clicked` then its statements, indented under it.
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
   * - Indents are tabs to spell:  each run of the first indent's spaces is a tab.
   */
  static handlersIn(text: string): Array<{ event: string; body: string; error?: string }> {
    const lines = text.split("\n").filter((line) => line.trim())
    const margin = Math.min(...lines.map((line) => /^\s*/.exec(line)![0].length))
    const outdented = lines.map((line) => line.slice(Number.isFinite(margin) ? margin : 0))
    const unit = /^(\s+)/.exec(outdented.find((line) => /^\s/.test(line)) ?? "")?.[1] ?? "\t"
    const handlers: Array<{ event: string; body: string; error?: string }> = []
    for (const line of outdented) {
      if (!/^\s/.test(line)) {
        const event = WHEN.exec(line)?.[1]
        if (event) handlers.push({ event, body: "" })
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

  /** The DOM event a handler's word means:  `clicked` => `click`, `double-clicked` => `dblclick`, else as is. */
  static domEventFor(event: string): string {
    return DOM_EVENTS[event] ?? event
  }

  ////////////////
  // ## Compiling and running
  ////////////////

  /**
   * `spell` compiled, in the scope of the component around `place`, as a function of `it` --
   * `undefined` if it can't be read:  then `show` shows `⚠`, and the program's console says why.
   */
  private compileOrShow(
    spell: string,
    rule: "expression" | "block",
    place: Element | null,
    show?: (shown: string) => void
  ): ((it: unknown) => unknown) | undefined {
    const component = place && SpellElement.closestDrawable(place)
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
    const match = this.parsed(spell, rule, scope) ?? (rule === "expression" && this.parsed(`the ${spell}`, rule, scope))
    if (!match) throw new SyntaxError(`spell doesn't read:  "${spell}"`)
    const javascript = String(match.compile())
    const names = [...this.names.keys()].filter((name) => name !== IT && P.jsText.isLegalIdentifier(name))
    const body = rule === "expression" ? `return (${javascript})` : javascript
    const Maker = rule === "expression" ? Function : AsyncFunction
    const fn = new Maker(IT, "spellCore", ...names, body) as (...args: unknown[]) => unknown
    const { spellCore } = this.options
    return (it) => fn(it, spellCore, ...names.map((name) => this.names.get(name)!()))
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

  /** The scope of spell in `component`'s drawable tag:  `it` its thing -- else the page's. */
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
    this.options.spellCore.console.error(`layout:  ${message}`, ...(error === undefined ? [] : [error]))
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
    const { things } = this.options.spellCore
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
  /** The layout:  the `<spell-app>` whose markup it is. */
  root: Element
  /** Its project's id, e.g. `@examples/Solitaire`. */
  projectId: string
  /** Its project's declarations, as its `.declarations.json` holds them. */
  declarations: unknown
  /** The runtime its program ran on. */
  spellCore: SpellCore
}

/** The attribute a click runs. */
const ACTION = "action"

/** Spell UI's markdown element, which draws a `<markdown>` block. */
const UI_MARKDOWN_TAG = "ui-markdown"

/** What `it` is called, to spell and in the compiled javascript. */
const IT = "it"

/** Each hole in text, its spell captured -- for `split()`. */
const HOLES = /\{([^{}]+)\}/

/** A handler's first line, its event captured:  `when clicked`. */
const WHEN = /^when\s+([a-z][\w-]*)\s*:?\s*$/i

/** DOM events a handler's word means, when not the word itself. */
const DOM_EVENTS: Record<string, string> = {
  clicked: "click",
  "double-clicked": "dblclick",
  hovered: "mouseenter",
  focused: "focus",
  changed: "change"
}

/** `async function`'s constructor:  an action's statements may `await`. */
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor as FunctionConstructor
