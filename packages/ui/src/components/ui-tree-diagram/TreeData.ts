import { JSON_SCRIPT_TYPE, type TreeDiagramNode, type TreeDiagramSummaryKey } from "./ui-tree-diagram.types"

/****************
 * ### `TreeData`
 * Where a `<ui-tree-diagram>`'s tree comes from, made safe to lay out:  the `tree` property, or the JSON in a
 * `<script type="application/json">` child.
 * - STATIC and plain DOM, no Solid:  the element and its native fallback both read the tree through it, and name
 *   the diagram with `summary()`.
 * - Lenient:  data from a page is checked, not trusted.  Anything that isn't an object is no node;  a missing
 *   `label` is `""`;  non-string `detail` / `slot` / `title` are dropped;  `children` keeps only nodes.
 ****************/
export class TreeData {
  /**
   * `value` as a tree to draw, or `undefined` when it isn't one.
   * - Always a NEW tree:  the caller's objects are never handed on, nor changed.
   * - A node met twice on the way down (a cycle, or one object shared by two parents) is drawn once:  where it's met
   *   first.
   * - NEVER throws.
   */
  static node(value: unknown, seen = new Set<object>()): TreeDiagramNode | undefined {
    if (typeof value !== "object" || value === null || Array.isArray(value) || seen.has(value)) return undefined
    seen.add(value)
    const raw = value as Record<string, unknown>
    const node: TreeDiagramNode = { label: TreeData.text(raw.label) ?? "" }
    const detail = TreeData.text(raw.detail)
    const slot = TreeData.text(raw.slot)
    const title = TreeData.text(raw.title)
    if (detail) node.detail = detail
    if (slot) node.slot = slot
    if (title) node.title = title
    if (Array.isArray(raw.children)) {
      const children = raw.children.flatMap((child) => TreeData.node(child, seen) ?? [])
      if (children.length) node.children = children
    }
    return node
  }

  /**
   * JSON text of `host`'s first `<script type="application/json">` child;  `undefined` without one.
   * - By `localName`, not `instanceof`:  a static server render's children are linkedom elements.
   */
  static scriptText(host: Element): string | undefined {
    for (const child of host.children) {
      if (child.localName === "script" && child.getAttribute("type")?.trim() === JSON_SCRIPT_TYPE)
        return child.textContent ?? ""
    }
    return undefined
  }

  /**
   * `text` (a script child's JSON) as a tree;  `undefined` for none (no text, blank, or not a node).
   * - throws `SyntaxError` when `text` isn't JSON:  the caller warns.
   */
  static parse(text: string | undefined): TreeDiagramNode | undefined {
    if (!text?.trim()) return undefined
    return TreeData.node(JSON.parse(text))
  }

  /**
   * Name of a diagram of `tree`, through `text` (the element's translated texts, or the fallback's English ones):
   * "Tree:  If, with 3 children".
   */
  static summary(
    tree: TreeDiagramNode,
    text: (key: TreeDiagramSummaryKey, params: Record<string, string | number>) => string
  ): string {
    const count = tree.children?.length ?? 0
    const key = count === 0 ? "summaryLeaf" : count === 1 ? "summaryOne" : "summary"
    return text(key, { label: tree.label, count })
  }

  /** `value` as text:  a string as is, a number or boolean written out, anything else `undefined`. */
  private static text(value: unknown): string | undefined {
    if (typeof value === "string") return value
    if (typeof value === "number" || typeof value === "boolean") return String(value)
    return undefined
  }
}
