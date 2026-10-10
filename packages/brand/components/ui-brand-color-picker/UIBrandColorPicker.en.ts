/**
 * Every name `<ui-brand-color-picker>` uses:  tag, attributes, events, slots, parts, states, texts.  Schema:
 * `E.ComponentVocabulary`.
 * - Pure data:  `import type` only.
 * - Class words:  `disabled` emits its name.  The component adds `brand color` before the noun (`brand color picker`).
 */

import type { E } from "$/ui/core"

/****************
 * ### `<ui-brand-color-picker>`
 * An inline colour picker, the brand's (Color Set Chooser's "Choose a colour"):  a head row (chip + hex),
 * a hue slider, an HSL SQUARE for that hue (saturation across, lightness up), then HSL, RGB and OKLCH rows,
 * each with a copy button.  Not a popover itself:  a page puts it in a `<ui-popup>` or `<dialog>`.
 ****************/
export const brandColorPickerVocabulary = {
  tag: "ui-brand-color-picker",
  topics: ["inputs", "forms", "controls", "selection"],
  aka: ["color picker", "colour picker", "color chooser", "hsl picker", "swatch picker", "eyedropper", "color input"],
  skeleton: "27 tall",
  noun: "picker",
  ui: false,
  description:
    "A brand color picker chooses a colour on an HSL square and a hue slider, or by typing HSL, hex or OKLCH;  " +
    "each format copies.",
  attributes: [
    {
      name: "value",
      kind: "string",
      description:
        "The colour, `#RRGGBB` (upper-case;  anything the hex field accepts is read:  `#abc`, `142 150 181`, " +
        "`hsl(250 54% 55%)`, `oklch(67.7% 0.047 274)`).  Reflects;  default `#8E96B5`.  The attribute's FIRST value " +
        "is the form's reset value."
    },
    { name: "name", kind: "string", description: "Form field name:  the form gets `value`." },
    {
      name: "required",
      kind: "boolean",
      description:
        "Form validation:  a colour must be chosen, by the page (`value`) or by picking one.  " +
        "Unset, it shows `#8E96B5` but counts as no value (`valueMissing`)."
    },
    {
      name: "label",
      kind: "string",
      description: "Name of the picker for screen readers (its group);  default:  what names it, else `Colour`."
    },
    { name: "disabled", kind: "keyOnly", description: "Faded;  nothing in it can be used (copying neither)." }
  ],
  events: [
    {
      name: "ui-input",
      detail: "{ value: string, originalEvent?: Event }",
      description:
        "The colour changed while choosing:  each drag step, hue step, key or valid keystroke.  A handler that " +
        "re-sets `value` wins."
    },
    {
      name: "ui-change",
      detail: "{ value: string, originalEvent?: Event }",
      description:
        "A choice was committed:  a drag or hue drag ends, a key on the square, Enter or leaving a field -- when the " +
        "colour differs from the last commit."
    },
    {
      name: "ui-copy",
      detail: '{ value: string, format: "hsl" | "hex" | "oklch", originalEvent?: Event }',
      description: "A row's copy button wrote `value` to the clipboard:  `hsl(...)`, `#RRGGBB` or `oklch(...)`."
    }
  ],
  slots: [
    { name: "", description: "Content under the rows, e.g. family chips (`Or start from a family`)." },
    { name: "header", description: "Above the hex in the head row, e.g. a title (`Choose a colour`)." },
    { name: "actions", description: "At the far end of the head row, e.g. a close button." }
  ],
  parts: [
    { name: "picker", description: "The picker box." },
    { name: "head", description: "The head row:  chip, readouts, actions." },
    { name: "chip", description: "The chip of the current colour." },
    { name: "hex", description: "The hex readout in the head row." },
    { name: "plane", description: "The HSL square:  saturation across, lightness up (CSS gradients over the hue)." },
    { name: "marker", description: "The round marker at the current saturation and lightness." },
    { name: "hue", description: "The hue slider, a native `<input type=range>`." },
    { name: "row", description: "Each format row (HSL, RGB, OKLCH):  label, inputs, copy button." },
    { name: "hsl", description: "Each HSL input (H, S, L)." },
    { name: "rgb", description: "The hex input." },
    { name: "oklch", description: "Each OKLCH input (L, C, H)." },
    { name: "copy", description: "Each row's copy button (circular, an icon)." },
    { name: "families", description: "The box around the default slot." }
  ],
  states: [
    { name: "disabled", description: "Can't be used." },
    { name: "dragging", description: "The square's marker is being dragged." },
    { name: "copied", description: "Just copied:  for about 1.4 seconds after a copy button." },
    { name: "invalid", description: "Fails validation (`required`), once a person has interacted." }
  ],
  texts: [
    { key: "group", text: "Colour", description: "The picker's name, when nothing else names it." },
    { key: "plane", text: "Saturation × Lightness", description: "Heading of the square." },
    { key: "planeValue", text: "S {s}% · L {l}%", description: "The square's readout." },
    { key: "planeRole", text: "2D slider", description: "Role description of the square's two hidden sliders." },
    { key: "saturation", text: "Saturation", description: "Name of the square's left / right slider." },
    { key: "lightness", text: "Lightness", description: "Name of the square's up / down slider." },
    { key: "percent", text: "{value}%", description: "A spoken percentage." },
    { key: "hue", text: "Hue", description: "Name of the hue slider." },
    { key: "hueValue", text: "{h}°", description: "The hue readout;  `{h}` degrees." },
    { key: "hsl", text: "HSL", description: "Label of the HSL row." },
    { key: "rgb", text: "RGB", description: "Label of the RGB (hex) row." },
    { key: "oklch", text: "OKLCH", description: "Label of the OKLCH row." },
    { key: "rgbPlaceholder", text: "#8E96B5 or 142 150 181", description: "Placeholder of the hex input." },
    { key: "hslH", text: "HSL hue, 0–360°", description: "Name of the HSL row's H input." },
    { key: "hslS", text: "HSL saturation, 0–100%", description: "Name of the HSL row's S input." },
    { key: "hslL", text: "HSL lightness, 0–100%", description: "Name of the HSL row's L input." },
    { key: "oklchL", text: "OKLCH lightness, 0–100%", description: "Name of the OKLCH row's L input." },
    { key: "oklchC", text: "OKLCH chroma, 0–0.4", description: "Name of the OKLCH row's C input." },
    { key: "oklchH", text: "OKLCH hue, 0–360°", description: "Name of the OKLCH row's H input." },
    { key: "copy", text: "Copy {format}", description: "A copy button's name;  `{format}` the row's label." },
    { key: "copied", text: "Copied {value}", description: "Announced after a copy." }
  ]
} as const satisfies E.ComponentVocabulary
