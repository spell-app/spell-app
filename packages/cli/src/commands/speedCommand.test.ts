import { describe, test, expect } from "vite-plus/test"

import { combined, speedTable } from "./speedCommand"

/** One run's results, as `speedTest.mts` prints them. */
function run(average: number, min: number, max: number) {
  return { pass: 600, fail: 0, failed: 0, initialTime: 100, average, min, max }
}

describe("combined()", () => {
  test("mean of the averages, lowest min, highest max", () => {
    expect(combined([run(70, 68, 75), run(72, 66, 80)])).toEqual({
      pass: 600,
      fail: 0,
      average: 71,
      min: 66,
      max: 80,
      runs: 2,
      dropped: 0
    })
  })

  test("with 3 or more runs, drops ONE fluke:  an average 25% over the median", () => {
    const total = combined([run(70, 68, 75), run(100, 90, 140), run(71, 69, 76)])
    expect(total).toMatchObject({ average: 70.5, min: 68, max: 76, dropped: 1 })
  })

  test("keeps a slow run that isn't a fluke", () => {
    expect(combined([run(70, 68, 75), run(80, 70, 90), run(71, 69, 76)]).dropped).toBe(0)
  })
})

describe("speedTable()", () => {
  test("Owen's format:  bold rows, right-aligned equal columns, a whole-% Change row", () => {
    const table = speedTable([
      { label: "Previous", average: 71.4, min: 69, max: 75 },
      { label: "Current", average: 64.2, min: 61, max: 75 }
    ])
    expect(table).toBe(
      [
        "|              | Average | &nbsp;&nbsp;&nbsp;Min | &nbsp;&nbsp;&nbsp;Max |",
        "|--------------|--------:|----------------------:|----------------------:|",
        "| **Previous** |      71 |                    69 |                    75 |",
        "| **Current**  |      64 |                    61 |                    75 |",
        "| **Change**   |    -10% |                  -12% |                    0% |"
      ].join("\n")
    )
  })

  test("one side:  no Change row", () => {
    expect(speedTable([{ label: "Current", average: 64, min: 61, max: 75 }]).split("\n")).toHaveLength(3)
  })
})
