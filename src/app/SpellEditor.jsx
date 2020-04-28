import React from "react"
import Container from "react-bootstrap/Container"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import Button from "react-bootstrap/Button"
import Nav from "react-bootstrap/Nav"
import Navbar from "react-bootstrap/Navbar"
import NavDropdown from "react-bootstrap/NavDropdown"
import NavLink from "react-bootstrap/NavLink"
import Octicon, { ChevronRight } from "@primer/octicons-react"

import { view } from "../util"
import { SpellFileLocation } from "../languages/spell/SpellFileLocation"

import { CodeMirror, inputOptions, outputOptions } from "./CodeMirror"
import { store } from "./store"

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
  console.info("EditorToolbar", isDirty)
  return (
    <Navbar.Collapse id="navbar-buttons" className="ml-2">
      <Nav>
        <Button variant={isDirty ? "success" : "dark"} onClick={store.saveFile}>
          Save
        </Button>
        <Button variant={isDirty ? "danger" : "dark"} onClick={store.reloadFile}>
          Revert
        </Button>
        <Nav.Link onClick={store.createFile}>New File</Nav.Link>
        <Nav.Link onClick={store.duplicateFile}>Duplicate</Nav.Link>
        <Nav.Link onClick={store.renameFile}>Rename</Nav.Link>
        <Nav.Link onClick={store.removeFile}>Delete</Nav.Link>
      </Nav>
    </Navbar.Collapse>
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
      onBeforeChange={store.onInputChanged}
    />
  )
})

const OutputEditor = view(function OutputEditor() {
  const { file } = store
  const compiled = file?.compiled
  console.info("OutputEditor", { file, compiled })
  return (
    <>
      {!!file && !compiled && (
        <Button
          className="CompileButton border shadow-sm p-0 pt-1 text-secondary"
          style={{
            background: "#eee",
            position: "absolute",
            width: "5em",
            left: 0,
            top: "50%"
          }}
          onClick={store.compile}
        >
          <Octicon icon={ChevronRight} size="medium" />
          <br />
          Compile
        </Button>
      )}
      <CodeMirror
        value={compiled}
        disabled
        className="h-100 w-100 rounded shadow-sm border"
        options={outputOptions}
        onChange={Function.prototype}
      />
    </>
  )
})

export const SpellEditor = view(function SpellEditor() {
  console.warn("SpellEditor")
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
              <EditorToolbar />
            </Nav>
          </Navbar>
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
  )
})
