import { For, Show, createMemo, onSettled, untrack, type Accessor } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { Cell, proto, UIElement, UIT } from "$/ui/core"

import { treeDiagramVocabulary } from "./ui-tree-diagram.vocabulary.en"
import { TreeData } from "./TreeData"
import { TreeLayout } from "./TreeLayout"
import { TreeDiagramFallback } from "./ui-tree-diagram.fallback"
import {
  BOX_CLASS,
  DETAIL_CLASS,
  EDGE_CLASS,
  EMPTY,
  LABEL_CLASS,
  NATURAL_WIDTH,
  NODE_CLASS,
  ROOT_CLASS,
  SLOT_CLASS,
  TREE_DIAGRAM_METRICS,
  type TreeDiagramBox,
  type TreeDiagramEdge,
  type TreeDiagramNode
} from "./ui-tree-diagram.types"

import treeDiagramCSS from "./ui-tree-diagram.css?inline"

/****************
 * ### `<ui-tree-diagram>`
 * A tree drawn top-down as an SVG:  a box per node, a line from each parent to each child, a slot label on the line.
 * - GENERIC:  draws any tree from plain data (`TreeDiagramNode`);  first drawn for spell's parse trees, but `ui` never
 *   imports spell or the parser.
 * - The tree:  the `tree` property (`prop:tree` in Solid), else the JSON of a `<script type="application/json">`
 *   child (static pages, `file://` too), which it follows as it changes.  The property wins.  Invalid JSON draws
 *   nothing and warns once.  Redraws when `tree` is set again:  set a NEW tree (one changed in place isn't seen).
 * - Layout:  `TreeLayout` (pure);  drawn at its natural size in em (`--_ui-tree-diagram-natural-width`), shrinking to
 *   fit its container down to `--ui-tree-diagram-min-scale`, scrolling sideways below that (the sheet).
 * - Nothing to draw:  the `<svg>` is `ui tree diagram empty`, hidden;  the host has no height.
 * - Accessibility:  the `<svg>` is `role="img"`, named by a summary ("Tree:  If, with 3 children");  each node's
 *   `title` is its box's `<title>` (hover text).
 ****************/
export class UITreeDiagram extends UIElement<typeof treeDiagramVocabulary> {
  @proto static vocabulary = treeDiagramVocabulary
  @proto static styles = { "tree-diagram": treeDiagramCSS }
  @proto static Fallback = TreeDiagramFallback
  @proto static delegatesFocus = false

  /** JSON text of the `<script type="application/json">` child;  `undefined` without one.  Followed in `mount()`. */
  readonly scriptText = new Cell<string | undefined>(
    isServer ? undefined : untrack(() => TreeData.scriptText(this.host))
  )

  /** The script child's tree;  `undefined` without one, or when its JSON is invalid (warned once). */
  readonly scriptTree = createMemo(() => this.parseScript(this.scriptText.get()))

  /** The tree drawn:  `tree` when it's a node, else the script child's;  `undefined`:  nothing to draw. */
  readonly tree = createMemo(() => TreeData.node(this.attrs.tree) ?? this.scriptTree())

  /** The tree laid out;  `undefined` with nothing to draw. */
  readonly layout = createMemo(() => {
    const tree = this.tree()
    return tree ? TreeLayout.of(tree) : undefined
  })

  /** Invalid JSON already warned about:  a re-read of the same text stays quiet. */
  private warnedText: string | undefined

  /** Follow the script child as the page changes it. */
  mount(): JSX.Element {
    if (!isServer) {
      onSettled(() => {
        const observer = new MutationObserver(() => this.scriptText.set(TreeData.scriptText(this.host)))
        observer.observe(this.host, { childList: true, characterData: true, subtree: true })
        return () => observer.disconnect()
      })
    }
    return super.mount()
  }

  /**
   * `empty` with nothing to draw.
   * - Reads `tree` itself, not just the `tree()` memo (which cuts off equal values):  so the classes follow EVERY
   *   write to it, as `ElementFixture.breakRender()` needs (the only attribute is a non-class one).
   */
  protected override extraClasses(): string | undefined {
    return TreeData.node(this.attrs.tree) || this.scriptTree() ? undefined : EMPTY
  }

  render(): JSX.Element {
    return (
      <svg
        class={this.classes()}
        part={this.part("diagram")}
        role={this.layout() ? UIT.IMG : undefined}
        aria-label={this.summary()}
        viewBox={this.viewBox()}
        style={this.sizeStyle()}
      >
        <For each={this.layout()?.edges ?? []} keyed={false}>
          {(edge) => this.edge(edge)}
        </For>
        <For each={this.layout()?.boxes ?? []} keyed={false}>
          {(box) => this.box(box)}
        </For>
      </svg>
    )
  }

  ////////////////
  // ## Drawing
  ////////////////

  /**
   * One node:  its `<g>` (part `node`, the root's also `root-node`), `<title>`, box, label and detail.
   * - `box` is the For's accessor (`keyed={false}`):  a redraw updates the same elements in place, by position.
   */
  private box(box: Accessor<TreeDiagramBox>): JSX.Element {
    const { fontSize, detailFontSize } = TREE_DIAGRAM_METRICS
    const isRoot = () => box().depth === 0
    return (
      <g
        class={[NODE_CLASS, { [ROOT_CLASS]: isRoot() }]}
        part={isRoot() ? `${this.part("node")} ${this.part("root-node")}` : this.part("node")}
      >
        <Show when={box().node.title}>{(title) => <title>{title()}</title>}</Show>
        <rect class={BOX_CLASS} x={box().x} y={box().y} width={box().width} height={box().height} />
        <text class={LABEL_CLASS} x={box().label.x} y={box().label.y} font-size={String(fontSize)}>
          {box().node.label}
        </text>
        <Show when={box().detail}>
          {(detail) => (
            <text class={DETAIL_CLASS} x={detail().x} y={detail().y} font-size={String(detailFontSize)}>
              {box().node.detail}
            </text>
          )}
        </Show>
      </g>
    )
  }

  /** One edge:  its line (part `edge`), broken under its slot label (part `slot-label`).  `edge`:  as `box()`'s. */
  private edge(edge: Accessor<TreeDiagramEdge>): JSX.Element {
    return (
      <>
        <path class={EDGE_CLASS} part={this.part("edge")} d={UITreeDiagram.path(edge())} />
        <Show when={edge().slot}>
          {(slot) => (
            <text
              class={SLOT_CLASS}
              part={this.part("slot-label")}
              x={slot().x}
              y={slot().y}
              font-size={String(TREE_DIAGRAM_METRICS.slotFontSize)}
            >
              {slot().text}
            </text>
          )}
        </Show>
      </>
    )
  }

  /** `viewBox`:  the layout's natural size. */
  private viewBox(): string | undefined {
    const layout = this.layout()
    return layout && `0 0 ${layout.width} ${layout.height}`
  }

  /** The natural width in label `em`s, for the sheet to size the `<svg>` with. */
  private sizeStyle(): JSX.CSSProperties | undefined {
    const layout = this.layout()
    return layout && { [NATURAL_WIDTH]: (layout.width / TREE_DIAGRAM_METRICS.fontSize).toFixed(3) }
  }

  /** The `<svg>`'s name:  the root's label and how many children it has. */
  private summary(): string | undefined {
    const tree = this.tree()
    if (!tree) return undefined
    return TreeData.summary(tree, (key, params) => this.text(key, params))
  }

  ////////////////
  // ## Data
  ////////////////

  /** `text` as a tree;  invalid JSON warns (once per text) and draws nothing. */
  private parseScript(text: string | undefined): TreeDiagramNode | undefined {
    try {
      return TreeData.parse(text)
    } catch (error) {
      if (text !== this.warnedText) console.warn(`<${this.host.localName}>:  invalid JSON in its script child`, error)
      this.warnedText = text
      return undefined
    }
  }

  /** `d` of an edge's `<path>`:  one line, or two around the slot label's gap. */
  private static path({ from, to, gap }: TreeDiagramEdge): string {
    if (!gap) return `M${from.x} ${from.y}L${to.x} ${to.y}`
    return `M${from.x} ${from.y}L${gap.from.x} ${gap.from.y}M${gap.to.x} ${gap.to.y}L${to.x} ${to.y}`
  }
}
