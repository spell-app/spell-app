import global from "global"
import React from "react"
import { store as _store, view, batch } from "@risingstack/react-easy-state"

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
import { CodeMirror, inputOptions, outputOptions } from "./CodeMirror"
import "./SpellEditor.css"

import { SpellFileLocation } from "../languages/spell/SpellFileLocation"
import { SpellProjectList } from "../languages/spell/SpellProjectList"
import { SpellProject } from "../languages/spell/SpellProject"
import { SpellFile } from "../languages/spell/SpellFile"
import { setPrefKey, getPref, setPref } from "../util/prefs"

const projectList = new SpellProjectList()
setPrefKey("spellEditor:")

const store = _store({
  start: async () => {
    await projectList.load()
    store.selectProject()
  },
  get projectsLoaded() {
    return projectList.isLoaded
  },
  get projects() {
    return projectList.projectPaths
  },
  selectedProject: undefined,
  get selectedProjectName() {
    try {
      const { projectName } = new SpellFileLocation(store.selectedProject)
      return projectName
    } catch (e) {
      return "Loading..."
    }
  },
  /** Select a project. */
  selectProject: async (projectPath = getPref("selectedProject")) => {
    console.warn("selecting project", projectPath)
    const projectPaths = await projectList.load()
    if (!projectPaths.includes(projectPath)) projectPath = projectPaths[0]
    store.selectedProject = setPref("selectedProject", projectPath)
    store.selectFile()
  },
  selectedFile: undefined,
  get selectedFileName() {
    try {
      const { fileName } = new SpellFileLocation(store.selectedFile)
      return fileName
    } catch (e) {
      return "Loading..."
    }
  },
  /** Select a file from the `selectedProject`. */
  selectFile: async filePath => {
    const pref = `selectedFileFor:${store.selectedProject}`
    if (!filePath) filePath = getPref(pref)
    // NOTE: assumes `store.selectedProject` is the name of a valid project!!!
    const { selectedProject } = store
    const project = new SpellProject(selectedProject)
    await project.load()
    const { filePaths } = project
    if (!filePaths.includes(filePath)) filePath = filePaths[0]
    store.selectedFile = setPref(pref, filePath)
  },
  /** Paths for all files in `selectedProject` */
  get files() {
    const { selectedProject } = store
    if (!selectedProject) return undefined
    const project = new SpellProject(selectedProject)
    if (!project.isLoaded) {
      project.load()
      return undefined
    }
    return project.filePaths
  },
  save() {},
  revert() {},
  create() {},
  duplicate() {},
  rename() {},
  remove() {},
  onInputChange() {},
  compile() {}
})
store.start()
global._store = store

/** Menu of all available projects. */
const ProjectMenu = view(function() {
  const { projectsLoaded, selectedProject, selectedProjectName, projects } = store
  console.info("ProjectMenu", projectsLoaded, selectedProjectName, projects)
  if (!projectsLoaded)
    return <NavDropdown key="loading" title="Loading..." id="ProjectMenu" style={{ width: "12em" }} />
  return (
    <NavDropdown key={selectedProject} title={selectedProjectName} id="ProjectMenu" style={{ width: "12em" }}>
      {projects.map(path => (
        <NavDropdown.Item key={path} eventKey={path} onSelect={store.selectProject}>
          {new SpellFileLocation(path).projectName}
        </NavDropdown.Item>
      ))}
    </NavDropdown>
  )
})

/** Menu of all available files. */
const FileMenu = view(function() {
  const { selectedFile, selectedFileName, files } = store
  console.info("FileMenu", selectedFile, selectedFileName, files)
  if (!files) return <NavDropdown key="loading" title="Loading..." id="FileMenu" style={{ width: "12em" }} />
  return (
    <NavDropdown key={selectedFile} title={selectedFileName} id="FileMenu" style={{ width: "12em" }}>
      {files.map(path => (
        <NavDropdown.Item key={path} eventKey={path} onSelect={store.selectFile}>
          {new SpellFileLocation(path).fileName}
        </NavDropdown.Item>
      ))}
    </NavDropdown>
  )
})

export function SpellEditor() {
  const dirty = false
  // const { selectedProject, selectedFile } = store
  const input = input
  const output = output

  return (
    <Container fluid className="d-flex flex-column h-100 px-0">
      <Row>
        <Col xs={12}>
          <Navbar bg="dark" variant="dark" className="py-0">
            <Nav>
              <NavLink disabled>Project:</NavLink>
              <ProjectMenu />
              <NavLink disabled>File:</NavLink>
              <FileMenu />
              <Navbar.Collapse id="navbar-buttons" className="ml-2">
                <Nav>
                  <Button variant={dirty ? "success" : "dark"} onClick={store.save}>
                    Save
                  </Button>
                  <Button variant={dirty ? "danger" : "dark"} onClick={store.revert}>
                    Revert
                  </Button>
                  <Nav.Link onClick={store.create}>New File</Nav.Link>
                  <Nav.Link onClick={store.duplicate}>Duplicate</Nav.Link>
                  <Nav.Link onClick={store.rename}>Rename</Nav.Link>
                  <Nav.Link onClick={store.remove}>Delete</Nav.Link>
                </Nav>
              </Navbar.Collapse>
            </Nav>
          </Navbar>
        </Col>
      </Row>
      <Row noGutters className="p-2 h-100">
        <Col xs={6} className="h-100">
          input
        </Col>
        <Col xs={6} className="pl-2 CodeMirrorContainer">
          output
        </Col>
        {/* !output && (
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
            onClick={store.compile}
          >
            <Octicon icon={ChevronRight} size="medium" />
            <br />
            Compile
          </Button>
          ) */}
      </Row>
    </Container>
  )
}
