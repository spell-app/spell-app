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
import { useHotkeys } from "react-hotkeys-hook"

import { view, REACT_APP_ROOT_ID } from "~/util"
import { SpellLocation } from "~/languages/spell"

import { ASTViewer } from "./ASTViewer"
import { MatchViewer } from "./MatchViewer"
import { CodeMirror, inputOptions, outputOptions } from "./CodeMirror"
import { store } from "./store"

import "./SpellEditor.less"

// Set to `true` to debug rendering of components as observables change.
const DEBUG_RENDER = false

/** Menu of all available projects. */
const ProjectMenu = view(function ProjectMenu() {
  const { projectRoot, project } = store
  if (DEBUG_RENDER) console.info("ProjectMenu", projectRoot, project)
  const bound = React.useMemo(() => {
    return {
      createProject: () => store.createProject(),
      duplicateProject: () => store.duplicateProject(),
      renameProject: () => store.renameProject(),
      deleteProject: () => store.deleteProject()
    }
  })
  if (!projectRoot?.isLoaded || !project) {
    return <NavDropdown key="loading" title="Loading..." id="ProjectMenu" style={{ width: "12em" }} />
  }
  return (
    <NavDropdown key={project.path} title={project.projectName} id="ProjectMenu" style={{ width: "12em" }}>
      {projectRoot.projectPaths.map((path) => {
        const { projectName } = new SpellLocation(path)
        return (
          <NavDropdown.Item key={path} eventKey={path} onSelect={store.navigateToPath}>
            <i className="large folder outline icon" />
            {projectName}
          </NavDropdown.Item>
        )
      })}
      <NavDropdown.Divider />
      <NavDropdown.Item key="create" onSelect={bound.createProject}>
        <i className="large icons">
          <i className="folder outline icon" />
          <i className="small inverted corner plus icon" />
        </i>
        {"New Project"}
      </NavDropdown.Item>
      <NavDropdown.Item key="duplicate" onSelect={bound.duplicateProject}>
        <i className="large clone outline icon" />
        {"Duplicate Project"}
      </NavDropdown.Item>
      <NavDropdown.Item key="rename" onSelect={bound.renameProject}>
        <i className="large edit outline icon" />
        {"Rename Project"}
      </NavDropdown.Item>
      <NavDropdown.Item key="delete" onSelect={bound.deleteProject}>
        <i className="large trash alternate outline icon" />
        {"Delete Project"}
      </NavDropdown.Item>
    </NavDropdown>
  )
})

/** Menu of all available files. */
const FileMenu = view(function FileMenu() {
  const { project, file } = store
  if (DEBUG_RENDER) console.info("FileMenu", project, file)
  if (!project?.isLoaded || !file) {
    return <NavDropdown key="loading" title="Loading..." id="FileMenu" style={{ width: "12em" }} />
  }
  return (
    <NavDropdown key={file.path} title={file.file} id="FileMenu" style={{ width: "12em" }}>
      {project.imports.map(({ path, location }) => {
        return (
          <NavDropdown.Item key={path} eventKey={path} onSelect={store.navigateToPath}>
            {location.file}
          </NavDropdown.Item>
        )
      })}
    </NavDropdown>
  )
})

const EditorToolbar = view(function EditorToolbar() {
  const { file } = store
  const fileNeedsCompilation = file?.isLoaded && !file?.compiled
  const fileIsDirty = file?.isDirty
  if (DEBUG_RENDER) console.info("EditorToolbar", { file, fileIsDirty })
  const bound = React.useMemo(() => {
    return {
      compile: () => store.compile(),
      saveFile: () => store.saveFile(),
      reloadFile: () => store.reloadFile(),
      createFile: () => store.createFile(),
      duplicateFile: () => store.duplicateFile(),
      renameFile: () => store.renameFile(),
      deleteFile: () => store.deleteFile()
    }
  })
  return (
    <Navbar bg="dark" variant="dark">
      <Nav>
        <NavLink disabled>Project:</NavLink>
        <ProjectMenu />

        <NavLink disabled>File:</NavLink>
        {!!file && <FileMenu />}
        <Navbar.Collapse id="navbar-buttons" className="ml-2">
          <Nav>
            <Button variant={fileNeedsCompilation ? "primary" : "dark"} onClick={bound.compile}>
              <i className="large chevron circle right icon" />
              {"Compile"}
            </Button>
            <Button variant={fileIsDirty ? "success" : "dark"} onClick={bound.saveFile}>
              <i className="large cloud upload icon" />
              {"Save"}
            </Button>
            <Button variant={fileIsDirty ? "danger" : "dark"} onClick={bound.reloadFile}>
              <i className="large cloud download icon" />
              {"Revert"}
            </Button>
            <Button variant="dark" onClick={bound.createFile}>
              <i className="large icons">
                <i className="file outline icon" />
                <i className="small inverted corner plus icon" />
              </i>
              {"New File"}
            </Button>
            <Button variant="dark" onClick={bound.duplicateFile}>
              <i className="large clone outline icon" />
              {"Duplicate"}
            </Button>
            <Button variant="dark" onClick={bound.renameFile}>
              <i className="large edit outline icon" />
              {"Rename"}
            </Button>
            <Button variant="dark" onClick={bound.deleteFile}>
              <i className="large trash alternate outline icon" />
              {"Delete"}
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Nav>
    </Navbar>
  )
})

/** Create an ErrorBoundary component to re-render the InputEditor if CodeMirror throws. */
class InputEditor extends React.Component {
  state = { error: undefined }

  static getDerivedStateFromError(error) {
    console.warn("InputEditor error boundary got error", error)
    return { error }
  }

  componentDidCatch(error, errorInfo) {
    store.showError(error)
  }
  render() {
    const { error } = this.state
    // make sure we re-render if CodeMirror trips the error boundary
    const editor = error ? <InputEditorInner key="noerror" /> : <InputEditorInner key="error" error={error} />
    return <div className="CodeMirrorContainer">{editor}</div>
  }
}

const InputEditorInner = view(function InputEditorInner({ error }) {
  const { file, selection } = store
  if (DEBUG_RENDER) console.info("InputEditorInner", file, file?.contents?.split("\n")[0])

  // Call `store.onInputEffect()` to adjust selection on initial render
  React.useEffect(store.onInputEffect)

  // if we got a CodeMirror `error` in a previous draw,
  // remove the `mode` or we'll get an endless loop of pain
  let options = inputOptions
  if (error) {
    options = { ...options }
    delete options.mode
  }
  return (
    <CodeMirror
      key={(error && "error") || file?.path || "loading"}
      value={file?.contents ?? "Loading"}
      disabled
      options={options}
      editorDidMount={store.onInputDidMount}
      editorWillUnmount={store.onInputWillUnmount}
      onBeforeChange={store.onInputChanged}
      onCursorActivity={store.onInputCursor}
      onScroll={store.onInputCursor}
    />
  )
})

const OutputEditor = view(function OutputEditor() {
  const { file } = store
  const compiled = file?.compiled
  if (DEBUG_RENDER) console.info("OutputEditor", { file, compiled })
  return (
    <div className="CodeMirrorContainer">
      <CodeMirror value={compiled} disabled options={outputOptions} onChange={Function.prototype} />
    </div>
  )
})

const AppContainer = <div id={REACT_APP_ROOT_ID} style={{ padding: 20, height: "100%", overflow: "auto" }} />

const Notice = view(function Notice() {
  const { message } = store
  if (!message) return null
  return (
    <div style={{ position: "fixed", top: 60, left: "calc(50% - 250px)", width: 500, zIndex: 100 }}>
      <Toast autohide onClose={store.hideNotice} style={{ maxWidth: "100%", background: "green", color: "white" }}>
        <Toast.Header>
          <i className="large check circle outline icon" />
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
  const split = error.split("::")
  let header
  let message
  if (split.length === 1) {
    header = "Error"
    message = error
  } else {
    header = split[0]
    message = split.slice(1).join("::")
  }
  const lines = message.split("\n")
  return (
    <div style={{ position: "fixed", top: 60, left: "calc(50% - 250px)", width: 500, zIndex: 100 }}>
      <Toast onClose={store.hideError} style={{ maxWidth: "100%", background: "red", color: "white" }}>
        <Toast.Header>
          <i className="large exclamation triangle icon" />
          <div style={{ marginLeft: "0.25em", marginRight: "auto", fontSize: "1.5em", fontWeight: "bold" }}>
            {header}
          </div>
        </Toast.Header>
        <Toast.Body>
          {lines.map((line, index) => (
            <div key={index}>{line}</div>
          ))}
        </Toast.Body>
      </Toast>
    </div>
  )
})

const MatchRoot = view(function MatchRoot() {
  return <MatchViewer scroll match={store.file?.match} selection={store.selection} showError={store.showError} />
})

const ASTRoot = view(function ASTRoot() {
  return (
    <ASTViewer
      scroll
      ast={store.file?.AST}
      match={store.file?.match}
      selection={store.selection}
      showError={store.showError}
    />
  )
})

export const SpellEditor = view(function SpellEditor() {
  console.info("SpellEditor")
  // Set up hotkey when NOT in codemirror
  // Note these are duplicated in CodeMirror.js
  useHotkeys("command+s", (event) => {
    event.preventDefault()
    store.saveFile()
  })
  useHotkeys("shift-command+r", () => store.reloadFile())
  useHotkeys("command+enter", () => store.compile())
  useHotkeys("command+n", (event) => {
    event.preventDefault()
    store.createFile()
  })

  if (DEBUG_RENDER) console.warn("SpellEditor")
  return (
    <>
      <Container fluid className="SpellEditor d-flex flex-column px-0">
        <Row id="toolbar">
          <Col xs={12}>
            <EditorToolbar />
          </Col>
        </Row>
        <Row id="topRow" noGutters className="p-1">
          <Col xs={6} className="">
            <div className="SpellEditorPanel rounded shadow-sm border">
              <InputEditor />
            </div>
          </Col>
          <Col xs={6} className="pl-2">
            <div className="SpellEditorPanel rounded shadow-sm border">
              <ASTRoot />
            </div>
          </Col>
        </Row>
        <Row id="bottomRow" noGutters className="p-1">
          <Col xs={6} className="">
            <div className="SpellEditorPanel rounded shadow-sm border">
              {/* <MatchRoot /> */}
              {AppContainer}
            </div>
          </Col>
          <Col xs={6} className="pl-2">
            <div className="SpellEditorPanel rounded shadow-sm border">
              <MatchRoot />
              {/* <OutputEditor /> */}
            </div>
          </Col>
        </Row>
      </Container>
      <Notice />
      <Error />
    </>
  )
})

export function SpellRoute(props) {
  const { domain, project, filePath } = props
  const path = SpellLocation.pathForUrl({ domain, project, filePath })
  // console.info("SpellRoute", path, props)
  // HACK: Actually navigate on a timeout to avoid hook / rerender problems.
  setTimeout(() => store.selectPath(path), 0)
  return <SpellEditor />
}
