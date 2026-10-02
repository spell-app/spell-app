/** @jsxImportSource react */
import React from "react"
import classnames from "classnames"

import "./SpellPage.css"

/****************
 * ### `<SpellPage>`
 * Generic full-page layout wrapper -- presentational style variants (bordered / dark / light / rounded /
 * spaced / padded / scrolling) plus optional flexbox row/column layout for `children`.  Styled by
 * `./SpellPage.css`.
 * TODOC!
 ****************/
export function SpellPage(props: SpellPageProps) {
  const {
    bordered = false, // bordered variant
    dark = false, // dark variant
    fillWindow = false, // fill window completely.  alias for `full`
    light = false, // light variant
    rounded = false, // rounded variant
    spaced = false, // spaced variant (around page)
    padded = false, // padding (within page)
    scrolling = false, // scrolling variant
    rows = false, // use flexbox to lay children out in rows, down the page.
    columns = false, // use flexbox to lay children out in columns, across the page.
    // other props, e.g. `children`, id`, `style`, aria-stuff, etc...
    ...renderProps
  } = props

  const className = classnames(
    {
      bordered,
      dark,
      "fill-window": fillWindow,
      rows,
      columns,
      light,
      rounded,
      spaced,
      padded,
      scrolling
    },
    "SpellPage",
    renderProps.className
  )
  return <div {...renderProps} className={className} />
}

/** Props for `<SpellPage>`.  Extra keys (`children`, `id`, `style`, aria-*, ...) pass through to the `<div>`. */
export type SpellPageProps = React.ComponentPropsWithoutRef<"div"> & {
  /** Bordered variant. */
  bordered?: boolean
  /** Dark variant. */
  dark?: boolean
  /** Fill window completely, via `.fill-window` in `$/app/ui/SpellPage.css`. */
  fillWindow?: boolean
  /** Light variant. */
  light?: boolean
  /** Rounded variant. */
  rounded?: boolean
  /** Spaced variant (around page). */
  spaced?: boolean
  /** Padding (within page). */
  padded?: boolean
  /** Scrolling variant. */
  scrolling?: boolean
  /** Use flexbox to lay `children` out in rows, down the page. */
  rows?: boolean
  /** Use flexbox to lay `children` out in columns, across the page. */
  columns?: boolean
}
