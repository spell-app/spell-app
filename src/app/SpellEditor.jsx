import React from "react";
import keydown from "react-keydown";
import { Button, Dropdown, Grid, Menu, Segment, TextArea } from "semantic-ui-react"

import packageFactory, { withPackages, INPUT } from "./redux/packages";
import Spacer from "./Spacer.jsx";
import "./styles.less";
import TabbableTextArea from "./TabbableTextArea.jsx";

export class _SpellEditor extends React.Component {
  constructor(props) {
    super(props);
    packageFactory.call.startup();
  }

  @keydown("ctrl+c")
  compile() { packageFactory.call.compileInput(); }

  @keydown("ctrl+r")
  revert() { packageFactory.call.revertInput(); }

  reload() { packageFactory.call.reloadSelected(); }

  @keydown("ctrl+s")
  save() { packageFactory.call.saveInput(); }

  @keydown("ctrl+n")
  create() {
    const moduleId = prompt("Name for the new module?", "Untitled");
    if (!moduleId) return;
    const contents = `# Module ${moduleId}`;
    packageFactory.call.newModule({ moduleId, contents });
  }

  duplicate() {
    const { moduleId } = this.props.packages;
    const newModuleId = prompt("Name for the new module?", moduleId);
    if (!newModuleId || newModuleId === moduleId) return;
    packageFactory.call.duplicateModule({ moduleId, newModuleId, contents: INPUT });
  }

  @keydown("ctrl+d")
  delete() {
    const { moduleId } = this.props.packages;
    if (!confirm(`Really delete '${moduleId}'?`)) return;
    packageFactory.call.deleteModule({ moduleId });
  }

  rename() {
    const { moduleId } = this.props.packages;
    const newModuleId = prompt("New name?", moduleId);
    if (!newModuleId || newModuleId === moduleId) return;
    packageFactory.call.renameModule({ moduleId, newModuleId, contents: INPUT });
  }


  dirtyButtons = (
    <Menu secondary style={{ position: "absolute", right: "1rem", top: "3px", margin: 0 }}>
      <Button negative onClick={() => this.revert()}><u>R</u>evert</Button>
      <Button positive onClick={() => this.save()}><u>S</u>ave</Button>
    </Menu>
  );

  compileButton = (
    <Button
      style={{ position: "absolute",  width: "4em", left: "calc(50% - 2em)", top: "50%" }}
      onClick={() => this.compile()}
      icon="right chevron"
    />
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
    const packageOptions = packageIds.map( packageId => {
      return {
        value: packageId,
        title: packageId,
        text: packageId,
        content: packageId,
        onClick: () => packageFactory.call.selectModule({ packageId })
      }
    });

    // Create menuitems for the modules menu
    const moduleOptions = index.modules.map( module => {
      const moduleId = module.id;
      return {
        value: moduleId,
        title: moduleId,
        text: moduleId,
        content: moduleId,
        onClick: () => packageFactory.call.selectModule({ packageId, moduleId })
      }
    });

    return (
    <Grid stretched padded className="fullHeight">
      <Grid.Row style={{ height: "2rem", paddingTop: "0rem" }} className="ui inverted attached menu">
        <Grid.Column width={12}>
          <Menu inverted attached fluid>
            <Dropdown item selection options={packageOptions} value={packageId} style={{ width: "10em" }}/>
            <Dropdown item selection options={moduleOptions} value={moduleId} style={{ width: "10em" }}/>
            <Menu.Item onClick={() => this.create()}><u>N</u>ew</Menu.Item>
            <Menu.Item onClick={() => this.duplicate()}>Duplicate</Menu.Item>
            <Spacer/>
            <Menu.Item onClick={() => this.rename()}>Rename</Menu.Item>
            <Menu.Item onClick={() => this.delete()}><u>D</u>elete</Menu.Item>
          </Menu>
        </Grid.Column>
      </Grid.Row>
      <Grid.Row style={{ height: "calc(100% - 3rem)" }}>
        <Grid.Column width={8}>
          <TabbableTextArea
            className="ui segment"
            value={input}
            onChange={(event) => packageFactory.actions.updateInput(event.target.value)}
          />
          {dirty ? this.dirtyButtons : null}
        </Grid.Column>
        <Grid.Column width={8}>
          <TextArea className="ui segment" value={output}/>
        </Grid.Column>
        {output ? null : this.compileButton}
      </Grid.Row>
    </Grid>
  );}
}

// Pass packages from redux
export default withPackages(_SpellEditor);
