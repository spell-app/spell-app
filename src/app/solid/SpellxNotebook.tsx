import { For, Loading, Show, createMemo, createSignal, onSettled, untrack } from "solid-js"

import { PrefStore } from "spell/util/persist/PrefStore"
import { appTexts, type AppTextKey } from "spell-app/app/ui/AppTexts"
import { LazyMonaco } from "./LazyMonaco"
import { Markdown } from "./Markdown"
import { NotebookCells, type ChunkCell, type NotebookCell, type PropertyForm } from "./NotebookCells"

import "./SpellxNotebook.css"

/****************
 * ### `<SpellxNotebook>`
 * A `.spellx` file as a NOTEBOOK (epic `elemental-spell` P11, J53):  cells down the page, like Jupyter's.
 * - Its prose is drawn as markdown;  each template and member is a CARD that folds,
 *   its code in a small editor, edited in place.
 * - A template's card holds its members:  open, it shows its own head as code, then its prose and member cards;
 *   folded, only its title.
 * - A `<property>` card shows a form instead:  its name, its values, its aliases, then its body as code;
 *   "Show the code" shows its whole text.
 * - A card's header opens and folds it, anywhere on it;  its tools (form / code, move up, move down)
 *   show while it's pointed at, focused or open, and always on a touch screen.
 * - Cards move up and down among their template's members;  prose stays where it is.
 * - Every edit is the file's NEW TEXT, changed only in the card's span (`NotebookCells`), handed to `onChange`:
 *   the editor treats it as typed, so the parse, the running program and the Text view follow.
 * - Which cards are open, and where it was scrolled, is kept per file in this browser
 *   (`spellEditor:notebook:<path>`), so a switch to Text and back, or a reload, finds it as it was.
 * - Knows nothing of the editor:  `<NotebookRoot>` (in `InputEditor.tsx`) feeds it `editor.file`.
 ****************/
export function SpellxNotebook(props: SpellxNotebookProps) {
  const cells = createMemo(() => NotebookCells.of(props.text, props.path))
  const saved = untrack(() => loadState(props.path))
  const [open, setOpen] = createSignal<string[]>(saved.open)
  /** Cards showing their code rather than their form. */
  const [asCode, setAsCode] = createSignal<string[]>([])
  let scroller: HTMLDivElement | undefined
  onSettled(() => {
    if (scroller) scroller.scrollTop = saved.scroll
  })
  return (
    <div class="SpellxNotebook" ref={(element) => (scroller = element)} onScroll={() => keep()}>
      {cellsIn(undefined)}
    </div>
  )

  /** The cells inside template `templateId` (`undefined`:  outside every template), each drawn. */
  function cellsIn(templateId: string | undefined) {
    return (
      <For each={NotebookCells.membersOf(cells(), templateId)} keyed={(cell) => cell.id}>
        {(cell) => (
          <Show
            when={cell().kind === "chunk"}
            fallback={<Markdown class="NotebookProse" text={proseText(cell())} onOpen={() => {}} />}
          >
            {card(() => cell() as ChunkCell)}
          </Show>
        )}
      </For>
    )
  }

  /** Chunk `chunk`'s card:  its header, and (open) its code, form or members. */
  function card(chunk: () => ChunkCell) {
    return (
      <section class={["NotebookCard", { open: isOpen(chunk().id), template: !chunk().parentId }]}>
        <header class="NotebookCardHead" onClick={() => toggle(chunk().id)}>
          <ui-icon
            link=""
            class="NotebookChevron"
            name={isOpen(chunk().id) ? "chevron down" : "chevron right"}
            title={appTexts.text(isOpen(chunk().id) ? "notebookFold" : "notebookUnfold")}
            label={appTexts.text(isOpen(chunk().id) ? "notebookFold" : "notebookUnfold")}
          />
          <span class="NotebookCardWord">
            <ui-label size="mini" appearance="basic">
              {chunk().word}
            </ui-label>
          </span>
          <span class="NotebookCardTitle">{chunk().title}</span>
          <Show when={chunk().parentId}>
            <span class="NotebookCardTools" onClick={(event) => event.stopPropagation()}>
              <Show when={chunk().property}>
                {tool(
                  showsCode(chunk().id) ? "list" : "code",
                  showsCode(chunk().id) ? "notebookShowForm" : "notebookShowCode",
                  () => toggleCode(chunk().id)
                )}
              </Show>
              {tool("arrow up", "notebookMoveUp", () =>
                props.onChange(NotebookCells.moved(props.text, cells(), chunk(), "up"))
              )}
              {tool("arrow down", "notebookMoveDown", () =>
                props.onChange(NotebookCells.moved(props.text, cells(), chunk(), "down"))
              )}
            </span>
          </Show>
        </header>
        <Show when={isOpen(chunk().id)}>
          <Show when={chunk().parentId} fallback={templateBody(chunk)}>
            {memberBody(chunk)}
          </Show>
        </Show>
      </section>
    )
  }

  /** An open template's card:  its head as code, then its prose and members. */
  function templateBody(chunk: () => ChunkCell) {
    return (
      <>
        <CellCode
          code={chunk().code}
          onChange={(code) => props.onChange(NotebookCells.withCode(props.text, chunk(), code))}
        />
        <div class="NotebookMembers">{cellsIn(chunk().id)}</div>
      </>
    )
  }

  /** An open member's card:  a property's form and body, or its code. */
  function memberBody(chunk: () => ChunkCell) {
    return (
      <Show
        when={chunk().property && !showsCode(chunk().id)}
        fallback={
          <CellCode
            code={chunk().code}
            onChange={(code) => props.onChange(NotebookCells.withCode(props.text, chunk(), code))}
          />
        }
      >
        <PropertyEditor
          cell={chunk()}
          onChange={(form) => props.onChange(NotebookCells.withProperty(props.text, chunk(), form))}
        />
        <Show when={chunk().property?.body}>
          {(body) => (
            <CellCode
              code={body().code}
              onChange={(code) => props.onChange(NotebookCells.withCode(props.text, body(), code))}
            />
          )}
        </Show>
      </Show>
    )
  }

  /** A card's tool:  a plain icon, its text the tooltip. */
  function tool(icon: string, text: AppTextKey, run: () => void) {
    return (
      <ui-icon
        link=""
        class="NotebookTool"
        name={icon}
        title={appTexts.text(text)}
        label={appTexts.text(text)}
        onClick={() => run()}
      />
    )
  }

  /** Is card `id` open? */
  function isOpen(id: string): boolean {
    return open().includes(id)
  }

  /** Does card `id` show its code, not its form? */
  function showsCode(id: string): boolean {
    return asCode().includes(id)
  }

  /** Open or fold card `id`, and remember it. */
  function toggle(id: string) {
    // the next ids worked out first:  a read right after a write still gives the old value
    const ids = isOpen(id) ? open().filter((each) => each !== id) : [...open(), id]
    setOpen(ids)
    keep(ids)
  }

  /** Show card `id`'s code or its form. */
  function toggleCode(id: string) {
    setAsCode((ids) => (ids.includes(id) ? ids.filter((each) => each !== id) : [...ids, id]))
  }

  /** Remember which cards are open and where it's scrolled. */
  function keep(ids = open()) {
    saveState(props.path, { open: ids, scroll: scroller?.scrollTop ?? 0 })
  }
}

/** Props for `<SpellxNotebook>`. */
export type SpellxNotebookProps = {
  /** The `.spellx` file's text. */
  text: string
  /** Its path, which says its language (`Carta.es.spellx`) and keys what's remembered. */
  path: string | undefined
  /** Called with the file's new text after each edit. */
  onChange: (text: string) => void
}

/****************
 * ### `<CellCode>`
 * A card's code in a small editor, as tall as its lines (at most 24), no line numbers or minimap;
 * its background the card's.
 ****************/
function CellCode(props: { code: string; onChange: (code: string) => void }) {
  const lines = () => Math.min(24, props.code.split("\n").length)
  return (
    <div class="NotebookCode" style={{ height: `${lines() * LINE_HEIGHT + 12}px` }}>
      <Loading fallback={<pre class="NotebookCodeLoading">{props.code}</pre>}>
        <LazyMonaco.MonacoEditor
          value={props.code}
          language={SPELL_LANGUAGE}
          options={CODE_OPTIONS}
          onChange={(code) => props.onChange(code)}
        />
      </Loading>
    </div>
  )
}

/****************
 * ### `<PropertyEditor>`
 * A `<property>` card's form:  its name, its values (`one-of`), and its aliases, one field each and one to add.
 * - A field's change is committed when it's left or Enter is pressed (`ui-changed`), never per keystroke:
 *   so the file isn't rewritten under the cursor.
 * - Its body is code, in its own editor below the form (`<SpellxNotebook>`).
 ****************/
function PropertyEditor(props: { cell: ChunkCell; onChange: (form: PropertyForm) => void }) {
  const form = (): PropertyForm => {
    const { name, oneOf, aliases } = props.cell.property!
    return { name, oneOf, aliases }
  }
  return (
    <div class="NotebookProperty">
      <ui-field label={appTexts.text("notebookName")}>
        <ui-input
          value={form().name}
          on-ui-changed={(event: CustomEvent<{ value: string }>) => change({ name: event.detail.value })}
        />
      </ui-field>
      <ui-field label={appTexts.text("notebookOneOf")}>
        <ui-input
          value={form().oneOf}
          placeholder={appTexts.text("notebookOneOfHint")}
          on-ui-changed={(event: CustomEvent<{ value: string }>) => change({ oneOf: event.detail.value })}
        />
      </ui-field>
      <ui-field label={appTexts.text("notebookAliases")}>
        <For each={[...form().aliases, ""]} keyed={false}>
          {(alias, index) => (
            <ui-input
              value={alias()}
              placeholder={appTexts.text("notebookAliasHint")}
              on-ui-changed={(event: CustomEvent<{ value: string }>) => changeAlias(index, event.detail.value)}
            />
          )}
        </For>
      </ui-field>
    </div>
  )

  /** Write the form with `changes`. */
  function change(changes: Partial<PropertyForm>) {
    props.onChange({ ...form(), ...changes })
  }

  /** Write alias `index` as `value` (past the end:  a new one;  empty:  dropped). */
  function changeAlias(index: number, value: string) {
    const aliases = [...form().aliases]
    aliases[index] = value
    change({ aliases: aliases.filter((each) => each.trim()) })
  }
}

/** A prose cell's markdown;  a chunk's:  none. */
function proseText(cell: NotebookCell): string {
  return cell.kind === "prose" ? cell.text : ""
}

////////////////
// ## Remembered state
////////////////

/** What's remembered of a notebook, per file. */
type NotebookState = { open: string[]; scroll: number }

/** The remembered state of `path`'s notebook;  none:  every card folded, at the top. */
function loadState(path: string | undefined): NotebookState {
  try {
    const value = PrefStore.getAt(stateKey(path)) as Partial<NotebookState> | undefined
    return { open: Array.isArray(value?.open) ? value.open : [], scroll: Number(value?.scroll) || 0 }
  } catch (ignored) {
    return { open: [], scroll: 0 }
  }
}

/** Remember `state` for `path`'s notebook.  NEVER throws. */
function saveState(path: string | undefined, state: NotebookState) {
  try {
    PrefStore.setAt(stateKey(path), state)
  } catch (error) {
    console.error("SpellxNotebook:  couldn't remember its folds", error)
  }
}

/** The preference that remembers `path`'s notebook. */
function stateKey(path: string | undefined): string {
  return `spellEditor:notebook:${path ?? "untitled"}`
}

/** Height of a line in a card's editor, px:  for `CODE_FONT_SIZE`. */
const LINE_HEIGHT = 20

/** Size of a card's code, px:  the size of the notebook's text, a step under the Text view's. */
const CODE_FONT_SIZE = 13

/**
 * Monaco's language for spell code, `SpellMonaco.LANGUAGE`.
 * - A copy, NOT imported:  `spell-app/app/ui/monaco` loads Monaco, which must stay lazy.
 */
const SPELL_LANGUAGE = "spell"

/** A card's editor:  no line numbers, minimap or scrolling past the end;  it follows its box's size. */
const CODE_OPTIONS = {
  fontSize: CODE_FONT_SIZE,
  lineHeight: LINE_HEIGHT,
  lineNumbers: "off",
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  folding: false,
  automaticLayout: true,
  renderLineHighlight: "none",
  overviewRulerLanes: 0,
  scrollbar: { alwaysConsumeMouseWheel: false }
} as const
