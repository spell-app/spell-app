import { omit } from "solid-js"
import type { JSX } from "@solidjs/web"

import "./spell.css"
import "./SpellPage.css"

/****************
 * ### `<SpellPage>`
 * A whole page's box:  look variants (bordered, dark, light, rounded, spaced, padded, scrolling) and, with `rows` /
 * `columns`, a flexbox laying `children` out down or across the page.  Look:  `SpellPage.css`.
 * - Every other prop (`id`, `style`, `aria-*` ...) goes to the `<div>`.
 ****************/
export function SpellPage(props: SpellPageProps) {
  return (
    <div
      {...omit(props, ...VARIANTS, "class", "children")}
      class={[
        "SpellPage",
        {
          bordered: !!props.bordered,
          dark: !!props.dark,
          "fill-window": !!props.fillWindow,
          light: !!props.light,
          rounded: !!props.rounded,
          spaced: !!props.spaced,
          padded: !!props.padded,
          scrolling: !!props.scrolling,
          rows: !!props.rows,
          columns: !!props.columns
        },
        props.class
      ]}
    >
      {props.children}
    </div>
  )
}

/** Props for `<SpellPage>`:  these, plus any `<div>` attribute. */
export type SpellPageProps = JSX.HTMLAttributes<HTMLDivElement> & {
  /** Bordered variant. */
  bordered?: boolean
  /** Dark variant. */
  dark?: boolean
  /** Fill the window:  `position: absolute`, `100vw` x `100vh`. */
  fillWindow?: boolean
  /** Light variant. */
  light?: boolean
  /** Rounded variant. */
  rounded?: boolean
  /** Spacing around the page. */
  spaced?: boolean
  /** Padding inside the page. */
  padded?: boolean
  /** Scrolls its content. */
  scrolling?: boolean
  /** Lay `children` out in rows, down the page (flexbox). */
  rows?: boolean
  /** Lay `children` out in columns, across the page (flexbox). */
  columns?: boolean
}

/** `<SpellPage>`'s own props:  the look, never passed to the `<div>`. */
const VARIANTS = [
  "bordered",
  "dark",
  "fillWindow",
  "light",
  "rounded",
  "spaced",
  "padded",
  "scrolling",
  "rows",
  "columns"
] as const
