import { core, Thing, List, App, View, Page, TwoSidedView, ViewableList, h, position } from "@spell/core"

core.heading("How Tic-Tac-Toe works")
///////////////////////////
// ## How Tic-Tac-Toe works
///////////////////////////
// The Tic-Tac-Toe example is the paper game:  X and O take turns, and three in a row wins.
// Its rules fit in three ideas:
// - each square knows its own mark, and draws itself as a button
// - the game knows whose turn it is
// - after each move, the game checks every line of three for a winner
//
// This guide is the same game with one thing missing:  it only checks the ROWS, across.
// Three down, or corner to corner, doesn't win yet.  Adding those is your move, at the end.

core.heading("A square:  empty, or holding an X or an O")
///////////////////////////////////////////////
// ## A square:  empty, or holding an X or an O
///////////////////////////////////////////////
/** "view" means each square shows itself on the page, here as a button */
export class Square extends View {
  static elementTag = core.defineElement(this, "test-project")

  // - its "mark" is text
  static { this.declareProp("mark", { type: "text" }) }
  get mark() { return this.getProp("mark") }
  set mark(value) { this.setProp("mark", value) }

  get isEmpty() {
    return this.mark === ""
  }

  /** a click plays it */
  draw() {
    return h("button", { part: "mark", onClick: () => this.play(), style: "cursor:pointer;user-select:none" },
      () => this.mark
    )
  }

  //////////////////////
  // ## Playing a square
  //////////////////////
  /**
   * Nothing happens if someone has won, or the square is taken.
   * Otherwise:  the mark goes in, the game checks for a winner, and the turn passes to the other player.
   */
  play() {
    if (ticTacToe.winner !== "" || !this.isEmpty) return
    this.mark = ticTacToe.turn
    ticTacToe.checkForAWinner()
    ticTacToe.turn = ticTacToe.turn === "X" ? "O" : "X"
  }

  get board() {
    return Board.ownerOf(this)
  }
}

/** the board:  nine squares, three a row -- how they look is in styles.css, the other file in this guide */
export class Board extends ViewableList {
  static instanceType = Square
  static elementTag = core.defineElement(this, "test-project")

  static exclusive = true
}

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

  /** who won:  X or O, or "" while the game goes on */
  // - its "winner" is text
  static { this.declareProp("winner", { type: "text" }) }
  get winner() { return this.getProp("winner") }
  set winner(value) { this.setProp("winner", value) }

  get message() {
    if (this.winner === "") return `${this.turn} to play`
    return `${this.winner} wins!`
  }

  /** nine empty squares, made with the game */
  create() {
    core.map(core.countTo(9), () => this.board.append(new Square()))
  }

  /** an empty board, X to play */
  startANewGame() {
    this.board.forEach((square) => (square.mark = ""))
    this.turn = "X"
    this.winner = ""
  }

  /**
   * the same mark in all three squares wins
   * - squares are counted 1 to 9, left to right, then down:  1 2 3 is the top row
   */
  checkTheLineFromSquareAThroughBToC(a, b, c) {
    const mark = this.board.getItem(position(a))?.mark
    if (mark === "") return
    if (this.board.getItem(position(b))?.mark === mark && this.board.getItem(position(c))?.mark === mark) this.winner = mark
  }

  /** only the three rows, for now */
  checkForAWinner() {
    this.checkTheLineFromSquareAThroughBToC(1, 2, 3)
    this.checkTheLineFromSquareAThroughBToC(4, 5, 6)
    this.checkTheLineFromSquareAThroughBToC(7, 8, 9)
  }

  draw() {
    return h("div", { class: "TicTacToe" },
      h("h2", () => this.message),
      () => core.drawThing(this.board)
    )
  }
}
export const ticTacToe = new TicTacToe()

core.heading("Start")
//## Start
ticTacToe.startANewGame()
if (!core.isCarryingOver) ticTacToe.start()

core.heading("A check:  X wins across the top")
/////////////////////////////////////
// ## A check:  X wins across the top
/////////////////////////////////////
/** It plays a whole game, X in squares 1, 2 and 3, then clears the board for you. */
export function testARow() {
  return core.test("test a row", function testARow() {
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
    core.expect(ticTacToe.message, `the message of tic tac toe`, "X wins!", `"X wins!"`)
    core.echoTestAction(`start a new game`)
    ticTacToe.startANewGame()
  })
}

core.heading("Try it")
////////////
// ## Try it
////////////
// - Play a game on the right.  Win across the top, and the line above the board says so.
// - Click ↻, above the game, for a fresh board.
//   Now win DOWN the left side:  squares 1, 4 and 7.  Nothing happens.
//
// Your move:  teach it to win down.  Under "to check for a winner", add three lines like the others:
//     check the line from square 1 through 4 to 7
//     check the line from square 2 through 5 to 8
//     check the line from square 3 through 6 to 9
// Then the two corner-to-corner lines:  which squares are they?
//
// Where next:  Tic-Tac-Toe, in the Examples, which has every line, a draw when the board fills up,
// and a New game button.
// -----------
core.installStyles(undefined, `/* File styles.css:  how the game looks.¬   - The board, <how-tic-tac-toe-works-board>, lays its nine squares out three a row.¬   - Each square, <how-tic-tac-toe-works-square>, is a big button:  its part, ::part(mark). */¬¬.TicTacToe {¬  max-width: 20em;¬  margin-inline: auto;¬  padding-block: 1.5em;¬  text-align: center;¬}¬¬how-tic-tac-toe-works-board {¬  display: grid;¬  grid-template-columns: repeat(3, 1fr);¬  gap: 0.4em;¬}¬¬how-tic-tac-toe-works-square::part(mark) {¬  width: 100%;¬  aspect-ratio: 1;¬  border: none;¬  border-radius: 0.5em;¬  background: rgb(127 127 127 / 0.12);¬  color: inherit;¬  font: inherit;¬  font-size: 3em;¬  font-weight: bold;¬  cursor: pointer;¬}¬`)
// -----------
if (!core.isCarryingOver) testARow()
