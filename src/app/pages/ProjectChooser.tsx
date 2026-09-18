import React from "react"
import type { RouteComponentProps } from "@reach/router"

import { SP } from "~/languages/spell"
import { Actions } from "~/app/ui"
import { UI, SpellPage } from "~/app/ui"

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

export type ProjectRootDisplayProps = {
  projectRoot: SP.SpellProjectRoot
  children?: ReactNode
  useRunner?: boolean
}
/**
 * <ProjectChooser />
 * Note that this does not need to be a `view()`.
 */
export const ProjectChooser = React.memo(function ProjectChooser() {
  const { Grid, Row, Column } = UI
  const { projects, examples, guides } = SP.SpellProjectRoot

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
              </Row>
            </Grid>
          </UI.Segment>
        </UI.Container>
      </SpellPage>
    </>
  )
})

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

/**
 * Reach-router `<Route/>` to show the ProjectChooser
 */
export function ProjectChooserRoute(_props: RouteComponentProps) {
  return <ProjectChooser />
}
