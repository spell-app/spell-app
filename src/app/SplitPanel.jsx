import React from "react"
import classnames from "classnames"

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
  ref = React.createRef()
  // NOTE: we don't store sizes in state because we update it frequently
  sizes = undefined

  componentDidMount() {
    this.updateSizes()
  }

  componentDidUpdate() {
    this.updateSizes()
  }

  get direction() {
    return this.props.columns ? "horizontal" : "vertical"
  }

  get panes() {
    return this.ref.current?.querySelectorAll(":scope > *[data-pane]") || []
  }

  get sizers() {
    return this.ref.current?.querySelectorAll(":scope > .SplitPanel-sizer") || []
  }

  updateSizes(sizes = this.sizes) {
    if (sizes !== this.sizes) this.sizes = sizes
    this.panes.forEach((pane, index) => {
      const size = sizes[index]
      if (!size) return
      const { value, units } = size
      const flex = units === "%" ? `${value} ${value} 0` : `0 0 ${value}${units}`
      pane.style.flex = flex
    })
  }

  render() {
    const {
      children,
      columns, // column sizes for horizontal split, as `true`, string or array.  See `normalizeSizes()`.
      rows, // row sizes for vertical split, as `true`, string or array.  See `normalizeSizes()`.
      fluid = false, // fill container in alternate axis?
      spaced = false, // spacing around and between children. `true`, "slightly", "very" ???
      resizable = false, // provide resize bars.  Will store `sizes` as preference if element has an `id`.

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
    this.sizes = SplitPanel.normalizeSizes(columns || rows, children)

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
          kids.push(<SplitSizer key={`sizer-${index - 1}`} index={index - 1} panel={this} />)
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
 * ASSUMES resizable <SplitPanel>s HAVE EXACTLY 2 CHILDREN!
 */
export class SplitSizer extends React.PureComponent {
  get minSize() {
    return 100
  }
  get direction() {
    return this.props.panel.direction
  }

  get panelEl() {
    return this.props.panel.ref?.current
  }

  /** Return element for pane by index, */
  getPane(index = this.props.index) {
    return this.props.panel.panes[index]
  }

  getDimensions(event) {
    const pane1 = this.getPane(this.props.index)?.getBoundingClientRect()
    const pane2 = this.getPane(this.props.index + 1)?.getBoundingClientRect()
    if (!pane1 || !pane2) return {}

    const vertical = this.direction === "vertical"
    const dimensions = {
      minSize: this.minSize,
      panelMin: Math.round(vertical ? pane1.top : pane1.left),
      panelMax: Math.round(vertical ? pane2.bottom : pane2.right),
      gap: pane2.top - pane1.bottom
    }
    // get panelSize, adjusting for gap between ???
    dimensions.panelSize = dimensions.panelMax - dimensions.panelMin
    return dimensions
  }
  getMouse(event) {
    return this.direction === "vertical" ? event.pageY : event.pageX
  }

  onMouseDown = (event) => {
    this.dimensions = this.getDimensions()
    console.warn("onMouseDown", this.dimensions)

    document.addEventListener("mouseup", this.onMouseUp)
    document.addEventListener("mousemove", this.onMouseMove)
    document.addEventListener("scroll", this.onMouseMove) // scroll === mousemove
    event.preventDefault()
    event.stopPropagation()
  }
  onMouseMove = (event) => {
    //    console.info("mouseMove", event)
    const currentIndex = this.props.index
    const { gap, minSize, panelMin, panelMax, panelSize } = this.dimensions
    const mouse = this.getMouse(event)
    if (isNaN(panelSize) || isNaN(mouse)) return

    // make sure we're not tooo small
    if (mouse < panelMin + minSize || mouse > panelMax - minSize) return

    // figure out active percentage we're updating
    // by taking out percentages allocatd to other panes
    const sizes = [...this.props.panel.sizes]
    let active = 100
    sizes.forEach((size, index) => {
      if (index === currentIndex || index === currentIndex + 1) return
      if (size.units === "%") active -= size.value
    })
    const currentValue = Math.floor(((mouse - panelMin) * active) / panelSize)
    const nextValue = active - currentValue
    sizes[currentIndex] = { value: currentValue, units: "%" }
    sizes[currentIndex + 1] = { value: nextValue, units: "%" }
    // console.info({ active, newValue, other: active - newValue })
    this.props.panel.updateSizes(sizes)
  }
  onMouseUp = (event) => {
    // console.info("mouseUp", event)

    document.removeEventListener("mouseup", this.onMouseUp)
    document.removeEventListener("mousemove", this.onMouseMove)
    document.removeEventListener("scroll", this.onMouseMove)
  }

  render() {
    return <div className="SplitPanel-sizer" onMouseDown={this.onMouseDown} />
  }
}
SplitPanel.Sizer = SplitSizer
