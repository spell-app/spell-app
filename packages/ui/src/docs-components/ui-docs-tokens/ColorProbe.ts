import { FALLBACK_HEX } from "./ui-docs-tokens.types"

/****************
 * ### `ColorProbe`
 * Colour tokens' CURRENT values as `#rrggbb`, for the playground's native colour inputs, which take nothing else.
 * - Resolves where the tokens are used:  a hidden probe element per value inside `context` gets `color: <value>`, and
 *   its computed colour (an `oklch()`, `color(srgb ...)` ...) is painted on a 1px canvas and read back as sRGB.
 * - Batched:  every probe goes in, THEN every colour is read, so a table of 200 colours costs one style recalc.
 * - Lossy on purpose:  alpha is flattened onto the page background and wide-gamut colours clip, both the native
 *   input's limits.  The token keeps its real value until the person picks a colour.
 * - Scheme:  `light-dark()` resolves in `context`'s scheme at the time of the probe.
 * - Static:  one 1px canvas for the page, made on first use.
 ****************/
export class ColorProbe {
  /**
   * Each of `values` (key => any CSS colour, `var()` included) as `#rrggbb`, resolved in `context`.
   * - A translucent colour is painted over `backdrop` (default the page background), so the input shows what the
   *   reader sees, not the bare (often black) ink an alpha role is made of.
   */
  static hexesFor(
    context: Element | ShadowRoot,
    values: ReadonlyMap<string, string>,
    backdrop: string = BACKDROP
  ): Map<string, string> {
    const probes = new Map<string, HTMLElement>()
    for (const [key, value] of [...values, [BACKDROP_KEY, backdrop] as const]) {
      const probe = document.createElement("span")
      probe.hidden = true
      probe.style.color = value
      probes.set(key, probe)
    }
    context.append(...probes.values())
    const colors = new Map([...probes].map(([key, probe]) => [key, getComputedStyle(probe).color]))
    for (const probe of probes.values()) probe.remove()
    const under = colors.get(BACKDROP_KEY)
    colors.delete(BACKDROP_KEY)
    return new Map([...colors].map(([key, color]) => [key, ColorProbe.hexFor(color, under)]))
  }

  /**
   * A computed colour as `#rrggbb`:  painted on the canvas (over `backdrop`, if given) and read back;  `FALLBACK_HEX`
   * if it can't be.
   */
  static hexFor(color: string, backdrop?: string): string {
    const canvas = ColorProbe.canvas()
    if (!canvas || !color) return FALLBACK_HEX
    canvas.clearRect(0, 0, 1, 1)
    if (backdrop) {
      canvas.fillStyle = backdrop
      canvas.fillRect(0, 0, 1, 1)
    }
    canvas.fillStyle = FALLBACK_HEX
    canvas.fillStyle = color
    canvas.fillRect(0, 0, 1, 1)
    const [red, green, blue, alpha] = canvas.getImageData(0, 0, 1, 1).data
    if (!alpha) return FALLBACK_HEX
    return `#${[red!, green!, blue!].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`
  }

  ////////////////
  // ## Internal
  ////////////////

  /** The 1px canvas the colours are painted on;  `undefined` before the first probe, or where there's no 2D context. */
  private static context: CanvasRenderingContext2D | undefined

  /** The canvas was made (whether or not it gave a 2D context):  never tried twice. */
  private static hasTriedCanvas = false

  /** The shared 1px canvas, made on first use. */
  private static canvas(): CanvasRenderingContext2D | undefined {
    if (!ColorProbe.hasTriedCanvas) {
      ColorProbe.hasTriedCanvas = true
      const canvas = document.createElement("canvas")
      canvas.width = canvas.height = 1
      // `getContext()` says "none" with `null`
      ColorProbe.context = canvas.getContext("2d", { willReadFrequently: true }) ?? undefined
    }
    return ColorProbe.context
  }
}

/** What `ColorProbe` paints a translucent colour over:  the page background, where the token is used. */
const BACKDROP = "var(--ui-background, white)"

/** `ColorProbe`'s key for the backdrop's own probe;  never a token name. */
const BACKDROP_KEY = " backdrop"
