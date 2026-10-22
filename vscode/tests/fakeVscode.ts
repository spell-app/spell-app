import type * as vscode from "vscode"

/**
 * A stand-in for VS Code's `vscode` module, for the extension's unit tests:
 * only what `ElementsHelp` uses, as tiny classes and records.
 * - The tests run it as `vscode` (`vitest.config.ts`, beside this folder:  an alias);
 *   their TYPES stay VS Code's own (`@types/vscode`).
 * - `vscode` exists only inside VS Code:  no package to import, so it's this or a whole VS Code
 *   (`@vscode/test-electron`, which downloads one).
 * - Its registries are module-level:  `resetFakeVscode()` empties them between tests.
 */

////////////////
// ## Values
////////////////

/** A line and a character in it, both from 0. */
export class Position {
  constructor(
    readonly line: number,
    readonly character: number
  ) {}
}

/** From `start` to `end`. */
export class Range {
  constructor(
    readonly start: Position,
    readonly end: Position
  ) {}
}

/** A file's address:  `file` scheme, or another (`untitled` ...). */
export class Uri {
  constructor(
    readonly scheme: string,
    readonly fsPath: string
  ) {}

  /** The `file:` URI of absolute path `path`. */
  static file(path: string): Uri {
    return new Uri("file", path)
  }

  toString(): string {
    return `${this.scheme}://${this.fsPath}`
  }
}

/** Markdown text, e.g. a completion's documentation. */
export class MarkdownString {
  constructor(readonly value = "") {}
}

/** VS Code's own numbers. */
export enum CompletionItemKind {
  Value = 11
}

/** VS Code's own numbers. */
export enum DiagnosticSeverity {
  Error = 0,
  Warning = 1,
  Information = 2,
  Hint = 3
}

/** One item of a completion list. */
export class CompletionItem {
  range?: Range
  sortText?: string
  detail?: string
  documentation?: MarkdownString

  constructor(
    readonly label: string | { label: string; description?: string },
    readonly kind?: CompletionItemKind
  ) {}
}

/** One problem, in the Problems list. */
export class Diagnostic {
  source?: string
  code?: string | number

  constructor(
    readonly range: Range,
    readonly message: string,
    readonly severity: DiagnosticSeverity = DiagnosticSeverity.Error
  ) {}
}

////////////////
// ## Registries
////////////////

/** A named set of problems, by file URI. */
class FakeDiagnosticCollection {
  constructor(readonly name: string) {}

  set(uri: Uri, diagnostics: Diagnostic[]): void {
    this.byUri.set(uri.toString(), diagnostics)
  }

  get(uri: Uri): Diagnostic[] | undefined {
    return this.byUri.get(uri.toString())
  }

  delete(uri: Uri): void {
    this.byUri.delete(uri.toString())
  }

  dispose(): void {
    this.byUri.clear()
  }

  /** The problems, by `uri.toString()`. */
  private byUri = new Map<string, Diagnostic[]>()
}

/** An output channel that drops what it's told:  spy on its methods to read them. */
class FakeLogOutputChannel {
  constructor(readonly name: string) {}
  info(_message: string): void {}
  warn(_message: string): void {}
  error(_message: string): void {}
  dispose(): void {}
}

/** One of `workspace`'s events:  subscribe as VS Code's do;  `fire()` from a test. */
class FakeEvent<T> {
  /** Subscribe `listener`;  the result unsubscribes. */
  readonly event = (listener: (value: T) => void) => {
    this.listeners.add(listener)
    return { dispose: () => this.listeners.delete(listener) }
  }

  /** Call every listener with `value`. */
  fire(value: T): void {
    for (const listener of this.listeners) listener(value)
  }

  /** Every subscribed listener. */
  private listeners = new Set<(value: T) => void>()
}

/** Every completion provider registered:  its selector, provider and trigger characters. */
export const completionProviders: { selector: unknown; provider: unknown; triggerCharacters: string[] }[] = []

/** `workspace`'s document events, to `fire()` from a test. */
export const documentEvents = {
  open: new FakeEvent<vscode.TextDocument>(),
  change: new FakeEvent<{ document: vscode.TextDocument }>(),
  close: new FakeEvent<vscode.TextDocument>()
}

/** The documents open at the start:  `workspace.textDocuments`. */
const openDocuments: vscode.TextDocument[] = []

/** Empty the registries, and open `documents`. */
export function resetFakeVscode(documents: vscode.TextDocument[] = []): void {
  completionProviders.length = 0
  openDocuments.splice(0, Infinity, ...documents)
  for (const event of Object.values(documentEvents)) event["listeners"].clear()
}

////////////////
// ## The namespaces
////////////////

export const languages = {
  createDiagnosticCollection: (name: string) => new FakeDiagnosticCollection(name),
  registerCompletionItemProvider(selector: unknown, provider: unknown, ...triggerCharacters: string[]) {
    completionProviders.push({ selector, provider, triggerCharacters })
    return { dispose() {} }
  }
}

export const window = {
  createOutputChannel: (name: string) => new FakeLogOutputChannel(name)
}

export const workspace = {
  onDidOpenTextDocument: documentEvents.open.event,
  onDidChangeTextDocument: documentEvents.change.event,
  onDidCloseTextDocument: documentEvents.close.event,
  get textDocuments() {
    return openDocuments
  }
}

////////////////
// ## Documents
////////////////

/**
 * A document over `text`, as the editor holds it, saved or not:  file `path`, in language `languageId`.
 * - `scheme`:  `file` for a file on disk;  `untitled` for one never saved.
 */
export function fakeDocument(
  path: string,
  text: string,
  { languageId = "typescriptreact", scheme = "file" }: { languageId?: string; scheme?: string } = {}
): vscode.TextDocument {
  const lineStarts = [0, ...[...text.matchAll(/\n/g)].map((match) => match.index + 1)]
  const offsetAt = (position: Position) => lineStarts[position.line]! + position.character
  const document = {
    uri: new Uri(scheme, path),
    languageId,
    version: 1,
    getText: (range?: Range) => (range ? text.slice(offsetAt(range.start), offsetAt(range.end)) : text),
    offsetAt,
    positionAt(offset: number) {
      const line = lineStarts.findLastIndex((start) => start <= offset)
      return new Position(line, offset - lineStarts[line]!)
    }
  }
  return document as unknown as vscode.TextDocument
}
