import { core, App, View, ViewableList, prop, thing, drawn, position } from "@spell/core"
import { E, SpellElement } from "@spell/elements"

core.heading("Tic-Tac-Toe")
/////////////////
// ## Tic-Tac-Toe
/////////////////
// Two players take turns, X then O, putting their mark in an empty square.
// Three in a row, across, down or corner to corner, wins;  nine marks and no row is a draw.
// What's where, top to bottom:
//   a square, and the board:  nine squares in a grid
//   the game:  whose turn it is, the rules for a win, and its drawing
//   start
//   tests

core.heading("A square:  empty, or holding an X or an O")
/** A square:  empty, or holding an X or an O */
export class Square extends View {
  static elementTag = core.defineElement(this, "test-project")

  // - its "mark" is text
  @prop({ type: "text" })
  accessor mark!: string

  get isEmpty() {
    return this.mark === ""
  }

  /** a click plays it:  the game says whether it can */
  @drawn draw() {
    return <button part="mark" onClick={() => this.play()} style="cursor:pointer;user-select:none">{this.mark}</button>
  }

  /** Playing a square:  the turn's mark, if the square is empty and nobody has won */
  play() {
    if (ticTacToe.isOver || !this.isEmpty) return
    this.mark = ticTacToe.turn
    ticTacToe.checkForAWinner()
    ticTacToe.turn = ticTacToe.turn === "X" ? "O" : "X"
  }

  get board() {
    return Board.ownerOf(this)!
  }
}

/**
 * `<test-project-square>`:  a square, drawn in its own element, e.g. by `draw the square`.
 * - The page defines its tag with this class:  `core.useElement()`, below.
 * - Its attributes are its square's properties;  its methods call its square's.
 * - What every view's element does, e.g. drawing its square, is `SpellElement`'s.
 */
export class SquareElement extends SpellElement<Square> {
  @E.proto static vocabulary = SpellElement.vocabularyFor("test-project-square", "square", [
    { name: "mark", kind: "string", description: "Its mark." }
  ])

  play() {
    return this.currentThing?.play()
  }
}
core.useElement(Square, SquareElement)

core.heading("The board:  nine squares, three a row -- styles.css lays them out")
/** The board:  nine squares, three a row -- styles.css lays them out */
export class Board extends ViewableList<Square> {
  static instanceType = Square
  static elementTag = core.defineElement(this, "test-project")

  static exclusive = true
}

/**
 * `<test-project-board>`:  a board, drawn in its own element, e.g. by `draw the board`.
 * - The page defines its tag with this class:  `core.useElement()`, below.
 * - Its attributes are its board's properties;  its methods call its board's.
 * - What every view's element does, e.g. drawing its board, is `SpellElement`'s.
 */
export class BoardElement extends SpellElement<Board> {
  @E.proto static vocabulary = SpellElement.vocabularyFor("test-project-board", "board", [])
}
core.useElement(Board, BoardElement)

/** a square is on one board */

core.heading("The game")
/** The game */
@thing
export class TicTacToe extends App {
  static elementTag = core.defineElement(this, "test-project", "App")

  // - its "board" is a new board
  @prop({ init: () => new Board(), early: true })
  accessor board!: Board

  /** whose turn it is:  X or O */
  // - its "turn" is text
  @prop({ type: "text" })
  accessor turn!: string

  /** who won:  X, O, "nobody" for a draw, or "" while the game goes on */
  // - its "winner" is text
  @prop({ type: "text" })
  accessor winner!: string

  get isOver() {
    return this.winner !== ""
  }

  /** what the line above the board says */
  get message() {
    if (this.winner === "") return `${this.turn} to play`
    if (this.winner === "nobody") return "A draw"
    return `${this.winner} wins!`
  }

  /**
   * nine squares, made with the game
   * - inside the loop `it` is the count:  so the board is `the board of tic tac toe`
   */
  create() {
    core.map(core.countTo(9), () => this.board.append(new Square()))
  }

  /** an empty board, X to play */
  startANewGame() {
    this.board.forEach((square) => (square.mark = ""))
    this.turn = "X"
    this.winner = ""
  }

  /** the same mark in all three squares wins */
  checkTheLineFromSquareAThroughBToC(a: number, b: number, c: number) {
    const mark = this.board.getItem(position(a))?.mark
    if (mark === "") return
    if (this.board.getItem(position(b))?.mark === mark && this.board.getItem(position(c))?.mark === mark) this.winner = mark
  }

  /** three in a row:  each row, each column, and the two diagonals */
  checkForAWinner() {
    this.checkTheLineFromSquareAThroughBToC(1, 2, 3)
    this.checkTheLineFromSquareAThroughBToC(4, 5, 6)
    this.checkTheLineFromSquareAThroughBToC(7, 8, 9)
    this.checkTheLineFromSquareAThroughBToC(1, 4, 7)
    this.checkTheLineFromSquareAThroughBToC(2, 5, 8)
    this.checkTheLineFromSquareAThroughBToC(3, 6, 9)
    this.checkTheLineFromSquareAThroughBToC(1, 5, 9)
    this.checkTheLineFromSquareAThroughBToC(3, 5, 7)
    if (this.winner === "" && !this.board.any((square) => square.isEmpty)) this.winner = "nobody"
  }

  /** the message, the board, then a button for a new game */
  @drawn draw() {
    return (
      <div class="TicTacToe">
        <h2 class="Message">{this.message}</h2>
        {core.drawThing(this.board)}
        <ui-button primary={true} onClick={() => this.startANewGame()} style="cursor:pointer;user-select:none">
          New game
        </ui-button>
      </div>
    )
  }
}

/**
 * `<test-project-app>`:  a tic tac toe, drawn in its own element, e.g. by `draw the tic tac toe`.
 * - The page defines its tag with this class:  `core.useElement()`, below.
 * - Its attributes are its tic tac toe's properties;  its methods call its tic tac toe's.
 * - What every view's element does, e.g. drawing its tic tac toe, is `SpellElement`'s.
 */
export class TicTacToeElement extends SpellElement<TicTacToe> {
  @E.proto static vocabulary = SpellElement.vocabularyFor("test-project-app", "tic tac toe", [
    { name: "board", kind: "json", description: "Its board." },
    { name: "turn", kind: "string", description: "Its turn." },
    { name: "winner", kind: "string", description: "Its winner." }
  ])

  create() {
    return this.currentThing?.create()
  }

  startANewGame() {
    return this.currentThing?.startANewGame()
  }

  checkTheLineFromSquareAThroughBToC(a: number, b: number, c: number) {
    return this.currentThing?.checkTheLineFromSquareAThroughBToC(a, b, c)
  }

  checkForAWinner() {
    return this.currentThing?.checkForAWinner()
  }
}
core.useElement(TicTacToe, TicTacToeElement)
export const ticTacToe = new TicTacToe()

core.heading("Start")
//## Start
ticTacToe.startANewGame()
if (!core.isCarryingOver) ticTacToe.start()

core.heading("Tests")
/** Tests */
export function testThreeInARow() {
  return core.test("test three in a row", function testThreeInARow() {
    core.echoTestAction(`start a new game`)
    ticTacToe.startANewGame()
    core.echoTestAction(`play square 1 of the board of tic tac toe`)
    ticTacToe.board.firstItem?.play()
    core.echoTestAction(`play square 4 of the board of tic tac toe`)
    ticTacToe.board.getItem(3)?.play()
    core.echoTestAction(`play square 2 of the board of tic tac toe`)
    ticTacToe.board.getItem(1)?.play()
    core.echoTestAction(`play square 5 of the board of tic tac toe`)
    ticTacToe.board.getItem(4)?.play()
    core.echoTestAction(`play square 3 of the board of tic tac toe`)
    ticTacToe.board.getItem(2)?.play()
    core.expect(ticTacToe.winner, `the winner of tic tac toe`, "X", `"X"`)
    core.expect(ticTacToe.message, `the message of tic tac toe`, "X wins!", `"X wins!"`)
    core.echoTestAction(`start a new game`)
    ticTacToe.startANewGame()
  })
}
// -----------
core.installStyles(undefined, `/* File styles.css:  how the game looks.¬   - The board, <tic-tac-toe-board>, lays its nine squares out three a row.¬   - Each square, <tic-tac-toe-square>, is a big button:  its part, ::part(mark). */¬¬.TicTacToe {¬  max-width: 22em;¬  margin-inline: auto;¬  padding-block: 1.5em;¬  text-align: center;¬}¬¬.Message {¬  min-height: 1.5em;¬}¬¬/****************¬ * The board:  three squares a row, lines between them¬ ****************/¬¬tic-tac-toe-board {¬  display: grid;¬  grid-template-columns: repeat(3, 1fr);¬  gap: 0.4em;¬  margin-block: 1em 1.5em;¬}¬¬/****************¬ * A square:  a square button, its mark big¬ ****************/¬¬tic-tac-toe-square::part(mark) {¬  width: 100%;¬  aspect-ratio: 1;¬  border: none;¬  border-radius: 0.5em;¬  background: rgb(127 127 127 / 0.12);¬  color: inherit;¬  font: inherit;¬  font-size: 3em;¬  font-weight: bold;¬  cursor: pointer;¬}¬¬tic-tac-toe-square::part(mark):hover {¬  background: rgb(127 127 127 / 0.2);¬}¬¬tic-tac-toe-square[mark="X"]::part(mark) {¬  color: #2185d0;¬}¬¬tic-tac-toe-square[mark="O"]::part(mark) {¬  color: #db2828;¬}¬`)
// -----------
if (!core.isCarryingOver) testThreeInARow()

// each view type's tag, for the JSX
declare module "@solidjs/web/types/jsx.js" {
  namespace JSX {
    interface IntrinsicElements {
      /** `SquareElement` */
      "test-project-square": HTMLAttributes<HTMLElement> & { [attribute: string]: unknown }
      /** `BoardElement` */
      "test-project-board": HTMLAttributes<HTMLElement> & { [attribute: string]: unknown }
      /** `TicTacToeElement` */
      "test-project-app": HTMLAttributes<HTMLElement> & { [attribute: string]: unknown }
    }
  }
}
