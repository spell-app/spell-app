import { readFileSync } from "node:fs"
import { join } from "node:path"

import { ComponentTokens } from "../src/styles/ComponentTokens.ts"
import { FamilyTokens } from "./FamilyTokens.ts"
import type { SiteFoundationGroup, SiteToken, SiteTokenType } from "../src/docs-components/docs-components.types.ts"

/****************
 * ### `FoundationTokens`
 * The FOUNDATION tokens (`--ui-font-size`, the palette, radii, motion ...), grouped for the theming page's token
 * tables (`<ui-docs-tokens global>`, `yarn site:data`).
 * - Read from the GENERATED sheets (`tokens.css`, `colors.css`, `sizes.css`):  every `:root` declaration in
 *   `@layer ui.tokens`, in sheet order, so the table can't drift from what ships.  Not from
 *   `styles.vocabulary.en.ts`:  that's the generator's INPUT, and names / values come out of `StyleGenerator`.
 * - The generated sheets carry no comments, so each group's `RULES` say what a token is, by its name.
 * - Left out:  `--ui-sheet-*` (load flags), and anything nested (`@media`, the guarded `:host` copy).
 * - A name no rule matches lands in `other`, so nothing new goes missing silently.
 ****************/
export class FoundationTokens {
  /** `src/styles/`, absolute. */
  readonly stylesFolder: string

  constructor(stylesFolder: string) {
    this.stylesFolder = stylesFolder
  }

  /** Every group with at least one token, in `GROUPS` order. */
  groups(): SiteFoundationGroup[] {
    const found = new Map<string, SiteToken[]>()
    for (const sheet of SHEETS) {
      const css = readFileSync(join(this.stylesFolder, sheet), "utf8")
      for (const declaration of ComponentTokens.declarations(css)) {
        if (declaration.nested || !ROOT.test(declaration.selector)) continue
        if (!declaration.name.startsWith("--ui-") || declaration.name.startsWith("--ui-sheet-")) continue
        const { group, token } = FoundationTokens.classify(declaration.name, declaration.value.replace(/\s+/g, " "))
        if (!found.has(group)) found.set(group, [])
        const list = found.get(group)!
        if (!list.some((row) => row.name === token.name)) list.push(token)
      }
    }
    return GROUPS.filter((group) => found.has(group.id)).map((group) => ({
      id: group.id,
      title: group.title,
      description: group.description,
      tokens: found.get(group.id)!
    }))
  }

  /** The group and row of one `:root` token. */
  static classify(name: string, value: string): { group: string; token: SiteToken } {
    for (const group of GROUPS) {
      for (const [pattern, describe, typed] of group.rules) {
        const match = pattern.exec(name)
        if (!match) continue
        const description = describe(match)
        const type = typed ?? (group.color ? "color" : FamilyTokens.typeFor(name, value))
        return { group: group.id, token: { name, default: value, ...(description && { description }), type } }
      }
    }
    return { group: OTHER.id, token: { name, default: value, type: FamilyTokens.typeFor(name, value) } }
  }
}

/** One group's definition:  what it holds, and how each name in it reads. */
type GroupDefinition = {
  /** `SiteFoundationGroup.id`, e.g. `palette` */
  id: string
  /** the table's title */
  title: string
  /** what the group is, above its table */
  description: string
  /** every token in it is a colour (live swatch) */
  color?: boolean
  /** name pattern => its description (`undefined`:  none), and its type when the group's guess is wrong */
  rules: Array<[RegExp, (match: RegExpExecArray) => string | undefined, SiteTokenType?]>
}

/** The generated sheets, in the order their tokens are listed. */
const SHEETS = ["tokens.css", "sizes.css", "colors.css"] as const

/** A declaration on the page root:  the sheet's `@layer ui.tokens { :root` prelude. */
const ROOT = /(^|\{\s*):root$/

/** The 13 hue names, as regex alternatives. */
const HUES = "red|orange|yellow|olive|green|teal|blue|violet|purple|pink|brown|grey|black"

/** The brand aliases, as regex alternatives. */
const BRAND = "primary|secondary"

/** The semantic colours, as regex alternatives. */
const SEMANTIC = "positive|negative|info|warning|success|error"

/** Descriptions of the colour suffixes every hue / alias / semantic colour gets (`--ui-red-hover` ...). */
const COLOR_SUFFIXES: Record<string, string> = {
  "": "The colour, by scheme:  `light-dark()` of its two bases.",
  "-on-light": "Concrete base in the light scheme (a registered `<color>`):  set it to re-colour the hue.",
  "-on-dark": "Concrete base in the dark scheme (a registered `<color>`).",
  "-hover": "Hover state, derived from the colour.",
  "-focus": "Focus state, derived from the colour.",
  "-down": "Pressed state, derived from the colour.",
  "-active": "Active (selected) state, derived from the colour.",
  "-text": "Text in this colour:  4.5:1 on `--ui-background`, per scheme.",
  "-header": "Headers in this colour:  a shade darker than `-text`.",
  "-border": "Borders in this colour.",
  "-background": "Pale tinted background (`ui-bg-*`, messages).",
  "-inverted": "The colour on dark surfaces, whatever the scheme.",
  "-on": "Text ON the solid colour:  white or ink, picked by contrast.",
  "-inverted-on": "Text on the `-inverted` colour."
}

/** `(-suffix)?` of `COLOR_SUFFIXES`, longest first so `-on-light` wins over `-on`. */
const SUFFIX = `(${Object.keys(COLOR_SUFFIXES)
  .filter(Boolean)
  .sort((a, b) => b.length - a.length)
  .join("|")})?`

/** The catch-all group. */
const OTHER: GroupDefinition = {
  id: "other",
  title: "Other",
  description: "Foundation tokens of no other group.",
  rules: []
}

/** Every group, in display order;  the first rule that matches a name wins. */
const GROUPS: GroupDefinition[] = [
  {
    id: "typography",
    title: "Typography",
    description: "Font size, families, weights and line heights.  `--ui-font-size` is the ONE absolute length.",
    rules: [
      [/^--ui-font-size$/, () => "Base font size, in px:  everything else is `em` of it."],
      [/^--ui-font-family$/, () => "Body font stack."],
      [/^--ui-font-family-(\w+)$/, (match) => `Font stack for ${match[1] === "mono" ? "code" : `${match[1]}s`}.`],
      [/^--ui-font-weight-(\w+)$/, (match) => `Font weight \`${match[1]}\`.`],
      [/^--ui-line-height$/, () => "Body line height, unitless."],
      [/^--ui-line-height-(\w+)$/, (match) => `Line height \`${match[1]}\`, unitless.`],
      [/^--ui-heading-ratio$/, () => "`ui-heading` text size, relative to body text."],
      [/^--ui-caption-ratio$/, () => "`ui-caption` text size, relative to body text."]
    ]
  },
  {
    id: "sizes",
    title: "Sizes",
    description: 'Component sizes, as ratios of `--ui-font-size`:  `size="large"` sets `--ui-scale` to one.',
    rules: [
      [/^--ui-size-(\w+)$/, (match) => `\`${match[1]}\` size ratio${match[1] === "medium" ? ":  the default" : ""}.`]
    ]
  },
  {
    id: "spacing",
    title: "Spacing",
    description: "The spacing ladder, in `em` of the local font size:  `ui-gap-*`, `ui-m-*`, `ui-p-*`.",
    rules: [[/^--ui-space-(\w+)$/, (match) => `Spacing step \`${match[1]}\`.`]]
  },
  {
    id: "radii",
    title: "Radii",
    description: "Corner radii by role.",
    rules: [
      [/^--ui-radius$/, () => "Default corner radius:  most components' `--ui-<tag>-radius` read it."],
      [/^--ui-radius-(\w+)$/, (match) => `Radius \`${match[1]}\`.`]
    ]
  },
  {
    id: "text",
    title: "Ink and text",
    description: "The ink every text, border and shadow alpha is made of, and the text roles.",
    color: true,
    rules: [
      [/^--ui-ink$/, () => "The ink, by scheme:  re-ink the page with its two bases."],
      [/^--ui-ink-on-(light|dark)$/, (match) => `Ink in the ${match[1]} scheme.`],
      [/^--ui-text-color$/, () => "Body text."],
      [/^--ui-text-inverted-color$/, () => "Body text on dark surfaces, whatever the scheme."],
      [/^--ui-text-inverted-(\w+)$/, (match) => `Text role \`${match[1]}\` on dark surfaces.`],
      [/^--ui-text-(\w+)$/, (match) => `Text role \`${match[1]}\`:  an alpha of the ink.`]
    ]
  },
  {
    id: "surfaces",
    title: "Surfaces",
    description: "Page and surface colours, by scheme.",
    color: true,
    rules: [
      [/^--ui-background$/, () => "Page background."],
      [/^--ui-surface$/, () => "Raised surfaces:  cards, menus, segments."],
      [
        /^--ui-surface-(\w+)$/,
        (match) => `A ${match[1]} surface (Fomantic's \`${match[1] === "muted" ? "@offWhite" : "@darkWhite"}\`).`
      ],
      [/^--ui-highlight$/, () => "Text selection background."]
    ]
  },
  {
    id: "borders",
    title: "Borders and focus",
    description: "Border width and colours, the focus ring, and links.",
    rules: [
      [/^--ui-border-width$/, () => "Border width."],
      [/^--ui-border$/, () => "The default border, as a `border` shorthand."],
      [/^--ui-border-color$/, () => "Default borders."],
      [/^--ui-border-color-([\w-]+)$/, (match) => `Border role \`${match[1]}\`:  an alpha of the ink.`],
      [/^--ui-focus-width$/, () => "Focus ring width."],
      [/^--ui-focus-offset$/, () => "Focus ring offset."],
      [/^--ui-focus-color$/, () => "Focus ring colour."],
      [/^--ui-focus-border$/, () => "Border of a focused field.", "color"],
      [/^--ui-link$/, () => "Link colour."],
      [/^--ui-link-hover$/, () => "Link colour on hover."],
      [/^--ui-disabled-opacity$/, () => "Opacity of disabled controls."]
    ]
  },
  {
    id: "palette",
    title: "Palette",
    description:
      "Fomantic's 13 hues in OKLCH, each with derived states, roles and the text colour that sits on it.  Set a " +
      "hue's `-on-light` / `-on-dark` base and everything derived follows.",
    color: true,
    rules: [[new RegExp(`^--ui-(${HUES})${SUFFIX}$`), (match) => COLOR_SUFFIXES[match[2] ?? ""]]]
  },
  {
    id: "brand",
    title: "Brand colours",
    description: "Aliases that point at a hue:  re-point `--ui-primary` (and its `-inverted`, `-on`) to re-brand.",
    color: true,
    rules: [[new RegExp(`^--ui-(${BRAND})${SUFFIX}$`), (match) => COLOR_SUFFIXES[match[2] ?? ""]]]
  },
  {
    id: "semantic",
    title: "Semantic colours",
    description:
      "Emotive colours for messages, labels and form states;  `success` / `error` are aliases of `positive` / " +
      "`negative`.",
    color: true,
    rules: [[new RegExp(`^--ui-(${SEMANTIC})${SUFFIX}$`), (match) => COLOR_SUFFIXES[match[2] ?? ""]]]
  },
  {
    id: "scheme",
    title: "Scheme",
    description: "Which colour scheme is in force:  `ui-invert` and style queries read it.",
    rules: [[/^--ui-scheme$/, () => "`light` or `dark`;  follows the OS unless the page forces one."]]
  },
  {
    id: "shadows",
    title: "Shadows",
    description: "Box shadows by role, in layers of the shadow ink.",
    rules: [
      [/^--ui-shadow-ink$/, () => "Colour every shadow is an alpha of.", "color"],
      [/^--ui-shadow-([\w-]+)$/, (match) => `Shadow \`${match[1]}\`.`]
    ]
  },
  {
    id: "motion",
    title: "Motion",
    description: "Durations and easing curves.",
    rules: [
      [/^--ui-duration-(\w+)$/, (match) => `Duration \`${match[1]}\`.`],
      [/^--ui-ease$/, () => "Default easing."],
      [/^--ui-ease-([\w-]+)$/, (match) => `Easing \`${match[1]}\`.`]
    ]
  },
  {
    id: "stacking",
    title: "Stacking",
    description: "`z-index` by layer, for what isn't in the top layer (`<dialog>`, popovers ignore it).",
    rules: [[/^--ui-z-(\w+)$/, (match) => `Stacking order of ${match[1]}s.`]]
  },
  {
    id: "breakpoints",
    title: "Breakpoints",
    description: "Fomantic's page breakpoints;  media queries use the `@custom-media` names (`--ui-mobile` ...).",
    rules: [[/^--ui-breakpoint-([\w-]+)$/, (match) => `Narrowest \`${match[1]}\` width.`]]
  },
  OTHER
]
