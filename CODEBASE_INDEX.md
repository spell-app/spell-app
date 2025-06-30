# Spell Parser Codebase Index

## Overview

The Spell Parser is a sophisticated parsing and compilation system for the Spell programming language. It consists of a web-based IDE with real-time parsing, AST visualization, and code execution capabilities.

## Project Structure

### Core Architecture

#### 1. **Parser Engine** (`src/parser/`)

- **Main Parser Class** (`Parser.js`): Core parsing engine with tokenization, rule matching, and scope management
- **Tokenizer** (`tokenizer/`): Converts input text into tokens with whitespace policies
- **Rules System** (`rule/`): Modular rule definitions for different language constructs
- **Scope Management** (`scope/`): Hierarchical scope system for variables, types, and methods
- **Match System** (`Match.js`): Represents successful parsing matches with compilation capabilities

#### 2. **Spell Language Implementation** (`src/languages/spell/`)

- **SpellParser** (`SpellParser.js`): Language-specific parser extending the base Parser
- **Rules Modules** (`rules/`): Comprehensive rule set for Spell language syntax:
  - `core.js` - Basic language constructs
  - `expressions.js` - Expression parsing (22KB, 698 lines)
  - `statements.js` - Statement parsing
  - `classes.js` - Class definitions (32KB, 883 lines)
  - `methods.js` - Method definitions (48KB, 1293 lines)
  - `lists.js` - List/array handling (46KB, 1422 lines)
  - `JSX.js` - JSX syntax support (13KB, 356 lines)
  - `UI.js` - UI component rules (9.5KB, 289 lines)
  - `math.js` - Mathematical operations (9.7KB, 324 lines)
  - `properties.js` - Property access (8.4KB, 273 lines)
  - `variables.js` - Variable declarations (6.3KB, 180 lines)
  - `types.js` - Type system (7.5KB, 212 lines)
  - `events.js` - Event handling (4.7KB, 141 lines)
  - `async.js` - Async/await support (5.9KB, 179 lines)
  - `tests.js` - Testing framework (3.2KB, 102 lines)
  - `assignment.js` - Assignment operations (8.7KB, 236 lines)
  - `if.js` - Conditional statements (9.4KB, 277 lines)
  - `constants.js` - Constant definitions (2.7KB, 94 lines)
  - `draw.js` - Drawing operations (1.7KB, 67 lines)

#### 3. **SpellCore Runtime** (`src/spellCore/`)

- **Core Library** (`core.js`): Base runtime with type system, property definitions, and utilities
- **Classes** (`classes/`): Built-in class definitions (App, List, Thing)
- **Collections** (`collection-core.js`, `collection-other.js`): List and collection operations
- **String Operations** (`string.js`): String manipulation utilities
- **Console** (`console.js`): Console output and debugging
- **Runtime** (`runtime.js`): Runtime execution environment
- **UI Integration** (`ui.js`): UI component integration
- **Testing** (`tests.js`): Testing framework integration

#### 4. **Web Application** (`src/app/`)

- **Main App** (`index.jsx`): React application entry point
- **Routing** (`pages/routes.jsx`): Application routing with Reach Router
- **Pages**:
  - `SpellEditor.jsx` - Main code editor interface
  - `SpellRunner.jsx` - Code execution environment
  - `ProjectChooser.jsx` - Project selection interface
  - `ProjectSettings.jsx` - Project configuration
- **Components**:
  - `AppContainer.jsx` - Main app container
  - `InputEditor.jsx` - Code input with CodeMirror
  - `ASTViewer.jsx` - Abstract Syntax Tree visualization
  - `ConsoleViewer.jsx` - Console output display
  - `MatchViewer.jsx` - Parse match visualization
  - `SplitPanel.jsx` - Resizable panel layout
  - `SpellPage.jsx` - Page layout wrapper
- **State Management** (`store.js`): Central application state (623 lines)
- **Actions** (`actions.jsx`): User action handlers

#### 5. **Server Backend** (`src/server/`)

- **Express Server** (`index.ts`): API server with JSON5 support
- **API Routes** (`api.ts`): REST API endpoints
- **File Utilities** (`file-utils.ts`): File system operations
- **Project Utilities** (`project-utils.ts`): Project management
- **Lock Utilities** (`lock-utils.ts`): File locking for concurrent access
- **Response Utilities** (`response-utils.ts`): API response formatting

#### 6. **Utilities** (`src/util/`)

- **Core Utilities**:
  - `Derivative.js` - Inheritance and derivation system
  - `Observable.js` - Reactive state management
  - `Loadable.js` - Async loading utilities
  - `Task.js` - Task management system
  - `CustomError.js` - Error handling
  - `class.js` - Class utilities
  - `string.js` - String manipulation
  - `prefs.js` - Preferences management
- **React Integration** (`react.jsx`): React-specific utilities
- **DOM Utilities** (`DOM.jsx`): DOM manipulation helpers

### Configuration Files

#### Build & Development

- **Package.json**: Node.js dependencies and scripts
- **Vite Config** (`vite.config.ts`): Build configuration with React plugin
- **TypeScript Config** (`tsconfig.json`, `tsconfig.node.json`): TypeScript configuration
- **Vitest Config** (`vitest.config.ts`): Testing configuration
- **Environment** (`src/environment.js`): Environment variables and paths

#### Static Assets

- **Semantic UI** (`static/semantic-ui-css/`): UI framework components
- **Fonts** (`static/lato/`): Typography assets
- **Examples** (`src/examples/`): Sample Spell projects:
  - Calculator
  - Color
  - FizzBuzz
  - Solitaire (with Card.spell example)
  - Todo List
  - Todos

### Key Features

#### 1. **Real-time Parsing**

- Live tokenization and parsing as you type
- Immediate AST generation and visualization
- Error highlighting and reporting

#### 2. **Multi-language Support**

- Primary Spell language implementation
- Spanish language variant (`Card.spell-es`)
- Extensible rule system for new languages

#### 3. **Advanced Editor Features**

- CodeMirror integration with syntax highlighting
- Split-panel layout with resizable sections
- AST viewer with hierarchical tree display
- Console output with real-time execution
- Match viewer showing parse results

#### 4. **Project Management**

- Multi-project support with domain/project/file hierarchy
- File creation, editing, and deletion
- Project settings and configuration
- Import/export capabilities

#### 5. **Testing Framework**

- Built-in testing support in Spell language
- Unit test execution
- Test result visualization

#### 6. **UI Component System**

- JSX support for React components
- Semantic UI integration
- Custom UI components and layouts

### Development Workflow

#### Scripts

- `yarn dev` - Start development server
- `yarn server` - Start API server
- `yarn start` - Start both dev and API servers
- `yarn build` - Build for production
- `yarn test` - Run tests
- `yarn lint` - Lint code
- `yarn prettier` - Format code

#### Architecture Patterns

- **Parser Pattern**: Modular rule-based parsing system
- **Observer Pattern**: Reactive state management with Observable
- **Factory Pattern**: Rule and component creation
- **Strategy Pattern**: Different parsing strategies for different languages
- **Composite Pattern**: AST and scope hierarchies

### File Size Distribution

- **Largest Files**:
  - `lists.js` (46KB, 1422 lines) - List operations
  - `methods.js` (48KB, 1293 lines) - Method definitions
  - `classes.js` (32KB, 883 lines) - Class system
  - `expressions.js` (22KB, 698 lines) - Expression parsing
  - `store.js` (623 lines) - Application state

### Dependencies

- **Frontend**: React, CodeMirror, Semantic UI, Reach Router
- **Backend**: Express, body-parser, fs-extra
- **Build**: Vite, TypeScript, Vitest
- **Utilities**: Lodash, UUID, classnames

This codebase represents a sophisticated language processing system with a modern web-based IDE, combining advanced parsing techniques with real-time development tools.
