import React from "react";

import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import NavLink from "react-bootstrap/NavLink";

import Octicon, {ChevronRight} from '@githubprimer/octicons-react'

import { projects as _projects, withProjects, INPUT } from "./redux/projects";

// Codemirror
import { Controlled as CodeMirror } from 'react-codemirror2'
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/neo.css';
import 'codemirror/theme/neat.css';
import 'codemirror/theme/solarized.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/markdown/markdown';
import './spell.codemirror.js'
import './SpellEditor.css';

export class _SpellEditor extends React.Component {
  constructor(props) {
    super(props);
    _projects.call.startup();
  }

  compile = () => _projects.call.compileInput();
  revert = () => _projects.call.revertInput();
  reload = () => _projects.call.reloadSelected();
  save = () => _projects.call.saveInput();
  selectProject = (projectId) => _projects.call.selectModule({ projectId });
  selectModule = (moduleId) => _projects.call.selectModule({ projectId: this.props.projectId, moduleId });

  create = () => {
    const moduleId = prompt("Name for the new module?", "Untitled");
    if (!moduleId) return;
    const contents = `## Module ${moduleId}`;
    _projects.call.newModule({ moduleId, contents });
  }

  duplicate = () => {
    const { moduleId } = this.props.projects;
    const newModuleId = prompt("Name for the new module?", moduleId);
    if (!newModuleId || newModuleId === moduleId) return;
    _projects.call.duplicateModule({ moduleId, newModuleId, contents: INPUT });
  }

  _delete = () => {
    const { moduleId } = this.props.projects;
    if (!confirm(`Really delete '${moduleId}'?`)) return;
    _projects.call.deleteModule({ moduleId });
  }

  rename = () => {
    const { moduleId } = this.props.projects;
    const newModuleId = prompt("New name?", moduleId);
    if (!newModuleId || newModuleId === moduleId) return;
    _projects.call.renameModule({ moduleId, newModuleId, contents: INPUT });
  }

  onInputChange = (codeMirror, change, value) => {
    //console.info(codeMirror, "\n", change)//, "\n", value)
    _projects.actions.updateInput(value);
  }

  // Buttons to show when the input field is dirty.
  dirtyButtons = (
    <div style={{ position: "absolute", right: "3px", top: "3px" }}>
      <Button variant="danger" onClick={this.revert} style={{ width: "5em" }}><u>R</u>evert</Button>
      {" "}
      <Button variant="success" onClick={this.save} style={{ width: "5em" }}><u>S</u>ave</Button>
    </div>
   );

  // Buttons to show when the input can be compiled.
  compileButton = (
    <Button
      className="border shadow-sm p-0 pt-1 text-secondary"
      style={{
        background: "#eee",
        position: "absolute",
        width: "4em",
        left: "calc(50% - 2em)",
        top: "50%"
      }}
      onClick={this.compile}
    >
      <Octicon icon={ChevronRight} size="medium"/>
    </Button>
  );

  render() {
    const { projects } = this.props;
    const { projectId, moduleId, input, output, dirty } = projects;
    const projectIds = _projects.getProjectIds(projects);
    const index = _projects.getProjectIndex(projects, projectId);

    // Don't do anything if our data isn't yet loaded
    if (!projectIds || !index) return null;

    // Create menuItems for the projects menu
    const projectItems = projectIds.map( projectId =>
      <NavDropdown.Item key={projectId} eventKey={projectId} onSelect={this.selectProject}>{projectId}</NavDropdown.Item>
    );

    // Create menuitems for the modules menu
    const moduleItems = index.modules.map( module =>
      <NavDropdown.Item key={module.id} eventKey={module.id} onSelect={this.selectModule}>{module.id}</NavDropdown.Item>
    );

    const theme = "neat"; // Owen favors: "solarized", "neo" and "neat"
    const inputOptions = {
      mode: "spell",
      theme,
      indentUnit: 2,
      tabSize: 2,
    }

    const outputOptions = {
      mode: "javascript",
      theme,
      readOnly: true,
      indentUnit: 2,
      tabSize: 2,
    }

    return (
      <Container fluid className="d-flex flex-column h-100 px-0">
        <Row>
          <Col xs={12}>
            <Navbar bg="dark" variant="dark" className="py-0">
              <Nav>
                <NavLink disabled>Project:</NavLink>
                <NavDropdown title={projectId} id="project-dropdown" style={{width: "12em"}}>
                  {projectItems}
                </NavDropdown>
                <NavLink disabled>File:</NavLink>
                <NavDropdown title={moduleId} id="module-dropdown" style={{width: "12em"}}>
                  {moduleItems}
                </NavDropdown>
                <Navbar.Collapse id="navbar-buttons" className="ml-2">
                  <Nav>
                    <Button variant={dirty ? "success" : "dark"} onClick={this.save}>Save</Button>
                    <Button variant={dirty ? "danger" : "dark"} onClick={this.revert}>Revert</Button>
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
          {output ? null : this.compileButton}
        </Row>
      </Container>
    );
  }
}

// Pass projects from redux
const SpellEditor = withProjects(_SpellEditor);
export { SpellEditor }
