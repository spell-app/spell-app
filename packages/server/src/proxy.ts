/**
 * Pass requests on to another local server:  plain HTTP, and websocket upgrades (a dev server's HMR).
 * - The path is forwarded unchanged:  the server behind must expect it (e.g. a Vite dev server's `base: "/ui"` for `/ui/...`).
 * - `Host` is rewritten to the target's, so its own host check (Vite's `allowedHosts`) accepts it.
 */
import { request as httpRequest, type IncomingMessage } from "node:http"
import { connect } from "node:net"
import type { Duplex } from "node:stream"

import type { Handler } from "$/server"

/** Where to forward:  a loopback port, possibly started on demand. */
export type ProxyTarget = () => number | Promise<number>

/**
 * A handler forwarding each request to `127.0.0.1:<target()>`, streaming both ways.
 * - the target down:  502
 * - MUST run before body parsing, or the body is gone
 */
export function proxyTo(target: ProxyTarget): Handler {
  return async (request, reply) => {
    const port = await target()
    await new Promise<void>((done) => {
      const outgoing = httpRequest(
        {
          host: "127.0.0.1",
          port,
          method: request.method,
          path: request.originalUrl,
          headers: { ...request.headers, host: `127.0.0.1:${port}` }
        },
        (incoming) => {
          reply.raw.writeHead(incoming.statusCode ?? 502, incoming.headers)
          incoming.pipe(reply.raw)
          incoming.on("end", done)
          incoming.on("error", done)
        }
      )
      outgoing.on("error", (error) => {
        if (!reply.headersSent) reply.status(502).type("text/plain; charset=utf-8").send(`proxy:  ${error.message}`)
        done()
      })
      request.raw.pipe(outgoing)
    })
  }
}

/**
 * Forward a websocket upgrade to `127.0.0.1:<port>`:  replays the request head, then pipes the two sockets.
 * - for `server.on("upgrade")`;  see `WebServer.upgrade()`
 */
export function proxyUpgrade(raw: IncomingMessage, socket: Duplex, head: Buffer, port: number): void {
  const upstream = connect(port, "127.0.0.1", () => {
    const headers = { ...raw.headers, host: `127.0.0.1:${port}` }
    const lines = [`${raw.method} ${raw.url} HTTP/${raw.httpVersion}`]
    for (const [name, value] of Object.entries(headers)) {
      for (const each of Array.isArray(value) ? value : [value]) if (each !== undefined) lines.push(`${name}: ${each}`)
    }
    upstream.write(`${lines.join("\r\n")}\r\n\r\n`)
    if (head.length) upstream.write(head)
    upstream.pipe(socket)
    socket.pipe(upstream)
  })
  upstream.on("error", () => socket.destroy())
  upstream.on("close", () => socket.destroy())
  socket.on("error", () => upstream.destroy())
  socket.on("close", () => upstream.destroy())
}

/** Whether `path` is `prefix` or under it, segment-wise:  `/ui`, `/ui/`, `/ui/x`, never `/uix`. */
export function underPrefix(path: string, prefix: string): boolean {
  return path === prefix || path.startsWith(`${prefix}/`) || path.startsWith(`${prefix}?`)
}
