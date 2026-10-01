import type { AccordionPanel } from "$/ui/core"

/****************
 * ### `AccordionPanels`
 * How an accordion's light children become panels, and how its `open` attribute reads -- shared by `<ui-accordion>`
 * and its native fallback (plain DOM, no Solid).
 * - Pairs:  each TITLE child starts a panel;  the element after it is its content, unless it's another title.
 *   Children before the first title belong to no panel (they aren't shown:  the shadow root assigns slots by hand).
 * - `open`:  space- (or comma-) separated panel indexes, e.g. `"0 2"`;  anything else is ignored.
 ****************/
export class AccordionPanels {
  /**
   * Panels of `host`, in order;  `isTitle` says which children are titles.
   * - Reuses a `previous` panel object while its title AND content are unchanged, so a keyed list keeps its row.
   */
  static read(
    host: Element,
    isTitle: (element: Element) => boolean,
    previous: readonly AccordionPanel[] = []
  ): AccordionPanel[] {
    const panels: AccordionPanel[] = []
    const children = [...host.children]
    for (let index = 0; index < children.length; index++) {
      const title = children[index]!
      if (!isTitle(title)) continue
      const next = children[index + 1]
      const content = next && !isTitle(next) ? next : undefined
      const old = previous.find((panel) => panel.title === title)
      panels.push(old && old.content === content ? old : { title, content })
    }
    return panels
  }

  /** Same panels, object for object:  nothing to re-render. */
  static same(a: readonly AccordionPanel[], b: readonly AccordionPanel[]): boolean {
    return a.length === b.length && a.every((panel, index) => panel === b[index])
  }

  /** Open indexes from `open` text, ascending, without duplicates;  only the first when `exclusive`. */
  static parse(text: string | null | undefined, exclusive: boolean): number[] {
    const indexes: number[] = []
    for (const word of (text ?? "").split(SEPARATOR)) {
      if (!INDEX.test(word)) continue
      const index = Number(word)
      if (!indexes.includes(index)) indexes.push(index)
    }
    // the FIRST one written wins an exclusive accordion, whatever its value
    if (exclusive) return indexes.slice(0, 1)
    return indexes.sort((a, b) => a - b)
  }

  /** `open` text for `indexes`, e.g. `"0 2"`. */
  static format(indexes: readonly number[]): string {
    return indexes.join(" ")
  }
}

/** Between the indexes of `open`. */
const SEPARATOR = /[\s,]+/

/** One index. */
const INDEX = /^\d+$/
