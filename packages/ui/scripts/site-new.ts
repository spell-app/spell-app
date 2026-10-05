/**
 * `yarn site:new <tag|page> [--title "Title"] [--summary "One line."] [--force]`:  write a Spell UI docs page from the
 * template, `templates/spell-ui-docs.html`.
 * - A TAG (`ui-button`, `button`, `ui-or`:  any tag of a family) writes `ui/components/<main tag>.html` (the shared
 *   pages, `SITE_PAGES`), the component layout:  masthead with the family's theme picker, Examples / Usage / API /
 *   Theming tabs.  Title, summary and status come from `site/_data/pages.json` (`--title` / `--summary` override
 *   them).
 * - A sub-tag with a page of its OWN (pages.json `pages`, e.g. `ui-radio`) writes `ui/components/<tag>.html`:  its
 *   own title, summary and status, ONE tag's API tables (`<ui-docs-api tag>`), and the Theming tab only when one of
 *   the family's tokens names it (`--ui-checkbox-radio-size`;  `ui-meta` has none:  its owners style it).
 * - Anything else is a PAGE:  `ui/<page>.html`, one content column, no tabs;  `--title` (default:  the name in
 *   Title Case) and `--summary`.
 * - Fills the template's `{{...}}` placeholders, keeps the `site:component` OR `site:page` blocks (and drops the
 *   status label for a `done` family, the Fomantic link when Fomantic has no such page), and rewrites the
 *   template's `../ui/` paths for the page's depth.  The page is its `<head>` and `main` alone:  the chrome is
 *   `ui/_parts/layout.html`.
 * - Refuses to overwrite an existing page without `--force`.  Prints the path and the page server URL hint.
 * - The Fomantic link:  `reference/Fomantic-UI-Docs/server/documents/<group>/<name>.html.eco` (git-ignored clone,
 *   plan doc P1), by the family name, or `FOMANTIC_PAGES` for the families whose page has another name.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs"
import path from "node:path"

import { SITE_BUILD, SITE_PAGES } from "../tools/tools.types.ts"

import { SiteSections } from "./site-sections.ts"

/** `packages/ui/`. */
const UI = path.resolve(import.meta.dirname, "..")

/** The template, in the shared content's `templates/` (linked at the checkout's root). */
const TEMPLATE = path.resolve(UI, "../../templates/spell-ui-docs.html")

/** The template's own path prefix to the site's pages (it lives in `templates/`, beside `ui/`). */
const TEMPLATE_SITE = "../ui/"

/** Fomantic's docs pages, by group folder. */
const FOMANTIC_DOCS = path.join(UI, "reference/Fomantic-UI-Docs/server/documents")

/** Families whose Fomantic page has another name (plan doc 1.3, the page map). */
const FOMANTIC_PAGES: Record<string, string> = {
  "ui-ad": "views/advertisement",
  "ui-parts": "elements/header",
  "ui-select": "modules/dropdown",
  "ui-items": "views/item",
  "ui-visibility": "behaviors/visibility"
}

/**
 * Fomantic pages of the sub-tags with a page of their own, where Fomantic has one;  the rest get no Fomantic link
 * (the content parts are spread over its card, item, feed ... pages).
 */
const FOMANTIC_TAG_PAGES: Record<string, string> = {
  "ui-radio": "modules/checkbox",
  "ui-textarea": "collections/form"
}

/** Words shown for a family's `status` in the masthead label. */
const STATUS_TEXT: Record<string, string> = { planned: "Planned", "in-progress": "In progress" }

/** A family as `components.json` describes it (the fields used here). */
type Family = {
  folder: string
  mainTag: string
  title: string
  summary: string
  status: string
  tags: string[]
  /** sub-tags with a page of their own:  tag => title, summary, status */
  pages?: Record<string, { title: string; summary: string; status: string }>
  tokens: { name: string }[]
}

/** What fills a template. */
type PageFacts = {
  /** `ui/`-relative output path, e.g. `components/ui-button.html` */
  file: string
  title: string
  summary: string
  /** `done` drops the status label */
  status: string
  /** the tag the page documents, e.g. `ui-button` (a main tag) or `ui-radio`;  empty for a page */
  tag: string
  /** a sub-tag's own page:  ONE tag's API tables (`site:tag`), not the family's (`site:family`) */
  own: boolean
  /** keep the Theming tab */
  theming: boolean
  /** family folder, e.g. `ui-button`;  empty for a page */
  family: string
  /** fomantic-ui.com URL, or empty */
  fomantic: string
}

/****************
 * ### `SitePageWriter`
 * Turns the template into one page:  facts from the site data, blocks kept or dropped, paths fixed for depth.
 ****************/
class SitePageWriter {
  /** the site's pages, `ui/` */
  readonly site = path.join(UI, SITE_PAGES)

  /** Every family of `components.json`, by folder. */
  private readonly families: Record<string, Family> = JSON.parse(
    readFileSync(path.join(UI, SITE_BUILD, "_data/components.json"), "utf8")
  ).families

  /** The facts for `name` (a tag, a family folder or a page name), with `--title` / `--summary` applied. */
  facts(name: string, options: { title?: string; summary?: string }): PageFacts {
    const family = this.family(name)
    if (!family) {
      const page = name.replace(/\.html$/, "")
      return {
        file: `${page}.html`,
        title: options.title ?? SitePageWriter.titleCase(page),
        summary: options.summary ?? "",
        status: "done",
        tag: "",
        own: false,
        theming: false,
        family: "",
        fomantic: ""
      }
    }
    const tag = SitePageWriter.tagOf(name)
    const own = family.pages && Object.hasOwn(family.pages, tag) ? family.pages[tag]! : undefined
    if (own) {
      const noun = tag.replace(/^ui-/, "")
      return {
        file: `components/${tag}.html`,
        title: options.title ?? own.title,
        summary: options.summary ?? own.summary,
        status: own.status,
        tag,
        own: true,
        theming: family.tokens.some((token) => token.name.includes(`-${noun}-`)),
        family: family.folder,
        fomantic: FOMANTIC_TAG_PAGES[tag] ? `https://fomantic-ui.com/${FOMANTIC_TAG_PAGES[tag]}.html` : ""
      }
    }
    return {
      file: `components/${family.mainTag}.html`,
      title: options.title ?? family.title,
      summary: options.summary ?? family.summary,
      status: family.status,
      tag: family.mainTag,
      own: false,
      theming: true,
      family: family.folder,
      fomantic: SitePageWriter.fomantic(family)
    }
  }

  /** The page's HTML for `facts`. */
  render(facts: PageFacts): string {
    const depth = facts.file.split("/").length - 1
    const rel = "../".repeat(depth)
    const component = !!facts.tag
    let html = readFileSync(TEMPLATE, "utf8")
    html = SitePageWriter.dropComment(html)
    html = SitePageWriter.block(html, "component", component)
    html = SitePageWriter.block(html, "page", !component)
    html = SitePageWriter.block(html, "status", facts.status !== "done")
    html = SitePageWriter.block(html, "fomantic", !!facts.fomantic)
    html = SitePageWriter.block(html, "family", !facts.own)
    html = SitePageWriter.block(html, "tag", facts.own)
    html = SitePageWriter.block(html, "theming", facts.theming)
    html = html
      .replace(/<title>[^<]*<\/title>/, `<title>${SitePageWriter.escape(`${facts.title} | Spell UI`)}</title>`)
      .replace(/(<meta\s+name="description"\s+content=")[^"]*(")/, `$1${SitePageWriter.escape(facts.summary)}$2`)
      .replaceAll(TEMPLATE_SITE, rel)
    const values: Record<string, string> = {
      title: facts.title,
      summary: facts.summary,
      status: STATUS_TEXT[facts.status] ?? facts.status,
      tag: facts.tag,
      family: facts.family,
      fomantic: facts.fomantic,
      bugTitle: encodeURIComponent(`${facts.tag || facts.title}:  `)
    }
    return html.replace(/\{\{(\w+)\}\}/g, (match, key: string) =>
      key in values ? SitePageWriter.escape(values[key]!) : match
    )
  }

  /** `name` as a tag:  `button` => `ui-button`. */
  private static tagOf(name: string): string {
    return name.startsWith("ui-") ? name : `ui-${name}`
  }

  /** The family `name` names:  a folder, a main tag, any tag of a family, or a bare name (`button`). */
  private family(name: string): Family | undefined {
    const tag = SitePageWriter.tagOf(name)
    const families = Object.values(this.families)
    return (
      this.families[tag] ??
      families.find((family) => family.mainTag === tag) ??
      families.find((family) => family.tags.includes(tag))
    )
  }

  /** fomantic-ui.com's page for `family`, if its docs have one. */
  private static fomantic(family: Family): string {
    const known = FOMANTIC_PAGES[family.folder]
    if (known) return `https://fomantic-ui.com/${known}.html`
    const name = family.folder.replace(/^ui-/, "")
    if (!existsSync(FOMANTIC_DOCS)) return ""
    for (const group of readdirSync(FOMANTIC_DOCS)) {
      if (existsSync(path.join(FOMANTIC_DOCS, group, `${name}.html.eco`))) {
        return `https://fomantic-ui.com/${group}/${name}.html`
      }
    }
    return ""
  }

  /** `html` with the `<!-- site:<name>:start -->` ... `end` blocks kept (markers dropped) or removed. */
  private static block(html: string, name: string, keep: boolean): string {
    const pattern = new RegExp(
      `[ \\t]*<!-- site:${name}:start -->\\n([\\s\\S]*?)[ \\t]*<!-- site:${name}:end -->\\n`,
      "g"
    )
    return html.replace(pattern, (_match, inner: string) => (keep ? inner : ""))
  }

  /** `html` without the template's leading `TEMPLATE:` comment (a page doesn't need it). */
  private static dropComment(html: string): string {
    return html.replace(/<!--\s*\n\s*TEMPLATE:[\s\S]*?-->\n/, "")
  }

  /** `text` safe inside an attribute or element. */
  private static escape(text: string): string {
    return text.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
  }

  /** `getting-started` => `Getting Started`. */
  private static titleCase(name: string): string {
    return name
      .split(/[-_\s]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }
}

const args = process.argv.slice(2)
const name = args.find((arg, index) => !arg.startsWith("--") && !args[index - 1]?.match(/^--(title|summary)$/))
if (!name) {
  console.error('usage:  yarn site:new <tag|page> [--title "Title"] [--summary "One line."] [--force]')
  process.exit(2)
}
const writer = new SitePageWriter()
const facts = writer.facts(name, { title: option("--title"), summary: option("--summary") })
const file = path.join(writer.site, facts.file)
if (existsSync(file) && !args.includes("--force")) {
  console.error(`${path.relative(process.cwd(), file)} exists:  pass --force to overwrite it`)
  process.exit(1)
}
// the template's section ids are written for its placeholder title:  fixed for the page's own (`#examples-types-card`)
writeFileSync(file, SiteSections.convert(writer.render(facts)))
const kind = facts.own ? `own page of ${facts.tag}` : facts.tag ? `component ${facts.tag}` : "page"
console.log(
  `wrote ${path.relative(process.cwd(), file)}  (${kind}${facts.own && !facts.theming ? ", no Theming tab" : ""})`
)
console.log(`  view:  spell dev server url ${file}   (from the repo root);  check:  yarn site:check ${facts.file}`)

/** The value after `flag` in the arguments. */
function option(flag: string): string | undefined {
  const at = args.indexOf(flag)
  return at < 0 ? undefined : args[at + 1]
}
