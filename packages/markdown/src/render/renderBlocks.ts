import { MD } from "$/markdown"

/**
 * An `MD.Block` tree => `MD.Markup`:  PLAIN HTML tags (what the GFM spec expects), or `ui-*` elements (`ui: true`).
 * - `inline` draws a leaf's text (a paragraph's, a heading's, a table cell's):  inline parsing plugs in there.
 *   Default:  the text, whitespace around line ends tidied (`plainInline()`).
 * - Tight list items draw their paragraphs without `<p>`.
 * - GitHub's extras, both modes:  task list items (`- [x] done`) and alerts (`> [!NOTE]`).
 * - SIDE EFFECT:  pushes every heading onto `options.headings`, if given.
 */
export function renderBlocks(
  block: MD.Block,
  inline: InlineRenderer = plainInline,
  options: BlockOptions = {}
): MD.Markup {
  const { tagfilter = true, ui = false, headingIds = false, headingOffset = 0, headings } = options
  const h = MD.h
  const ids = new Map<string, number>()
  return draw(block, false, false)

  /** `block` as markup;  `tight`:  inside a tight list's item;  `inOrdered`:  inside an ordered `ui-list`. */
  function draw(block: MD.Block, tight: boolean, inOrdered: boolean): MD.Markup {
    const children = (childTight = tight) => block.children.map((child) => draw(child, childTight, inOrdered))
    switch (block.kind) {
      case "document":
        return children()
      case "blockquote":
        return drawBlockquote(block, inOrdered)
      case "list":
        return drawList(block, inOrdered)
      case "item":
        return drawItem(block, tight, inOrdered)
      case "paragraph": {
        const content = inline(MD.paragraphText(block.lines))
        return tight ? content : h("p", {}, content)
      }
      case "heading":
        return drawHeading(block)
      case "thematic_break":
        return ui ? h("ui-divider", {}) : h("hr", {})
      case "code": {
        const language = block.info ? MD.unescapeString(block.info).split(/\s+/)[0] : ""
        const text = block.lines.length ? `${block.lines.join("\n")}\n` : ""
        // `ui-code` reads its text content;  the copy button, as `<ui-markdown>` gave its code blocks
        if (ui) return h("ui-code", { language: language || undefined, copy: "" }, text.replace(/\n$/, ""))
        return h("pre", {}, h("code", { class: language ? `language-${language}` : undefined }, text))
      }
      case "html": {
        const html = block.lines.join("\n")
        return MD.raw(tagfilter ? MD.tagFilter(html) : html)
      }
      case "table":
        return drawTable(block)
    }
  }

  /** A heading:  its level shifted by `headingOffset` (1-6);  with `headingIds`, GitHub's slug as its id. */
  function drawHeading(block: MD.Block): MD.Markup {
    const level = Math.min(6, Math.max(1, block.level! + headingOffset))
    const text = MD.paragraphText(block.lines)
    const content = inline(text)
    let id: string | undefined
    if (headingIds || headings) {
      const plain = MD.toText(content)
      id = headingIds ? MD.uniqueSlug(MD.slug(plain), ids) : undefined
      headings?.push({ level, text: plain, id: id ?? "" })
    }
    return ui ? h("ui-header", { level, id }, content) : h(`h${level}`, { id }, content)
  }

  /** A quote, or a GitHub alert (`> [!NOTE]` on its first line). */
  function drawBlockquote(block: MD.Block, inOrdered: boolean): MD.Markup {
    const alert = MD.alertOf(block)
    const children = (alert?.children ?? block.children).map((child) => draw(child, false, inOrdered))
    if (!alert) return ui ? h("ui-segment", { secondary: "" }, ...children) : h("blockquote", {}, ...children)
    const { kind, title } = alert
    if (ui) {
      const { state, color, icon } = MD.ALERT_LOOKS[kind]!
      return h("ui-message", { state, color, icon, header: title }, ...children)
    }
    return h(
      "div",
      { class: `markdown-alert markdown-alert-${kind}` },
      h("p", { class: "markdown-alert-title" }, title),
      ...children
    )
  }

  /**
   * A list.  `ui`:  `ui-list bulleted` / `ordered`, each ordered item numbered by `value` (`ui-list` has no `start`).
   * - A bullet list inside an ordered `ui-list` stays a plain `<ul>`:  `ui-list` would number it `1.1`.
   * - A bullet list of task items only is a `ui-list` without `bulleted`:  the checkboxes are its markers, as on GitHub.
   */
  function drawList(block: MD.Block, inOrdered: boolean): MD.Markup {
    const { type, start = 1 } = block.list!
    const ordered = type === "ordered"
    const items = block.children.map((item, i) => {
      const drawn = draw(item, !!block.tight, inOrdered || (ui && ordered)) as MD.MarkupElement
      if (ui && ordered && drawn.tag === "ui-item") drawn.attrs.value = `${start + i}.`
      return drawn
    })
    const tasks = !ordered && block.children.every((item) => MD.taskOf(item))
    const look = ordered ? "ordered" : tasks ? undefined : "bulleted"
    if (ui && !(inOrdered && !ordered)) return h("ui-list", look ? { [look]: "" } : {}, ...items)
    return h(ordered ? "ol" : "ul", { start: ordered && start !== 1 ? start : undefined }, ...items)
  }

  /** A list item;  a task item (`[ ]` / `[x]` first) gets a read-only checkbox. */
  function drawItem(block: MD.Block, tight: boolean, inOrdered: boolean): MD.Markup {
    const task = MD.taskOf(block)
    const children = (task?.children ?? block.children).map((child) => draw(child, tight, inOrdered))
    const tag = ui && !(block.parent?.list?.type === "bullet" && inOrdered) ? "ui-item" : "li"
    if (!task) return h(tag, {}, ...children)
    const box = ui
      ? h("ui-checkbox", { readonly: "", checked: task.checked ? "" : undefined })
      : h("input", { type: "checkbox", disabled: "", checked: task.checked ? "" : undefined })
    return h(tag, { class: "task-list-item" }, box, " ", ...children)
  }

  /** A GFM table:  the header row, then a `<tbody>` when there are body rows;  cells padded / cut to the header's count. */
  function drawTable(table: MD.Block): MD.Markup {
    const align = table.align ?? []
    const row = (line: string, tag: "th" | "td") => {
      const cells = MD.tableCells(line)
      return h("tr", {}, ...align.map((columnAlign, i) => h(tag, { align: columnAlign }, inline(cells[i] ?? ""))))
    }
    const [header, , ...rows] = table.lines
    const native = h(
      "table",
      {},
      h("thead", {}, row(header!, "th")),
      rows.length ? h("tbody", {}, ...rows.map((line) => row(line, "td"))) : null
    )
    return ui ? h("ui-table", { celled: "" }, native) : native
  }
}

/** Draws a leaf's inline text as markup. */
export type InlineRenderer = (text: string) => MD.Markup

/** How `renderBlocks()` draws. */
export type BlockOptions = {
  /** GFM tagfilter on raw HTML blocks (default on). */
  tagfilter?: boolean
  /** `ui-*` elements instead of plain tags. */
  ui?: boolean
  /** Give headings GitHub's slug ids (`Getting started!` => `getting-started`, repeats numbered). */
  headingIds?: boolean
  /** Shift every heading's level by this much, clamped to 1-6. */
  headingOffset?: number
  /** Collects every heading, in order:  the outline. */
  headings?: MD.MarkdownHeading[]
}

/** A paragraph's lines as one text:  each line's leading spaces gone, the whole trimmed. */
export function paragraphText(lines: string[]) {
  return lines
    .map((line) => line.replace(/^[ \t]+/, ""))
    .join("\n")
    .trim()
}

/** Inline text without inline parsing:  spaces before a line end dropped. */
export function plainInline(text: string): MD.Markup {
  return text.replace(/[ \t]+\n/g, "\n")
}
