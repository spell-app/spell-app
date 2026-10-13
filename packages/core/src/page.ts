/**
 * A page that draws a program running ELSEWHERE, e.g. in Python (epic `python-target` P19):
 * it mirrors the program's state, draws it with the program's own classes, and sends its events back.
 *
 * ```ts
 * import * as elements from "./Solitaire.elements.js"
 *
 * const page = startPage({ modules: [elements], state, send: (message) => socket.send(JSON.stringify(message)) })
 * socket.onmessage = (event) => page.receive(JSON.parse(event.data))
 * ```
 *
 * - `modules`:  the program's drawing half, `<Project>.elements.js` (`P.ElementsWriter`), and those of the projects
 *   it imports:  their classes, and the program's own `adopt()`, which binds the things it keeps from the state.
 * - `state`:  the program's state, by id (`StateWriter`):  `{ "game": {...}, "stock": {...} }`.
 * - `send`:  where its messages go, as JSON, each thing in it by its id:
 *   - a call, `{ "call": "play_from_the_stock_pile", "args": [] }`,
 *     of a thing's method, `{ "call": "turn_over", "on": "Card#queen-of-spades", "args": [] }` -- see `sendCall()`
 *   - an event, `{ "trigger": "card-click", "target": "Card#queen-of-spades" }` -- see `sendTrigger()`
 *   - each thing by reference (epic `python-target` P27), else by its id, `{ "$id": "3" }`
 * - The state names properties as Python does:  read as javascript names them (`javascriptName()`).
 * - `receive()` reads what comes back, a state or a patch, into the same things:  what they draw follows.
 * - The app the state holds starts, drawn into the page as `App.start()` draws it.
 * - ONE page at a time:  the messages go to the last one started.
 */
import { spellCore } from "./core"
import { App } from "./classes/App"
import { List } from "./classes/List"
import { Thing } from "./classes/Thing"
import { ID_KEY, StateMirror } from "./state"

/** What a page sends:  a call, or an event -- see the file's docs. */
export type PageMessage =
  | { call: string; on?: PageMessageThing; args: unknown[] }
  | { trigger: string; target?: PageMessageThing | PageMessageThing[]; details: Record<string, unknown> }

/** A thing in a page's message:  by reference, `"Card#ace-of-hearts"`, else by its id, `{ "$id": "3" }`. */
export type PageMessageThing = string | { [ID_KEY]: string }

/** What `startPage()` takes -- see the file's docs. */
export type PageSpec = {
  modules: Array<Record<string, unknown>>
  state: unknown
  send: (message: PageMessage) => void
}

/** A started page:  `receive()` reads each state or patch the program sends. */
export type Page = {
  receive(state: unknown): void
  /** Its mirror:  each thing by its id. */
  mirror: StateMirror
}

/** The page messages go to, the last one started. */
let current: { mirror: StateMirror; send: (message: PageMessage) => void } | undefined

/** Start a page:  see the file's docs. */
export function startPage({ modules, state, send }: PageSpec): Page {
  const mirror = new StateMirror({ nameOf: javascriptName })
  current = { mirror, send }
  for (const module of modules) spellCore.things.addClasses(module)
  const things = mirror.read(state) as Record<string, unknown>
  for (const module of modules) (module.adopt as ((state: unknown) => void) | undefined)?.(things)
  const app = Object.values(things).find((value) => value instanceof App) as App | undefined
  app?.start()
  return { mirror, receive: (next: unknown) => void mirror.read(next) }
}

/**
 * SIDE EFFECT:  ask the program to run its `name`, e.g. `play_from_the_stock_pile`, with `args`:
 * a thing's method when it's `on` one.
 * - What a stand-in in `<Project>.elements.js` calls, and a handler's call of a thing's method.
 */
export function sendCall(name: string, args: unknown[], on?: Thing | List): void {
  if (!current) return
  const { mirror, send } = current
  const message: PageMessage = { call: name, args: args.map((arg) => byReference(arg, mirror)) as unknown[] }
  if (on) message.on = byReference(on, mirror) as PageMessageThing
  send(message)
}

/**
 * SIDE EFFECT:  send event `name` to the program's handlers, with `details`:  `{ card: this }`.
 * - What it happened to goes as its `target`, by reference (epic `python-target` P27):
 *   `{ "trigger": "card-click", "target": "Card#ace-of-hearts" }`.
 *   - Each thing in `details`, at its top:  one is the target, several a list of them.
 *   - Left out of the details when its key is only its type's name (`card` for a Card):
 *     the program's handler gets it by that name anyway (`event.card`).
 *     Under any other key, `{ from: pile }`, it stays there too, by reference.
 * - The rest of `details` as it is, each thing in it by reference.
 */
export function sendTrigger(name: string, details: Record<string, unknown> = {}): void {
  if (!current) return
  const { mirror, send } = current
  const targets: unknown[] = []
  const rest: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(details)) {
    const isThing = value instanceof Thing || value instanceof List
    if (isThing) targets.push(byReference(value, mirror))
    if (!isThing || snakeCase(key) !== snakeCase(value.constructor.name)) rest[key] = byReference(value, mirror)
  }
  const message: Extract<PageMessage, { trigger: string }> = { trigger: name, details: rest }
  if (targets.length) message.target = (targets.length === 1 ? targets[0] : targets) as PageMessageThing
  send(message)
}

/** `name` in snake case, as Python names a type's thing:  `DiscardPile` and `discardPile` are `discard_pile`. */
function snakeCase(name: string): string {
  return name.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase()
}

/**
 * Python's `name` for a property, as javascript names it:  `is_set_up` => `isSetUp`, `it_2` => `it2`.
 * - The core's own that differ, by their javascript names:  a list's `item_type` is its `instanceType`.
 */
export function javascriptName(name: string): string {
  return CORE_NAMES[name] ?? name.replace(/_+([a-z0-9])/g, (_match, next: string) => next.toUpperCase())
}

/** The core's own properties that Python's core names differently -- see `javascriptName()`. */
const CORE_NAMES: Record<string, string> = { item_type: "instanceType" }

/**
 * `value`, each thing in it by reference, `"Card#ace-of-hearts"` (`spellCore.referenceFor()`, epic `python-target` P27):
 * plain values, arrays and objects all the way down.
 * - A thing no reference finds (no name, not the program's):  its id, `{ "$id": "3" }`.
 */
function byReference(value: unknown, mirror: StateMirror): unknown {
  if (value instanceof Thing || value instanceof List) {
    return spellCore.referenceFor(value) ?? { [ID_KEY]: mirror.idOf(value) }
  }
  if (Array.isArray(value)) return value.map((item) => byReference(item, mirror))
  if (typeof value === "object" && value !== null && Object.getPrototypeOf(value) === Object.prototype) {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, byReference(item, mirror)]))
  }
  return value
}

/**
 * Connect a page to its program over a WebSocket at `url`, e.g. a Quart app's `/ws` (epic `python-target` P20):
 * the first message is the whole state, which starts the page (`startPage()`);  each after it, a patch.
 * - What the page sends goes up the same socket, as JSON.
 * - `modules`:  as `startPage()`'s.
 * - `log`:  write each frame to the browser's console, both ways (`logFrame()`), to watch the page and its program
 *   talk, each line starting with a coloured badge:
 *   - `SENDING  >  event card-click (#26)`, in blue
 *   - `RECEIVED <  patch:  Card #26, StockPile #3`, in green
 * - Errors show whether or not `log` is on, as `< ERROR  >`, in red (`logError()`):
 *   - a message the program failed to run, which it answers with `{ "error": "..." }` (`ERROR_KEY`)
 *   - a frame the page couldn't read, and the connection failing or closing
 */
export function connectPage({
  modules,
  url,
  log = false
}: {
  modules: PageSpec["modules"]
  url: string
  log?: boolean
}): WebSocket {
  const socket = new WebSocket(url)
  let page: Page | undefined
  const send = (message: PageMessage) => {
    const text = JSON.stringify(message)
    if (log) logFrame("sent", message, text.length)
    socket.send(text)
  }
  socket.addEventListener("message", (event: MessageEvent<string>) => {
    let data: unknown
    try {
      data = JSON.parse(event.data)
    } catch (error) {
      logError(`a frame the page couldn't read:  ${String(error)}`, event.data)
      return
    }
    if (isErrorFrame(data)) {
      logError(`the program couldn't run a message:  ${data[ERROR_KEY]}`, data)
      return
    }
    if (log) logFrame("received", data, event.data.length)
    try {
      if (page) page.receive(data)
      else page = startPage({ modules, state: data, send })
    } catch (error) {
      logError(`the page couldn't take a frame in:  ${String(error)}`, { frame: data, error })
    }
  })
  socket.addEventListener("error", () => logError(`the connection to the program failed:  ${url}`, socket))
  socket.addEventListener("close", (event) => {
    if (!event.wasClean) logError(`the connection to the program closed (${event.code})`, event)
  })
  return socket
}

/** What an error frame names its message by:  `{ "error": "ValueError: ..." }`, the program's answer to a failure. */
export const ERROR_KEY = "error"

/** Is `frame` the program's error frame, `{ "error": "..." }`, rather than a state or a patch? */
function isErrorFrame(frame: unknown): frame is { [ERROR_KEY]: string } {
  return (
    typeof frame === "object" &&
    frame !== null &&
    !Array.isArray(frame) &&
    typeof (frame as Record<string, unknown>)[ERROR_KEY] === "string"
  )
}

/** Each badge:  its words, its colour. */
const BADGES = {
  // all three the width of "RECEIVED <":  a second space before the mark lines them up
  sent: ["SENDING  >", "#2185d0"],
  received: ["RECEIVED <", "#21ba45"],
  error: ["< ERROR  >", "#db2828"]
} as const

/** The console style of `badge`:  its words in white, on its colour. */
function badgeStyle(badge: keyof typeof BADGES): string {
  return `background: ${BADGES[badge][1]}; color: white; font-weight: bold; padding: 1px 6px; border-radius: 3px`
}

/**
 * SIDE EFFECT:  one frame between a page and its program, in the browser's console:
 * folded, its line a coloured badge (`SENDING  >` or `RECEIVED <`), what it is (`frameSummary()`) and its size;
 * the JSON inside.
 */
export function logFrame(direction: "sent" | "received", frame: unknown, size: number): void {
  console.groupCollapsed(
    `%c${BADGES[direction][0]}%c  ${frameSummary(frame)}  %c${size} characters`,
    badgeStyle(direction),
    "",
    "color: gray"
  )
  console.log(frame)
  console.groupEnd()
}

/** SIDE EFFECT:  what went wrong between a page and its program, in the console:  a red `< ERROR  >` badge, then `what`. */
export function logError(what: string, detail: unknown): void {
  console.error(`%c${BADGES.error[0]}%c  ${what}`, badgeStyle("error"), "", detail)
}

/**
 * What a frame is, in a line:
 * - the page's:  `call play_from_the_stock_pile()`, `call turn_over() on Card#3`,
 *   `event card-click (Card#ace-of-hearts)`;  a thing by its id, `#26`
 * - the program's:  `state:  game, stock, discards ...` (its first), `patch:  Card #26, StockPile #3`
 */
export function frameSummary(frame: unknown): string {
  if (Array.isArray(frame)) return `patch:  ${frame.map(thingLabel).join(", ")}`
  if (typeof frame !== "object" || frame === null) return String(frame)
  const message = frame as Record<string, unknown>
  if (typeof message.call === "string") {
    const on = message.on ? ` on ${thingLabel(message.on)}` : ""
    return `call ${message.call}()${on}`
  }
  if (typeof message.trigger === "string") {
    const targets = [message.target ?? []].flat()
    const named = Object.values((message.details ?? {}) as Record<string, unknown>).filter(isThingInFrame)
    const things = [...targets, ...named].map(thingLabel)
    return `event ${message.trigger}${things.length ? ` (${things.join(", ")})` : ""}`
  }
  return `state:  ${Object.keys(message).join(", ")}`
}

/** Is `value` a thing in a frame:  a reference, `"Card#3"`, or an id, `{ "$id": "3" }`? */
function isThingInFrame(value: unknown): boolean {
  if (typeof value === "string") return REFERENCE_TEXT.test(value)
  return typeof value === "object" && value !== null && ID_KEY in value
}

/** A reference's text:  `Card#ace-of-hearts`, `Tableau#1`. */
const REFERENCE_TEXT = /^[A-Za-z_$][\w$]*#.+$/

/**
 * A thing in a frame:  a reference as it is, `Card#26`;  else by its type and id, `Card #26`,
 * just `#26` when only its id is there.
 */
function thingLabel(value: unknown): string {
  if (typeof value === "string" && REFERENCE_TEXT.test(value)) return value
  if (typeof value !== "object" || value === null) return JSON.stringify(value)
  const thing = value as Record<string, unknown>
  if (!(ID_KEY in thing)) return JSON.stringify(value)
  const type = typeof thing["$type"] === "string" ? `${thing["$type"]} ` : ""
  return `${type}#${String(thing[ID_KEY])}`
}
