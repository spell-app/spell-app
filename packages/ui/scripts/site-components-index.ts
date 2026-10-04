/**
 * `yarn site:index [--check]`:  write the component index, `site/components/index.html`'s card grid, from the site's
 * data (`site/_data/components.json`).
 * - One section per topic (`<ui-header level="2" dividing>`), each a `<ui-cards>` of `<ui-card href header meta
 *   description>`:  every COMPONENT tag, under EACH of its topics, A-Z.  The same groups and links as the sidebar's
 *   Topics view, because both come from `NavIndex`.
 * - Static markup, not a doc-only element:  `<ui-cards>` / `<ui-card>` already draw it, and a generated page needs no
 *   data fetch or script of its own.  Rerun after `yarn site:data` (`yarn site:build` runs both).
 * - Writes ONLY between the page's `<!-- components:start -->` and `<!-- components:end -->` markers;  the rest of
 *   the page is hand-kept.  The markup is laid out as oxfmt lays it out, so formatting the page changes nothing.
 * - Written flat, then nested into `<ui-section>`s (ids from the topic titles:  `#date-time`) by
 *   `yarn site:sections`' converter (`SiteSections`), as every page is.
 * - `--check`:  write nothing;  exit 1 if the page is stale.
 */
import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"

import type { SiteDataFile, SiteTag } from "../src/docs-components/docs-components.types.ts"
import { NavIndex } from "../src/docs-components/ui-docs-nav/NavIndex.ts"

import { SiteSections } from "./site-sections.ts"

/** `packages/ui/`. */
const UI = path.resolve(import.meta.dirname, "..")

/****************
 * ### `ComponentIndexWriter`
 * Renders the index page's generated block from the site's data, and splices it between the page's markers.
 ****************/
class ComponentIndexWriter {
  /** The page. */
  readonly file = path.join(UI, "site/components/index.html")

  /** The site's data. */
  readonly data: SiteDataFile = JSON.parse(readFileSync(path.join(UI, "site/_data/components.json"), "utf8"))

  /** Start marker (its own line);  its indent is the block's. */
  static readonly START = "<!-- components:start -->"

  /** End marker (its own line). */
  static readonly END = "<!-- components:end -->"

  /** oxfmt's line width (`.oxfmtrc.json`):  a longer tag breaks one attribute per line. */
  static readonly WIDTH = 120

  /** The status label's words, by status (`done` shows none). */
  static readonly STATUS_TEXT: Record<string, string> = { planned: "Planned", "in-progress": "In progress" }

  /** `page` with its generated block replaced by a fresh one. */
  render(page: string): string {
    const start = page.indexOf(ComponentIndexWriter.START)
    const end = page.indexOf(ComponentIndexWriter.END)
    if (start < 0 || end < start) throw new Error(`${this.file}:  no ${ComponentIndexWriter.START} ... END markers`)
    const lineStart = page.lastIndexOf("\n", start) + 1
    const indent = page.slice(lineStart, start)
    const block = this.block(indent)
    return page.slice(0, start + ComponentIndexWriter.START.length) + "\n" + block + indent + page.slice(end)
  }

  /** The generated lines, each topic a header and a card group, at `indent`. */
  private block(indent: string): string {
    const index = new NavIndex(this.data)
    const tags = new Map(this.data.components.map((tag) => [tag.tag, tag]))
    const lines: string[] = []
    for (const topic of index.topics) {
      lines.push(
        "",
        `${indent}<ui-header level="2" dividing id="topic-${ComponentIndexWriter.slug(topic.id)}">${ComponentIndexWriter.escape(topic.title)}</ui-header>`,
        `${indent}<ui-cards>`
      )
      for (const row of topic.rows) lines.push(...this.card(tags.get(row.tag)!, `${indent}  `))
      lines.push(`${indent}</ui-cards>`)
    }
    return lines.slice(1).join("\n") + "\n"
  }

  /**
   * One card:  name, `<tag>`, one-line description, status (its own page's for a sub-tag with one, else its
   * family's);  on one line if it fits, else one attribute per line.
   */
  private card(tag: SiteTag, indent: string): string[] {
    const family = this.data.families[tag.folder]
    const status = family?.pages?.[tag.tag]?.status ?? family?.status ?? "done"
    const attributes = [
      `href="${ComponentIndexWriter.escape(ComponentIndexWriter.href(tag))}"`,
      `header="${ComponentIndexWriter.escape(tag.name)}"`,
      `meta="${ComponentIndexWriter.escape(`<${tag.tag}>`)}"`,
      ...(tag.description
        ? [`description="${ComponentIndexWriter.escape(ComponentIndexWriter.plain(tag.description))}"`]
        : []),
      ...(status === "done" ? [] : [`extra="${ComponentIndexWriter.STATUS_TEXT[status] ?? status}"`])
    ]
    const line = `${indent}<ui-card ${attributes.join(" ")}></ui-card>`
    if (line.length <= ComponentIndexWriter.WIDTH) return [line]
    return [`${indent}<ui-card`, ...attributes.map((attribute) => `${indent}  ${attribute}`), `${indent}></ui-card>`]
  }

  /**
   * `tag`'s page, relative to `components/`:  `ui-button.html`, `ui-radio.html` for a sub-tag with its own page,
   * `ui-button.html#ui-or` for one on its family's page.
   */
  private static href(tag: SiteTag): string {
    return (tag.href ?? `components/${tag.folder}.html#${tag.tag}`).replace(/^components\//, "")
  }

  /** `text` without markdown code ticks:  a card shows plain text. */
  private static plain(text: string): string {
    return text.replaceAll("`", "")
  }

  /** `date & time` => `date-time`. */
  private static slug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
  }

  /** `text` safe inside an attribute or element. */
  private static escape(text: string): string {
    return text.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
  }
}

const writer = new ComponentIndexWriter()
const before = readFileSync(writer.file, "utf8")
// the block is written flat (a header per topic), then nested into sections as every page is
const after = SiteSections.convert(writer.render(before))
const relative = path.relative(process.cwd(), writer.file)
if (process.argv.includes("--check")) {
  if (after !== before) console.error(`stale:  ${relative} (run \`yarn site:index\`)`)
  process.exitCode = after === before ? 0 : 1
} else {
  if (after !== before) writeFileSync(writer.file, after)
  console.log(`component index:  ${after === before ? "unchanged" : `wrote ${relative}`}`)
}
