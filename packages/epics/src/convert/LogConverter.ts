import { Formats } from "$/epics/definitions"

import { Chrome, Old } from "./convert.types"

import type { Converter } from "./Converter"
import { isBlank, isElement, squeeze, takeChildren } from "./domEdits"

/****************
 * ### `LogConverter`
 * The log, for `Converter`:  `#log` becomes `<epic-section kind="log">`, each line an `<epic-event at icon>` --
 * from the feed (`ui-event`s, 2026-10-01 on) or the older list (`ul.plan-log` of `<li><time>`).
 * - `at`:  the time's `datetime` (local, with offset) when it shows as the line's time, else the time as shown
 * - `icon`:  left out when it's the default, `pen to square`
 ****************/
export class LogConverter {
  /** The converter it works for:  STATIC for its life. */
  readonly owner: Converter

  constructor(owner: Converter) {
    this.owner = owner
  }

  /** `<epic-section kind="log">` from `#log`. */
  section(section: Element): Element {
    const events: Element[] = []
    for (const child of takeChildren(section)) {
      if (isBlank(child) || child.nodeType === 8) continue
      if (!isElement(child)) throw this.owner.error("text in the log, outside any line", section)
      if (child.matches("ui-icon[slot='icon']")) continue
      if (!child.matches(`${Old.feed}, ${Old.oldLog}`))
        throw this.owner.error("the log holds something other than lines", child)
      for (const line of Array.from(child.children)) events.push(this.event(line))
    }
    return this.owner.element("epic-section", { id: "log", kind: "log" }, events, section)
  }

  /** `<epic-event at icon>` from a feed's `ui-event`, or an old list's `<li>`. */
  private event(line: Element): Element {
    const summary = line.querySelector(":scope > ui-content > ui-summary") ?? line
    const date = summary.querySelector(":scope > ui-date") ?? summary.querySelector(":scope > time:first-child")
    if (!date) throw this.owner.error("a log line without its time", line)
    const at = this.time(date, line)
    date.remove()
    const icon = line.getAttribute("icon")
    const data = { at, icon: icon && icon !== Chrome.defaultEventIcon ? icon : undefined }
    const content = line.querySelector(":scope > ui-content")
    const rest = content && summary !== line ? takeChildren(content).filter((node) => node !== summary) : []
    return this.owner.element("epic-event", data, [...takeChildren(summary), ...rest], line)
  }

  /** The line's time:  its `datetime` when that shows as the text (`2026-10-01T09:05-04:00` ~ `2026-10-01 09:05`). */
  private time(date: Element, line: Element): string {
    const time = date.localName === "time" ? date : (date.querySelector("time") ?? date)
    const shown = squeeze(time.textContent ?? "")
    const datetime = time.getAttribute("datetime") ?? ""
    if (Formats.time.test(datetime) && datetime.slice(0, 16).replace("T", " ") === shown) return datetime
    if (Formats.time.test(shown)) return shown
    throw this.owner.error(`a log line's time isn't a time:  \`${shown}\``, line)
  }
}
