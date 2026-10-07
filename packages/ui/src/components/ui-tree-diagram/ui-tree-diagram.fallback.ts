import { NativeFallback, proto } from "$/ui/core"

import { treeDiagramVocabulary } from "./ui-tree-diagram.vocabulary.en"
import { TreeData } from "./TreeData"
import { DETAIL_CLASS, LABEL_CLASS, SLOT_CLASS, type TreeDiagramNode } from "./ui-tree-diagram.types"

/****************
 * ### `TreeDiagramFallback`
 * The tree as nested lists, no drawing:  `<figure class="ui tree diagram" part="diagram" aria-label>` around a
 * `<ul>` per level, each `<li>` its slot (`condition:`), label and detail.
 * - Why lists, not the SVG:  a render that threw may have thrown laying the tree out;  lists need no layout, and read
 *   well to a screen reader.
 * - Reads the host's `tree` PROPERTY (a rich value, never reflected), else its JSON script child, like the element.
 *   Invalid JSON:  an empty figure (the element already warned).
 * - Names it with the vocabulary's ENGLISH texts:  the runtime's translations may not be there.
 ****************/
export class TreeDiagramFallback extends NativeFallback<typeof treeDiagramVocabulary> {
  @proto static vocabulary = treeDiagramVocabulary
  @proto static degraded = ["the drawing:  the tree shows as nested lists", "translated names (English only)"]

  protected override build() {
    const tree = this.tree()
    const figure = this.create(
      "figure",
      {
        class: this.classes(),
        "aria-label": tree ? TreeData.summary(tree, (key, params) => this.text(key, params)) : null
      },
      ...(tree ? [this.list([tree])] : [])
    )
    return [this.decorate(figure, "diagram")]
  }

  /** The tree:  the host's `tree` property when it's a node, else the script child's;  `undefined`:  none. */
  private tree(): TreeDiagramNode | undefined {
    const property = TreeData.node((this.host as HTMLElement & { tree?: unknown }).tree)
    if (property) return property
    try {
      return TreeData.parse(TreeData.scriptText(this.host))
    } catch {
      return undefined
    }
  }

  /** `nodes` as a `<ul>`, each `<li>` with its children's own `<ul>`. */
  private list(nodes: readonly TreeDiagramNode[]): HTMLUListElement {
    return this.create("ul", {}, ...nodes.map((node) => this.item(node)))
  }

  /** One node's `<li>`:  `slot:`, label, detail, then its children. */
  private item(node: TreeDiagramNode): HTMLLIElement {
    return this.create(
      "li",
      {},
      ...(node.slot ? [this.create("span", { class: SLOT_CLASS }, `${node.slot}:`), " "] : []),
      this.create("span", { class: LABEL_CLASS, title: node.title ?? null }, node.label),
      ...(node.detail ? [" ", this.create("span", { class: DETAIL_CLASS }, node.detail)] : []),
      ...(node.children?.length ? [this.list(node.children)] : [])
    )
  }

  /** English text `key` of the vocabulary, with `{params}` filled in. */
  private text(key: string, params: Record<string, string | number>): string {
    const text = this.vocabulary.texts.find((each) => each.key === key)?.text ?? ""
    return text.replace(/\{(\w+)\}/g, (match, name: string) => String(params[name] ?? match))
  }
}
