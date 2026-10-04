/**
 * Shared types and constants of `$/brand`:  the colour model and ladders (`Palette`).
 * - Runtime-light:  data only.
 */

// ## Colour

/** An sRGB colour, each channel 0-1 (outside it:  out of gamut). */
export type Rgb = [number, number, number]

/** An OKLCH colour:  Lightness 0-1, Chroma 0-~0.37, Hue in degrees. */
export type Oklch = { l: number; c: number; h: number }

/** An HSL colour (sRGB's own cylinder):  Hue in degrees, Saturation 0-1, Lightness 0-1. */
export type Hsl = { h: number; s: number; l: number }

/** What `Palette.format()` writes:  `#AABBCC`, `oklch(67.7% 0.047 274)` or `hsl(227 21% 63%)`. */
export type ColorFormat = "hex" | "oklch" | "hsl"

// ## Ladders

/** The 17 steps of every ladder, lightest first;  fine at both ends. */
export const STEPS = [25, 50, 75, 100, 150, 200, 300, 400, 500, 600, 700, 800, 850, 900, 925, 950, 975] as const

/** One ladder step:  `25` ... `975`. */
export type Step = (typeof STEPS)[number]

/** Target lightness per step (the neutral ladder;  a chromatic set bends it toward its seed). */
export const LADDER: Readonly<Record<Step, number>> = {
  25: 0.992,
  50: 0.979,
  75: 0.965,
  100: 0.948,
  150: 0.922,
  200: 0.892,
  300: 0.82,
  400: 0.72,
  500: 0.63,
  600: 0.55,
  700: 0.47,
  800: 0.39,
  850: 0.345,
  900: 0.3,
  925: 0.265,
  950: 0.225,
  975: 0.175
}

/** Chroma per step, relative to the seed's at 500 (1 = the seed's). */
export const CHROMA: Readonly<Record<Step, number>> = {
  25: 0.1,
  50: 0.16,
  75: 0.22,
  100: 0.29,
  150: 0.4,
  200: 0.52,
  300: 0.74,
  400: 0.93,
  500: 1,
  600: 0.97,
  700: 0.88,
  800: 0.76,
  850: 0.68,
  900: 0.6,
  925: 0.53,
  950: 0.46,
  975: 0.36
}

/** A ladder:  step -> `#AABBCC`. */
export type Scale = Record<Step, string>

/**
 * How `Palette.generateScale()` bends a ladder.
 * - `anchor`:  the step the seed lands on;  absent:  the step nearest the seed's lightness
 * - `chromaScale`:  1 = the seed's colourfulness;  the Color Set Chooser's "Vibrancy" (100% = 1)
 * - `hueShift`:  degrees added toward the dark end;  the Chooser's "Hue drift toward dark"
 */
export type ScaleOptions = { anchor?: Step; chromaScale?: number; hueShift?: number }

/** One named colour set, as `lib/palette.json` holds it. */
export type ColorSet = {
  /** `brand`, `accent`, `violet` ... */
  name: string
  /** `Brand`, `Violet` ... */
  label: string
  /** where the seed comes from, e.g. a paint colour */
  note?: string
  /** the seed, `#AABBCC` */
  seed: string
  /** the step the seed sits at */
  anchor: Step
  /** the 17 steps */
  scale: Scale
}
