import { readFileSync } from "node:fs"
import { join } from "node:path"

import { DesignColor, type Oklch } from "./DesignColor.ts"
import type { SiteFoundationGroup } from "../src/docs-components/docs-components.types.ts"
import type { DesignSkip, DesignTokenRow, DesignTokensFile, DesignTypeStyle, ThemedValue } from "./tools.types.ts"

/**
 * The design system's `tokens.json` (claude.ai's Design System format, LIST shape), from the `spell-brand` theme as
 * it ships:  every `:root` custom property of the foundation sheets, then `themes/classic.css`, then
 * `themes/spell-brand.css` (the order `UI.themes.apply("spell-brand")` stacks them), each resolved for a light and a
 * dark theme.
 * - Why `spell-brand`, not `spell`:  it's the brand (epic `claude-design`, P11):  the docs wear it, the design bundle
 *   applies it, and the `<ui-brand-*>` cards read its brand roles (`--spell-surface-warm` ...).
 * - Colours:  `light-dark()` picks the theme;  a value that's just `var(--x)` of another exported colour becomes the
 *   alias `{x}`;  hex / `rgb()` / `oklch()` of numbers stay as written;  anything computed (relative `oklch(from ...)`,
 *   `color-mix()`) is worked out (`DesignColor`) and written as hex
 * - Names:  the property without `--ui-` / `--spell-` (`--ui-primary` => `primary`, `--spell-violet-500` =>
 *   `violet-500`);  a brand role named like a `--ui-*` token (`--spell-accent` beside `--ui-accent`) gets `brand-`
 *   (`brand-accent`), so names stay unique.  Why no prefix:  the system compiles `tokens.css` as UNLAYERED `:root` rules, which would beat our
 *   `@layer`ed tokens of the same name and freeze them at one theme's value (`light-dark()` gone);  different names
 *   leave the live elements alone.  Each row's `usage` names the property it mirrors.
 * - What can't be resolved (`currentColor`, an unknown function) is left out and listed in `skipped`, for the
 *   README's "Not synced" note.
 */
export class DesignTokens {
  /** `src/styles/`, absolute. */
  readonly stylesFolder: string
  /** foundation groups from the site data:  descriptions for `usage`, and the order rows appear in */
  readonly foundation: readonly SiteFoundationGroup[]
  /** every `:root` custom property, last declaration wins, by name (`--ui-red`) */
  readonly values = new Map<string, string>()
  /** what couldn't be exported, and why */
  readonly skipped: DesignSkip[] = []
  /** export names that aren't `exportName()`'s:  a `--spell-*` brand role whose plain name a `--ui-*` token has */
  private readonly renamed = new Map<string, string>()

  constructor(stylesFolder: string, foundation: readonly SiteFoundationGroup[]) {
    this.stylesFolder = stylesFolder
    this.foundation = foundation
    for (const sheet of SHEETS) {
      for (const { name, value } of DesignTokens.rootDeclarations(readFileSync(join(stylesFolder, sheet), "utf8")))
        this.values.set(name, value.replace(/\s+/g, " ").trim())
    }
    for (const name of this.values.keys()) {
      const plain = DesignTokens.exportName(name)
      if (name.startsWith("--spell-") && this.values.has(`--ui-${plain}`)) this.renamed.set(name, `brand-${plain}`)
    }
  }

  /** The whole `tokens.json`;  `meta` is the provenance note (from-code step 8). */
  build(meta: Record<string, unknown>): DesignTokensFile {
    const color = this.colors()
    return {
      name: "Spell UI",
      version: 1,
      meta,
      color: { themes: THEMES.map((id) => ({ id, name: id === "light" ? "Light" : "Dark" })), tokens: color },
      type: this.type(),
      spacing: this.lengths("Spacing:  `--ui-space-*`, em of the 16px base, shown in px.", /^--ui-space-/),
      radius: this.lengths(
        "Corners:  `--ui-radius-*`;  the Spell theme's pills, 12px inputs, 16px cards.",
        /^--ui-radius/
      ),
      shadow: this.shadows(),
      size: this.plain('Size ratios (`size="small"` ...):  multiples of the base font size.', /^--ui-size-/),
      motion: this.plain("Durations and easings (`--ui-duration-*`, `--ui-ease*`).", /^--ui-(duration|ease)/),
      zIndex: this.plain("Stacking order of overlays (`--ui-z-*`).", /^--ui-z-/),
      breakpoint: this.plain("Widths where stackable layouts switch (`--ui-breakpoint-*`).", /^--ui-breakpoint-/)
    }
  }

  ////////////////
  // ## Colours
  ////////////////

  /**
   * Every colour token:  the Spell palette's primitives (`--spell-*`), then the foundation's colours in their group
   * order, then the theme's own colour properties (component overrides such as `--ui-button-background`).
   * - A property counts as a colour when it resolves to one in BOTH themes.
   */
  colors(): DesignTokenRow[] {
    const names = this.colorNames()
    const exported = new Set(names)
    const rows: DesignTokenRow[] = []
    for (const name of names) {
      const values = THEMES.map((theme) => this.colorValue(name, theme, exported))
      if (values.some((value) => value === undefined)) {
        this.skip(name, "color", this.reason(name))
        continue
      }
      rows.push({
        name: this.exported(name),
        value: DesignTokens.themed(values as string[]),
        usage: this.usage(name)
      })
    }
    return rows
  }

  /** Names of the custom properties exported as colours, in row order. */
  private colorNames(): string[] {
    const ordered: string[] = []
    const add = (name: string) => {
      if (!ordered.includes(name) && this.isColor(name)) ordered.push(name)
    }
    for (const name of this.values.keys()) if (name.startsWith("--spell-")) add(name)
    for (const group of this.foundation) for (const token of group.tokens) if (token.type === "color") add(token.name)
    for (const name of this.values.keys()) if (name.startsWith("--ui-") && !/^--ui-shadow-(?!ink)/.test(name)) add(name)
    // A foundation colour that never resolves is still worth a "Not synced" line
    for (const group of this.foundation)
      for (const token of group.tokens)
        if (token.type === "color" && !ordered.includes(token.name) && !/^--ui-shadow-(?!ink)/.test(token.name))
          this.skip(token.name, "color", this.reason(token.name))
    return ordered
  }

  /** Whether custom property `name` resolves to a colour in both themes. */
  private isColor(name: string): boolean {
    return THEMES.every((theme) => this.resolve(`var(${name})`, theme) !== undefined)
  }

  /**
   * Custom property `name`'s exported value in `theme`:  an alias `{x}` when its value there is just another exported
   * colour, the value as written when it's a plain colour, else the worked-out colour as hex.
   */
  private colorValue(name: string, theme: Theme, exported: Set<string>): string | undefined {
    const raw = this.values.get(name)
    if (raw === undefined) return undefined
    const picked = DesignTokens.pickTheme(raw, theme)
    const alias = /^var\(\s*(--[\w-]+)\s*\)$/.exec(picked)?.[1]
    if (alias && exported.has(alias) && alias !== name) return `{${this.exported(alias)}}`
    if (DesignColor.isPlain(picked)) return picked.startsWith("#") ? picked.toLowerCase() : picked
    const color = this.resolve(picked, theme)
    return color && DesignColor.toHex(color)
  }

  /**
   * CSS colour `text` in `theme`, or `undefined`:  `var()` (with fallback), `light-dark()`, then what `DesignColor`
   * parses, with this method resolving each nested argument.
   * - `seen`:  the custom properties being resolved, so a cycle ends as `undefined`
   */
  resolve(text: string, theme: Theme, seen: ReadonlySet<string> = new Set()): Oklch | undefined {
    const value = text.trim()
    const variable = /^var\(\s*(--[\w-]+)\s*(?:,([\s\S]*))?\)$/.exec(value)
    if (variable) {
      const [, name, fallback] = variable as unknown as [string, string, string | undefined]
      const own = this.values.get(name)
      if (own !== undefined && !seen.has(name)) return this.resolve(own, theme, new Set([...seen, name]))
      return fallback === undefined ? undefined : this.resolve(fallback, theme, seen)
    }
    const lightDark = /^light-dark\(([\s\S]*)\)$/i.exec(value)
    if (lightDark) {
      const [light, dark] = DesignColor.splitTop(lightDark[1]!, ",")
      return this.resolve((theme === "light" ? light : dark) ?? "", theme, seen)
    }
    return DesignColor.parse(value, (inner) => this.resolve(inner, theme, seen))
  }

  ////////////////
  // ## Type
  ////////////////

  /**
   * `type`:  the three font stacks, and the Spell theme's text styles as its sheet sets them (`spell.css` header:
   * bold serif `h1` / `h2`, regular serif `h3`, sans semibold `h4`, the italic serif lede, the mono eyebrow).
   * - Sizes:  `--ui-header-h1` ... ratios of `--ui-font-size`.
   * - No `fonts`:  `'Spell Serif'` is the INSTALLED Palatino only (no font files ship), so a design may fall back.
   */
  type(): DesignTokensFile["type"] {
    const base = parseFloat(this.values.get("--ui-font-size") ?? "16") || 16
    const ratio = (name: string, fallback: number) => parseFloat(this.values.get(name) ?? "") || fallback
    const px = (multiple: number) => `${Math.round(base * multiple * 10) / 10}px`
    const lineHeight = ratio("--ui-line-height", 1.5)
    const headingLine = ratio("--ui-line-height-heading", 1.25)
    const style = (name: string, fields: Omit<DesignTypeStyle, "name">): DesignTypeStyle => ({ name, ...fields })
    return {
      fonts: [],
      families: {
        sans: DesignTokens.fontStack(this.values.get("--ui-font-family")),
        serif: DesignTokens.fontStack(this.values.get("--ui-font-family-heading")),
        mono: DesignTokens.fontStack(this.values.get("--ui-font-family-mono"))
      },
      groups: [
        {
          name: "Headings",
          family: "serif",
          styles: [
            style("h1", {
              fontSize: px(ratio("--ui-header-h1", 2)),
              lineHeight: headingLine,
              fontWeight: 700,
              letterSpacing: "-0.012em",
              usage: '`<ui-header level="1">`, page titles;  headlines end with a period.',
              sample: "Write in plain language."
            }),
            style("h2", {
              fontSize: px(ratio("--ui-header-h2", 1.71)),
              lineHeight: headingLine,
              fontWeight: 700,
              letterSpacing: "-0.012em",
              usage: "Section titles.",
              sample: "Shape the app as you go."
            }),
            style("h3", {
              fontSize: px(ratio("--ui-header-h3", 1.29)),
              lineHeight: headingLine,
              fontWeight: 400,
              usage: "Sub-sections and content headers (regular weight).",
              sample: "Describe, preview, refine."
            }),
            style("h4", {
              family: "sans",
              fontSize: px(ratio("--ui-header-h4", 1.07)),
              lineHeight: headingLine,
              fontWeight: 600,
              usage: "Small headers:  the sans at semibold.",
              sample: "Settings"
            }),
            style("lede", {
              fontSize: px(1.125),
              lineHeight: 1.4,
              fontWeight: 400,
              fontStyle: "italic",
              usage: "A header's sub header:  the 3-6 word italic echo under every headline.",
              sample: "Clear words. Better results."
            })
          ]
        },
        {
          name: "Text",
          family: "sans",
          styles: [
            style("body", {
              fontSize: px(1),
              lineHeight,
              fontWeight: 400,
              usage: "Body text:  the system sans.",
              sample: "Spell turns it into a working app."
            }),
            style("ui", {
              fontSize: px(1),
              lineHeight,
              fontWeight: 500,
              usage: "Buttons and labels (the brand's UI weight, 500).",
              sample: "Publish"
            }),
            style("caption", {
              fontSize: px(ratio("--ui-caption-ratio", 0.875)),
              lineHeight,
              fontWeight: 400,
              usage: "Captions and meta text, in `text-muted`.",
              sample: "Edited 2 min ago"
            })
          ]
        },
        {
          name: "Mono",
          family: "mono",
          styles: [
            style("eyebrow", {
              fontSize: px(0.75),
              lineHeight: 1.4,
              fontWeight: 500,
              letterSpacing: "0.14em",
              usage: "A `sub` header and statistic labels:  UPPERCASE mono.",
              sample: "BUILD STEPS"
            }),
            style("code", {
              fontSize: px(0.875),
              lineHeight: 1.5,
              fontWeight: 400,
              usage: "Compiled code only:  a spell is prose, so it's never mono.",
              sample: "spell compile"
            })
          ]
        }
      ]
    }
  }

  ////////////////
  // ## Lengths, shadows, plain values
  ////////////////

  /** A length family:  each matching property as px (em of the base font size), else skipped. */
  private lengths(note: string, pattern: RegExp): { note: string; tokens: DesignTokenRow[] } {
    const base = parseFloat(this.values.get("--ui-font-size") ?? "16") || 16
    const tokens: DesignTokenRow[] = []
    for (const name of this.values.keys()) {
      if (!pattern.test(name)) continue
      const value = this.literal(name)
      const match = value && /^(-?[\d.]+)(px|em|%)?$/.exec(value)
      if (!match) {
        this.skip(name, "length", `not a plain length:  \`${this.values.get(name)}\``)
        continue
      }
      const amount = parseFloat(match[1]!)
      const px = match[2] === "em" ? `${Math.round(amount * base * 100) / 100}px` : match[2] ? value! : `${amount}px`
      const usage = match[2] === "em" ? `\`${name}\` (${value} at the ${base}px base)` : `\`${name}\``
      tokens.push({ name: this.exported(name), value: px, usage: this.usage(name, usage) })
    }
    return { note, tokens }
  }

  /** `--ui-shadow-*` (but the ink), per theme, every colour in them worked out as hex. */
  private shadows(): { note: string; tokens: DesignTokenRow[] } {
    const tokens: DesignTokenRow[] = []
    for (const name of this.values.keys()) {
      if (!/^--ui-shadow-/.test(name) || name === "--ui-shadow-ink") continue
      const values = THEMES.map((theme) => this.shadowValue(name, theme))
      if (values.some((value) => value === undefined)) {
        this.skip(name, "shadow", "a colour in it doesn't resolve")
        continue
      }
      tokens.push({
        name: this.exported(name),
        value: DesignTokens.themed(values as string[]),
        usage: this.usage(name)
      })
    }
    return {
      note: "Soft, violet-tinted shadows;  dark adds lilac rings and glows.  Each layer's colour worked out per theme.",
      tokens
    }
  }

  /** Shadow property `name` in `theme`:  `var()`s inlined, `light-dark()` picked, colours as hex;  else `undefined`. */
  private shadowValue(name: string, theme: Theme): string | undefined {
    const raw = this.literal(name, theme)
    if (raw === undefined) return undefined
    if (raw === "none") return raw
    const layers = DesignColor.splitTop(raw, ",").map((layer) => {
      const parts = DesignColor.splitTop(layer).map((part) => {
        if (/^(inset|0|-?[\d.]+(px|em))$/.test(part)) return part
        const color = this.resolve(part, theme)
        return color ? DesignColor.toHex(color) : undefined
      })
      return parts.includes(undefined) ? undefined : parts.join(" ")
    })
    return layers.includes(undefined) ? undefined : layers.join(", ")
  }

  /** A family of plain CSS values (numbers, durations, `cubic-bezier()`):  `var()`s inlined, else skipped. */
  private plain(note: string, pattern: RegExp): { note: string; tokens: DesignTokenRow[] } {
    const tokens: DesignTokenRow[] = []
    for (const name of this.values.keys()) {
      if (!pattern.test(name)) continue
      const value = this.literal(name)
      if (!value || !/^[A-Za-z0-9 #%(),./+_-]{1,200}$/.test(value) || /var\(|url\(/.test(value)) {
        this.skip(name, "other", `not a plain value:  \`${this.values.get(name)}\``)
        continue
      }
      tokens.push({ name: this.exported(name), value, usage: this.usage(name) })
    }
    return { note, tokens }
  }

  /**
   * Custom property `name`'s value with whole-value and nested `var()`s inlined (fallbacks honoured) and, given a
   * `theme`, its `light-dark()`s picked;  `undefined` on a missing variable or a cycle.
   */
  private literal(name: string, theme?: Theme, seen: ReadonlySet<string> = new Set()): string | undefined {
    const raw = this.values.get(name)
    if (raw === undefined || seen.has(name)) return undefined
    const inner = new Set([...seen, name])
    let failed = false
    let value = raw.replace(/var\(\s*(--[\w-]+)\s*(?:,\s*([^()]*))?\)/g, (_, other: string, fallback?: string) => {
      const resolved = this.literal(other, theme, inner) ?? fallback?.trim()
      if (resolved === undefined) failed = true
      return resolved ?? ""
    })
    if (failed) return undefined
    if (theme) value = DesignTokens.pickAll(value, theme)
    return value.trim()
  }

  ////////////////
  // ## Helpers
  ////////////////

  /** Record `name` as not exported. */
  private skip(name: string, family: string, reason: string) {
    if (!this.skipped.some((entry) => entry.name === name)) this.skipped.push({ name, family, reason })
  }

  /** Why colour `name` didn't resolve, in words. */
  private reason(name: string): string {
    const raw = this.values.get(name)
    if (raw === undefined) return "not declared on `:root` in the Spell theme's sheets"
    if (/currentColor/i.test(raw)) return "uses `currentColor` (the text colour where it's used)"
    return `can't be worked out from \`${raw.length > 80 ? raw.slice(0, 77) + "..." : raw}\``
  }

  /** A row's `usage`:  the property it mirrors, and the foundation's description of it when there is one. */
  private usage(name: string, lead = `\`${name}\``): string {
    for (const group of this.foundation) {
      const token = group.tokens.find((entry) => entry.name === name)
      if (token?.description) return `${lead}:  ${token.description}`
    }
    if (name.startsWith("--spell-")) return `${lead}:  a Spell palette step or brand role (\`themes/spell-brand.css\`).`
    return lead
  }

  /** The exported token name of custom property `name`:  `exportName()`'s, unless a clash renamed it. */
  private exported(name: string): string {
    return this.renamed.get(name) ?? DesignTokens.exportName(name)
  }

  /**
   * The plain exported token name of custom property `name`:  without `--`, and without `ui-` / `spell-`.
   * - NOTE: why not the property's own name:  the class header.
   */
  static exportName(name: string): string {
    return name.replace(/^--/, "").replace(/^(ui|spell)-/, "")
  }

  /** One value per theme as the format wants it:  a plain string when every theme agrees, else `{ light, dark }`. */
  private static themed(values: string[]): ThemedValue {
    if (values.every((value) => value === values[0])) return values[0]!
    return Object.fromEntries(THEMES.map((theme, index) => [theme, values[index]!]))
  }

  /** `text`'s branch for `theme` when the whole of it is one `light-dark()`, else `text`. */
  static pickTheme(text: string, theme: Theme): string {
    const match = /^light-dark\(([\s\S]*)\)$/i.exec(text.trim())
    if (!match) return text.trim()
    const [light, dark] = DesignColor.splitTop(match[1]!, ",")
    return DesignTokens.pickTheme((theme === "light" ? light : dark) ?? "", theme)
  }

  /** `text` with EVERY `light-dark(a, b)` in it replaced by its branch for `theme`. */
  static pickAll(text: string, theme: Theme): string {
    let result = text
    for (let start = result.search(/light-dark\(/i); start >= 0; start = result.search(/light-dark\(/i)) {
      const open = start + "light-dark(".length
      let depth = 1
      let end = open
      for (; end < result.length && depth > 0; end++) {
        if (result[end] === "(") depth++
        else if (result[end] === ")") depth--
      }
      const [light, dark] = DesignColor.splitTop(result.slice(open, end - 1), ",")
      result = result.slice(0, start) + ((theme === "light" ? light : dark) ?? "") + result.slice(end)
    }
    return result
  }

  /**
   * A font stack the format takes (≤200 characters, no parentheses, `;`, braces, angle brackets or backslashes):
   * trailing families dropped until it fits.
   */
  static fontStack(stack: string | undefined): string {
    const families = (stack ?? "sans-serif")
      .split(",")
      .map((family) => family.trim())
      .filter((family) => !/[;{}<>\\()]/.test(family))
    while (families.join(", ").length > 200 && families.length > 1) families.pop()
    return families.join(", ")
  }

  /**
   * Every custom property declared on `:root` in `css`, outside any `@media` / `@container` / `@supports`, in order.
   * - `:root` may sit inside `@layer` blocks (our sheets' `@layer ui.tokens { :root { ... } }`).
   */
  static rootDeclarations(css: string): { name: string; value: string }[] {
    const text = css.replace(/\/\*[\s\S]*?\*\//g, " ")
    const result: { name: string; value: string }[] = []
    const stack: string[] = []
    let segment = 0
    for (let index = 0; index < text.length; index++) {
      const char = text[index]
      if (char === "{") {
        stack.push(text.slice(segment, index).trim())
        segment = index + 1
      } else if (char === "}") {
        stack.pop()
        segment = index + 1
      } else if (char === ";") {
        segment = index + 1
      } else if (char === "-" && text[index + 1] === "-" && !text.slice(segment, index).trim()) {
        const head = /^(--[\w-]+)\s*:/.exec(text.slice(index))
        if (!head) continue
        let depth = 0
        let end = index + head[0].length
        for (; end < text.length; end++) {
          const next = text[end]
          if (next === "(") depth++
          else if (next === ")") depth--
          else if (depth === 0 && (next === ";" || next === "}")) break
        }
        const atRoot = stack.at(-1) === ":root" && stack.slice(0, -1).every((prelude) => prelude.startsWith("@layer"))
        if (atRoot) result.push({ name: head[1]!, value: text.slice(index + head[0].length, end).trim() })
        index = end - 1
        segment = end
      }
    }
    return result
  }
}

/** A theme of the export:  `light-dark()`'s first or second branch. */
export type Theme = (typeof THEMES)[number]

/** The two themes, light FIRST (the format reads a plain string, and anything missing, from the first). */
const THEMES = ["light", "dark"] as const

/** The sheets `UI.themes.apply("spell-brand")` stacks, in cascade order (later wins), relative to `src/styles/`. */
const SHEETS = ["tokens.css", "sizes.css", "colors.css", "themes/classic.css", "themes/spell-brand.css"] as const
