import { P } from "$/parser"
import { MD, type InlineNode } from "$/markdown"

/**
 * An `MD.InlineNode` tree => `P.Markup`, in plain HTML tags (`em`, `strong`, `del`, `a`, `img`, `code`, `br`).
 * - `tagfilter` (default on):  raw inline HTML goes through GFM's tagfilter (`<script>` => `&lt;script>`).
 * - A `strong` straight inside a `strong` draws no tag of its own, as cmark-gfm does:  `****foo****` is ONE bold.
 * - An image's `alt` is its children's plain text.
 */
export function renderInlines(node: InlineNode, options: { tagfilter?: boolean } = {}): P.Markup {
  const { tagfilter = true } = options
  return children(node)

  /** `node`'s children as markup. */
  function children(node: InlineNode): P.Markup {
    return node.children().map(draw)
  }

  /** One inline node as markup. */
  function draw(node: InlineNode): P.Markup {
    switch (node.kind) {
      case "text":
        return node.text
      case "softbreak":
        return "\n"
      case "linebreak":
        return [P.render.h("br", {}), "\n"]
      case "code":
        return P.render.h("code", {}, node.text)
      case "html":
        return MD.raw(tagfilter ? MD.tagFilter(node.text) : node.text)
      case "emph":
        return P.render.h("em", {}, children(node))
      case "strong":
        return node.parent?.kind === "strong" ? children(node) : P.render.h("strong", {}, children(node))
      case "del":
        return P.render.h("del", {}, children(node))
      case "link":
        return P.render.h("a", { href: node.destination, title: node.title || undefined }, children(node))
      case "image":
        return P.render.h("img", { src: node.destination, alt: plainText(node), title: node.title || undefined })
      default:
        return children(node)
    }
  }
}

/** `node`'s text without markup:  an image's `alt`. */
export function plainText(node: InlineNode): string {
  return node
    .children()
    .map((child) => {
      if (child.kind === "text" || child.kind === "code") return child.text
      if (child.kind === "softbreak" || child.kind === "linebreak") return "\n"
      return plainText(child)
    })
    .join("")
}
