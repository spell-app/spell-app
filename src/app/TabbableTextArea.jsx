import React from "react";
import propTypes from "prop-types";
import { TextArea } from "semantic-ui-react"

//
//  # <TabbableTextArea> -- <SUI.TextArea> in which you can type a tab character:
//  - If nothing is selected, inserts a tab character
//  - If anything is selected, inserts tab characters at the beginning of the line(s)
//  - If shift key is down, inserts tab characters at the beginning of the line(s).
//
//  ### Properties
//  - `save` (required) -- function used to save the results on keypress
//
export default class TabbableTextArea extends TextArea {
  render() {
    return <TextArea {...this.props} onKeyDown={this.onKeyDown} />;
  }

  // Do NOT exit on tab -- insert or remove tab(s) value instead.
  onKeyDown = (event) => {

//TODO fire `this.props.onKeyDown` if defined...
    // Forget it if not a tab
    if (event.keyCode !== 9) return;

    // prevent default so we don't exit the field
    event.preventDefault();

    // figure out the text range
    var element = event.target;
    var text = element.value;
    var start = element.selectionStart;
    var end = element.selectionEnd;

    // Replacement text
    let newText = "", selectionStart = start, selectionEnd = end;

    // If selection is empty,
    if (start === end && !event.shiftKey) {
      newText = "\t";
      selectionStart = selectionEnd = end + 1;
    }
    // otherwise indent/de-indent all of the lines
    else {
    // use start and end of line(s)
//console.info(`start: ${start} :${text[start]}:   end: ${end} : ${text[end]}:`);
      if (text[start] !== "\n") start = text.lastIndexOf("\n", start) + 1;
      if (text[end-1] === "\n") end--;
      else if (text[end+1] !== "\n") end = text.indexOf("\n", end) - 1;
//console.info(`start: ${start} :${text[start]}:   end: ${end} : ${text[end]}:`);

      let lines = text.slice(start, end).split("\n");
      // if shift key is down, REMOVE a tab from each line
      if (event.shiftKey) {
        lines = lines.map(line => line[0] === "\t" ? line.substr(1) : line);
      }
      // otherwise ADD a tab to each line
      else {
        lines = lines.map(line => "\t" + line);
      }
      selectionStart = start;
      newText = lines.join("\n");
      selectionEnd = selectionStart + newText.length + 1;
    }

    // Update input value.
    element.value   = text.substr(0, start)
            + newText
            + text.substr(end);

    // Update the selection
    element.selectionStart = selectionStart;
    element.selectionEnd = selectionEnd;

    // Delegate to `props.onChange` to save the value outside of the control
    if (this.props.onChange) this.props.onChange(event);
  }

}
