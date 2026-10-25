import { core, App, View, ViewableList, h, positionOf, spellPosition } from "@spell/core"

core.heading("Cómo funciona Solitario")
/////////////////////////////
// ## Cómo funciona Solitario
/////////////////////////////
// El ejemplo Solitario es el Klondike, el juego de cartas que venía en todas las computadoras:
// siete columnas de cartas, armadas del rey al as, rojo y negro alternados.
// Está escrito en español:  cada línea de código también.
// Es el ejemplo más grande, pero está hecho de piezas pequeñas:
// - una CARTA, que sabe su rango y su palo, y de ahí su color y su valor
// - PILAS de cartas, cada tipo con sus propias reglas sobre qué carta toma
//
// Esta guía tiene un tipo de carta y una regla:  una columna con un rey, y cuatro cartas para probar.
// Abre Solitario, en los Ejemplos, para jugar el juego entero.  Solitaire es el mismo juego, en inglés.

core.heading("Una carta")
///////////////
// ## Una carta
///////////////
/** "uno de" enumera cada valor que puede tener una propiedad:  "2 ... 10" son todos los números entre ellos */
export class Carta extends View {
  static elementTag = core.defineElement(this, "test-project")

  // su "rango" es uno de as, 2 ... 10, jota, dama, rey
  static Rangos = ["as", 2, 3, 4, 5, 6, 7, 8, 9, 10, "jota", "dama", "rey"]
  static { this.declareProp("rango", { oneOf: Carta.Rangos }) }
  get rango() { return this.getProp("rango") }
  set rango(value) { this.setProp("rango", value) }

  // su "palo" es uno de tréboles, diamantes, corazones o espadas
  static Palos = ["tréboles", "diamantes", "corazones", "espadas"]
  static { this.declareProp("palo", { oneOf: Carta.Palos }) }
  get palo() { return this.getProp("palo") }
  set palo(value) { this.setProp("palo", value) }

  /** el as es 1, el 2 es 2 ... el rey es 13:  su lugar en la lista de rangos */
  get valor() {
    return spellPosition(positionOf(Carta.Rangos, this.rango))
  }

  get color() {
    if (core.includes(["diamantes", "corazones"], this.palo)) return "rojo"
    return "negro"
  }

  /** p. ej. "dama de corazones" */
  get nombre() {
    return `${this.rango} de ${this.palo}`
  }

  // un clic la juega en la columna
  draw() {
    return h("es-boton", {
      apariencia: "básico",
      color: () => this.color,
      onClick: () => this.jugar(),
      style: "cursor:pointer;user-select:none"
    }, () => this.nombre)
  }

  /** a la columna, si la toma;  el mensaje dice qué pasó */
  jugar() {
    if (core.canTake(mesa.columna, this)) {
      mesa.columna.append(this)
      mesa.mensaje = `La ${this.nombre} va encima.`
    } else mesa.mensaje = `La columna no toma la ${this.nombre}.`
  }

  get pila() {
    return Pila.ownerOf(this)
  }
}

core.heading("Una pila, y una columna")
/** Una pila, y una columna */
export class Pila extends ViewableList {
  static instanceType = Carta
  static elementTag = core.defineElement(this, "test-project")

  static exclusive = true
}
/** una carta está en una sola pila a la vez:  ponerla en otra la quita de esta */

/**
 * La regla que lo hace Solitario:  una columna toma una carta uno menos que su última, del otro color.
 * - "puede tomar una carta si" es una pregunta de sí o no que la pila contesta para cada carta
 * - "devolver" da la respuesta
 */
export class Columna extends Pila {
  static elementTag = core.defineElement(this, "test-project")

  canTake(carta) {
    if (this.isEmpty) return carta.rango === "rey"
    return this.lastItem.color !== carta.color && this.lastItem.valor === carta.valor + 1
  }
}

core.heading("La mesa:  una columna, y una mano de cartas para probar en ella")
/** La mesa:  una columna, y una mano de cartas para probar en ella */
export class Mesa extends App {
  static elementTag = core.defineElement(this, "test-project", "App")

  // su "columna" es una nueva columna
  static { this.declareProp("columna", { init: () => new Columna(), early: true }) }
  get columna() { return this.getProp("columna") }
  set columna(value) { this.setProp("columna", value) }

  // su "mano" es una nueva pila
  static { this.declareProp("mano", { init: () => new Pila(), early: true }) }
  get mano() { return this.getProp("mano") }
  set mano(value) { this.setProp("mano", value) }

  // su "mensaje" es texto
  static { this.declareProp("mensaje", { type: "text" }) }
  get mensaje() { return this.getProp("mensaje") }
  set mensaje(value) { this.setProp("mensaje", value) }

  draw() {
    return h("div", { class: "Mesa" },
      h("h3", "La columna"),
      () => core.drawThing(this.columna),
      h("h3", "Tu mano: haz clic en una carta para ponerla en la columna"),
      () => core.drawThing(this.mano),
      h("p", () => this.mensaje)
    )
  }
}
export const mesa = new Mesa()

core.heading("Inicio:  un rey de espadas en la columna")
//## Inicio:  un rey de espadas en la columna
mesa.columna.append(new Carta({ rango: "rey", palo: "espadas" }))
mesa.mano.append(new Carta({ rango: "dama", palo: "espadas" }))
mesa.mano.append(new Carta({ rango: "dama", palo: "corazones" }))
mesa.mano.append(new Carta({ rango: "jota", palo: "tréboles" }))
mesa.mano.append(new Carta({ rango: 10, palo: "diamantes" }))
if (!core.isCarryingOver) mesa.start()

core.heading("Una prueba:  la regla, carta por carta")
/** Una prueba:  la regla, carta por carta */
export function testLaColumna() {
  return core.test("test la columna", function testLaColumna() {
    core.echoTestAction(`poner la pila nueva a una nueva columna`)
    const pilaNueva = new Columna()
    core.echoTestAction(`poner la dama a una nueva carta con rango = dama, palo = corazones`)
    const dama = new Carta({ rango: "dama", palo: "corazones" })
    core.expect(core.canTake(pilaNueva, dama), `la pila nueva puede tomar la dama`, false, `no`)
    core.echoTestAction(`agregar (una nueva carta con rango = rey, palo = espadas) a la pila nueva`)
    pilaNueva.append(new Carta({ rango: "rey", palo: "espadas" }))
    core.expect(core.canTake(pilaNueva, dama), `la pila nueva puede tomar la dama`, true, `sí`)
  })
}

core.heading("Pruébalo")
//////////////
// ## Pruébalo
//////////////
// - Haz clic en la dama de espadas, a la derecha:  la columna no la toma, porque es negra, como el rey.
// - Haz clic en la dama de corazones, luego la jota de tréboles, luego el 10 de diamantes:
//   cada una va encima.
// - Cambia la regla:  en "una columna es una pila donde", quita
//   "el color de su última carta no es el color de la carta y".
//   Ahora la dama de espadas también va encima.
//   (Haz clic en ↻, sobre la mesa, para repartir la mano otra vez.)
//
// Y después:  Solitario, en los Ejemplos, donde la reserva, los descartes y las cuatro fundaciones
// tienen sus propias reglas, escritas igual.
// -----------
core.installStyles(undefined, `/* File styles.css:  how the table looks -- the column, then the hand, each a row of cards. */¬¬.Mesa {¬  max-width: 34em;¬  margin-inline: auto;¬  padding-block: 1.5em;¬}¬¬como-funciona-solitario-columna,¬como-funciona-solitario-pila {¬  display: flex;¬  flex-wrap: wrap;¬  gap: 0.5em;¬  min-height: 2.5em;¬}¬`)
// -----------
if (!core.isCarryingOver) testLaColumna()
