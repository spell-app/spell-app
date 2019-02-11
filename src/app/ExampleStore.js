/*global confirm, prompt */
/* Store of example spell code fragments. */
import { observable, computed } from "mobx";

import parser from "../rules/spell/index.js";
import global, { localStorage } from "../utils/global.js";

// Make Parser and Tokenizer WARN as we run
import Parser from "../Parser";
Parser.WARN = true;
Parser.DEBUG = true;
Parser.TIME = true;

import Tokenizer from "../Tokenizer";
Tokenizer.WARN = true;

export default class ExampleStore {
  // CURRENT examples
  @observable examples = {};
  // Examples as of last save (for rever)
  @observable _savedExamples = {};
  // Selected example key.
  @observable selected = "";
  // Compiled output.
  @observable output = "";

  // Return just the titles of the examples.
  @computed get titles() {
    return Object.keys(this.examples);
  }

  // Return the code for the current example
  @computed get code() {
    return this.examples[this.selected];
  }

  // Is ANYTHING dirty?
  @computed get dirty() {
    return JSON.stringify(this._savedExamples) !== JSON.stringify(this.examples);
  }

  // Reset all examples from localStorage.
  reset() {
    delete localStorage.spellEditorExamples;
    delete localStorage.spellEditorExample;
    if (global.location) global.location.reload();
  }

  // Load examples
  load() {
    // Load examples from localStorage
    this.examples = JSON.parse(
      localStorage.spellEditorExamples || '{"Foo":"define type Foo", "Bar":"define type Bar"}'
    );

    // Save a copy of examples for revert
    this._savedExamples = this.examples;

    // Load selected example name
    this.select(localStorage.spellEditorExample);
  }

  // Save current examples.
  save() {
    localStorage.spellEditorExamples = JSON.stringify(this.examples);

    // Save a copy of examples for revert
    this._savedExamples = this.examples;
  }

  // Revert the current example
  revert(example = this.selected) {
    this.update(example, this._savedExamples[example]);
  }

  // Select a different example.
  select(example) {
    if (!example || this.examples[example] == null) example = Object.keys(this.examples)[0] || "";
    this.selected = localStorage.spellEditorExample = example;
    this.output = "";
  }

  // Create a new example.
  // Saves and selects the example automatically.
  update(name, code, skipSave) {
    this.examples = Object.assign({}, this.examples, { [name]: code });
    this.select(name);
    this.output = "";
    if (!skipSave) this.save();
  }

  // Delete an example.
  // Saves and selects another example automatically.
  delete(name = this.selected, showConfirm) {
    if (showConfirm && !confirm(`Really delete example ${name}?`)) return;
    let examples = Object.assign({}, this.examples);
    delete examples[name];
    this.examples = examples;
    this.save();
    this.select();
  }

  // Create a new example.
  create(name, code = "") {
    // If no name, prompt.
    if (!name) name = prompt("Name for this example?");
    // Forget it if no name.
    if (!name) return;

    this.update(name, code);
  }

  // Rename an example.
  // Selects and saves automatically.
  rename(oldName = this.selected, newName) {
    // If no new name, prompt.
    if (!newName) newName = prompt("New name for this example?", oldName);

    // Forget it if no name supplied or name is the same
    if (!newName || newName === oldName) return;
    if (this.examples[newName])
      return console.warn(`examples.rename("${newName}"): name already in use`);

    let code = this.examples[oldName];
    this.delete(oldName);
    this.update(newName, code);
  }

  // Duplicate an example.
  duplicate(oldName = this.selected, newName) {
    // If no new name, prompt.
    if (!newName) newName = prompt("New name for duplicate example?", oldName);
    // Forget it if no name supplied or name is the same
    if (!newName || newName === oldName) return;
    if (this.examples[newName])
      return console.warn(`examples.rename("${newName}"): name already in use`);

    this.update(newName, this.code);
  }

  // Compile the current example, placing it in our `output`.
  //TODO: some way to do this automatically w/ "output" ?
  compile() {
    this.output = "...compiling...";
    setTimeout(() => {
      let result = parser.parse("statements", this.code);
      if (!result) {
        console.warn("Can't parse!");
        this.output = "Can't parse statements";
      } else {
        console.info("Result", result);
        this.output = result.toSource(parser);
      }
    }, 100);
  }
}
