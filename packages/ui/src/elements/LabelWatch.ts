import { E } from "$/ui/core"
import type { F } from "$/ui/forms"

/****************
 * ### `LabelWatch`
 * One `MutationObserver` per root node (document or shadow root), shared by the `ControlLabels` in it:  refreshes
 * the controls a `<label>` added, removed or re-pointed (`for`) there may name.
 * - Cheap by scope:  exists only while a control is connected in that root;  a batch without a `<label>` in it
 *   costs one pass over its records.
 * - Targeted:  a label with `for` refreshes the controls with that id (old and new `for`);  one without (a wrapping
 *   label) refreshes every control in the root.
 * - `ControlLabels`' helper, in a file of its own (WWOD §8 › "One exported class per file"):  only it imports this,
 *   so it's in neither the `$/ui/elements` barrel nor the `forms` entry.  Knows `ControlLabels` as a type only.
 ****************/
export class LabelWatch {
  /** Controls in this root. */
  private readonly members = new Set<F.ControlLabels>()

  /** The observer, while there are members. */
  private observer?: MutationObserver

  /** The root node watched. */
  private readonly root: Node

  /** A watch over `root`;  callers go through `LabelWatch.of()`, so there's one per root. */
  constructor(root: Node) {
    this.root = root
  }

  /** Start refreshing `member`;  observes from the first one. */
  add(member: F.ControlLabels) {
    this.members.add(member)
    if (this.observer) return
    this.observer = new MutationObserver((records) => this.changed(records))
    this.observer.observe(this.root, {
      childList: true,
      subtree: true,
      attributeFilter: [E.FOR_ATTRIBUTE],
      attributeOldValue: true
    })
  }

  /** Stop refreshing `member`;  stops observing after the last one. */
  remove(member: F.ControlLabels) {
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
        if (!LabelWatch.isLabel(record.target)) continue
        if (record.oldValue) ids.add(record.oldValue)
        ids.add(record.target.htmlFor)
        continue
      }
      for (const nodes of [record.addedNodes, record.removedNodes]) {
        for (const node of nodes) {
          if (node.nodeType !== E.NodeType.element) continue
          const element = node as Element
          const labels = LabelWatch.isLabel(element) ? [element] : element.getElementsByTagName(E.LABEL_TAG)
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

  ////////////////
  // ## Statics
  ////////////////

  /** The watch for `root`, created on first use.  Static:  the one registry of every root's watch. */
  static of(root: Node): LabelWatch {
    let watch = LabelWatch.watches.get(root)
    if (!watch) LabelWatch.watches.set(root, (watch = new LabelWatch(root)))
    return watch
  }

  /**
   * Forget every root's watch, for tests.
   * - NOTE: a watch already handed out keeps observing until its last member leaves.
   */
  static reset() {
    LabelWatch.watches = new WeakMap()
  }

  /** Watches by root node:  page-wide, so every control in a root shares one observer. */
  private static watches = new WeakMap<Node, LabelWatch>()

  /** Is `node` a `<label>`?  By `localName`:  no `HTMLLabelElement` global in a server render. */
  private static isLabel(node: Node): node is HTMLLabelElement {
    return (node as Element).localName === E.LABEL_TAG
  }
}
