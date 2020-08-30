import React from "react"

import { SpellProjectRoot } from "~/languages/spell"
import { actions } from "~/app/actions"
import { UI } from "~/app/components/ui"
import { SpellPage } from "./SpellPage"

export const ProjectRootDisplay = React.memo(({ projectRoot, children, useRunner }) => {
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

/**
 * <ProjectChooser />
 * Note that this does not need to be a `view()`.
 */
export const ProjectChooser = React.memo(function ProjectChooser() {
  const { Grid, Row, Column } = UI
  const { projects, examples, guides } = SpellProjectRoot
  const roots = [projects, examples, guides]

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
                  <p>Blah blah blah!</p>
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
                  <actions.createProject button title="Create a New Project" fluid />
                </Column>
                <Column>
                  <actions.createExample button title="Create a New Example" fluid />
                </Column>
                <Column>
                  <actions.createGuide button title="Create a New Guide" fluid />
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
        <actions.showProjectChooser active />
      </UI.Submenu>
      <UI.Submenu right spring>
        <actions.aboutSpell />
        {/* <actions.showHelp /> */}
        <actions.showDocs />
        <UI.MoreMenu stub />
      </UI.Submenu>
    </UI.AppMenu>
  )
}

/**
 * Reach-router `<Route/>` to show the ProjectChooser
 */
export function ProjectChooserRoute(props) {
  return <ProjectChooser />
}
