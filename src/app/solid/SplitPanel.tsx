import { For, Show, children, createEffect, omit, onCleanup } from "solid-js"
import type { JSX } from "@solidjs/web"

import { editorPrefs } from "spell-app/app/editorPrefs"

import "./spell.css"
import "./SplitPanel.css"

/****************
 * ### `<SplitPanel>`
 * Lays its `children` out in a row (`columns`) or a column (`rows`) of panes, sized as `columns` / `rows` say.
 * - `resizable` puts a bar between each two, which you drag to resize them.
 * - Its look:  `SplitPanel.css`.
 * - Sizes, as EITHER `rows` or `columns`:
 *   - `true`:  every pane the same size
 *   - an array, e.g. `["20%", "20%", "*", 100]`, or a string, e.g. `"30%,2em"`
 *   - a number, or `px` / `em` / `rem`:  a fixed size
 *   - `%`:  that share of the space the fixed panes leave
 *   - `*`, or missing:  an equal share of the percent left
 *   - `auto`:  as big as its content, shrinking when there's no room;  a drag fixes it, in px
 *     - e.g. `"80%"` ~== `"80%,20%"` for two panes, `"*,*,200px"` ~== `"50%,50%,200px"`
 * - A child that draws nothing (a `<Show>` that's off) is no pane:  e.g. the run page's console, while hidden.
 * - Each child becomes a pane:
 *   wrapped in a `<SplitPane>` with the panel's `bordered`, `padded`, `light`, `rounded` and `scrolling`.
 *   - A child that IS a `<SplitPane>` (its own look) or a nested `<SplitPanel>` is a pane as it is.
 *   - NOTE: one pane per DOM node the children draw:
 *     a child component drawing two top-level nodes makes two panes.  The editor's panes each draw one `<div>`.
 * - `spaced`:  room around the panes, and a spacer between them unless `resizable`.
 * - With an `id`, a resizable panel remembers its sizes as the editor's preference `spellEditor:<id>`:
 *   make the id unique in the app.
 * - Sizes are applied as each pane's inline `flex`, NOT drawn by Solid:  a drag rewrites them on every mouse move.
 * - SEE:  its App UI components page, `app/docs/SplitPanel.html` (`/components/app/SplitPanel.html`).
 ****************/
export function SplitPanel(props: SplitPanelProps) {
  let panel: HTMLDivElement | undefined
  const kids = children(() => props.children)
  // a child that draws nothing, e.g. a `<Show>` that's off, is no pane:  the others share its space
  const panes = () => kids.toArray().filter((kid) => kid != null && kid !== false && kid !== "")
  /** Sizes now, one per pane.  NOT a signal:  a drag rewrites them on every mouse move. */
  let sizes: PanelSize[] = []
  /** What a drag works from, measured when it starts. */
  let dragging: SplitPanelDimensions | undefined

  // size the panes once drawn, and again when their number or the size spec changes
  createEffect(
    () => ({ count: panes().length, columns: props.columns, rows: props.rows, id: props.id }),
    ({ count, columns, rows, id }) => {
      if (!columns === !rows) console.warn("<SplitPanel>s need exactly one of 'columns' or 'rows'.", id)
      const stored = id ? editorPrefs.get<string>(id) : undefined
      apply(normalizeSizes(stored || (columns ?? rows), count), false)
    }
  )
  onCleanup(stopDragging)

  return (
    <div
      ref={(element) => {
        panel = element
      }}
      {...omit(props, ...PANEL_PROPS, "class", "children")}
      class={[
        "SplitPanel",
        props.columns ? "horizontal" : "vertical",
        {
          fluid: !!props.fluid,
          spaced: !!props.spaced,
          tightly: props.spaced === "tightly",
          loosely: props.spaced === "loosely",
          resizable: !!props.resizable
        },
        props.class
      ]}
    >
      <For each={panes()}>
        {(child, index) => (
          <>
            <Show when={index() > 0}>
              <Show
                when={props.resizable}
                fallback={
                  <Show when={props.spaced}>
                    <SplitSpacer />
                  </Show>
                }
              >
                <SplitSizer onMouseDown={(event) => startDragging(event, index() - 1, index())} />
              </Show>
            </Show>
            {isPane(child) ? (
              child
            ) : (
              <SplitPane
                bordered={props.bordered}
                padded={props.padded}
                light={props.light}
                rounded={props.rounded}
                scrolling={props.scrolling}
              >
                {child}
              </SplitPane>
            )}
          </>
        )}
      </For>
    </div>
  )

  /** The panes, in order:  wrapped children, `<SplitPane>`s and nested `<SplitPanel>`s. */
  function paneElements(): HTMLElement[] {
    return panel ? ([...panel.children].filter(isPane) as HTMLElement[]) : []
  }

  /**
   * Make `next` the sizes:  each pane's inline `flex`.
   * - `save`:  remember them as the `id` preference, e.g. after a drag.
   */
  function apply(next: PanelSize[], save = true) {
    sizes = next
    if (save && props.id) editorPrefs.set(props.id, sizeString(sizes))
    paneElements().forEach((pane, index) => {
      const size = sizes[index]
      if (!size) return
      pane.style.flex =
        size.units === "%"
          ? `${size.value} ${size.value} 0`
          : size.units === AUTO
            ? "0 1 auto"
            : `0 0 ${size.value}${size.units}`
      pane.classList.toggle(FIT_CLASS, size.units === AUTO)
    })
  }

  /**
   * A sizer's `mousedown`:  measure the two panes it sits between, then follow the mouse until it's let go.
   * - Measures ONCE, here:  `getBoundingClientRect()` is too slow for every mouse move.
   *   So scrolling the page mid-drag would throw it off.
   */
  function startDragging(event: MouseEvent, pane1: number, pane2: number) {
    try {
      const direction = props.columns ? "horizontal" : "vertical"
      const mouse = direction === "vertical" ? event.pageY : event.pageX
      dragging = measure(paneElements(), sizes, pane1, pane2, direction, minPercent(), mouse)
    } catch (error) {
      console.error("<SplitPanel> couldn't measure its panes:", error)
      return
    }
    document.addEventListener("mousemove", drag)
    document.addEventListener("mouseup", stopDragging)
    event.preventDefault()
    event.stopPropagation()
  }

  /**
   * `mousemove` while dragging:  resize the two panes so the gap between them follows the mouse,
   * held where it was grabbed (near an edge of the gap, it stays near that edge:  no jump on the first move).
   */
  function drag(event: MouseEvent) {
    if (!dragging) return
    const { pane1, pane2, direction, pageMin, grabOffset, innerSize, activePercent, minPercent, maxPercent } = dragging
    const mouse = direction === "vertical" ? event.pageY : event.pageX
    if (isNaN(innerSize) || isNaN(mouse)) return
    // a fixed-size pane (`380px`) stays fixed:  it takes the move in px, the share beside it the rest,
    // so no other pane moves (switching it to a share moved the others:  a jump on the first move)
    const fixed = [pane1, pane2].find((index) => sizes[index]?.units !== "%")
    if (fixed !== undefined) {
      const { mouseStart, size1, size2 } = dragging
      const moved = mouse - mouseStart
      const start = fixed === pane1 ? size1 : size2
      const value = Math.round(Math.min(size1 + size2, Math.max(0, fixed === pane1 ? start + moved : start - moved)))
      apply(sizes.map((size, index) => (index === fixed ? { value, units: "px" } : size)))
      return
    }
    // the first pane's share, clamped, to 2 decimals;  the second gets what's left
    let value1 = ((mouse - pageMin - grabOffset) * activePercent) / innerSize
    value1 = Math.round(Math.min(maxPercent, Math.max(minPercent, value1)) * 100) / 100
    const value2 = Math.round((activePercent - value1) * 100) / 100
    apply(
      sizes.map((size, index) => {
        if (index === pane1) return { value: value1, units: "%" }
        if (index === pane2) return { value: value2, units: "%" }
        return size
      })
    )
  }

  /** `mouseup`, or unmounted:  stop following the mouse. */
  function stopDragging() {
    const wasDragging = !!dragging
    dragging = undefined
    document.removeEventListener("mousemove", drag)
    document.removeEventListener("mouseup", stopDragging)
    if (wasDragging) props.onDragged?.(paneElements())
  }

  /** Smallest share a pane may have, in percent. */
  function minPercent() {
    return props.minSize || 5
  }
}

/** Props for `<SplitPanel>`:  these, plus any `<div>` attribute. */
export type SplitPanelProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> & {
  /** The panes:  any content, one pane per node it draws. */
  children?: JSX.Element
  /** Sizes across, for panes side by side:  `true`, a string or an array.  See `<SplitPanel>`. */
  columns?: PanelSizeSpec
  /** Sizes down, for panes one above the other:  `true`, a string or an array.  See `<SplitPanel>`. */
  rows?: PanelSizeSpec
  /** Fill the container the other way. */
  fluid?: boolean
  /** Room around and between the panes:  `true`, `"tightly"` or `"loosely"`. */
  spaced?: boolean | "tightly" | "loosely"
  /** Bars to drag between the panes;  sizes remembered under `id`. */
  resizable?: boolean
  /** A drag between two panes ended:  the panes, in order, at their new sizes. */
  onDragged?: (panes: HTMLElement[]) => void
  /** Smallest share a pane may be dragged to, in percent.  Default:  `5`. */
  minSize?: number
  /** Wrapped panes are bordered. */
  bordered?: boolean
  /** Padding in wrapped panes:  `true`, `"tightly"` or `"loosely"`. */
  padded?: boolean | "tightly" | "loosely"
  /** Wrapped panes are light. */
  light?: boolean
  /** Wrapped panes are rounded. */
  rounded?: boolean
  /** Wrapped panes scroll. */
  scrolling?: boolean
}

/** `<SplitPanel>`'s own props, never passed to the `<div>`. */
const PANEL_PROPS = [
  "columns",
  "rows",
  "fluid",
  "spaced",
  "resizable",
  "minSize",
  "bordered",
  "padded",
  "light",
  "rounded",
  "scrolling"
] as const

/****************
 * ### `<SplitPane>`
 * One pane of a `<SplitPanel>`:  write one yourself to give a pane its own look.
 * - Else the panel wraps each child in one.
 * - Its one child fills it (`SplitPanel.css`).
 ****************/
export function SplitPane(props: SplitPaneProps) {
  return (
    <div
      {...omit(props, "bordered", "padded", "light", "rounded", "scrolling", "class", "children")}
      class={[
        "SplitPanelPane",
        {
          bordered: !!props.bordered,
          padded: !!props.padded,
          tightly: props.padded === "tightly",
          loosely: props.padded === "loosely",
          light: !!props.light,
          rounded: !!props.rounded,
          scrolling: !!props.scrolling
        },
        props.class
      ]}
    >
      {props.children}
    </div>
  )
}

/** Props for `<SplitPane>`:  these, plus any `<div>` attribute. */
export type SplitPaneProps = JSX.HTMLAttributes<HTMLDivElement> & {
  /** A border around the pane. */
  bordered?: boolean
  /** Padding:  `true`, `"tightly"` or `"loosely"`. */
  padded?: boolean | "tightly" | "loosely"
  /** White background and a shadow. */
  light?: boolean
  /** Round corners. */
  rounded?: boolean
  /** Scrolls its content. */
  scrolling?: boolean
}

/****************
 * ### `<SplitSpacer>`
 * Room between two panes of a `spaced`, not `resizable`, `<SplitPanel>`.
 ****************/
export function SplitSpacer() {
  return <div class="Spacer" />
}

/****************
 * ### `<SplitSizer>`
 * The bar between two panes of a `resizable` `<SplitPanel>`:  drag it to resize them.
 ****************/
export function SplitSizer(props: { onMouseDown: (event: MouseEvent) => void }) {
  return <div class="SplitPanelSizer" onMouseDown={(event) => props.onMouseDown(event)} />
}

////////////////
// ## Sizes
////////////////

/** `columns` / `rows`:  `true` for equal sizes, a `"20%,2em,*"` string, or an array of sizes. */
export type PanelSizeSpec = boolean | string | Array<string | number>

/** One pane's size, e.g. `{ value: 20, units: "%" }`. */
export type PanelSize = {
  /** How much, in `units`. */
  value: number
  /** `px`, `em`, `rem`, `%` or `auto` (its `value` unused). */
  units: string
}

/** A pane as big as its content:  the units of its `PanelSize`, and how a spec says it. */
const AUTO = "auto"
/** Class of an `auto` pane:  its child laid out in it, not over it (`SplitPanel.css`), so it has a height to fit. */
const FIT_CLASS = "fit"

/** One size in a spec:  a number with optional units, e.g. `20`, `20px`, `20%`. */
const NUM_WITH_UNITS = /^([0-9]*\.?[0-9]+)(px|em|rem|%)?$/

/**
 * One `PanelSize` per pane from `spec` (`columns` / `rows`, or a stored preference).
 * - Cut or padded to `count`:  a missing or unreadable entry counts as `*`.
 * - `*` entries share the percent the `%` entries leave, equally (at least 1% each).
 */
export function normalizeSizes(spec: unknown, count: number): PanelSize[] {
  let input: (string | number)[]
  if (typeof spec === "string" && spec) input = spec.split(",")
  else if (Array.isArray(spec)) input = spec as (string | number)[]
  else input = []
  const raw: (string | number)[] = input.slice(0, count)
  while (raw.length < count) raw.push("*")

  let stars = 0
  let percents = 0
  const sizes = raw.map((size): { value: number | "*"; units: string } => {
    if (typeof size === "number") return { value: size, units: "px" }
    if (size.trim() === AUTO) return { value: 0, units: AUTO }
    if (size !== "*") {
      const match = NUM_WITH_UNITS.exec(size.trim())
      if (match) {
        const units = match[2] || "px"
        const value = parseFloat(match[1])
        if (units === "%") percents += value
        return { value, units }
      }
      console.warn(`<SplitPanel> size '${size}' not understood`)
    }
    stars++
    return { value: "*", units: "%" }
  })
  const perStar = Math.max(1, (100 - percents) / Math.max(stars, 1))
  return sizes.map(({ value, units }) => ({ value: value === "*" ? perStar : value, units }))
}

/** `sizes` as a spec string, e.g. `"60%,40%"`:  how a preference stores them. */
function sizeString(sizes: PanelSize[]): string {
  return sizes.map(({ value, units }) => (units === AUTO ? AUTO : `${value}${units}`)).join(",")
}

/** Is `node` a pane of a `<SplitPanel>` as it is:  a `<SplitPane>`, or a nested `<SplitPanel>`? */
function isPane(node: unknown): node is HTMLElement {
  return (
    node instanceof HTMLElement && (node.classList.contains("SplitPanelPane") || node.classList.contains("SplitPanel"))
  )
}

/**
 * What a drag between `pane1` and `pane2` works from, measured from the DOM.
 * - Throws if the panes aren't drawn:  `startDragging()` catches it.
 * - TODO: off if a CSS transform applies to the panel.
 */
function measure(
  panes: HTMLElement[],
  sizes: PanelSize[],
  pane1: number,
  pane2: number,
  direction: "horizontal" | "vertical",
  minPercent: number,
  mouse: number
): SplitPanelDimensions {
  const rect1 = panes[pane1].getBoundingClientRect()
  const rect2 = panes[pane2].getBoundingClientRect()
  const vertical = direction === "vertical"
  // page coordinates:  the mouse's `pageX` / `pageY` are too
  const scroll = vertical ? window.scrollY : window.scrollX
  const pageMin = (vertical ? rect1.top : rect1.left) + scroll
  const pageMax = (vertical ? rect2.bottom : rect2.right) + scroll
  // the gap between the panes
  const gap = Math.ceil(vertical ? rect2.top - rect1.bottom : rect2.left - rect1.right)
  // padding counts in the panes' `flex` sizes
  const pad1 = padding(panes[pane1], vertical)
  const pad2 = padding(panes[pane2], vertical)
  const innerSize = pageMax - pageMin - gap - pad1 - pad2
  // the percent the two share:  100, less the other `%` panes'
  const othersPercent = sizes.reduce(
    (total, size, index) => (index === pane1 || index === pane2 || size.units !== "%" ? total : total + size.value),
    0
  )
  const activePercent = Math.max(100 - othersPercent, minPercent * 2)
  return {
    pane1,
    pane2,
    direction,
    pageMin,
    mouseStart: mouse,
    size1: vertical ? rect1.height : rect1.width,
    size2: vertical ? rect2.height : rect2.width,
    // where in the gap the mouse took hold, from the first pane's far edge
    grabOffset: mouse - ((vertical ? rect1.bottom : rect1.right) + scroll),
    innerSize,
    activePercent,
    minPercent,
    maxPercent: activePercent - minPercent
  }
}

/**
 * `element`'s padding along a direction, px:  top + bottom when `vertical`, else left + right.
 * - Read from `getComputedStyle()` directly:  `spell/util`'s old `getPadding()` read `NaN` in the browser test project.
 */
function padding(element: HTMLElement, vertical: boolean): number {
  const style = getComputedStyle(element)
  return vertical
    ? parseFloat(style.paddingTop) + parseFloat(style.paddingBottom)
    : parseFloat(style.paddingLeft) + parseFloat(style.paddingRight)
}

/** What a drag works from, measured once when it starts (`measure()`). */
type SplitPanelDimensions = {
  /** Index of the pane before the sizer. */
  pane1: number
  /** Index of the pane after it. */
  pane2: number
  /** Across (`horizontal`) or down (`vertical`). */
  direction: "horizontal" | "vertical"
  /** Page coordinate where `pane1` starts. */
  pageMin: number
  /** Where the mouse was when the drag started, page px. */
  mouseStart: number
  /** `pane1`'s size when the drag started, px. */
  size1: number
  /** `pane2`'s size when the drag started, px. */
  size2: number
  /** Where the mouse took hold of the gap, from the first pane's far edge:  kept as it moves. */
  grabOffset: number
  /** Room the two panes share, less the gap and their padding, px. */
  innerSize: number
  /** Percent the two panes share. */
  activePercent: number
  /** Smallest share either may have, percent. */
  minPercent: number
  /** Largest share either may have:  `activePercent - minPercent`. */
  maxPercent: number
}
