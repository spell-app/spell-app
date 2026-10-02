/**
 * Test helpers:  serve a handler on a free port, and ask it things over real HTTP.
 * - `node:http` requests, not `fetch`:  `fetch` resolves `..` / `%2e%2e` before sending, which hides exactly the
 *   paths the safety tests need to send.
 */
import { createServer, request as httpRequest, type Server } from "node:http"

import { SRV, type Handler } from "$/server"

/** A handler being served:  its base URL, and `close()`. */
export type Served = { base: string; port: number; server: Server; close: () => Promise<void> }

/** Serve `handler` on a free loopback port. */
export async function serveHandler(handler: Handler): Promise<Served> {
  const server = createServer(SRV.toListener(handler))
  const port = await SRV.listenPreferred(server)
  return {
    base: `http://127.0.0.1:${port}`,
    port,
    server,
    close: () =>
      new Promise((done) => {
        server.closeAllConnections()
        server.close(() => done())
      })
  }
}

/** An answer:  status, headers, body as text. */
export type Answer = { status: number; headers: Record<string, string | string[] | undefined>; text: string }

/**
 * Send `method` `path` (sent exactly as written) to `port`, with `body` and `headers`.
 * - sets `Content-Length` for a body, so DELETE bodies are framed too
 */
export function ask(
  port: number,
  method: string,
  path: string,
  { body, headers = {} }: { body?: string; headers?: Record<string, string> } = {}
): Promise<Answer> {
  return new Promise((done, fail) => {
    const sent = httpRequest(
      {
        host: "127.0.0.1",
        port,
        method,
        path,
        headers: { ...headers, ...(body !== undefined && { "content-length": Buffer.byteLength(body) }) }
      },
      (response) => {
        const chunks: Buffer[] = []
        response.on("data", (chunk: Buffer) => chunks.push(chunk))
        response.on("end", () =>
          done({ status: response.statusCode ?? 0, headers: response.headers, text: Buffer.concat(chunks).toString() })
        )
      }
    )
    sent.on("error", fail)
    sent.end(body)
  })
}
