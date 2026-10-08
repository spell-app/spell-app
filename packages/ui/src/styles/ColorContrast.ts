import type { Oklch } from "./styles.types"

/****************
 * ### `ColorContrast`
 * WCAG 2 contrast of OKLCH colours, in plain JS.
 * - Why data, not CSS:  `contrast-color()` is Chromium-only, and a lightness step function
 *   (`clamp(0, (0.72 - l) * 1000, 1)`) guesses wrong for mid-lightness hues (white on L 0.66 green is 2.9:1).
 *   So `StyleGenerator` picks each colour's `--ui-<name>-on` foreground HERE, at generation time.
 * - Out-of-gamut colours are CLIPPED per sRGB channel, as axe-core does (`toGamut({ method: "clip" })`) --
 *   so a ratio computed here is the ratio axe reports.
 * - Pure and STATIC (math on its arguments, no state):  imports only `styles.types` (types), so it runs in node
 *   (`yarn gen:styles`) and in the browser tests.
 ****************/
export class ColorContrast {
  /** WCAG AA minimum for body text (1.4.3). */
  static readonly text = 4.5

  /** WCAG AA minimum for large text (1.4.3) and UI component boundaries (1.4.11). */
  static readonly large = 3

  /** Contrast ratio of `a` and `b`, `1..21`, order-free. */
  static ratio(a: Oklch, b: Oklch): number {
    const [lighter, darker] = [ColorContrast.luminance(a), ColorContrast.luminance(b)].sort((x, y) => y - x)
    return (lighter! + 0.05) / (darker! + 0.05)
  }

  /** WCAG relative luminance of `color`, `0..1`. */
  static luminance(color: Oklch): number {
    const [red, green, blue] = ColorContrast.linearSrgb(color)
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue
  }

  /**
   * Linear-light sRGB channels of `color`, each clipped to `0..1`.
   * - OKLCH -> OKLab -> LMS -> linear sRGB, Björn Ottosson's matrices (the ones CSS Color 4 uses).
   * - NOTE: clipping in linear light ~== clipping gamma-encoded channels:  the transfer function maps
   *   `0` -> `0` and `1` -> `1` and is monotonic.
   */
  static linearSrgb([lightness, chroma, hue]: Oklch): [red: number, green: number, blue: number] {
    const radians = (hue * Math.PI) / 180
    const a = chroma * Math.cos(radians)
    const b = chroma * Math.sin(radians)
    const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3
    const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3
    const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3
    return [
      ColorContrast.clip(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
      ColorContrast.clip(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
      ColorContrast.clip(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s)
    ]
  }

  /** `value` clamped to `0..1`. */
  private static clip(value: number): number {
    return Math.min(1, Math.max(0, value))
  }
}
