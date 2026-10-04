/**
 * One inline node:  text, a code span, emphasis, a link ... -- in a doubly-linked tree, as commonmark.js keeps them.
 * - Why linked, not arrays:  emphasis and links WRAP runs of siblings after the fact (`*a [b* c]`), and the
 *   delimiter and bracket stacks point at nodes that move.  Unlinking and appending is O(1) and keeps those
 *   pointers good.
 * - Fields only some kinds use are optional, named for what they mean there.
 */
export class InlineNode {
  constructor(
    /** What it is. */
    public kind: InlineKind,
    /** `text`, `code`, `html`:  its text (`text` is what's drawn, escapes resolved). */
    public text = ""
  ) {}

  /** `link` / `image`:  where it goes. */
  destination?: string
  /** `link` / `image`:  its title, `""` for none. */
  title?: string

  parent?: InlineNode
  first?: InlineNode
  last?: InlineNode
  prev?: InlineNode
  next?: InlineNode

  /** Add `child` as our last child.  SIDE EFFECT:  unlinks it from where it was. */
  append(child: InlineNode) {
    child.unlink()
    child.parent = this
    if (this.last) {
      this.last.next = child
      child.prev = this.last
    } else this.first = child
    this.last = child
    return child
  }

  /** Put `sibling` right after us.  SIDE EFFECT:  unlinks it from where it was. */
  insertAfter(sibling: InlineNode) {
    sibling.unlink()
    sibling.next = this.next
    if (sibling.next) sibling.next.prev = sibling
    sibling.prev = this
    this.next = sibling
    sibling.parent = this.parent
    if (sibling.parent && !sibling.next) sibling.parent.last = sibling
  }

  /** Take us out of our parent. */
  unlink() {
    if (this.prev) this.prev.next = this.next
    else if (this.parent) this.parent.first = this.next
    if (this.next) this.next.prev = this.prev
    else if (this.parent) this.parent.last = this.prev
    this.parent = this.prev = this.next = undefined
  }

  /** Our children, in order. */
  children() {
    const children: InlineNode[] = []
    for (let child = this.first; child; child = child.next) children.push(child)
    return children
  }
}

/** What an inline node is. */
export type InlineKind =
  | "root"
  | "text"
  | "softbreak"
  | "linebreak"
  | "code"
  | "html"
  | "emph"
  | "strong"
  | "del"
  | "link"
  | "image"
