import { HtmlFormatter } from "./HtmlFormatter"
import { EXAMPLE_TAG, OWN_SLOTS, RUNTIME_ATTRIBUTES, SNAPSHOTS_KEY, type SnapshotGlobal } from "./ui-docs-example.types"

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
 *      `<ui-include>`d part, a test, an app).
 * - Then:  children of the example's own named slots (`description`) are dropped, and `HtmlFormatter` re-indents.
 * - Limits:
 *   - (3) can't tell an author's `tabindex` from a roving one, and keeps anything else a family wrote into its light
 *     DOM;  use a `<template>` there
 *   - `innerHTML` normalizes:  attribute quotes become `"`, entities are re-escaped (`&gt;` stays, `>` in text
 *     becomes `&gt;`), boolean attributes lose their `=""` (`HtmlFormatter`);  comments survive
 * - Plain DOM, no Solid:  the site entry imports it without the element.
 ****************/
export class ExampleSource {
  /** Host => its markup before upgrades, on `globalThis` (see `SNAPSHOTS_KEY`). */
  private static get snapshots(): WeakMap<Element, string> {
    return ((globalThis as SnapshotGlobal)[SNAPSHOTS_KEY] ??= new WeakMap())
  }

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

  /** `host`'s top-level `<template>` child, if it has one:  the example's markup, kept inert. */
  static template(host: Element): HTMLTemplateElement | undefined {
    for (const child of host.children) if (child instanceof HTMLTemplateElement) return child
    return undefined
  }

  /** The code to show for `host`:  its example markup (see the class), cleaned and re-indented. */
  static of(host: Element): string {
    const template = ExampleSource.template(host)
    if (template) return ExampleSource.format(template.innerHTML, false)
    const snapshot = ExampleSource.snapshots.get(host)
    return ExampleSource.format(snapshot ?? host.innerHTML, snapshot === undefined)
  }

  /**
   * `html` as shown code:  the example's own slotted chrome dropped, `live` markup stripped of runtime attributes,
   * re-indented.
   * - Parsed into an inert `<template>`:  nothing in it upgrades or loads.
   */
  static format(html: string, live: boolean): string {
    const inert = document.createElement("template")
    inert.innerHTML = html
    for (const child of [...inert.content.children]) {
      const slot = child.getAttribute("slot")
      if (slot !== null && OWN_SLOTS.includes(slot)) child.remove()
    }
    if (live) {
      for (const element of inert.content.querySelectorAll("*")) {
        for (const name of RUNTIME_ATTRIBUTES) element.removeAttribute(name)
      }
    }
    return HtmlFormatter.format(inert.innerHTML)
  }
}
