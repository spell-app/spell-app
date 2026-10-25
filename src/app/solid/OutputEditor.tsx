import { Loading, Show } from "solid-js"

import { SP } from "spell-parser/spell"
import { SX } from "spell-parser/spellx"
import { editor } from "spell-app/app/editor"
import { appTexts } from "spell-app/app/ui/AppTexts"
import { ErrorBoundary, MenuHeader, PanelMenu, Submenu, tracked } from "spell-app/app/solid"
import { LazyMonaco } from "./LazyMonaco"

import "./OutputEditor.css"

/****************
 * ### `<OutputRoot>`
 * Root element to show the `<OutputEditor/>` in `SpellEditor`:  the "Javascript Output" pane.
 ****************/
export function OutputRoot(props: OutputRootProps) {
  return (
    <div class="OutputRoot">
      <Show when={props.showToolbar ?? true}>
        <OutputToolbar />
      </Show>
      <OutputEditor showError={editor.showError} />
    </div>
  )
}

/** Props for `<OutputRoot>`. */
export type OutputRootProps = {
  /** Show `<OutputToolbar>` above editor.  Default:  `true`. */
  showToolbar?: boolean
}

/****************
 * ### `<OutputToolbar>`
 * Toolbar above `<OutputEditor>`:  just a header today (no actions).
 ****************/
export function OutputToolbar() {
  return (
    <PanelMenu>
      <Submenu left spring>
        <MenuHeader>{appTexts.text("javascriptOutput")}</MenuHeader>
      </Submenu>
    </PanelMenu>
  )
}

/****************
 * ### `<OutputEditor>`
 * Read-only Monaco showing `editor.file`'s compiled javascript, guarded by an `<ErrorBoundary>`;
 * or, with `target`, the whole project's code for that target, written after each compile (`project.codeFor()`);
 * or, with `target="spell"`, the code spell `editor.file` means:  a `.spellx` file's, written from its tags' twins.
 * - Coloured by Monaco's own highlighting for the language;  it doesn't follow the cursor in `<InputEditor>`.
 * - A target whose writer can't write the project shows why, as a comment, instead of its code.
 * - SEE:  its App UI components page, `app/docs/OutputEditor.html` (`/components/app/OutputEditor.html`).
 ****************/
export function OutputEditor(props: OutputEditorProps) {
  // read once:  `tracked()` follows spell cells, not Solid's props;  a tab shows one target for its life
  const { target } = props
  const code = tracked(() => {
    if (target === "spell") {
      // read so a compile writes it afresh, as the targets' code
      void editor.project?.compiled
      return codeSpellOf(editor.file)
    }
    if (!target) {
      const { file } = editor
      return (file && "compiled" in file ? file.compiled : undefined) ?? ""
    }
    const { project } = editor
    // read so a compile writes it afresh:  `codeFor()` writes from the files as last compiled
    if (!project?.compiled) return ""
    try {
      return project.codeFor(target)
    } catch (error) {
      return `${TARGET_LOOKS[target].comment} ${error instanceof Error ? error.message : String(error)}\n`
    }
  })
  return (
    <div class="OutputEditor">
      <ErrorBoundary onError={(error) => props.showError?.(error)}>
        <Loading fallback={<LazyMonaco.Loading />}>
          <LazyMonaco.MonacoEditor
            value={code()}
            language={target ? TARGET_LOOKS[target].language : "javascript"}
            options={{ readOnly: true }}
          />
        </Loading>
      </ErrorBoundary>
    </div>
  )
}

/** Props for `<OutputEditor>`. */
export type OutputEditorProps = {
  /** Called with each error caught. */
  showError?: (error: unknown) => void
  /** The project's code for this target instead of the file's javascript, e.g. `py`. */
  target?: OtherTarget
}

/** A target `<OutputEditor>` can show besides javascript (`SP.TARGETS`). */
export type OtherTarget = keyof typeof TARGET_LOOKS

/** Each other target's Monaco language, and how its comments start. */
const TARGET_LOOKS = {
  "ts/solid": { language: "typescript", comment: "//" },
  py: { language: "python", comment: "#" },
  // not a target:  the code spell a `.spellx` file means (epic `elemental-spell` P8)
  spell: { language: "spell", comment: "//" }
} as const

/**
 * The code spell `file` means, as text:  a `.spellx` file's, written from its tags' twins (`SX.CodeSpellWriter`);
 * any other spell file's own text;  nothing for a file that isn't spell.
 * - Its project's packs name its drawings' components;  its own views keep their bare names here
 *   (VS Code's view takes them from the parse).
 * - NEVER throws:  a file that can't be written says why, as a comment.
 */
function codeSpellOf(file: typeof editor.file): string {
  if (!(file instanceof SP.SpellFile)) return ""
  const text = file.contents ?? ""
  if (file.form !== "spellx") return text
  try {
    return SX.CodeSpellWriter.write(text, { path: file.path, language: file.language })
  } catch (error) {
    return `// ${file.file}:  ${error instanceof Error ? error.message : String(error)}\n`
  }
}
