import { Show, createSignal } from "solid-js"
import type { JSX } from "@solidjs/web"

import "./RunnerSplit.css"

/****************
 * ### `<RunnerSplit>`
 * `children` in a pane on top, then `bottom` below while `showBottom` -- split by a bar you drag.
 * - `unit`:
 *   - `"%"`, for a split of a fixed height:  `split` is the TOP pane's share of it, in %
 *   - `"px"`, for one as tall as it needs to be, e.g. a fluid `<spell-app>`:  the top pane is as tall as its
 *     content, and `split` is the BOTTOM pane's height, in px
 * - Dragging shows as it goes, and says `onSplit()` only when let go:
 *   so e.g. the VS Code extension writes `settings.json5` once.
 * - Without `showBottom`, the top pane fills it all.
 * - `children` are read ONCE:  the top pane is never redrawn, so an app's mount point in it stays put.
 *   `bottom` is read each time it's shown.
 ****************/
export function RunnerSplit(props: RunnerSplitProps) {
  let element!: HTMLDivElement
  // while dragging, else `undefined` -- `split` as given
  const [dragging, setDragging] = createSignal<number>()
  const at = () => dragging() ?? props.split
  const byPixels = () => props.unit === "px"
  const topFlex = () => (byPixels() ? "0 0 auto" : props.showBottom ? `${at()} 1 0` : "1 1 0")
  const bottomFlex = () => (byPixels() ? `0 0 ${at()}px` : `${100 - at()} 1 0`)
  return (
    <div ref={(div) => (element = div)} class={["RunnerSplit", { byPixels: byPixels() }]}>
      <div class="RunnerSplitTop" style={{ flex: topFlex() }}>
        {props.children}
      </div>
      <Show when={props.showBottom}>
        <div
          class="RunnerSplitter"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        />
        <div class="RunnerSplitBottom" style={{ flex: bottomFlex() }}>
          {props.bottom}
        </div>
      </Show>
    </div>
  )

  /** Start dragging the bar -- capturing the pointer, so it keeps coming to us off the bar. */
  function onPointerDown(event: PointerEvent & { currentTarget: HTMLDivElement }) {
    event.currentTarget.setPointerCapture(event.pointerId)
    event.preventDefault()
    setDragging(props.split)
  }

  /**
   * Move the bar to the pointer:  as a share of our height, or the bottom pane's height in px.
   * - NOTE: `dragging()` is staged, but `pointerdown`'s write has landed by the first `pointermove`:  another task.
   */
  function onPointerMove(event: PointerEvent) {
    const rect = element.getBoundingClientRect()
    if (dragging() === undefined || !rect.height) return
    if (byPixels()) {
      setDragging(Math.round(Math.max(MIN_PIXELS, rect.bottom - event.clientY)))
      return
    }
    const percent = ((event.clientY - rect.top) / rect.height) * 100
    setDragging(Math.round(Math.min(MAX_SPLIT, Math.max(MIN_SPLIT, percent))))
  }

  /** Let go:  keep where the bar ended up. */
  function onPointerUp(event: PointerEvent & { currentTarget: HTMLDivElement }) {
    event.currentTarget.releasePointerCapture(event.pointerId)
    const ended = dragging()
    if (ended !== undefined && ended !== props.split) props.onSplit(ended)
    setDragging(undefined)
  }
}

/** Props for `<RunnerSplit>`. */
export type RunnerSplitProps = {
  /** Top pane's share of the height, in % -- or, by `px`, the bottom pane's height.  See `unit`. */
  split: number
  /** Bar dragged and let go, to `split`. */
  onSplit: (split: number) => void
  /** What `split` is in:  `"%"` of a fixed height (default), or `"px"` of the bottom pane, with no fixed height. */
  unit?: "%" | "px"
  /** Show the bottom pane, and the bar? */
  showBottom?: boolean
  /** What's in the bottom pane, while `showBottom`. */
  bottom?: JSX.Element
  /** What's in the top pane. */
  children: JSX.Element
}

/** Top pane's share of the height to start, in % -- until dragged. */
export const DEFAULT_SPLIT = 60

/** Least share of the height either pane can be dragged to, in %. */
const MIN_SPLIT = 10

/** Most share of the height the top pane can be dragged to, in %. */
const MAX_SPLIT = 100 - MIN_SPLIT

/** Least height the bottom pane can be dragged to, split by `px`. */
const MIN_PIXELS = 60
