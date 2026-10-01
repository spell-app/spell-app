// Solid 2 experiment for solid-2.html -- run (from `packages/docs`):  yarn tsx solid/experiments/spell-cells.ts [dev|prod]
// Spell cells (candidate X), reached three ways -- the core lives in `spell-cells.core.ts`:
// - A:  accessors on the prototype (the recommendation for Things)
// - P:  a `Proxy` around each instance, wrapped AFTER construction (the naive version)
// - P2:  EVERY prop through the proxy, wrapped FIRST;  field initializers as defaults;  a fast path for methods
// Checks:  read-after-write, the Solid bridge, key order, property types, the equality cutoff, construction order.

import {
  CardA,
  PERF_HEADER,
  RECORD,
  ThingA,
  createRenderEffect,
  createRoot,
  flushAll,
  log,
  perf
} from "./spell-cells.core"

let colorRuns = 0

////////////////
// ## Strategy P:  a `Proxy` around each instance, no accessors
////////////////

/** A proxy handler that routes every schema-declared OR already-recorded key to the record. */
const PROXY_HANDLER: ProxyHandler<ThingA> = {
  get(target, key, receiver) {
    if (typeof key === "string" && isProp(target, key)) return target.getProp(key)
    return Reflect.get(target, key, receiver)
  },
  set(target, key, value, receiver) {
    if (typeof key === "string" && !(key in target)) {
      target.setProp(key, value)
      return true
    }
    return Reflect.set(target, key, value, receiver)
  },
  deleteProperty(target, key) {
    if (typeof key === "string") target.deleteProp(key)
    return true
  },
  ownKeys(target) {
    return target.keys()
  },
  getOwnPropertyDescriptor(target, key) {
    if (typeof key === "string" && target[RECORD].has(key)) {
      return { value: target[RECORD].get(key), enumerable: true, configurable: true, writable: true }
    }
    return Reflect.getOwnPropertyDescriptor(target, key)
  }
}

function isProp(target: ThingA, key: string) {
  return target[RECORD].has(key) || !!(target.constructor as typeof ThingA).schema.info(key)
}

class ThingP extends ThingA {
  constructor(props: Record<string, unknown> = {}) {
    super()
    const proxy = new Proxy(this, PROXY_HANDLER)
    for (const key in props) proxy.setProp(key, props[key])
    return proxy
  }
}

class CardP extends ThingP {
  static schema = CardA.schema
  declare suit: string
  declare rank: number
  get color() {
    colorRuns++
    return this.suit === "hearts" || this.suit === "diamonds" ? "red" : "black"
  }
  get label() {
    return `${this.rank} of ${this.suit} (${this.color})`
  }
  turnOver() {
    return this.rank
  }
}

/** A `#private` field breaks under a proxy:  `this` in a method is the proxy, which has no private slot. */
class PrivateP {
  #secret = 1
  constructor() {
    return new Proxy(this, {})
  }
  reveal() {
    return this.#secret
  }
}

////////////////
// ## Strategy P2:  EVERY prop through the proxy, wrapped first
//    - the base constructor wraps BEFORE anything else runs:  props, `create()` and registration all see the proxy
//    - subclass field initializers land in the `defineProperty` trap:  a default, applied only if the key is unset
//    - fast path:  prototype members (methods, getters) skip the record entirely
//    - `#private` fields:  banned in Thing subclasses (compiled spell never emits them)
////////////////

const PROTO_KEYS = new WeakMap<object, Set<PropertyKey>>()

/** The instance's own cached copy of `protoKeys()`:  one property read per trap instead of a `WeakMap` lookup. */
const PROTO = Symbol("protoKeys")

/** Every key on the prototype chain below `Object.prototype`:  methods, getters, setters. */
function protoKeys(target: object): Set<PropertyKey> {
  const proto = Object.getPrototypeOf(target)
  let keys = PROTO_KEYS.get(proto)
  if (keys) return keys
  keys = new Set()
  for (let p = proto; p && p !== Object.prototype; p = Object.getPrototypeOf(p)) {
    for (const key of Reflect.ownKeys(p)) keys.add(key)
  }
  PROTO_KEYS.set(proto, keys)
  return keys
}

const P2_HANDLER: ProxyHandler<ThingA> = {
  get(target, key, receiver) {
    if (typeof key !== "string" || (target as any)[PROTO].has(key)) return Reflect.get(target, key, receiver)
    return target.getProp(key) // tracked even when unset, so a later first write notifies
  },
  set(target, key, value, receiver) {
    if (typeof key !== "string" || (target as any)[PROTO].has(key)) return Reflect.set(target, key, value, receiver)
    target.setProp(key, value)
    return true
  },
  defineProperty(target, key, descriptor) {
    if (typeof key !== "string" || !("value" in descriptor)) return Reflect.defineProperty(target, key, descriptor)
    if (!target[RECORD].has(key)) target.setProp(key, descriptor.value) // field initializer = default if unset
    return true
  },
  has(target, key) {
    return (typeof key === "string" && target[RECORD].has(key)) || Reflect.has(target, key)
  },
  deleteProperty(target, key) {
    if (typeof key === "string") target.deleteProp(key)
    return true
  },
  ownKeys(target) {
    return target.keys()
  },
  getOwnPropertyDescriptor(target, key) {
    if (typeof key === "string" && target[RECORD].has(key)) {
      return { value: target[RECORD].get(key), enumerable: true, configurable: true, writable: true }
    }
    return Reflect.getOwnPropertyDescriptor(target, key)
  }
}

class ThingP2 extends ThingA {
  static registry = new Set<object>()

  constructor(props: Record<string, unknown> = {}) {
    super()
    ;(this as any)[PROTO] = protoKeys(this)
    const self = new Proxy(this, P2_HANDLER)
    ThingP2.registry.add(self) // registration sees the proxy, not the raw target
    Object.assign(self, props) // through the `set` trap
    self.create() // `this` in create() is the proxy
    return self
  }

  create() {}
}

class CardP2 extends ThingP2 {
  static schema = CardA.schema
  declare suit: string
  declare rank: number
  declare created: string
  nickname = "none" // an initializer:  default only

  create() {
    this.created = `${this.rank} of ${this.suit}`
    if (this.rank === 13) this.nickname = "King"
  }

  get color() {
    return this.suit === "hearts" || this.suit === "diamonds" ? "red" : "black"
  }
  get label() {
    return `${this.rank} of ${this.suit} (${this.color})`
  }
  turnOver() {
    return this.rank
  }
}

////////////////
// ## Correctness
////////////////

for (const [name, Card] of [
  ["A", CardA],
  ["P", CardP],
  ["P2", CardP2]
] as const) {
  const card = new Card({ rank: 7 }) as CardA
  const drawn: string[] = []
  createRoot(() =>
    createRenderEffect(
      () => card.label,
      (value: string) => {
        drawn.push(value)
      }
    )
  )
  flushAll()
  card.suit = "spades"
  const immediate = card.label
  flushAll()
  log(`${name}: set->read "${immediate}", DOM after flush "${drawn.at(-1)}", draws ${drawn.length}`)

  const keysSeen: string[][] = []
  const thing = new Card() as CardA
  createRoot(() =>
    createRenderEffect(
      () => thing.keys(),
      (keys: string[]) => {
        keysSeen.push(keys)
      }
    )
  )
  flushAll()
  thing.suit = "clubs"
  thing.rank = 3
  thing.setProp("nickname", "Ace")
  flushAll()
  thing.suit = "diamonds" // overwrite:  same order, keys readers NOT re-run
  flushAll()
  thing.deleteProp("rank") // delete:  key comes out
  flushAll()
  thing.rank = 9 // re-add:  appended at the end
  flushAll()
  log(`${name}: keys over time ${JSON.stringify(keysSeen)}`)
  if (name !== "A") log(`${name}: Object.keys(proxy) ${JSON.stringify(Object.keys(thing))}`)
}

{
  const card = new CardA({})
  card.setProp("rank", "seven") // declared number:  warn
  card.setProp("score", 10)
  card.setProp("score", 11)
  card.setProp("score", "high") // undeclared:  widens to "number | text", warns
  const schema = CardA.schema
  log(`types:  rank ${schema.typeOf("rank")}, score ${schema.typeOf("score")}, warnings ${schema.typeWarnings}`)
}

{
  // Only on differences?  hearts -> diamonds leaves the color "red";  -> clubs makes it "black"
  const card = new CardA({})
  let plainRuns = 0
  let cachedRuns = 0
  createRoot(() => {
    createRenderEffect(
      () => (plainRuns++, card.color),
      () => {}
    )
    createRenderEffect(
      () => (cachedRuns++, card.cachedColor),
      () => {}
    )
  })
  flushAll()
  card.suit = "diamonds"
  flushAll()
  const afterSame = [plainRuns, cachedRuns]
  card.suit = "clubs"
  flushAll()
  log(
    `cutoff:  after same-color write, plain getter reader ran ${afterSame[0]}x, memoized reader ran ${afterSame[1]}x;  ` +
      `after color change ${plainRuns}x / ${cachedRuns}x`
  )
}

{
  const plain = new CardP2({ rank: 7 })
  const king = new CardP2({ rank: 13 })
  const named = new CardP2({ nickname: "Ace" })
  log(
    `P2: create() saw "${plain.created}";  nicknames:  default "${plain.nickname}", set in create() "${king.nickname}", ` +
      `ctor prop "${named.nickname}";  registry has the proxy:  ${ThingP2.registry.has(plain)};  ` +
      `keys ${JSON.stringify(Object.keys(king))};  JSON ${JSON.stringify(king)}`
  )
}

try {
  new PrivateP().reveal()
  log("P: #private under proxy OK")
} catch (error) {
  log(`P: #private under proxy THROWS ${(error as Error).constructor.name}:  ${(error as Error).message}`)
}

{
  const raw = new Set<object>()
  const card = new CardP({})
  raw.add(card)
  log(
    `P: identity -- proxy is what 'new' returned, Set.has ${raw.has(card)};  but 'this' in the base constructor was the raw target`
  )
}

log(PERF_HEADER)
perf("A", CardA)
perf("P", CardP)
perf("P2", CardP2)
