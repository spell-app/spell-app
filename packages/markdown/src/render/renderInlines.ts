import { MD, type InlineNode } from "$/markdown"

/**
 * An `MD.InlineNode` tree => `MD.Markup`, in plain HTML tags (`em`, `strong`, `del`, `a`, `img`, `code`, `br`).
 * - `tagfilter` (default on):  raw inline HTML goes through GFM's tagfilter (`<script>` => `&lt;script>`).
 * - A `strong` straight inside a `strong` draws no tag of its own, as cmark-gfm does:  `****foo****` is ONE bold.
 * - An image's `alt` is its children's plain text.
 */
export function renderInlines(node: InlineNode, options: { tagfilter?: boolean; breaks?: boolean } = {}): MD.Markup {
  const { tagfilter = true, breaks = false } = options
  return children(node)

  /** `node`'s children as markup. */
  function children(node: InlineNode): MD.Markup {
    return node.children().map(draw)
  }

  /** One inline node as markup. */
  function draw(node: InlineNode): MD.Markup {
    switch (node.kind) {
      case "text":
        return node.text
      case "softbreak":
        return breaks ? [MD.h("br", {}), "\n"] : "\n"
      case "linebreak":
        return [MD.h("br", {}), "\n"]
      case "code":
        return MD.h("code", {}, node.text)
      case "html":
        return MD.raw(tagfilter ? MD.tagFilter(node.text) : node.text)
      case "emph":
        return MD.h("em", {}, children(node))
      case "strong":
        return node.parent?.kind === "strong" ? children(node) : MD.h("strong", {}, children(node))
      case "del":
        return MD.h("del", {}, children(node))
      case "link":
        return MD.h("a", { href: node.destination, title: node.title || undefined }, children(node))
      case "image":
        return MD.h("img", { src: node.destination, alt: plainText(node), title: node.title || undefined })
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
