import React from "react"
import Container from "react-bootstrap/Container"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import Button from "react-bootstrap/Button"
import Nav from "react-bootstrap/Nav"
import Navbar from "react-bootstrap/Navbar"
import NavDropdown from "react-bootstrap/NavDropdown"
import NavLink from "react-bootstrap/NavLink"
import Toast from "react-bootstrap/Toast"

import { view } from "../util"
import { SpellFileLocation } from "../languages/spell/SpellFileLocation"

import { CodeMirror, inputOptions, outputOptions } from "./CodeMirror"
import { store } from "./store"

// Set to `true` to debug rendering of components as observables change.
const DEBUG_RENDER = false

/** Menu of all available projects. */
const ProjectMenu = view(function() {
  const { projectList, project } = store
  if (DEBUG_RENDER) console.info("ProjectMenu", projectList, project)
  const bound = React.useMemo(() => {
    return {
      createProject: () => store.createProject(),
      duplicateProject: () => store.duplicateProject(),
      renameProject: () => store.renameProject(),
      removeProject: () => store.removeProject()
    }
  })
  if (!projectList.isLoaded || !project)
    return <NavDropdown key="loading" title="Loading..." id="ProjectMenu" style={{ width: "12em" }} />
  return (
    <NavDropdown key={project.path} title={project.projectName} id="ProjectMenu" style={{ width: "12em" }}>
      {projectList.projectPaths.map(path => (
        <NavDropdown.Item key={path} eventKey={path} onSelect={store.selectProject}>
          <ion-icon name="briefcase-outline" size="medium" /> {new SpellFileLocation(path).projectName}
        </NavDropdown.Item>
      ))}
      <NavDropdown.Divider />
      <NavDropdown.Item key="create" onSelect={bound.createProject}>
        <ion-icon name="create-outline" size="medium" /> New Project
      </NavDropdown.Item>
      <NavDropdown.Item key="duplicate" onSelect={bound.duplicateProject}>
        <ion-icon name="duplicate-outline" size="medium" /> Duplicate Project
      </NavDropdown.Item>
      <NavDropdown.Item key="rename" onSelect={bound.renameProject}>
        <ion-icon name="git-branch-outline" size="medium" /> Rename Project
      </NavDropdown.Item>
      <NavDropdown.Item key="delete" onSelect={bound.removeProject}>
        <ion-icon name="trash-outline" size="medium" /> Delete Project
      </NavDropdown.Item>
    </NavDropdown>
  )
})

/** Menu of all available files. */
const FileMenu = view(function() {
  const { project, file } = store
  if (DEBUG_RENDER) console.info("FileMenu", project, file)
  if (!project || !file) return <NavDropdown key="loading" title="Loading..." id="FileMenu" style={{ width: "12em" }} />
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

const EditorToolbar = view(function EditorToolbar() {
  const { isDirty } = store.file || {}
  if (DEBUG_RENDER) console.info("EditorToolbar", isDirty)
  const bound = React.useMemo(() => {
    return {
      saveFile: () => store.saveFile(),
      reloadFile: () => store.reloadFile(),
      createFile: () => store.createFile(),
      duplicateFile: () => store.duplicateFile(),
      renameFile: () => store.renameFile(),
      removeFile: () => store.removeFile()
    }
  })
  return (
    <Navbar bg="dark" variant="dark" className="py-0">
      <Nav>
        <NavLink disabled>Project:</NavLink>
        <ProjectMenu />

        <NavLink disabled>File:</NavLink>
        <FileMenu />
        <Navbar.Collapse id="navbar-buttons" className="ml-2">
          <Nav>
            <Button variant={isDirty ? "success" : "dark"} onClick={bound.saveFile}>
              <ion-icon name="cloud-upload-outline" size="medium" /> Save
            </Button>
            <Button variant={isDirty ? "danger" : "dark"} onClick={bound.reloadFile}>
              <ion-icon name="reload-outline" size="medium" /> Revert
            </Button>
            <Nav.Link onClick={bound.createFile}>
              <ion-icon name="create-outline" size="medium" /> New File
            </Nav.Link>
            <Nav.Link onClick={bound.duplicateFile}>
              <ion-icon name="duplicate-outline" size="medium" /> Duplicate
            </Nav.Link>
            <Nav.Link onClick={bound.renameFile}>
              <ion-icon name="git-branch-outline" size="medium" /> Rename
            </Nav.Link>
            <Nav.Link onClick={bound.removeFile}>
              <ion-icon name="trash-outline" size="medium" /> Delete
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Nav>
    </Navbar>
  )
})

const InputEditor = view(function InputEditor() {
  const { file } = store
  if (DEBUG_RENDER) console.info("InputEditor", file, file?.contents?.split("\n")[0])
  return (
    <CodeMirror
      key={file?.path || "loading"}
      value={file?.contents || "Loading"}
      disabled
      className="h-100 w-100 rounded shadow-sm border"
      options={inputOptions}
      onBeforeChange={store.onInputChanged}
    />
  )
})

const OutputEditor = view(function OutputEditor() {
  const { file } = store
  const compiled = file?.compiled
  if (DEBUG_RENDER) console.info("OutputEditor", { file, compiled })
  return (
    <>
      <CodeMirror
        value={compiled}
        disabled
        className="h-100 w-100 rounded shadow-sm border"
        options={outputOptions}
        onChange={Function.prototype}
      />
      {file?.isLoaded && !compiled && (
        <Button
          className="CompileButton border shadow-sm p-0 pt-1 text-secondary"
          style={{
            background: "#eee",
            position: "absolute",
            width: "5em",
            left: 0,
            top: "50%",
            zIndex: 2
          }}
          onClick={store.compile}
        >
          <ion-icon name="chevron-forward-outline" size="large" />
          Compile
        </Button>
      )}
    </>
  )
})

const Notice = view(function Notice() {
  const { message } = store
  if (!message) return null
  return (
    <div style={{ position: "fixed", bottom: 20, left: "calc(50% - 250px)", width: 500, zIndex: 100 }}>
      <Toast autohide onClose={store.hideNotice} style={{ maxWidth: "100%", background: "green", color: "white" }}>
        <Toast.Header>
          <ion-icon name="checkmark-circle-outline" size="medium" />
          <div style={{ marginLeft: "0.25em", marginRight: "auto", fontSize: "1.5em", fontWeight: "bold" }}>
            {message}
          </div>
        </Toast.Header>
      </Toast>
    </div>
  )
})

const Error = view(function Error() {
  const { error } = store
  if (typeof error !== "string") return null
  const split = error.split(":")
  let header
  let message
  if (split.length === 1) {
    header = "Error"
    message = error
  } else {
    header = split[0]
    message = split.slice(1).join(":")
  }
  return (
    <div style={{ position: "fixed", top: 60, left: "calc(50% - 250px)", width: 500, zIndex: 100 }}>
      <Toast autohide onClose={store.hideError} style={{ maxWidth: "100%", background: "red", color: "white" }}>
        <Toast.Header>
          <ion-icon name="warning-outline" size="medium" />
          <div style={{ marginLeft: "0.25em", marginRight: "auto", fontSize: "1.5em", fontWeight: "bold" }}>
            {header}
          </div>
        </Toast.Header>
        <Toast.Body>{message}</Toast.Body>
      </Toast>
    </div>
  )
})

export const SpellEditor = view(function SpellEditor() {
  if (DEBUG_RENDER) console.warn("SpellEditor")
  return (
    <>
      <Container fluid className="d-flex flex-column h-100 px-0">
        <Row>
          <Col xs={12}>
            <EditorToolbar />
          </Col>
        </Row>
        <Row noGutters className="p-2 h-100">
          <Col xs={6} className="h-100 CodeMirrorContainer">
            <InputEditor />
          </Col>
          <Col xs={6} className="pl-2 CodeMirrorContainer">
            <OutputEditor />
          </Col>
        </Row>
      </Container>
      <Notice />
      <Error />
    </>
  )
})
