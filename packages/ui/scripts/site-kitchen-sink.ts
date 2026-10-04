/**
 * `yarn site:kitchen [--check]`:  write the kitchen sink's examples, `site/kitchen-sink.html`, from every component
 * family's MAIN example file:  `src/components/ui-<family>/examples/elements/types.html`, else its first `.html`.
 * - Why generated:  the old Astro page read the same files at build time;  a static page would drift from them.
 *   The markup is the files' own (the families' tests render them), so it keeps their native bits (`<p>`, a
 *   `style=` box around a loader, `<div class="ui-stack">` around radios).
 * - Grouped as Fomantic's kitchen sink is:  Elements, Collections, Views, Modules (each family's Fomantic topic),
 *   then our own families;  A-Z by title inside a group.  Families without an element example (`item`:  `items`
 *   shows it) are left out.
 * - Example sources (`<ui-include source>` ...) point at the site's copies in `site/examples/` (`SITE_SOURCES`).
 * - `MAIN_FILES` names the file where `types.html` isn't the main one (`ui-parts`:  `header.html`).  Sections holding
 *   `stub-*` stand-ins (the tests' `StubOwner`, not real elements) are left out;  at most `MAX_SECTIONS` (3) per
 *   family, so the page stays scannable (the family's page has the rest).
 * - Each file's `<section><h4>Title</h4>...</section>` becomes a `<ui-docs-example>`:  the family's first one headed
 *   with its title and summary (+ a link to its page), the rest a header-less continuation described by their
 *   `<h4>`.  A section's own class (`ui-dark ui-p-m`) becomes a `<div>` around its body.  A file without sections is
 *   one example.
 * - Writes ONLY between the page's `<!-- kitchen:start -->` and `<!-- kitchen:end -->` markers;  the rest of the page
 *   is hand-kept.  Written flat (a header per group, the family's first example headed), then nested into
 *   `<ui-section>`s by `yarn site:sections`' converter (`SiteSections`), as every page is.  Lines keep the example files' own layout, re-indented, so oxfmt may re-wrap a long one:  rerun.
 * - Rerun after changing an example (`yarn site:build` runs it).  `--check`:  write nothing;  exit 1 if stale.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"

import type { SiteDataFile, SiteFamily, SiteTag } from "../src/docs-components/docs-components.types.ts"

import { SiteSections } from "./site-sections.ts"

/** `packages/ui/`. */
const UI = path.resolve(import.meta.dirname, "..")

/****************
 * ### `KitchenSinkWriter`
 * Renders the kitchen sink's generated block from the example files, and splices it between the page's markers.
 ****************/
class KitchenSinkWriter {
  /** The page. */
  readonly file = path.join(UI, "site/kitchen-sink.html")

  /** The site's data:  titles, summaries, topics. */
  readonly data: SiteDataFile = JSON.parse(readFileSync(path.join(UI, "site/_data/components.json"), "utf8"))

  /** Start marker (its own line);  its indent is the block's. */
  static readonly START = "<!-- kitchen:start -->"

  /** End marker (its own line). */
  static readonly END = "<!-- kitchen:end -->"

  /** The groups, in order:  Fomantic's four, then ours (`topic` absent). */
  static readonly GROUPS: readonly { id: string; title: string; topic?: string }[] = [
    { id: "elements", title: "Elements", topic: "elements" },
    { id: "collections", title: "Collections", topic: "collections" },
    { id: "views", title: "Views", topic: "views" },
    { id: "modules", title: "Modules", topic: "modules" },
    { id: "spell-ui", title: "Spell UI's own" }
  ]

  /** Sections shown per family:  enough to judge a theme, short enough to scroll through every family. */
  static readonly MAX_SECTIONS = 3

  /** A family's main example file where it isn't `types.html` (or the first file):  folder => file name. */
  static readonly MAIN_FILES: Readonly<Record<string, string>> = { "ui-parts": "header.html" }

  /**
   * The site's copies of the example source files (`site/examples/`), by the source's file name, where the name
   * differs;  a `source="/src/components/.../examples/sources/<file>"` (a dev-server path) points at the copy.
   */
  static readonly SITE_SOURCES: Readonly<Record<string, string>> = { "notes.html": "release-notes.html" }

  /** `page` with its generated block replaced by a fresh one. */
  render(page: string): string {
    const start = page.indexOf(KitchenSinkWriter.START)
    const end = page.indexOf(KitchenSinkWriter.END)
    if (start < 0 || end < start) throw new Error(`${this.file}:  no ${KitchenSinkWriter.START} ... END markers`)
    const lineStart = page.lastIndexOf("\n", start) + 1
    const indent = page.slice(lineStart, start)
    return page.slice(0, start + KitchenSinkWriter.START.length) + "\n" + this.block(indent) + indent + page.slice(end)
  }

  /** The generated lines:  per group a header, then each family's examples, at `indent`. */
  private block(indent: string): string {
    const tags = new Map(this.data.components.map((tag) => [tag.tag, tag]))
    const families = Object.values(this.data.families).filter((family) => !family.docs && this.exampleFile(family))
    const lines: string[] = []
    for (const group of KitchenSinkWriter.GROUPS) {
      const members = families
        .filter((family) => KitchenSinkWriter.groupOf(tags.get(family.mainTag)) === group.topic)
        .sort((a, b) => a.title.localeCompare(b.title))
      if (!members.length) continue
      lines.push("", `${indent}<ui-header level="2" dividing id="${group.id}">${group.title}</ui-header>`)
      for (const family of members) lines.push("", ...this.family(family, indent))
    }
    return lines.slice(1).join("\n") + "\n"
  }

  /** One family's examples, at `indent`. */
  private family(family: SiteFamily, indent: string): string[] {
    const file = this.exampleFile(family)!
    const sections = KitchenSinkWriter.sections(readFileSync(file, "utf8"))
      .filter((section) => !section.body.some((line) => line.includes("<stub-")))
      .slice(0, KitchenSinkWriter.MAX_SECTIONS)
    const lines: string[] = []
    sections.forEach((section, index) => {
      if (index === 0) {
        const page = `components/${family.mainTag}.html`
        lines.push(
          `${indent}<ui-docs-example header="${KitchenSinkWriter.escape(family.title)}">`,
          `${indent}  <p slot="description">`,
          `${indent}    ${KitchenSinkWriter.escape(KitchenSinkWriter.plain(family.summary))}`,
          `${indent}    <a href="${page}">${KitchenSinkWriter.escape(family.title)} page</a>`,
          `${indent}  </p>`
        )
      } else {
        lines.push(`${indent}<ui-docs-example description="${KitchenSinkWriter.escape(section.title)}">`)
      }
      const body = section.className
        ? [`<div class="${section.className}">`, ...section.body.map((line) => `  ${line}`), "</div>"]
        : section.body
      lines.push(
        ...body.map((line) => (line ? `${indent}  ${KitchenSinkWriter.siteSources(line)}` : "")),
        `${indent}</ui-docs-example>`
      )
    })
    return lines
  }

  /** `family`'s main example file:  `types.html`, else its first `.html`;  `undefined` without one. */
  private exampleFile(family: SiteFamily): string | undefined {
    const folder = path.join(UI, "src/components", family.folder, "examples/elements")
    if (!existsSync(folder)) return undefined
    const files = readdirSync(folder)
      .filter((name) => name.endsWith(".html"))
      .sort()
    const main = KitchenSinkWriter.MAIN_FILES[family.folder]
    const name = main && files.includes(main) ? main : files.includes("types.html") ? "types.html" : files[0]
    return name ? path.join(folder, name) : undefined
  }

  /**
   * An example file's sections:  each `<section>` at the wrapper's top level, its `<h4>` title and its body
   * (dedented);  a file without sections is one untitled section, the whole file minus its comments.
   */
  private static sections(html: string): Section[] {
    const lines = html.replace(/<!--[\s\S]*?-->\n?/g, "").split("\n")
    const sections: Section[] = []
    let current: Section | undefined
    for (const line of lines) {
      const open = /^ {2}<section(?: class="([^"]*)")?>$/.exec(line)
      if (open) {
        current = { title: "", className: open[1], body: [] }
        continue
      }
      if (!current) continue
      if (line === "  </section>") {
        sections.push({ ...current, body: KitchenSinkWriter.trim(current.body) })
        current = undefined
        continue
      }
      const title = /^ {4}<h4>(.*)<\/h4>$/.exec(line)
      if (title && !current.title) current.title = title[1]!
      else current.body.push(line.slice(4))
    }
    if (sections.length) return sections
    return [{ title: "", body: KitchenSinkWriter.trim(lines) }]
  }

  /** `line` with its dev-server example sources pointed at the site's copies (`examples/<file>`). */
  private static siteSources(line: string): string {
    return line.replace(
      /source="\/src\/components\/[^/"]+\/examples\/sources\/([^"]+)"/g,
      (_match, file: string) => `source="examples/${KitchenSinkWriter.SITE_SOURCES[file] ?? file}"`
    )
  }

  /** `lines` without leading and trailing blank lines. */
  private static trim(lines: string[]): string[] {
    const first = lines.findIndex((line) => line.trim())
    const last = lines.findLastIndex((line) => line.trim())
    return first < 0 ? [] : lines.slice(first, last + 1).map((line) => line.trimEnd())
  }

  /** Which group `tag` files under:  its Fomantic topic, else ours (`undefined`). */
  private static groupOf(tag: SiteTag | undefined): string | undefined {
    return KitchenSinkWriter.GROUPS.find((group) => group.topic && tag?.topics.includes(group.topic))?.topic
  }

  /** `text` without markdown code ticks. */
  private static plain(text: string): string {
    return text.replaceAll("`", "")
  }

  /** `text` safe inside an attribute or element. */
  private static escape(text: string): string {
    return text.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
  }
}

/** One example section of a file. */
type Section = {
  /** its `<h4>` text, `""` for a file without sections */
  title: string
  /** the `<section>`'s own class, e.g. `ui-dark ui-p-m` */
  className?: string
  /** its markup, dedented to column 0 */
  body: string[]
}

const writer = new KitchenSinkWriter()
const before = readFileSync(writer.file, "utf8")
// the block is written flat (headers, headed examples), then nested into sections as every page is
const after = SiteSections.convert(writer.render(before))
const relative = path.relative(process.cwd(), writer.file)
if (process.argv.includes("--check")) {
  if (after !== before) console.error(`stale:  ${relative} (run \`yarn site:kitchen\`)`)
  process.exitCode = after === before ? 0 : 1
} else {
  if (after !== before) writeFileSync(writer.file, after)
  console.log(`kitchen sink:  ${after === before ? "unchanged" : `wrote ${relative}`}`)
}
