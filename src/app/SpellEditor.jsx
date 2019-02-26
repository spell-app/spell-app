import React from "react";
import keydown from "react-keydown";

import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";

import Octicon, {ChevronRight} from '@githubprimer/octicons-react'

import { packages as packageFactory, withPackages, INPUT } from "./redux/packages";
import TabbableTextArea from "./TabbableTextArea.jsx";

export class _SpellEditor extends React.Component {
  constructor(props) {
    super(props);
    packageFactory.call.startup();
  }

  // @keydown("ctrl+c")
  compile = () => packageFactory.call.compileInput();

  // @keydown("ctrl+r")
  revert = () => packageFactory.call.revertInput();

  reload = () => packageFactory.call.reloadSelected();

  // @keydown("ctrl+s")
  save = () => packageFactory.call.saveInput();

  // @keydown("ctrl+n")
  create = () => {
    const moduleId = prompt("Name for the new module?", "Untitled");
    if (!moduleId) return;
    const contents = `# Module ${moduleId}`;
    packageFactory.call.newModule({ moduleId, contents });
  }

  duplicate = () => {
    const { moduleId } = this.props.packages;
    const newModuleId = prompt("Name for the new module?", moduleId);
    if (!newModuleId || newModuleId === moduleId) return;
    packageFactory.call.duplicateModule({ moduleId, newModuleId, contents: INPUT });
  }

  // @keydown("ctrl+d")
  _delete = () => {
    const { moduleId } = this.props.packages;
    if (!confirm(`Really delete '${moduleId}'?`)) return;
    packageFactory.call.deleteModule({ moduleId });
  }

  rename = () => {
    const { moduleId } = this.props.packages;
    const newModuleId = prompt("New name?", moduleId);
    if (!newModuleId || newModuleId === moduleId) return;
    packageFactory.call.renameModule({ moduleId, newModuleId, contents: INPUT });
  }

  updateInput = (event) => {
    packageFactory.actions.updateInput(event.target.value);
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
    const { packages } = this.props;
//console.info("SpellEditor.render(): packages:", packages);
    const { packageId, moduleId, input, output, dirty } = packages;
    const packageIds = packageFactory.getPackageIds(packages);
    const index = packageFactory.getPackageIndex(packages, packageId);
    // Don't do anything if our data isn't yet loaded
    if (!packageIds || !index) return null;

    // Create menuItems for the packages menu
    const packageItems = packageIds.map( packageId => {
      const onSelect = () => packageFactory.call.selectModule({ packageId })
      return <NavDropdown.Item key={packageId} eventKey={packageId} onSelect={onSelect}>{packageId}</NavDropdown.Item>
    });

    // Create menuitems for the modules menu
    const moduleItems = index.modules.map( module => {
      const moduleId = module.id;
      const onSelect = () => packageFactory.call.selectModule({ packageId, moduleId })
      return <NavDropdown.Item key={moduleId} onSelect={onSelect}>{module.id}</NavDropdown.Item>
    });

    return (
      <Container fluid className="d-flex flex-column h-100 px-0">
        <Row>
          <Col xs={12}>
            <Navbar bg="dark" variant="dark" className="py-0">
              <Nav>
                <NavDropdown title={packageId} id="package-dropdown" style={{width: "12em"}}>
                  {packageItems}
                </NavDropdown>
                <NavDropdown title={moduleId} id="module-dropdown" style={{width: "12em"}}>
                  {moduleItems}
                </NavDropdown>
                <Navbar.Collapse id="navbar-buttons" className="ml-2">
                  <Nav>
                    <Nav.Link onSelect={this.create}><u>N</u>ew</Nav.Link>
                    <Nav.Link onSelect={this.duplicate}>Duplicate</Nav.Link>
                    <Nav.Link onSelect={this.rename}>Rename</Nav.Link>
                    <Nav.Link onSelect={this._delete}><u>D</u>elete</Nav.Link>
                  </Nav>
                </Navbar.Collapse>
              </Nav>
            </Navbar>
          </Col>
        </Row>
        <Row noGutters className="p-2 h-100">
          <Col xs={6} className="h-100">
            {this.dirtyButtons}
            <TabbableTextArea value={input} onChange={this.updateInput}/>
          </Col>
          <Col xs={6} className="pl-2">
            <TabbableTextArea defaultValue={output} disabled/>
          </Col>
          {output ? null : this.compileButton}
        </Row>
      </Container>
    );
  }
}

// Pass packages from redux
export default withPackages(_SpellEditor);
