import { mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterAll, beforeEach, describe, expect, it } from "vite-plus/test"

import { AirplaneMode } from "$/server/page"

describe("AirplaneMode", () => {
  const folder = mkdtempSync(join(tmpdir(), "airplane-"))
  const file = join(folder, "nested", "airplane.json")
  const before = process.env.SPELL_AIRPLANE_FILE

  beforeEach(() => {
    process.env.SPELL_AIRPLANE_FILE = file
    AirplaneMode.turn(false)
  })

  afterAll(() => {
    if (before === undefined) delete process.env.SPELL_AIRPLANE_FILE
    else process.env.SPELL_AIRPLANE_FILE = before
    rmSync(folder, { recursive: true, force: true })
  })

  it("is off with no file", () => {
    expect(AirplaneMode.read()).toBeUndefined()
    expect(AirplaneMode.isOn).toBe(false)
  })

  it("turns on, keeping the first `since` when turned on again;  off removes the file", () => {
    AirplaneMode.turn(true, new Date("2026-10-10T08:00:00Z"))
    AirplaneMode.turn(true, new Date("2026-10-10T09:00:00Z"))
    expect(AirplaneMode.read()).toEqual({ on: true, since: "2026-10-10T08:00:00.000Z" })
    expect(AirplaneMode.turn(false)?.since).toBe("2026-10-10T08:00:00.000Z")
    expect(AirplaneMode.isOn).toBe(false)
  })

  it("reads a broken file as off", () => {
    AirplaneMode.turn(true)
    writeFileSync(file, "{ not json")
    expect(AirplaneMode.isOn).toBe(false)
  })
})
