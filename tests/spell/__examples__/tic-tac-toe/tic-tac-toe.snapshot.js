import { core, Thing, List, App, View, Page, TwoSidedView, ViewableList, h, position } from "@spell/core"

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
  static { this.declareProp("mark", { type: "text" }) }
  get mark() { return this.getProp("mark") }
  set mark(value) { this.setProp("mark", value) }

  get isEmpty() {
    return this.mark === ""
  }

  /** a click plays it:  the game says whether it can */
  draw() {
    return h("button", { part: "mark", onClick: () => this.play(), style: "cursor:pointer;user-select:none" },
      () => this.mark
    )
  }

  /** Playing a square:  the turn's mark, if the square is empty and nobody has won */
  play() {
    if (ticTacToe.isOver || !this.isEmpty) return
    this.mark = ticTacToe.turn
    ticTacToe.checkForAWinner()
    ticTacToe.turn = ticTacToe.turn === "X" ? "O" : "X"
  }

  get board() {
    return Board.ownerOf(this)
  }
}

core.heading("The board:  nine squares, three a row -- styles.css lays them out")
/** The board:  nine squares, three a row -- styles.css lays them out */
export class Board extends ViewableList {
  static instanceType = Square
  static elementTag = core.defineElement(this, "test-project")

  static exclusive = true
}

/** a square is on one board */

core.heading("The game")
/** The game */
export class TicTacToe extends App {
  // - its "board" is a new board
  static { this.declareProp("board", { init: () => new Board(), early: true }) }
  get board() { return this.getProp("board") }
  set board(value) { this.setProp("board", value) }

  /** whose turn it is:  X or O */
  // - its "turn" is text
  static { this.declareProp("turn", { type: "text" }) }
  get turn() { return this.getProp("turn") }
  set turn(value) { this.setProp("turn", value) }

  /** who won:  X, O, "nobody" for a draw, or "" while the game goes on */
  // - its "winner" is text
  static { this.declareProp("winner", { type: "text" }) }
  get winner() { return this.getProp("winner") }
  set winner(value) { this.setProp("winner", value) }

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
  checkTheLineFromSquareAThroughBToC(a, b, c) {
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
  draw() {
    return h("div", { class: "TicTacToe" },
      h("h2", { class: "Message" }, () => this.message),
      () => core.drawThing(this.board),
      h("ui-button", { primary: true, onClick: () => this.startANewGame(), style: "cursor:pointer;user-select:none" },
        "New game"
      )
    )
  }
}
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
