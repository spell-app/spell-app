import { For, Show, type Accessor } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E } from "$/ui/core"
import { treeDiagramVocabulary } from "./UITreeDiagram.en"
import { TreeData } from "./TreeData"
import { TreeLayout } from "./TreeLayout"
import {
  TREE_DIAGRAM_METRICS,
  type TreeDiagramBox,
  type TreeDiagramEdge,
  type TreeDiagramLayout,
  type TreeDiagramNode
} from "./UITreeDiagram.types"

import treeDiagramCSS from "./UITreeDiagram.css?inline"

/****************
 * ### `UITreeDiagram`
 * The component behind `<ui-tree-diagram>`:  a tree drawn top-down as an SVG,
 * with a box per node, a line from each parent to each child, and a slot label on the line.
 *
 * - GENERIC:  it draws any tree from plain data (`TreeDiagramNode`).
 *   It was first drawn for spell's parse trees, but `ui` never imports spell or the parser.
 * - The tree:  the `tree` property (`prop:tree` in Solid),
 *   else the JSON of a `<script type="application/json">` child (static pages, `file://` too),
 *   which it follows as it changes.
 *   - The property wins.
 *   - Invalid JSON draws nothing, and warns once.
 *   - It redraws when `tree` is set again:  set a NEW tree (one changed in place isn't seen).
 * - Layout:  `TreeLayout` (pure).
 *   Drawn at its natural size in em (`--_ui-tree-diagram-natural-width`),
 *   shrinking to fit its container down to `--ui-tree-diagram-min-scale`, and scrolling sideways below that.
 * - Nothing to draw:  the `<svg>` is `ui empty tree diagram`, hidden;  the DOM element has no height.
 * - Accessibility:  the `<svg>` is `role="img"`, named by a summary ("Tree:  If, with 3 children");
 *   each node's `title` is its box's `<title>` (hover text).
 ****************/
export class UITreeDiagram extends E.UIComponent<typeof treeDiagramVocabulary> {
  @E.proto static vocabulary = treeDiagramVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { "tree-diagram": treeDiagramCSS },
    delegatesFocus: false
  } satisfies Partial<E.ElementSetup>

  /**
   * JSON text of the `<script type="application/json">` child;  `undefined` without one.
   * - Follows the script child as the page changes it.
   */
  @E.watches({ childList: true, characterData: true, subtree: true })
  get scriptText(): string | undefined {
    return isServer ? undefined : TreeData.scriptText(this.domElement)
  }

  /**
   * The script child's tree;  `undefined` without one, or when its JSON is invalid (warned once).
   * - `@derived`:  parses JSON.
   */
  @E.derived
  get scriptTree(): TreeDiagramNode | undefined {
    return this.parseScript(this.scriptText)
  }

  /**
   * The tree drawn:  `tree` when it's a node, else the script child's;  `undefined`:  nothing to draw.
   * - `@derived`:  `TreeData.node()` copies the tree, checking every node.
   */
  @E.derived
  get drawnTree(): TreeDiagramNode | undefined {
    return TreeData.node(this.tree) ?? this.scriptTree
  }

  /**
   * The tree laid out;  `undefined` with nothing to draw.
   * - `@derived`:  lays out every node.
   */
  @E.derived
  get layout(): TreeDiagramLayout | undefined {
    const tree = this.drawnTree
    return tree ? TreeLayout.of(tree) : undefined
  }

  /** Invalid JSON already warned about:  a re-read of the same text stays quiet. */
  private warnedText: string | undefined

  /**
   * `empty` with nothing to draw.
   * - Reads `tree` itself, not just `drawnTree`:  so the classes follow EVERY write to it,
   *   as `ElementFixture.breakRender()` needs (the only attribute is a non-class one).
   */
  protected override get extraClass(): string | undefined {
    return TreeData.node(this.tree) || this.scriptTree ? undefined : EMPTY
  }

  render(): JSX.Element {
    return (
      <svg
        class={this.rootClass}
        part={this.partForName("diagram")}
        role={this.layout ? "img" : undefined}
        aria-label={this.summary()}
        viewBox={this.viewBox()}
        style={this.sizeStyle()}
      >
        <For each={this.layout?.edges ?? []} keyed={false}>
          {(edge) => this.edge(edge)}
        </For>
        <For each={this.layout?.boxes ?? []} keyed={false}>
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
        part={isRoot() ? `${this.partForName("node")} ${this.partForName("root-node")}` : this.partForName("node")}
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
        <path class={EDGE_CLASS} part={this.partForName("edge")} d={UITreeDiagram.path(edge())} />
        <Show when={edge().slot}>
          {(slot) => (
            <text
              class={SLOT_CLASS}
              part={this.partForName("slot-label")}
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
    const layout = this.layout
    return layout && `0 0 ${layout.width} ${layout.height}`
  }

  /** The natural width in label `em`s, for the sheet to size the `<svg>` with. */
  private sizeStyle(): JSX.CSSProperties | undefined {
    const layout = this.layout
    return layout && { [NATURAL_WIDTH]: (layout.width / TREE_DIAGRAM_METRICS.fontSize).toFixed(3) }
  }

  /** The `<svg>`'s name:  the root's label and how many children it has. */
  private summary(): string | undefined {
    const tree = this.drawnTree
    if (!tree) return undefined
    return TreeData.summary(tree, (key, params) => this.translationForKey(key, params))
  }

  ////////////////
  // ## Data
  ////////////////

  /** `text` as a tree;  invalid JSON warns (once per text) and draws nothing. */
  private parseScript(text: string | undefined): TreeDiagramNode | undefined {
    try {
      return TreeData.parse(text)
    } catch (error) {
      if (text !== this.warnedText)
        console.warn(`<${this.domElement.localName}>:  invalid JSON in its script child`, error)
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

/** The vocabulary getters, typed (`UIComponent`'s doc). */
export interface UITreeDiagram extends E.AttributeValues<typeof treeDiagramVocabulary> {}

/** Class word before the noun when there's nothing to draw (`ui empty tree diagram`):  the `<svg>` hides. */
const EMPTY = "empty"

/** Class of each node's `<g>`, its box, its texts;  each edge;  each slot label. */
const NODE_CLASS = "node"
const ROOT_CLASS = "root"
const BOX_CLASS = "box"
const LABEL_CLASS = "label"
const DETAIL_CLASS = "detail"
const EDGE_CLASS = "edge"
const SLOT_CLASS = "slot"

/** Private custom property the sheet sizes the `<svg>` with:  the layout's natural width, in label `em`s. */
const NATURAL_WIDTH = "--_ui-tree-diagram-natural-width"
