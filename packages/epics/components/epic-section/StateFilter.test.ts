import { describe, expect, test } from "vite-plus/test"

import { StateFilter } from "./StateFilter"

/** The states a filter has, in the filter's order. */
const PRESENT = ["attention", "replied", "open", "recent"]

describe("StateFilter.nextShown()", () => {
  test("everything showing:  a click shows ONLY that state", () => {
    expect(StateFilter.nextShown(PRESENT, PRESENT, "replied")).toEqual(["replied"])
  })

  test("a hidden state, clicked:  it shows too, the others as they were, in the filter's order", () => {
    // Owen's example, read as:  red showing, orange and green off;  click orange:  red and orange
    expect(StateFilter.nextShown(PRESENT, ["attention"], "replied")).toEqual(["attention", "replied"])
    expect(StateFilter.nextShown(PRESENT, ["recent", "attention"], "open")).toEqual(["attention", "open", "recent"])
  })

  test("a shown state, clicked, others showing too:  it hides", () => {
    expect(StateFilter.nextShown(PRESENT, ["attention", "open"], "open")).toEqual(["attention"])
  })

  test("the ONLY state showing, clicked:  everything again;  none showing:  the clicked one", () => {
    expect(StateFilter.nextShown(PRESENT, ["open"], "open")).toEqual(PRESENT)
    expect(StateFilter.nextShown(PRESENT, [], "open")).toEqual(["open"])
  })

  test("states no longer there are left out", () => {
    expect(StateFilter.nextShown(["open", "recent"], ["old", "open"], "recent")).toEqual(["open", "recent"])
  })
})

describe("StateFilter.clickDoes()", () => {
  test("names what a click does, for the chip's tooltip", () => {
    expect(
      ["attention", "open"].map((state) => [
        StateFilter.clickDoes(PRESENT, PRESENT, state),
        StateFilter.clickDoes(PRESENT, ["open"], state),
        StateFilter.clickDoes(PRESENT, ["attention", "open"], state)
      ])
    ).toEqual([
      ["only", "also", "hide"],
      ["only", "all", "hide"]
    ])
  })
})
