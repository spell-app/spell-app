/****************
 * ### `DesignColor`
 * Colour math for the design-system export (`DesignTokens`):  just enough CSS Color 4 / 5 to turn our token
 * sheets' values into plain colours a claude.ai design system accepts (hex, `rgb()`, `oklch()` with numbers only).
 * - Understands:  hex, `rgb()` / `rgba()`, `oklch()`, `transparent`, relative `oklch(from <colour> <l> <c> <h> [/ <a>])`
 *   with `calc()` / `min()` / `max()` / `clamp()` channel maths, and `color-mix(in oklab | oklch | srgb, ...)`.
 * - NOT:  `var()` and `light-dark()`:  the caller (`DesignTokens.resolve()`) resolves those first, per theme, and
 *   hands each argument back through its own `resolve` callback.
 * - Conversions:  Björn Ottosson's OKLab matrices;  sRGB output is clipped to the gamut (our palettes are sRGB hex).
 * - Single-letter names are the colour spaces' own channels (`l`, `c`, `h`, `a`, `b`, `r`, `g`), on purpose.
 * - STATIC and instance-free:  pure maths, no state.  Imports nothing.
 ****************/
export class DesignColor {
  /**
   * `text` as a colour, or `undefined` when it isn't one this class understands.
   * - `resolve`:  turns a nested argument (a `var()`, a `light-dark()` ...) into a colour;  default:  this method
   */
  static parse(text: string, resolve: (text: string) => Oklch | undefined = (inner) => DesignColor.parse(inner)) {
    const value = text.trim()
    if (/^transparent$/i.test(value)) return { l: 0, c: 0, h: 0, alpha: 0 }
    if (value.startsWith("#")) return DesignColor.fromHex(value)
    const call = /^([a-z-]+)\(([\s\S]*)\)$/i.exec(value)
    if (!call) return undefined
    const [, name, body] = call as unknown as [string, string, string]
    switch (name.toLowerCase()) {
      case "rgb":
      case "rgba":
        return DesignColor.fromRgbArgs(body)
      case "oklch":
        return /^\s*from\s/.test(body) ? DesignColor.relative(body, resolve) : DesignColor.fromOklchArgs(body)
      case "color-mix":
        return DesignColor.mix(body, resolve)
      default:
        return undefined
    }
  }

  /** `color` as `#rrggbb`, or `#rrggbbaa` when it isn't opaque;  clipped to sRGB. */
  static toHex(color: Oklch): string {
    const [r, g, b] = DesignColor.toSrgb(color)
    const alpha = color.alpha >= 1 ? "" : byte(color.alpha)
    return `#${byte(r)}${byte(g)}${byte(b)}${alpha}`

    /** A 0..1 channel as two hex digits, clipped. */
    function byte(unit: number): string {
      return Math.round(Math.min(1, Math.max(0, unit)) * 255)
        .toString(16)
        .padStart(2, "0")
    }
  }

  /** Whether `text` is a colour value the design-system format takes as is:  hex, or `rgb()` / `oklch()` of numbers. */
  static isPlain(text: string): boolean {
    return PLAIN_COLOR.test(text.trim())
  }

  ////////////////
  // ## Parsing
  ////////////////

  /** `#rgb`, `#rgba`, `#rrggbb` or `#rrggbbaa`. */
  static fromHex(hex: string): Oklch | undefined {
    let digits = hex.slice(1)
    if (!/^[0-9a-f]+$/i.test(digits) || ![3, 4, 6, 8].includes(digits.length)) return undefined
    if (digits.length <= 4) digits = digits.replace(/./g, (digit) => digit + digit)
    return DesignColor.fromSrgb(channel(0), channel(1), channel(2), digits.length === 8 ? channel(3) : 1)

    /** Channel `index` (two hex digits) as 0..1. */
    function channel(index: number): number {
      return parseInt(digits.slice(index * 2, index * 2 + 2), 16) / 255
    }
  }

  /** `rgb()`'s arguments, modern (`200 206 231 / 0.16`) or legacy (`200, 206, 231, 0.16`);  numbers or percentages. */
  private static fromRgbArgs(body: string): Oklch | undefined {
    const parts = body
      .replace(/\//g, " / ")
      .split(/[\s,]+/)
      .filter(Boolean)
    const slash = parts.indexOf("/")
    const channels = slash < 0 ? parts.slice(0, 3) : parts.slice(0, slash)
    const alphaText = slash < 0 ? parts[3] : parts[slash + 1]
    if (channels.length !== 3) return undefined
    const values = channels.map((part) => DesignColor.number(part, 255))
    const alpha = alphaText === undefined ? 1 : DesignColor.number(alphaText, 1)
    if (values.some((value) => value === undefined) || alpha === undefined) return undefined
    const [r, g, b] = values as [number, number, number]
    return DesignColor.fromSrgb(r / 255, g / 255, b / 255, alpha)
  }

  /** `oklch()`'s plain arguments:  `0.57 0.21 27`, `0.259 0.005 248 / 0.15`. */
  private static fromOklchArgs(body: string): Oklch | undefined {
    const parts = DesignColor.splitTop(body)
    const slash = parts.indexOf("/")
    const channels = slash < 0 ? parts : parts.slice(0, slash)
    if (channels.length !== 3) return undefined
    const l = DesignColor.number(channels[0]!, 1)
    const c = DesignColor.number(channels[1]!, 0.4)
    const h = channels[2] === "none" ? 0 : DesignColor.number(channels[2]!, 1)
    const alpha = slash < 0 ? 1 : DesignColor.number(parts[slash + 1] ?? "", 1)
    if (l === undefined || c === undefined || h === undefined || alpha === undefined) return undefined
    return { l, c, h, alpha }
  }

  /**
   * A relative colour's arguments, `from <colour> <l> <c> <h> [/ <alpha>]`:  each channel an expression of the base's
   * `l`, `c`, `h`, `alpha` (`calc(l - 0.05)`, `min(l, 0.5)`, `0.28`).
   */
  private static relative(body: string, resolve: (text: string) => Oklch | undefined): Oklch | undefined {
    const parts = DesignColor.splitTop(body.replace(/^\s*from\s+/, ""))
    const base = resolve(parts[0] ?? "")
    if (!base) return undefined
    const slash = parts.indexOf("/")
    const channels = slash < 0 ? parts.slice(1) : parts.slice(1, slash)
    if (channels.length !== 3) return undefined
    const scope = { l: base.l, c: base.c, h: base.h, alpha: base.alpha }
    const l = ChannelMath.evaluate(channels[0]!, scope, 1)
    const c = ChannelMath.evaluate(channels[1]!, scope, 0.4)
    const h = ChannelMath.evaluate(channels[2]!, scope, 1)
    const alpha = slash < 0 ? base.alpha : ChannelMath.evaluate(parts[slash + 1] ?? "", scope, 1)
    if (l === undefined || c === undefined || h === undefined || alpha === undefined) return undefined
    return { l, c: Math.max(0, c), h, alpha: Math.min(1, Math.max(0, alpha)) }
  }

  /**
   * `color-mix()`'s arguments:  `in oklab, A 60%, B` (missing percentages fill to 100%;  under 100% in all scales
   * the alpha down, as CSS does);  premultiplied, in `oklab`, `oklch` (shorter hue) or `srgb`.
   */
  private static mix(body: string, resolve: (text: string) => Oklch | undefined): Oklch | undefined {
    const [space, first, second] = DesignColor.splitTop(body, ",")
    const method = /^in\s+(oklab|oklch|srgb)$/i.exec(space ?? "")?.[1]?.toLowerCase()
    if (!method || !first || !second) return undefined
    const a = DesignColor.mixArgument(first, resolve)
    const b = DesignColor.mixArgument(second, resolve)
    if (!a || !b) return undefined
    let percentA = a.percent
    let percentB = b.percent
    if (percentA === undefined && percentB === undefined) percentA = percentB = 0.5
    else if (percentA === undefined) percentA = 1 - percentB!
    else if (percentB === undefined) percentB = 1 - percentA
    const total = percentA + percentB!
    if (total <= 0) return undefined
    const weight = percentB! / total
    const scale = Math.min(1, total)
    const alpha = a.color.alpha * (1 - weight) + b.color.alpha * weight
    if (alpha <= 0) return { l: 0, c: 0, h: 0, alpha: 0 }
    if (method === "oklch") {
      const hue = DesignColor.mixHue(a.color.h, b.color.h, weight)
      return { l: premix(a.color.l, b.color.l), c: premix(a.color.c, b.color.c), h: hue, alpha: alpha * scale }
    }
    const [x1, y1, z1] = toSpace(a.color)
    const [x2, y2, z2] = toSpace(b.color)
    const mixed: [number, number, number] = [premix(x1, x2), premix(y1, y2), premix(z1, z2)]
    const color =
      method === "srgb"
        ? DesignColor.fromSrgb(mixed[0], mixed[1], mixed[2], 1)
        : DesignColor.fromOklab(mixed[0], mixed[1], mixed[2], 1)
    return { ...color, alpha: alpha * scale }

    /** One channel of `a` (`x`) and `b` (`y`) mixed by `weight`, premultiplied by their alphas. */
    function premix(x: number, y: number): number {
      return (x * a!.color.alpha * (1 - weight) + y * b!.color.alpha * weight) / alpha
    }

    /** `color` in the mixing space:  sRGB or OKLab. */
    function toSpace(color: Oklch): [number, number, number] {
      return method === "srgb" ? DesignColor.toSrgb(color) : DesignColor.toOklab(color)
    }
  }

  /** One `color-mix()` colour argument, `<colour> [<percentage>]`. */
  private static mixArgument(text: string, resolve: (text: string) => Oklch | undefined) {
    const parts = DesignColor.splitTop(text)
    const percentText = parts.find((part) => /^[\d.]+%$/.test(part))
    const colorText = parts.filter((part) => part !== percentText).join(" ")
    const color = resolve(colorText)
    if (!color) return undefined
    return { color, percent: percentText === undefined ? undefined : parseFloat(percentText) / 100 }
  }

  /** Hue `a` to `b` by `weight`, the shorter way round. */
  private static mixHue(a: number, b: number, weight: number): number {
    let delta = (((b - a) % 360) + 540) % 360
    delta -= 180
    return (a + delta * weight + 360) % 360
  }

  ////////////////
  // ## Conversions
  ////////////////

  /** sRGB channels (0..1) to OKLCH. */
  static fromSrgb(r: number, g: number, b: number, alpha: number): Oklch {
    const linear = [r, g, b].map((unit) => (unit <= 0.04045 ? unit / 12.92 : ((unit + 0.055) / 1.055) ** 2.4))
    const [lr, lg, lb] = linear as [number, number, number]
    const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb)
    const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb)
    const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb)
    return DesignColor.fromOklab(
      0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
      1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
      0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
      alpha
    )
  }

  /** OKLab to OKLCH;  a grey's hue is 0. */
  static fromOklab(l: number, a: number, b: number, alpha: number): Oklch {
    const c = Math.hypot(a, b)
    const h = c < 1e-6 ? 0 : ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360
    return { l, c, h, alpha }
  }

  /** OKLCH to OKLab `[l, a, b]`. */
  static toOklab(color: Oklch): [number, number, number] {
    const radians = (color.h * Math.PI) / 180
    return [color.l, color.c * Math.cos(radians), color.c * Math.sin(radians)]
  }

  /** OKLCH to sRGB channels `[r, g, b]` (0..1, NOT clipped). */
  static toSrgb(color: Oklch): [number, number, number] {
    const [L, a, b] = DesignColor.toOklab(color)
    const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
    const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
    const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
    const linear = [
      4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
      -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
      -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s
    ]
    return linear.map((unit) => {
      const sign = unit < 0 ? -1 : 1
      const abs = Math.abs(unit)
      return sign * (abs <= 0.0031308 ? 12.92 * abs : 1.055 * abs ** (1 / 2.4) - 0.055)
    }) as [number, number, number]
  }

  ////////////////
  // ## Text helpers
  ////////////////

  /**
   * `text` split at top-level whitespace (or `separator`), parentheses kept whole;  a top-level `/` is its own part.
   * - e.g. `from var(--x) calc(l - 0.05) c h / 0.5` => `["var(--x)", "calc(l - 0.05)", "c", "h", "/", "0.5"]`
   */
  static splitTop(text: string, separator: " " | "," = " "): string[] {
    const parts: string[] = []
    let depth = 0
    let current = ""
    for (const char of text) {
      if (char === "(") depth++
      else if (char === ")") depth--
      const splits = depth === 0 && (separator === "," ? char === "," : /\s/.test(char) || char === "/")
      if (!splits) {
        current += char
        continue
      }
      if (current.trim()) parts.push(current.trim())
      current = ""
      if (separator === " " && char === "/") parts.push("/")
    }
    if (current.trim()) parts.push(current.trim())
    return parts
  }

  /** A number or percentage (`percentOf` is 100%'s value), else `undefined`. */
  private static number(text: string, percentOf: number): number | undefined {
    const match = /^(-?(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?)(%?)$/i.exec(text.trim())
    if (!match) return undefined
    const value = parseFloat(match[1]!)
    return match[2] ? (value / 100) * percentOf : value
  }
}

/** A colour in OKLCH:  `l` 0..1, `c` 0..~0.4, `h` degrees, `alpha` 0..1. */
export type Oklch = {
  /** lightness, 0..1 */
  l: number
  /** chroma, 0..~0.4 */
  c: number
  /** hue, degrees */
  h: number
  /** opacity, 0..1 */
  alpha: number
}

/** Colour values the design-system format takes as they are:  hex, or `rgb()` / `rgba()` / `oklch()` of numbers. */
const PLAIN_COLOR = /^(#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})|(?:rgba?|oklch)\(\s*[-\d.%\s,/]+\))$/i

/****************
 * ### `ChannelMath`
 * The arithmetic in a relative colour's channels:  numbers, percentages, the base's `l` `c` `h` `alpha`, `+ - * /`,
 * parentheses, `calc()`, `min()`, `max()`, `clamp()`.
 * - A recursive-descent parser over the tokens, in `evaluate()`'s inner functions;  `DesignColor` only.
 * - STATIC and instance-free:  each call parses its own text.
 ****************/
class ChannelMath {
  /** `text` evaluated with `scope`'s channel values;  a percentage is of `percentOf`;  `undefined` if it can't be. */
  static evaluate(text: string, scope: Record<string, number>, percentOf: number): number | undefined {
    const tokens = text.match(/\d*\.?\d+(?:e-?\d+)?%?|[a-z]+|[-+*/(),]/gi)
    if (!tokens || tokens.join("").length !== text.replace(/\s+/g, "").length) return undefined
    let index = 0
    try {
      const value = expression()
      return index === tokens.length && Number.isFinite(value) ? value : undefined
    } catch {
      return undefined
    }

    /** `term (('+' | '-') term)*` */
    function expression(): number {
      let value = term()
      while (tokens![index] === "+" || tokens![index] === "-") {
        const operator = tokens![index++]
        const right = term()
        value = operator === "+" ? value + right : value - right
      }
      return value
    }

    /** `factor (('*' | '/') factor)*` */
    function term(): number {
      let value = factor()
      while (tokens![index] === "*" || tokens![index] === "/") {
        const operator = tokens![index++]
        const right = factor()
        value = operator === "*" ? value * right : value / right
      }
      return value
    }

    /** A number, a channel, a function call, a parenthesised expression or a negation. */
    function factor(): number {
      const token = tokens![index++]
      if (token === undefined) throw new Error("end")
      if (token === "-") return -factor()
      if (token === "(") {
        const value = expression()
        if (tokens![index++] !== ")") throw new Error(")")
        return value
      }
      if (/^[\d.]/.test(token)) return token.endsWith("%") ? (parseFloat(token) / 100) * percentOf : parseFloat(token)
      const name = token.toLowerCase()
      if (tokens![index] === "(") {
        index++
        const args = [expression()]
        while (tokens![index] === ",") {
          index++
          args.push(expression())
        }
        if (tokens![index++] !== ")") throw new Error(")")
        if (name === "calc" && args.length === 1) return args[0]!
        if (name === "min") return Math.min(...args)
        if (name === "max") return Math.max(...args)
        if (name === "clamp" && args.length === 3) return Math.min(Math.max(args[1]!, args[0]!), args[2]!)
        throw new Error(name)
      }
      if (name in scope) return scope[name]!
      throw new Error(name)
    }
  }
}
