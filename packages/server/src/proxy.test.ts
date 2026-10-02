import { createServer, request as httpRequest, type Server } from "node:http"
import { afterAll, beforeAll, describe, expect, it } from "vitest"

import { SRV } from "$/server"
import { ask } from "$/server/test/serve"

describe("proxyTo() / proxyUpgrade()", () => {
  let target: Server
  let targetPort: number
  let web: SRV.WebServer

  beforeAll(async () => {
    // the server behind:  echoes method, path, host and body;  answers upgrades with "hello" then echoes
    target = createServer((request, response) => {
      let body = ""
      request.on("data", (chunk: Buffer) => (body += chunk))
      request.on("end", () =>
        response
          .writeHead(201, { "x-target": "yes" })
          .end(JSON.stringify({ method: request.method, url: request.url, host: request.headers.host, body }))
      )
    })
    target.on("upgrade", (request, socket) => {
      socket.write(
        `HTTP/1.1 101 Switching Protocols\r\nUpgrade: test\r\nConnection: Upgrade\r\nX-Url: ${request.url}\r\n\r\n`
      )
      socket.on("data", (data: Buffer) => socket.write(`echo:${data.toString()}`))
    })
    targetPort = await SRV.listenPreferred(target)

    web = new SRV.WebServer()
    web.router.all(
      "/ui/*",
      SRV.proxyTo(() => targetPort)
    )
    web.upgrade("/ui", (raw, socket, head) => SRV.proxyUpgrade(raw, socket, head, targetPort))
    await web.listen()
  })

  afterAll(async () => {
    await web.close()
    target.closeAllConnections()
    target.close()
  })

  it("forwards method, path, body and status, with the target's Host", async () => {
    const answer = await ask(web.port, "POST", "/ui/x/y?z=1", { body: "hi", headers: { "content-type": "text/plain" } })
    expect(answer.status).toBe(201)
    expect(answer.headers["x-target"]).toBe("yes")
    expect(JSON.parse(answer.text)).toEqual({
      method: "POST",
      url: "/ui/x/y?z=1",
      host: `127.0.0.1:${targetPort}`,
      body: "hi"
    })
  })

  it("forwards websocket upgrades under the prefix, and refuses others", async () => {
    expect(await upgrade(web.port, "/ui/hmr")).toBe("echo:ping")
    expect(await upgrade(web.port, "/other")).toBe("refused")
  })

  it("answers 502 when the target is down", async () => {
    const down = new SRV.WebServer()
    down.router.all(
      "*",
      SRV.proxyTo(() => 1)
    )
    await down.listen()
    expect((await ask(down.port, "GET", "/x")).status).toBe(502)
    await down.close()
  })
})

/** Upgrade at `path`, send `ping`, resolve with what comes back -- or `refused`. */
function upgrade(port: number, path: string): Promise<string> {
  return new Promise((done) => {
    const sent = httpRequest({ host: "127.0.0.1", port, path, headers: { connection: "Upgrade", upgrade: "test" } })
    sent.on("upgrade", (_response, socket) => {
      socket.on("data", (data: Buffer) => {
        done(data.toString())
        socket.destroy()
      })
      socket.write("ping")
    })
    sent.on("error", () => done("refused"))
    sent.on("response", () => done("refused"))
    sent.end()
  })
}
