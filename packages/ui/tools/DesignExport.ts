import { execFileSync } from "node:child_process"
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

import { DesignBrand } from "./DesignBrand.ts"
import { DesignComponents } from "./DesignComponents.ts"
import { DesignTokens } from "./DesignTokens.ts"
import type { SiteDataFile } from "../src/docs-components/docs-components.types.ts"
import type {
  DesignExportResult,
  DesignFamily,
  DesignFile,
  DesignSkip,
  DesignSource,
  DesignTokensFile
} from "./tools.types.ts"

/****************
 * ### `DesignExport`
 * The claude.ai Design System's files, from what Spell UI already knows about itself (epic `claude-design`, P7):
 * `yarn design:build` (`spell dev design build`) writes them to `<out>/project/`, laid out as the format says.
 * - `README.md` -- the brand book:  how to consume the elements (plain markup, one script), the brand's content and
 *   visual rules in `ui` terms, and an index of components by group
 * - `tokens.json` -- the `spell-brand` theme's tokens, light and dark (`DesignTokens`)
 * - `components/index.d.ts`, `components/<Comp>/README.md` + `preview.html` per family (`DesignComponents`)
 * - `components/Cover/preview.html` -- the cover;  `design-system.json` -- the system's index
 * - NOT `components/bundle.js` / `bundle.css`:  the design bundle's build (P8) writes those into the same folder,
 *   and `write()` leaves them there.
 * - Sources:  `site/_data/components.json` (`yarn site:data`:  every vocabulary), the element examples, the theme
 *   sheets, and the brand book's "CONTENT FUNDAMENTALS" (`brand/spell-design-system/readme.md`, shared).
 * - Plus the brand's `<ui-brand-*>` cards, a "Brand" group (`DesignBrand`, epic `claude-design` P11):  read as data.
 ****************/
export class DesignExport {
  /** `packages/ui`, absolute */
  readonly uiFolder: string
  /** site data, as `yarn site:data` wrote it */
  readonly data: SiteDataFile
  /** commit and author facts for `meta.source` and `lastChange` */
  readonly git: DesignGit
  /** when this export was made:  `lastChange.at`, `meta.synced` */
  readonly now: Date
  /** cards from outside Spell UI:  the brand's, unless this checkout has none */
  readonly sources: readonly DesignSource[]
  /** Spell UI's site data with the sources' merged in:  every card's facts */
  readonly allData: SiteDataFile

  constructor(options: DesignExportOptions = {}) {
    this.uiFolder = options.uiFolder ?? UI_FOLDER
    this.data =
      options.data ??
      (JSON.parse(readFileSync(join(this.uiFolder, "site/_data/components.json"), "utf8")) as SiteDataFile)
    this.git = options.git ?? DesignExport.readGit(this.uiFolder)
    this.now = options.now ?? new Date()
    this.sources = options.sources ?? DesignExport.defaultSources(this.uiFolder)
    this.allData = DesignComponents.merge(this.data, this.sources)
  }

  /** The sources a checkout has:  the brand's (`DesignBrand`), when its site data is there. */
  static defaultSources(uiFolder: string): DesignSource[] {
    const brand = DesignBrand.read(join(uiFolder, "../.."))
    return brand ? [brand] : []
  }

  /** Every file of the export, in memory, with what went in and what was left out. */
  build(): DesignExportResult {
    const components = new DesignComponents({ data: this.data, uiFolder: this.uiFolder, sources: this.sources })
    const tokens = new DesignTokens({
      stylesFolder: join(this.uiFolder, "src/styles"),
      foundation: this.data.foundation
    })
    const tokensFile = tokens.build(this.meta())
    const families = components.families()
    const skipped = tokens.skipped
    const files: DesignFile[] = [
      { path: "README.md", text: this.readme(families, tokensFile, skipped) },
      { path: "tokens.json", text: JSON.stringify(tokensFile, null, 2) + "\n" },
      { path: "components/index.d.ts", text: components.declarations(families) },
      ...families.flatMap((family) => [
        { path: `components/${family.comp}/README.md`, text: components.readme(family) },
        { path: `components/${family.comp}/preview.html`, text: components.preview(family) }
      ]),
      { path: "components/Cover/preview.html", text: DesignExport.cover() },
      { path: "design-system.json", text: JSON.stringify(this.index(), null, 2) + "\n" }
    ]
    const tokenCounts: Record<string, number> = { color: tokensFile.color.tokens.length }
    tokenCounts.type = tokensFile.type.groups.reduce((sum, group) => sum + group.styles.length, 0)
    for (const key of ["spacing", "radius", "shadow", "size", "motion", "zIndex", "breakpoint"] as const)
      tokenCounts[key] = tokensFile[key].tokens.length
    return { files, families, tokenCounts, skipped }
  }

  /**
   * Build, then write everything to `<out>/project/`.
   * - Clears what an earlier run wrote there first (stale cards), but keeps `components/bundle.js` / `bundle.css`
   *   (the design bundle's, P8).
   */
  write(out: string): DesignExportResult {
    const result = this.build()
    const project = join(out, "project")
    DesignExport.clear(project)
    for (const file of result.files) {
      const path = join(project, file.path)
      mkdirSync(dirname(path), { recursive: true })
      writeFileSync(path, file.text)
    }
    return result
  }

  ////////////////
  // ## The brand book
  ////////////////

  /** `README.md`:  intro, consuming, content and visual rules, icons, the component index, what isn't synced. */
  private readme(families: DesignFamily[], tokens: DesignTokensFile, skipped: DesignSkip[]): string {
    const lines = [
      `# ${SYSTEM_TITLE}`,
      "",
      "**Spell** is a programming language for non-programmers whose source code is grammatical human language:  AI " +
        "writes the spell, a person reads and edits it, and Spell compiles it into an app that runs in a browser.  This " +
        "system is its interface kit, **Spell UI**:  Fomantic UI reborn as `<ui-*>` custom elements (built on Solid 2), " +
        "in Spell's brand.  Brand brief:  *friendly without being kitschy, and sophisticated.*",
      "",
      ...CONSUMING,
      ...this.contentFundamentals(),
      ...VISUAL_FOUNDATIONS,
      ...ICONS,
      "## Components",
      "",
      "One card per family, named for its main tag;  each card's README lists every attribute, slot and event of each tag.",
      ""
    ]
    for (const group of [...new Set(families.map((family) => family.group))]) {
      lines.push(`### ${group}`, "")
      const intro = this.sources.find((source) => source.group === group)?.intro
      if (intro) lines.push(intro, "")
      for (const family of families.filter((entry) => entry.group === group)) {
        const summary = this.allData.families[this.folderFor(family)]?.summary ?? ""
        const tags = family.tags.map((tag) => `\`<${tag}>\``).join(", ")
        lines.push(`- [${family.comp}](components/${family.comp}/README.md) (${tags}):  ${summary}`)
      }
      lines.push("")
    }
    lines.push(...this.notSynced(tokens, skipped))
    return lines.join("\n").trimEnd() + "\n"
  }

  /**
   * The brand book's "CONTENT FUNDAMENTALS" section, as written there (voice, casing, headlines, ledes ...);  empty
   * when that file isn't in this checkout.
   */
  private contentFundamentals(): string[] {
    const file = join(this.uiFolder, "../..", BRAND_BOOK)
    if (!existsSync(file)) return []
    const text = readFileSync(file, "utf8")
    const match = /^## CONTENT FUNDAMENTALS\s*\n([\s\S]*?)(?=^---\s*$|^## )/m.exec(text)
    if (!match) return []
    return ["## Content fundamentals", "", match[1]!.trim(), ""]
  }

  /** The "Not synced" note:  what the export left out, so a reader knows what's missing. */
  private notSynced(tokens: DesignTokensFile, skipped: DesignSkip[]): string[] {
    const lines = ["---", "", "## Not synced", ""]
    lines.push(
      `- Made by \`yarn design:build\` (packages/ui) from ${tokens.meta.repo}@${this.git.sha}:  the vocabularies ` +
        "(`site/_data/components.json`), the element examples and the `spell-brand` theme's sheets" +
        (this.sources.length
          ? ";  the Brand cards from the brand's (`packages/brand/_data/components.json`, its docs pages' examples)"
          : "") +
        ".  Edits made here are overwritten by the next build."
    )
    lines.push(
      "- Fonts:  none shipped.  The serif is `'Spell Serif'`, the INSTALLED Palatino family only (macOS / iOS " +
        "`Palatino`, Windows `Palatino Linotype` / `Book Antiqua`);  elsewhere a design shows the stack's fallback serif."
    )
    lines.push(
      "- Component tokens (`--ui-<tag>-*`) aren't in `tokens.json`:  each card's README lists its own, with defaults.  " +
        "Only the ones the Spell theme sets (`--ui-button-background` ...) are, as colours."
    )
    lines.push("- Emoji names (`<ui-emoji>`):  their data loads lazily, which a design frame blocks.")
    if (!this.sources.length)
      lines.push("- The brand's own elements (`<ui-brand-*>`):  not in this build (no brand data).")
    if (skipped.length) {
      lines.push(`- Tokens left out (${skipped.length}):`)
      for (const entry of skipped) lines.push(`  - \`${entry.name}\` (${entry.family}):  ${entry.reason}`)
    } else {
      lines.push("- Tokens:  every `:root` colour, length, shadow and plain value of the theme was exported.")
    }
    lines.push("")
    return lines
  }

  ////////////////
  // ## Index, cover, provenance
  ////////////////

  /** `tokens.json`'s `meta`:  where it came from (the format's from-code step 8);  a note, never an input. */
  private meta(): Record<string, unknown> {
    const folders = [...new Set(this.allData.components.map((tag) => tag.folder))].sort()
    return {
      source: "github",
      repo: "spell-app/spell-app",
      ref: `${this.git.branch}@${this.git.sha}`,
      package: "packages/ui",
      paths: {
        tokens: [
          "src/styles/tokens.css",
          "src/styles/sizes.css",
          "src/styles/colors.css",
          "src/styles/themes/classic.css",
          "src/styles/themes/spell-brand.css"
        ],
        docs: [
          "site/_data/components.json",
          "src/components/*/examples/elements/*.html",
          `../../${BRAND_BOOK}`,
          ...(this.sources.length ? ["../brand/_data/components.json", "../../brand/components/*.html"] : [])
        ]
      },
      components: Object.fromEntries(
        folders.map((folder) => {
          const main = this.allData.families[folder]?.mainTag ?? folder
          const path = this.sources.find((source) => folder in source.data.families)?.componentsPath
          return [main, `${path ?? "src/components"}/${folder}/`]
        })
      ),
      synced: this.now.toISOString().slice(0, 10)
    }
  }

  /** `design-system.json`:  the system's index, as the spike's;  publishing (P9) owns what it says on claude.ai. */
  private index() {
    const at = this.now.toISOString()
    return {
      v: 3,
      layout: "files",
      createdOnFiles: { v: 1, at },
      title: SYSTEM_TITLE,
      namespace: NAMESPACE,
      libraries: [],
      sections: {},
      groups: [],
      assetGroups: {},
      blobs: {},
      docs: { sections: [] },
      lastChange: {
        by: this.git.user,
        at,
        via: `GitHub · spell-app/spell-app@${this.git.sha}`,
        note: "Built by `yarn design:build` from Spell UI's vocabularies, examples and the Spell theme"
      }
    }
  }

  /**
   * `components/Cover/preview.html`:  the system's face (the format's `cover.md`):  Spell's violet blocks and pills
   * right, the name in the serif bottom-left;  every fill a `tokens.json` colour, so dark mode follows.
   */
  static cover(): string {
    return `<!-- @dsCard height=288 -->
<!doctype html>
<html>
  <body style="margin: 0">
    <style>
      .cover { position: relative; width: 960px; height: 288px; background: var(--surface); overflow: hidden }
      .ink { fill: var(--text-dark) }
      .brand { fill: var(--violet-500) }
      .deep { fill: var(--violet-700) }
      .tint { fill: var(--violet-150) }
      .name { position: absolute; left: 40px; bottom: 60px; margin: 0; font: 700 112px/0.92 var(--font-serif); color: var(--text-dark) }
      .tag { position: absolute; left: 40px; bottom: 28px; margin: 0; font: 400 14px/1.4 var(--font-sans); color: var(--text-muted) }
    </style>
    <div class="cover">
      <svg width="960" height="288" viewBox="0 0 960 288" aria-hidden="true">
        <!-- blocks:  violet-500 280x288 slab, text-dark 160x192, violet-700 120x96, violet-150 40x96
             arrangement:  one tall slab bleeding off the top and bottom edge, with satellites to its left
             pattern:  pills, because the brand's actions are pills (radius-pill:  rx = half the 48px height)
             steps:  multiples of space-l (24px) and space-m (16px);  radius-pill -->
        <rect class="brand" x="680" y="0" width="280" height="288" />
        <rect class="ink" x="520" y="0" width="160" height="192" />
        <rect class="deep" x="520" y="192" width="120" height="96" />
        <rect class="tint" x="640" y="192" width="40" height="96" />
        <rect class="tint" x="712" y="48" width="208" height="48" rx="24" />
        <rect class="tint" x="712" y="120" width="144" height="48" rx="24" />
        <rect class="ink" x="712" y="192" width="176" height="48" rx="24" />
      </svg>
      <h1 class="name">${SYSTEM_TITLE}</h1>
      <p class="tag">All magic, no fuss.</p>
    </div>
  </body>
</html>
`
  }

  ////////////////
  // ## Helpers
  ////////////////

  /** A family's folder, from its main tag. */
  private folderFor(family: DesignFamily): string {
    return this.allData.components.find((tag) => tag.tag === family.mainTag)?.folder ?? family.mainTag
  }

  /** Branch, short sha and author of the checkout `folder` is in;  `unknown` for any git can't answer. */
  static readGit(folder: string): DesignGit {
    return {
      branch: git("rev-parse", "--abbrev-ref", "HEAD"),
      sha: git("rev-parse", "--short", "HEAD"),
      user: git("config", "user.name")
    }

    /** `git <args>`'s output in `folder`, trimmed;  `unknown` when git can't answer.  NEVER throws. */
    function git(...args: string[]): string {
      try {
        return execFileSync("git", args, { cwd: folder, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim()
      } catch {
        return "unknown"
      }
    }
  }

  /** Empty `project`, keeping the design bundle's files (`components/bundle.js`, `bundle.css`). */
  private static clear(project: string) {
    if (!existsSync(project)) return
    for (const entry of readdirSync(project)) {
      if (entry !== "components") rmSync(join(project, entry), { recursive: true, force: true })
    }
    const components = join(project, "components")
    if (!existsSync(components)) return
    for (const entry of readdirSync(components)) {
      if (!KEPT.includes(entry)) rmSync(join(components, entry), { recursive: true, force: true })
    }
  }
}

/** What `DesignExport` is built from;  every field defaults to this checkout's. */
export type DesignExportOptions = {
  /** `packages/ui`, absolute */
  uiFolder?: string
  /** site data;  default:  `site/_data/components.json` */
  data?: SiteDataFile
  /** commit facts;  default:  asked of git (`readGit()`) */
  git?: DesignGit
  /** default:  now */
  now?: Date
  /** cards from outside Spell UI;  default:  the brand's (`DesignBrand.read()`), when there */
  sources?: DesignSource[]
}

/** The commit an export came from, and who made it. */
export type DesignGit = {
  /** e.g. `main` */
  branch: string
  /** short commit hash */
  sha: string
  /** git's `user.name` */
  user: string
}

/** `packages/ui`, absolute. */
const UI_FOLDER = fileURLToPath(new URL("../", import.meta.url))

/** The brand book (Claude Design's export), repo-relative:  SHARED, the root's `brand/` link (epic `claude-design`, P11). */
const BRAND_BOOK = "brand/spell-design-system/readme.md"

/** The design system's title on claude.ai (Owen, 2026-10-05). */
const SYSTEM_TITLE = "Spell"

/** The global the design bundle assigns (`window.SpellUI`). */
const NAMESPACE = "SpellUI"

/** Files under `components/` an earlier run's clear-out keeps:  the design bundle's (P8). */
const KEPT = ["bundle.js", "bundle.css"]

/** The README's "Consuming" section:  how a design uses the elements (plan Q10, caveats C6, C7). */
const CONSUMING = [
  "## Consuming",
  "",
  "Spell UI is a library of **custom elements**, not React components.  Use them as plain HTML.",
  "",
  "1. **Load ONE classic script, `components/bundle.js`.**  It defines every `<ui-*>` element (the brand's " +
    "`<ui-brand-*>` too) and applies the Spell brand theme (`spell-brand`) to the page:  nothing to import, no other file.  In a Design, load it once, before the markup:  " +
    "`<script src=\"ds/<this system's folder>/components/bundle.js\"></script>`.  This system's own previews already have it.",
  '2. **Write markup:**  `<ui-button primary icon="check">Save</ui-button>`.  Never `x-import`, never ' +
    "`window.SpellUI.Button`, never a React wrapper:  there are none.  (`window.SpellUI` exists for scripting only:  " +
    "`SpellUI.UI` is the runtime.)",
  "3. **Wrap a page or an artboard in `<ui-root>`.**  It waits until every element inside is ready, then shows the " +
    'content.  `theme="dark"` or `theme="light"` forces a colour scheme;  without it, the viewer\'s applies.',
  "4. **Attributes are lowercase HTML attributes**, as each card's README and `components/index.d.ts` list them.  " +
    "A flag is present or absent:  `<ui-button primary basic>`.",
  "   - In a Design's React artboard, BRANCH with `<sc-if>` rather than binding a flag to a hole " +
    '(`primary="{{x}}"` can write a string that still reads as on):  one branch with `<ui-button primary>`, one without.',
  "5. **Rich data is a JS property** (a dropdown's `options`, a form's `rules`):  in markup, write child elements " +
    "instead (`<ui-dropdown>` with `<ui-item>`s).",
  "6. **Restyle with `--ui-*` custom properties** (live, and right in both schemes):  " +
    "`ui-card { --ui-card-radius: 8px }`, `color: var(--ui-primary)`.  `tokens.json` holds the same values without the " +
    "`ui-` prefix (`primary` mirrors `--ui-primary`), for this system's own views;  in page CSS prefer the `--ui-*` names.",
  "7. **Icons:**  any Font Awesome Free name (solid, regular and brands) works, written as on its site or with " +
    'spaces:  `icon="wand-magic-sparkles"` ~== `icon="wand magic sparkles"`;  regular ones end in ` outline`.',
  "8. **Not here:**  emoji names (`<ui-emoji>`), and anything loaded from a file (`source=` on `<ui-include>`, " +
    "`<ui-code>`, `<ui-markdown>`):  write the content inline.",
  "9. **Page typography is opt-in:**  the elements style themselves, but plain headings, paragraphs and lists " +
    'take Spell\'s type only inside `class="ui-typography"` (on `<body>`, or any container).  There is no ' +
    "`bundle.css`:  nothing else to link.",
  "10. **Clicks run in Play:**  on a Design's canvas a click selects;  handlers run once a board is expanded to fill " +
    "the window (its Play control).",
  ""
]

/**
 * The README's visual rules:  the brand book's "VISUAL FOUNDATIONS" (`brand/spell-design-system/readme.md`),
 * restated in `ui` terms (tokens and elements, not its React mock-ups' `sp-*` classes), as the `spell-brand` theme
 * draws them.
 */
const VISUAL_FOUNDATIONS = [
  "## Visual foundations",
  "",
  "- **Colour.**  Spell Purple is the action colour:  `primary` (`violet-600` light, lilac `violet-300` dark).  " +
    "Neutrals, borders and `secondary` are the grey-blue `brand-*` ladder;  the accent is Polished Ivory, the `brown` hue.  " +
    "Use the semantic tokens (`--ui-primary`, `--ui-text-color`, `--ui-surface`, `--ui-border-color`), never a ladder " +
    "step, so both schemes work.",
  "- **Dark is aubergine, never black:**  `violet-950` page, `violet-925` cards, lilac accents with aubergine text on them.",
  "- **Type.**  Headings in the serif (Palatino):  bold `h1` / `h2`, regular `h3`;  `h4` and smaller in the sans at " +
    "semibold.  Every headline gets an italic serif lede (a `<ui-header>` nested in the header);  eyebrows are UPPERCASE mono " +
    "(`<ui-header sub>`).  Body text is the system sans.  Mono is for compiled code only:  a spell is prose, so it's " +
    "always serif, set in typographic quotes.",
  "- **Shape.**  Actions are pills (`<ui-button>`, `<ui-label>`, `<ui-progress>`:  `radius-pill`);  inputs and menus " +
    "12px;  cards, segments, messages and toasts 16px;  modals 22px;  popups 8px.  Checkboxes are round:  the to-do " +
    "circle is a brand motif.",
  "- **Surfaces.**  White cards with a hairline and a soft violet-tinted shadow (`shadow-raised`), lifting to " +
    "`shadow-floating` on hover.  Never a coloured left border.  The page is flat near-white (`background`);  no " +
    "gradients on surfaces, no photography.",
  "- **Density.**  Refined, not airy:  a 4px grid (`space-*`), generous only at hero scale.",
  "- **States.**  Hover deepens `primary` one step (`primary-hover`);  buttons press to 97%;  focus is a 3px violet " +
    "ring 2px off the box;  the selected menu item is a lavender fill with purple text.",
  "- **Motion.**  Gentle and quick:  the brand's ease-out (`ease-out`, `cubic-bezier(0.22, 1, 0.36, 1)`), 100-300ms;  " +
    "no bounces on layout, no parallax.",
  '- **Emoji:**  never.  The four-point sparkle (`icon="wand magic sparkles"`) marks magic happening.',
  ""
]

/** The README's icon rules. */
const ICONS = [
  "## Icons",
  "",
  '- Font Awesome 7 Free, solid and regular:  `<ui-icon name="gear">`, or an element\'s `icon` attribute ' +
    '(`<ui-button icon="check">`).',
  "- Signature glyph:  `wand magic sparkles` for Build and magic happening (primary Build action, progress titles, " +
    "toasts);  don't overuse it elsewhere.",
  "- Unicode only for keyboard hints (⌘↵) and arrows in copy (→).",
  ""
]
