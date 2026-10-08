import postcss, { AtRule, type ChildNode, type Container, type Document, type Rule } from "postcss"

import { foundationCSS, nativeCSS, resetCSS, typographyCSS } from "$/ui/styles"

import { SSR } from "$/ui/static"
// Import directly to avoid circular import:  the constants below the class read them
import { LIST_ITEM, ROOT, SLOTTED } from "./static.types.ssr"

/****************
 * ### `StaticStylesheet`
 * The ONE stylesheet a static page (`StaticRender`) links:  the page foundation, then every family's sheets
 * rewritten for light DOM, each kept to its own component.
 * - Order:
 *   1. `@layer ui-slotted, page, ui;`:  `::slotted()` rules first (they lost to the page in a shadow root);  a
 *      page's own CSS goes in `@layer page`, so components win where both set a property
 *      (unlayered page CSS would beat every `ui.*` layer)
 *   2. `pageCSS`:  layers, tokens, colors ... typography, native, as a page with elements gets them, less the
 *      shadow-only selectors (`page()`)
 *   3. `reset.css`, which only ever applied inside shadow roots:  scoped to every component
 *   4. each family's sheets (`styles`), selectors rewritten (`StaticSelectors`), wrapped in `@scope`
 *   5. list item wrappers as `display: contents`;  `[hidden]`, unlayered:  component `display` rules would beat
 *      the browser's own
 * - The `@scope` boundary stands in for the shadow boundary:  from a component's root (`data-ui="<kind>"`) down
 *   to, not into, other components and author content:
 *   - `[data-ui-slotted]:not([data-ui]) > *`:  slotted author elements are in scope (as `::slotted()` reached
 *     them), their insides aren't
 *   - `:scope [data-ui] > *`:  another component's root is in scope (slotted, or rendered inside this one's
 *     markup), its insides aren't
 *   - NOTE: a slotted COMPONENT's root carries `data-ui-slotted` too, so the first clause skips `[data-ui]`:
 *     otherwise its own scope would end at its own children
 * - A sheet shared by several families (`UIParts.css`) is emitted once, scoped to all their kinds.
 * - Node only (`$/ui/static`, postcss):  reads the families' sheet TEXT (`styles`), never renders;  NEVER imported
 *   by a component or `$/ui`.
 ****************/
export class StaticStylesheet {
  /**
   * The stylesheet for `families`.
   * - `usage` (`StaticRender.sheetUsage`):  which elements were seen adopting which sheets, in what order.
   *   - each sheet is scoped to its users as well as its own families (items adopting their list's sheet)
   *   - sheets are emitted in an order that keeps every adoption order seen (`ordered()`):  a sheet's layers are
   *     declared where it first appears, and a later layer wins, as a later-adopted sheet did in a shadow root
   */
  static build(families: Iterable<SSR.StaticFamily>, usage?: SSR.StaticSheetUsage): string {
    // `kinds`:  the `data-ui` marks of the roots a sheet styles;  `words`:  their class-grammar nouns (`.ui.<noun>`)
    const sheets = new Map<string, { css: string; kinds: Set<string>; words: Set<string> }>()
    const tags = new Map<string, string>()
    for (const { Class, definition, kind } of families) {
      tags.set(definition.tag, kind)
      for (const [name, css] of Object.entries(Class.prototype.styleSheets)) {
        let sheet = sheets.get(name)
        if (!sheet) sheets.set(name, (sheet = { css, kinds: new Set(), words: new Set() }))
        sheet.kinds.add(kind)
        sheet.words.add(definition.vocabulary.noun)
      }
    }
    for (const [name, kinds] of usage?.users ?? []) for (const kind of kinds) sheets.get(name)?.kinds.add(kind)
    const parts = [
      PAGE_LAYERS,
      ...foundationCSS.map((sheet) => StaticStylesheet.page(sheet)),
      ...[typographyCSS, nativeCSS].map((sheet) => StaticStylesheet.page(sheet, { pageOnly: true })),
      StaticStylesheet.scope(resetCSS, ROOT)
    ]
    for (const name of StaticStylesheet.ordered([...sheets.keys()], usage?.orders.values() ?? [])) {
      const { css, kinds, words } = sheets.get(name)!
      // also class-grammar markup the PAGE wrote (`<button class="ui button">`), as a page sheet styled it -- never a
      // component's own markup (the calendar's `<table class="ui table">`):  outside every component, or author
      // content slotted into one (`AUTHOR`)
      const roots = [
        ...[...kinds].map((kind) => `[${SSR.ROOT_ATTRIBUTE}="${kind}"]`),
        ...[...words].map((word) => `.ui.${word}:not(${ROOT})${AUTHOR}`)
      ].join(", ")
      const listItems = [...kinds].some((kind) => LIST_OWNERS.has(kind))
      parts.push(`/* ${name} */\n${StaticStylesheet.scope(css, `:is(${roots})`, { listItems, tags })}`)
    }
    // page sheets components registered while rendering (`UIDimmer.page.css`):  page CSS, unscoped
    for (const [name, css] of SSR.ServerRuntime.pageSheets) {
      if (!sheets.has(name)) parts.push(`/* ${name} (page) */\n${SSR.StaticPageStyles.rewrite(css, tags)}`)
    }
    parts.push(LIST_ITEMS, HIDDEN)
    return parts.join("\n\n")
  }

  /**
   * `names` reordered so each of `orders` holds (`["item", "list"]`:  `item` before `list`), otherwise as given.
   * - Kahn's topological sort, picking the earliest-given name each time;  a cycle (two elements adopting the same
   *   sheets in opposite orders) keeps the given order for what's left.
   */
  static ordered(names: readonly string[], orders: Iterable<readonly string[]>): string[] {
    const after = new Map<string, Set<string>>(names.map((name) => [name, new Set()]))
    const before = new Map<string, number>(names.map((name) => [name, 0]))
    for (const order of orders) {
      for (let index = 1; index < order.length; index++) {
        const [first, second] = [order[index - 1]!, order[index]!]
        if (!after.has(first) || !after.has(second) || after.get(first)!.has(second)) continue
        after.get(first)!.add(second)
        before.set(second, before.get(second)! + 1)
      }
    }
    const result: string[] = []
    const left = [...names]
    while (left.length) {
      const index = Math.max(
        0,
        left.findIndex((name) => before.get(name) === 0)
      )
      const [name] = left.splice(index, 1)
      result.push(name!)
      for (const next of after.get(name!)!) before.set(next, before.get(next)! - 1)
    }
    return result
  }

  /**
   * A page sheet without its shadow-only selectors (`:host`, `::slotted`, `:state()`), which never match on a page:
   * the foundation's `:host` token defaults, `reset.css`.
   */
  static page(css: string, { pageOnly = false }: { pageOnly?: boolean } = {}): string {
    const sheet = postcss.parse(css)
    sheet.walkRules((rule) => {
      if (SSR.StaticPageStyles.inKeyframes(rule)) return
      // `pageOnly` sheets (typography, native) were never adopted into shadow roots:  they keep out of components'
      // own markup (`REACH`);  the foundation (tokens, utilities ...) was, so it reaches everywhere
      const selectors = rule.selectors
        .filter((selector) => !SHADOW_ONLY.test(selector))
        .map((selector) => (pageOnly ? SSR.StaticSelectors.onSubject(selector, SSR.REACH) : selector))
      if (!selectors.length) rule.remove()
      else rule.selectors = selectors
    })
    sheet.walkAtRules((rule) => {
      if (rule.nodes && !rule.nodes.length) rule.remove()
    })
    return sheet.toString()
  }

  /**
   * `css` rewritten for light DOM, its rules wrapped in `@scope (<root>) to (<limit>)`.
   * - Host-only rules move to `@layer ui.reset`, the first `ui` layer:  what the DOM element set (token resets,
   *   `color`), the root's own rules overrode, being another element;  on the SAME element now,
   *   any later layer must still win.
   * - `::slotted()` rules move to `@layer ui-slotted`, before `page`:  in a shadow root they lost to the page's CSS
   *   and to the slotted component's own rules.
   */
  static scope(css: string, root: string, options: SSR.StaticSelectorOptions = {}): string {
    const sheet = postcss.parse(css)
    const moved = new Map<string, MovedRule[]>([
      [HOST_LAYER, []],
      [SLOTTED_LAYER, []]
    ])
    sheet.walkRules((rule) => StaticStylesheet.rewriteRule(rule, options, moved))
    for (const [layer, rules] of moved) if (rules.length) sheet.append(StaticStylesheet.movedLayer(layer, rules))
    StaticStylesheet.wrap(sheet, `(${root}) to (${LIMIT})`)
    return sheet.toString()
  }

  /** `@layer <name> { ... }` of `rules`, each inside clones of its conditional at-rules (`@media` ...). */
  private static movedLayer(name: string, rules: readonly MovedRule[]): AtRule {
    const layer = new AtRule({ name: "layer", params: name })
    for (const { rule, parent } of rules) {
      let node: ChildNode = rule
      for (let ancestor = parent; ancestor?.type === "atrule"; ancestor = ancestor.parent) {
        const atRule = ancestor as AtRule
        if (atRule.name !== "layer") node = atRule.clone({ nodes: [] }).append(node) as AtRule
      }
      layer.append(node)
    }
    return layer
  }

  /**
   * Rewrite one rule's selectors.
   * - Host-only selectors (`:host(X)` alone) go to a copy of the rule without `display` (that was the DOM element
   *   box's, never the root's, and the class-grammar twins beside them keep theirs), for `ui.reset`.
   * - `::slotted()` selectors go to a copy for `ui-slotted`.
   * - Both collected in `moved`, by layer.
   */
  private static rewriteRule(rule: Rule, options: SSR.StaticSelectorOptions, moved: Map<string, MovedRule[]>) {
    if (SSR.StaticPageStyles.inKeyframes(rule)) return
    const kept: string[] = []
    const hostOnly: string[] = []
    const slotted: string[] = []
    // rules ON a slot:  boxless (no `display`), slotted layer
    const slots: string[] = []
    for (const selector of rule.selectors) {
      const result = SSR.StaticSelectors.rewrite(selector, options)
      const bucket = result.hostOnly ? (result.slotted ? slots : hostOnly) : result.slotted ? slotted : kept
      bucket.push(...result.selectors)
    }
    const hostLayer = moved.get(HOST_LAYER)!
    const slottedLayer = moved.get(SLOTTED_LAYER)!
    StaticStylesheet.move({ rule, selectors: hostOnly, into: hostLayer, boxless: true })
    StaticStylesheet.move({ rule, selectors: slots, into: slottedLayer, boxless: true })
    StaticStylesheet.move({ rule, selectors: slotted, into: slottedLayer })
    if (kept.length) rule.selectors = [...new Set(kept)]
    else rule.remove()
  }

  /**
   * A copy of `rule` for `selectors` (if any) into `into`;  `boxless`:  without `display` (a DOM element's, a slot's).
   */
  private static move({ rule, selectors, into, boxless = false }: MoveParams) {
    if (!selectors.length) return
    const copy = rule.clone({ selectors: [...new Set(selectors)] })
    if (boxless) copy.walkDecls("display", (declaration) => void declaration.remove())
    if (copy.nodes.length) into.push({ rule: copy, parent: rule.parent })
  }

  /**
   * Wrap `container`'s scopable children in `@scope <params>`, at the innermost layer level:  `@layer` statements
   * and at-rules that can't sit in a scope (`@keyframes`, `@property`, `@font-face`) stay where they are.
   */
  private static wrap(container: Container, params: string) {
    let scope: AtRule | undefined
    for (const node of [...(container.nodes ?? [])]) {
      if (StaticStylesheet.isLayerBlock(node)) {
        StaticStylesheet.wrap(node as AtRule, params)
        scope = undefined
      } else if (StaticStylesheet.isScopable(node)) {
        if (!scope) {
          scope = new AtRule({ name: "scope", params })
          node.before(scope)
        }
        scope.append(node)
      } else {
        scope = undefined
      }
    }
  }

  /** `@layer x { ... }`, not the `@layer a, b;` statement. */
  private static isLayerBlock(node: ChildNode): boolean {
    return node.type === "atrule" && node.name === "layer" && !!node.nodes
  }

  /** Rules and conditional group rules (`@media`, `@container`, `@supports`). */
  private static isScopable(node: ChildNode): boolean {
    if (node.type === "rule") return true
    return node.type === "atrule" && SCOPABLE_AT_RULES.has(node.name)
  }
}

/** A moved rule's copy, and where the original sat (for its `@media` / `@container` ancestry). */
type MovedRule = {
  /** The copy, detached. */
  rule: Rule
  /** The original's parent. */
  parent: Container | Document | undefined
}

/** What `StaticStylesheet.move()` copies, and where to. */
type MoveParams = {
  /** The rule to copy. */
  rule: Rule
  /** Selectors for the copy;  none:  nothing moves. */
  selectors: readonly string[]
  /** The layer's list it joins. */
  into: MovedRule[]
  /** Drop `display`:  the selectors match a box that had none of its own (a DOM element's, a slot's). */
  boxless?: boolean
}

/**
 * Markup the page wrote, not a component's render:  outside every component root, or slotted author content (itself
 * or inside it).
 * - NOTE:  approximate:  a component rendered inside slotted author content counts as the page's too.
 */
const AUTHOR = `:is(:not(${ROOT} *), ${SLOTTED}:not(${ROOT}), ${SLOTTED}:not(${ROOT}) *)`

/** Layer host-only rules move to:  the first, so every component rule on the root beats them. */
const HOST_LAYER = "ui.reset"

/** Layer `::slotted()` rules move to:  before the page's, as they lost to it in a shadow root. */
const SLOTTED_LAYER = "ui-slotted"

/** Layer order a static page starts with:  the page's own CSS before every `ui.*` layer. */
const PAGE_LAYERS = `@layer ${SLOTTED_LAYER}, page, ui;`

/** Where a component's scope stops:  author content's insides, and other components' insides. */
const LIMIT = `${SLOTTED}:not(${ROOT}) > *, :scope ${ROOT} > *`

/**
 * Groups whose items the flattener wraps in `<li data-ui-li>` (the items' DOM element role is `listitem`):
 * their sheets reach items through the wrapper.
 */
const LIST_OWNERS = new Set(["cards", "list", "feed", "steps", "items"])

/** The list item wrapper lays out as its item:  the item's root stays the group's flex / grid child. */
const LIST_ITEMS = `@layer ui.base {\n  ${LIST_ITEM} {\n    display: contents;\n  }\n}`

/** Hidden means hidden, whatever a component's `display` says;  unlayered, so it beats every layer. */
const HIDDEN = `[hidden]:not([hidden="until-found"]) {\n  display: none;\n}`

/** Selectors that only ever match inside a shadow tree. */
const SHADOW_ONLY = /:host|::slotted|:state\(/

/** At-rules that may sit inside `@scope`. */
const SCOPABLE_AT_RULES = new Set(["media", "container", "supports", "starting-style"])
