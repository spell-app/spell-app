import { existsSync, readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"

import type { SiteFamily, SiteTag, SiteTheme, SiteThemeSeed } from "../src/docs-components/docs-components.types.ts"

/**
 * Which families each theme sheet (`src/styles/themes/*.css`) touches, read from its CSS at BUILD time, for the site's
 * data (`SiteDataFile.themes`):  `<ui-docs-themes for="ui-button">` lists only the themes touching a family, as
 * Fomantic's per-page "N Themes" dropdown does.
 * - Why at build time:  reading every sheet in the browser would load every theme chunk to fill one menu.
 * - A sheet touches a family when it has:
 *   - a class-grammar compound (`.ui.labeled.icon.button`, `.ui:is(.primary, .red).button`) naming a tag's noun.
 *     Several nouns in one compound:  a noun that is an attribute or value of ANOTHER one's tag is a modifier
 *     (`icon` of `button`, `text` of `menu`) and drops out;  of the rest, the first wins (`.ui.flag.ad`:  Andorra's
 *     flag, not an ad).  A noun several tags share goes to the tag named `ui-<noun>`
 *   - a tag selector (`:where(ui-table) > table`), but not inside `::slotted(...)`
 *   - a declared public token of the family (`--ui-button-radius: ...`):  from the family's token table, else by
 *     name (`--ui-card-` => `ui-card`, longest tag first) unless it's a foundation token (`--ui-text-color`)
 * - `global`:  it also declares a token no family owns in a `:root` / `:host` block (the foundation:
 *   `--ui-font-family`, palette ...), or styles PAGE markup (a selector with no class, `:host`, `::slotted` or
 *   `ui-*` tag:  `b, strong`, `:root body`).  A remap declared on a component box (`.ui.button { --ui-color: ... }`)
 *   is not global.
 * - A small rule walker, not a CSS parser:  comments and `@keyframes` blocks are dropped, `{` / `}` / `;` split
 *   preludes from declarations.  Good enough for our own sheets;  `SiteDataBuilder.test.ts` pins known answers.
 * - Titles:  `pages.json` `themes` (hand-kept), seeded once per new sheet from its header (`GitHub theme:`).
 */
export class ThemeFamilies {
  /** `src/styles/themes/`. */
  readonly folder: string

  /** noun => tag (`button` => `ui-button`). */
  private readonly nouns = new Map<string, string>()

  /** tag => folder (`ui-or` => `ui-button`). */
  private readonly folders = new Map<string, string>()

  /** tag => its attribute names and values:  the words that MODIFY that tag's noun. */
  private readonly modifiers = new Map<string, Set<string>>()

  /** public token => folder (`--ui-button-radius` => `ui-button`). */
  private readonly tokens = new Map<string, string>()

  /** every tag, longest first:  for tokens by name. */
  private readonly tagsByLength: string[]

  /** foundation token names:  never a family's, whatever their name says. */
  private readonly foundation: ReadonlySet<string>

  constructor(
    folder: string,
    tags: readonly Pick<SiteTag, "tag" | "noun" | "folder" | "attributes">[],
    families: Readonly<Record<string, SiteFamily>>,
    foundation: Iterable<string> = []
  ) {
    this.folder = folder
    this.foundation = new Set(foundation)
    for (const entry of tags) {
      this.folders.set(entry.tag, entry.folder)
      // a shared noun (`header`:  `ui-header`, `ui-placeholder-header`) goes to the tag named after it
      if (!this.nouns.has(entry.noun) || entry.tag === `ui-${entry.noun}`) this.nouns.set(entry.noun, entry.tag)
      const words = new Set<string>()
      for (const attribute of entry.attributes) {
        words.add(attribute.name)
        for (const value of attribute.values ?? []) words.add(String(value))
      }
      this.modifiers.set(entry.tag, words)
    }
    for (const family of Object.values(families)) {
      for (const token of family.tokens) this.tokens.set(token.name, family.folder)
    }
    this.tagsByLength = [...this.folders.keys()].sort((a, b) => b.length - a.length)
  }

  /** Every sheet name in the folder, A-Z. */
  names(): string[] {
    if (!existsSync(this.folder)) return []
    return readdirSync(this.folder)
      .filter((file) => file.endsWith(".css"))
      .map((file) => file.slice(0, -".css".length))
      .sort()
  }

  /** Every sheet as a `SiteTheme`, titled from `seeds` (or its header, for a sheet `seeds` lacks). */
  read(seeds: Readonly<Record<string, SiteThemeSeed>> = {}): SiteTheme[] {
    return this.names().map((name) => {
      const css = this.css(name)
      const { families, global } = this.touched(css)
      return { name, title: seeds[name]?.title ?? ThemeFamilies.titleOf(css, name), families, global }
    })
  }

  /** `seeds`, plus a seed for every sheet it lacks;  sorted, unknown ones kept. */
  seed(seeds: Readonly<Record<string, SiteThemeSeed>> = {}): Record<string, SiteThemeSeed> {
    const all: Record<string, SiteThemeSeed> = { ...seeds }
    for (const name of this.names()) all[name] ??= { title: ThemeFamilies.titleOf(this.css(name), name) }
    return Object.fromEntries(Object.entries(all).sort(([a], [b]) => a.localeCompare(b)))
  }

  /** The families sheet text `css` touches, A-Z, and whether it is site-wide too (see the class). */
  touched(css: string): { families: string[]; global: boolean } {
    const text = ThemeFamilies.withoutKeyframes(css.replace(/\/\*[\s\S]*?\*\//g, ""))
    const families = new Set<string>()
    let global = false
    /** open preludes, outermost first */
    const stack: string[] = []
    let buffer = ""
    for (const char of text) {
      if (char === "{") {
        const prelude = buffer.trim()
        stack.push(prelude)
        if (prelude && !prelude.startsWith("@")) rule(this, prelude)
        buffer = ""
      } else if (char === "}" || char === ";") {
        declaration(this, buffer.trim())
        if (char === "}") stack.pop()
        buffer = ""
      } else buffer += char
    }
    return { families: [...families].sort(), global }

    /** A rule's selectors:  the families they name, or page markup. */
    function rule(self: ThemeFamilies, prelude: string) {
      for (const selector of ThemeFamilies.splitTop(prelude)) {
        const found = self.selectorFamilies(selector)
        for (const folder of found) families.add(folder)
        if (!found.length && ThemeFamilies.isPage(selector)) global = true
      }
    }

    /** One declaration:  a public token's family, or a foundation token re-declared on `:root` / `:host`. */
    function declaration(self: ThemeFamilies, text: string) {
      const name = /^(--ui-[\w-]+)\s*:/.exec(text)?.[1]
      if (!name) return
      const folder = self.tokenFamily(name)
      if (folder) families.add(folder)
      else if (TOKEN_BLOCK.test(stack.findLast((prelude) => !prelude.startsWith("@")) ?? ":root")) global = true
    }
  }

  /**
   * Title from a sheet's header comment, `GitHub theme:  ...` => `GitHub`, first letter upper-cased;  else `name`
   * in words (`fixed-width` => `Fixed width`).
   */
  static titleOf(css: string, name: string): string {
    const title = /^\s*\/\*\s*\n?\s*\*?\s*([^:\n]+?) theme:/i.exec(css)?.[1] ?? name.replace(/-/g, " ")
    return title.charAt(0).toUpperCase() + title.slice(1)
  }

  ////////////////
  // ## Internals
  ////////////////

  /** Sheet `name`'s text. */
  private css(name: string): string {
    return readFileSync(join(this.folder, `${name}.css`), "utf8")
  }

  /** Folders one selector names:  by class-grammar compounds and by tag. */
  private selectorFamilies(selector: string): string[] {
    const found: string[] = []
    for (const compound of ThemeFamilies.compounds(selector)) {
      const tag = this.nounTag(compound)
      if (tag) found.push(this.folders.get(tag)!)
    }
    // `::slotted(ui-icon)` styles the OWNER's content (a feed's badge), not the slotted family
    for (const match of selector.replace(/::slotted\([^)]*\)/g, "").matchAll(TAG_NAME)) {
      const folder = this.folders.get(match[1]!)
      if (folder) found.push(folder)
    }
    return found
  }

  /** The tag a `.ui` compound's class words name (see the class), or `undefined`. */
  private nounTag(words: readonly string[]): string | undefined {
    const tags = words.map((word) => this.nouns.get(word)).filter((tag): tag is string => !!tag)
    const heads = tags.filter(
      (tag) => !tags.some((other) => other !== tag && this.modifiers.get(other)!.has(this.nounOf(tag)))
    )
    return heads[0] ?? tags.at(-1)
  }

  /** `tag`'s noun (the key it's filed under in `nouns`). */
  private nounOf(tag: string): string {
    for (const [noun, owner] of this.nouns) if (owner === tag) return noun
    return tag
  }

  /** Family of a declared public token, or `undefined` (a foundation token, or none we know). */
  private tokenFamily(name: string): string | undefined {
    const listed = this.tokens.get(name)
    if (listed || this.foundation.has(name)) return listed
    const tag = this.tagsByLength.find((candidate) => name.startsWith(`--${candidate}-`))
    return tag && this.folders.get(tag)
  }

  /** Class words of each `.ui` compound in `selector`, e.g. `.ui:is(.red, .blue).button` => `[red, blue, button]`. */
  private static compounds(selector: string): string[][] {
    const out: string[][] = []
    for (const match of selector.matchAll(/\.ui(?![\w-])/g)) {
      let depth = 0
      let end = match.index + match[0].length
      for (; end < selector.length; end++) {
        const char = selector[end]!
        if (char === "(") depth++
        else if (char === ")") depth--
        else if (!depth && /[\s>+~,]/.test(char)) break
        if (depth < 0) break
      }
      const compound = selector.slice(match.index + match[0].length, end)
      out.push([...compound.matchAll(/\.([a-zA-Z][\w-]*)/g)].map((word) => word[1]!))
    }
    return out
  }

  /** `prelude` split at its TOP-LEVEL commas (not those inside `:is(...)`). */
  private static splitTop(prelude: string): string[] {
    const parts: string[] = []
    let depth = 0
    let start = 0
    for (let at = 0; at < prelude.length; at++) {
      const char = prelude[at]
      if (char === "(") depth++
      else if (char === ")") depth--
      else if (char === "," && !depth) {
        parts.push(prelude.slice(start, at).trim())
        start = at + 1
      }
    }
    parts.push(prelude.slice(start).trim())
    return parts.filter(Boolean)
  }

  /** Does `selector` style page markup:  no class, `:host`, `::slotted`, `ui-*` tag or nesting `&`? */
  private static isPage(selector: string): boolean {
    return !/[.&]|:host|::slotted|(?<![\w-])ui-[a-z]/.test(selector) && !TOKEN_BLOCK.test(selector)
  }

  /** `css` without its `@keyframes` blocks (their `from` / `50%` preludes aren't selectors). */
  private static withoutKeyframes(css: string): string {
    let out = ""
    let index = 0
    for (const match of css.matchAll(/@keyframes[^{]*\{/g)) {
      if (match.index < index) continue
      out += css.slice(index, match.index)
      let depth = 1
      let at = match.index + match[0].length
      while (at < css.length && depth) {
        if (css[at] === "{") depth++
        else if (css[at] === "}") depth--
        at++
      }
      index = at
    }
    return out + css.slice(index)
  }
}

/** A `ui-*` TAG in a selector (not a `.ui-dark` class, not a `--ui-` token);  group 1 is the tag. */
const TAG_NAME = /(?<![\w.-])(ui-[a-z]+(?:-[a-z]+)*)\b/g

/** A token block's selector:  `:root`, `:host`, or both. */
const TOKEN_BLOCK = /^(?::root|:host)(?:\s*,\s*(?::root|:host))*$/
