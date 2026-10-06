import { onSettled, type Accessor } from "solid-js"
import { isServer } from "@solidjs/web"

// through the `core` ENTRY, see `FormElement.ts`
import { Cell, NodeType } from "$/ui/core"

import type { FormHost } from "./FormHost"

/**
 * The accessible name of a form control's INNER element (the `<input>` in its shadow root), from whatever names
 * its HOST.
 * - Why:  `<label for="email">` + `<ui-input id="email">` labels the host (`ElementInternals.labels`), but the
 *   focusable element inside has no name of its own, and `aria-labelledby` can't point across the shadow boundary.
 *   The element hands `name()` to its inner control as `aria-label`.
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
 * - Server render (`$/ui/server`):  read ONCE, in the constructor, from the parsed page (`serverLabels()`);
 *   nothing is watched.  Why:  a slider thumb, a rating's radio group, an inline calendar's group can't be named by
 *   a `<label for>` on the static page either.
 * - MUST be created under the element's owner (it creates a signal and an `onSettled`).
 */
export class ControlLabels {
  /** Name for the inner control, `undefined` when nothing names the host;  tracked. */
  readonly name: Accessor<string | undefined>

  /** The host. */
  private readonly host: FormHost

  /** Writes `name`. */
  private readonly cell: Cell<string | undefined>

  /** Watches the labels found last. */
  private labelObserver?: MutationObserver

  /** Watches the host's root node for `<label>`s coming and going. */
  private watch?: LabelWatch

  constructor(host: FormHost) {
    this.host = host
    // a server render (`$/ui/server`) reads the page once:  nothing changes, nothing is watched
    this.cell = new Cell<string | undefined>(isServer ? this.compute(this.serverLabels()) : undefined)
    this.name = this.cell.get
    if (isServer) return
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
    this.cell.set(this.compute(labels))
  }

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
      for (const label of root.querySelectorAll<HTMLLabelElement>(`label[for="${CSS.escape(host.id)}"]`)) {
        found.add(label)
      }
    }
    return [...found]
      .filter((label) => label.control === host)
      .sort((a, b) => (a.compareDocumentPosition(b) & DOCUMENT_POSITION_FOLLOWING ? -1 : 1))
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
    const wrapping = host.parentElement?.closest<HTMLLabelElement>(LABEL)
    if (wrapping && (!wrapping.hasAttribute(FOR) || wrapping.getAttribute(FOR) === host.id)) found.add(wrapping)
    if (host.id) {
      const root = host.getRootNode() as Document | ShadowRoot
      const id = host.id.replace(/["\\]/g, "\\$&")
      for (const label of root.querySelectorAll?.<HTMLLabelElement>(`${LABEL}[${FOR}="${id}"]`) ?? []) found.add(label)
    }
    return [...found]
  }

  /** The name from the host's attributes, else `labels`. */
  private compute(labels: readonly HTMLLabelElement[]): string | undefined {
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
      .map((label) => this.textOf(label))
      .filter(Boolean)
      .join(" ")
    return text || undefined
  }

  /** Its host's `id`:  which `<label for>`s concern it. */
  get id(): string {
    return this.host.id
  }

  /** Text of `label`, minus anything inside the host. */
  private textOf(label: HTMLLabelElement): string {
    return this.textIn(label).replace(/\s+/g, " ").trim()
  }

  /**
   * Text nodes' text under `node`, in order, skipping the host's subtree.
   * - A walk over `childNodes`, not a `TreeWalker`:  a server render's linkedom document has none.
   */
  private textIn(node: Node): string {
    if (node === this.host) return ""
    if (node.nodeType === NodeType.text) return node.textContent ?? ""
    let text = ""
    for (const child of node.childNodes) text += this.textIn(child)
    return text
  }
}

/****************
 * ### `LabelWatch`
 * One `MutationObserver` per root node (document or shadow root), shared by the `ControlLabels` in it:  refreshes
 * the controls a `<label>` added, removed or re-pointed (`for`) there may name.
 * - Cheap by scope:  exists only while a control is connected in that root;  a batch without a `<label>` in it
 *   costs one pass over its records.
 * - Targeted:  a label with `for` refreshes the controls with that id (old and new `for`);  one without (a wrapping
 *   label) refreshes every control in the root.
 ****************/
class LabelWatch {
  /** Watches by root node. */
  private static readonly watches = new WeakMap<Node, LabelWatch>()

  /** Controls in this root. */
  private readonly members = new Set<ControlLabels>()

  /** The observer, while there are members. */
  private observer?: MutationObserver

  /** The root node watched. */
  private readonly root: Node

  constructor(root: Node) {
    this.root = root
  }

  /** The watch for `root`, created on first use. */
  static of(root: Node): LabelWatch {
    let watch = LabelWatch.watches.get(root)
    if (!watch) LabelWatch.watches.set(root, (watch = new LabelWatch(root)))
    return watch
  }

  /** Start refreshing `member`;  observes from the first one. */
  add(member: ControlLabels) {
    this.members.add(member)
    if (this.observer) return
    this.observer = new MutationObserver((records) => this.changed(records))
    this.observer.observe(this.root, {
      childList: true,
      subtree: true,
      attributeFilter: [FOR],
      attributeOldValue: true
    })
  }

  /** Stop refreshing `member`;  stops observing after the last one. */
  remove(member: ControlLabels) {
    this.members.delete(member)
    if (this.members.size) return
    this.observer?.disconnect()
    this.observer = undefined
  }

  /** Refresh the members `records` may concern. */
  private changed(records: MutationRecord[]) {
    const ids = new Set<string>()
    let all = false
    for (const record of records) {
      if (record.type === "attributes") {
        if (!isLabel(record.target)) continue
        if (record.oldValue) ids.add(record.oldValue)
        ids.add((record.target as HTMLLabelElement).htmlFor)
        continue
      }
      for (const nodes of [record.addedNodes, record.removedNodes]) {
        for (const node of nodes) {
          if (node.nodeType !== NodeType.element) continue
          const element = node as Element
          const labels = isLabel(element) ? [element] : element.getElementsByTagName(LABEL)
          for (const label of labels as Iterable<HTMLLabelElement>) {
            if (label.htmlFor) ids.add(label.htmlFor)
            else all = true
          }
        }
      }
    }
    if (!all && !ids.size) return
    for (const member of [...this.members]) if (all || ids.has(member.id)) member.refresh()
  }
}

/** Is `node` a `<label>`? */
function isLabel(node: Node): node is HTMLLabelElement {
  return (node as Element).localName === LABEL
}

/** Label tag. */
const LABEL = "label"

/** Label attribute naming its control by id. */
const FOR = "for"

/** Host attribute with an explicit name. */
const ARIA_LABEL = "aria-label"

/** Host attribute pointing at naming elements. */
const ARIA_LABELLEDBY = "aria-labelledby"

/** Host attributes that change the name (`id` changes which `<label for>`s match). */
const WATCHED_ATTRIBUTES = [ARIA_LABEL, ARIA_LABELLEDBY, "id"]

/** `Node.DOCUMENT_POSITION_FOLLOWING`, without the `Node` global. */
const DOCUMENT_POSITION_FOLLOWING = 4
