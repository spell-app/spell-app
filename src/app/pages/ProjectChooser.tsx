import { Show } from "solid-js"

import { SPACES } from "spell-app/spaces"
import { appTexts } from "spell-app/app/ui/AppTexts"
import { Actions, AppMenu, MoreMenu, ProjectMenu, SpellPage, Submenu } from "spell-app/app/solid"

/****************
 * ### `<ProjectChooser>`
 * The landing page:  projects, examples and guides side by side, each with its list and a "create" button.
 * - In dev, also the test fixtures (`@spell/test`) -- open one to look at it, edit it, then
 *   `yarn test:fixtures:bless`.  No "create" for those:  copy a project into `tests/spaces/@spell/test/`.
 * - Every route the others don't take (`routes.tsx`).
 ****************/
export function ProjectChooser() {
  const { projects, examples, guides, fixtures } = SPACES.SpellProjectRoot
  // a dev-only root is there in every build -- just not listed outside dev
  const showFixtures = !!import.meta.env?.DEV || !fixtures.devOnly

  return (
    <SpellPage id="ProjectChooser" fillWindow dark rows>
      <ChooserToolbar />
      <br />
      <ui-container>
        <ui-segment>
          <ui-grid relaxed="very" padded="" columns="equal">
            <ui-row>
              <ui-column>
                <h1>{appTexts.text("welcome")}</h1>
              </ui-column>
            </ui-row>

            <ui-row>
              <RootColumn projectRoot={projects} />
              <RootColumn projectRoot={examples} />
              <RootColumn projectRoot={guides} />
              <Show when={showFixtures}>
                <RootColumn projectRoot={fixtures} />
              </Show>
            </ui-row>

            <ui-row>
              <ui-column>
                <h4>{appTexts.text("openGroup", appTexts.groupWords(projects))}</h4>
                <ProjectMenu vertical="" fluid="" projectRoot={projects} />
              </ui-column>
              <ui-column>
                <h4>{appTexts.text("openGroup", appTexts.groupWords(examples))}</h4>
                <ProjectMenu vertical="" fluid="" projectRoot={examples} useRunner />
              </ui-column>
              <ui-column>
                <h4>{appTexts.text("openGroup", appTexts.groupWords(guides))}</h4>
                <ProjectMenu vertical="" fluid="" projectRoot={guides} useRunner />
              </ui-column>
              <Show when={showFixtures}>
                <ui-column>
                  <h4>{appTexts.text("openGroup", appTexts.groupWords(fixtures))}</h4>
                  <ProjectMenu vertical="" fluid="" projectRoot={fixtures} />
                </ui-column>
              </Show>
            </ui-row>

            <ui-row>
              <ui-column>
                <Actions.createProject button title={appTexts.text("createNewProject")} fluid="" />
              </ui-column>
              <ui-column>
                <Actions.createExample button title={appTexts.text("createNewExample")} fluid="" />
              </ui-column>
              <ui-column>
                <Actions.createGuide button title={appTexts.text("createNewGuide")} fluid="" />
              </ui-column>
              <Show when={showFixtures}>
                <ui-column />
              </Show>
            </ui-row>
          </ui-grid>
        </ui-segment>
      </ui-container>
    </SpellPage>
  )
}

/****************
 * ### `<RootColumn>`
 * One column of `<ProjectChooser>`'s top row:  a project root's title over what's in it, in the page's language.
 ****************/
function RootColumn(props: { projectRoot: SPACES.SpellProjectRoot }) {
  const words = () => appTexts.groupWords(props.projectRoot)
  return (
    <ui-column>
      <h3>{words().title}</h3>
      <p>{words().description}</p>
    </ui-column>
  )
}

/****************
 * ### `<ChooserToolbar>`
 * Top menu of `<ProjectChooser>`:  the chooser (active), about and docs.
 ****************/
export function ChooserToolbar() {
  return (
    <AppMenu>
      <Submenu left spring />
      <Submenu center spring>
        <Actions.showProjectChooser active />
      </Submenu>
      <Submenu right spring>
        <Actions.aboutSpell />
        <Actions.showDocs />
        <Actions.you />
        <MoreMenu stub />
      </Submenu>
    </AppMenu>
  )
}
