# Code debt

Long-term structural debt -- things we know are wrong, have decided NOT to fix right now,
and do not want to rediscover from scratch every few months.

This is durable project documentation.  Unlike `SUSPECTED-BUGS.md` (a disposable scratch list
of possible bugs), entries here are verified and stay until the underlying work is actually done.

## What goes here

Add an entry when ALL of these are true:

- it is **structural** -- spans several files, or is a shape/convention problem rather than a
  local mistake
- it is **too big to fix in passing** -- fixing it is its own task, not a detour inside another one
- it is **known and tolerated** -- we understand the cause and have chosen to live with it,
  so the next person needs the reasoning, not a rediscovery

Typical triggers:

- a refactor exposes a fragility we decide not to chase, e.g. the `BROKEN_ENTRIES` circular
  imports below
- a test or lint rule gets **pinned, skipped or widened** to accommodate a known problem --
  pinning records the damage, this file records the intent to undo it
- a convention in `AGENTS.md` is knowingly violated, and the violation is too wide to fix now

## What does NOT go here

- **local** cleanups -- use an inline `REFACTOR:` marker at the code, where it will be seen
- **suspected bugs** -- `SUSPECTED-BUGS.md`
- **tooling papercuts** -- `PAPERCUTS.md`
- anything you are about to fix anyway

## Entry format

One `##` heading per item, `---` between items, then:

- **Cost** -- what we pay for leaving it
- **Cause** -- the actual mechanism, not a guess
- **Fix** -- the shape of the real solution
- **Pinned at** -- where the problem is currently recorded or worked around

---

## Circular imports through the `~/parser` barrel

- **Cost**: six sub-paths of `~/parser` cannot be imported before `~/parser` itself without
  silently corrupting the barrel.  Latent rather than live: every consumer outside the barrel
  enters via `~/parser`, which is always safe.  It is a trap for new code and for test authors.
- **Cause**: nearly every leaf under `~/parser` does `import { P } from "~/parser"` -- a VALUE
  import of its own barrel.  Entering at a sub-path starts the
  `index` -> sub-barrel -> leaf -> `index` cycle before the leaf's bindings exist.  Damage takes
  two shapes: a leaf throws outright (`Literal extends Rule` extends `undefined`), or a sub-barrel
  silently truncates and the missing names never come back.
- **Fix**: leaves should not import their own barrel as a value.  Use `import type { P }` where
  only types are needed, and import base classes directly from their defining files.  This is
  already the documented convention in `AGENTS.md` -- it is just not applied consistently.
  NOTE: the obvious partial fixes do not work.  `AST.tsx` needs `P.Match` and three `Scope`
  subclasses at runtime, but `Match.ts` and the scope files import the barrel as a value
  themselves, so importing them directly only relocates the cycle.  This is all-or-nothing.
- **Pinned at**: `BROKEN_ENTRIES` in `parser/barrel.test.ts` -- `~/parser/rules`,
  `~/parser/rules/Rule`, `~/parser/rules/Literal`, `~/parser/tokenizer`, `~/parser/scope`,
  `~/parser/ast`.

### Sub-item: `export *` makes the truncation permanent

- **Cost**: flattening a namespaced sub-barrel to `export *` costs a safe entry point.
  `~/parser/ast` moved into `BROKEN_ENTRIES` exactly this way, when its AST classes were
  flattened out of `export * as AST`.  (`~/parser/tokenizer` was already listed, for the
  parent reason above.)
- **Cause**: a named re-export (`export { X } from "./X"`) compiles to a LAZY getter, so the key
  exists on the sub-barrel even while the leaf is mid-body.  `export *` must read the leaf's key
  list EAGERLY, and a mid-body leaf has no keys yet -- so nothing is re-exported, ever.
- **Fix**: falls out of the parent item.  Once leaves stop importing the barrel as a value,
  `export *` is safe everywhere.
- **Pinned at**: same `BROKEN_ENTRIES` list; the mechanism is written up there and in `AGENTS.md`.

---

## `systemFilesRoot` / `userFilesRoot` are the same directory

- **Cost**: the server's owner-based split between system and user files is a no-op.  Code that
  looks like it enforces a boundary does not, which is a security-shaped illusion.
- **Cause**: `environment.ts` sets both to `srcDir`, deliberately and for now.
- **Fix**: give user files their own root and make `project-utils.ts` honor the split, or delete
  the two constants so no one trusts a boundary that isn't there.
- **Pinned at**: `NOTE:` above the assignment in `environment.ts`.

---

## `Token.start` duplicates `Token.offset`

- **Cost**: two names for one value across ~16 call sites, so neither reads as authoritative and
  new code picks arbitrarily.
- **Cause**: `get start()` returns `this.offset` and nothing else.  History unknown.
- **Fix**: pick one name, migrate call sites, delete the other.  Small but wide -- hence here
  rather than as a passing cleanup.
- **Pinned at**: `REFACTOR:` marker on `Token.start` in `parser/tokenizer/Tokens.ts`.
