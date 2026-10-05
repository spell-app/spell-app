import type { FlourishColors, FlourishVariant, Point } from "./ui-brand-flourish.types"

/****************
 * ### `Flourish`
 * The brand's procedural "swoops and blobs" (Claude Design's `lib/spell-flourish.js`, `<spell-flourish>`):  SVG markup
 * for a box `width` x `height`, from a variant and a seed.
 * - Seeded (mulberry32):  the same seed draws the same flourish;  another seed, another one.
 * - Curves through points:  Catmull-Rom turned into cubic Béziers (`smooth()`).
 * - Variants:  `blobs` (soft shapes in two corners), `swoop` (a wave with a loop), `edge-curls` (lines curling in
 *   from the edges), `sparkle-trail` (a dotted trail ending in four-point sparkles), `rising-wave` (a filled wave
 *   rising to the right).
 * - Pure:  strings in, a string out;  no DOM.
 ****************/
export class Flourish {
  /** The `<svg>`'s inner markup for `variant` in a `width` x `height` box. */
  static draw(variant: FlourishVariant, width: number, height: number, seed: number, colors: FlourishColors): string {
    const random = Flourish.random(seed)
    switch (variant) {
      case "blobs":
        return Flourish.blobs(width, height, random, colors)
      case "edge-curls":
        return Flourish.edgeCurls(width, height, random, colors)
      case "sparkle-trail":
        return Flourish.sparkleTrail(width, height, random, colors)
      case "rising-wave":
        return Flourish.risingWave(width, height, colors)
      default:
        return Flourish.swoop(width, height, random, colors)
    }
  }

  ////////////////
  // ## Variants
  ////////////////

  private static blobs(W: number, H: number, random: () => number, c: FlourishColors): string {
    const m = Math.min(W, H)
    return (
      `<path d="${Flourish.blob(W * 0.96, H * 1.08, m * 0.78, random, 8)}" fill="${c.fill}"/>` +
      `<path d="${Flourish.blob(-W * 0.04, -H * 0.1, m * 0.5, random, 7)}" fill="${c.fill2}"/>` +
      `<path d="${Flourish.blob(W * 0.62, -H * 0.12, m * 0.2, random, 6)}" fill="${c.fill}" opacity=".55"/>`
    )
  }

  private static swoop(W: number, H: number, random: () => number, c: FlourishColors): string {
    const d = Flourish.wave(W, H, random, {
      y0: H * 0.62,
      y1: H * 0.3,
      amp: H * 0.08,
      loopAt: 0.5 + (random() - 0.5) * 0.2,
      loopR: Math.min(W, H) * 0.12
    })
    return `<path d="${d}" fill="none" stroke="${c.stroke}" stroke-width="${c.weight}" stroke-linecap="round" stroke-linejoin="round"/>`
  }

  private static edgeCurls(W: number, H: number, random: () => number, c: FlourishColors): string {
    const m = Math.min(W, H)
    // a top-right arc entering and curling
    const arc: Point[] = []
    for (let i = 0; i <= 60; i++) {
      const t = i / 60
      const angle = Math.PI * (0.9 + 1.5 * t)
      const r = m * (0.75 - 0.5 * t)
      arc.push([W * 0.98 + Math.cos(angle) * r * 1.3, H * 0.2 + Math.sin(angle) * r])
    }
    // a bottom-left sweep, and a wave on the right edge
    const sweep: Point[] = [
      [-W * 0.05, H * 0.55],
      [W * 0.08, H * 0.7],
      [W * 0.18, H * 0.92],
      [W * 0.26, H * 1.08]
    ]
    const edge: Point[] = [
      [W * 1.04, H * 0.62],
      [W * 0.86, H * 0.7],
      [W * 0.82, H * 0.86],
      [W * 0.95, H * 0.98],
      [W * 1.1, H * 0.96]
    ]
    const lines = [arc, sweep, edge]
      .map((points) => Flourish.smooth(points))
      .map((d) => `<path d="${d}" fill="none" stroke="${c.stroke}" stroke-width="${c.weight}" stroke-linecap="round"/>`)
    return lines.join("") + `<path d="${Flourish.blob(-W * 0.04, H * 1.02, m * 0.26, random, 7)}" fill="${c.fill}"/>`
  }

  private static sparkleTrail(W: number, H: number, random: () => number, c: FlourishColors): string {
    const line = Flourish.wave(W * 0.78, H, random, {
      y0: H * 0.82,
      y1: H * 0.28,
      amp: H * 0.05,
      loopAt: 0.62,
      loopR: Math.min(W, H) * 0.08,
      count: 700
    })
    const x = W * 0.8
    const y = H * 0.26
    return (
      `<path d="${line}" fill="none" stroke="${c.stroke}" stroke-width="${c.weight}" stroke-linecap="round" stroke-dasharray="0.1 ${c.weight * 3.2}" opacity=".9"/>` +
      `<path d="${Flourish.sparkle(x + 26, y - 10, 22)}" fill="${c.stroke}"/>` +
      `<path d="${Flourish.sparkle(x + 66, y - 44, 11)}" fill="${c.stroke}" opacity=".75"/>` +
      `<path d="${Flourish.sparkle(x + 62, y + 22, 8)}" fill="${c.stroke}" opacity=".55"/>`
    )
  }

  private static risingWave(W: number, H: number, c: FlourishColors): string {
    const rise: Point[] = [
      [W * 0.38, H * 1.05],
      [W * 0.55, H * 0.86],
      [W * 0.78, H * 0.74],
      [W * 1.05, H * 0.5]
    ]
    const fill = `${Flourish.smooth(rise)}L${Flourish.round(W * 1.05)},${Flourish.round(H * 1.05)}Z`
    const echo = Flourish.smooth([
      [W * 0.28, H * 1.04],
      [W * 0.5, H * 0.78],
      [W * 0.75, H * 0.64],
      [W * 1.04, H * 0.36]
    ])
    return (
      `<path d="${fill}" fill="${c.fill}"/>` +
      `<path d="${echo}" fill="none" stroke="${c.stroke}" stroke-width="${c.weight}" stroke-linecap="round" opacity=".8"/>`
    )
  }

  ////////////////
  // ## Shapes
  ////////////////

  /** A seeded random number generator (mulberry32):  0 <= n < 1. */
  private static random(seed: number): () => number {
    let a = seed >>> 0 || 1
    return () => {
      a |= 0
      a = (a + 0x6d2b79f5) | 0
      let t = Math.imul(a ^ (a >>> 15), 1 | a)
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
  }

  /** `n` to one decimal place, for compact path data. */
  private static round(n: number): number {
    return Math.round(n * 10) / 10
  }

  /** A smooth path through `points` (Catmull-Rom as cubic Béziers);  `closed` joins the ends. */
  private static smooth(points: Point[], closed = false, k = 1): string {
    const r = Flourish.round
    const P = closed
      ? [points[points.length - 1]!, ...points, points[0]!, points[1]!]
      : [points[0]!, ...points, points[points.length - 1]!]
    let d = `M${r(P[1]![0])},${r(P[1]![1])}`
    for (let i = 1; i < P.length - 2; i++) {
      const [p0, p1, p2, p3] = [P[i - 1]!, P[i]!, P[i + 1]!, P[i + 2]!]
      d +=
        `C${r(p1[0] + ((p2[0] - p0[0]) / 6) * k)},${r(p1[1] + ((p2[1] - p0[1]) / 6) * k)} ` +
        `${r(p2[0] - ((p3[0] - p1[0]) / 6) * k)},${r(p2[1] - ((p3[1] - p1[1]) / 6) * k)} ${r(p2[0])},${r(p2[1])}`
    }
    return closed ? `${d}Z` : d
  }

  /** A soft closed blob around (`cx`, `cy`), radius about `radius`, through `count` wobbling points. */
  private static blob(cx: number, cy: number, radius: number, random: () => number, count = 7): string {
    const points: Point[] = []
    const offset = random() * Math.PI
    for (let i = 0; i < count; i++) {
      const angle = offset + (i / count) * Math.PI * 2
      const r = radius * (0.78 + random() * 0.38)
      points.push([cx + Math.cos(angle) * r, cy + Math.sin(angle) * r * (0.82 + random() * 0.2)])
    }
    return Flourish.smooth(points, true)
  }

  /** The brand's four-point sparkle at (`x`, `y`), radius `r`. */
  private static sparkle(x: number, y: number, r: number): string {
    const f = Flourish.round
    return (
      `M${f(x)},${f(y - r)}Q${f(x)},${f(y)} ${f(x + r)},${f(y)}Q${f(x)},${f(y)} ${f(x)},${f(y + r)}` +
      `Q${f(x)},${f(y)} ${f(x - r)},${f(y)}Q${f(x)},${f(y)} ${f(x)},${f(y - r)}Z`
    )
  }

  /** A rightward wave from height `y0` to `y1`, `amp` high, with a loop of radius `loopR` at `loopAt` (0-1). */
  private static wave(
    W: number,
    _H: number,
    random: () => number,
    { y0, y1, amp, loopAt = 0.45, loopR = 0, count = 900 }: WaveOptions
  ): string {
    const points: string[] = []
    const phase = random() * Math.PI * 2
    for (let i = 0; i <= count; i++) {
      const t = i / count
      let x = -0.04 * W + t * W * 1.08
      let y = y0 + (y1 - y0) * t + amp * Math.sin(t * Math.PI * 1.6 + phase)
      if (loopR) {
        const span = 0.07
        const u = (t - (loopAt - span / 2)) / span
        if (u > 0 && u < 1) {
          x += loopR * 1.15 * Math.sin(u * Math.PI * 2)
          y -= loopR * (1 - Math.cos(u * Math.PI * 2))
        }
      }
      points.push(`${Flourish.round(x)},${Flourish.round(y)}`)
    }
    return `M${points.join("L")}`
  }
}

/** `Flourish.wave()`'s shape:  start / end height, amplitude, the loop, how many points. */
type WaveOptions = { y0: number; y1: number; amp: number; loopAt?: number; loopR?: number; count?: number }
