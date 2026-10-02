/** @jsxImportSource react */
import React from "react"
import type { RouteComponentProps } from "@reach/router"

import { SP } from "$/spell"
import { Actions } from "$/app/ui"
import { UI, SpellPage } from "$/app/ui"

/****************
 * ### `<ProjectRootDisplay />`
 * Card-style summary of one `projectRoot` (title/description plus a `<UI.ProjectMenu>` to open one of
 * its projects); `children` render below the menu.
 * - NOTE: currently unused -- `ProjectChooser` below lays projects/examples/guides out inline instead.
 ****************/
export const ProjectRootDisplay = React.memo(({ projectRoot, children, useRunner }: ProjectRootDisplayProps) => {
  return (
    <div className="ProjectRoot">
      <h3>{projectRoot.title}</h3>
      <p>{projectRoot.description}</p>
      <br />
      <h4>Open {projectRoot.Type}</h4>
      <UI.ProjectMenu vertical useRunner={useRunner} projectRoot={projectRoot} fluid />
      <br />
      {children}
    </div>
  )
})

/** Props for `<ProjectRootDisplay />`. */
export type ProjectRootDisplayProps = {
  /** Root (projects/examples/guides) to summarize. */
  projectRoot: SP.SpellProjectRoot
  /** Extra content rendered below `<UI.ProjectMenu>`. */
  children?: ReactNode
  /** Whether `<UI.ProjectMenu>` entries open the runner (vs editor). */
  useRunner?: boolean
}

/****************
 * ### `<ProjectChooser />`
 * Landing page listing projects/examples/guides side by side, with "create new" actions for each.
 * - In dev, also the test fixtures (`@test:fixtures`) -- open one to look at it, edit it, then
 *   `yarn test:fixtures:bless`.  No "create" for those:  copy a project into `projects/test/`.
 * - Note that this does not need to be a `view()`.
 ****************/
export const ProjectChooser = React.memo(function ProjectChooser() {
  const { Grid, Row, Column } = UI
  const { projects, examples, guides, fixtures } = SP.SpellProjectRoot
  // a dev-only root is there in every build -- just not listed outside dev
  const showFixtures = !!import.meta.env?.DEV || !fixtures.devOnly

  return (
    <>
      <SpellPage id="ProjectChooser" fillWindow dark rows>
        <ChooserToolbar />
        <br />
        <UI.Container>
          <UI.Segment>
            <Grid relaxed="very" padded columns="equal">
              <Row>
                <Column>
                  <h1>Welcome to Spell!</h1>
                  {/* <p>Blah blah blah!</p> */}
                </Column>
              </Row>

              <Row>
                <Column>
                  <h3>{projects.title}</h3>
                  <p>{projects.description}</p>
                </Column>
                <Column>
                  <h3>{examples.title}</h3>
                  <p>{examples.description}</p>
                </Column>
                <Column>
                  <h3>{guides.title}</h3>
                  <p>{guides.description}</p>
                </Column>
                {showFixtures && (
                  <Column>
                    <h3>{fixtures.title}</h3>
                    <p>{fixtures.description}</p>
                  </Column>
                )}
              </Row>

              <Row>
                <Column>
                  <h4>Open Project</h4>
                  <UI.ProjectMenu vertical useRunner={false} projectRoot={projects} fluid />
                </Column>
                <Column>
                  <h4>Open Example</h4>
                  <UI.ProjectMenu vertical useRunner projectRoot={examples} fluid />
                </Column>
                <Column>
                  <h4>Open Guide</h4>
                  <UI.ProjectMenu vertical useRunner projectRoot={guides} fluid />
                </Column>
                {showFixtures && (
                  <Column>
                    <h4>Open Fixture</h4>
                    <UI.ProjectMenu vertical useRunner={false} projectRoot={fixtures} fluid />
                  </Column>
                )}
              </Row>

              <Row>
                <Column>
                  <Actions.createProject button title="Create a New Project" fluid />
                </Column>
                <Column>
                  <Actions.createExample button title="Create a New Example" fluid />
                </Column>
                <Column>
                  <Actions.createGuide button title="Create a New Guide" fluid />
                </Column>
                {showFixtures && <Column />}
              </Row>
            </Grid>
          </UI.Segment>
        </UI.Container>
      </SpellPage>
    </>
  )
})

/****************
 * ### `<ChooserToolbar />`
 * Top menu bar for `<ProjectChooser>` -- active "chooser" link plus about/docs actions.
 ****************/
export function ChooserToolbar() {
  return (
    <UI.AppMenu>
      <UI.Submenu left spring />
      <UI.Submenu center spring>
        <Actions.showProjectChooser active />
      </UI.Submenu>
      <UI.Submenu right spring>
        <Actions.aboutSpell />
        {/* <Actions.showHelp /> */}
        <Actions.showDocs />
        <UI.MoreMenu stub />
      </UI.Submenu>
    </UI.AppMenu>
  )
}

/****************
 * ### `<ProjectChooserRoute />`
 * Reach-router `<Route/>` wrapper to show `<ProjectChooser>`.
 ****************/
export function ProjectChooserRoute(_props: RouteComponentProps) {
  return <ProjectChooser />
}
