import { Show } from "solid-js"
import type { JSX } from "@solidjs/web"

import { SP } from "$/spell"
import { Actions, AppMenu, MoreMenu, ProjectMenu, SpellPage, Submenu } from "$/app/solid"

/****************
 * ### `<ProjectChooser>`
 * The landing page:  projects, examples and guides side by side, each with its list and a "create" button.
 * - In dev, also the test fixtures (`@test:fixtures`) -- open one to look at it, edit it, then
 *   `yarn test:fixtures:bless`.  No "create" for those:  copy a project into `projects/test/`.
 * - Every route the others don't take (`routes.tsx`).
 ****************/
export function ProjectChooser() {
  const { projects, examples, guides, fixtures } = SP.SpellProjectRoot
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
                <h1>Welcome to Spell!</h1>
              </ui-column>
            </ui-row>

            <ui-row>
              <RootColumn heading={projects.title}>
                <p>{projects.description}</p>
              </RootColumn>
              <RootColumn heading={examples.title}>
                <p>{examples.description}</p>
              </RootColumn>
              <RootColumn heading={guides.title}>
                <p>{guides.description}</p>
              </RootColumn>
              <Show when={showFixtures}>
                <RootColumn heading={fixtures.title}>
                  <p>{fixtures.description}</p>
                </RootColumn>
              </Show>
            </ui-row>

            <ui-row>
              <ui-column>
                <h4>Open Project</h4>
                <ProjectMenu vertical="" fluid="" projectRoot={projects} />
              </ui-column>
              <ui-column>
                <h4>Open Example</h4>
                <ProjectMenu vertical="" fluid="" projectRoot={examples} useRunner />
              </ui-column>
              <ui-column>
                <h4>Open Guide</h4>
                <ProjectMenu vertical="" fluid="" projectRoot={guides} useRunner />
              </ui-column>
              <Show when={showFixtures}>
                <ui-column>
                  <h4>Open Fixture</h4>
                  <ProjectMenu vertical="" fluid="" projectRoot={fixtures} />
                </ui-column>
              </Show>
            </ui-row>

            <ui-row>
              <ui-column>
                <Actions.createProject button title="Create a New Project" fluid="" />
              </ui-column>
              <ui-column>
                <Actions.createExample button title="Create a New Example" fluid="" />
              </ui-column>
              <ui-column>
                <Actions.createGuide button title="Create a New Guide" fluid="" />
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
 * One column of `<ProjectChooser>`'s top row:  a project root's title over `children`.
 ****************/
function RootColumn(props: { heading: string; children?: JSX.Element }) {
  return (
    <ui-column>
      <h3>{props.heading}</h3>
      {props.children}
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
        <MoreMenu stub />
      </Submenu>
    </AppMenu>
  )
}
