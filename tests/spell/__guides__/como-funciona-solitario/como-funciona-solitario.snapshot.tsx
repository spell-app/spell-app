import { core, Thing, List, App, Drawable, DrawableList, prop, drawn, positionOf, spellPosition } from "@spell/core"
import { E, SpellElement } from "@spell/elements"

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
export type Rango = (typeof Carta.Rangos)[number]
export type Palo = (typeof Carta.Palos)[number]

/** "uno de" enumera cada valor que puede tener una propiedad:  "2 ... 10" son todos los números entre ellos */
export class Carta extends Drawable {
  static elementTag = core.defineElement(this, "test-project")

  // su "rango" es uno de as, 2 ... 10, jota, dama, rey
  static Rangos = ["as", 2, 3, 4, 5, 6, 7, 8, 9, 10, "jota", "dama", "rey"] as const
  @prop({ oneOf: () => Carta.Rangos })
  accessor rango!: Rango

  // su "palo" es uno de tréboles, diamantes, corazones o espadas
  static Palos = ["tréboles", "diamantes", "corazones", "espadas"] as const
  @prop({ oneOf: () => Carta.Palos })
  accessor palo!: Palo

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
  @drawn draw() {
    return (
      <es-boton basico={true} color={this.color} onClick={() => this.jugar()} style="cursor:pointer;user-select:none">
        {this.nombre}
      </es-boton>
    )
  }

  /** a la columna, si la toma;  el mensaje dice qué pasó */
  jugar() {
    if (core.canTake(mesa.columna, this)) {
      mesa.columna.append(this)
      mesa.mensaje = `La ${this.nombre} va encima.`
    } else mesa.mensaje = `La columna no toma la ${this.nombre}.`
  }

  get pila() {
    return Pila.ownerOf(this)!
  }
}

/**
 * `<test-project-carta>`:  a carta, drawn in its own element, e.g. by `draw the carta`.
 * - The page defines its tag with this class:  `core.useElement()`, below.
 * - Its attributes are its carta's properties;  its methods call its carta's.
 * - What every drawable thing's element does, e.g. drawing its carta, is `SpellElement`'s.
 */
export class CartaElement extends SpellElement<Carta> {
  @E.proto static vocabulary = SpellElement.vocabularyFor("test-project-carta", "carta", [
    { name: "rango", kind: "string", description: "Its rango." },
    { name: "palo", kind: "string", description: "Its palo." }
  ])

  jugar() {
    return this.currentThing?.jugar()
  }
}
core.useElement(Carta, CartaElement)

core.heading("Una pila, y una columna")
/** Una pila, y una columna */
export class Pila extends DrawableList<Carta> {
  static instanceType = Carta
  static elementTag = core.defineElement(this, "test-project")

  static exclusive = true
}

/**
 * `<test-project-pila>`:  a pila, drawn in its own element, e.g. by `draw the pila`.
 * - The page defines its tag with this class:  `core.useElement()`, below.
 * - Its attributes are its pila's properties;  its methods call its pila's.
 * - What every drawable thing's element does, e.g. drawing its pila, is `SpellElement`'s.
 */
export class PilaElement extends SpellElement<Pila> {
  @E.proto static vocabulary = SpellElement.vocabularyFor("test-project-pila", "pila", [])
}
core.useElement(Pila, PilaElement)
/** una carta está en una sola pila a la vez:  ponerla en otra la quita de esta */

/**
 * La regla que lo hace Solitario:  una columna toma una carta uno menos que su última, del otro color.
 * - "puede tomar una carta si" es una pregunta de sí o no que la pila contesta para cada carta
 * - "devolver" da la respuesta
 */
export class Columna extends Pila {
  static elementTag = core.defineElement(this, "test-project")

  canTake(carta: Carta) {
    if (this.isEmpty) return carta.rango === "rey"
    return this.lastItem!.color !== carta.color && this.lastItem!.valor === carta.valor + 1
  }
}

/**
 * `<test-project-columna>`:  a columna, drawn in its own element, e.g. by `draw the columna`.
 * - The page defines its tag with this class:  `core.useElement()`, below.
 * - Its attributes are its columna's properties;  its methods call its columna's.
 * - What every drawable thing's element does, e.g. drawing its columna, is `SpellElement`'s.
 */
export class ColumnaElement extends SpellElement<Columna> {
  @E.proto static vocabulary = SpellElement.vocabularyFor("test-project-columna", "columna", [])

  canTake(carta: Carta) {
    return this.currentThing?.canTake(carta)
  }
}
core.useElement(Columna, ColumnaElement)

core.heading("La mesa:  una columna, y una mano de cartas para probar en ella")
/** La mesa:  una columna, y una mano de cartas para probar en ella */
export class Mesa extends App {
  // su "columna" es una nueva columna
  @prop({ init: () => new Columna(), early: true })
  accessor columna!: Columna

  // su "mano" es una nueva pila
  @prop({ init: () => new Pila(), early: true })
  accessor mano!: Pila

  // su "mensaje" es texto
  @prop({ type: "text" })
  accessor mensaje!: string

  @drawn draw() {
    return (
      <div class="Mesa">
        <h3>La columna</h3>
        {core.drawThing(this.columna)}
        <h3>Tu mano: haz clic en una carta para ponerla en la columna</h3>
        {core.drawThing(this.mano)}
        <p>{this.mensaje}</p>
      </div>
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

// each drawable type's tag, for the JSX
declare module "@solidjs/web/types/jsx.js" {
  namespace JSX {
    interface IntrinsicElements {
      /** `CartaElement` */
      "test-project-carta": HTMLAttributes<HTMLElement> & { [attribute: string]: unknown }
      /** `PilaElement` */
      "test-project-pila": HTMLAttributes<HTMLElement> & { [attribute: string]: unknown }
      /** `ColumnaElement` */
      "test-project-columna": HTMLAttributes<HTMLElement> & { [attribute: string]: unknown }
    }
  }
}
