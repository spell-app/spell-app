import { describe, test, expect, vi } from "vite-plus/test"

import { frameSummary, logError, logFrame } from "$/core"

/**
 * A page's frames, as its console shows them (`page.ts`, `logFrame()`):  one folded line each,
 * so you can watch a page and the program running elsewhere talk.
 */
describe("frameSummary()", () => {
  test("the page's:  a call, a call on a thing, an event with the things it names", () => {
    expect(frameSummary({ call: "play_from_the_stock_pile", args: [] })).toBe("call play_from_the_stock_pile()")
    expect(frameSummary({ call: "turn_over", on: { "@id": "3" }, args: [] })).toBe("call turn_over() on #3")
    expect(frameSummary({ trigger: "card-click", details: { card: { "@id": "26" } } })).toBe("event card-click (#26)")
    expect(frameSummary({ trigger: "reset", details: {} })).toBe("event reset")
  })

  test("the program's:  its state, by name;  a patch, each thing by type and id", () => {
    expect(frameSummary({ game: { "@type": "Game", "@id": "1" }, stock: { "@id": "3" } })).toBe("state:  game, stock")
    expect(
      frameSummary([
        { "@type": "Card", "@id": "26", direction: "up" },
        { "@type": "DiscardPile", "@id": "27", "@items": [] }
      ])
    ).toBe("patch:  Card #26, DiscardPile #27")
  })
})

describe("logFrame()", () => {
  test("a frame sent:  the blue SENDING  > badge", () => {
    const group = vi.spyOn(console, "groupCollapsed").mockImplementation(() => {})
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    const end = vi.spyOn(console, "groupEnd").mockImplementation(() => {})
    try {
      logFrame("sent", { trigger: "card-click", details: { card: { "@id": "26" } } }, 58)
      expect(group.mock.calls[0]![0]).toBe("%cSENDING  >%c  event card-click (#26)  %c58 characters")
      expect(group.mock.calls[0]![1]).toContain("background: #2185d0")
    } finally {
      group.mockRestore()
      log.mockRestore()
      end.mockRestore()
    }
  })

  test("a frame received:  the green RECEIVED < badge, folded, the frame inside", () => {
    const group = vi.spyOn(console, "groupCollapsed").mockImplementation(() => {})
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    const end = vi.spyOn(console, "groupEnd").mockImplementation(() => {})
    try {
      const frame = [{ "@type": "Card", "@id": "26" }]
      logFrame("received", frame, 33)
      expect(group.mock.calls[0]![0]).toBe("%cRECEIVED <%c  patch:  Card #26  %c33 characters")
      expect(group.mock.calls[0]![1]).toContain("background: #21ba45")
      expect(log).toHaveBeenCalledWith(frame)
      expect(end).toHaveBeenCalled()
    } finally {
      group.mockRestore()
      log.mockRestore()
      end.mockRestore()
    }
  })
})

describe("logError()", () => {
  test("the red < ERROR  > badge, what went wrong, and the detail", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {})
    try {
      const frame = { error: "ValueError: no such card" }
      logError("the program couldn't run a message:  ValueError: no such card", frame)
      const [line, badge, , detail] = error.mock.calls[0]!
      expect(line).toBe("%c< ERROR  >%c  the program couldn't run a message:  ValueError: no such card")
      expect(badge).toContain("background: #db2828")
      expect(detail).toBe(frame)
    } finally {
      error.mockRestore()
    }
  })
})
