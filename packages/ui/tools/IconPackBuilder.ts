/// <reference types="node" />

import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { pathToFileURL } from "node:url"

import { IconName } from "../src/icons/IconName.ts"
import { ICON_PACK_INDEX, type IconPackEntry, type IconPackIndex } from "../src/icons/icons.types.ts"
import { IconPackError, type IconPackProblem, type IconPackReport, type IconPackUnsafePolicy } from "./tools.types.ts"

/****************
 * ### `IconPackBuilder`
 * Turns a folder of SVGs into an icon pack:  writes its index, `pack.js` (`docs/icons.md`, "Packs").
 * - Does TWO things only, and by default NEVER modifies an SVG (licence comments and attribution stay as shipped):
 *   - index:  one entry per SVG, keyed by its path without `.svg`, sized from its `viewBox`
 *   - verify:  refuses the whole pack, listing file + reason, if any SVG could run script or load another resource
 * - `sanitize` (opt-in):  first strips the unsafe ATTRIBUTES (`on*`, external `href`, `style=""` loading a resource)
 *   and rewrites those files;  nothing else in them changes.  Unsafe ELEMENTS (`<script>` ...) stay:  removing one
 *   could change what the icon draws.
 * - What's still wrong after that (`unsafe`):  `"refuse"` the pack (default), `"skip"` those files (and broken ones),
 *   or `"allow"` unsafe files into the index anyway.  A BROKEN file (no `<svg>` root / `viewBox`) can't be sized, so
 *   `"allow"` still refuses it.
 * - Re-running on a folder whose `pack.js` has the same `id` keeps the hand edits:  entries are matched by key, keep
 *   their order, `alias` and any other field;  only their size is refreshed.
 * - Called by `tools/cli.ts icons:pack` and `scripts/gen-icons.ts`;  a class, so a future CLI can drive it too.
 * - Node only;  reads the pack format from `src/icons/` (`icons.types.ts`, `IconName`:  plain data and logic).
 ****************/
export class IconPackBuilder {
  /** what to build */
  private readonly options: IconPackBuilderProps

  constructor(options: IconPackBuilderProps) {
    this.options = options
  }

  /**
   * Verify every SVG (sanitizing first, if asked), then write `pack.js`.
   * - Throws `IconPackError` (and writes nothing, not even a sanitized SVG) when a file fails verification and
   *   `unsafe` doesn't skip or allow it, or the old index has another id.
   * - Skipped files are left out of the index (and not rewritten);  allowed ones are indexed as they are.
   */
  async build(): Promise<IconPackReport> {
    const { folder, id } = this.options
    const indexFile = path.join(folder, ICON_PACK_INDEX)
    const previous = await this.previous(indexFile)
    const keys = this.options.keys ?? this.scan()

    const policy = this.options.unsafe ?? "refuse"
    const problems: IconPackProblem[] = []
    const skipped: IconPackProblem[] = []
    const allowed: IconPackProblem[] = []
    const sanitized: IconPackProblem[] = []
    const rewrites = new Map<string, string>()
    const sizes = new Map<string, [width: number, height: number]>()
    for (const key of keys) {
      const file = `${key}.svg`
      let text = readFileSync(path.resolve(folder, file), "utf8")
      const removed: IconPackProblem[] = []
      if (this.options.sanitize) {
        const clean = IconPackBuilder.sanitize(text)
        text = clean.text
        removed.push(...clean.removed.map((reason) => ({ file, reason })))
      }
      const { size, unsafe, broken } = IconPackBuilder.check(text)
      const found = [...broken, ...unsafe].map((reason) => ({ file, reason }))
      if (found.length && policy === "skip") {
        skipped.push(...found)
        continue
      }
      if (broken.length || (unsafe.length && policy === "refuse")) {
        problems.push(...found)
        continue
      }
      allowed.push(...found)
      sizes.set(key, size!)
      if (removed.length) {
        rewrites.set(file, text)
        sanitized.push(...removed)
      }
    }
    if (problems.length) {
      const list = problems.map((problem) => `  ${problem.file}:  ${problem.reason}`).join("\n")
      throw new IconPackError(
        `IconPackBuilder.build():  pack "${id}" has ${problems.length} problem(s) in ${folder};  fix the SVGs, or ` +
          `sanitize, skip or allow them (\`--sanitize\`, \`--skip-unsafe\`, \`--allow-unsafe\`)\n${list}`,
        { cause: { problems } }
      )
    }
    for (const [file, text] of rewrites) writeFileSync(path.resolve(folder, file), text)
    const indexed = keys.filter((key) => sizes.has(key))

    const icons = this.entries(indexed, sizes, previous)
    const defaults = IconPackBuilder.defaults(icons)
    const index: IconPackIndex = {
      id,
      ...(this.options.label && { label: this.options.label }),
      ...(this.options.license && { license: this.options.license }),
      defaults,
      icons: IconPackBuilder.trim(icons, defaults)
    }
    writeFileSync(indexFile, IconPackBuilder.serialize(index))

    const claimed = new Set(IconName.claim(Object.entries(icons).map(([key, entry]) => [key, entry.alias])).values())
    const before = new Set(Object.keys(previous?.icons ?? {}))
    return {
      index: indexFile,
      count: indexed.length,
      added: indexed.filter((key) => !before.has(key)),
      dropped: [...before].filter((key) => !sizes.has(key)),
      unreachable: indexed.filter((key) => !claimed.has(key)),
      sanitized,
      skipped,
      allowed
    }
  }

  ////////////////
  // ## Verify
  ////////////////

  /**
   * One SVG's size, and what's wrong with it:  `unsafe` (could run script or load a resource) and `broken` (can't
   * be an icon).  Fit for a pack ~== both empty.
   * - A scan of the markup, not a parser:  enough to find elements and attributes, since comments, CDATA,
   *   processing instructions and the doctype are stripped first, and quoted values may hold `>`.
   * - Unsafe:
   *   - `FORBIDDEN_ELEMENTS`, and an `<!ENTITY>` in the doctype
   *   - an unsafe attribute (`unsafeAttribute()`)
   *   - a `<style>` with `@import` or a non-fragment `url()`
   * - Broken:  no `<svg>` root, or no usable `viewBox` (so `size` is `undefined`)
   */
  static check(text: string): IconPackCheck {
    const problems: string[] = []
    const broken: string[] = []
    if (ENTITY.test(text)) problems.push("<!ENTITY> declaration")
    const cdata = [...text.matchAll(CDATA)].map((match) => match[1])
    const markup = text.replace(COMMENT, "").replace(CDATA, "").replace(PROLOG, "")

    let size: [number, number] | undefined
    let first = true
    for (const [, tag, attributes] of markup.matchAll(TAG)) {
      const element = IconPackBuilder.localName(tag)
      if (first) {
        first = false
        if (element !== "svg") broken.push(`root is <${tag}>, not <svg>`)
      }
      if (FORBIDDEN_ELEMENTS.includes(element)) problems.push(`<${tag}> element`)
      for (const [, , rawName, value = ""] of attributes.matchAll(ATTRIBUTE)) {
        const unquoted = value.replace(QUOTES, "")
        const unsafe = IconPackBuilder.unsafeAttribute(tag, rawName, unquoted)
        if (unsafe) problems.push(unsafe)
        else if (element === "svg" && rawName.toLowerCase() === "viewbox" && !size) {
          size = IconPackBuilder.viewBox(unquoted)
        }
      }
    }
    if (first) broken.push("no <svg> element")
    else if (!size) broken.push("no usable viewBox on <svg>")
    const styles = [...markup.matchAll(STYLE)].map((match) => match[1]).concat(cdata)
    if (styles.some((css) => IconPackBuilder.externalCSS(css))) problems.push("external resource in <style>")
    return { size, unsafe: problems, broken }
  }

  /**
   * Why attribute `name="value"` on `<tag>` is unsafe, or `undefined`.
   * - `on*` event handlers
   * - an `href` / `xlink:href` that isn't a same-file `#fragment`
   * - `style=""` with `@import` or a non-fragment `url()`
   */
  private static unsafeAttribute(tag: string, name: string, value: string): string | undefined {
    const lower = name.toLowerCase()
    if (lower.startsWith("on")) return `${name} attribute on <${tag}>`
    if (IconPackBuilder.localName(lower) === "href" && !value.trim().startsWith("#")) {
      return `external ${name} "${value}" on <${tag}>`
    }
    if (lower === "style" && IconPackBuilder.externalCSS(value)) return `external resource in style="" on <${tag}>`
    return undefined
  }

  /**
   * `text` without its unsafe attributes (`unsafeAttribute()`), and what was removed;  everything else byte for
   * byte, comments included.
   * - Tags inside comments and CDATA are left alone:  they aren't markup.
   * - Unsafe ELEMENTS stay:  `check()` still refuses them.
   */
  static sanitize(text: string): { text: string; removed: string[] } {
    const removed: string[] = []
    const skipped = [...text.matchAll(COMMENT), ...text.matchAll(CDATA)].map(
      (match) => [match.index, match.index + match[0].length] as const
    )
    const clean = text.replace(TAG, (whole, tag: string, attributes: string, offset: number) => {
      if (skipped.some(([start, end]) => offset >= start && offset < end)) return whole
      const kept = attributes.replace(ATTRIBUTE, (attribute, _space, name: string, value = "") => {
        const unsafe = IconPackBuilder.unsafeAttribute(tag, name, value.replace(QUOTES, ""))
        if (!unsafe) return attribute
        removed.push(`removed ${unsafe}`)
        return ""
      })
      return kept === attributes ? whole : `<${tag}${kept}>`
    })
    return { text: clean, removed }
  }

  /** `[width, height]` of a `viewBox` value, or `undefined` if it isn't four numbers with a positive size. */
  private static viewBox(value: string): [number, number] | undefined {
    const numbers = value.trim().split(VIEWBOX_SEPARATOR).map(Number)
    if (numbers.length !== 4 || numbers.some((value) => !Number.isFinite(value))) return undefined
    const [, , width, height] = numbers
    return width > 0 && height > 0 ? [width, height] : undefined
  }

  /** CSS that would load something:  `@import`, or a `url()` that isn't `url(#…)`. */
  private static externalCSS(css: string): boolean {
    return css.includes("@import") || [...css.matchAll(CSS_URL)].some((match) => !match[1].startsWith("#"))
  }

  /** `xlink:href` -> `href`, `svg:svg` -> `svg`, lowercased. */
  private static localName(name: string): string {
    return name.slice(name.indexOf(":") + 1).toLowerCase()
  }

  ////////////////
  // ## Index
  ////////////////

  /**
   * Every SVG under the folder, as keys:  files directly in it first, then each sub-folder in `folders` order
   * (the rest alphabetically), files alphabetically.
   * - Order decides who keeps a shared name (`IconName.claim()`), so `solid` before `regular` gives
   *   `address book` to the solid icon.
   */
  private scan(): string[] {
    const { folder, folders = [] } = this.options
    const files = readdirSync(folder, { recursive: true, encoding: "utf8" })
      .filter((file) => file.endsWith(SVG))
      .map((file) => file.split(path.sep).join("/").slice(0, -SVG.length))
    return files.sort(
      (a, b) => IconPackBuilder.rank(a, folders) - IconPackBuilder.rank(b, folders) || a.localeCompare(b)
    )
  }

  /** Sort rank of `key` by its top folder:  none first, then `folders` order, then the rest. */
  private static rank(key: string, folders: string[]): number {
    const slash = key.indexOf("/")
    if (slash < 0) return -1
    const at = folders.indexOf(key.slice(0, slash))
    return at < 0 ? folders.length : at
  }

  /**
   * The new entries, keyed in index order:  the previous index's surviving keys first, in THEIR order, then new
   * keys in scan order.
   * - A kept entry keeps every field;  its size is refreshed.  A new entry gets `options.aliases[key]`.
   */
  private entries(
    keys: string[],
    sizes: Map<string, [number, number]>,
    previous: IconPackIndex | undefined
  ): Record<string, IconPackEntry> {
    const entries: Record<string, IconPackEntry> = {}
    const oldDefaults = previous?.defaults ?? {}
    for (const [key, old] of Object.entries(previous?.icons ?? {})) {
      const size = sizes.get(key)
      if (!size) continue
      entries[key] = { ...oldDefaults, ...old, width: size[0], height: size[1] }
    }
    for (const key of keys) {
      if (entries[key]) continue
      const [width, height] = sizes.get(key)!
      const alias = this.options.aliases?.[key]
      entries[key] = alias === undefined ? { width, height } : { width, height, alias }
    }
    return entries
  }

  /** The most common width and height, as the pack's `defaults`. */
  private static defaults(icons: Record<string, IconPackEntry>): { width: number; height: number } {
    return {
      width: IconPackBuilder.mode(Object.values(icons).map((entry) => entry.width!)),
      height: IconPackBuilder.mode(Object.values(icons).map((entry) => entry.height!))
    }
  }

  /** `icons` without the width / height that equal `defaults`. */
  private static trim(
    icons: Record<string, IconPackEntry>,
    defaults: { width: number; height: number }
  ): Record<string, IconPackEntry> {
    const trimmed: Record<string, IconPackEntry> = {}
    for (const [key, { width, height, ...rest }] of Object.entries(icons)) {
      trimmed[key] = {
        ...(width !== defaults.width && { width }),
        ...(height !== defaults.height && { height }),
        ...rest
      }
    }
    return trimmed
  }

  /** Most frequent value (the first one seen on a tie);  `0` for none. */
  private static mode(values: number[]): number {
    const counts = new Map<number, number>()
    for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1)
    let best = 0
    let bestCount = 0
    for (const [value, count] of counts) {
      if (count > bestCount) [best, bestCount] = [value, count]
    }
    return best
  }

  /**
   * `pack.js` text:  a header, then JSON (valid JS) with ONE icon per line, so a hand-edit is a one-line diff.
   */
  private static serialize(index: IconPackIndex): string {
    const { icons, ...head } = index
    const lines = Object.entries(icons).map(([key, entry]) => `    ${JSON.stringify(key)}: ${JSON.stringify(entry)}`)
    const top = Object.entries(head).map(([key, value]) => `  ${JSON.stringify(key)}: ${JSON.stringify(value)},`)
    return `${HEADER}export default {\n${top.join("\n")}\n  "icons": {\n${lines.join(",\n")}\n  }\n}\n`
  }

  /**
   * The index already in the folder, if any.
   * - Imported (not JSON-parsed), so a hand-edited `pack.js` that is JS rather than JSON still reads.
   * - Throws `IconPackError` when its `id` differs, unless `force`.
   */
  private async previous(indexFile: string): Promise<IconPackIndex | undefined> {
    if (!existsSync(indexFile)) return undefined
    const module = (await import(`${pathToFileURL(indexFile).href}?t=${Date.now()}`)) as { default: IconPackIndex }
    const previous = module.default
    if (previous.id === this.options.id) return previous
    if (this.options.force) return undefined
    throw new IconPackError(
      `IconPackBuilder.build():  ${indexFile} is pack "${previous.id}", not "${this.options.id}";  ` +
        "pass `force` (`--force`) to replace it",
      { cause: { problems: [] } }
    )
  }
}

/** Constructor props of `IconPackBuilder`. */
export type IconPackBuilderProps = {
  /** pack folder, absolute;  `pack.js` is written here */
  folder: string
  /** pack id */
  id: string
  /** human name */
  label?: string
  /** licence / attribution line */
  license?: string
  /** sub-folders in the order they claim names;  the rest follow alphabetically */
  folders?: string[]
  /**
   * The entries, as keys relative to `folder` (may start with `../`), instead of scanning it.
   * - How the Fomantic pack points at the Font Awesome folders beside it.
   */
  keys?: string[]
  /** strip unsafe attributes from the SVGs (rewriting those files) before verifying */
  sanitize?: boolean
  /** What to do with a file that still fails verification (`IconPackUnsafePolicies`);  default `refuse`. */
  unsafe?: IconPackUnsafePolicy
  /** `alias` for NEW entries, by key;  kept entries keep their own */
  aliases?: Record<string, string | string[]>
  /** replace a `pack.js` that has another `id` */
  force?: boolean
}

/** What `IconPackBuilder.check()` found in one SVG. */
export type IconPackCheck = {
  /** viewBox width / height;  `undefined` if broken */
  size?: [width: number, height: number]
  /** why it could run script or load a resource */
  unsafe: string[]
  /** why it can't be an icon at all */
  broken: string[]
}

////////////////
// ## Constants
////////////////

/** Elements that could run script or embed another document:  any one refuses the pack. */
const FORBIDDEN_ELEMENTS = ["script", "foreignobject", "iframe", "embed", "object"]

/** First lines of every generated `pack.js`. */
const HEADER =
  "// Icon pack index, generated by `IconPackBuilder` (`docs/icons.md`).\n" +
  "// Safe to hand-edit:  re-running the builder keeps each entry's `alias` and other fields, refreshing only sizes.\n"

/** SVG file extension. */
const SVG = ".svg"

/** `<!-- … -->`. */
const COMMENT = /<!--[\s\S]*?-->/g

/** `<![CDATA[ … ]]>`, content captured. */
const CDATA = /<!\[CDATA\[([\s\S]*?)\]\]>/g

/** `<?xml …?>` and `<!DOCTYPE …>` (with an internal subset). */
const PROLOG = /<\?[\s\S]*?\?>|<!DOCTYPE(?:[^>[]|\[[\s\S]*?\])*>/gi

/** An entity declaration, anywhere. */
const ENTITY = /<!ENTITY/i

/** An opening or self-closing tag:  name, then its attribute text (quoted values may hold `>`). */
const TAG = /<([A-Za-z][\w:.-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g

/** One attribute:  the whitespace before it, its name, then its (quoted or bare) value if any. */
const ATTRIBUTE = /(\s*)([^\s=/"'>]+)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s>]+))?/g

/** Surrounding quotes of an attribute value. */
const QUOTES = /^["']|["']$/g

/** `<style>` element text. */
const STYLE = /<style\b[^>]*>([\s\S]*?)<\/style\s*>/gi

/** `url(…)` in CSS, target captured without quotes. */
const CSS_URL = /url\(\s*["']?([^"')]*)/gi

/** Between `viewBox` numbers. */
const VIEWBOX_SEPARATOR = /[\s,]+/
