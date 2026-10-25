/**
 * The editor's own texts, in English:  every word the app shows people, by key (epic `spanish` P13).
 * - Read through `appTexts.text(key, params)` (`AppTexts.ts`), never written inline.
 * - `{name}` is a placeholder, filled from the params.
 *   - A project group's words are params too (see `AppTexts.groupWords()`):
 *     `{type}` (`example`), `{Type}` (`Example`), `{theType}` (`the example`)
 *   - Each language writes the sentence its own way, with the ones it needs.
 * - Other languages:  a file beside it each, `AppTexts.<lang>.ts`, with every key (its type says so).
 * - Pure data, no imports:  the editor's entry, the runner and `<spell-viewer>` all carry it.
 * - The web components' own texts (`<spell-viewer>`, `<spell-editor>`) are in their vocabularies, `Spell<Name>.en.ts`.
 */
export const APP_TEXTS = {
  ////////////////
  // ## Actions:  menu items and buttons (`Actions.tsx`)
  ////////////////

  editApp: "Edit {Type}",
  preview: "Run",
  settings: "Settings",
  home: "Home",
  help: "Help",
  you: "You",
  createApp: "New {Type}",
  duplicateApp: "Duplicate {Type}",
  renameApp: "Rename {Type}",
  deleteApp: "Delete {Type}",
  restart: "Restart",
  modes: "Run, edit or debug",
  runMode: "Run",
  editMode: "Edit",
  debugMode: "Debug",
  showLineNumbers: "Show line numbers",
  // the input editor's two views of a .spellx file (epic `elemental-spell` P11)
  inputViewText: "Show as text",
  inputViewNotebook: "Show as a notebook of cards",
  notebookFold: "Close",
  notebookUnfold: "Open",
  notebookShowForm: "Show the form",
  notebookShowCode: "Show the code",
  notebookMoveUp: "Move up",
  notebookMoveDown: "Move down",
  notebookName: "Name",
  notebookOneOf: "One of",
  notebookOneOfHint: "a, b or c",
  notebookAliases: "Aliases",
  notebookAliasHint: "is a (value)",
  resetApp: "Reset {Type}",
  runTests: "Run Tests",
  newProject: "New App",
  newExample: "New Example",
  newGuide: "New Guide",
  newFile: "New File",
  duplicateFile: "Duplicate File",
  renameFile: "Rename File",
  deleteFile: "Delete File",
  save: "Save",
  reload: "Reload",
  clearConsole: "Clear Console",
  alert: "Alert",
  confirm: "Confirm",
  prompt: "Prompt",
  promptNumber: "Prompt Number",
  choose: "Choose",
  cancel: "Cancel",

  ////////////////
  // ## The editor's panes:  their menus, and what they say while empty
  ////////////////

  appMenu: "App",
  javascriptOutput: "Javascript Output",
  programOutput: "Output",
  spellTree: "Spell Tree",
  spellTreeHint: "Put the cursor on a line to see its spell tree.",
  loadingEditor: "Loading editor…",
  errorContext: "Context:",
  errorParams: "Params:",
  error: "Error",

  consoleCompiling: "Compiling",
  consoleCompiledTo: "Compiled to javascript:",
  consoleExecuting: "Executing {type}",
  consoleFailed: "{Type} failed with error:",
  consoleExecuted: "{Type} executed without errors.",
  testResults: "Tests:  {passed} passed, {failed} failed",
  noTests: "No tests -- write one as `to test <something>:`",

  ////////////////
  // ## The project chooser (`ProjectChooser.tsx`, `ProjectDropdown.tsx`)
  ////////////////

  welcome: "Welcome to Spell!",
  openGroup: "Open {Type}",
  createNewProject: "Create a New App",
  createNewExample: "Create a New Example",
  createNewGuide: "Create a New Guide",
  loadingGroup: "Loading...",
  couldNotLoadGroup: "Couldn't load {title}",
  nothingInGroup: "No {title} yet!",

  ////////////////
  // ## The landing page (`ProjectChooser.tsx`), and the editor's top bar (`EditorTheme.tsx`)
  ////////////////

  appName: "Spell",
  homeEyebrow: "Spell, in preview",
  homeTitle: "Write an app in a sentence.",
  homeTagline: "Plain words in.  A working app out.",
  homeIntro:
    "Spell is a programming language you can read aloud.  Open an example, change a sentence, and watch the app change beside it.",
  tryAnExample: "Try an example",
  readFirstSpell: "Read your first spell",
  homeQuoteTitle: "From the Task List",
  homeQuote:
    'A "task" is a thing where:\nits "title" is text,\nits "done" is yes or no,\nand it "is done" if its done is yes.',
  homeQuoteNote: "Four lines, one working list.",
  homeExamplesLine: "Open one, change it, make it yours.",
  homeGuidesLine: "Your idea, your pace.",
  homeProjectsLine: "What you've made, and where to start the next one.",
  homeFixturesLine: "The frozen apps the tests run against.",
  homeNoGuides: "Guides are on their way.",

  ////////////////
  // ## Project groups:  each group's words, by its `type` (spaces' `PROJECT_GROUPS`)
  ////////////////

  "type.project": "app",
  "Type.project": "App",
  "theType.project": "the app",
  "title.project": "Apps",
  "description.project": "Your own apps",
  "type.example": "example",
  "Type.example": "Example",
  "theType.example": "the example",
  "title.example": "Examples",
  "description.example": "Example apps",
  "type.guide": "guide",
  "Type.guide": "Guide",
  "theType.guide": "the guide",
  "title.guide": "Guides",
  "description.guide": "Usage guides",
  "type.library": "library",
  "Type.library": "Library",
  "theType.library": "the library",
  "title.library": "Libraries",
  "description.library": "Libraries other apps import, e.g. `@spell/library/people` in an app's `__project.json5`",
  "type.fixture": "fixture",
  "Type.fixture": "Fixture",
  "theType.fixture": "the fixture",
  "title.fixture": "Test fixtures",
  "description.fixture": "Frozen apps tests run against -- edit one, then `yarn spell:test:fixtures:bless`",

  ////////////////
  // ## Notices and errors (`editor.ts`)
  ////////////////

  pathInvalid: "Path '{path}' is invalid!",
  createdApp: "Created {type} {name}.",
  duplicatedApp: "{Type} duplicated.",
  renamedApp: "{Type} renamed.",
  removedApp: "{Type} removed.",
  resetAppConfirm: "Forget your changes to {theType}, and show it as it was?",
  fileCreated: "File created.",
  fileDuplicated: "File duplicated.",
  fileRenamed: "File renamed.",
  fileRemoved: "File removed.",
  noTypesYet: "{Type} {name} has no templates yet:  compile it first.",
  noSuchType: "{Type} {name} has no template `{typeName}`.",
  propertyEditorHeader: "New Property Editor",
  propertyEditorMessage: "Make a property editor for which template?",
  create: "Create",

  ////////////////
  // ## The Type Explorer (`TypeExplorer.tsx`, `ScopeDetailsPane.tsx`)
  ////////////////

  scopes: "Scopes",
  refreshScopes: "Refresh the scopes",
  runToSeeScopes: "Run the app to see its scopes.",
  details: "Details",
  orderDocument: "Document order, under their headings",
  orderAlphabetical: "Alphabetical",
  loading: "Loading…",
  members: "Members",
  spell: "Spell",
  showWhereDefined: "Show where it's defined",
  rules: "Rules",
  compiledOutput: "Compiled Output",
  clickToEdit: "Click to edit",
  addDescription: "Add a description…",
  // each group of a type's members, by its label (`LSP.SCOPE_MEMBER_GROUPS`)
  "members.Types": "Templates",
  "members.Properties": "Properties",
  "members.Actions": "Actions",
  "members.Constants": "Constants",
  "members.Functions": "Functions",
  "members.Variables": "Variables",

  ////////////////
  // ## The Thing Explorer (`ThingExplorer.tsx`)
  ////////////////

  things: "Things",
  runToSeeThings: "Run the app to see its things.",
  topLevel: "Top level",
  allThings: "All things",
  selectThing: "Select a thing to see its properties.",
  properties: "Properties",
  actions: "Actions",
  empty: "empty",
  list: "list",
  thing: "thing",
  computed: "computed",
  action: "action",
  listOf: "{type} of {count}",
  doIt: "Do it:  {action}()",
  thingsInOrderMade: "In the order they were made",
  thingsByType: "By template, sub-templates included",
  // the Program panel's tabs (`<ProgramPanel>`)
  outputTab: "Output",
  typescriptTab: "TypeScript",
  pythonTab: "Python",
  // a .spellx file's code spell, the text it reads as (epic `elemental-spell` P8)
  codeSpellTab: "Code Spell",
  inspector: "Inspector",
  inspectorPick: "Pick a part of the app",
  inspectorTip: "Pick a part of the app with the crosshairs, to see what it is and change it.",
  inspectorPicking: "Click a part of the app;  Alt-click for any part inside it.  Esc stops picking.",
  inspectorText: "Text",
  inspectorItems: "Its {count} items",
  // the properties card's sections, a Spell UI attribute group each (`E.ATTRIBUTE_GROUPS`)
  "inspectorGroup.name": "Name",
  "inspectorGroup.content": "Content",
  "inspectorGroup.appearance": "Appearance",
  "inspectorGroup.layout": "Layout",
  "inspectorGroup.states": "States",
  "inspectorGroup.form": "Form",
  "inspectorGroup.link": "Link",
  "inspectorGroup.behaviour": "Behaviour",
  "inspectorGroup.advanced": "Advanced",
  inspectorNone: "none",
  inspectorEvents: "Events",
  inspectorNoEvents: "None yet.",
  inspectorEventsTip: "Pick a part to see its events.",
  inspectorEventCode: "What happens on {event}",
  inspectorProperties: "Properties",
  inspectorThings: "Things",
  inspectorTemplates: "Templates",
  inspectorFold: "Close",
  inspectorUnfold: "Open",
  inspectorHide: "Hide this panel",
  inspectorExpandAll: "Expand all",
  inspectorCollapseAll: "Collapse all",
  inspectorPanels: "Show or hide panels",
  inspectorAddEvent: "Add event",
  inspectorParts: "Views",
  inspectorNoParts: "Run the app to see its parts.",
  // an event's name, for people (`<InspectorEvents>`):  "event.<the DOM event>"
  "event.click": "click",
  "event.dblclick": "double click",
  "event.mousedown": "mouse down",
  "event.mouseup": "mouse up",
  "event.mouseenter": "mouse enter",
  "event.mouseleave": "mouse leave",
  "event.focus": "focus",
  "event.blur": "blur",
  "event.keydown": "key down",
  "event.keyup": "key up",
  closeProgram: "Close the Program panel",
  thingsTab: "Things",
  typesTab: "Templates",
  javascriptTab: "JavaScript",
  treeTab: "Sentence",

  ////////////////
  // ## The runners (`SpellAppRunner.tsx`, `VSCodeRunner.tsx`)
  ////////////////

  typeExplorer: "Template Explorer",
  thingExplorer: "Thing Explorer",
  console: "Console",
  debug: "Debug",
  showConsole: "Show Console",
  hideConsole: "Hide Console",

  ////////////////
  // ## `<spell-editor>`'s pane (`SpellEditorPane.tsx`, `SpellEditor.tsx`)
  ////////////////

  editedSinceSaved: "Edited since it was saved",
  editorKeys: "⌘S save · ⌘↵ run",
  compiling: "Compiling…",
  compiled: "Compiled",
  saved: "Saved",
  parseError: "{count} parse error -- not run",
  parseErrors: "{count} parse errors -- not run",
  compileAndRun: "Compile and run",

  ////////////////
  // ## The "You" panel (`YouPanel.tsx`)
  ////////////////

  youHeader: "You:  {address}",
  fileProblems: "Your file has problems:  read anyway",
  names: "Names",
  nickname: "Nickname",
  emails: "Emails, one a line",
  dates: "Dates",
  dateWhat: "What",
  dateDay: "Day",
  dateRemove: "Remove",
  datePlaceholder: "birthday",
  addDate: "Add a date",
  yourOrgs: "Your orgs",
  noneYet: "None yet.",

  ////////////////
  // ## A project's settings (`ProjectSettings.tsx`)
  ////////////////

  projectSettings: "{title} settings",
  titleHint: "Its folder's name, as words, when left empty.",
  titleTip: "The app's name for people, in the app list and the editor's title bar.",
  versionTip: "Its version, as `1.2.0`:  stamped on what it declares, for apps that import it.",
  targetsLabel: "Also compiles to",
  targetsTip: "Languages it compiles to as well as JavaScript, which it always does.",
  listsStartAtLabel: "Lists start at",
  listsStartAtTip: "Where its lists start counting:  1 as spell does, or 0 as JavaScript and Python do."
} as const

/** Key of one of the editor's texts, e.g. `"save"`. */
export type AppTextKey = keyof typeof APP_TEXTS

/** One language's editor texts:  EVERY key, so a missing translation is a type error. */
export type AppTextPack = Readonly<Record<AppTextKey, string>>
