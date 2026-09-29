import React from "react"

import "./RunnerSplit.css"

/****************
 * ### `<RunnerSplit>`
 * `children` in a pane on top, then `bottom` below, if any -- split by a bar you drag.
 * - `split` is the top pane's share of the height, in %.  Dragging shows as it goes, and says `onSplit()`
 *   only when let go -- so e.g. the VS Code extension writes `settings.json5` once.
 * - Without `bottom`, the top pane fills it all.
 ****************/
export function RunnerSplit({ split, onSplit, bottom, children }: RunnerSplitProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  // while dragging, else `undefined` -- `split` as given
  const [dragging, setDragging] = React.useState<number>()
  const top = dragging ?? split
  const hasBottom = bottom !== undefined && bottom !== null && bottom !== false
  return (
    <div ref={ref} className="RunnerSplit">
      <div className="RunnerSplitTop" style={{ flex: hasBottom ? `${top} 1 0` : "1 1 0" }}>
        {children}
      </div>
      {hasBottom && (
        <>
          <div
            className="RunnerSplitter"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          />
          <div className="RunnerSplitBottom" style={{ flex: `${100 - top} 1 0` }}>
            {bottom}
          </div>
        </>
      )}
    </div>
  )

  /** Start dragging the bar -- capturing the pointer, so it keeps coming to us off the bar. */
  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId)
    event.preventDefault()
    setDragging(split)
  }

  /** Move the bar to the pointer, as a share of our height. */
  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect()
    if (dragging === undefined || !rect?.height) return
    const percent = ((event.clientY - rect.top) / rect.height) * 100
    setDragging(Math.round(Math.min(MAX_SPLIT, Math.max(MIN_SPLIT, percent))))
  }

  /** Let go:  keep where the bar ended up. */
  function onPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    event.currentTarget.releasePointerCapture(event.pointerId)
    if (dragging !== undefined && dragging !== split) onSplit(dragging)
    setDragging(undefined)
  }
}

/** Props for `<RunnerSplit>`. */
export type RunnerSplitProps = {
  /** Top pane's share of the height, in %. */
  split: number
  /** Bar dragged and let go, to `split` %. */
  onSplit: (split: number) => void
  /** What's in the bottom pane -- none for just the top. */
  bottom?: ReactNode
  /** What's in the top pane. */
  children: ReactNode
}

/** Top pane's share of the height to start, in % -- until dragged. */
export const DEFAULT_SPLIT = 60

/** Least share of the height either pane can be dragged to, in %. */
const MIN_SPLIT = 10

/** Most share of the height the top pane can be dragged to, in %. */
const MAX_SPLIT = 100 - MIN_SPLIT
