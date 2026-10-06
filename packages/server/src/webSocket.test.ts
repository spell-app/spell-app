import { mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterAll, beforeAll, describe, expect, test, vi } from "vite-plus/test"

import { SRV } from "$/server"

describe("textFrame()", () => {
  test("puts the length in 1, 2 or 8 bytes, by size", () => {
    expect([...SRV.textFrame("hi").subarray(0, 2)]).toEqual([0x81, 2])
    expect([...SRV.textFrame("x".repeat(300)).subarray(0, 4)]).toEqual([0x81, 126, 1, 44])
    const big = SRV.textFrame("x".repeat(70_000))
    expect(big[1]).toBe(127)
    expect(big.readBigUInt64BE(2)).toBe(70_000n)
    expect(big.length).toBe(10 + 70_000)
  })
})

// The live-reload socket, end to end:  a real `WebServer`, and node's own `WebSocket` as the page
describe("LiveReload.events", () => {
  const root = mkdtempSync(join(tmpdir(), "srv-socket-"))
  let server: SRV.WebServer

  beforeAll(async () => {
    server = new SRV.WebServer({ live: true, mounts: [{ prefix: "/", dir: root }] })
    await server.listen()
  })

  afterAll(async () => {
    await server.close()
    rmSync(root, { recursive: true, force: true })
  })

  test("hands every open page each message, short or long", async () => {
    const pages = await Promise.all([open(server.port), open(server.port)])
    const long = "/" + "x".repeat(70_000)
    server.live!.send("change", { path: "/a.html" })
    server.live!.send("change", { path: long })
    for (const page of pages) {
      await vi.waitFor(() => expect(page.messages).toHaveLength(2))
      expect(page.messages).toEqual([
        { event: "change", data: { path: "/a.html" } },
        { event: "change", data: { path: long } }
      ])
      page.socket.close()
    }
  })

  // the bug it fixes:  6 event streams took all of Chrome's connections to a host
  test("keeps MORE than 6 pages connected at once", async () => {
    const pages = await Promise.all(Array.from({ length: 8 }, () => open(server.port)))
    expect(server.live!.clientCount).toBe(8)
    for (const page of pages) page.socket.close()
  })

  test("a page closing its socket leaves the clients", async () => {
    // the tests before close theirs without waiting
    await vi.waitFor(() => expect(server.live!.clientCount).toBe(0))
    const page = await open(server.port)
    expect(server.live!.clientCount).toBe(1)
    const closed = new Promise((done) => page.socket.addEventListener("close", done))
    page.socket.close()
    await closed
    await vi.waitFor(() => expect(server.live!.clientCount).toBe(0))
  })
})

/** A page's live-reload socket on `port`, open, and every message it has had. */
async function open(port: number): Promise<{ socket: WebSocket; messages: unknown[] }> {
  const socket = new WebSocket(`ws://127.0.0.1:${port}${SRV.LIVE_EVENTS}`)
  const messages: unknown[] = []
  socket.addEventListener("message", (message: MessageEvent<string>) => messages.push(JSON.parse(message.data)))
  await new Promise((done, fail) => {
    socket.addEventListener("open", done)
    socket.addEventListener("error", fail)
  })
  return { socket, messages }
}
