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
 *     of a thing's method, `{ "call": "turn_over", "on": { "@id": "3" }, "args": [] }` -- see `sendCall()`
 *   - an event, `{ "trigger": "card-click", "details": { "card": { "@id": "3" } } }` -- see `sendTrigger()`
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
  | { call: string; on?: { [ID_KEY]: string }; args: unknown[] }
  | { trigger: string; details: Record<string, unknown> }

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
  const message: PageMessage = { call: name, args: args.map((arg) => byId(arg, mirror)) as unknown[] }
  if (on) message.on = byId(on, mirror) as { [ID_KEY]: string }
  send(message)
}

/** SIDE EFFECT:  send event `name` to the program's handlers, with `details`:  `{ card: this }`. */
export function sendTrigger(name: string, details: Record<string, unknown> = {}): void {
  if (!current) return
  const { mirror, send } = current
  send({ trigger: name, details: byId(details, mirror) as Record<string, unknown> })
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

/** `value`, each thing in it as its id, `{ "@id": "3" }`:  plain values, arrays and objects all the way down. */
function byId(value: unknown, mirror: StateMirror): unknown {
  if (value instanceof Thing || value instanceof List) return { [ID_KEY]: mirror.idOf(value) }
  if (Array.isArray(value)) return value.map((item) => byId(item, mirror))
  if (typeof value === "object" && value !== null && Object.getPrototypeOf(value) === Object.prototype) {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, byId(item, mirror)]))
  }
  return value
}

/**
 * Connect a page to its program over a WebSocket at `url`, e.g. a Quart app's `/ws` (epic `python-target` P20):
 * the first message is the whole state, which starts the page (`startPage()`);  each after it, a patch.
 * - What the page sends goes up the same socket, as JSON.
 * - `modules`:  as `startPage()`'s.
 */
export function connectPage({ modules, url }: { modules: PageSpec["modules"]; url: string }): WebSocket {
  const socket = new WebSocket(url)
  let page: Page | undefined
  socket.addEventListener("message", (event: MessageEvent<string>) => {
    const data = JSON.parse(event.data) as unknown
    if (page) page.receive(data)
    else page = startPage({ modules, state: data, send: (message) => socket.send(JSON.stringify(message)) })
  })
  return socket
}
