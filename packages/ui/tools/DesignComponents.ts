import { existsSync, readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"

import { ElementManifests } from "./ElementManifests.ts"
import type { SiteAttribute, SiteDataFile, SiteFamily, SiteTag } from "../src/docs-components/docs-components.types.ts"
import type { DesignExample, DesignFamily, DesignSource } from "./tools.types.ts"

/****************
 * ### `DesignComponents`
 * The component half of the design-system export (`DesignExport`):  for each family (one card per MAIN tag), its
 * `components/<Comp>/README.md` and `preview.html`, plus `components/index.d.ts` for every tag.
 * - All from the site data (`components.json`:  every vocabulary) and the families' element examples
 *   (`src/components/<folder>/examples/elements/*.html`), so nothing about a tag is guessed.
 * - Card groups:  a small fixed set (`GROUPS`), picked from each main tag's topics, in its own topic order.
 * - `sources`:  cards from outside Spell UI (the brand's `<ui-brand-*>`, `DesignBrand`):  their site data merged into
 *   `data`, every family of one in that source's group (after `GROUPS`), its examples and styles from the source.
 ****************/
export class DesignComponents {
  /** site data, as `yarn site:data` builds it, with every source's merged in */
  readonly data: SiteDataFile
  /** `packages/ui`, absolute */
  readonly uiFolder: string
  /** cards from outside Spell UI, e.g. the brand's */
  readonly sources: readonly DesignSource[]
  /** every element example section, by family folder, read once (`examples()`) */
  private readonly sections = new Map<string, DesignExample[]>()

  constructor({ data, uiFolder, sources = [] }: DesignComponentsProps) {
    this.data = DesignComponents.merge(data, sources)
    this.uiFolder = uiFolder
    this.sources = sources
  }

  /**
   * Spell UI's site data with each source's added:  its tags after ours, its families and topics beside ours.
   * - Throws a `TypeError` on a tag or family folder both have:  a card would be lost.
   */
  static merge(data: SiteDataFile, sources: readonly DesignSource[]): SiteDataFile {
    if (!sources.length) return data
    const components = [...data.components]
    const families = { ...data.families }
    const topics = [...data.topics]
    for (const source of sources) {
      for (const tag of source.data.components) {
        if (components.some((entry) => entry.tag === tag.tag)) {
          throw new TypeError(`DesignComponents.merge():  <${tag.tag}> is in two sources;  rename one`)
        }
        components.push(tag)
      }
      for (const [folder, family] of Object.entries(source.data.families)) {
        if (families[folder]) {
          throw new TypeError(`DesignComponents.merge():  family ${folder} is in two sources;  rename one`)
        }
        families[folder] = family
      }
      for (const topic of source.data.topics) if (!topics.some((entry) => entry.id === topic.id)) topics.push(topic)
    }
    return { ...data, components, families, topics }
  }

  /** The source family `folder` comes from, or `undefined` for Spell UI's own. */
  sourceFor(folder: string): DesignSource | undefined {
    return this.sources.find((source) => folder in source.data.families)
  }

  /** One card per family:  its main tag, name, group, tags and where its preview came from;  in `GROUPS` order, A-Z. */
  families(): DesignFamily[] {
    const mains = this.data.components.filter((tag) => tag.main)
    const families = mains.map((main) => {
      const tags = this.data.families[main.folder]?.tags ?? [main.tag]
      const example = this.previewExamples(main)[0]?.source ?? ""
      return {
        comp: ElementManifests.pascal(main.tag),
        mainTag: main.tag,
        group: this.sourceFor(main.folder)?.group ?? DesignComponents.groupFor(main),
        tags: [...tags],
        example
      }
    })
    const groups = [...GROUPS.map((group) => group.name), ...this.sources.map((source) => source.group)]
    return families.sort((a, b) => rank(a) - rank(b) || a.comp.localeCompare(b.comp))

    /** A card's place by its group:  `GROUPS` order, then the sources'. */
    function rank(family: DesignFamily): number {
      return groups.indexOf(family.group)
    }
  }

  /** The card group of a main tag:  the first of its topics `GROUPS` maps (its own topic order), else `Display`. */
  static groupFor(tag: SiteTag): string {
    for (const topic of tag.topics) {
      const group = GROUPS.find((entry) => entry.topics.includes(topic))
      if (group) return group.name
    }
    return "Display"
  }

  ////////////////
  // ## README.md
  ////////////////

  /**
   * `components/<Comp>/README.md`:  summary first (the card's one-line summary), when to use it, its tags, each tag's
   * attributes / slots / events / parts, its CSS tokens, then markup examples.
   * - Capped at 64 KB (the format's limit):  parts, states and tokens go first, then the second example.
   */
  readme(family: DesignFamily): string {
    const site = this.data.families[this.tag(family.mainTag).folder]
    const tags = family.tags.map((name) => this.tag(name))
    const examples = this.previewExamples(this.tag(family.mainTag))
    for (const level of [0, 1, 2, 3]) {
      const text = this.readmeText({ family, site, tags, examples, level })
      if (Buffer.byteLength(text) <= README_CAP) return text
    }
    return this.readmeText({ family, site, tags, examples: [], level: 3 })
  }

  /** The README at trim `level`:  0 everything;  1 no parts / states;  2 no CSS tokens either;  3 one example. */
  private readmeText({ family, site, tags, examples, level }: ReadmeTextParams): string {
    const main = tags[0]!
    const summary = DesignComponents.sentence(site?.summary || main.description || `${family.comp}.`)
    const lines = [`# ${family.comp}`, "", summary, ""]
    lines.push(
      `${tags.map((tag) => `\`<${tag.tag}>\``).join(" · ")} -- group **${family.group}**` +
        (site && site.title !== family.comp ? ` -- family **${site.title}**` : "") +
        (main.aka.length ? ` -- also called ${main.aka.join(", ")}` : ""),
      ""
    )
    lines.push("## When to use", "")
    if (main.description && DesignComponents.sentence(main.description) !== summary) lines.push(`- ${main.description}`)
    lines.push(`- Look for it under:  ${main.topics.map((id) => this.topicTitle(id)).join(", ")}.`)
    if (tags.length > 1)
      lines.push(
        `- Its parts are elements of their own:  ${tags
          .slice(1)
          .map((tag) => `\`<${tag.tag}>\``)
          .join(", ")}.`
      )
    for (const note of NOTES[family.mainTag] ?? []) lines.push(`- ${note}`)
    lines.push(
      '- Write it as plain markup (flags present or absent), inside `<ui-root>`:  see the system README\'s "Consuming".',
      ""
    )
    if (tags.length > 1) {
      lines.push("## Tags", "", "| Tag | What it is |", "|---|---|")
      for (const tag of tags) lines.push(`| \`<${tag.tag}>\` | ${DesignComponents.cell(tag.description ?? "")} |`)
      lines.push("")
    }
    for (const tag of tags) lines.push(...this.tagSection(tag, level))
    if (level < 2 && site?.tokens.length) {
      lines.push(
        "## CSS tokens",
        "",
        "Set on the element, an ancestor or the page:  `ui-card { --ui-card-radius: 8px }`.",
        ""
      )
      lines.push("| Token | Default |", "|---|---|")
      for (const token of site.tokens) lines.push(`| \`${token.name}\` | \`${DesignComponents.cell(token.default)}\` |`)
      lines.push("")
    }
    const shown = level < 3 ? examples.slice(0, 2) : examples.slice(0, 1)
    if (shown.length) {
      lines.push("## Examples", "")
      for (const example of shown) lines.push(`### ${example.title}`, "", "```html", example.markup, "```", "")
    }
    return lines.join("\n").trimEnd() + "\n"
  }

  /** One tag's API:  description, attributes, slots, events and (below trim level 1) parts and states. */
  private tagSection(tag: SiteTag, level: number): string[] {
    const lines = [`## \`<${tag.tag}>\``, "", tag.description ?? "", ""]
    const attributes = tag.attributes.filter((attribute) => attribute.kind !== "json")
    const properties = tag.attributes.filter((attribute) => attribute.kind === "json")
    if (attributes.length) {
      lines.push("### Attributes", "", "| Attribute | Takes | Default | What it does |", "|---|---|---|---|")
      for (const attribute of attributes) lines.push(DesignComponents.attributeRow(attribute))
      lines.push("")
    }
    if (properties.length) {
      lines.push(
        "### JS properties",
        "",
        "Rich data, set from script (not attributes);  plain markup uses child elements instead.",
        ""
      )
      for (const property of properties)
        lines.push(
          `- \`${property.property ?? ElementManifests.camel(property.name)}\`:  ${DesignComponents.cell(property.description)}`
        )
      lines.push("")
    }
    if (tag.slots.length) {
      lines.push("### Slots", "", "| Slot | What goes in it |", "|---|---|")
      for (const slot of tag.slots)
        lines.push(
          `| ${slot.name ? `\`${slot.name}\` (\`slot="${slot.name}"\`)` : "default"} | ${DesignComponents.cell(slot.description)} |`
        )
      lines.push("")
    }
    if (tag.events.length) {
      lines.push("### Events", "", "| Event | `detail` | When |", "|---|---|---|")
      for (const event of tag.events)
        lines.push(
          `| \`${event.name}\` | \`${DesignComponents.cell(event.detail)}\` | ${DesignComponents.cell(event.description)}${event.cancelable ? "  Cancelable." : ""} |`
        )
      lines.push("")
    }
    if (level < 1 && tag.parts.length)
      lines.push(
        `**Parts** (\`::part()\`, for styling):  ${tag.parts.map((part) => `\`${part.name}\``).join(", ")}`,
        ""
      )
    if (level < 1 && tag.states.length)
      lines.push(`**States** (\`:state()\`):  ${tag.states.map((state) => `\`${state.name}\``).join(", ")}`, "")
    return lines
  }

  /** One attribute table row:  name (and aliases), what it takes, its default, its description. */
  private static attributeRow(attribute: SiteAttribute): string {
    const names = [attribute.name, ...(attribute.aliases ?? [])].map((name) => `\`${name}\``).join(" / ")
    const fallback = attribute.default === undefined || attribute.default === null ? "" : `\`${attribute.default}\``
    return `| ${names} | ${DesignComponents.cell(ElementManifests.valueWords(attribute))} | ${fallback} | ${DesignComponents.cell(attribute.description)} |`
  }

  ////////////////
  // ## preview.html
  ////////////////

  /**
   * `components/<Comp>/preview.html`:  the `@dsCard` marker on line 1, then a small document showing the family's
   * first example sections inside `<ui-root>`.
   * - The frame has already loaded `bundle.js`;  the one inline `<script>` only marks the page, as the spike's did.
   * - Height:  a guess per section;  the card grows to fit anyway.
   * - A source's family:  its `style()` first, in a `<style>` (the classes its docs page's examples use).
   */
  preview(family: DesignFamily): string {
    const examples = this.previewExamples(this.tag(family.mainTag)).slice(0, PREVIEW_SECTIONS)
    const subtitle = family.tags.slice(0, 4).join(" · ") + (family.tags.length > 4 ? " ..." : "")
    const heavy = examples.some((example) =>
      /<ui-(card|table|form|calendar|modal|feed|comment|step|grid|items)\b/.test(example.markup)
    )
    const height = Math.min(720, Math.max(120, 56 + examples.length * 96 + (heavy ? 160 : 0)))
    const body = examples.length
      ? examples
          .map((example) =>
            [
              "      <section>",
              `        <h4 style="margin: 0 0 8px; font: 600 12px/1.4 system-ui, sans-serif; opacity: 0.7">${DesignComponents.html(example.title)}</h4>`,
              DesignComponents.indent(example.markup, 8),
              "      </section>"
            ].join("\n")
          )
          .join("\n")
      : `      <${family.mainTag}>${family.comp}</${family.mainTag}>`
    const style = this.sourceFor(this.tag(family.mainTag).folder)?.style(this.tag(family.mainTag).folder).trim()
    const wrap = !examples.some((example) => example.markup.includes("<ui-root"))
    const open = wrap
      ? '    <ui-root>\n      <div style="display: grid; gap: 20px">'
      : '    <div style="display: grid; gap: 20px">'
    const close = wrap ? "      </div>\n    </ui-root>" : "    </div>"
    return [
      `<!-- @dsCard group="${family.group}" height=${height} subtitle="${DesignComponents.html(subtitle)}" -->`,
      "<!doctype html>",
      "<html>",
      '  <body style="margin: 0; padding: 16px">',
      ...(style ? ["    <style>", DesignComponents.indent(DesignComponents.dedent(style), 6), "    </style>"] : []),
      open,
      wrap ? DesignComponents.indent(body, 2) : body,
      close,
      "    <script>",
      "      document.body.dataset.spellUi = typeof window.SpellUI",
      "    </script>",
      "  </body>",
      "</html>",
      ""
    ].join("\n")
  }

  ////////////////
  // ## index.d.ts
  ////////////////

  /**
   * `components/index.d.ts`:  a `<Name>Props` type per tag (attributes as props:  string unions for value sets,
   * `boolean` for flags), its slots / events / parts in the docstring, and `HTMLElementTagNameMap` entries.
   * - Documentation, not type-checked (the format reads `<Comp>Props` for its cards).
   */
  declarations(families: DesignFamily[]): string {
    const lines = [
      "/**",
      " * Spell UI:  every `<ui-*>` element's attributes, as `<Name>Props` types.  DOCUMENTATION, not type-checked.",
      " * - These are custom elements, not React components:  load `components/bundle.js` once, then write HTML markup,",
      ' *   e.g. `<ui-button primary icon="check">Save</ui-button>`.',
      " * - Prop names are the HTML attribute names (kebab-case).  `boolean`:  a flag, present or absent.",
      " * - GENERATED by `yarn design:build` (packages/ui, `tools/DesignExport.ts`) from the vocabularies -- do not edit.",
      " */",
      ""
    ]
    const tags = families.flatMap((family) => family.tags.map((name) => this.tag(name)))
    for (const tag of tags) lines.push(...DesignComponents.propsType(tag), "")
    lines.push("declare global {", "  interface HTMLElementTagNameMap {")
    for (const tag of tags) lines.push(`    "${tag.tag}": HTMLElement & ${ElementManifests.pascal(tag.tag)}Props`)
    lines.push("  }", "}", "", "export {}", "")
    return lines.join("\n")
  }

  /** One tag's `<Name>Props` type, with its docstring. */
  private static propsType(tag: SiteTag): string[] {
    const doc = [`\`<${tag.tag}>\`:  ${tag.description ?? ""}`]
    if (tag.slots.length)
      doc.push(
        `- Slots:  ${tag.slots.map((slot) => `${slot.name ? `\`${slot.name}\`` : "default"} (${slot.description})`).join(";  ")}`
      )
    for (const event of tag.events)
      doc.push(
        `- Event \`${event.name}\`, detail \`${event.detail}\`${event.cancelable ? " (cancelable)" : ""}:  ${event.description}`
      )
    if (tag.parts.length) doc.push(`- Parts:  ${tag.parts.map((part) => `\`${part.name}\``).join(", ")}`)
    const lines = ["/**", ...doc.map((line) => ` * ${DesignComponents.comment(line)}`), " */"]
    lines.push(`export type ${ElementManifests.pascal(tag.tag)}Props = {`)
    for (const attribute of tag.attributes) {
      const notes = [attribute.description]
      if (attribute.default !== undefined && attribute.default !== null)
        notes.push(`Default \`${JSON.stringify(attribute.default)}\`.`)
      if (attribute.aliases?.length) notes.push(`Also \`${attribute.aliases.join("`, `")}\`.`)
      if (attribute.kind === "json") notes.push("A JS property (rich data), not an attribute.")
      if (attribute.kind === "multiple") notes.push(`Space-separated:  ${(attribute.values ?? []).join(", ")}.`)
      lines.push(`  /** ${DesignComponents.comment(notes.join("  "))} */`)
      const key = /^[a-z][a-zA-Z0-9]*$/.test(attribute.name) ? attribute.name : JSON.stringify(attribute.name)
      const name = attribute.kind === "json" ? (attribute.property ?? ElementManifests.camel(attribute.name)) : key
      lines.push(`  ${name}?: ${ElementManifests.typeText(attribute)}`)
    }
    lines.push("}")
    return lines
  }

  ////////////////
  // ## Examples
  ////////////////

  /**
   * The example sections a family's preview and README show:  its own (`types.html` first), else the first section of
   * any family's examples that uses its main tag (`<ui-item>` has none of its own).
   * - Sections that load a file (`source=`) are left out:  a design system can't serve our files.
   * - A source's family:  the source's examples only.
   */
  previewExamples(main: SiteTag): DesignExample[] {
    const source = this.sourceFor(main.folder)
    if (source) return source.examples(main.folder).filter((example) => !/\ssource="/.test(example.markup))
    const own = this.examples(main.folder)
    if (own.length) return own
    const pattern = new RegExp(`<${main.tag}[\\s>]`)
    for (const folder of [...this.allFolders()].sort()) {
      const found = this.examples(folder).find((example) => pattern.test(example.markup))
      if (found) return [found]
    }
    return []
  }

  /** Every element example section of family `folder`:  `types.html` first, then the other files A-Z. */
  examples(folder: string): DesignExample[] {
    const cached = this.sections.get(folder)
    if (cached) return cached
    const dir = join(this.uiFolder, "src/components", folder, "examples/elements")
    const files = existsSync(dir) ? readdirSync(dir).filter((file) => file.endsWith(".html")) : []
    files.sort((a, b) => Number(b === "types.html") - Number(a === "types.html") || a.localeCompare(b))
    const result: DesignExample[] = []
    for (const file of files) {
      const source = `components/${folder}/examples/elements/${file}`
      const html = readFileSync(join(dir, file), "utf8").replace(/^\s*<!--[\s\S]*?-->\s*/, "")
      const sections = [...html.matchAll(/<section\b[^>]*>([\s\S]*?)<\/section>/g)].map((match) => match[1]!)
      const bodies = sections.length ? sections : [html]
      for (const body of bodies) {
        if (/\ssource="/.test(body)) continue
        const title =
          /<h\d[^>]*>([\s\S]*?)<\/h\d>/
            .exec(body)?.[1]
            ?.replace(/<[^>]+>/g, "")
            .trim() || DesignComponents.titleFor(file)
        const markup = DesignComponents.dedent(body.replace(/^\s*<h\d[^>]*>[\s\S]*?<\/h\d>/, ""))
        if (markup.trim()) result.push({ title, markup, source })
      }
    }
    this.sections.set(folder, result)
    return result
  }

  /** Every family folder with element examples. */
  private allFolders(): string[] {
    const root = join(this.uiFolder, "src/components")
    return readdirSync(root).filter((folder) => existsSync(join(root, folder, "examples/elements")))
  }

  ////////////////
  // ## Helpers
  ////////////////

  /** The site data's entry for `tag`;  throws on a tag it doesn't have. */
  tag(tag: string): SiteTag {
    const found = this.data.components.find((entry) => entry.tag === tag)
    if (!found) throw new Error(`DesignComponents.tag():  no site data for <${tag}>;  run \`yarn site:data\``)
    return found
  }

  /** A topic id's display title. */
  private topicTitle(id: string): string {
    return this.data.topics.find((topic) => topic.id === id)?.title ?? id
  }

  /** `text`'s first sentence, ending with a period. */
  static sentence(text: string): string {
    const first = /^[\s\S]*?[.!?](?=\s|$)/.exec(text.trim())?.[0] ?? text.trim()
    return /[.!?]$/.test(first) ? first : `${first}.`
  }

  /** `text` safe in a markdown table cell:  one line, pipes escaped. */
  static cell(text: string): string {
    return text.replace(/\s*\n\s*/g, " ").replace(/\|/g, "\\|")
  }

  /** `text` safe in a `/** ... *\/` comment. */
  private static comment(text: string): string {
    return text.replace(/\*\//g, "*\\/").replace(/\s*\n\s*/g, " ")
  }

  /** `text` safe in HTML text or a double-quoted attribute. */
  private static html(text: string): string {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
  }

  /** `text` with its common leading indent removed, and blank edges trimmed. */
  static dedent(text: string): string {
    const lines = text
      .replace(/^\s*\n/, "")
      .trimEnd()
      .split("\n")
    const indent = Math.min(...lines.filter((line) => line.trim()).map((line) => /^ */.exec(line)![0].length))
    return lines.map((line) => line.slice(Number.isFinite(indent) ? indent : 0)).join("\n")
  }

  /** Every non-blank line of `text` indented by `spaces`. */
  private static indent(text: string, spaces: number): string {
    return text
      .split("\n")
      .map((line) => (line.trim() ? " ".repeat(spaces) + line : ""))
      .join("\n")
  }

  /** An example file's name as a title:  `variations.html` => `Variations`. */
  private static titleFor(file: string): string {
    const name = file.replace(/\.html$/, "").replace(/-/g, " ")
    return name.charAt(0).toUpperCase() + name.slice(1)
  }
}

/** Constructor props of `DesignComponents`. */
export type DesignComponentsProps = {
  /** site data, as `yarn site:data` builds it;  the sources' is merged in */
  data: SiteDataFile
  /** `packages/ui`, absolute */
  uiFolder: string
  /** cards from outside Spell UI, e.g. the brand's;  default none */
  sources?: readonly DesignSource[]
}

/** `DesignComponents.readmeText()`'s inputs:  one card, and how much to trim. */
type ReadmeTextParams = {
  /** the card */
  family: DesignFamily
  /** its family's site data, when it has some */
  site: SiteFamily | undefined
  /** its tags' site data, main first */
  tags: SiteTag[]
  /** the example sections to show */
  examples: DesignExample[]
  /** trim level, 0..3 */
  level: number
}

/** README size cap, bytes (the format's 64 KB). */
const README_CAP = 64 * 1024

/** Example sections a preview shows at most. */
const PREVIEW_SECTIONS = 3

/**
 * The card groups, in order, and the topics (`ValueSets.topics` ids) that file a family under each.
 * - A main tag goes in the group of its FIRST topic listed here, in the vocabulary's own topic order.
 */
const GROUPS: readonly {
  /** the card group, e.g. `Actions` */
  name: string
  /** `ValueSets.topics` ids that file a family under it */
  topics: readonly string[]
}[] = [
  { name: "Actions", topics: ["buttons"] },
  { name: "Forms", topics: ["forms", "inputs", "selection", "date & time", "controls"] },
  { name: "Navigation", topics: ["navigation", "menus"] },
  { name: "Feedback", topics: ["feedback", "messages", "notifications", "loading", "progress", "status"] },
  { name: "Overlays", topics: ["overlays", "dialogs", "popups"] },
  { name: "Layout", topics: ["layout", "containers"] },
  {
    name: "Display",
    topics: [
      "text",
      "typography",
      "media",
      "images",
      "icons",
      "data display",
      "lists",
      "tables",
      "cards",
      "social",
      "content parts",
      "animation",
      "documentation"
    ]
  }
]

/**
 * What doesn't work in Claude Design, by main tag.
 * - Emoji:  the name data still loads lazily, which the design frame blocks (plan caveat C6);  the design bundle
 *   (P8) inlines the code and markdown engines and every Font Awesome Free icon, so those work.
 */
const NOTES: Record<string, string[]> = {
  "ui-emoji": [
    "In Claude Design emoji names draw nothing yet:  the name data loads lazily (C6).  The brand uses no emoji anyway."
  ],
  "ui-include": ["In Claude Design there's no file to load (`source`):  write the content inline instead."],
  "ui-code": [
    'Write the code inline (a `<script type="text/plain">` child), not `source=`:  a design has no files of ours to load.'
  ],
  "ui-markdown": ["Write the markdown inline, not `source=`:  a design has no files of ours to load."]
}
