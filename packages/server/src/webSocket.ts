import { createHash } from "node:crypto"
import type { IncomingMessage } from "node:http"
import type { Duplex } from "node:stream"

/**
 * The server's half of a websocket, as far as live reload needs it (RFC 6455):  accept one, send it text, ping it,
 * and notice when it closes.  Messages FROM the page are read only to answer a close;  their data is dropped.
 * - Why not `EventSource`:  Chrome allows 6 HTTP/1.1 connections per host, and an event stream holds one for good.
 *   VS Code's windows share ONE network process, so 6 docs pages open anywhere took them all, and every other page
 *   on that server waited forever (its parts, its scripts).  Websockets don't count toward those 6.
 */

/** RFC 6455's key suffix:  `Sec-WebSocket-Accept` is the SHA-1 of the page's key plus this. */
const HANDSHAKE_GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"

/** Frame opcodes used here. */
const OPCODE = { text: 0x1, close: 0x8, ping: 0x9 } as const

/**
 * Answer websocket upgrade `raw` on `socket` with `101 Switching Protocols`:  `socket` is now a websocket.
 * - `false`, with `socket` destroyed:  not a websocket upgrade (no `Sec-WebSocket-Key`)
 * - SIDE EFFECT:  reads `socket` from now on (`readFrames()`), answering a close frame with one and ending it
 */
export function acceptWebSocket(raw: IncomingMessage, socket: Duplex): boolean {
  const key = raw.headers["sec-websocket-key"]
  if (typeof key !== "string" || raw.headers.upgrade?.toLowerCase() !== "websocket") {
    socket.destroy()
    return false
  }
  const accept = createHash("sha1")
    .update(key + HANDSHAKE_GUID)
    .digest("base64")
  socket.write(
    "HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n" +
      `Sec-WebSocket-Accept: ${accept}\r\n\r\n`
  )
  socket.on("error", () => socket.destroy())
  readFrames(socket)
  return true
}

/** A text frame of `text`, for the page:  unmasked, as a server's frames are. */
export function textFrame(text: string): Buffer {
  return frame(OPCODE.text, Buffer.from(text, "utf8"))
}

/** A ping frame:  the browser answers it with a pong, which keeps sleeping laptops and proxies from dropping it. */
export function pingFrame(): Buffer {
  return frame(OPCODE.ping, Buffer.alloc(0))
}

/** One final frame:  opcode `opcode`, carrying `payload`;  its length in 1, 2 or 8 bytes. */
function frame(opcode: number, payload: Buffer): Buffer {
  const length = payload.length
  const head =
    length < 126
      ? Buffer.from([0x80 | opcode, length])
      : length < 0x10000
        ? Buffer.from([0x80 | opcode, 126, length >> 8, length & 0xff])
        : Buffer.concat([Buffer.from([0x80 | opcode, 127]), bigEndian64(length)])
  return Buffer.concat([head, payload])
}

/** `length` as 8 big-endian bytes. */
function bigEndian64(length: number): Buffer {
  const bytes = Buffer.alloc(8)
  bytes.writeBigUInt64BE(BigInt(length))
  return bytes
}

/**
 * Read the page's frames off `socket`:  a close frame is answered with one, then the socket ends.  Anything else
 * (a pong, a text the page shouldn't send) is skipped.
 * - frames may arrive split over chunks, or several to a chunk:  bytes wait in `pending` until a frame is whole
 */
function readFrames(socket: Duplex): void {
  let pending = Buffer.alloc(0)
  socket.on("data", (chunk: Buffer) => {
    pending = Buffer.concat([pending, chunk])
    for (;;) {
      const size = frameSize(pending)
      if (size === undefined || pending.length < size) return
      const opcode = pending[0]! & 0x0f
      pending = pending.subarray(size)
      if (opcode === OPCODE.close) {
        socket.end(frame(OPCODE.close, Buffer.alloc(0)))
        return
      }
    }
  })
}

/** The whole size of the frame at the start of `bytes`;  `undefined` until its header has arrived. */
function frameSize(bytes: Buffer): number | undefined {
  if (bytes.length < 2) return undefined
  const masked = (bytes[1]! & 0x80) !== 0
  const short = bytes[1]! & 0x7f
  const lengthBytes = short === 126 ? 2 : short === 127 ? 8 : 0
  const header = 2 + lengthBytes + (masked ? 4 : 0)
  if (bytes.length < 2 + lengthBytes) return undefined
  const length = short === 126 ? bytes.readUInt16BE(2) : short === 127 ? Number(bytes.readBigUInt64BE(2)) : short
  return header + length
}
