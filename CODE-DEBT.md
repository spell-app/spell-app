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

## Enumerated properties are reachable under inconsistent names

`cards have a suit as one of clubs, diamonds` is meant to make BOTH `the suits of the card` (instance) and
`card suits` / `is in card suits` (class) work.  Checked by compiling each form, 2026-09-27:

| Spell                                                 | Compiles to                  | Works?                                   |
|-------------------------------------------------------|------------------------------|------------------------------------------|
| `card suits`, `x is in card suits`                    | `Card.Suits`                 | yes                                      |
| `the suits of the card`, `its suits`                  | `card.suits`, `this.suits`   | NO -- runtime defines `prototype.Suits`  |
| `bank-account account-types` (dashed names)           | no match                     | NO -- only `bank_account account_types`  |
| `the number of card suits`                            | `Card.Suits.number`          | NO -- `the {property} of` wins           |

- **Cost**:  the instance form is `undefined` at runtime;  types or properties with a dash can't use the class
  form as written;  counting an enumeration silently compiles to a property read.
- **Cause**:
  - `define_property_has` (`classes.ts`) names the enumeration `pluralize(upperFirst(property.value))`, e.g.
    `Suits` / `Account_types`, and passes it as `enumerationProp`.  `spellCore.defineProperty()` (`core.ts`)
    defines THAT name on both `Card.prototype` and `Card` -- but the instance form compiles through the
    `property` rule, which is lower-case (`suits`).
  - Its generated `typename_groupname` rule matches literals `[typeName, typeName.toLowerCase()]` and
    `[groupName, groupName.toLowerCase()]` -- values, with underscores -- so the dashed words a user types
    never match.
  - `the? number of {arg:plural_identifier} (in|of) {list}` (`lists.ts`) needs `number of X in Y`;
    `the number of card suits` falls to `the {property} of {expression}` with property `number`.
  - The enumeration entry sits in the type's `variables` (instance) AND `classVariables`.  That's on purpose:
    `quoted_property_formula` (`a card "is a (suit)" for its suits`) finds the values through
    `types.get(type).variables.get("suits")`, and the language server resolves `its suits` to it the same way.
- **Fix**:  pick ONE naming rule for an enumeration -- instance `suits`, class `Suits`, written `card suits` /
  `bank-account account-types` -- and apply it in `define_property_has`'s generated rule, its `enumerationProp`,
  and `spellCore.defineProperty()`.  Then decide whether `the number of {expression}` should count.
- **Pinned at**:  nowhere yet -- no test covers the instance form or dashed names.
