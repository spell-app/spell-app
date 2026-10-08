import { onSettled } from "solid-js"
import { isServer } from "@solidjs/web"

import { E } from "$/ui/core"
import type { F } from "$/ui/forms"
// Not in the `forms` entry:  `ControlLabels`' own helper
import { LabelWatch } from "./LabelWatch"

/****************
 * ### `ControlLabels`
 * The accessible name of a form control's INNER element (the `<input>` in its shadow root), from whatever names
 * its HOST.
 * - Why:  `<label for="email">` + `<ui-input id="email">` labels the host (`ElementInternals.labels`), but the
 *   focusable element inside has no name of its own, and `aria-labelledby` can't point across the shadow boundary.
 *   The element hands `accessibleName` to its inner control as `aria-label`.
 * - Sources, first wins:
 *   - host `aria-label`
 *   - host `aria-labelledby`:  ids resolved in the host's tree, their text joined
 *   - the host's `<label>`s (`internals.labels`), their text joined -- text inside the host itself is skipped, so
 *     a wrapping `<label>Name <ui-input></ui-input></label>` names it "Name"
 * - Watched (`MutationObserver`s), re-read on connect and on focus too:
 *   - the host's attributes
 *   - the current labels' text
 *   - `<label>`s added to / removed from the host's tree, and their `for` changes:  ONE observer per root node
 *     (document or shadow root), shared by every control in it (`LabelWatch`)
 *   - NOTE: `aria-labelledby` targets added later are not watched
 * - Server render (`$/ui/static`):  read ONCE, in the constructor, from the parsed page (`serverLabels()`);
 *   nothing is watched.  Why:  a slider thumb, a rating's radio group, an inline calendar's group can't be named by
 *   a `<label for>` on the static page either.
 * - MUST be created under the element's owner (it creates an `onSettled`).
 * - Part of the `forms` entry:  reaches the core through the `$/ui/core` ENTRY (`E`), never its leaves, and its
 *   `forms` peers through `F` (`forms.ts`);  `LabelWatch` directly, its own helper, in neither entry.  `@E.state` is
 *   safe while this module evaluates:  the core never imports `forms`.
 ****************/
export class ControlLabels {
  /**
   * The inner control's accessible name (the platform's term), `undefined` when nothing names the host;  tracked.
   */
  @E.state accessor accessibleName: string | undefined = undefined

  /** The host. */
  private readonly host: F.FormHost

  /** Watches the labels found last. */
  private labelObserver?: MutationObserver

  /** Watches the host's root node for `<label>`s coming and going. */
  private watch?: LabelWatch

  /** The name of `host`'s inner control;  call it under the element's owner. */
  constructor(host: F.FormHost) {
    this.host = host
    // a server render (`$/ui/static`) reads the page once:  nothing changes, nothing is watched
    if (isServer) {
      this.accessibleName = this.nameFor(this.serverLabels())
      return
    }
    onSettled(() => {
      const refresh = () => this.refresh()
      const hostObserver = new MutationObserver(refresh)
      hostObserver.observe(host, { attributeFilter: WATCHED_ATTRIBUTES })
      host.addEventListener("focusin", refresh)
      this.refresh()
      return () => {
        hostObserver.disconnect()
        this.labelObserver?.disconnect()
        this.watch?.remove(this)
        this.watch = undefined
        host.removeEventListener("focusin", refresh)
      }
    })
  }

  /** Its host's `id`:  which `<label for>`s concern it (`LabelWatch`). */
  get id(): string {
    return this.host.id
  }

  /** Re-read the name now, and re-watch the current labels and root;  call on connect. */
  refresh() {
    const { host } = this
    const watch = host.isConnected ? LabelWatch.of(host.getRootNode()) : undefined
    if (watch !== this.watch) {
      this.watch?.remove(this)
      watch?.add(this)
      this.watch = watch
    }
    const labels = this.labels()
    this.labelObserver?.disconnect()
    if (labels.length) {
      this.labelObserver ??= new MutationObserver(() => this.refresh())
      for (const label of labels) {
        this.labelObserver.observe(label, { childList: true, characterData: true, subtree: true })
      }
    }
    this.accessibleName = this.nameFor(labels)
  }

  ////////////////
  // ## Reading the name
  ////////////////

  /**
   * The `<label>`s naming the host, in document order.
   * - `internals.labels`, checked against `label.control`, plus the root's `<label for>` this host's `id`:  Firefox
   *   leaves `internals.labels` stale when a label's `for` changes (a retargeted label stays in it, and one retargeted
   *   to the host never joins it).
   */
  private labels(): HTMLLabelElement[] {
    const { host } = this
    const found = new Set(host.labels as NodeListOf<HTMLLabelElement>)
    if (host.id && host.isConnected) {
      const root = host.getRootNode() as Document | ShadowRoot
      const selector = `${E.LABEL_TAG}[${E.FOR_ATTRIBUTE}="${CSS.escape(host.id)}"]`
      for (const label of root.querySelectorAll<HTMLLabelElement>(selector)) found.add(label)
    }
    return [...found].filter((label) => label.control === host).sort(E.byDocumentOrder)
  }

  /**
   * `labels()` in a server render, where the host is a linkedom element:  no `internals.labels`, no `label.control`,
   * no `CSS.escape`.
   * - The `<label>` wrapping the host (without a `for`, or `for` its id), then the root's `<label for>` its `id`;
   *   in document order, as an ancestor comes first.
   */
  private serverLabels(): HTMLLabelElement[] {
    const { host } = this
    const found = new Set<HTMLLabelElement>()
    const wrapping = host.parentElement?.closest<HTMLLabelElement>(E.LABEL_TAG)
    const wrappingFor = wrapping?.getAttribute(E.FOR_ATTRIBUTE)
    if (wrapping && (wrappingFor === null || wrappingFor === host.id)) found.add(wrapping)
    if (host.id) {
      const root = host.getRootNode() as Document | ShadowRoot
      const id = host.id.replace(/["\\]/g, "\\$&")
      const selector = `${E.LABEL_TAG}[${E.FOR_ATTRIBUTE}="${id}"]`
      for (const label of root.querySelectorAll?.<HTMLLabelElement>(selector) ?? []) found.add(label)
    }
    return [...found]
  }

  /** The name from the host's attributes, else from `labels`. */
  private nameFor(labels: readonly HTMLLabelElement[]): string | undefined {
    const { host } = this
    const own = host.getAttribute(ARIA_LABEL)?.trim()
    if (own) return own
    const ids = host.getAttribute(ARIA_LABELLEDBY)?.trim()
    if (ids) {
      const root = host.getRootNode() as Document | ShadowRoot
      const text = ids
        .split(/\s+/)
        .map((id) => root.getElementById?.(id)?.textContent?.trim() ?? "")
        .filter(Boolean)
        .join(" ")
      if (text) return text
    }
    const text = labels
      .map((label) => this.labelTextFor(label))
      .filter(Boolean)
      .join(" ")
    return text || undefined
  }

  /** Text of `label`, minus anything inside the host, whitespace collapsed. */
  private labelTextFor(label: HTMLLabelElement): string {
    return this.textFor(label).replace(/\s+/g, " ").trim()
  }

  /**
   * Text nodes' text under `node`, in order, skipping the host's subtree.
   * - A walk over `childNodes`, not a `TreeWalker`:  a server render's linkedom document has none.
   */
  private textFor(node: Node): string {
    if (node === this.host) return ""
    if (node.nodeType === E.NodeType.text) return node.textContent ?? ""
    let text = ""
    for (const child of node.childNodes) text += this.textFor(child)
    return text
  }
}

/** Host attribute with an explicit name. */
const ARIA_LABEL = "aria-label"

/** Host attribute pointing at naming elements. */
const ARIA_LABELLEDBY = "aria-labelledby"

/** Host attributes that change the name (`id` changes which `<label for>`s match). */
const WATCHED_ATTRIBUTES = [ARIA_LABEL, ARIA_LABELLEDBY, "id"]
