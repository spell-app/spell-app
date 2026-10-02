import type { RouteSectionProps } from "@solidjs/router"

import {
  Actions,
  AppMenu,
  AppRoot,
  ASTRoot,
  ConsoleRoot,
  InputRoot,
  MatchRoot,
  MoreMenu,
  ProjectActionsDropdown,
  ProjectDropdown,
  SpellPage,
  SplitPanel,
  Submenu
} from "$/app/solid"
import { editorHotkeys } from "./editorHotkeys"
import { followRoute } from "./followRoute"

/****************
 * ### `<SpellEditor>`
 * The editing page:  `<InputRoot>` (the code) above `<ConsoleRoot>` (compile and run log) on the left;
 * `<AppRoot>` (the running program) above `<ASTRoot>` and `<MatchRoot>` (parse tree, match inspector) on the right.
 * - SIDE EFFECT:  the page's keyboard shortcuts while it's up, outside Monaco (`editorHotkeys()`).
 ****************/
export function SpellEditor() {
  editorHotkeys()
  return (
    <SpellPage id="SpellEditor" fillWindow dark rows>
      <EditorToolbar />
      <SplitPanel id="spellEditor-columns" columns resizable fluid spaced="tightly">
        <SplitPanel id="spellEditor-left" rows="85%" resizable rounded>
          <InputRoot />
          <ConsoleRoot />
        </SplitPanel>
        <SplitPanel id="spellEditor-right" rows="60%" resizable rounded>
          <AppRoot />
          <ASTRoot />
          <MatchRoot />
        </SplitPanel>
      </SplitPanel>
    </SpellPage>
  )
}

/****************
 * ### `<EditorToolbar>`
 * Top menu of `<SpellEditor>`:  the project dropdown, preview / settings / project actions;  the chooser;  about
 * and docs.
 ****************/
export function EditorToolbar() {
  return (
    <AppMenu>
      <Submenu left spring>
        <ProjectDropdown />
        <Actions.showRunner />
        <Actions.showProjectSettings />
        <ProjectActionsDropdown />
      </Submenu>
      <Submenu center spring>
        <Actions.showProjectChooser />
      </Submenu>
      <Submenu right spring>
        <Actions.aboutSpell />
        <Actions.showDocs />
        <MoreMenu stub />
      </Submenu>
    </AppMenu>
  )
}

/****************
 * ### `<SpellEditorRoute>`
 * The `/edit/...` routes:  `<SpellEditor>`, showing the project / file the URL names (`followRoute()`).
 * - Stays mounted while only the URL's params change:  moving between files doesn't redraw the page.
 ****************/
export function SpellEditorRoute(props: RouteSectionProps) {
  followRoute(() => props.params, "editor")
  return <SpellEditor />
}
