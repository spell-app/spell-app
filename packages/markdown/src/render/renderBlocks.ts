import { P } from "$/parser"
import { MD, type Block } from "$/markdown"

/**
 * An `MD.Block` tree => `P.Markup`, in PLAIN HTML tags -- what the GFM spec expects.
 * - `inline` draws a leaf's text (a paragraph's, a heading's, a table cell's):  inline parsing plugs in there.
 *   Default:  the text, whitespace around line ends tidied (`plainInline()`).
 * - Tight list items draw their paragraphs without `<p>`.
 */
export function renderBlocks(
  block: Block,
  inline: InlineRenderer = plainInline,
  options: { tagfilter?: boolean } = {}
): P.Markup {
  const { tagfilter = true } = options
  return draw(block, false)

  /** `block` as markup;  `tight`:  inside a tight list's item. */
  function draw(block: Block, tight: boolean): P.Markup {
    const children = () => block.children.map((child) => draw(child, tight))
    switch (block.kind) {
      case "document":
        return children()
      case "blockquote":
        return P.render.h("blockquote", {}, ...block.children.map((child) => draw(child, false)))
      case "list": {
        const ordered = block.list!.type === "ordered"
        const start = ordered && block.list!.start !== 1 ? block.list!.start : undefined
        return P.render.h(ordered ? "ol" : "ul", { start }, ...block.children.map((item) => draw(item, !!block.tight)))
      }
      case "item":
        return P.render.h("li", {}, ...block.children.map((child) => draw(child, tight)))
      case "paragraph": {
        const content = inline(paragraphText(block.lines))
        return tight ? content : P.render.h("p", {}, content)
      }
      case "heading":
        return P.render.h(`h${block.level}`, {}, inline(paragraphText(block.lines)))
      case "thematic_break":
        return P.render.h("hr", {})
      case "code": {
        const language = block.info ? MD.unescapeString(block.info).split(/\s+/)[0] : ""
        const text = block.lines.length ? `${block.lines.join("\n")}\n` : ""
        return P.render.h("pre", {}, P.render.h("code", { class: language ? `language-${language}` : undefined }, text))
      }
      case "html":
        return MD.raw(tagfilter ? MD.tagFilter(block.lines.join("\n")) : block.lines.join("\n"))
      case "table":
        return drawTable(block)
    }
  }

  /** A GFM table:  the header row, then a `<tbody>` when there are body rows;  cells padded / cut to the header's count. */
  function drawTable(table: Block): P.Markup {
    const align = table.align ?? []
    const row = (line: string, tag: "th" | "td") => {
      const cells = MD.tableCells(line)
      return P.render.h(
        "tr",
        {},
        ...align.map((columnAlign, i) => P.render.h(tag, { align: columnAlign }, inline(cells[i] ?? "")))
      )
    }
    const [header, , ...rows] = table.lines
    return P.render.h(
      "table",
      {},
      P.render.h("thead", {}, row(header!, "th")),
      rows.length ? P.render.h("tbody", {}, ...rows.map((line) => row(line, "td"))) : null
    )
  }
}

/** Draws a leaf's inline text as markup. */
export type InlineRenderer = (text: string) => P.Markup

/** A paragraph's lines as one text:  each line's leading spaces gone, the whole trimmed. */
export function paragraphText(lines: string[]) {
  return lines
    .map((line) => line.replace(/^[ \t]+/, ""))
    .join("\n")
    .trim()
}

/** Inline text without inline parsing:  spaces before a line end dropped. */
export function plainInline(text: string): P.Markup {
  return text.replace(/[ \t]+\n/g, "\n")
}
