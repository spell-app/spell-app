import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterAll, beforeEach, describe, expect, it } from "vite-plus/test"

import type { SRV } from "$/server"
import { PageServer } from "$/server/page"
import { ask } from "$/server/test/serve"

import { AirplaneMode } from "../../../packages/epics/tools/AirplaneMode"
import airplaneRoutes from "../../../packages/epics/tools/airplaneRoutes"

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

  it("tells every page the page server serves, through its route module (`airplaneRoutes`)", async () => {
    const root = join(folder, "checkout")
    mkdirSync(join(root, "docs"), { recursive: true })
    writeFileSync(join(root, "docs", "page.html"), "<!doctype html><head></head><p>page</p>\n")
    const server = new PageServer({ root })
    await airplaneRoutes.setup(server.routeContext())
    await server.start({ port: 0, routes: false, pidFile: false, bundles: false })
    /** the page's `window.SPELL_SERVER`, as served */
    const config = async () => {
      const answer = await ask(server.info.port, "GET", "/docs/page.html")
      return JSON.parse(/window\.SPELL_SERVER = (.*?)<\/script>/.exec(answer.text)![1]!) as SRV.ServerConfig
    }
    try {
      expect((await config()).airplane).toBeUndefined()
      AirplaneMode.turn(true)
      expect((await config()).airplane).toBe(true)
    } finally {
      await server.stop()
    }
  })
})
