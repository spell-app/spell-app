import React from "react"

import "./SplitPanel.less"

// TODO:
// - drag resize
// - If SplitPanel has an `id`, retain dragged-size
// - SplitPane: `collapsible`
// - SplitPane: `min-` and/or `max-sizes`. as `[ { size, min, max }... ]`
// - Responsive sizing or alternative layouts for devices
// - Special case a <SplitPanel> inside another <SplitPanel/> ?

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
    columns, // column sizes for horizontal split, as `true`, string or array.  See `sizesToFlex()`.
    rows, // row sizes for vertical split, as `true`, string or array.  See `sizesToFlex()`.
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
    const flexes = sizesToFlex(columns || rows, React.Children.count(children))
    const kids = []
    // NOTE: children MUST NOT be a fragment. (???)
    React.Children.forEach(children, (child, index) => {
      const flex = flexes[index]

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
SplitPanel.SplitPane = SplitPane

/**
 * Spacer auto-added between elements for `<SplitPanel spaced />`
 */
export function SplitSpacer() {
  return <div className="SplitPanel-spacer" />
}
SplitPanel.SplitSpacer = SplitSpacer

/**
 * Sizer auto-added between elements for `<SplitPanel resizable />`
 */
export function SplitSizer({ index }) {
  return <div className="SplitPanel-sizer" onMouseDown={(event) => console.warn(event.target)} />
}
SplitPanel.SplitSizer = SplitSizer

/**
 * Utility method to convert `sizes` to css `flex` property.
 */
const NUM_WITH_UNITS_PATTERN = /^([0-9]*\.?[0-9]+)(px|em|rem|%)?$/
export function sizesToFlex(startSizes = [], childCount) {
  if (typeof startSizes === "string") startSizes = startSizes.split(",")
  else if (!Array.isArray(startSizes)) startSizes = []

  const sizes = startSizes.slice(0, childCount)
  if (sizes.length < childCount) {
    const start = sizes.length - childCount
    sizes.length = childCount
    sizes.fill("*", start)
  }

  let starCount = 0
  let remainingPercent = 100
  const flexes = sizes.map((size) => {
    if (size === "*") {
      starCount += 1
      return "*"
    } else if (typeof size === "number") {
      return `0 0 ${size}px`
    } else {
      try {
        const [_, num, units] = NUM_WITH_UNITS_PATTERN.exec(size)
        if (units === "%") {
          remainingPercent -= parseInt(num, 10)
          return `${num} ${num} 0`
        }
        return `0 0 ${num}${units || "px"}`
      } catch (e) {
        // not understood, assume "*"
        return "*"
      }
    }
  })
  // console.info(starCount)
  if (!starCount) return flexes

  // convert all "*" to an equal percentage
  const flexPerStar = Math.floor(Math.max(1, remainingPercent / starCount))
  return flexes.map((flex) => (flex === "*" ? `${flexPerStar} ${flexPerStar} 0` : flex))
}
