/**
 * `yarn site:index [--check]`:  write the component index, `ui/components/index.html`'s card grid (the shared pages,
 * `SITE_PAGES`), from the site's data (`site/_data/components.json`, this branch's).
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
import { readFileSync } from "node:fs"
import path from "node:path"
import { parseArgs } from "node:util"

import type { SiteDataFile, SiteTag } from "../src/docs-components/docs-components.types.ts"
import { NavIndex } from "../src/docs-components/ui-docs-nav/NavIndex.ts"
import { Terminal } from "../tools/Terminal.ts"
import { SITE_BUILD, SITE_PAGES } from "../tools/tools.types.ts"

import { STATUS_TEXT, escapeHtml, spliceGenerated, withoutTicks, writeOrCheck } from "./generatedFiles.ts"
import { SiteSections } from "./site-sections.ts"

/** `packages/ui/`. */
const UI = path.resolve(import.meta.dirname, "..")

/****************
 * ### `ComponentIndexWriter`
 * Renders the index page's generated block from the site's data, and splices it between the page's markers.
 * - Its `private static` helpers are STATIC because they're pure:  data in, text out.
 ****************/
class ComponentIndexWriter {
  /** The page. */
  readonly file = path.join(UI, SITE_PAGES, "components/index.html")

  /** The site's data. */
  readonly data: SiteDataFile = JSON.parse(readFileSync(path.join(UI, SITE_BUILD, "_data/components.json"), "utf8"))

  /** `page` with its generated block replaced by a fresh one. */
  render(page: string): string {
    return spliceGenerated(page, { file: this.file, start: START, end: END, block: (indent) => this.block(indent) })
  }

  /** The generated lines, each topic a header and a card group, at `indent`. */
  private block(indent: string): string {
    const index = new NavIndex(this.data)
    const tags = new Map(this.data.components.map((tag) => [tag.tag, tag]))
    const lines: string[] = []
    for (const topic of index.topics) {
      lines.push(
        "",
        `${indent}<ui-header level="2" dividing id="topic-${ComponentIndexWriter.slug(topic.id)}">${escapeHtml(topic.title)}</ui-header>`,
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
      `href="${escapeHtml(ComponentIndexWriter.href(tag))}"`,
      `header="${escapeHtml(tag.name)}"`,
      `meta="${escapeHtml(`<${tag.tag}>`)}"`,
      ...(tag.description ? [`description="${escapeHtml(withoutTicks(tag.description))}"`] : []),
      ...(status === "done" ? [] : [`extra="${STATUS_TEXT[status] ?? status}"`])
    ]
    const line = `${indent}<ui-card ${attributes.join(" ")}></ui-card>`
    if (line.length <= WIDTH) return [line]
    return [`${indent}<ui-card`, ...attributes.map((attribute) => `${indent}  ${attribute}`), `${indent}></ui-card>`]
  }

  /**
   * `tag`'s page, relative to `components/`:  `ui-button.html`, `ui-radio.html` for a sub-tag with its own page,
   * `ui-button.html#ui-or` for one on its family's page.
   */
  private static href(tag: SiteTag): string {
    return (tag.href ?? `components/${tag.folder}.html#${tag.tag}`).replace(/^components\//, "")
  }

  /** `date & time` => `date-time`. */
  private static slug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
  }
}

/** Start marker (its own line);  its indent is the block's. */
const START = "<!-- components:start -->"

/** End marker (its own line). */
const END = "<!-- components:end -->"

/** oxfmt's line width (`vite.lint.ts`):  a longer tag breaks one attribute per line. */
const WIDTH = 120

const { values } = parseArgs({ options: { check: { type: "boolean", default: false } } })
const writer = new ComponentIndexWriter()
// the block is written flat (a header per topic), then nested into sections as every page is
const page = SiteSections.convert(writer.render(readFileSync(writer.file, "utf8")))
const [stale] = writeOrCheck([[writer.file, page]], { command: "site:index", isCheck: values.check })
if (!values.check) Terminal.out(`component index:  ${stale ? `wrote ${stale}` : "unchanged"}`)
