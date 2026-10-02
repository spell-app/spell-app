import { randomBytes } from "node:crypto"

import { SRV, type Handler } from "$/server"

/**
 * Keeps a local server's writes to pages it served itself.
 * - `checkHost`:  every request's `Host` must be this server's own (`127.0.0.1:<port>`, `localhost:<port>`):  a
 *   web page elsewhere can't reach us by pointing its own name at 127.0.0.1 (DNS rebinding)
 * - `checkWrite`:  a write must carry this run's `token` (header `x-server-token`), which only pages we served
 *   know (`window.SPELL_SERVER.token`), and, if it says, a same-origin `Origin`
 * - the token changes every run:  a page served by an older run must reload
 * - From the goals server's POST checks.
 */
export class Guard {
  /** this run's secret;  pages get it in `window.SPELL_SERVER` */
  readonly token: string

  /** allowed `Host` headers;  set by `allowPort()` once the port is known */
  private hosts = new Set<string>()

  /** allowed `Origin` headers */
  private origins = new Set<string>()

  constructor({ token = randomBytes(16).toString("hex") }: { token?: string } = {}) {
    this.token = token
  }

  /** accept requests addressed to this server on `port` */
  allowPort(port: number): this {
    for (const host of [`127.0.0.1:${port}`, `localhost:${port}`, `[::1]:${port}`]) {
      this.hosts.add(host)
      this.origins.add(`http://${host}`)
    }
    return this
  }

  /** `HttpError(403)` unless `request` is addressed to us */
  checkHost(request: SRV.Request): void {
    if (!this.hosts.has(request.get("host") ?? "")) throw new SRV.HttpError(403, "unknown host")
  }

  /** `HttpError(403)` unless `request` carries the token, from our own origin */
  checkWrite(request: SRV.Request): void {
    if (request.get("x-server-token") !== this.token) throw new SRV.HttpError(403, "bad token:  reload the page")
    const origin = request.get("origin")
    if (origin && !this.origins.has(origin)) throw new SRV.HttpError(403, "wrong origin")
  }

  /** middleware:  `checkHost` */
  hostCheck: Handler = (request, _reply, next) => {
    this.checkHost(request)
    next()
  }

  /** middleware:  `checkWrite` */
  writeCheck: Handler = (request, _reply, next) => {
    this.checkWrite(request)
    next()
  }
}
