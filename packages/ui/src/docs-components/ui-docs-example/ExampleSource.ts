import { E } from "$/ui/core"
import { HtmlFormatter } from "./HtmlFormatter"

/****************
 * ### `ExampleSource`
 * The markup `<ui-docs-example>` shows as its code:  its OWN light-DOM children, as authored.
 * - The problem:  the element is defined LAZILY (`<ui-root>` imports its family on first use), so by the time its
 *   controller runs, the `<ui-button>`s inside may be upgraded already.  An upgrade adds a shadow root (not in
 *   `innerHTML`), and the runtime may touch the light DOM:  a roving `tabindex` on items, transition markers, a
 *   `<ui-include>`'s fetched content.  So the source is read, first match wins:
 *   1. a `<template>` child:  its markup, EXACTLY (never parsed into live elements;  the element stamps a copy out
 *      live).  Use it when an example's markup changes as it runs.
 *   2. a SNAPSHOT:  the host's `innerHTML` taken by `snapshot()` before any family loaded -- the site bundle's entry
 *      (`site/_src/site.ts`) calls it first thing, so every example parsed with the page is read pristine.
 *   3. the host's `innerHTML` NOW, minus `RUNTIME_ATTRIBUTES`:  examples added after the entry ran (a
 *      `<ui-include>`d part, a test, an app) -- unless `keep()` saw them first (the site's router keeps every
 *      page it swaps in).
 * - Then:  children of the example's own named slots (`description`) are dropped, and `HtmlFormatter` re-indents.
 * - Limits:
 *   - (3) can't tell an author's `tabindex` from a roving one, and keeps anything else a family wrote into its light
 *     DOM;  use a `<template>` there
 *   - `innerHTML` normalizes:  attribute quotes become `"`, entities are re-escaped (`&gt;` stays, `>` in text
 *     becomes `&gt;`), boolean attributes lose their `=""` (`HtmlFormatter`);  comments survive
 * - Plain DOM, no Solid:  the site entry imports it without the element.
 * - Static:  the snapshots are page-wide (on `globalThis`, `SNAPSHOTS_KEY`), taken before any element exists.
 ****************/
export class ExampleSource {
  /**
   * Keep the markup of every `<ui-docs-example>` under `root` that isn't defined yet;  returns how many.
   * - Call BEFORE any family loads:  the site entry does, at the top.  Later calls only add new examples.
   * - SIDE EFFECT:  fills the page-wide snapshot map.
   */
  static snapshot(root: ParentNode = document): number {
    let count = 0
    for (const host of root.querySelectorAll(`${EXAMPLE_TAG}:not(:defined)`)) {
      if (ExampleSource.snapshots.has(host)) continue
      ExampleSource.snapshots.set(host, host.innerHTML)
      count++
    }
    return count
  }

  /**
   * Keep the markup of every `<ui-docs-example>` in `root` -- a fragment about to go into the page (a
   * `<ui-include>`'s `ui-insert`) -- defined or not;  returns how many.
   * - Its elements may be upgraded already (imported into a document whose families are defined), but not yet
   *   connected, so their light DOM is still as authored.
   * - URLs the include rewrote go back to what the page wrote (`data-ui-include-*`):  the code shows the source.
   * - SIDE EFFECT:  fills the page-wide snapshot map.
   */
  static keep(root: ParentNode): number {
    let count = 0
    for (const host of root.querySelectorAll(EXAMPLE_TAG)) {
      if (ExampleSource.snapshots.has(host)) continue
      ExampleSource.snapshots.set(host, ExampleSource.authored(host))
      count++
    }
    return count
  }

  /** The code to show for `host`:  its example markup (see the class), cleaned and re-indented. */
  static of(host: Element): string {
    const template = ExampleSource.template(host)
    if (template) return ExampleSource.format(template.innerHTML, "authored")
    const snapshot = ExampleSource.snapshots.get(host)
    return ExampleSource.format(snapshot ?? host.innerHTML, snapshot === undefined ? "live" : "authored")
  }

  /** `host`'s top-level `<template>` child, if it has one:  the example's markup, kept inert. */
  static template(host: Element): HTMLTemplateElement | undefined {
    for (const child of host.children) if (child.localName === TEMPLATE_TAG) return child as HTMLTemplateElement
    return undefined
  }

  /**
   * `html` as shown code:  the example's own slotted chrome dropped, `live` markup stripped of runtime attributes,
   * re-indented.
   * - Parsed into an inert `<template>`:  nothing in it upgrades or loads.
   */
  static format(html: string, origin: MarkupOrigin): string {
    const inert = document.createElement(TEMPLATE_TAG)
    inert.innerHTML = html
    for (const child of [...inert.content.children]) if (OWN_SLOTS.includes(child.slot)) child.remove()
    if (origin === "live") {
      for (const element of inert.content.querySelectorAll("*")) {
        for (const name of RUNTIME_ATTRIBUTES) element.removeAttribute(name)
      }
    }
    return HtmlFormatter.format(inert.innerHTML)
  }

  ////////////////
  // ## Internal
  ////////////////

  /** Host => its markup before upgrades, on `globalThis` (see `SNAPSHOTS_KEY`). */
  private static get snapshots(): WeakMap<Element, string> {
    return ((globalThis as SnapshotGlobal)[SNAPSHOTS_KEY] ??= new WeakMap())
  }

  /** `host`'s inner markup with every URL an include rewrote put back as written. */
  private static authored(host: Element): string {
    const copy = document.createElement(TEMPLATE_TAG)
    copy.innerHTML = host.innerHTML
    for (const element of copy.content.querySelectorAll("*")) {
      for (const attribute of [...element.attributes]) {
        if (!attribute.name.startsWith(E.ORIGINAL_PREFIX)) continue
        element.setAttribute(attribute.name.slice(E.ORIGINAL_PREFIX.length), attribute.value)
        element.removeAttribute(attribute.name)
      }
    }
    return copy.innerHTML
  }
}

/**
 * Where markup `ExampleSource.format()` gets came from:
 * - `authored`:  as written (a `<template>`, a snapshot):  shown as is
 * - `live`:  read from an upgraded tree:  `RUNTIME_ATTRIBUTES` are stripped
 */
export type MarkupOrigin = "authored" | "live"

/** The tag whose markup `ExampleSource.snapshot()` keeps:  `docsExampleVocabulary.tag`, as a value. */
const EXAMPLE_TAG = "ui-docs-example"

/** The inert container an example's markup is read from, or parsed into. */
const TEMPLATE_TAG = "template"

/**
 * `globalThis` key of the page's markup snapshots (`ExampleSource.snapshot()`):  host => its `innerHTML` before any
 * family upgraded it.
 * - A registered symbol, so the site entry's copy of `ExampleSource` and the lazily loaded family's agree even if a
 *   bundler gave each its own copy of the module.
 */
const SNAPSHOTS_KEY = Symbol.for("@spell-app/ui-docs:example-sources")

/** `globalThis` with the snapshots. */
type SnapshotGlobal = typeof globalThis & { [SNAPSHOTS_KEY]?: WeakMap<Element, string> }

/**
 * Named slots of the example ITSELF:  their children are its chrome, not part of the example's markup.
 * - The default slot (`""`) is the example.
 */
const OWN_SLOTS: readonly string[] = ["description"]

/**
 * Attributes the RUNTIME puts on light-DOM elements, never written by an author:  stripped from the shown markup
 * when it's read from a live (already upgraded) tree.
 * - `RovingTabindex`'s `tabindex` is NOT here:  authors write `tabindex` too.  A snapshot or a `<template>` avoids
 *   the problem (see `ExampleSource`).
 */
const RUNTIME_ATTRIBUTES: readonly string[] = ["data-ui-animation", "data-ui-hidden-by-animation"]
