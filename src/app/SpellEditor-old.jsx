import global from "global"
import React from "react"
import PropTypes from "prop-types"

import Container from "react-bootstrap/Container"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import Button from "react-bootstrap/Button"
import Nav from "react-bootstrap/Nav"
import Navbar from "react-bootstrap/Navbar"
import NavDropdown from "react-bootstrap/NavDropdown"
import NavLink from "react-bootstrap/NavLink"

import Octicon, { ChevronRight } from "@githubprimer/octicons-react"

import "./JSHINT"
import { CodeMirror } from "./CodeMirror"
import { projects as _projects, withProjects, INPUT } from "./redux/projects"
import "./SpellEditor.css"

export class _SpellEditor extends React.Component {
  static propTypes = {
    projectId: PropTypes.string,
    projects: PropTypes.object
  }

  constructor(props) {
    super(props)
    _projects.call.startup()
  }

  compile = () => _projects.call.compileInput()

  revert = () => _projects.call.revertInput()

  reload = () => _projects.call.reloadSelected()

  save = () => _projects.call.saveInput()

  selectProject = projectId => _projects.call.selectProjectFile({ projectId })

  selectProjectFile = filename => _projects.call.selectProjectFile({ projectId: this.props.projectId, filename })

  create = () => {
    const filename = prompt("Name for the new file?", "Untitled.spell")
    if (!filename) return
    const contents = `## File ${filename}`
    _projects.call.newProjectFile({ filename, contents })
  }

  duplicate = () => {
    const { filename } = this.props.projects
    const newFilename = prompt("Name for the new file?", filename)
    if (!newFilename || newFilename === filename) return
    _projects.call.duplicateProjectFile({ filename, newFilename, contents: INPUT })
  }

  _delete = () => {
    const { filename } = this.props.projects
    if (!confirm(`Really delete '${filename}'?`)) return
    _projects.call.deleteProjectFile({ filename })
  }

  rename = () => {
    const { filename } = this.props.projects
    const newFilename = prompt("New name?", filename)
    if (!newFilename || newFilename === filename) return
    _projects.call.renameProjectFile({ filename, newFilename, contents: INPUT })
  }

  onInputChange = (codeMirror, change, value) => {
    // console.info(codeMirror, "\n", change)//, "\n", value)
    _projects.actions.updateInput(value)
  }

  // Buttons to show when the input field is dirty.
  dirtyButtons = (
    <div style={{ position: "absolute", right: "3px", top: "3px" }}>
      <Button variant="danger" onClick={this.revert} style={{ width: "5em" }}>
        <u>R</u>evert
      </Button>{" "}
      <Button variant="success" onClick={this.save} style={{ width: "5em" }}>
        <u>S</u>ave
      </Button>
    </div>
  )

  // Buttons to show when the input can be compiled.
  compileButton = (
    <Button
      className="border shadow-sm p-0 pt-1 text-secondary"
      style={{
        background: "#eee",
        position: "absolute",
        width: "5em",
        left: "calc(50% - 2.5em)",
        top: "50%",
        zIndex: 3
      }}
      onClick={this.compile}
    >
      <Octicon icon={ChevronRight} size="medium" />
      <br />
      Compile
    </Button>
  )

  render() {
    const { projects } = this.props
    const { projectId, filename, input, output, dirty } = projects
    const projectIds = _projects.getProjectIds(projects)
    const index = _projects.getProjectIndex(projects, projectId)

    // Don't do anything if our data isn't yet loaded
    if (!projectIds || !index) return null

    // Create menuItems for the projects menu
    const projectItems = projectIds.map(nextProjectId => (
      <NavDropdown.Item key={nextProjectId} eventKey={nextProjectId} onSelect={this.selectProject}>
        {nextProjectId}
      </NavDropdown.Item>
    ))

    // Create menuitems for the files menu
    const fileItems = index.files.map(file => (
      <NavDropdown.Item key={file.name} eventKey={file.name} onSelect={this.selectProjectFile}>
        {file.name}
      </NavDropdown.Item>
    ))

    const codeMirrorOptions = {
      theme: "neat", // Owen favors: "solarized", "neo" and "neat"
      indentWithTabs: true,
      indentUnit: 3,
      tabSize: 3
    }
    const inputOptions = {
      ...codeMirrorOptions,
      mode: "spell"
    }

    const outputOptions = {
      ...codeMirrorOptions,
      mode: "javascript",
      readOnly: true,
      // eslint
      gutters: ["CodeMirror-lint-markers"],
      lint: true
    }

    return (
      <Container fluid className="d-flex flex-column h-100 px-0">
        <Row>
          <Col xs={12}>
            <Navbar bg="dark" variant="dark" className="py-0">
              <Nav>
                <NavLink disabled>Project:</NavLink>
                <NavDropdown title={projectId} id="project-dropdown" style={{ width: "12em" }}>
                  {projectItems}
                </NavDropdown>
                <NavLink disabled>File:</NavLink>
                <NavDropdown title={filename} id="file-dropdown" style={{ width: "12em" }}>
                  {fileItems}
                </NavDropdown>
                <Navbar.Collapse id="navbar-buttons" className="ml-2">
                  <Nav>
                    <Button variant={dirty ? "success" : "dark"} onClick={this.save}>
                      Save
                    </Button>
                    <Button variant={dirty ? "danger" : "dark"} onClick={this.revert}>
                      Revert
                    </Button>
                    <Nav.Link onClick={this.create}>New File</Nav.Link>
                    <Nav.Link onClick={this.duplicate}>Duplicate</Nav.Link>
                    <Nav.Link onClick={this.rename}>Rename</Nav.Link>
                    <Nav.Link onClick={this._delete}>Delete</Nav.Link>
                  </Nav>
                </Navbar.Collapse>
              </Nav>
            </Navbar>
          </Col>
        </Row>
        <Row noGutters className="p-2 h-100">
          <Col xs={6} className="h-100">
            <CodeMirror
              value={input}
              className="h-100 w-100 rounded shadow-sm border"
              options={inputOptions}
              onBeforeChange={this.onInputChange}
            />
          </Col>
          <Col xs={6} className="pl-2 CodeMirrorContainer">
            <CodeMirror
              value={output || ""}
              className="h-100 w-100 rounded shadow-sm border"
              options={outputOptions}
              onChange={Function.prototype}
            />
          </Col>
          {!output && this.compileButton}
        </Row>
      </Container>
    )
  }
}

// Pass projects from redux
const SpellEditor = withProjects(_SpellEditor)
export { SpellEditor }
