/**
 * Small DOM edits the converters share:  moving children, trimming and stripping their text, turning an old title
 * into `<epic-*>` title data.
 * - Plain DOM, no globals (`nodeType`, never `instanceof`):  linkedom documents.
 * - Knows nothing of plan docs beyond `slot="title"`.
 */

/** `node` is an element. */
export function isElement(node: Node | null | undefined): node is Element {
  return node?.nodeType === 1
}

/** `node` is text holding only whitespace (or nothing). */
export function isBlank(node: Node | null | undefined): boolean {
  return node?.nodeType === 3 && !node.textContent?.trim()
}

/** `node` is an element, or text that isn't only whitespace;  comments never count. */
export function isSignificant(node: Node): boolean {
  return isElement(node) || (node.nodeType === 3 && !isBlank(node))
}

/** `element`'s child nodes, detached from it, whitespace at both ends dropped. */
export function takeChildren(element: Element): ChildNode[] {
  const nodes = Array.from(element.childNodes)
  for (const node of nodes) node.remove()
  while (nodes.length && isBlank(nodes[0])) nodes.shift()
  while (nodes.length && isBlank(nodes.at(-1))) nodes.pop()
  return nodes
}

/**
 * Strip `first` from the start of `element`'s first text and `last` from the end of its last, IN PLACE, when that
 * child IS text (not inside markup);  returns what `first` matched, if it did.
 */
export function stripEdges(
  element: Element,
  { first, last }: { first?: RegExp; last?: RegExp }
): RegExpExecArray | null {
  joinText(element)
  let match: RegExpExecArray | null = null
  const head = firstText(element)
  if (head && first) {
    match = first.exec(head.data)
    if (match) head.data = head.data.slice(match[0].length)
  }
  const tail = lastText(element)
  if (tail && last) tail.data = tail.data.replace(last, "")
  return match
}

/**
 * The title `element`'s children make, as `<epic-*>` data:  plain text => `{ title }` (whitespace squeezed);  any
 * markup => `{ slot }`, a new `<span slot="title">` holding the children (moved).
 * - `extra`:  elements that ride in the title too (an `<epic-update>` marker), forcing a slot
 */
export function titleOf(element: Element, extra: Element[] = []): { title?: string; slot?: Element } {
  const hasMarkup = Array.from(element.children).length > 0 || extra.length > 0
  if (!hasMarkup) {
    const title = squeeze(element.textContent ?? "")
    return title ? { title } : {}
  }
  const slot = element.ownerDocument.createElement("span")
  slot.setAttribute("slot", "title")
  slot.append(...takeChildren(element), ...extra.flatMap((it) => [element.ownerDocument.createTextNode(" "), it]))
  return { slot }
}

/** `text` with its whitespace runs as one space, trimmed. */
export function squeeze(text: string): string {
  return text.replace(/\s+/g, " ").trim()
}

/** A new element of `element`'s document, `tag`, holding `nodes`;  `attributes` set in order. */
export function wrap(element: Node, tag: string, nodes: Node[], attributes: Record<string, string> = {}): Element {
  const document = element.ownerDocument ?? (element as unknown as Document)
  const made = document.createElement(tag)
  for (const [name, value] of Object.entries(attributes)) made.setAttribute(name, value)
  made.append(...nodes)
  return made
}

/**
 * Write every `&` in `document`'s attribute values as `&amp;`, IN PLACE, just before it's serialized:  linkedom
 * (0.18) escapes only `"` in an attribute, so a title saying `&lt;x&gt;` would be written `title="&lt;x&gt;"` and
 * read back as `<x>`.
 * - HACK: the values are WRONG in the DOM afterwards (escaped twice):  serialize, never read it again
 */
export function escapeAmpersands(document: Document): void {
  for (const element of document.querySelectorAll("*")) {
    for (const { name, value } of Array.from(element.attributes)) {
      if (value.includes("&")) element.setAttribute(name, value.replaceAll("&", "&amp;"))
    }
  }
}

/**
 * Join `element`'s adjacent text children into one, IN PLACE:  linkedom parses one run of text as several nodes
 * (` ` then `· Named palette`), so a prefix may start in one and end in the next.
 */
export function joinText(element: Element): void {
  let previous: Text | undefined
  for (const node of Array.from(element.childNodes)) {
    if (node.nodeType !== 3) {
      previous = undefined
      continue
    }
    if (previous) {
      previous.data += (node as Text).data
      node.remove()
    } else previous = node as Text
  }
}

/** `element`'s first child, when it's text. */
function firstText(element: Element): Text | undefined {
  const node = element.firstChild
  return node?.nodeType === 3 ? (node as Text) : undefined
}

/** `element`'s last child, when it's text. */
function lastText(element: Element): Text | undefined {
  const node = element.lastChild
  return node?.nodeType === 3 ? (node as Text) : undefined
}
