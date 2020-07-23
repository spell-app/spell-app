import React from "react"

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
export function SplitPanel(startProps) {
  // console.info("SplitPanel", startProps)
  const {
    children,
    columns, // column sizes for horizontal split, as `true`, string or array.  See `normalizeSizes()`.
    rows, // row sizes for vertical split, as `true`, string or array.  See `normalizeSizes()`.
    fluid = false, // fill container in alternate axis?
    spaced = false, // spacing around and between children. `true`, "slightly", "very" ???
    resizable = false, // provide resize bars.  Will store sizes as preference if element has an `id`.

    // The following will be passed down to SplitPanes which are automatically created.
    // If you create a <SplitPane> manually, these settings are ignored.
    bordered, // panes are borderd
    padded, // padding in panes
    raised, // panes appeear raised
    rounded, // panes appear rounded
    scrolling, // provide scrollbars in panes

    // other props, e.g. `id`, `style`, aria-stuff, etc...
    ...props
  } = startProps

  if (!columns && !rows) console.warn("SplitPanel must be initialized with either 'columns' or 'rows'.", startProps)
  if (columns && rows) console.warn("SplitPanel must be initialized with one of 'columns' or 'rows', not both.")

  props.className = [
    fluid && "fluid",
    columns ? "horizontal" : "vertical",
    resizable && "resizable",
    spaced && (typeof spaced === "string" ? `${spaced} spaced` : "spaced"),
    "SplitPanel",
    props.className
  ]
    .filter(Boolean)
    .join(" ")

  // Munge `children` to `kids`,
  // wrapping childen in `SplitPanel-pane` elements
  // and possibly adding `SplitPanel-sizer` or `SplitPanel-spacer` elements in-between.
  const kidProps = { bordered, padded, raised, rounded, scrolling }
  const kids = React.useMemo(() => {
    const sizes = normalizeSizes(columns || rows, React.Children.count(children))
    const kids = []
    // NOTE: children MUST NOT be a fragment. (???)
    React.Children.forEach(children, (child, index) => {
      const { value, units } = sizes[index]
      const flex = units === "%" ? `${value} ${value} 0` : `0 0 ${value}${units}`
      if (child.type === SplitPane || child.type === SplitPanel) {
        const cloneProps = {
          key: `panel-${index}`,
          ...(child.type === SplitPane ? kidProps : undefined),
          ...child.props,
          style: { ...child.props.style, flex }
        }
        kids.push(React.cloneElement(child, cloneProps))
      } else {
        kids.push(
          <SplitPane key={`panel-${index}`} {...kidProps} style={{ flex }}>
            {child}
          </SplitPane>
        )
      }

      // add resizer if necessary
      if (index !== children.length - 1) {
        if (resizable) {
          kids.push(<SplitSizer key={`sizer-${index}`} />)
        } else if (spaced) {
          kids.push(<SplitSpacer key={`spacer-${index}`} />)
        }
      }
    })
    return kids
  }, [children, resizable, spaced])

  return <div {...props}>{kids}</div>
}

/**
 * Single pane in a `<SplitPanel />`.
 * You don't need to create these, but you can if you want one particular panel
 * to override `bordered` etc set at the panel-level.
 */
export function SplitPane(startProps) {
  const {
    children,
    bordered = false, // add border
    padded = false, // add padding, `true`, `slightly` or very`
    raised = false, // show white background and shadow
    rounded = false, // round corners
    scrolling = false, // add auto-scrolling
    ...props // including `id`, `style`, `className` (dealt with below), aria stuff...
  } = startProps

  props.className = [
    bordered && "bordered",
    padded && (typeof padded === "string" ? `${padded} padded` : "padded"),
    raised && "raised",
    rounded && "rounded",
    scrolling && "scrolling",
    "SplitPanel-pane",
    props.className // put provided className at the end so it will win
  ]
    .filter(Boolean)
    .join(" ")

  return <div {...props}>{children}</div>
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
 * Sizer auto-added between elements for `<SplitPanel resizable />`
 */
export function SplitSizer({ index }) {
  return <div className="SplitPanel-sizer" onMouseDown={(event) => console.warn(event.target)} />
}
SplitPanel.Sizer = SplitSizer

/**
 * Utility method to convert `sizes` to css `flex` property.
 */
const NUM_WITH_UNITS_PATTERN = /^([0-9]*\.?[0-9]+)(px|em|rem|%)?$/
export function normalizeSizes(startSizes = [], childCount) {
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
        let [_, num, units = "px"] = NUM_WITH_UNITS_PATTERN.exec(size)
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
