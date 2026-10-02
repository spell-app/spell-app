/**
 * Choosing ports:  probe one, find a free one, or listen on a preferred one and fall back.
 * - Was three styles:  fixed from env (`app`), port 0 (`cli`, `ui`, DocPreview), and an `isFree` probe
 *   (`spell serve`).
 */
import { createServer, type Server } from "node:net"

/** Host every local server binds:  loopback only, so nothing on the network reaches it. */
export const LOCALHOST = "127.0.0.1"

/** Whether nothing listens on `port` at `host`:  tries to listen there itself, then lets go. */
export function isFree(port: number, host = LOCALHOST): Promise<boolean> {
  return new Promise((done) => {
    const probe = createServer()
    probe.once("error", () => done(false))
    probe.listen(port, host, () => probe.close(() => done(true)))
  })
}

/** A port free right now at `host`, chosen by the OS. */
export function freePort(host = LOCALHOST): Promise<number> {
  return new Promise((done, fail) => {
    const probe = createServer()
    probe.once("error", fail)
    probe.listen(0, host, () => {
      const address = probe.address()
      const port = typeof address === "object" && address ? address.port : 0
      probe.close(() => done(port))
    })
  })
}

/**
 * Options for `listenPreferred()`.
 * - `port`:  wanted port;  `0` lets the OS choose
 * - `host`:  default `LOCALHOST`
 * - `fallback`:  on `EADDRINUSE`, take any free port instead of failing (default `true`)
 */
export type ListenOptions = { port?: number; host?: string; fallback?: boolean }

/**
 * Listen with `server` on `port`, or (taken, and `fallback`) on any free port;  resolves to the port it got.
 * - works for `http.Server` too:  it's a `net.Server`
 */
export function listenPreferred(server: Server, options: ListenOptions = {}): Promise<number> {
  const { port = 0, host = LOCALHOST, fallback = true } = options
  return new Promise((done, fail) => {
    server.once("error", onError)
    server.listen(port, host, onListening)

    /** listening:  report the port */
    function onListening() {
      server.off("error", onError)
      const address = server.address()
      done(typeof address === "object" && address ? address.port : port)
    }

    /** taken:  try port 0 once, else fail */
    function onError(error: NodeJS.ErrnoException) {
      if (error.code !== "EADDRINUSE" || !fallback || port === 0) return fail(error)
      server.once("error", fail)
      server.listen(0, host, onListening)
    }
  })
}
