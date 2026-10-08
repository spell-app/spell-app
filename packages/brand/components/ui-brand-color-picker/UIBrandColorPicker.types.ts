/**
 * Constants and types of the `ui-brand-color-picker` family:  what its component and its native fallback share.
 * - Data only:  nothing here runs.
 */

import type { brandColorPickerVocabulary } from "./UIBrandColorPicker.vocabulary.en"

/** `brandColorPickerVocabulary`'s type. */
export type BrandColorPickerVocabulary = typeof brandColorPickerVocabulary

/** The class words the component adds after the noun:  `picker brand color`. */
export const BRAND_COLOR = "brand color"

/** Colour without a `value`:  House of Owen, the brand's seed (the Color Set Chooser's starting colour). */
export const DEFAULT_VALUE = "#8E96B5"

// ## The square

/** Arrow-key steps on the square, saturation and lightness (0-1):  small, and with Shift. */
export const STEPS = { small: 0.01, big: 0.1 } as const

/** Saturation under which a colour counts as grey:  its hue is meaningless, so the picker keeps the one it had. */
export const GREY = 0.0005

// ## Rows

/** What a row copies, and `ui-copy`'s `format`:  `hsl(...)`, `#RRGGBB`, `oklch(...)`. */
export type CopyFormat = "hsl" | "hex" | "oklch"

/** One text input of a row;  also its vocabulary text key (its name), except `rgb`. */
export type FieldKey = "hslH" | "hslS" | "hslL" | "rgb" | "oklchL" | "oklchC" | "oklchH"

/** A row's input:  which, and the unit shown after it (`°`, `%`). */
export type RowField = { key: FieldKey; suffix?: string }

/** A format row:  what it copies, its label's text key, its inputs. */
export type Row = { format: CopyFormat; label: "hsl" | "rgb" | "oklch"; fields: readonly RowField[] }

/** The rows, in order:  HSL (H°, S%, L%), RGB (the hex), OKLCH (L%, C, H). */
export const ROWS: readonly Row[] = [
  {
    format: "hsl",
    label: "hsl",
    fields: [
      { key: "hslH", suffix: "°" },
      { key: "hslS", suffix: "%" },
      { key: "hslL", suffix: "%" }
    ]
  },
  { format: "hex", label: "rgb", fields: [{ key: "rgb" }] },
  { format: "oklch", label: "oklch", fields: [{ key: "oklchL", suffix: "%" }, { key: "oklchC" }, { key: "oklchH" }] }
]

/** Text typed in the fields and not committed yet, by field;  absent:  showing the value. */
export type Drafts = Partial<Record<FieldKey, string>>

/** Icon of a copy button (the original's `fa-regular fa-copy`). */
export const COPY_ICON = "copy outline"

/** Icon a copy button shows for a moment after it copied. */
export const COPIED_ICON = "check"

/** How long a copy button shows its check, ms (as `<ui-brand-color>`'s). */
export const COPIED_MS = 1400

// ## Markup

/** Shadow classes, one per part (the vocabulary's part names). */
export const CLASSES = {
  head: "head",
  chip: "chip",
  readout: "readout",
  hex: "hex",
  actions: "actions",
  section: "section",
  label: "label",
  value: "value",
  plane: "plane",
  marker: "marker",
  axis: "axis",
  hue: "hue",
  rows: "rows",
  row: "row",
  rowLabel: "row-label",
  field: "field",
  segment: "segment",
  input: "input",
  suffix: "suffix",
  copy: "copy",
  copied: "copied",
  status: "status",
  families: "families",
  error: "error"
} as const

/** Private tokens the element writes inline:  the marker's place, the hue, the current colour. */
export const VARS = {
  x: "--_brand-color-picker-x",
  y: "--_brand-color-picker-y",
  hue: "--_brand-color-picker-hue",
  color: "--_brand-color-picker-color"
} as const

/** Keys the square and the fields take. */
export const KEYS = {
  up: "ArrowUp",
  down: "ArrowDown",
  left: "ArrowLeft",
  right: "ArrowRight",
  pageUp: "PageUp",
  pageDown: "PageDown",
  home: "Home",
  end: "End",
  enter: "Enter",
  escape: "Escape"
} as const
