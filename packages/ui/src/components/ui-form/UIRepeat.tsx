import { createEffect } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E } from "$/ui/core"
import { repeatVocabulary } from "./UIRepeat.en"
import { FormBinding } from "./FormBinding"

import formCSS from "./UIForm.css?inline"

/****************
 * ### `UIRepeat`
 * The component behind `<ui-repeat items>` / `<ui-repeat name>`:  its children once per item of a list,
 * e.g. a row of fields per task in a `<ui-form value>` bound to a to-do list.
 *
 * - The list:  its `items` property, when set (`<ui-repeat items={the shown tasks of the app}>` in spell);
 *   else `scope[name]`, where the scope is the item of the `<ui-repeat>` row around it,
 *   else the `<ui-form>`'s `value` (`FormBinding.scopeAround()`).
 *   - any iterable:  an array, a `Set`, an object with `[Symbol.iterator]` (spell's `List`)
 *   - read inside a Solid computation, so the rows follow the list as it changes:
 *     signals, Spell UI's reactive members, spell's objects
 *   - none, or empty:  no rows
 * - Its children are the TEMPLATE:  a `<template>`, or plain markup, taken into one as it connects
 *   (and children added later, which remake the rows).
 *   - the template stays as its LAST child:  invisible, and so no row is ever `:last-child`
 *   - attribute-only markup:  each row is a fresh copy, so what a framework changes in the template later
 *     doesn't reach the rows (bind it through `name` instead)
 * - Rows:  a copy of the template per item, in the LIGHT DOM, so the form (and the native form) sees their controls.
 *   - each row's top-level elements hold its item as their scope (`FormBinding.hold()`):  the form binds the row's
 *     controls to it, and a `<ui-repeat>` inside reads its list from it
 *   - kept by IDENTITY:  an item added, removed or moved adds, removes or moves only its row's nodes
 *     (with `moveBefore()` where the browser has it, so a moved row keeps focus)
 *   - NO wrapper element per row:  the form's rows of fields drop their bottom margin by `:last-child`,
 *     which a wrapper would make true of every row
 *   - ids in the template repeat in every row:  label controls by `aria-label`, or by wrapping them
 * - The DOM element is `display: contents`:  rows sit in the layout as if written in its place.
 ****************/
export class UIRepeat extends E.UIComponent<typeof repeatVocabulary> {
  @E.proto static vocabulary = repeatVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { form: formCSS },
    delegatesFocus: false
  } satisfies Partial<E.ElementSetup>

  render(): JSX.Element {
    return <slot />
  }

  ////////////////
  // ## The template
  ////////////////

  /** What every row copies:  kept as the last child, once taken. */
  private template: HTMLTemplateElement | undefined

  /** Bumped each time the template is taken:  the rows are made afresh from it. */
  @E.state private accessor templateVersion = 0

  /** Takes the template while connected, and watches for children added later. */
  onMount() {
    createEffect(
      () => this.isConnected,
      (connected) => {
        if (!connected || isServer) return undefined
        this.takeTemplate()
        const observer = new MutationObserver(() => this.takeTemplate())
        observer.observe(this.domElement, { childList: true })
        return () => observer.disconnect()
      }
    )
    return super.onMount()
  }

  /**
   * Copy every child that isn't a row into the template, then remove it;  when any was, the rows are made again.
   * - Copied into the template's own (inert) document, never moved:  a `ui-*` element there stays plain markup,
   *   while one moved there would still finish drawing into a document that isn't the page's.
   * - The removed originals are left to finish drawing (and resolve `ready`, which a page may wait for),
   *   then to be collected:  nothing refers to them.
   */
  private takeTemplate() {
    const { domElement } = this
    const authored = [...domElement.childNodes].filter((node) => node !== this.template && !this.rowOf.has(node))
    if (this.template && !authored.length) return
    const template = (this.template ??= document.createElement("template"))
    const { content } = template
    for (const node of authored) {
      // a `<template>` gives its content;  one made by script may hold its children directly
      const copied = node instanceof HTMLTemplateElement ? [node.content, ...node.childNodes] : [node]
      for (const part of copied) content.append(content.ownerDocument.importNode(part, true))
      node.remove()
    }
    for (const row of this.rows) for (const node of row.nodes) node.remove()
    this.rows = []
    domElement.append(template)
    this.templateVersion++
  }

  ////////////////
  // ## Rows
  ////////////////

  /**
   * The items shown:  `items`, else `scope[name]`, as a list;  `[]` while it's none, or before the template is taken.
   * - Tracked:  reading the property, the scope and the list (and iterating it) inside the effect follows their
   *   changes.
   */
  get shownItems(): readonly unknown[] {
    if (!this.isConnected || !this.templateVersion) return []
    const list = this.items ?? this.listByName()
    return UIRepeat.isIterable(list) ? [...list] : []
  }

  /** `scope[name]`:  the list `name` names, in the scope around the repeat. */
  private listByName(): unknown {
    if (!this.name) return undefined
    const scope = FormBinding.scopeAround(this.domElement)
    return FormBinding.isObject(scope) ? scope[this.name] : undefined
  }

  /** Rows shown, in list order. */
  private rows: Row[] = []

  /** The row each row node belongs to. */
  private readonly rowOf = new WeakMap<Node, Row>()

  /** The list changed:  show a row per item, keeping each item's row. */
  @E.onChange("shownItems")
  protected onItemsChanged(items: readonly unknown[]) {
    const { template } = this
    if (!template) return
    const unused = new Map<unknown, Row[]>()
    for (const row of this.rows) {
      const same = unused.get(row.item)
      if (same) same.push(row)
      else unused.set(row.item, [row])
    }
    const rows = items.map((item) => unused.get(item)?.shift() ?? this.newRow(item, template))
    for (const left of unused.values()) for (const row of left) for (const node of row.nodes) node.remove()
    this.rows = rows
    this.place([...rows.flatMap((row) => row.nodes), template])
  }

  /** A copy of the template for `item`:  its top-level elements hold `item` as their scope. */
  private newRow(item: unknown, template: HTMLTemplateElement): Row {
    const copy = document.importNode(template.content, true)
    const row: Row = { item, nodes: [...copy.childNodes] }
    for (const node of row.nodes) {
      this.rowOf.set(node, row)
      if (node.nodeType === Node.ELEMENT_NODE) FormBinding.hold(node as Element, () => item)
    }
    return row
  }

  /** Put `nodes` in this order as the children, moving only what's out of place. */
  private place(nodes: readonly ChildNode[]) {
    const { domElement } = this
    let next = domElement.firstChild
    for (const node of nodes) {
      if (node === next) next = node.nextSibling
      else UIRepeat.move(domElement, node, next)
    }
  }

  ////////////////
  // ## Pure helpers
  // STATIC, every one:  it reads only its arguments, so it needs no instance.
  ////////////////

  /** Something to repeat over:  iterable, but not a string. */
  private static isIterable(value: unknown): value is Iterable<unknown> {
    return FormBinding.isObject(value) && typeof value[Symbol.iterator] === "function"
  }

  /**
   * `node` into `parent`, before `before`:  `moveBefore()` when both are on the page and the browser has it,
   * so a moved row keeps its focus and state;  else `insertBefore()`.
   */
  private static move(parent: Element, node: ChildNode, before: ChildNode | null) {
    const { moveBefore } = parent as Element & Partial<MovingParent>
    if (moveBefore && node.isConnected && parent.isConnected) moveBefore.call(parent, node, before)
    else parent.insertBefore(node, before)
  }
}

/** The vocabulary getters, typed (`UIComponent`'s doc). */
export interface UIRepeat extends E.AttributeValues<typeof repeatVocabulary> {}

/** One row:  the nodes copied from the template for one item. */
type Row = {
  /** Its item, which its controls bind to. */
  item: unknown
  /** Its top-level nodes, in order. */
  nodes: ChildNode[]
}

/** `Element.moveBefore()`, which not every browser (or TypeScript's DOM types) has yet. */
type MovingParent = {
  /** Move `node` before `child` (`null`:  to the end), keeping its state. */
  moveBefore(node: Node, child: Node | null): void
}
