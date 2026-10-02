/** @jsxImportSource react */
import React from "react"
import classnames from "classnames"

import { getPadding, getPref, setPref, resetPref } from "$/util"

import "./SplitPanel.css"

/****************
 * ### `<SplitPanel>`
 * Manages its `children` to set their sizes.
 * - Specify child sizes as EITHER `rows` or `columns` as:
 *   - `true` to give each child equal size, or
 *   - an array like: `["20%", "20%", "*", 100]`, or
 *   - a string like `30%,2em`.
 * - Panels will be sized like so:
 *   - numbers without units, or with units `px`, `em`, `rem`:  fixed size panel.
 *   - numbers with units of `%`:  will take up that percent of non-fixed space.
 *   - `*` or not specified:  Split left-over percentage of space equally amongst all `*` children.
 *   e.g. `80%,20%` (same as just `80%` for 2 panes)
 *   e.g. `*,*,200px` (same as `50%,50%,200px`)
 * - Provided `children` will be automatically wrapped in `<SplitPane>` elements,
 *   with `bordered`, `padded`, `light`, `rounded` and `scrolling` applied as set on the panel.
 *   You can manually wrap a child in a `<SplitPane>` to overide panel-level settings.
 * - If `<SplitPanel resizable />` we'll put `<SplitSizer>` elements in between provided children.
 *   If `<SplitPanel spaced />` we'll put `<SplitSpacer>` elements in between provided children,
 *   as well as add spacing around the children.
 * - Resizble `<SplitPanel>`s will automatically remember their sizes as "preferences"
 *   if you specify an `id` property.  It's up to you to make this unique for your app.
 * - If you have a pointer to a `<SplitPanel>`, you can have it `updateSizes()` with a size string.
 ****************/
export class SplitPanel extends React.Component<SplitPanelProps> {
  /** Alias for `SplitPane`, so consumers can write `<SplitPanel.Pane>`. */
  declare static Pane: typeof SplitPane
  /** Alias for `SplitSpacer`, so consumers can write `<SplitPanel.Spacer>`. */
  declare static Spacer: typeof SplitSpacer
  /** Alias for `SplitSizer`, so consumers can write `<SplitPanel.Sizer>`. */
  declare static Sizer: typeof SplitSizer

  /** Ref to the panel.  We use this to get pane elements for dynamic sizing. */
  ref = React.createRef<HTMLDivElement>()

  /** Get pointers to all of our pane elements, or an empty array if we haven't drawn yet. */
  get paneElements(): HTMLElement[] {
    if (!this.ref.current) return []
    return Array.from(this.ref.current.querySelectorAll<HTMLElement>(":scope > *[data-pane]"))
  }

  /** Get a particular panel element by `index`. */
  getPane(index: number): HTMLElement | undefined {
    return this.paneElements[index]
  }

  /** Sync pane DOM elements to `sizes` once mounted. */
  componentDidMount() {
    this.updateSizes()
  }

  /** Re-sync pane DOM elements to `sizes` after any update -- props/children may have changed. */
  componentDidUpdate() {
    this.updateSizes()
  }

  /**
   * Wrap `children` in `<SplitPane>`s (cloning `props` onto ones already provided), inserting
   * `<SplitSizer>`/`<SplitSpacer>` between them per `resizable`/`spaced`, and load initial `sizes`.
   */
  render() {
    const {
      children,
      columns, // column sizes for horizontal split, as `true`, string or array.  See `normalizeSizes()`.
      rows, // row sizes for vertical split, as `true`, string or array.  See `normalizeSizes()`.
      fluid = false, // fill container in alternate axis?
      spaced = false, // spacing around and between children. `true`, "tightly", "loosely" ???
      resizable = false, // provide resize bars.  Will store `sizes` as preference if element has an `id`.
      minSize: _minSize = 5, // minimum percent size for resizable panels

      // The following will be passed down to SplitPanes which are automatically created.
      // If you create a <SplitPane> manually, these settings are ignored.
      bordered, // panes are borderd
      padded, // padding in panes
      light, // panes appeear light
      rounded, // panes appear rounded
      scrolling, // provide scrollbars in panes

      // other props, e.g. `id`, `style`, aria-stuff, etc...
      ...renderProps
    } = this.props

    if ((!columns && !rows) || (columns && rows)) {
      console.warn("<SplitPanel>s must be initialized with exactly one of 'columns' or 'rows'.", this.props)
    }

    // Load our `sizes` or calculate based on props
    this.loadSizes()

    const className = classnames(
      {
        fluid,
        tightly: spaced === "tightly",
        loosely: spaced === "loosely",
        spaced,
        resizable
      },
      this.direction,
      "SplitPanel",
      renderProps.className
    )

    const kids: ReactNode[] = []
    const kidProps = { bordered, padded, light, rounded, scrolling }
    React.Children.forEach(children, (child, index) => {
      // add resizer or spacer
      if (index !== 0) {
        if (resizable) {
          kids.push(
            <SplitSizer key={`sizer-${index - 1}`} onMouseDown={(event) => this.onMouseDown(event, index - 1, index)} />
          )
        } else if (spaced) {
          kids.push(<SplitSpacer key={`spacer-${index}`} />)
        }
      }

      if (React.isValidElement(child) && (child.type === SplitPane || child.type === SplitPanel)) {
        const cloneProps = {
          key: `panel-${index}`,
          ...(child.type === SplitPane ? kidProps : undefined),
          ...(child.props as object),
          "data-pane": index
        }
        kids.push(React.cloneElement(child, cloneProps))
      } else {
        kids.push(
          <SplitPane key={`panel-${index}`} {...kidProps} data-pane={index}>
            {child}
          </SplitPane>
        )
      }
    })
    return (
      <div ref={this.ref} {...renderProps} className={className}>
        {kids}
      </div>
    )
  }

  ////////////////
  // ## Size logic and calculations
  ////////////////

  /**
   * Currently calculated `sizes`, updated when drawn and on resize.
   * NOTE: we don't store sizes in state because we update it during drag-resize.
   */
  sizes: PanelSize[] | undefined = undefined

  /** Return our current sizes as a string. */
  get sizeString(): string {
    if (!this.sizes) return ""
    return this.sizes.map(({ value, units }) => `${value}${units}`).join(",")
  }

  /** Preference name for our sizes.  May be `undefined`. */
  get sizesPref(): string | undefined {
    return this.props.id
  }

  /** Load normalized `sizes`, or, if not stored, calculate them based on our `props`. */
  loadSizes(): void {
    const sizesPref = this.sizesPref
    const sizeString = (sizesPref && getPref(sizesPref, undefined)) || this.props.columns || this.props.rows
    this.sizes = SplitPanel.normalizeSizes(sizeString, this.props.children)
    //console.warn(sizeString, this.sizes)
  }

  /** Reset our `sizes` to our "factory defaults". */
  resetSizes(): void {
    // clear old value
    if (this.sizesPref) resetPref(this.sizesPref)
    this.loadSizes()
    this.updateSizes()
  }

  /** Save normalized `sizes` as a preference. */
  saveSizes(): void {
    if (this.sizesPref) setPref(this.sizesPref, this.sizeString)
  }

  /**
   * Update geometry of our `paneElements` to match `sizes`.
   * Called after draw and during resize to update pane sizes.
   *
   * You can pass a string and we'll normalize for you.
   */
  updateSizes = (sizes: PanelSize[] | string | undefined = this.sizes): void => {
    let resolvedSizes: PanelSize[]
    if (typeof sizes === "string") {
      resolvedSizes = SplitPanel.normalizeSizes(sizes, this.props.children)
    } else {
      resolvedSizes = sizes || []
      if (resolvedSizes !== this.sizes) {
        this.sizes = resolvedSizes
        this.saveSizes()
      }
    }
    this.paneElements?.forEach((pane, index) => {
      const size = resolvedSizes[index]
      if (!size) return
      const { value, units } = size
      const flex = units === "%" ? `${value} ${value} 0` : `0 0 ${value}${units}`
      pane.style.flex = flex
    })
  }

  /** Matches a single size token, e.g. `20`, `20px`, `20%` -- captures numeric value and optional units. */
  static NUM_WITH_UNITS_PATTERN = /^([0-9]*\.?[0-9]+)(px|em|rem|%)?$/

  /**
   * Convert raw `startSizes` (a `columns`/`rows` spec: `true`, a `"20%,2em,*"` string, or an array)
   * into one `PanelSize` per child, padding/truncating to `children`'s count and defaulting missing
   * or unparseable entries to `*`.
   * - `*` entries share the percentage left over after fixed (`px`/`em`/`rem`) and `%` entries are subtracted.
   */
  static normalizeSizes(startSizes: unknown = [], children: ReactNode): PanelSize[] {
    // TODO: `hidden` children shouldn't be counted!
    //  BUT: make sure we keep an entry in the array for them!!!
    // TODO: take `minSize` for child elements into account
    const childCount = React.Children.count(children)

    let inputSizes: (string | number)[]
    if (typeof startSizes === "string" && startSizes) inputSizes = startSizes.split(",")
    else if (Array.isArray(startSizes)) inputSizes = startSizes as (string | number)[]
    else inputSizes = []

    const sizes: (string | number)[] = inputSizes.slice(0, childCount)
    if (sizes.length < childCount) {
      const start = sizes.length - childCount
      sizes.length = childCount
      sizes.fill("*", start)
    }

    // normalize `sizes` to `{ number, units }`
    let starCount = 0
    let percents = 0
    const normalized: { value: number | "*"; units: string }[] = sizes.map((size) => {
      if (typeof size === "number") return { value: size, units: "px" }
      if (size !== "*") {
        const match = SplitPanel.NUM_WITH_UNITS_PATTERN.exec(size)
        if (match) {
          const [, num, unitsMatch] = match
          const units = unitsMatch || "px"
          const value = parseFloat(num)
          if (units === "%") percents += value
          return { value, units }
        }
        console.warn(`Start size '${size}' not understood`)
      }
      starCount++
      return { value: "*" as const, units: "%" }
    })
    if (starCount) {
      const valuePerStar = Math.max(1, (100 - percents) / starCount)
      normalized.forEach((size) => {
        if (size.value === "*") size.value = valuePerStar
      })
    }
    return normalized as PanelSize[]
  }

  ////////////////
  // ## Event handlers and utilites for resizing
  ////////////////

  /** Return our `direction`. */
  get direction(): "horizontal" | "vertical" {
    return this.props.columns ? "horizontal" : "vertical"
  }

  /** Return min-size for one of our panels, AS A PERCENTAGE. */
  get minPercent(): number {
    return this.props.minSize || 5
  }

  /**
   * Return `dimensions` for sizing calculations, according to our `direction`.
   * Believe it or not, we actually need to figure out all of the below.
   *
   * We'll catch any errors if this throws, so don't worry if DOM is not ready etc.
   *
   * Called `onMouseDown` and cached.
   * Unfortunately, `getBoundingClientRect()` is very slow, so we can't call this every `mouseMove`.
   * That means if the window scrolls while the mouse is down, we're screwed.
   * If we need to account for that, we COULD check periodically check `window.scrollX`/`.scrollY`
   * and get the dimensions again if they change.
   */
  getSizingDimensions(pane1: number, pane2: number): SplitPanelDimensions {
    const { sizes, direction, paneElements, minPercent } = this

    const pane1El = paneElements[pane1]
    const pane2El = paneElements[pane2]

    // TODO: this will be off if CSS transform has been applied to the panel.
    const rect1 = pane1El.getBoundingClientRect()
    const rect2 = pane2El.getBoundingClientRect()

    // page min / max value in appropriate direction
    const vertical = direction === "vertical"
    const pageMin = vertical ? rect1.top : rect1.left
    const pageMax = vertical ? rect2.bottom : rect2.right

    // gap between the two elements, then gapOffset we'll use for mouse adjustments
    const gap = Math.ceil(vertical ? rect2.top - rect1.bottom : rect2.left - rect1.right)
    const gapOffset = gap / 2

    // element padding, which affects flex calculations. :-(
    const pad1 = getPadding(pane1El)[direction]
    const pad2 = getPadding(pane2El)[direction]

    // Inner size is what's actually available for resizing, accounting for gap + padding.
    const outerSize = pageMax - pageMin
    const innerSize = outerSize - gap - pad1 - pad2

    // Figure out active percentage we can update by taking out percentages allocated to other panes.
    let activePercent = (sizes || []).reduce((total, size, index) => {
      if (index === pane1 || index === pane2 || size.units !== "%") return total
      return total - size.value
    }, 100)
    // TESTME: make sure activePercent is at least minPercent * 2???
    activePercent = Math.max(activePercent, minPercent * 2)
    // max percent values for either pane
    const maxPercent = activePercent - minPercent

    // We don't need to return them all, but it's helpful for debugging to lay them all out like this
    return {
      pane1,
      pane2,
      direction,
      pageMin,
      pageMax,
      outerSize,
      innerSize,
      gap,
      gapOffset,
      pad1,
      pad2,
      activePercent,
      minPercent,
      maxPercent
    }
  }

  /**
   * Return the mouse position for resizing, relative to our `direction`.
   */
  getMousePosition(event: MouseEvent): number {
    return this.direction === "vertical" ? event.pageY : event.pageX
  }

  /** Cached dimensions calculated `onMouseDown`. */
  dimensions: SplitPanelDimensions | undefined

  /**
   * `onMouseDown` `event` handler.  This just sets things up.
   */
  onMouseDown = (event: React.MouseEvent<HTMLDivElement>, pane1: number, pane2: number): void => {
    // Calculate sizing dimensions up-front, so mousemove can be fast.
    try {
      this.dimensions = this.getSizingDimensions(pane1, pane2)
      console.info("<SplitPanel> onMouseDown:", "\n\tpanel:", this, "\n\tdimensions: ", this.dimensions)
    } catch (e) {
      console.error("<SplitPanel> got error figuring dimensions:", e)
      return
    }
    // add mouseup / mousemove event handlers to actualy do the work
    document.addEventListener("mouseup", this.onMouseUp)
    document.addEventListener("mousemove", this.onMouseMove)
    // we got this
    event.preventDefault()
    event.stopPropagation()
  }

  /**
   * `onMouseMove` `event` handler. This does the actual resizing.
   */
  onMouseMove = (event: MouseEvent): void => {
    const { dimensions, sizes } = this
    if (!dimensions || !sizes) return
    const { pane1, pane2, pageMin, gapOffset, innerSize, activePercent, minPercent, maxPercent } = dimensions
    const mousePosition = this.getMousePosition(event)
    // if either of these is not a number, we can't figure anything out
    if (isNaN(innerSize) || isNaN(mousePosition)) return
    // adjust global mouse coordinate for panel start + gap, so gap is centered under the mouse
    const adjustedMousePosition = mousePosition - pageMin - gapOffset
    // get raw value for first pane
    let pane1Value = (adjustedMousePosition * activePercent) / innerSize
    // round and clamp value between minPercent and maxPercent
    pane1Value = Math.min(maxPercent, Math.max(minPercent, pane1Value))
    // go to 2 digits of precision
    pane1Value = Math.round(pane1Value * 100) / 100
    // other pane gets what's left, also with 2 digits of precision
    const pane2Value = Math.round((activePercent - pane1Value) * 100) / 100
    // actually adjust the sizes
    const newSizes = sizes.map((size, index) => {
      if (index === pane1) return { ...size, value: pane1Value, units: "%" }
      if (index === pane2) return { ...size, value: pane2Value, units: "%" }
      return size
    })
    this.updateSizes(newSizes)
    // console.info({ mousePosition, adjustedMousePosition, innerSize, activePercent, pane1Value, pane2Value })
  }

  /**
   * `onMouseUp` `event` handler. This cleans things up.
   */
  onMouseUp = (_event: MouseEvent): void => {
    console.info("<SplitPanel> onMouseUp: new sizes", this.sizes)
    // Clean up event handlers
    document.removeEventListener("mouseup", this.onMouseUp)
    document.removeEventListener("mousemove", this.onMouseMove)
  }
}

////////////////
// ## Sub-components
////////////////

/** Props for `<SplitPane>`. */
export type SplitPaneProps = React.ComponentPropsWithoutRef<"div"> & {
  /** Pane content. */
  children?: ReactNode
  /** Add border around pane. */
  bordered?: boolean
  /** Add padding: `true`, `"tightly"` or `"loosely"`. */
  padded?: boolean | "tightly" | "loosely"
  /** Show white background and shadow. */
  light?: boolean
  /** Round corners. */
  rounded?: boolean
  /** Add auto-scrolling. */
  scrolling?: boolean
}

/****************
 * ### `<SplitPane>`
 * Single pane in a `<SplitPanel />`.
 * You don't need to create these, but you can if you want one particular panel
 * to override `bordered` etc set at the panel-level.
 ****************/
export class SplitPane extends React.PureComponent<SplitPaneProps> {
  /** Render pane `div`, translating `bordered`/`padded`/`light`/`rounded`/`scrolling` into classNames. */
  render() {
    const {
      children,
      bordered = false, // add border
      padded = false, // add padding, `true`, `tightly` or loosely`
      light = false, // show white background and shadow
      rounded = false, // round corners
      scrolling = false, // add auto-scrolling
      ...props // including `id`, `style`, `className` (dealt with below), aria stuff...
    } = this.props

    const className = classnames(
      {
        bordered,
        tightly: padded === "tightly",
        loosely: padded === "loosely",
        padded,
        light,
        rounded,
        scrolling
      },
      "SplitPanelPane",
      props.className // put provided className at the end so it will win
    )
    return (
      <div {...props} className={className}>
        {children}
      </div>
    )
  }
}
SplitPanel.Pane = SplitPane

/****************
 * ### `<SplitSpacer>`
 * Spacer auto-added between elements for `<SplitPanel spaced />` if not `resizable`.
 ****************/
export function SplitSpacer() {
  return <div className="Spacer" />
}
SplitPanel.Spacer = SplitSpacer

/** Props for `<SplitSizer>`. */
export type SplitSizerProps = {
  /** `onMouseDown` handler; `<SplitPanel>` wires this up to start a resize drag. */
  onMouseDown: (event: React.MouseEvent<HTMLDivElement>) => void
}

/****************
 * ### `<SplitSizer>`
 * Sizer auto-added between elements for `<SplitPanel resizable />`.
 ****************/
export function SplitSizer({ onMouseDown }: SplitSizerProps) {
  return <div className="SplitPanelSizer" onMouseDown={onMouseDown} />
}
SplitPanel.Sizer = SplitSizer

// TODO:
// - Check `hidden` of childen and drop as necessary (must be set in <SplitPanel> context).
// - SplitPanel: `minSize` and/or `maxSizes` as percentage.
// - SplitPane: `collapsible`
// - SplitPane `fixed` so never resizable?
// - Responsive sizing or alternative layouts for devices.
// - `position:absolute` on pane child is a bit dodgy... ??
// - test sizing logic in other browsers

/** Props for `<SplitPanel>`. */
export type SplitPanelProps = React.ComponentPropsWithoutRef<"div"> & {
  /** Children, auto-wrapped in `<SplitPane>` unless already one (or another `<SplitPanel>`). */
  children?: ReactNode
  /** Column sizes for horizontal split, as `true`, string or array.  See `normalizeSizes()`. */
  columns?: PanelSizeSpec
  /** Row sizes for vertical split, as `true`, string or array.  See `normalizeSizes()`. */
  rows?: PanelSizeSpec
  /** Fill container in alternate axis. */
  fluid?: boolean
  /** Spacing around and between children.  `true`, `"tightly"` or `"loosely"`. */
  spaced?: boolean | "tightly" | "loosely"
  /** Provide resize bars.  Will store `sizes` as preference if element has an `id`. */
  resizable?: boolean
  /** Minimum percent size for resizable panels. */
  minSize?: number

  // The following will be passed down to SplitPanes which are automatically created.
  // If you create a <SplitPane> manually, these settings are ignored.
  /** Panes are bordered. */
  bordered?: boolean
  /** Padding in panes. */
  padded?: boolean | "tightly" | "loosely"
  /** Panes appear light. */
  light?: boolean
  /** Panes appear rounded. */
  rounded?: boolean
  /** Provide scrollbars in panes. */
  scrolling?: boolean
}

/** `columns`/`rows` size spec: `true` for equal sizes, a `"20%,2em,*"` string, or an array of sizes. */
type PanelSizeSpec = boolean | string | Array<string | number>

/**
 * A single normalized panel size, e.g. `{ value: 20, units: "%" }`.
 */
type PanelSize = {
  /** Numeric magnitude, interpreted per `units`. */
  value: number
  /** `px`, `em`, `rem` or `%`. */
  units: string
}

/** Sizing geometry calculated `onMouseDown`, used to do fast `onMouseMove` math. */
type SplitPanelDimensions = {
  /** Index of first pane in resize pair. */
  pane1: number
  /** Index of second pane in resize pair. */
  pane2: number
  /** Panel's `direction`, cached for the drag. */
  direction: "horizontal" | "vertical"
  /** Page-coordinate start of resize region (`pane1`'s `top`/`left`). */
  pageMin: number
  /** Page-coordinate end of resize region (`pane2`'s `bottom`/`right`). */
  pageMax: number
  /** `pageMax - pageMin`. */
  outerSize: number
  /** Space actually usable for resizing, after subtracting `gap` and padding. */
  innerSize: number
  /** Gap between the two panes, in pixels. */
  gap: number
  /** Half of `gap`, so the gap stays centered under the mouse while dragging. */
  gapOffset: number
  /** `pane1`'s padding along `direction`. */
  pad1: number
  /** `pane2`'s padding along `direction`. */
  pad2: number
  /** Total percent available to redistribute between `pane1`/`pane2`. */
  activePercent: number
  /** Minimum percent size for a pane, from panel's `minSize`. */
  minPercent: number
  /** Maximum percent one pane can take: `activePercent - minPercent`. */
  maxPercent: number
}
