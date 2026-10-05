# WWOD spoke — Models & records + actions

House rules for JSON records, undo, and action/shortcut maps.
Read with `.agents/WWOD.md` (the hub).

## 16. Models & records

- **JSON file records carry `record_type`** (`Circuit.types.ts`).
  - Versions in `const X_RECORD_TYPES = [...] as const` + `CURRENT_RECORD_TYPE` + `isXJSON()`
    guard.
  - Migration via `circuit.normalizeRecord()` dispatching to `upgradeV1Record`/`upgradeV2Record`.
- **`updateRecord(changes)` uses a `DELETE_VALUE` sentinel** for unset; only notify
  `if (somethingChanged)`.
- **`toJSON()` deep-clones**, recursively re-serializes children, prunes empty state keys.
- **Publish support mirrors across models:**
  - `get publishBlock()` / `setPublishBlock()` / `removePublishBlock()`.
  - "Save a Copy" strips the block via the one shared `clearPublishBlock()`, with the
    writeKey rationale in a comment.
- **Bracket access for known-untyped JSON keys only** (`record["gate_type"]`).
- **Compact domain encodings**: module-private single-char consts + `typeof` union + name
  map, not an enum (`Coverage.ts`).
- **Circuits: Every mutator takes trailing `undo: UndoOptions = {}`:**
  - Defaults `undo.undoAction` in place.
  - Wraps its body in `trackUndoableChange(() => {…}, undo)`.
  - Nested calls pass `{ skipUndo: true }` with `// do a single undo at the end`.

## 17. Actions & shortcuts

- **`getXActions(model): ActionSetup`**
  - Opens by destructuring controllers (`const { ui, cd } = circuit`).
  - Returns `{ actions, menus }`; menus reference `actions.foo` with `"-"` separators.
- **Action specs**:
  - plain string props when static
  - `get title()` / `get icon()` when they depend on live state
  - `selected()` method; `enabled: () => …` arrow.
- **`shortcuts` is an OS-keyed map with `default` fallback**:
  `{ apple: [...], windows: [...], default: [...] }`.
  - List every accepted binding (`Numpad*`).
- **`enableInInput: true`** only on actions that must fire inside form fields (save, add\*).
- **Keep impossible shortcuts commented out with the reason**
  (`// Can't trap cmd-N in Chrome`).
- **Tooltips/help accept markdown** (`**bold**`); shared help text is an exported array of
  bullet strings next to the fields that use it (`node-field-helpers.ts`).
