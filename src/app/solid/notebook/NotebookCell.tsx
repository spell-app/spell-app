import { For, Loading, Match, Show, Switch, createEffect, onCleanup } from "solid-js"
import type { monaco } from "spell-app/app/ui/monaco"

import { appTexts } from "spell-app/app/ui/AppTexts"
import { LazyMonaco } from "spell-app/app/solid/LazyMonaco"
import type { NotebookController } from "./NotebookController"
import type { CodeView } from "./NotebookCode"
import type { PageCell } from "./NotebookPageCells"

/****************
 * ### `<NotebookCell>`
 * One cell of a notebook's page (epic `elemental-spell` P16), by its key:  what it shows, by its kind.
 * - `prose`:  its markdown.
 *   The text just before an example is that example's description, shown in it (`<ExampleDescription>`).
 * - `heading`:  nothing of its own (the page draws the title, or its section's title).
 * - A `<text>` that's an example's description draws nothing here:  it shows in its example.
 * - `template`:  its code, in the page's code view (editable in spellx).
 * - `drawing`:  what it draws, live, in its own place (`NotebookController.attach()`);  its examples' code in each
 *   example's frame (`<ExampleCode>`).
 * - `html`, `member`:  their code;  an `<html>` block's drawing under it.
 * - Its errors, from its last edit, under its code:  what's drawn stays the last good drawing.
 ****************/
export function NotebookCell(props: {
  controller: NotebookController
  key: string
  cell: PageCell
  heading?: boolean
}) {
  const { controller } = props
  return (
    <div class={["NotebookCell", props.cell.kind]} data-cell-key={props.key}>
      <Show when={controller.held()[props.key] !== undefined}>
        <div class="NotebookHeld" role="status">
          <span>{appTexts.text("notebookPageChangedElsewhere")}</span>
          <ui-button size="mini" appearance="basic" onClick={() => controller.takeTheirs(props.key)}>
            {appTexts.text("notebookPageTakeTheirs")}
          </ui-button>
          <ui-button size="mini" appearance="basic" onClick={() => controller.keepMine(props.key)}>
            {appTexts.text("notebookPageKeepMine")}
          </ui-button>
        </div>
      </Show>
      <Switch>
        <Match when={props.cell.kind === "prose"}>
          <Show when={!controller.isDescription(props.key) && proseShown(props.cell, props.heading)}>
            {(text) => <ui-markdown class="NotebookProse">{text()}</ui-markdown>}
          </Show>
        </Match>
        <Match when={props.cell.kind === "heading"}>{null}</Match>
        <Match when={props.cell.kind === "template"}>
          <div class="NotebookCellLabel">
            <ui-icon name="cube" />
            {props.cell.name}
          </div>
          <Show when={props.cell.groups}>
            {(groups) => (
              <dl class="NotebookGroups">
                <For each={groups()}>
                  {(group) => (
                    <div class="NotebookGroup">
                      <dt>{group.name}</dt>
                      <Show when={group.description}>
                        <dd class="NotebookGroupDescription">{group.description}</dd>
                      </Show>
                      <dd>{group.members.join(" · ")}</dd>
                    </div>
                  )}
                </For>
              </dl>
            )}
          </Show>
          <CodeOf controller={controller} key={props.key} cell={props.cell} />
        </Match>
        <Match when={props.cell.kind === "drawing"}>
          <Show when={!controller.isDescription(props.key)}>
            <div
              class="NotebookResultHost"
              ref={(host) => {
                controller.attach(props.key, host)
                onCleanup(() => controller.detach(props.key))
              }}
            />
          </Show>
        </Match>
        <Match when={true}>
          <CodeOf controller={controller} key={props.key} cell={props.cell} />
          <Show when={props.cell.kind === "html"}>
            <div
              class="NotebookResultHost"
              ref={(host) => {
                controller.attach(props.key, host)
                onCleanup(() => controller.detach(props.key))
              }}
            />
          </Show>
        </Match>
      </Switch>
      <Errors errors={controller.errors()[props.key]} />
    </div>
  )
}

/** A cell's whole code, in the page's view:  editable only in spellx. */
function CodeOf(props: { controller: NotebookController; key: string; cell: PageCell }) {
  const view = () => props.controller.codeView()
  const editable = () => view() === "spellx"
  return (
    <CellEditor
      code={props.controller.cellCode(props.cell)}
      language={LANGUAGES[view()]}
      readOnly={!editable()}
      onChange={(code) => props.controller.editCell(props.key, code)}
    />
  )
}

/****************
 * ### `<ExampleDescription>`
 * An example's description:  the text of the prose cell before it, shown as its description
 * (`<spell-example>`'s `description` slot), as a component page's example reads.
 * - Only the first example of its cell has one (`NotebookController.descriptionFor()`).
 * - Its panel is slotted only while there's text:  an empty description takes no room.
 ****************/
export function ExampleDescription(props: {
  controller: NotebookController
  key: string
  index: number
  panel: HTMLElement
}) {
  const { controller } = props
  const description = () => (props.index === 0 ? controller.descriptionFor(props.key) : undefined)
  createEffect(description, (shown) => {
    props.panel.slot = shown ? "description" : NO_SLOT
  })
  return (
    <Show when={description()}>
      {(shown) => <ui-markdown class="NotebookExampleDescription">{shown().text}</ui-markdown>}
    </Show>
  )
}

/****************
 * ### `<ExampleCode>`
 * An example's code, in its code pane (`<spell-example>`'s `source` slot), which its `</>` button rolls open
 * under its result:  the page's code view, and a small switch for it at the pane's top right.
 * - Flipping the switch here flips every example's:  remembered per notebook.
 * - ALWAYS editable, in spellx or html (mapped back to spellx);  spell is read only.
 *   Typing draws the example above it again, as it's typed.
 *   - Unlocked:  saved.  Locked:  a try-out, never saved;  a small Reset beside the switch puts its code back as
 *     the file has it (Owen, 2026-10-26:  "Yes as try-out.  If doc is locked, nothing is ever saved").
 * - Made once per example and MOVED into its example each time it draws again (`NotebookController`):
 *   typing in it never loses its place.
 ****************/
export function ExampleCode(props: { controller: NotebookController; key: string; index: number }) {
  const { controller } = props
  const cell = () => controller.cellFor(props.key)
  const view = () => controller.codeView()
  const editable = () => view() !== "spell"
  return (
    <div class="NotebookExampleCode" onClick={(event) => event.stopPropagation()}>
      <div class="NotebookExampleBar">
        <Show when={controller.triedOutExample(props.key, props.index) !== undefined}>
          <ui-button
            class="NotebookReset"
            size="tiny"
            appearance="basic"
            icon="undo"
            title={appTexts.text("notebookPageResetTip")}
            onClick={() => controller.resetExample(props.key, props.index)}
          >
            {appTexts.text("notebookPageReset")}
          </ui-button>
        </Show>
        <CodeViewSwitch controller={controller} size="tiny" />
      </div>
      <Show when={cell()}>
        {(shown) => (
          <CellEditor
            code={controller.exampleCode(shown(), props.index)}
            language={LANGUAGES[view()]}
            readOnly={!editable()}
            flush
            onChange={(code) => controller.editExample(props.key, props.index, code)}
          />
        )}
      </Show>
    </div>
  )
}

/** The switch between the code views, spellx / spell / html:  each example's, flipping them all. */
export function CodeViewSwitch(props: { controller: NotebookController; size?: "tiny" | "small" }) {
  return (
    <ui-buttons
      size={props.size ?? "small"}
      appearance="basic"
      class="NotebookViewSwitch"
      aria-label={appTexts.text("notebookPageCodeAs")}
    >
      <For each={VIEWS}>
        {(view) => (
          <ui-button
            padding="compact"
            selected={props.controller.codeView() === view}
            color={props.controller.codeView() === view ? "primary" : undefined}
            title={`${appTexts.text("notebookPageCodeAs")} ${view}`}
            onClick={(event: MouseEvent) => {
              event.stopPropagation()
              props.controller.setCodeView(view)
            }}
          >
            {view}
          </ui-button>
        )}
      </For>
    </ui-buttons>
  )
}

/****************
 * ### `<CellEditor>`
 * A cell's code in a small Monaco editor, as tall as its lines (at most 30), no line numbers or minimap.
 * - `readOnly` follows its prop:  switching to an editable view makes it editable, without a new editor.
 * - Marked `data-spell-editor`:  a change from outside the page never replaces it while it's open (epic-engine P40's
 *   shared rules).
 * - Until Monaco's loaded, its code as plain text.
 ****************/
export function CellEditor(props: {
  code: string
  language: string
  readOnly: boolean
  onChange: (code: string) => void
  /** its text flush with its box's left edge, no margin before it:  an example's code, under its demo */
  flush?: boolean
}) {
  let instance: monaco.editor.IStandaloneCodeEditor | undefined
  const lines = () => Math.min(MOST_LINES, props.code.split("\n").length)
  createEffect(
    () => props.readOnly,
    (readOnly) => {
      instance?.updateOptions({ readOnly })
    }
  )
  return (
    <div class="NotebookCode" data-spell-editor="" style={{ height: `${lines() * LINE_HEIGHT + 12}px` }}>
      <Loading fallback={<pre class="NotebookCodeLoading">{props.code}</pre>}>
        <LazyMonaco.MonacoEditor
          value={props.code}
          language={props.language}
          options={{ ...CODE_OPTIONS, ...(props.flush ? FLUSH_OPTIONS : {}), readOnly: props.readOnly }}
          onChange={(code) => props.onChange(code)}
          onMount={(editor) => {
            instance = editor
          }}
        />
      </Loading>
    </div>
  )
}

/** A cell's errors from its last edit, one a line;  nothing with none. */
function Errors(props: { errors: string[] | undefined }) {
  return (
    <Show when={props.errors?.length}>
      <ul class="NotebookErrors" role="alert">
        <For each={props.errors}>{(error) => <li>{error}</li>}</For>
      </ul>
    </Show>
  )
}

/** A prose cell's markdown as shown:  a section's heading cell without its heading, which its section shows. */
function proseShown(cell: PageCell, heading: boolean | undefined): string | undefined {
  const text = heading ? cell.code.split("\n").slice(1).join("\n").trim() : cell.code
  return text || undefined
}

/** The views, in the switch's order. */
const VIEWS: readonly CodeView[] = ["spellx", "spell", "html"]

/** A slot no example has:  an example's panel with nothing to show goes there, out of sight. */
const NO_SLOT = "none"

/** Monaco's language for each code view. */
const LANGUAGES: Record<CodeView, string> = { spellx: "spellx", spell: "spell", html: "html" }

/** Most lines an editor shows before it scrolls. */
const MOST_LINES = 30

/** Height of a line in a cell's editor, px. */
const LINE_HEIGHT = 20

/** An example's editor:  its text starts where its demo's does, as a component page's example code does. */
const FLUSH_OPTIONS = { glyphMargin: false, lineDecorationsWidth: 0, lineNumbersMinChars: 0 } as const

/** A cell's editor:  no line numbers, minimap or scrolling past the end;  it follows its box's size. */
const CODE_OPTIONS = {
  fontSize: 13,
  lineHeight: LINE_HEIGHT,
  lineNumbers: "off",
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  folding: false,
  automaticLayout: true,
  // a long line wraps, rather than run off the cell's edge with nothing to say so
  wordWrap: "on",
  renderLineHighlight: "none",
  overviewRulerLanes: 0,
  scrollbar: { alwaysConsumeMouseWheel: false }
} as const
