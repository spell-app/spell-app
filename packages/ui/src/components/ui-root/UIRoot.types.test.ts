import { describe, expect, test } from "vite-plus/test"

import { RootTimeout } from "./UIRoot.types"

describe("RootTimeout.parse()", () => {
  test.each([
    ["5s", 5000],
    ["2.5s", 2500],
    ["500ms", 500],
    ["3000", 3000],
    ["soon", 5000],
    [undefined, 5000]
  ])("%s => %d ms", (value, ms) => {
    expect(RootTimeout.parse(value)).toBe(ms)
  })
})
