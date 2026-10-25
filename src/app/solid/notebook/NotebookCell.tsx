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
 * - `prose`:  its markdown;  in edit mode, selected, its editor over it.
 * - `template`:  its code, in the page's code view (read only but in spellx, in edit mode).
 * - `drawing`:  what it draws, live, in its own place (`NotebookController.attach()`);  its examples' code in each
 *   example's frame (`<ExampleCode>`);  in edit mode, a selected one that isn't a lone example shows its code too.
 * - `html`, `member`:  their code;  an `<html>` block's drawing under it.
 * - A click selects it:  a focus ring, and the toolbar acts on it.
 * - Its errors, from its last edit, under its code:  what's drawn stays the last good drawing.
 ****************/
export function NotebookCell(props: {
  controller: NotebookController
  key: string
  cell: PageCell
  heading?: boolean
}) {
  const { controller } = props
  const isSelected = () => controller.selected() === props.key
  const isEditing = () => controller.editing()
  return (
    <div
      class={["NotebookCell", props.cell.kind, { selected: isSelected() && isEditing() }]}
      onClick={() => controller.select(props.key)}
    >
      <Switch>
        <Match when={props.cell.kind === "prose"}>
          <Show when={isEditing() && isSelected()}>
            <CellEditor
              code={props.cell.code}
              language="markdown"
              readOnly={false}
              onChange={(code) => controller.editCell(props.key, code)}
            />
          </Show>
          <Show when={proseShown(props.cell, props.heading)}>
            {(text) => <ui-markdown class="NotebookProse">{text()}</ui-markdown>}
          </Show>
        </Match>
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
          <Show when={isEditing() && isSelected() && !isLoneExample(props.cell)}>
            <CodeOf controller={controller} key={props.key} cell={props.cell} />
          </Show>
          <div
            class="NotebookResultHost"
            ref={(host) => {
              controller.attach(props.key, host)
              onCleanup(() => controller.detach(props.key))
            }}
          />
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

/** A cell's whole code, in the page's view:  editable only in spellx, in edit mode. */
function CodeOf(props: { controller: NotebookController; key: string; cell: PageCell }) {
  const view = () => props.controller.codeView()
  const editable = () => props.controller.editing() && view() === "spellx"
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
 * ### `<ExampleCode>`
 * An example's code, under its result in its frame (`<spell-example>`'s `code` slot):  the page's code view, and the
 * switch for it.
 * - Flipping the switch here flips the page's:  every example's code, and the toolbar's.
 * - Editable in edit mode, in spellx or html (mapped back to spellx before it's saved);  spell is read only.
 * - Made once per example and MOVED into its example each time it draws again (`NotebookController`):
 *   typing in it never loses its place.
 ****************/
export function ExampleCode(props: { controller: NotebookController; key: string; index: number }) {
  const { controller } = props
  const cell = () => controller.cellFor(props.key)
  const view = () => controller.codeView()
  const editable = () => controller.editing() && view() !== "spell"
  return (
    <div class="NotebookExampleCode" onClick={(event) => event.stopPropagation()}>
      <div class="NotebookExampleBar">
        <CodeViewSwitch controller={controller} />
      </div>
      <Show when={cell()}>
        {(shown) => (
          <CellEditor
            code={controller.exampleCode(shown(), props.index)}
            language={LANGUAGES[view()]}
            readOnly={!editable()}
            onChange={(code) => controller.editExample(props.key, props.index, code)}
          />
        )}
      </Show>
    </div>
  )
}

/** The switch between the code views, spellx / spell / html:  one for the whole page. */
export function CodeViewSwitch(props: { controller: NotebookController }) {
  return (
    <ui-buttons size="small" basic="" class="NotebookViewSwitch" aria-label={appTexts.text("notebookPageCodeAs")}>
      <For each={VIEWS}>
        {(view) => (
          <ui-button
            compact=""
            active={props.controller.codeView() === view}
            primary={props.controller.codeView() === view ? "" : undefined}
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
 * - `readOnly` follows its prop:  edit mode makes it editable, without a new editor.
 * - Marked `data-spell-editor`:  a change from outside the page never replaces it while it's open (epic-engine P40's
 *   shared rules).
 * - Until Monaco's loaded, its code as plain text.
 ****************/
export function CellEditor(props: {
  code: string
  language: string
  readOnly: boolean
  onChange: (code: string) => void
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
          options={{ ...CODE_OPTIONS, readOnly: props.readOnly }}
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

/** Is drawing cell `cell` one example and nothing else?  Its example's own code is its editor then. */
function isLoneExample(cell: PageCell): boolean {
  return cell.examples?.length === 1 && cell.examples[0]!.span.start === cell.span.start
}

/** The views, in the switch's order. */
const VIEWS: readonly CodeView[] = ["spellx", "spell", "html"]

/** Monaco's language for each code view. */
const LANGUAGES: Record<CodeView, string> = { spellx: "spellx", spell: "spell", html: "html" }

/** Most lines an editor shows before it scrolls. */
const MOST_LINES = 30

/** Height of a line in a cell's editor, px. */
const LINE_HEIGHT = 20

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
