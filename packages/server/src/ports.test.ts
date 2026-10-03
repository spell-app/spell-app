import { mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { createServer } from "node:http"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { describe, expect, it } from "vite-plus/test"

import { SRV } from "$/server"

describe("ports", () => {
  it("finds a free port, and knows when it's taken", async () => {
    const port = await SRV.freePort()
    expect(await SRV.isFree(port)).toBe(true)
    const holder = createServer()
    await SRV.listenPreferred(holder, { port })
    expect(await SRV.isFree(port)).toBe(false)

    const other = createServer()
    const got = await SRV.listenPreferred(other, { port })
    expect(got).not.toBe(port)
    await expect(SRV.listenPreferred(createServer(), { port, fallback: false })).rejects.toMatchObject({
      code: "EADDRINUSE"
    })
    holder.close()
    other.close()
  })
})

describe("FileLock", () => {
  const dir = mkdtempSync(join(tmpdir(), "srv-lock-"))
  const file = join(dir, "page.html")
  writeFileSync(file, "x")

  it("runs with the lock, and lets go after a throw", () => {
    expect(SRV.FileLock.run(file, () => 1)).toBe(1)
    expect(() =>
      SRV.FileLock.run(file, () => {
        throw new Error("x")
      })
    ).toThrow("x")
    expect(new SRV.FileLock(file).tryAcquire()).toBe(true)
    new SRV.FileLock(file).release()
  })

  it("makes a second holder wait, then time out", async () => {
    const held = new SRV.FileLock(file)
    expect(held.tryAcquire()).toBe(true)
    await expect(SRV.FileLock.runAsync(file, async () => 1, { wait: 150 })).rejects.toBeInstanceOf(SRV.FileLockError)
    setTimeout(() => held.release(), 100)
    expect(await SRV.FileLock.runAsync(file, async () => 2, { wait: 2000 })).toBe(2)
  })

  it("takes over a stale lock", async () => {
    const held = new SRV.FileLock(file)
    expect(held.tryAcquire()).toBe(true)
    await new Promise((done) => setTimeout(done, 30))
    expect(SRV.FileLock.run(file, () => 3, { stale: 10, wait: 1000 })).toBe(3)
    rmSync(dir, { recursive: true, force: true })
  })
})
