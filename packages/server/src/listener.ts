/**
 * Turn a `Handler` into node's `(req, res)` listener, with the answers when nothing else answers.
 */
import type { IncomingMessage, ServerResponse } from "node:http"

import { SRV, type Handler } from "$/server"

/**
 * Options for `toListener()`.
 * - `onError`:  told of every failure that isn't an `HttpError` under 500, e.g. to log it
 */
export type ListenerOptions = { onError?: (error: unknown, request: SRV.Request) => void }

/**
 * A node request listener running `handler`.
 * - nothing answered:  404 `text/plain` `Not found:  <path>`
 * - `HttpError`:  its status, with its `body` or `{ error: message }` as JSON
 * - anything else thrown:  500 `{ error: message }`
 * - headers already sent when it fails:  the connection is cut, since the status can't change
 */
export function toListener(handler: Handler, { onError }: ListenerOptions = {}) {
  return (raw: IncomingMessage, rawReply: ServerResponse): void => {
    const request = new SRV.Request(raw)
    const reply = new SRV.Reply(rawReply)
    handler(request, reply, (error) => {
      if (error === undefined) {
        if (!reply.headersSent)
          reply.status(404).type("text/plain; charset=utf-8").send(`Not found:  ${request.path}\n`)
        return
      }
      const status = error instanceof SRV.HttpError ? error.status : 500
      if (status >= 500) onError?.(error, request)
      if (reply.headersSent) return void rawReply.destroy()
      const body =
        error instanceof SRV.HttpError && error.body !== undefined
          ? error.body
          : { error: error instanceof Error ? error.message : JSON.stringify(error) }
      reply.status(status).set("Cache-Control", "no-store").json(body)
    })
  }
}
