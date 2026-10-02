import postcss, { AtRule, type ChildNode, type Container, type Document, type Rule } from "postcss"

import { pageCSS, resetCSS } from "$/ui/styles"

import type { StaticFamily, StaticSheetUsage } from "./server.types"
import { StaticSelectors, type StaticSelectorOptions } from "./StaticSelectors"

/****************
 * ### `StaticStylesheet`
 * The ONE stylesheet a static page (`StaticRender`) links:  the page foundation, then every family's sheets
 * rewritten for light DOM, each kept to its own component.
 * - Order:
 *   1. `@layer page, ui;`:  a page's own CSS goes in `@layer page`, so components win where both set a property
 *      (unlayered page CSS would beat every `ui.*` layer)
 *   2. `pageCSS`:  layers, tokens, colors ... typography, native, as a page with elements gets them, less the
 *      shadow-only selectors (`page()`)
 *   3. `reset.css`, which only ever applied inside shadow roots:  scoped to every component
 *   4. each family's sheets (`styles`), selectors rewritten (`StaticSelectors`), wrapped in `@scope`
 *   5. list item wrappers as `display: contents`;  `[hidden]`, unlayered:  component `display` rules would beat
 *      the browser's own
 * - The `@scope` boundary stands in for the shadow boundary:  from a component's root (`data-ui="<noun>"`) down
 *   to, not into, other components and author content:
 *   - `[data-ui-slotted]:not([data-ui]) > *`:  slotted author elements are in scope (as `::slotted()` reached
 *     them), their insides aren't
 *   - `:scope [data-ui] > *`:  another component's root is in scope (slotted, or rendered inside this one's
 *     markup), its insides aren't
 *   - NOTE: a slotted COMPONENT's root carries `data-ui-slotted` too, so the first clause skips `[data-ui]`:
 *     otherwise its own scope would end at its own children
 * - A sheet shared by several families (`ui-parts.css`) is emitted once, scoped to all their nouns.
 ****************/
export class StaticStylesheet {
  /**
   * The stylesheet for `families`.
   * - `usage` (`StaticRender.sheetUsage`):  which elements were seen adopting which sheets, in what order.
   *   - each sheet is scoped to its users as well as its own families (items adopting their list's sheet)
   *   - sheets are emitted in an order that keeps every adoption order seen (`ordered()`):  a sheet's layers are
   *     declared where it first appears, and a later layer wins, as a later-adopted sheet did in a shadow root
   */
  static build(families: Iterable<StaticFamily>, usage?: StaticSheetUsage): string {
    const sheets = new Map<string, { css: string; nouns: Set<string> }>()
    for (const { Class, definition } of families) {
      for (const [name, css] of Object.entries(Class.prototype.styles)) {
        let sheet = sheets.get(name)
        if (!sheet) sheets.set(name, (sheet = { css, nouns: new Set() }))
        sheet.nouns.add(definition.vocabulary.noun)
      }
    }
    for (const [name, nouns] of usage?.users ?? []) for (const noun of nouns) sheets.get(name)?.nouns.add(noun)
    const parts = [
      PAGE_LAYERS,
      ...pageCSS.map((sheet) => StaticStylesheet.page(sheet)),
      StaticStylesheet.scope(resetCSS, "[data-ui]")
    ]
    for (const name of StaticStylesheet.ordered([...sheets.keys()], usage?.orders.values() ?? [])) {
      const { css, nouns } = sheets.get(name)!
      const roots = [...nouns].map((noun) => `[data-ui="${noun}"]`).join(", ")
      const listItems = [...nouns].some((noun) => LIST_OWNERS.has(noun))
      parts.push(`/* ${name} */\n${StaticStylesheet.scope(css, `:is(${roots})`, { listItems })}`)
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
  static page(css: string): string {
    const sheet = postcss.parse(css)
    sheet.walkRules((rule) => {
      const selectors = rule.selectors.filter((selector) => !SHADOW_ONLY.test(selector))
      if (!selectors.length) rule.remove()
      else if (selectors.length !== rule.selectors.length) rule.selectors = selectors
    })
    sheet.walkAtRules((rule) => {
      if (rule.nodes && !rule.nodes.length) rule.remove()
    })
    return sheet.toString()
  }

  /**
   * `css` rewritten for light DOM, its rules wrapped in `@scope (<root>) to (<limit>)`.
   * - Host-only rules move to `@layer ui.reset`, the first layer:  what the host set (token resets, `color`), the
   *   root's own rules overrode, being another element;  on the SAME element now, any later layer must still win.
   */
  static scope(css: string, root: string, options: StaticSelectorOptions = {}): string {
    const sheet = postcss.parse(css)
    const hostRules: HostRule[] = []
    sheet.walkRules((rule) => StaticStylesheet.rewriteRule(rule, options, hostRules))
    if (hostRules.length) sheet.append(StaticStylesheet.hostLayer(hostRules))
    StaticStylesheet.wrap(sheet, `(${root}) to (${LIMIT})`)
    return sheet.toString()
  }

  /** `@layer ui.reset { ... }` of `rules`, each inside clones of its conditional at-rules (`@media` ...). */
  private static hostLayer(rules: readonly HostRule[]): AtRule {
    const layer = new AtRule({ name: "layer", params: HOST_LAYER })
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
   * - Host-only selectors (`:host(X)` alone) go to a copy of the rule without `display` (that was the host
   *   box's, never the root's, and the class-grammar twins beside them keep theirs), collected in `hostRules`.
   */
  private static rewriteRule(rule: Rule, options: StaticSelectorOptions, hostRules: HostRule[]) {
    if (rule.parent?.type === "atrule" && (rule.parent as AtRule).name.endsWith("keyframes")) return
    const kept: string[] = []
    const hostOnly: string[] = []
    for (const selector of rule.selectors) {
      const result = StaticSelectors.rewrite(selector, options)
      ;(result.hostOnly ? hostOnly : kept).push(...result.selectors)
    }
    if (hostOnly.length) {
      const copy = rule.clone({ selectors: [...new Set(hostOnly)] })
      copy.walkDecls("display", (declaration) => void declaration.remove())
      if (copy.nodes.length) hostRules.push({ rule: copy, parent: rule.parent })
    }
    if (kept.length) rule.selectors = [...new Set(kept)]
    else rule.remove()
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

/** A host-only rule's copy, and where the original sat (for its `@media` / `@container` ancestry). */
type HostRule = {
  /** The copy, detached. */
  rule: Rule
  /** The original's parent. */
  parent: Container | Document | undefined
}

/** Layer host-only rules move to:  the first, so every component rule on the root beats them. */
const HOST_LAYER = "ui.reset"

/** Layer order a static page starts with:  the page's own CSS before every `ui.*` layer. */
const PAGE_LAYERS = "@layer page, ui;"

/** Where a component's scope stops:  author content's insides, and other components' insides. */
const LIMIT = "[data-ui-slotted]:not([data-ui]) > *, :scope [data-ui] > *"

/**
 * Groups whose items the flattener wraps in `<li data-ui-li>` (the items' host role is `listitem`):  their sheets
 * reach items through the wrapper.
 */
const LIST_OWNERS = new Set(["cards", "list", "feed", "steps", "items"])

/** The list item wrapper lays out as its item:  the item's root stays the group's flex / grid child. */
const LIST_ITEMS = `@layer ui.base {\n  [data-ui-li] {\n    display: contents;\n  }\n}`

/** Hidden means hidden, whatever a component's `display` says;  unlayered, so it beats every layer. */
const HIDDEN = `[hidden]:not([hidden="until-found"]) {\n  display: none;\n}`

/** Selectors that only ever match inside a shadow tree. */
const SHADOW_ONLY = /:host|::slotted|:state\(/

/** At-rules that may sit inside `@scope`. */
const SCOPABLE_AT_RULES = new Set(["media", "container", "supports"])
