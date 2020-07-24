import React from "react"
import classnames from "classnames"

import { getPadding, getPref, setPref, resetPref } from "~/util"
import "./SplitPanel.less"

// TODO:
// - drag resize
// - If SplitPanel has an `id`, retain dragged-size
// - SplitPane: `collapsible`
// - SplitPane: `min-` and/or `max-sizes`. as `[ { size, min, max }... ]`
// - Responsive sizing or alternative layouts for devices
// - Special case a <SplitPanel> inside another <SplitPanel/> ?
// - Check `hidden` of childen and drop as necessary
// - position:absolute on pane child is a bit dodgy... ??

/**
 * A `<SplitPanel>` manages its `children` to set their sizes.
 *
 * Specify child sizes as one of `rows` or `columns` as:
 *  - `true` to give each child equal size, or
 *  - an array like: `["20%", "20%", "*", 100]`, or
 *  - a string like `30%,2em`.
 *
 * In those sizes, panels will be sized:
 *  - numbers without units, or with units `px`, `em`, `rem`:  fixed size panel.
 *  - numbers with units of `%`:  will take up that percent of avaliable space.
 *  - `*` or not specified:  Split left-over percentage of space equally amongst all `*` children.
 * If percentages don't match up to 100%, all `%` or `*` values will be adjusted up or down.
 *
 * Provided `children` will be automatically wrapped in `<SplitPane>` elements,
 * with `bordered`, `padded`, `raised`, `rounded` and `scrolling` applied as set on the panel.
 * You can manually wrap a child in a `<SplitPane>` to overide panel-level settings.
 *
 * If `<SplitPanel resizable />` we'll put `<SplitSizer>` elements in between provided children.
 * If `<SplitPanel spaced />` we'll put `<SplitSpacer>` elements in between provided children.
 * as well as add spacing around the children.
 */
export class SplitPanel extends React.Component {
  /** Ref to the panel.  We use this to get pane elements for dynamic sizing. */
  ref = React.createRef()

  /**
   * Currently calculated sizes.
   * NOTE: we don't store sizes in state because we update it during drag-resize.
   */
  sizes = undefined

  /** Return our current sizes as a string. */
  get sizeString() {
    if (!this.sizes) return ""
    return this.sizes.map(({ value, units }) => `${value}${units}`).join(",")
  }

  /** Preference name for our sizes.  May be `undefined`. */
  get prefName() {
    return this.props.id
  }

  /** Load normalized `sizes`, or, if not stored, calculate them based on our `props`. */
  loadSizes() {
    const sizeString = (this.prefName && getPref(this.prefName)) || this.props.columns || this.props.rows
    this.sizes = SplitPanel.normalizeSizes(sizeString, this.props.children)
    //console.warn(sizeString, this.sizes)
    return this.sizes
  }

  /**
   * Reset our `sizes` to our "factory defaults".
   * Returns the new `sizes`.
   */
  resetSizes() {
    // clear old value
    if (this.prefName) resetPref(this.prefName)
    return this.loadSizes()
  }

  /** Save normalized `sizes` as a preference. */
  saveSizes() {
    if (this.prefName) setPref(this.prefName, this.sizeString)
  }

  /** Return our `direction`. */
  get direction() {
    return this.props.columns ? "horizontal" : "vertical"
  }

  /** Get pointers to all of our pane elements, or an empty array if we haven't drawn yet. */
  get paneElements() {
    return this.ref.current?.querySelectorAll(":scope > *[data-pane]") || []
  }

  /** Get a particular panel element by `index`. */
  getPane(index) {
    return this.paneElements[index]
  }

  /** Return min-size for one of our panels, AS A PERCENTAGE. */
  get minPercent() {
    return this.props.minSize || 5
  }

  /**
   * Update geometry of our `paneElements` to match normalized `sizes`.
   *
   * By default, we do use calculated `sizes` for this,
   * during resize the `<PanelSizer>` element will call this automatically.
   *
   * If we have an `id` prop, we'll save the sizes as `prefs`,
   * so we can restore the sizes later.
   */
  updateSizes = (sizes = this.sizes) => {
    if (sizes !== this.sizes) {
      this.sizes = sizes
      this.saveSizes()
    }
    this.paneElements.forEach((pane, index) => {
      const size = sizes[index]
      if (!size) return
      const { value, units } = size
      const flex = units === "%" ? `${value} ${value} 0` : `0 0 ${value}${units}`
      pane.style.flex = flex
    })
  }

  componentDidMount() {
    this.updateSizes()
  }

  componentDidUpdate() {
    this.updateSizes()
  }

  render() {
    const {
      children,
      columns, // column sizes for horizontal split, as `true`, string or array.  See `normalizeSizes()`.
      rows, // row sizes for vertical split, as `true`, string or array.  See `normalizeSizes()`.
      fluid = false, // fill container in alternate axis?
      spaced = false, // spacing around and between children. `true`, "slightly", "very" ???
      resizable = false, // provide resize bars.  Will store `sizes` as preference if element has an `id`.
      minSize = 5, // minimum percent size for resizable panels

      // The following will be passed down to SplitPanes which are automatically created.
      // If you create a <SplitPane> manually, these settings are ignored.
      bordered, // panes are borderd
      padded, // padding in panes
      raised, // panes appeear raised
      rounded, // panes appear rounded
      scrolling, // provide scrollbars in panes

      // other props, e.g. `id`, `style`, aria-stuff, etc...
      ...renderProps
    } = this.props

    if ((!columns && !rows) || (columns && rows)) {
      console.warn("<SplitPanel>s must be initialized with exactly one of 'columns' or 'rows'.", props)
    }

    // Load our `sizes` or calculate based on props
    this.loadSizes()

    renderProps.ref = this.ref
    renderProps.className = classnames(
      {
        fluid,
        tightly: spaced === "tightly",
        very: spaced === "very",
        spaced,
        resizable
      },
      this.direction,
      "SplitPanel",
      renderProps.className
    )

    const kids = []
    const kidProps = { bordered, padded, raised, rounded, scrolling }
    React.Children.forEach(children, (child, index) => {
      // add resizer or spacer
      if (index !== 0) {
        if (resizable) {
          kids.push(
            <SplitSizer
              key={`sizer-${index - 1}`}
              pane1={index - 1}
              pane2={index}
              panel={this}
              updateSizes={this.updateSizes}
            />
          )
        } else if (spaced) {
          kids.push(<SplitSpacer key={`spacer-${index}`} />)
        }
      }

      if (child.type === SplitPane || child.type === SplitPanel) {
        const cloneProps = {
          key: `panel-${index}`,
          ...(child.type === SplitPane ? kidProps : undefined),
          ...child.props,
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
      <div ref={this.ref} {...renderProps}>
        {kids}
      </div>
    )
  }

  /**
   * Utility method to convert `sizes` to css `flex` property.
   */
  static NUM_WITH_UNITS_PATTERN = /^([0-9]*\.?[0-9]+)(px|em|rem|%)?$/
  static normalizeSizes(startSizes = [], children) {
    // TODO: `hidden` children shouldn't be counted!
    //  BUT: make sure we keep an entry in the array for them!!!
    // TODO: take `minSize` for child elements into account
    const childCount = React.Children.count(children)

    if (typeof startSizes === "string") startSizes = startSizes.split(",")
    else if (!Array.isArray(startSizes)) startSizes = []

    let sizes = startSizes.slice(0, childCount)
    if (sizes.length < childCount) {
      const start = sizes.length - childCount
      sizes.length = childCount
      sizes.fill("*", start)
    }

    // normalize `sizes` to `{ number, units }`
    let starCount = 0
    let percents = 0
    sizes = sizes.map((size) => {
      if (typeof size === "number") return { value: size, units: "px" }
      if (size !== "*") {
        try {
          let [_, num, units = "px"] = SplitPanel.NUM_WITH_UNITS_PATTERN.exec(size)
          const value = parseFloat(num, 10)
          if (units === "%") percents += value
          return { value, units }
        } catch (e) {
          console.warn(`Start size '${size}' not understood`)
        }
      }
      starCount++
      return { value: "*", units: "%" }
    })
    if (starCount) {
      const valuePerStar = Math.max(1, (100 - percents) / starCount)
      sizes.forEach((size) => {
        if (size.value === "*") size.value = valuePerStar
      })
    }
    return sizes
  }
}

/**
 * Single pane in a `<SplitPanel />`.
 * You don't need to create these, but you can if you want one particular panel
 * to override `bordered` etc set at the panel-level.
 */
export class SplitPane extends React.PureComponent {
  render() {
    const {
      children,
      bordered = false, // add border
      padded = false, // add padding, `true`, `slightly` or very`
      raised = false, // show white background and shadow
      rounded = false, // round corners
      scrolling = false, // add auto-scrolling
      ...props // including `id`, `style`, `className` (dealt with below), aria stuff...
    } = this.props

    props.className = classnames(
      {
        bordered,
        tightly: padded === "tightly",
        very: padded === "very",
        padded,
        raised,
        rounded,
        scrolling
      },
      "SplitPanel-pane",
      props.className // put provided className at the end so it will win
    )
    return <div {...props}>{children}</div>
  }
}
SplitPanel.Pane = SplitPane

/**
 * Spacer auto-added between elements for `<SplitPanel spaced />`
 */
export function SplitSpacer() {
  return <div className="SplitPanel-spacer" />
}
SplitPanel.Spacer = SplitSpacer

/**
 * Sizer auto-added between elements for `<SplitPanel resizable />`.
 */
export class SplitSizer extends React.PureComponent {
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
  getSizingDimensions() {
    const { panel, pane1, pane2 } = this.props
    const { sizes, direction, paneElements, minPercent } = panel

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
    let activePercent = sizes.reduce((total, size, index) => {
      if (index === pane1 || index === pane2 || size.units !== "%") return total
      return total - size.value
    }, 100)
    // TESTME: make sure activePercent is at least minPercent * 2???
    activePercent = Math.max(activePercent, minPercent * 2)
    // max percent values for either pane
    const maxPercent = activePercent - minPercent

    // We don't need to return them all, but it's helpful for debugging to lay them all out like this
    return {
      direction,
      sizes,
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
  getMousePosition(event) {
    return this.dimensions.direction === "vertical" ? event.pageY : event.pageX
  }

  /**
   * `onMouseDown` `event` handler.  This just sets things up.
   */
  onMouseDown = (event) => {
    // Calculate sizing dimensions up-front, so mousemove can be fast.
    try {
      this.dimensions = this.getSizingDimensions()
      console.info("<SplitSizer> onMouseDown", { dimensions: this.dimensions, panel: this.props.panel })
    } catch (e) {
      console.error("<SplitPanel.Sizer> got error figuring dimensions:", e)
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
  onMouseMove = (event) => {
    const { pane1, pane2, updateSizes } = this.props
    const { pageMin, gapOffset, innerSize, activePercent, minPercent, maxPercent, sizes } = this.dimensions
    const mousePosition = this.getMousePosition(event)
    // if either of these is not a number, we can't figure anything out
    if (isNaN(innerSize) || isNaN(mousePosition)) return
    // adjust global mouse coordinate for panel start + gap, so gap is centered under the mouse
    let adjustedMousePosition = mousePosition - pageMin - gapOffset
    // get raw value for first pane
    let pane1Value = (adjustedMousePosition * activePercent) / innerSize
    // round and clamp value between minPercent and maxPercent
    pane1Value = Math.min(maxPercent, Math.max(minPercent, pane1Value))
    // go to 2 digits of precision
    pane1Value = Math.round(pane1Value * 100) / 100
    // other pane gets what's left, also with 2 digits of precision
    const pane2Value = Math.round((activePercent - pane1Value) * 100) / 100
    // actually adjust the sizes
    this.dimensions.sizes = sizes.map((size, index) => {
      if (index === pane1) return { ...size, value: pane1Value, units: "%" }
      if (index === pane2) return { ...size, value: pane2Value, units: "%" }
      return size
    })
    updateSizes(this.dimensions.sizes)
    // console.info({ mousePosition, adjustedMousePosition, innerSize, activePercent, pane1Value, pane2Value })
  }

  /**
   * `onMouseUp` `event` handler. This cleans things up.
   */
  onMouseUp = (event) => {
    console.info("<SplitSizer> onMouseUp: sizes", this.dimensions.sizes)
    // Clean up event handlers
    document.removeEventListener("mouseup", this.onMouseUp)
    document.removeEventListener("mousemove", this.onMouseMove)
  }

  render() {
    return <div className="SplitPanel-sizer" onMouseDown={this.onMouseDown} />
  }
}
SplitPanel.Sizer = SplitSizer
