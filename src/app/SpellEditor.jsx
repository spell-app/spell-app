import React from "react";
import keydown from "react-keydown";
import { Button, Dropdown, Grid, Menu, Segment, TextArea } from "semantic-ui-react"

import packageFactory, { withPackages } from "./redux/packages";
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

//TODO
  @keydown("ctrl+s")
  save() { packageFactory.call.saveInput(); }

//TODO
  @keydown("ctrl+n")
  create() { packageFactory.call.newFile(); }

//TODO
  @keydown("ctrl+d")
  delete() { packageFactory.call.deleteSelected(); }

//TODO
  rename() { packageFactory.call.renameSelected(); }
//TODO
  duplicate() { packageFactory.call.duplicateSelected(); }


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
    const { packageIds, packageId, fileId, input, output, dirty } = packages;
    const index = packages.indices[packageId];
    // Don't do anything if our data isn't yet loaded
    if (!packageIds || !index) return null;

    // Create menuItems for the packages menu
    const packageOptions = packageIds.map( packageId => {
      return {
        value: packageId,
        title: packageId,
        text: packageId,
        content: packageId,
        onClick: () => packageFactory.call.selectFile(packageId)
      }
    });

    // Create menuitems for the files menu
    const fileOptions = index.files.map( file => {
      return {
        value: file.id,
        title: file.id,
        text: file.id,
        content: file.id,
        onClick: () => packageFactory.call.selectFile(packageId, file.id)
      }
    });

    return (
    <Grid stretched padded className="fullHeight">
      <Grid.Row style={{ height: "2rem", paddingTop: "0rem" }} className="ui inverted attached menu">
        <Grid.Column width={12}>
          <Menu inverted attached fluid>
            <Dropdown item selection options={packageOptions} value={packageId} style={{ width: "10em" }}/>
            <Dropdown item selection options={fileOptions} value={fileId} style={{ width: "10em" }}/>
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
