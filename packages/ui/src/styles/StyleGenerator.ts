import { kebabCase } from "$/ui/util"

import { ColorContrast } from "./ColorContrast"

import type {
  ColorRecipe,
  ColorShift,
  GeneratedDeclaration,
  GeneratedSheetName,
  HueDefinition,
  HueStates,
  Oklch,
  SchemeColor,
  SchemeRecipe
} from "./styles.types"
import {
  borderAlphas,
  borderWidth,
  breakpoints,
  captionRatio,
  disabledOpacity,
  durations,
  easings,
  focusRing,
  fontSize,
  fontWeights,
  fonts,
  headingRatio,
  hueAliases,
  hueRoles,
  hueStates,
  hues,
  lineHeights,
  neutrals,
  onColors,
  radii,
  semanticAliases,
  semanticColors,
  semanticRoles,
  shadows,
  sizes,
  spacing,
  textAlphas,
  zIndices
} from "./styles.en"

/****************
 * ### `StyleGenerator`
 * Writes the GENERATED foundation sheets -- `tokens.css`, `colors.css`, `sizes.css` -- from
 * `styles.en.ts`.
 * - Pure:  returns CSS text and touches no file system, so it runs both in node (`scripts/gen-styles.ts`,
 *   `yarn gen:styles`) and in the browser test that checks the committed sheets are current.
 * - Imports only its own folder (the vocabulary, `ColorContrast`, types) and `$/ui/util`'s `kebabCase`:  never the
 *   element layer, which node can't load.  Build-time only, so left out of the `$/ui/styles` barrel.
 * - Output is close to oxfmt's CSS style;  the script runs oxfmt afterwards, and the staleness test
 *   compares with whitespace stripped, so line breaking never matters.
 * - Token declarations go on `:root`, plus a `:host` copy guarded by
 *   `@container not style(--ui-sheet-<name>: loaded)`:
 *   - the guard is true only when NO ancestor (across shadow boundaries) has the page-level sheet, so a
 *     component rendered where the page never loaded the tokens still resolves them
 *   - and where the page DID load them, `:host` declares nothing, so page / wrapper overrides
 *     (`<section style="--ui-font-size: 20px">`) still inherit into components.  An unguarded
 *     `:host { --ui-font-size: 16px }` would block them.
 * - Palette tokens are NOT registered with `@property`:  a registered `<color>` resolves `light-dark()` where it
 *   is DECLARED (`:root`), freezing the page's scheme into every `.ui-dark` subtree.  Unregistered, the
 *   `light-dark()` token stream resolves where it is USED.  The concrete per-scheme bases
 *   (`--ui-red-on-light` / `--ui-red-on-dark`) hold no `light-dark()`, so THEY are registered (animatable,
 *   type-checked, document-wide initial values).
 * - Text ON a solid colour is DATA:  `--ui-<name>-on` (white or ink) is picked here by WCAG contrast
 *   (`ColorContrast`) against the colour and its states, per scheme -- see `onColors`.
 ****************/
export class StyleGenerator {
  /** Every generated sheet:  file name inside `src/styles/` => CSS text. */
  sheets(): Record<GeneratedSheetName, string> {
    return {
      "tokens.css": this.tokensCSS(),
      "colors.css": this.colorsCSS(),
      "sizes.css": this.sizesCSS()
    }
  }

  ////////////////
  // ## tokens.css
  ////////////////

  /**
   * `tokens.css`:  every non-palette global token in `@layer ui.tokens`.
   * - Type, spacing, radii, borders, ink + text / border alphas, shadows, focus ring, motion, stacking,
   *   breakpoints.
   */
  tokensCSS(): string {
    const declarations: GeneratedDeclaration[] = [
      ["--ui-font-size", `${fontSize}px`],
      ...this.entries(fonts).map(([name, stack]): GeneratedDeclaration => [
        this.token("font-family", name),
        this.fontStack(stack)
      ]),
      ...this.entries(fontWeights).map(([name, weight]): GeneratedDeclaration => [
        `--ui-font-weight-${name}`,
        String(weight)
      ]),
      ...this.entries(lineHeights).map(([name, height]): GeneratedDeclaration => [
        this.token("line-height", name),
        String(height)
      ]),
      ["--ui-heading-ratio", String(headingRatio)],
      ["--ui-caption-ratio", String(captionRatio)],
      ...this.entries(spacing).map(([name, em]): GeneratedDeclaration => [`--ui-space-${name}`, `${em}em`]),
      ...this.entries(radii).map(([name, radius]): GeneratedDeclaration => [`--ui-radius-${name}`, radius]),
      ["--ui-radius", "var(--ui-radius-m)"],
      ["--ui-ink-on-light", this.oklch(neutrals.ink.onLight)],
      ["--ui-ink-on-dark", this.oklch(neutrals.ink.onDark)],
      ["--ui-ink", "light-dark(var(--ui-ink-on-light), var(--ui-ink-on-dark))"],
      ...this.entries(textAlphas).map(([name, alpha]): GeneratedDeclaration => [
        name === "default" ? "--ui-text-color" : `--ui-text-${name}`,
        this.inkAlpha(alpha.onLight, alpha.onDark)
      ]),
      ...this.entries(textAlphas).map(([name, alpha]): GeneratedDeclaration => [
        name === "default" ? "--ui-text-inverted-color" : `--ui-text-inverted-${name}`,
        this.inkAlpha(undefined, alpha.onDark)
      ]),
      ["--ui-border-width", `${borderWidth}px`],
      ...this.entries(borderAlphas).map(([name, alpha]): GeneratedDeclaration => [
        this.token("border-color", name),
        this.inkAlpha(alpha.onLight, alpha.onDark)
      ]),
      ["--ui-border", "var(--ui-border-width) solid var(--ui-border-color)"],
      ["--ui-shadow-ink", "light-dark(var(--ui-ink-on-light), oklch(0 0 0))"],
      ...this.entries(shadows).map(([name, layers]): GeneratedDeclaration => [
        `--ui-shadow-${name}`,
        layers
          .map(
            ([x, y, blur, spread, alpha]) =>
              [x, y, blur, spread].map((px) => (px ? `${px}px` : "0")).join(" ") +
              ` oklch(from var(--ui-shadow-ink) l c h / ${alpha})`
          )
          .join(", ")
      ]),
      ["--ui-focus-width", `${focusRing.width}px`],
      ["--ui-focus-offset", `${focusRing.offset}px`],
      ["--ui-disabled-opacity", String(disabledOpacity)],
      ...this.entries(durations).map(([name, ms]): GeneratedDeclaration => [`--ui-duration-${name}`, `${ms}ms`]),
      ...this.entries(easings).map(([name, curve]): GeneratedDeclaration => [this.token("ease", name), curve]),
      ...this.entries(zIndices).map(([name, z]): GeneratedDeclaration => [`--ui-z-${name}`, String(z)]),
      ...this.entries(breakpoints).map(([name, px]): GeneratedDeclaration => [
        `--ui-breakpoint-${kebabCase(name)}`,
        `${px}px`
      ])
    ]
    return this.sheet([...this.layer("ui.tokens", this.tokenBlock("tokens", declarations))])
  }

  ////////////////
  // ## colors.css
  ////////////////

  /**
   * `colors.css`:  palette, semantic and neutral colour tokens, the colour REMAP rules and colour utilities.
   * - Remaps:  `.ui.red, .ui-red { --ui-color: var(--ui-red) ... }`, then ONE rule deriving
   *   `--ui-color-hover` ... from `--ui-color` for every remap selector.  Component CSS consumes only the
   *   generic `--ui-color*` tokens, replacing Fomantic's 13x per-hue rule loops.
   * - Derived generics are computed from `--ui-color` on the SAME element, so a per-instance
   *   `style="--ui-color: hotpink"` on a coloured element gets matching hover / text / background.
   */
  colorsCSS(): string {
    const lines: string[] = []
    lines.push(...this.comment("Concrete per-scheme bases:  registered, so they animate and type-check."))
    for (const [name, color] of this.schemeBases()) {
      lines.push(...this.property(`--ui-${name}-on-light`, this.oklch(color.onLight)))
      lines.push(...this.property(`--ui-${name}-on-dark`, this.oklch(color.onDark)))
    }
    const tokens = this.tokenBlock("colors", this.colorDeclarations(), [
      "@media (prefers-color-scheme: dark)",
      [["--ui-scheme", "dark"]]
    ])
    const remaps = this.colorRemaps()
    lines.push("", ...this.layer("ui.tokens", [...tokens, "", ...remaps]))
    lines.push("", ...this.layer("ui.utilities", this.colorUtilities()))
    return this.sheet(lines)
  }

  /** Declarations of the `:root` colour block. */
  private colorDeclarations(): GeneratedDeclaration[] {
    const declarations: GeneratedDeclaration[] = [
      ["color-scheme", "light dark"],
      ["--ui-scheme", "light"]
    ]
    for (const [name, color] of this.entries(neutrals)) {
      if (name === "ink") continue // `tokens.css`:  text / border / shadow alphas derive from it
      declarations.push([`--ui-${name}`, this.lightDark(this.oklch(color.onLight), this.oklch(color.onDark))])
    }
    for (const [name, hue] of this.entries(hues)) {
      const inverted: Oklch | undefined = (hue as HueDefinition).inverted
      declarations.push(
        [`--ui-${name}-on-light`, this.oklch(hue.onLight)],
        [`--ui-${name}-on-dark`, this.oklch(hue.onDark)],
        [`--ui-${name}`, `light-dark(var(--ui-${name}-on-light), var(--ui-${name}-on-dark))`],
        ...this.derived({ base: `var(--ui-${name})`, name, states: this.statesFor(name), roles: hueRoles }),
        [`--ui-${name}-inverted`, inverted ? this.oklch(inverted) : `var(--ui-${name}-on-dark)`],
        ...this.onDeclarations({ name, color: hue, states: this.statesFor(name), inverted })
      )
    }
    for (const [name, target] of this.entries(hueAliases)) {
      declarations.push(
        [`--ui-${name}`, `var(--ui-${target})`],
        ...this.derived({ base: `var(--ui-${name})`, name, states: this.statesFor(target), roles: hueRoles }),
        [`--ui-${name}-inverted`, `var(--ui-${target}-inverted)`],
        ...this.onAliases(name, target)
      )
    }
    for (const [name, semantic] of this.entries(semanticColors)) {
      if ("hue" in semantic) {
        declarations.push(
          [`--ui-${name}`, `var(--ui-${semantic.hue})`],
          [`--ui-${name}-inverted`, `var(--ui-${semantic.hue}-inverted)`],
          ...this.onAliases(name, semantic.hue)
        )
      } else {
        declarations.push(
          [`--ui-${name}-on-light`, this.oklch(semantic.onLight)],
          [`--ui-${name}-on-dark`, this.oklch(semantic.onDark)],
          [`--ui-${name}`, `light-dark(var(--ui-${name}-on-light), var(--ui-${name}-on-dark))`],
          [`--ui-${name}-inverted`, `var(--ui-${name}-on-dark)`],
          ...this.onDeclarations({ name, color: semantic, states: hueStates })
        )
      }
      declarations.push(...this.derived({ base: `var(--ui-${name})`, name, states: hueStates, roles: semanticRoles }))
    }
    for (const [name, target] of this.entries(semanticAliases)) {
      for (const suffix of ["", "-inverted", ...ON_SUFFIXES, ...this.derivedSuffixes()]) {
        declarations.push([`--ui-${name}${suffix}`, `var(--ui-${target}${suffix})`])
      }
    }
    declarations.push(
      ["--ui-link", "var(--ui-primary-text)"],
      [
        "--ui-link-hover",
        this.lightDark(
          "oklch(from var(--ui-link) calc(l - 0.1) calc(c * 1.2) h)",
          "oklch(from var(--ui-link) calc(l + 0.08) c h)"
        )
      ],
      ["--ui-focus-color", "var(--ui-primary)"],
      [
        "--ui-focus-border",
        this.lightDark(
          "oklch(from var(--ui-primary) calc(l + 0.18) calc(c * 0.5) h)",
          "oklch(from var(--ui-primary) calc(l - 0.1) calc(c * 0.7) h)"
        )
      ]
    )
    return declarations
  }

  /**
   * Remap rules:  point the generic `--ui-color*` tokens at one colour, so component CSS needs no per-hue rules.
   * - Roles (`-text`, `-header`, `-border`, `-background`, `-inverted`) and the foregrounds (`-on`,
   *   `-inverted-on`) point at the colour's OWN tokens, so a theme's hand-tuned role (`--ui-yellow-text`,
   *   `--ui-red-background`) reaches components.
   * - States (`-hover`, `-focus`, `-down`, `-active`) are derived once, from `--ui-color` on the same element:
   *   they're mechanical recipes in Fomantic too, and it means a per-instance `style="--ui-color: hotpink"` on a
   *   coloured element gets matching states.  `black` / `secondary` get the lightening recipe.
   * - NOTE: `-on` is NOT derived:  it's picked by contrast at generation time, so a per-instance
   *   `--ui-color` override must set `--ui-color-on` too.
   * - Also `[data-variation~="red"]` => `--ui-variation-color` (+ `-inverted`, `-on`, `-inverted-on`),
   *   Fomantic's tooltip / popup colour hook.  A separate token, so a coloured tooltip never recolours the
   *   element it hangs off.
   */
  private colorRemaps(): string[] {
    const lines = this.comment("Remaps:  component CSS reads only the generic `--ui-color*` tokens.")
    const suffixes = ["", ...this.keys(hueRoles).map((role) => `-${role}`), "-inverted", ...ON_SUFFIXES]
    for (const name of this.colorNames()) {
      lines.push(
        ...this.rule(
          this.remapSelectors(name),
          suffixes.map((suffix): GeneratedDeclaration => [`--ui-color${suffix}`, `var(--ui-${name}${suffix})`])
        )
      )
    }
    const lightening = this.colorNames().filter((name) => this.lightens(name))
    lines.push(
      ...this.rule(
        this.colorNames().flatMap((name) => this.remapSelectors(name)),
        this.stateDeclarations("var(--ui-color)", "color", hueStates)
      ),
      ...this.rule(
        lightening.flatMap((name) => this.remapSelectors(name)),
        this.stateDeclarations("var(--ui-color)", "color", hues.black.states)
      )
    )
    for (const name of [...this.keys(hues), ...this.keys(hueAliases)]) {
      lines.push(
        ...this.rule(
          [`[data-variation~="${name}"]`],
          ["", "-inverted", ...ON_SUFFIXES].map((suffix): GeneratedDeclaration => [
            `--ui-variation-color${suffix}`,
            `var(--ui-${name}${suffix})`
          ])
        )
      )
    }
    return lines
  }

  /** `ui-text-<name>`, `ui-bg-<name>`, `ui-border-<name>` for every hue, alias and semantic colour. */
  private colorUtilities(): string[] {
    const lines: string[] = []
    const names = this.colorNames()
    for (const name of names) lines.push(...this.rule([`.ui-text-${name}`], [["color", `var(--ui-${name}-text)`]]))
    for (const name of names) {
      lines.push(...this.rule([`.ui-bg-${name}`], [["background-color", `var(--ui-${name}-background)`]]))
    }
    for (const name of names) {
      lines.push(...this.rule([`.ui-border-${name}`], [["border-color", `var(--ui-${name}-border)`]]))
    }
    return lines
  }

  ////////////////
  // ## sizes.css
  ////////////////

  /**
   * `sizes.css`:  size ratio tokens, the `--ui-scale` remaps, and the size / spacing driven utilities.
   * - Components set `font-size: calc(var(--ui-font-size) * var(--ui-scale, 1))` on their root and use `em`
   *   inside, so ONE remap per size replaces Fomantic's per-component size rules.
   * - `medium` emits `--ui-scale: 1`, a no-op that also resets a size inherited from a wrapper.
   */
  sizesCSS(): string {
    const declarations = this.entries(sizes).map(([name, ratio]): GeneratedDeclaration => [
      `--ui-size-${name}`,
      String(ratio)
    ])
    const remaps: string[] = []
    for (const [name] of this.entries(sizes)) {
      const selectors = [`.ui.${name}`, `.ui-${name}`, `.ui-body-${name}`, `.ui-heading-${name}`, `.ui-caption-${name}`]
      remaps.push(...this.rule(selectors, [["--ui-scale", name === "medium" ? "1" : `var(--ui-size-${name})`]]))
    }
    for (const [name] of this.entries(sizes)) {
      remaps.push(...this.rule([`[data-variation~="${name}"]`], [["--ui-variation-scale", `var(--ui-size-${name})`]]))
    }
    const utilities: string[] = []
    for (const [name] of this.entries(sizes)) {
      utilities.push(
        ...this.rule([`.ui-font-size-${name}`], [["font-size", `calc(var(--ui-font-size) * var(--ui-size-${name}))`]])
      )
    }
    for (const [name] of this.entries(spacing)) {
      utilities.push(...this.rule([`.ui-gap-${name}`], [["gap", `var(--ui-space-${name})`]]))
    }
    for (const [prefix, property] of [
      ["m", "margin"],
      ["p", "padding"]
    ] as const) {
      // shorthands first, so a later side-specific class wins at equal specificity
      for (const [side, suffix] of SPACING_SIDES) {
        for (const [name] of this.entries(spacing)) {
          utilities.push(
            ...this.rule([`.ui-${prefix}${side}-${name}`], [[`${property}${suffix}`, `var(--ui-space-${name})`]])
          )
        }
      }
    }
    return this.sheet([
      ...this.layer("ui.tokens", [...this.tokenBlock("sizes", declarations), "", ...remaps]),
      "",
      ...this.layer("ui.utilities", utilities)
    ])
  }

  ////////////////
  // ## Colour recipes
  ////////////////

  /** Hue / alias / semantic names that have concrete `onLight` / `onDark` values. */
  private schemeBases(): Array<[name: string, color: SchemeColor]> {
    const bases: Array<[string, SchemeColor]> = this.entries(hues)
    for (const [name, semantic] of this.entries(semanticColors)) {
      if (!("hue" in semantic)) bases.push([name, semantic])
    }
    return bases
  }

  /** Suffixes `derived()` emits, for aliasing every one of them. */
  private derivedSuffixes(): string[] {
    return [...this.keys(hueStates), ...this.keys(hueRoles)].map((suffix) => `-${suffix}`)
  }

  /** State + role tokens of `base`, named `--ui-<name>-<suffix>`. */
  private derived({ base, name, states, roles }: DerivedParams): GeneratedDeclaration[] {
    return [...this.stateDeclarations(base, name, states), ...this.roleDeclarations(base, name, roles)]
  }

  /** `--ui-<name>-hover` ... as relative colours of `base`. */
  private stateDeclarations(base: string, name: string, states: HueStates): GeneratedDeclaration[] {
    return this.entries(states).map(([state, shift]): GeneratedDeclaration => [
      `--ui-${name}-${state}`,
      this.shift(base, shift)
    ])
  }

  /** `--ui-<name>-text` ... as `light-dark()` of per-scheme relative colours of `base`. */
  private roleDeclarations(base: string, name: string, roles: Record<string, SchemeRecipe>): GeneratedDeclaration[] {
    return Object.entries(roles).map(([role, recipe]): GeneratedDeclaration => [
      `--ui-${name}-${role}`,
      this.lightDark(this.recipe(base, recipe.light), this.recipe(base, recipe.dark))
    ])
  }

  /** `oklch(from <base> calc(l - 0.05) calc(c * 1.1) h)`. */
  private shift(base: string, { lightness, chroma }: ColorShift): string {
    const l = lightness === 0 ? "l" : `calc(l ${lightness < 0 ? "-" : "+"} ${Math.abs(lightness)})`
    return `oklch(from ${base} ${l} ${this.chroma(chroma)} h)`
  }

  /** `oklch(from <base> min(l, 0.56) c h)` and friends. */
  private recipe(base: string, { lightness, mode, chroma }: ColorRecipe): string {
    const l = mode === "exact" ? String(lightness) : `${mode === "atMost" ? "min" : "max"}(l, ${lightness})`
    return `oklch(from ${base} ${l} ${this.chroma(chroma)} h)`
  }

  /** Chroma channel for a multiplier:  `c` or `calc(c * 1.1)`. */
  private chroma(factor: number): string {
    return factor === 1 ? "c" : `calc(c * ${factor})`
  }

  /** Interaction-state recipe for a palette hue. */
  private statesFor(name: keyof typeof hues): HueStates {
    const hue: HueDefinition = hues[name]
    return hue.states ?? hueStates
  }

  /** Does colour `name` lighten for its states, like `black` (and aliases of it)? */
  private lightens(name: string): boolean {
    const target: string = name in hueAliases ? hueAliases[name as keyof typeof hueAliases] : name
    return target in hues && this.statesFor(target as keyof typeof hues) !== hueStates
  }

  /** Every colour name components accept:  hues, aliases, semantic colours and their aliases. */
  private colorNames(): string[] {
    return [...this.keys(hues), ...this.keys(hueAliases), ...this.keys(semanticColors), ...this.keys(semanticAliases)]
  }

  /** Remap selectors for colour `name`:  Fomantic's class grammar plus the utility class. */
  private remapSelectors(name: string): string[] {
    return [`.ui.${name}`, `.ui-${name}`]
  }

  /**
   * Ink at an alpha:  `light-dark()` of both scheme inks, or just the dark-surface ink when `onLight` is
   * `undefined` (the `inverted` roles, which don't follow the scheme).
   */
  private inkAlpha(onLight: number | undefined, onDark: number): string {
    const dark = `oklch(from var(--ui-ink-on-dark) l c h / ${onDark})`
    if (onLight === undefined) return dark
    return this.lightDark(`oklch(from var(--ui-ink-on-light) l c h / ${onLight})`, dark)
  }

  ////////////////
  // ## Foregrounds on a colour
  ////////////////

  /**
   * `--ui-<name>-on` (per scheme) and `--ui-<name>-inverted-on` (on the `-inverted` colour, whatever the scheme).
   * - Each is the `onColors` candidate `onColor()` picks for that colour + `states`.
   * - `inverted` ~== the hue's own `inverted` override;  default `onDark`, as `--ui-<name>-inverted` is.
   */
  private onDeclarations({ name, color, states, inverted }: OnDeclarationsParams): GeneratedDeclaration[] {
    const light = this.onColor(color.onLight, states)
    const dark = this.onColor(color.onDark, states)
    return [
      [`--ui-${name}-on`, light === dark ? light : this.lightDark(light, dark)],
      [`--ui-${name}-inverted-on`, inverted ? this.onColor(inverted, states) : dark]
    ]
  }

  /** `-on` / `-inverted-on` of an alias:  its target's. */
  private onAliases(name: string, target: string): GeneratedDeclaration[] {
    return ON_SUFFIXES.map((suffix): GeneratedDeclaration => [`--ui-${name}${suffix}`, `var(--ui-${target}${suffix})`])
  }

  /**
   * CSS of the first `onColors` candidate reaching `ColorContrast.text` on `color` and every state of it,
   * else of the candidate with the best worst case.
   * - Never fails generation:  `colors.contrast.test.ts` is what fails, naming the pair.
   */
  private onColor(color: Oklch, states: HueStates): string {
    const backgrounds = [color, ...Object.values(states).map((shift) => this.shifted(color, shift))]
    const candidates = Object.values(onColors).map((candidate) => ({
      css: candidate.css,
      worst: Math.min(...backgrounds.map((background) => ColorContrast.ratio(candidate.color, background)))
    }))
    const passing = candidates.find((candidate) => candidate.worst >= ColorContrast.text)
    return (passing ?? candidates.toSorted((a, b) => b.worst - a.worst)[0]!).css
  }

  /** `color` with `shift` applied, as `shift()` does in CSS (lightness clamped to `0..1`, as CSS does). */
  private shifted([lightness, chroma, hue]: Oklch, shift: ColorShift): Oklch {
    return [Math.min(1, Math.max(0, lightness + shift.lightness)), chroma * shift.chroma, hue]
  }

  /** `light-dark(<light>, <dark>)`. */
  private lightDark(light: string, dark: string): string {
    return `light-dark(${light}, ${dark})`
  }

  /** `oklch(L C H)`. */
  private oklch([lightness, chroma, hue]: Oklch): string {
    return `oklch(${lightness} ${chroma} ${hue})`
  }

  ////////////////
  // ## Formatting
  ////////////////

  /** Join `lines` into a sheet with the banner. */
  private sheet(lines: string[]): string {
    return [BANNER, "", ...lines, ""].join("\n")
  }

  /**
   * Token rules for sheet `name`:  `:root`, plus the guarded `:host` fallback (see class docs).
   * - `media` optionally adds a `[condition, declarations]` block to both, e.g. the dark `--ui-scheme`.
   */
  private tokenBlock(
    name: string,
    declarations: GeneratedDeclaration[],
    media?: [string, GeneratedDeclaration[]]
  ): string[] {
    const marker = `--ui-sheet-${name}`
    const all: GeneratedDeclaration[] = [[marker, "loaded"], ...declarations]
    const scoped = (selector: string) => [
      ...this.rule([selector], all),
      ...(media ? this.block(media[0], this.rule([selector], media[1])) : [])
    ]
    return [
      ...scoped(":root"),
      "",
      ...this.comment("Fallback for shadow roots on pages that never loaded this sheet."),
      ...this.block(`@container not style(${marker}: loaded)`, scoped(":host"))
    ]
  }

  /** `@layer <name> { ... }`. */
  private layer(name: string, body: string[]): string[] {
    return this.block(`@layer ${name}`, body)
  }

  /** `<prelude> { <body indented> }`. */
  private block(prelude: string, body: string[]): string[] {
    return [`${prelude} {`, ...body.map((line) => (line ? `  ${line}` : line)), "}"]
  }

  /** One rule, one selector per line. */
  private rule(selectors: string[], declarations: GeneratedDeclaration[]): string[] {
    const head = selectors.map((selector, index) => (index < selectors.length - 1 ? `${selector},` : `${selector} {`))
    return [...head, ...declarations.map(([property, value]) => `  ${property}: ${value};`), "}"]
  }

  /** `@property` registration of a `<color>` with an initial value. */
  private property(name: string, initial: string): string[] {
    return this.block(`@property ${name}`, ['syntax: "<color>";', "inherits: true;", `initial-value: ${initial};`])
  }

  /** A one-line CSS comment. */
  private comment(text: string): string[] {
    return [`/* ${text} */`]
  }

  /** `--ui-<prefix>` for key `default`, else `--ui-<prefix>-<name>`. */
  private token(prefix: string, name: string): string {
    return name === "default" ? `--ui-${prefix}` : `--ui-${prefix}-${name}`
  }

  /** `font-family` value:  quote names with spaces, leave keywords / identifiers bare. */
  private fontStack(stack: readonly string[]): string {
    return stack.map((font) => (font.includes(" ") ? `"${font}"` : font)).join(", ")
  }

  /** Typed `Object.entries()` for the vocabulary's `as const` objects. */
  private entries<T extends object>(object: T): Array<[keyof T & string, T[keyof T]]> {
    return Object.entries(object) as Array<[keyof T & string, T[keyof T]]>
  }

  /** Typed `Object.keys()`. */
  private keys<T extends object>(object: T): Array<keyof T & string> {
    return Object.keys(object) as Array<keyof T & string>
  }
}

/** What `derived()` takes. */
type DerivedParams = {
  /** the colour the tokens derive from, e.g. `var(--ui-red)` */
  base: string
  /** the colour's name in token names:  `red` => `--ui-red-hover`, `--ui-red-text` */
  name: string
  /** interaction-state recipe */
  states: HueStates
  /** role recipes, by role */
  roles: Record<string, SchemeRecipe>
}

/** What `onDeclarations()` takes. */
type OnDeclarationsParams = {
  /** the colour's name in token names:  `red` => `--ui-red-on` */
  name: string
  /** its concrete per-scheme values */
  color: SchemeColor
  /** its interaction-state recipe:  the foreground must read on every state too */
  states: HueStates
  /** the hue's own `inverted` override;  default `color.onDark`, as `--ui-<name>-inverted` is */
  inverted?: Oklch
}

/** First line of every generated sheet. */
const BANNER = "/* GENERATED -- do not edit, run `yarn gen:styles` (source: styles.en.ts) */"

/** Foreground suffixes every colour gets:  on the colour, and on its `-inverted` variant. */
const ON_SUFFIXES = ["-on", "-inverted-on"] as const

/** Spacing utility sides:  class infix => property suffix, shorthand first. */
const SPACING_SIDES = [
  ["", ""],
  ["-b", "-block"],
  ["-i", "-inline"],
  ["-bs", "-block-start"],
  ["-be", "-block-end"],
  ["-is", "-inline-start"],
  ["-ie", "-inline-end"]
] as const
