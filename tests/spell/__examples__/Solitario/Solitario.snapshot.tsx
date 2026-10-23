import { Show } from "solid-js"
import { core, Thing, List, App, Drawable, DrawableList, prop, derived, thing, drawn, positionOf, spellPosition, trigger, css, position, on } from "@spell/core"
import { E, SpellElement } from "@spell/elements"

core.heading("Una carta de la baraja -- en el estilo de esquema:  su nombre, luego lo que es cierto de ella")
///////////////////////////////////////////////////////////////////////////////////////////////////
// ## Una carta de la baraja -- en el estilo de esquema:  su nombre, luego lo que es cierto de ella
///////////////////////////////////////////////////////////////////////////////////////////////////
export type Dirección = (typeof Carta.Direcciones)[number]

/**
 * La carta dice cuáles son sus palos, rangos y colores:  un mazo, una pila o un juego solo los leen.
 * Una cosa dibujable:  cada carta es un elemento propio en la página, p. ej. `<solitario-carta>`.
 */
export class Carta extends Drawable {
  static elementTag = core.defineElement(this, "test-project")

  /** su palo y su rango */
  // su "palo" es un palo
  @prop({ oneOf: () => Carta.Palos })
  accessor palo!: (typeof Carta.Palos)[number]

  // su "rango" es un rango
  @prop({ oneOf: () => Carta.Rangos })
  accessor rango!: (typeof Carta.Rangos)[number]

  get color() {
    return Palo.color(this.palo)
  }

  /** as 1 ... rey 13 */
  get valor() {
    return spellPosition(positionOf(Carta.Rangos, this.rango))
  }

  /** p. ej. "la carta es una espada" */
  esUnPalo(palo: (typeof Carta.Palos)[number]) {
    return this.palo === palo
  }

  /** p. ej. "la carta es una dama" */
  esUnRango(rango: (typeof Carta.Rangos)[number]) {
    return this.rango === rango
  }

  /** p. ej. "la carta es la dama de espadas" */
  esElRangoDePalos(rango: (typeof Carta.Rangos)[number], palo: (typeof Carta.Palos)[number]) {
    return this.rango === rango && this.palo === palo
  }

  get esUnaFigura() {
    return Rango.esUnaFigura(this.rango)
  }

  esElComodínColor(color: Color) {
    return this instanceof Comodín && this.color == color
  }

  /** su dirección:  boca arriba o boca abajo */
  // su "dirección" es arriba o abajo
  static Direcciones = ["arriba", "abajo"] as const
  @prop({ oneOf: () => Carta.Direcciones })
  accessor dirección!: Dirección

  get estáBocaArriba() {
    return this.dirección == "arriba"
  }

  get estáBocaAbajo() {
    return this.dirección == "abajo"
  }

  /** sus nombres */
  // p. ej. "dama-de-espadas"
  get nombre() {
    return `${this.rango}-de-${this.palo}`
  }

  get paloCorto() {
    return Palo.símbolo(this.palo)
  }

  get rangoCorto() {
    if (this.rango === undefined) return "?"
    if (typeof this.rango === "number") return `${this.rango}`
    return `${core.getItemAt(this.rango, 0) ?? ""}`.toLocaleUpperCase()
  }

  get direcciónCorta() {
    if (this.dirección == "arriba") return "+"
    return "—"
  }

  get nombreCorto() {
    return this.rangoCorto + this.paloCorto
  }

  get estado() {
    return this.rangoCorto + this.paloCorto + this.direcciónCorta
  }

  //////////////////////////////////////////////////////
  // ## su imagen:  un carácter de los naipes de unicode
  //////////////////////////////////////////////////////
  /**
   * MIRA:  https://www.compart.com/en/unicode/block/U+1F0A0
   * El bloque es una cuadrícula:  una fila por palo, y en cada fila, una columna por rango.
   * - Las filas empiezan en 1F0A0 (espadas), 1F0B0 (corazones), 1F0C0 (diamantes) y 1F0D0 (tréboles).
   * - Las columnas van as 1, 2 ... 10, jota B, luego un caballo que nuestro mazo no tiene, C, luego dama D y rey E.
   */
  get columnaDeImagen() {
    // pasado el caballo
    if (this.esUnRango("dama") || this.esUnRango("rey")) return this.valor + 1
    return this.valor
  }

  get imagen() {
    if (this.esUnPalo("espadas")) return core.unicode(0x1F0A0 + this.columnaDeImagen)
    if (this.esUnPalo("corazones")) return core.unicode(0x1F0B0 + this.columnaDeImagen)
    if (this.esUnPalo("diamantes")) return core.unicode(0x1F0C0 + this.columnaDeImagen)
    return core.unicode(0x1F0D0 + this.columnaDeImagen)
  }

  ///////////////////////////////////////////////////////////////////////////////////////////
  // ## dibujarla:  su imagen boca arriba, boca abajo el dorso que comparten todas las cartas
  ///////////////////////////////////////////////////////////////////////////////////////////
  // con el texto de Spell UI en español, `<es-texto>`:  toma su color tal cual, `rojo` o `negro`
  @drawn draw() {
    const click = () => trigger("clic-carta", { carta: this })
    return (
      <Show
        when={this.estáBocaAbajo}
        fallback={<es-texto class="Card" tamano="gigante" prop:color={this.color} onClick={click}>{this.imagen}</es-texto>}
      >
        <es-texto class="Card" tamano="gigante" color="azul" onClick={click}>{"🂠"}</es-texto>
      </Show>
    )
  }

  ///////////////
  // ## voltearla
  ///////////////
  /** cada una se detiene un momento, así `esperar a: voltear la carta boca arriba` se anima */
  async voltearBocaArriba() {
    this.dirección = "arriba"
    await core.pauseFor(50, "msec")
  }

  async voltearBocaAbajo() {
    this.dirección = "abajo"
    await core.pauseFor(50, "msec")
  }

  async voltear() {
    if (this.estáBocaArriba) this.voltearBocaAbajo()
    else this.voltearBocaArriba()
    await core.pauseFor(50, "msec")
  }

  ////////////////////////////////////////
  // ## Jugar una carta:  qué hace un clic
  ////////////////////////////////////////
  /** la carta, y cada carta sobre ella, a la primera pila que pueda tomarla;  dice si se movió */
  async jugar() {
    const pilaInicial = this.pila
    if (!core.canGiveUp(pilaInicial, this)) return false

    if (pilaInicial === solitario.reserva) {
      solitario.robarDeLaReserva()
      return
    }

    const pilaFinal = core.filter(core.everyThing(Pila), (pila: Pila) => core.canTake(pila, this)).firstItem
    if (pilaFinal === undefined) return false

    const cartasMovidas = pilaInicial.startingWith(this)
    cartasMovidas.name = pilaInicial.name
    core.console.log(`moviendo (${cartasMovidas.estado}) a (${pilaFinal.estado})`)

    cartasMovidas.forEach((carta) => core.move(carta, pilaFinal))

    if (pilaInicial instanceof Columna && !pilaInicial.isEmpty) {
      await core.pauseFor(200, "msec")
      const it = pilaInicial.lastItem
      core.console.log(`volteando (${pilaInicial.name}: ${it?.estado})`)
      it?.voltearBocaArriba()
    }

    if (pilaFinal instanceof Fundación) solitario.puntuación = solitario.puntuación + 10
    else if (pilaInicial === solitario.descartes) solitario.puntuación = solitario.puntuación + 5
    return true
  }

  // "palos" como uno de tréboles, diamantes, corazones o espadas
  static Palos = ["tréboles", "diamantes", "corazones", "espadas"] as const

  // "rangos" como uno de as, 2 ... 10, jota, dama o rey
  static Rangos = ["as", 2, 3, 4, 5, 6, 7, 8, 9, 10, "jota", "dama", "rey"] as const

  // "colores" como uno de rojo o negro
  static Colores = ["rojo", "negro"] as const

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
    { name: "palo", kind: "string", description: "Its palo." },
    { name: "rango", kind: "string", description: "Its rango." },
    { name: "dirección", kind: "string", description: "Its dirección." }
  ])

  esUnPalo(palo: (typeof Carta.Palos)[number]) {
    return this.currentThing?.esUnPalo(palo)
  }

  esUnRango(rango: (typeof Carta.Rangos)[number]) {
    return this.currentThing?.esUnRango(rango)
  }

  esElRangoDePalos(rango: (typeof Carta.Rangos)[number], palo: (typeof Carta.Palos)[number]) {
    return this.currentThing?.esElRangoDePalos(rango, palo)
  }

  esElComodínColor(color: Color) {
    return this.currentThing?.esElComodínColor(color)
  }

  voltearBocaArriba() {
    return this.currentThing?.voltearBocaArriba()
  }

  voltearBocaAbajo() {
    return this.currentThing?.voltearBocaAbajo()
  }

  voltear() {
    return this.currentThing?.voltear()
  }

  jugar() {
    return this.currentThing?.jugar()
  }
}
core.useElement(Carta, CartaElement)

/** Un comodín:  una carta salvaje sin rango ni palo -- hay uno rojo y uno negro */
export class Comodín extends Carta {
  static elementTag = core.defineElement(this, "test-project")

  /** se pone al hacerlo:  no tiene palo del que sacar su color */
  // su "color" es un color
  static { this.declareProp("color", { oneOf: () => Carta.Colores }) }
  get color(): (typeof Carta.Colores)[number] { return this.getProp("color") as (typeof Carta.Colores)[number] }
  set color(value: (typeof Carta.Colores)[number]) { this.setProp("color", value) }

  /** p. ej. "comodín-rojo" */
  get nombre() {
    return `comodín-${this.color}`
  }

  get nombreCorto() {
    return "🃏"
  }

  get estado() {
    return this.nombreCorto + this.direcciónCorta
  }

  get imagen() {
    if (this.color == "rojo") return "🂿"
    return "🃏"
  }
}

/**
 * `<test-project-comodin>`:  a comodín, drawn in its own element, e.g. by `draw the comodín`.
 * - The page defines its tag with this class:  `core.useElement()`, below.
 * - Its attributes are its comodín's properties;  its methods call its comodín's.
 * - What every drawable thing's element does, e.g. drawing its comodín, is `SpellElement`'s.
 */
export class ComodínElement extends SpellElement<Comodín> {
  @E.proto static vocabulary = SpellElement.vocabularyFor("test-project-comodin", "comodín", [
    { name: "color", kind: "string", description: "Its color." }
  ])
}
core.useElement(Comodín, ComodínElement)

/** palos, rangos y colores:  los tipos de valores propios de la carta */
export class Palo {
  static color(palo: (typeof Carta.Palos)[number]) {
    if (core.includes(["diamantes", "corazones"], palo)) return "rojo"
    return "negro"
  }

  static símbolo(palo: (typeof Carta.Palos)[number]) {
    if (palo == "tréboles") return "♣️"
    if (palo == "diamantes") return "♦️"
    if (palo == "corazones") return "♥️"
    if (palo == "espadas") return "♠️"
    return "?"
  }
}
export class Rango {
  static esUnaFigura(rango: (typeof Carta.Rangos)[number]) {
    return core.includes(["jota", "dama", "rey"], rango)
  }
}
export class Color {}

core.heading("Pruebas")
/** Pruebas */
export function testLaPreparaciónDeLaCarta() {
  return core.test("test la preparación de la carta", function testLaPreparaciónDeLaCarta() {
    core.echoTestAction(`obtener una nueva carta cuyo rango es dama, palo es espadas y dirección es arriba`)
    const it = new Carta({
      rango: "dama",
      palo: "espadas",
      dirección: "arriba"
    })
    core.echo(it)
    core.expect(it.rango, `su rango`, "dama", `dama`)
    core.expect(it.palo, `su palo`, "espadas", `espadas`)
    core.expect(it.nombre, `su nombre`, "dama-de-espadas", `"dama-de-espadas"`)
    core.expect(it.color, `su color`, "negro", `negro`)
    core.expect(it.valor, `su valor`, 12, `12`)
    core.expect(it.paloCorto, `su palo corto`, "♠️", `"♠️"`)
    core.expect(it.rangoCorto, `su rango corto`, "D", `"D"`)
    core.expect(it.nombreCorto, `su nombre corto`, "D♠️", `"D♠️"`)
    core.expect(it.estado, `su estado`, "D♠️+", `"D♠️+"`)
    core.expect(it.imagen, `su imagen`, "🂭", `"🂭"`)

    core.expect(it.estáBocaArriba, `está boca arriba`, true, `sí`)
    core.expect(it.estáBocaAbajo, `está boca abajo`, false, `no`)

    core.expect(it.esUnaFigura, `es una figura`, true, `sí`)
    core.expect(!it.esUnaFigura, `no es una figura`, false, `no`)

    core.expect(it.esUnPalo("espadas"), `es una espada`, true, `sí`)
    core.expect(it.esUnPalo("tréboles"), `es un trébol`, false, `no`)

    core.expect(it.esUnRango("dama"), `es una dama`, true, `sí`)
    core.expect(it.esUnRango("as"), `es un as`, false, `no`)
    core.expect(it.esUnRango(2), `es un 2`, false, `no`)

    core.expect(it.esElRangoDePalos("dama", "espadas"), `es la dama de espadas`, true, `sí`)
    core.expect(it.esElRangoDePalos("dama", "tréboles"), `es la dama de tréboles`, false, `no`)
    core.expect(!it.esElRangoDePalos(2, "diamantes"), `no es el 2 de diamantes`, true, `sí`)

    core.echoTestAction(`voltear eso boca abajo`)
    it.voltearBocaAbajo()
    core.expect(it.dirección, `su dirección`, "abajo", `abajo`)
    core.expect(it.estáBocaAbajo, `está boca abajo`, true, `sí`)

    core.echoTestAction(`voltear eso`)
    it.voltear()
    core.expect(it.estáBocaArriba, `está boca arriba`, true, `sí`)

    /** una carta de número:  su rango tal cual, y su imagen en la fila de su palo */
    const siete = new Carta({
      rango: 7,
      palo: "corazones",
      dirección: "arriba"
    })
    core.expect(siete.nombreCorto, `el nombre corto del siete`, "7♥️", `"7♥️"`)
    core.expect(siete.color, `el color del siete`, "rojo", `rojo`)
    core.expect(siete.imagen, `la imagen del siete`, "🂷", `"🂷"`)
    core.expect((new Carta({ rango: "as", palo: "tréboles" })).imagen, `la imagen de una nueva carta cuyo rango es as y palo es tréboles`, "🃑", `"🃑"`)
    core.expect((new Carta({ rango: "rey", palo: "diamantes" })).imagen, `la imagen de una nueva carta cuyo rango es rey y palo es diamantes`, "🃎", `"🃎"`)
  })
}

export function testLosComodines() {
  return core.test("test los comodines", function testLosComodines() {
    core.echoTestAction(`obtener un nuevo comodín cuyo color es rojo y dirección es arriba`)
    const it = new Comodín({ color: "rojo", dirección: "arriba" })
    core.echo(it)
    core.expect(it instanceof Comodín, `es un comodín`, true, `sí`)
    core.expect(it instanceof Carta, `es una carta`, true, `sí`)
    core.expect(it.color, `su color`, "rojo", `rojo`)
    core.expect(it.nombre, `su nombre`, "comodín-rojo", `"comodín-rojo"`)
    core.expect(it.nombreCorto, `su nombre corto`, "🃏", `"🃏"`)
    core.expect(it.imagen, `su imagen`, "🂿", `"🂿"`)
    core.expect(it.esElComodínColor("rojo"), `es el comodín rojo`, true, `sí`)
    core.expect(it.esElComodínColor("negro"), `es el comodín negro`, false, `no`)
    core.expect(!it.esElComodínColor("negro"), `no es el comodín negro`, true, `sí`)

    core.expect(it.estáBocaArriba, `está boca arriba`, true, `sí`)
    core.echoTestAction(`voltear eso`)
    it.voltear()
    core.expect(it.estáBocaAbajo, `está boca abajo`, true, `sí`)

    core.echoTestAction(`poner comodín negro a un nuevo comodín cuyo color es negro`)
    const comodínNegro = new Comodín({ color: "negro" })
    core.expect(comodínNegro.imagen, `la imagen de comodín negro`, "🃏", `"🃏"`)

    core.echoTestAction(`poner la carta a una nueva carta cuyo rango es dama y palo es espadas`)
    const carta = new Carta({ rango: "dama", palo: "espadas" })
    core.expect(carta instanceof Comodín, `la carta es un comodín`, false, `no`)
    core.expect(!(carta instanceof Comodín), `la carta no es un comodín`, true, `sí`)
    core.expect(carta.esElComodínColor("rojo"), `la carta es el comodín rojo`, false, `no`)
  })
}
// -----------
core.heading("Un mazo:  las 52 cartas de una baraja estándar de EE. UU., el as de tréboles primero -- y sus dos comodines, si los pides")
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ## Un mazo:  las 52 cartas de una baraja estándar de EE. UU., el as de tréboles primero -- y sus dos comodines, si los pides
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/** Lee los palos y rangos propios de la carta:  `palos de carta`, `rangos de carta`. */
@thing
export class Mazo extends List<Carta> {
  static instanceType = Carta

  /** sin comodines, a menos que se haga `con comodines` */
  // su "comodines" es sí o no
  @prop({ type: "choice" })
  accessor comodines!: boolean

  /** un mazo nuevo tiene una carta de cada, el as de tréboles primero, luego sus dos comodines, el rojo y luego el negro */
  create() {
    Carta.Rangos.forEach((rango) => Carta.Palos.forEach((palo) => {
      // `el mazo`, no `eso`:  en un `para cada`, `eso` es el elemento del bucle, aquí el palo
      this.append(new Carta({ rango: rango, palo: palo }))
    }))
    if (this.comodines) {
      this.append(new Comodín({ color: "rojo" }))
      this.append(new Comodín({ color: "negro" }))
    }
  }

  /** muestra los nombres cortos de sus cartas, de arriba abajo */
  mostrar() {
    const nombresCortos = new List<string>({ instanceType: "text" })
    this.forEach((carta) => nombresCortos.append(carta.nombreCorto))
    core.echo(`mazo: ${nombresCortos}`)
  }
}

core.heading("Pruebas")
/** Pruebas */
export function testLaCreaciónDelMazo() {
  return core.test("test la creación del mazo", function testLaCreaciónDelMazo() {
    core.echoTestAction(`el mazo es un nuevo mazo`)
    const mazo = new Mazo()
    core.expect(mazo.length, `el número de cartas en el mazo`, 52, `52`)
    core.echoTestAction(`poner las damas a las cartas en el mazo donde el rango de la carta es dama`)
    const damas = mazo.filter((carta) => carta.rango == "dama")
    core.expect(damas.length, `el número de cartas en las damas`, 4, `4`)
    core.expect(mazo.firstItem?.nombre!, `el nombre de la carta de arriba del mazo`, "as-de-tréboles", `"as-de-tréboles"`)
    core.expect(mazo.lastItem?.nombre!, `el nombre de la carta de abajo del mazo`, "rey-de-espadas", `"rey-de-espadas"`)
    core.expect(mazo.firstItem?.nombreCorto!, `el nombre corto de la carta de arriba del mazo`, "A♣️", `"A♣️"`)
    core.expect(mazo.firstItem?.esElRangoDePalos("as", "tréboles")!, `la primera carta del mazo es el as de tréboles`, true, `sí`)

    core.echo("el mazo antes de barajar:")
    core.echoTestAction(`mostrar el mazo`)
    mazo.mostrar()
    core.echoTestAction(`barajar el mazo`)
    mazo.randomize()
    core.expect(mazo.length, `el número de cartas en el mazo`, 52, `52`)
    core.echo("el mazo después de barajar:")
    core.echoTestAction(`mostrar el mazo`)
    mazo.mostrar()
  })
}

export function testElMazoConComodines() {
  return core.test("test el mazo con comodines", function testElMazoConComodines() {
    core.echoTestAction(`el mazo es un nuevo mazo con comodines`)
    const mazo = new Mazo({ comodines: true })
    core.expect(mazo.length, `el número de cartas en el mazo`, 54, `54`)
    core.echoTestAction(`poner las cartas salvajes a las cartas en el mazo donde es un comodín`)
    const cartasSalvajes = mazo.filter((carta) => carta instanceof Comodín)
    core.expect(cartasSalvajes.length, `el número de cartas en las cartas salvajes`, 2, `2`)
    core.expect(mazo.firstItem?.esElRangoDePalos("as", "tréboles")!, `la primera carta del mazo es el as de tréboles`, true, `sí`)
    // el comodín rojo, luego el negro, al final
    core.expect(mazo.lastItem?.esElComodínColor("negro")!, `la última carta del mazo es el comodín negro`, true, `sí`)
    core.expect(mazo.lastItem?.nombre!, `el nombre de la carta de abajo del mazo`, "comodín-negro", `"comodín-negro"`)
  })
}
// -----------
core.heading("Una pila de cartas, p. ej. el mazo de reserva de un juego o sus descartes")
///////////////////////////////////////////////////////////////////////////////
// ## Una pila de cartas, p. ej. el mazo de reserva de un juego o sus descartes
///////////////////////////////////////////////////////////////////////////////
/**
 * El juego que usa estas cartas nombra sus pilas, y dice qué toma cada tipo de pila.
 * Una lista dibujable:  su elemento contiene los elementos de sus cartas, p. ej. `<solitario-pila>` alrededor de `<solitario-carta>`s.
 */
export class Pila extends DrawableList<Carta> {
  static instanceType = Carta
  static elementTag = core.defineElement(this, "test-project")

  /** cómo la llama el juego, p. ej. "reserva" */
  // su "nombre" es texto
  @prop({ type: "text" })
  accessor name!: string

  /** el color y el valor de su última carta:  sobre qué va la siguiente carta */
  get color() {
    if (this.isEmpty) return "ninguno"
    return this.lastItem!.color
  }

  get valor() {
    if (this.isEmpty) return 0
    return this.lastItem!.valor
  }

  /** su nombre, luego el estado de cada carta, p. ej. "reserva: D♠️+ 7♥️—" */
  @derived get estado() {
    let estado = `${this.name || "pila"}:`
    this.forEach((carta) => (estado = `${estado} ${carta.estado}`))
    return estado
  }

  static exclusive = true
}
export interface Pila {
  canTake(carta: Carta): boolean
  canGiveUp(carta: Carta): boolean
}

/**
 * `<test-project-pila>`:  a pila, drawn in its own element, e.g. by `draw the pila`.
 * - The page defines its tag with this class:  `core.useElement()`, below.
 * - Its attributes are its pila's properties;  its methods call its pila's.
 * - What every drawable thing's element does, e.g. drawing its pila, is `SpellElement`'s.
 */
export class PilaElement extends SpellElement<Pila> {
  @E.proto static vocabulary = SpellElement.vocabularyFor("test-project-pila", "pila", [
    { name: "name", kind: "string", description: "Its name." }
  ])
}
core.useElement(Pila, PilaElement)

/** una carta está en una sola pila a la vez:  ponerla en otra pila la quita de esta */

core.heading("Pruebas")
/** Pruebas */
export function testLasPilas() {
  return core.test("test las pilas", function testLasPilas() {
    core.echoTestAction(`poner la reserva a una nueva pila con nombre = "reserva"`)
    const reserva = new Pila({ name: "reserva" })
    core.echoTestAction(`poner los descartes a una nueva pila con nombre = "descartes"`)
    const descartes = new Pila({ name: "descartes" })
    core.expect(reserva.color, `el color de la reserva`, "ninguno", `"ninguno"`)
    core.expect(reserva.valor, `el valor de la reserva`, 0, `0`)

    core.echoTestAction(`agregar (una nueva carta cuyo rango es dama, palo es espadas y dirección es arriba) a la reserva`)
    reserva.append(new Carta({
      rango: "dama",
      palo: "espadas",
      dirección: "arriba"
    }))
    core.echoTestAction(`agregar (una nueva carta cuyo rango es 7, palo es corazones y dirección es abajo) a la reserva`)
    reserva.append(new Carta({
      rango: 7,
      palo: "corazones",
      dirección: "abajo"
    }))
    core.expect(reserva.color, `el color de la reserva`, "rojo", `rojo`)
    core.expect(reserva.valor, `el valor de la reserva`, 7, `7`)
    core.expect(reserva.estado, `el estado de la reserva`, "reserva: D♠️+ 7♥️—", `"reserva: D♠️+ 7♥️—"`)

    /** una carta está en una sola pila a la vez */
    const carta = reserva.lastItem
    core.echoTestAction(`agregar la carta a los descartes`)
    descartes.append(carta!)
    core.expect(reserva.length, `el número de cartas en la reserva`, 1, `1`)
    core.expect(carta?.pila === descartes, `la pila de la carta es los descartes`, true, `sí`)
    core.expect(descartes.estado, `el estado de los descartes`, "descartes: 7♥️—", `"descartes: 7♥️—"`)
  })
}
// -----------
core.heading("Solitario Klondike")
////////////////////////
// ## Solitario Klondike
////////////////////////
//-- Mira la [wikipedia](https://en.wikipedia.org/wiki/Klondike_(solitaire)) para sus reglas, y cómo se llama cada pila.
// Las cartas, el mazo y las pilas son los de este proyecto:  Carta, Mazo y Pila.
// Este archivo agrega el juego, sus tipos de pilas, qué puede tomar o soltar cada una, y cómo se dibuja cada una.
// Qué hay dónde, de arriba abajo:
//   el solitario:  sus pilas, sus movimientos, el juego solo y su dibujo
//   jugar una carta:  qué hace un clic
//   inicio
//   las pilas:  cada tipo, qué puede tomar o soltar, y cómo se dibuja
//   pruebas

core.heading("El solitario:  sus pilas, sus movimientos, el juego solo y su dibujo")
/** una pila apilada:  sus cartas una sobre otra, la última a la vista, sobre un lugar para la primera */
export class PilaApilada extends Pila {
  static elementTag = core.defineElement(this, "test-project")

  static css = css`
    :host {
    	display: block;
    	position: relative;
    	min-height: 6.5rem;
    }
    /* donde va su primera carta:  un contorno del tamaño de una carta */
    .Placeholder {
    	position: absolute;
    	top: 1.5rem;
    	left: 0.3rem;
    	width: 4.25rem;
    	height: 5.65rem;
    	box-sizing: border-box;
    	border: 2px dashed #c8c8c8;
    	border-radius: 0.4rem;
    	display: flex;
    	align-items: center;
    	justify-content: center;
    	font-size: 2rem;
    	cursor: pointer;
    }
    ::slotted(*) {
    	position: absolute;
    	top: 0;
    	left: 0;
    }
  `
}

/**
 * `<test-project-pila-apilada>`:  a pila apilada, drawn in its own element, e.g. by `draw the pila apilada`.
 * - The page defines its tag with this class:  `core.useElement()`, below.
 * - Its attributes are its pila apilada's properties;  its methods call its pila apilada's.
 * - What every drawable thing's element does, e.g. drawing its pila apilada, is `SpellElement`'s.
 */
export class PilaApiladaElement extends SpellElement<PilaApilada> {
  @E.proto static vocabulary = SpellElement.vocabularyFor("test-project-pila-apilada", "pila apilada", [])
  @E.protoMerged static elementSetup = {
    styleSheets: { "test-project-pila-apilada": PilaApilada.css }
  } satisfies Partial<E.ElementSetup>
}
core.useElement(PilaApilada, PilaApiladaElement)

/** la reserva:  las cartas aún sin jugar, boca abajo;  un clic voltea la siguiente */
export class PilaDeReserva extends PilaApilada {
  static elementTag = core.defineElement(this, "test-project")

  canTake(carta: Carta) {
    return false
  }

  canGiveUp(carta: Carta) {
    return carta === this.lastItem
  }

  @drawn draw() {
    return (
      <div class="Stock">
        <div class="Placeholder" onClick={() => solitario.robarDeLaReserva()} />
        <slot />
      </div>
    )
  }
}

/**
 * `<test-project-pila-de-reserva>`:  a pila de reserva, drawn in its own element, e.g. by `draw the pila de reserva`.
 * - The page defines its tag with this class:  `core.useElement()`, below.
 * - Its attributes are its pila de reserva's properties;  its methods call its pila de reserva's.
 * - What every drawable thing's element does, e.g. drawing its pila de reserva, is `SpellElement`'s.
 */
export class PilaDeReservaElement extends SpellElement<PilaDeReserva> {
  @E.proto static vocabulary = SpellElement.vocabularyFor("test-project-pila-de-reserva", "pila de reserva", [])

  canTake(carta: Carta) {
    return this.currentThing?.canTake(carta)
  }

  canGiveUp(carta: Carta) {
    return this.currentThing?.canGiveUp(carta)
  }
}
core.useElement(PilaDeReserva, PilaDeReservaElement)

/** los descartes:  adonde van las cartas de la reserva al voltearse */
export class PilaDeDescartes extends PilaApilada {
  static elementTag = core.defineElement(this, "test-project")

  canTake(carta: Carta) {
    return false
  }

  canGiveUp(carta: Carta) {
    return carta === this.lastItem
  }
}

/**
 * `<test-project-pila-de-descartes>`:  a pila de descartes, drawn in its own element, e.g. by `draw the pila de descartes`.
 * - The page defines its tag with this class:  `core.useElement()`, below.
 * - Its attributes are its pila de descartes's properties;  its methods call its pila de descartes's.
 * - What every drawable thing's element does, e.g. drawing its pila de descartes, is `SpellElement`'s.
 */
export class PilaDeDescartesElement extends SpellElement<PilaDeDescartes> {
  @E.proto static vocabulary = SpellElement.vocabularyFor("test-project-pila-de-descartes", "pila de descartes", [])

  canTake(carta: Carta) {
    return this.currentThing?.canTake(carta)
  }

  canGiveUp(carta: Carta) {
    return this.currentThing?.canGiveUp(carta)
  }
}
core.useElement(PilaDeDescartes, PilaDeDescartesElement)

/** una fundación:  donde se arma un palo, del as al rey */
export class Fundación extends PilaApilada {
  static elementTag = core.defineElement(this, "test-project")

  // su "palo" es un palo
  @prop({ oneOf: () => Carta.Palos })
  accessor palo!: (typeof Carta.Palos)[number]

  canGiveUp(carta: Carta) {
    return false
  }

  /** una carta a la vez:  la última de su pila */
  canTake(carta: Carta) {
    if (carta !== carta.pila.lastItem) return false
    return this.palo === carta.palo && this.valor + 1 === carta.valor
  }

  @drawn draw() {
    return (
      <div class="Foundation">
        <div class="Placeholder">{Palo.símbolo(this.palo)}</div>
        <slot />
      </div>
    )
  }
}

/**
 * `<test-project-fundacion>`:  a fundación, drawn in its own element, e.g. by `draw the fundación`.
 * - The page defines its tag with this class:  `core.useElement()`, below.
 * - Its attributes are its fundación's properties;  its methods call its fundación's.
 * - What every drawable thing's element does, e.g. drawing its fundación, is `SpellElement`'s.
 */
export class FundaciónElement extends SpellElement<Fundación> {
  @E.proto static vocabulary = SpellElement.vocabularyFor("test-project-fundacion", "fundación", [
    { name: "palo", kind: "string", description: "Its palo." }
  ])

  canGiveUp(carta: Carta) {
    return this.currentThing?.canGiveUp(carta)
  }

  canTake(carta: Carta) {
    return this.currentThing?.canTake(carta)
  }
}
core.useElement(Fundación, FundaciónElement)

/** una columna:  se arma hacia abajo, del rey al as, rojo y negro alternados */
export class Columna extends Pila {
  static elementTag = core.defineElement(this, "test-project")

  canGiveUp(carta: Carta) {
    return carta.estáBocaArriba
  }

  canTake(carta: Carta) {
    if (this.isEmpty) return carta.esUnRango("rey")
    return this.color != carta.color && this.valor === carta.valor + 1
  }

  static css = css`
    :host {
    	display: block;
    	min-height: 30rem;
    }
    /* cada carta debajo de la anterior, con su parte de arriba a la vista;  la última entera */
    ::slotted(*) {
    	display: block;
    }
    ::slotted(:not(:last-child)) {
    	height: 2.6rem;
    	overflow: hidden;
    }
  `
}

/**
 * `<test-project-columna>`:  a columna, drawn in its own element, e.g. by `draw the columna`.
 * - The page defines its tag with this class:  `core.useElement()`, below.
 * - Its attributes are its columna's properties;  its methods call its columna's.
 * - What every drawable thing's element does, e.g. drawing its columna, is `SpellElement`'s.
 */
export class ColumnaElement extends SpellElement<Columna> {
  @E.proto static vocabulary = SpellElement.vocabularyFor("test-project-columna", "columna", [])
  @E.protoMerged static elementSetup = {
    styleSheets: { "test-project-columna": Columna.css }
  } satisfies Partial<E.ElementSetup>

  canGiveUp(carta: Carta) {
    return this.currentThing?.canGiveUp(carta)
  }

  canTake(carta: Carta) {
    return this.currentThing?.canTake(carta)
  }
}
core.useElement(Columna, ColumnaElement)

/** El solitario:  sus pilas, sus movimientos, el juego solo y su dibujo */
@thing
export class Solitario extends App {
  // su "puntuación" es un número
  @prop({ type: "number" })
  accessor puntuación!: number

  // su "mazo" es un nuevo mazo
  @prop({ init: () => new Mazo(), early: true })
  accessor mazo!: Mazo

  /** una de cada pila, hecha con el solitario */
  // su "reserva" es una nueva pila de reserva con nombre = "reserva"
  @prop({ init: () => new PilaDeReserva({ name: "reserva" }), early: true })
  accessor reserva!: PilaDeReserva

  // sus "descartes" es una nueva pila de descartes con nombre = "descartes"
  @prop({ init: () => new PilaDeDescartes({ name: "descartes" }), early: true })
  accessor descartes!: PilaDeDescartes

  // sus "tréboles" es una nueva fundación con nombre = "tréboles", palo = tréboles
  @prop({ init: () => new Fundación({ name: "tréboles", palo: "tréboles" }), early: true })
  accessor tréboles!: Fundación

  // sus "diamantes" es una nueva fundación con nombre = "diamantes", palo = diamantes
  @prop({ init: () => new Fundación({ name: "diamantes", palo: "diamantes" }), early: true })
  accessor diamantes!: Fundación

  // sus "corazones" es una nueva fundación con nombre = "corazones", palo = corazones
  @prop({ init: () => new Fundación({ name: "corazones", palo: "corazones" }), early: true })
  accessor corazones!: Fundación

  // sus "espadas" es una nueva fundación con nombre = "espadas", palo = espadas
  @prop({ init: () => new Fundación({ name: "espadas", palo: "espadas" }), early: true })
  accessor espadas!: Fundación

  // su "C1" es una nueva columna con nombre = "C1"
  @prop({ init: () => new Columna({ name: "C1" }), early: true })
  accessor C1!: Columna

  // su "C2" es una nueva columna con nombre = "C2"
  @prop({ init: () => new Columna({ name: "C2" }), early: true })
  accessor C2!: Columna

  // su "C3" es una nueva columna con nombre = "C3"
  @prop({ init: () => new Columna({ name: "C3" }), early: true })
  accessor C3!: Columna

  // su "C4" es una nueva columna con nombre = "C4"
  @prop({ init: () => new Columna({ name: "C4" }), early: true })
  accessor C4!: Columna

  // su "C5" es una nueva columna con nombre = "C5"
  @prop({ init: () => new Columna({ name: "C5" }), early: true })
  accessor C5!: Columna

  // su "C6" es una nueva columna con nombre = "C6"
  @prop({ init: () => new Columna({ name: "C6" }), early: true })
  accessor C6!: Columna

  // su "C7" es una nueva columna con nombre = "C7"
  @prop({ init: () => new Columna({ name: "C7" }), early: true })
  accessor C7!: Columna

  /**
   * una vez, al hacerse el solitario:  cada carta del mazo a la reserva
   * - su mazo y sus pilas se hacen con él, antes de que esto corra
   * - dentro del bucle `eso` es la carta:  así la reserva es `la reserva del solitario`
   */
  create() {
    this.mazo.forEach((carta) => this.reserva.append(carta))
  }

  /** imprime las cartas de cada pila, p. ej. "reserva: D♠️— 7♥️—" */
  depurar() {
    core.map(core.everyThing(Pila), (pila: Pila) => core.console.log(pila.estado))
  }

  /** los descartes, volteados, de vuelta a la reserva */
  rehacerLaReserva() {
    const cartas = this.descartes.clone()
    cartas.reverse()
    cartas.forEach((carta) => {
      this.reserva.append(carta)
      carta.voltearBocaAbajo()
    })
  }

  /** voltea la siguiente carta de la reserva, sobre los descartes */
  async robarDeLaReserva() {
    if (core.processIsRunning("robar_de_la_reserva")) return
    core.startProcess("robar_de_la_reserva", "EXCLUSIVE")
    try {
      if (this.reserva.isEmpty) await this.rehacerLaReserva()

      const it = this.reserva.lastItem
      it?.voltearBocaArriba()
      this.descartes.append(it!)
    }
    finally {
      core.stopProcess("robar_de_la_reserva")
    }
  }

  /** junta todas las cartas de su mazo en la reserva, barájala, y reparte las columnas:  una carta más en cada una, de izquierda a derecha */
  async repartirLasCartas() {
    if (core.processIsRunning("repartir_las_cartas")) return
    core.startProcess("repartir_las_cartas", "EXCLUSIVE")
    try {
      for (const carta of this.mazo) {
        const pilaInicial = carta.pila
        carta.voltearBocaAbajo()
        if (pilaInicial !== this.reserva) {
          this.reserva.append(carta)
          await core.pauseFor(50, "msec")
        }
      }
      this.reserva.randomize()

      for (const fila of core.getRange(1, 7)) {
        this.reserva.lastItem?.voltearBocaArriba()
        for (const lugar of core.getRange(fila, 7)) {
          core.getItemAt(core.everyThing(Columna), position(lugar))?.append(this.reserva.lastItem!)
          await core.pauseFor(50, "msec")
        }
      }

      await this.robarDeLaReserva()
    }
    finally {
      core.stopProcess("repartir_las_cartas")
    }
  }

  empezarElJuego() {
    this.puntuación = 0
    this.repartirLasCartas()
  }

  /** voltea una carta boca abajo de una columna, al azar, sobre los descartes */
  async hacerTrampa() {
    const pilasRestantes = core.filter(core.everyThing(Columna), (pila: Columna) => !pila.isEmpty && pila.firstItem?.estáBocaAbajo)
    if (core.isEmpty(pilasRestantes)) return
    const pila = core.randomItemOf<Columna>(pilasRestantes)
    const cartasOcultas = pila?.filter((carta) => carta.estáBocaAbajo)
    const carta = cartasOcultas?.randomItem()
    carta?.voltearBocaArriba()
    await core.pauseFor(30, "ticks")
    this.descartes.append(carta!)
  }

  /** juega cada carta que puede ir a algún lado, hasta que ninguna pueda */
  async jugarSolo() {
    let huboCambios: boolean = false
    if (!this.descartes.isEmpty) {
      const candidata = this.descartes.lastItem
      if (await candidata?.jugar()) {
        huboCambios = true
        await core.pauseFor(500, "msec")
      }
    }

    // la última carta de cada columna a su fundación
    await core.forEachSequential(core.everyThing(Columna), async (pila: Columna) => {
      if (pila.isEmpty) return
      const candidata = pila.lastItem!
      const fundación = core.filter(core.everyThing(Fundación), (pila: Fundación) => pila.palo == candidata.palo).firstItem
      if (core.canTake(fundación!, candidata)) {
        huboCambios = true
        await candidata.jugar()
        await core.pauseFor(100, "msec")
      }
    })

    // las cartas boca arriba de cada columna, todas juntas, a otra columna
    await (core.forEachSequential(core.everyThing(Columna), async (pila: Columna) => {
      const cartasVisibles = pila.filter((carta) => carta.estáBocaArriba)
      if (cartasVisibles.isEmpty) return
      const candidata = cartasVisibles.firstItem!
      if (candidata.esUnRango("rey") && candidata === pila.firstItem) return
      if (await candidata.jugar()) {
        huboCambios = true
        await core.pauseFor(500, "msec")
      }
    }))

    if (huboCambios) await this.jugarSolo()
  }

  @drawn draw() {
    return (
      <es-contenedor>
        <es-menu>
          <es-elemento tipo="encabezado">Solitario Klondike</es-elemento>
          <es-elemento>{`Puntos: ${this.puntuación}`}</es-elemento>
          <es-menu posicion="derecha">
            <es-elemento onClick={() => this.jugarSolo()}>Jugar solo</es-elemento>
            <es-elemento onClick={() => this.hacerTrampa()}>Trampa</es-elemento>
            <es-elemento onClick={() => this.depurar()}>Depurar</es-elemento>
            <es-elemento onClick={() => this.empezarElJuego()}>Reiniciar</es-elemento>
          </es-menu>
        </es-menu>
        <es-cuadricula columnas="7">
          <es-fila>
            <es-columna>{core.drawThing(this.reserva)}</es-columna>
            <es-columna>{core.drawThing(this.descartes)}</es-columna>
            <es-columna />
            <es-columna>{core.drawThing(this.tréboles)}</es-columna>
            <es-columna>{core.drawThing(this.diamantes)}</es-columna>
            <es-columna>{core.drawThing(this.corazones)}</es-columna>
            <es-columna>{core.drawThing(this.espadas)}</es-columna>
          </es-fila>
          <es-fila>
            <es-columna>{core.drawThing(this.C1)}</es-columna>
            <es-columna>{core.drawThing(this.C2)}</es-columna>
            <es-columna>{core.drawThing(this.C3)}</es-columna>
            <es-columna>{core.drawThing(this.C4)}</es-columna>
            <es-columna>{core.drawThing(this.C5)}</es-columna>
            <es-columna>{core.drawThing(this.C6)}</es-columna>
            <es-columna>{core.drawThing(this.C7)}</es-columna>
          </es-fila>
        </es-cuadricula>
      </es-contenedor>
    )
  }
}
export const solitario = new Solitario()

core.heading("Jugar una carta:  qué hace un clic")
on<{ carta: Carta }>("clic-carta", ({ carta }) => carta.jugar())

core.heading("Inicio")
//## Inicio
core.console.log(solitario)
solitario.empezarElJuego()
if (!core.isCarryingOver) solitario.start()

core.heading("Las pilas:  cada tipo, qué puede tomar o soltar, y cómo se dibuja")
///////////////////////////////////////////////////////////////////////
// ## Las pilas:  cada tipo, qué puede tomar o soltar, y cómo se dibuja
///////////////////////////////////////////////////////////////////////
// Cada pila es una lista dibujable:  un elemento propio, p. ej. `<solitario-columna>`, alrededor de los elementos de sus cartas.
// Así cada tipo se da estilo a sí mismo, en su `<css>`, y dónde van sus cartas:  styles.css no llega dentro.

core.heading("Pruebas")
/** Pruebas */
export function testLosMovimientos() {
  return core.test("test los movimientos", function testLosMovimientos() {
    core.echoTestAction(`poner la columna a una nueva columna con nombre = "C1"`)
    let columna = new Columna({ name: "C1" })
    core.echoTestAction(`poner el rey a una nueva carta cuyo rango es rey, palo es espadas y dirección es arriba`)
    const rey = new Carta({
      rango: "rey",
      palo: "espadas",
      dirección: "arriba"
    })
    core.echoTestAction(`poner la dama a una nueva carta cuyo rango es dama, palo es corazones y dirección es arriba`)
    const dama = new Carta({
      rango: "dama",
      palo: "corazones",
      dirección: "arriba"
    })
    core.echoTestAction(`poner la jota a una nueva carta cuyo rango es jota, palo es tréboles y dirección es arriba`)
    const jota = new Carta({
      rango: "jota",
      palo: "tréboles",
      dirección: "arriba"
    })
    // una columna vacía toma solo un rey, luego uno más bajo del otro color
    core.expect(core.canTake(columna, dama), `la columna puede tomar la dama`, false, `no`)
    core.expect(core.canTake(columna, rey), `la columna puede tomar el rey`, true, `sí`)
    core.echoTestAction(`agregar el rey a la columna`)
    columna.append(rey)
    core.expect(core.canTake(columna, jota), `la columna puede tomar la jota`, false, `no`)
    core.expect(core.canTake(columna, dama), `la columna puede tomar la dama`, true, `sí`)
    core.echoTestAction(`agregar la dama a la columna`)
    columna.append(dama)
    core.expect(columna.estado, `el estado de la columna`, "C1: R♠️+ D♥️+", `"C1: R♠️+ D♥️+"`)
    core.expect(core.canGiveUp(columna, dama), `la columna puede soltar la dama`, true, `sí`)
    core.echoTestAction(`voltear la dama boca abajo`)
    dama.voltearBocaAbajo()
    core.expect(core.canGiveUp(columna, dama), `la columna puede soltar la dama`, false, `no`)

    /** una fundación toma su palo, el as primero, luego uno más alto:  cada una la última carta de su pila */
    const fundación = new Fundación({ name: "corazones", palo: "corazones" })
    core.echoTestAction(`poner el dos a una nueva carta cuyo rango es 2, palo es corazones y dirección es arriba`)
    const dos = new Carta({
      rango: 2,
      palo: "corazones",
      dirección: "arriba"
    })
    core.echoTestAction(`poner el as a una nueva carta cuyo rango es as, palo es corazones y dirección es arriba`)
    const as = new Carta({
      rango: "as",
      palo: "corazones",
      dirección: "arriba"
    })
    core.echoTestAction(`poner la columna a una nueva columna con nombre = "C2"`)
    columna = new Columna({ name: "C2" })
    core.echoTestAction(`agregar el dos a la columna`)
    columna.append(dos)
    core.echoTestAction(`agregar el as a la columna`)
    columna.append(as)
    core.expect(core.canTake(fundación, dos), `la fundación puede tomar el dos`, false, `no`)
    core.expect(core.canTake(fundación, as), `la fundación puede tomar el as`, true, `sí`)
    core.echoTestAction(`mover el as a la fundación`)
    core.move(as, fundación)
    core.expect(core.canTake(fundación, dos), `la fundación puede tomar el dos`, true, `sí`)
    core.echoTestAction(`agregar la dama a la columna`)
    columna.append(dama)
    core.expect(core.canTake(fundación, dama), `la fundación puede tomar la dama`, false, `no`)
  })
}
// -----------
core.installStyles(undefined, `/* File styles.css:  the board's own styles.¬   Each kind of pile styles itself, and where its cards go:  its <css>, in Solitaire.spell.¬   A pile is a drawable list, drawn in its own element's shadow root, which styles here can't reach. */¬`)
// -----------
if (!core.isCarryingOver) testLaPreparaciónDeLaCarta()
if (!core.isCarryingOver) testLosComodines()
if (!core.isCarryingOver) testLaCreaciónDelMazo()
if (!core.isCarryingOver) testElMazoConComodines()
if (!core.isCarryingOver) testLasPilas()
if (!core.isCarryingOver) testLosMovimientos()

// each drawable type's tag, for the JSX
declare module "@solidjs/web/types/jsx.js" {
  namespace JSX {
    interface IntrinsicElements {
      /** `CartaElement` */
      "test-project-carta": HTMLAttributes<HTMLElement> & { [attribute: string]: unknown }
      /** `ComodínElement` */
      "test-project-comodin": HTMLAttributes<HTMLElement> & { [attribute: string]: unknown }
      /** `PilaElement` */
      "test-project-pila": HTMLAttributes<HTMLElement> & { [attribute: string]: unknown }
      /** `PilaApiladaElement` */
      "test-project-pila-apilada": HTMLAttributes<HTMLElement> & { [attribute: string]: unknown }
      /** `PilaDeReservaElement` */
      "test-project-pila-de-reserva": HTMLAttributes<HTMLElement> & { [attribute: string]: unknown }
      /** `PilaDeDescartesElement` */
      "test-project-pila-de-descartes": HTMLAttributes<HTMLElement> & { [attribute: string]: unknown }
      /** `FundaciónElement` */
      "test-project-fundacion": HTMLAttributes<HTMLElement> & { [attribute: string]: unknown }
      /** `ColumnaElement` */
      "test-project-columna": HTMLAttributes<HTMLElement> & { [attribute: string]: unknown }
    }
  }
}
