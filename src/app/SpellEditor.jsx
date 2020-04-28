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

setPrefKey("spellEditor:")

const store = _store({
  projectList: new SpellProjectList(),
  start: async () => {
    await store.projectList.load()
    store.selectProject()
  },
  project: undefined,
  /** Select a project. */
  selectProject: async (path = getPref("selectedProject")) => {
    console.info("selecting project", path)
    const projectPaths = await store.projectList.load()
    if (!projectPaths.includes(path)) path = projectPaths[0]
    setPref("selectedProject", path)
    const project = new SpellProject(path)
    store.project = project
    await project.load()
    store.selectFile()
  },
  file: undefined,
  /** Select a file from the `selectedProject`. */
  selectFile: async filePath => {
    // TODO: switch project if filePath doesn't match selected project?
    // NOTE: assumes `store.project` is a valid, loaded project!
    const { project } = store
    const pref = `selectedFileFor:${project.path}`
    if (!filePath) filePath = getPref(pref)
    if (!project.filePaths.includes(filePath)) filePath = project.filePaths[0]
    setPref(pref, filePath)
    store.file = new SpellFile(filePath)
    await store.file.load()
  },
  save() {},
  revert() {},
  async create() {
    const fileName = prompt("Name for the new file?", "Untitled.spell")
    if (!fileName) return
    const contents = `## File ${fileName}`
    const file = await store.project.createFile(fileName, contents)
    store.selectFile(file.path)
  },
  async duplicate() {
    const { fileName } = store.file
    const newFileName = prompt("Name for the new file?", fileName)
    if (!newFileName) return
    const file = await store.project.duplicateFile(fileName, newFileName)
    store.selectFile(file.path)
  },
  async rename() {
    const { fileName } = store.file
    const newFileName = prompt(`New name for '${fileName}'?`, fileName)
    if (!newFileName || newFileName === fileName) return
    const file = await store.project.renameFile(fileName, newFileName)
    store.selectFile(file.path)
  },
  async remove() {
    const { fileName } = store.file
    if (!confirm(`Really delete '${fileName}'?`)) return
    await store.project.removeFile(fileName)
    store.selectFile()
  },
  onInputChange() {},
  compile() {}
})
global._store = store
store.start()

/** Menu of all available projects. */
const ProjectMenu = view(function() {
  const { projectList, project } = store
  console.info("ProjectMenu", projectList, project)
  if (!projectList.isLoaded || !project)
    return <NavDropdown key="loading" title="Loading..." id="ProjectMenu" style={{ width: "12em" }} />
  return (
    <NavDropdown key={project.path} title={project.projectName} id="ProjectMenu" style={{ width: "12em" }}>
      {projectList.projectPaths.map(path => (
        <NavDropdown.Item key={path} eventKey={path} onSelect={store.selectProject}>
          {new SpellFileLocation(path).projectName}
        </NavDropdown.Item>
      ))}
    </NavDropdown>
  )
})

/** Menu of all available files. */
const FileMenu = view(function() {
  const { project, file } = store
  console.info("FileMenu", project, file)
  if (!project || !file?.isLoaded)
    return <NavDropdown key="loading" title="Loading..." id="FileMenu" style={{ width: "12em" }} />
  return (
    <NavDropdown key={file.path} title={file.fileName} id="FileMenu" style={{ width: "12em" }}>
      {project.filePaths.map(path => (
        <NavDropdown.Item key={path} eventKey={path} onSelect={store.selectFile}>
          {new SpellFileLocation(path).fileName}
        </NavDropdown.Item>
      ))}
    </NavDropdown>
  )
})

const InputEditor = view(function InputEditor() {
  const { file } = store
  console.info("InputEditor", file, file?.contents?.split("\n")[0])
  return (
    <CodeMirror
      key={file?.path || "loading"}
      value={file?.contents || "Loading"}
      disabled
      className="h-100 w-100 rounded shadow-sm border"
      options={inputOptions}
      onBeforeChange={store.onInputChange}
    />
  )
})

const OutputEditor = view(function OutputEditor() {
  const { file } = store
  console.info("OutputEditor", file)
  return (
    <CodeMirror
      key={file?.path || "loading"}
      value={"output goes here" || "Loading..."}
      disabled
      className="h-100 w-100 rounded shadow-sm border"
      options={outputOptions}
      onChange={Function.prototype}
    />
  )
})

export function SpellEditor() {
  const dirty = false
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
          <InputEditor />
        </Col>
        <Col xs={6} className="pl-2 CodeMirrorContainer">
          <OutputEditor />
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
