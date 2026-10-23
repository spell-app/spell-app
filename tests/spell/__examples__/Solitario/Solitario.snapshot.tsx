import { core, Thing, List, App, Drawable, DrawableList, prop, derived, thing, drawn, positionOf, spellPosition, position, trigger, on } from "@spell/core"
import { E, SpellElement } from "@spell/elements"

core.heading("Una carta de la baraja -- en el estilo de esquema:  su nombre, luego lo que es cierto de ella")
///////////////////////////////////////////////////////////////////////////////////////////////////
// ## Una carta de la baraja -- en el estilo de esquema:  su nombre, luego lo que es cierto de ella
///////////////////////////////////////////////////////////////////////////////////////////////////
export type Rango = (typeof Carta.Rangos)[number]
export type Palo = (typeof Carta.Palos)[number]
export type Dirección = (typeof Carta.Direcciones)[number]

/**
 * La carta dice cuáles son sus palos, rangos y colores:  un mazo, una pila o un juego solo los leen.
 * Una cosa dibujable:  cada carta es un elemento propio en la página, p. ej. `<solitario-carta>`.
 */
export class Carta extends Drawable {
  static elementTag = core.defineElement(this, "test-project")

  /** rango de la carta */
  // su "rango" es uno de as, 2 ... 10, jota, dama, rey
  static Rangos = ["as", 2, 3, 4, 5, 6, 7, 8, 9, 10, "jota", "dama", "rey"] as const
  @prop({ oneOf: () => Carta.Rangos })
  accessor rango!: Rango

  /** as = 1 ... rey = 13 */
  get valor() {
    return spellPosition(positionOf(Carta.Rangos, this.rango))
  }

  /** "la carta es un rey" */
  esUnRango(rango: Rango) {
    return this.rango === rango
  }

  /** "la carta es una figura" */
  get esUnaFigura() {
    return core.includes(["jota", "dama", "rey"], this.rango)
  }

  /** "la carta es una carta numérica" */
  get esUnaCartaNumérica() {
    return !this.esUnaFigura
  }

  /** palo de la carta */
  // su "palo" es uno de tréboles, diamantes, corazones o espadas
  static Palos = ["tréboles", "diamantes", "corazones", "espadas"] as const
  @prop({ oneOf: () => Carta.Palos })
  accessor palo!: Palo

  /** "la carta es un diamante" */
  esUnPalo(palo: Palo) {
    return this.palo === palo
  }

  get color() {
    if (core.includes(["diamantes", "corazones"], this.palo)) return "rojo"
    return "negro"
  }

  /** cartas concretas */
  // "dama de espadas"
  get nombre() {
    return `${this.rango} de ${this.palo}`
  }

  /** "la carta es la dama de espadas" */
  esElRangoDePalo(rango: Rango, palo: Palo) {
    return this.rango === rango && this.palo === palo
  }

  /** su dirección:  boca arriba o boca abajo */
  // su "dirección" es arriba o abajo
  static Direcciones = ["arriba", "abajo"] as const
  @prop({ oneOf: () => Carta.Direcciones })
  accessor dirección!: Dirección

  /** la carta está boca arriba */
  estáBocaDirección(dirección: Dirección) {
    return this.dirección === dirección
  }

  //////////////////////
  // ## voltear la carta
  //////////////////////
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
    if (this.estáBocaDirección("arriba")) await this.voltearBocaAbajo()
    else await this.voltearBocaArriba()
  }

  /**
   * Imagen de la carta:  dibujada con letras especiales del juego de caracteres unicode
   * - MIRA:  https://www.compart.com/en/unicode/block/U+1F0A0
   */
  get imagen() {
    if (this.estáBocaDirección("abajo")) {
      // "Dorso de carta"
      return "🂠"
    }

    let columna = this.valor
    if (this.esUnPalo("tréboles")) return core.getItemAt(["🃑", "🃒", "🃓", "🃔", "🃕", "🃖", "🃗", "🃘", "🃙", "🃚", "🃛", "🃝", "🃞"], position(columna))
    if (this.esUnPalo("diamantes")) return core.getItemAt(["🃁", "🃂", "🃃", "🃄", "🃅", "🃆", "🃇", "🃈", "🃉", "🃊", "🃋", "🃍", "🃎"], position(columna))
    if (this.esUnPalo("corazones")) return core.getItemAt(["🂱", "🂲", "🂳", "🂴", "🂵", "🂶", "🂷", "🂸", "🂹", "🂺", "🂻", "🂽", "🂾"], position(columna))
    if (this.esUnPalo("espadas")) return core.getItemAt(["🂡", "🂢", "🂣", "🂤", "🂥", "🂦", "🂧", "🂨", "🂩", "🂪", "🂫", "🂭", "🂮"], position(columna))
  }

  // una letra, del tamaño del texto de alrededor:  su pila la escala para que quepa -- styles.css
  @drawn draw() {
    return (
      <es-texto part="imagen" color={this.estáBocaDirección("arriba") ? this.color : "azul"} onClick={() => trigger("clic-carta", { carta: this })} style="cursor:pointer;user-select:none">
        {this.imagen}
      </es-texto>
    )
  }

  get símbolo() {
    if (this.palo == "tréboles") return "♣"
    if (this.palo == "diamantes") return "♦"
    if (this.palo == "corazones") return "♥"
    if (this.palo == "espadas") return "♠"
    return "?"
  }

  /** el "estado" de la carta, para depurar */
  get estado() {
    const rango = this.valor === 10 ? 10 : `${core.getItemAt(this.rango, 0) ?? ""}`.toLocaleUpperCase()
    const palo = this.símbolo
    const dirección = this.estáBocaDirección("arriba") ? "↑" : "↓"
    return rango + palo + dirección
  }

  //////////////////////////////////////////////////////
  // ## Jugar una carta:  qué hace un clic o un arrastre
  //////////////////////////////////////////////////////
  /**
   * la carta, y cada carta sobre ella, a la primera pila que pueda tomarla;  dice si se movió
   * - la carta de la reserva se voltea sobre los descartes en su lugar
   */
  jugar() {
    if (this.pila === solitario.reserva) {
      solitario.robarDeLaReserva()
      return
    }

    const pilaFinal = core.filter(core.everyThing(Pila), (pila: Pila) => core.canTake(pila, this)).firstItem
    if (pilaFinal === undefined) return false
    return this.ponerEnPila(pilaFinal)
  }

  /**
   * la carta, y cada carta sobre ella, a la pila, si las reglas de las pilas la dejan ir y tomarla;  dice si se movió
   * - la pila que dejó voltea su nueva última carta, y el movimiento suma puntos
   */
  async ponerEnPila(pila: Pila) {
    const pilaInicial = this.pila
    if (!core.canGiveUp(pilaInicial, this)) return false
    if (!core.canTake(pila, this)) return false

    const cartasMovidas = pilaInicial.startingWith(this)
    cartasMovidas.name = pilaInicial.name
    core.console.log(`moviendo (${cartasMovidas.estado}) a (${pila.estado})`)

    cartasMovidas.forEach((carta) => core.move(carta, pila))

    if (pilaInicial instanceof Columna && !pilaInicial.isEmpty) {
      await core.pauseFor(200, "msec")
      const it = pilaInicial.lastItem
      core.console.log(`volteando (${pilaInicial.name}: ${it?.estado})`)
      it?.voltearBocaArriba()
    }

    if (pila instanceof Fundación) solitario.puntuación = solitario.puntuación + 10
    else if (pilaInicial === solitario.descartes) solitario.puntuación = solitario.puntuación + 5
    return true
  }

  static canBeDragged = true

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
    { name: "palo", kind: "string", description: "Its palo." },
    { name: "dirección", kind: "string", description: "Its dirección." }
  ])

  esUnRango(rango: Rango) {
    return this.currentThing?.esUnRango(rango)
  }

  esUnPalo(palo: Palo) {
    return this.currentThing?.esUnPalo(palo)
  }

  esElRangoDePalo(rango: Rango, palo: Palo) {
    return this.currentThing?.esElRangoDePalo(rango, palo)
  }

  estáBocaDirección(dirección: Dirección) {
    return this.currentThing?.estáBocaDirección(dirección)
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

  ponerEnPila(pila: Pila) {
    return this.currentThing?.ponerEnPila(pila)
  }
}
core.useElement(Carta, CartaElement)

///////////////////////////////////////////////////////////////////////////////////////////
// ## dibujarla:  su imagen boca arriba, boca abajo el dorso que comparten todas las cartas
///////////////////////////////////////////////////////////////////////////////////////////
// en la página, una carta se puede arrastrar a otra pila:  las reglas de su pila dicen cuáles suelta

core.heading("Pruebas")
export type Color = (typeof Comodín.Colores)[number]

/** Un comodín:  una carta salvaje sin rango ni palo -- hay uno rojo y uno negro */
export class Comodín extends Carta {
  static elementTag = core.defineElement(this, "test-project")

  // su "color" es uno de rojo o negro
  static Colores = ["rojo", "negro"] as const
  static { this.declareProp("color", { oneOf: Comodín.Colores }) }
  get color(): Color { return this.getProp("color") as Color }
  set color(value: Color) { this.setProp("color", value) }

  /** "la carta es el comodín rojo" */
  static esElComodínColor(carta: Carta, color: Color) {
    return carta instanceof Comodín && carta.color === color
  }

  get valor(): number {
    if (Comodín.esElComodínColor(this, "rojo")) return 53
    return 54
  }

  get imagen() {
    return "🃟"
  }

  get nombre(): string {
    return `comodín ${this.color}`
  }

  get estado(): string {
    const color = `${core.getItemAt(this.color, 0) ?? ""}`.toLocaleUpperCase()
    const dirección = this.estáBocaDirección("arriba") ? "↑" : "↓"
    return `*${color}${dirección}`
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

/** Pruebas */
export function testLaPreparaciónDeLaCarta() {
  return core.test("test la preparación de la carta", function testLaPreparaciónDeLaCarta() {
    core.echoTestAction(`obtener una nueva carta cuyo rango es dama, palo es espadas y dirección es abajo`)
    const it = new Carta({
      rango: "dama",
      palo: "espadas",
      dirección: "abajo"
    })
    core.echo(`probando la ${it.nombre}`)
    core.expect(it.rango, `su rango`, "dama", `dama`)
    core.expect(it.palo, `su palo`, "espadas", `espadas`)
    core.expect(it.nombre, `su nombre`, "dama de espadas", `"dama de espadas"`)
    core.expect(it.color, `su color`, "negro", `negro`)
    core.expect(it.valor, `su valor`, 12, `12`)
    core.expect(it.estado, `su estado`, "D♠↓", `"D♠↓"`)


    core.expect(it.estáBocaDirección("abajo"), `está boca abajo`, true, `sí`)
    core.expect(it.imagen, `su imagen`, "🂠", `"🂠"`)
    core.echoTestAction(`voltear eso boca arriba`)
    it.voltearBocaArriba()
    core.expect(it.estáBocaDirección("arriba"), `está boca arriba`, true, `sí`)
    core.expect(it.imagen, `su imagen`, "🂭", `"🂭"`)

    core.expect(it.esUnaFigura, `es una figura`, true, `sí`)
    core.expect(!it.esUnaCartaNumérica, `no es una carta numérica`, true, `sí`)

    core.expect(it.esUnPalo("espadas"), `es una espada`, true, `sí`)
    core.expect(it.esUnPalo("tréboles"), `es un trébol`, false, `no`)

    core.expect(it.esUnRango("dama"), `es una dama`, true, `sí`)
    core.expect(it.esUnRango("as"), `es un as`, false, `no`)
    core.expect(it.esUnRango(2), `es un 2`, false, `no`)

    core.expect(it.esElRangoDePalo("dama", "espadas"), `es la dama de espadas`, true, `sí`)
    core.expect(it.esElRangoDePalo("dama", "tréboles"), `es la dama de tréboles`, false, `no`)
    core.expect(it.esElRangoDePalo(2, "tréboles"), `es el 2 de tréboles`, false, `no`)
    // es el comodín rojo debería ser no

    /** una carta de número:  su rango tal cual, y su imagen en la fila de su palo */
    const siete = new Carta({
      rango: 7,
      palo: "corazones",
      dirección: "arriba"
    })
    core.echo(`probando el ${siete.nombre}`)
    core.expect(siete.esUnaCartaNumérica, `siete es una carta numérica`, true, `sí`)
    core.expect(siete.color, `el color del siete`, "rojo", `rojo`)
    core.expect(siete.imagen, `la imagen del siete`, "🂷", `"🂷"`)
    core.expect((new Carta({ rango: "as", palo: "tréboles" })).imagen, `la imagen de una nueva carta cuyo rango es as y palo es tréboles`, "🃑", `"🃑"`)
    core.expect((new Carta({ rango: "rey", palo: "diamantes" })).imagen, `la imagen de una nueva carta cuyo rango es rey y palo es diamantes`, "🃎", `"🃎"`)
  })
}

core.heading("Un comodín:  una carta salvaje sin rango ni palo -- hay uno rojo y uno negro")
export function testLosComodines() {
  return core.test("test los comodines", function testLosComodines() {
    core.echoTestAction(`obtener un nuevo comodín cuyo color es rojo y dirección es arriba`)
    const it = new Comodín({ color: "rojo", dirección: "arriba" })
    core.echo(it)
    core.expect(it instanceof Carta, `es una carta`, true, `sí`)
    core.expect(it instanceof Comodín, `es un comodín`, true, `sí`)
    core.expect(it.color, `su color`, "rojo", `rojo`)
    core.expect(it.nombre, `su nombre`, "comodín rojo", `"comodín rojo"`)
    core.expect(it.estado, `su estado`, "*R↑", `"*R↑"`)
    core.expect(it.imagen, `su imagen`, "🃟", `"🃟"`)
    core.expect(Comodín.esElComodínColor(it, "rojo"), `es el comodín rojo`, true, `sí`)
    core.expect(Comodín.esElComodínColor(it, "negro"), `es el comodín negro`, false, `no`)
    core.expect(!Comodín.esElComodínColor(it, "negro"), `no es el comodín negro`, true, `sí`)

    core.expect(it.estáBocaDirección("arriba"), `está boca arriba`, true, `sí`)
    core.echoTestAction(`voltear eso`)
    it.voltear()
    core.expect(it.estáBocaDirección("abajo"), `está boca abajo`, true, `sí`)

    core.echoTestAction(`poner comodín negro a un nuevo comodín cuyo color es negro`)
    const comodínNegro = new Comodín({ color: "negro" })
    core.expect(comodínNegro.imagen, `la imagen de comodín negro`, "🃟", `"🃟"`)

    core.echoTestAction(`poner la carta a una nueva carta cuyo rango es dama y palo es espadas`)
    const carta = new Carta({ rango: "dama", palo: "espadas" })
    core.expect(carta instanceof Comodín, `la carta es un comodín`, false, `no`)
    core.expect(!(carta instanceof Comodín), `la carta no es un comodín`, true, `sí`)
    core.expect(Comodín.esElComodínColor(carta, "rojo"), `la carta es el comodín rojo`, false, `no`)
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
    Carta.Rangos.forEach((rango: Rango) => Carta.Palos.forEach((palo: Palo) => this.append(new Carta({ rango: rango, palo: palo }))))
    if (this.comodines) {
      this.append(new Comodín({ color: "rojo" }))
      this.append(new Comodín({ color: "negro" }))
    }
    this.forEach((carta) => carta.voltearBocaAbajo())
  }

  /** muestra los nombres cortos de sus cartas, de arriba abajo */
  @derived get estado() {
    const nombres = new List<string>({ instanceType: "text" })
    this.forEach((carta) => nombres.append(carta.estado))
    return `mazo: ${nombres}`
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
    // el as de tréboles es la carta de arriba
    core.expect(mazo.firstItem?.nombre!, `el nombre de la carta de arriba del mazo`, "as de tréboles", `"as de tréboles"`)
    core.expect(mazo.firstItem?.estado!, `el estado de la carta de arriba del mazo`, "A♣↓", `"A♣↓"`)
    core.expect(mazo.firstItem?.dirección!, `la dirección de la carta de arriba del mazo`, "abajo", `abajo`)
    core.expect(mazo.firstItem?.esElRangoDePalo("as", "tréboles")!, `la primera carta del mazo es el as de tréboles`, true, `sí`)

    core.expect(mazo.lastItem?.nombre!, `el nombre de la carta de abajo del mazo`, "rey de espadas", `"rey de espadas"`)
    // ¡sin comodines!
    core.expect((mazo.randomItem() instanceof Comodín)!, `una carta al azar del mazo es un comodín`, false, `no`)
    core.expect(Comodín.esElComodínColor(mazo.randomItem()!, "rojo"), `una carta al azar del mazo es el comodín rojo`, false, `no`)

    core.echo("el mazo antes de barajar:")
    core.echo(mazo.estado)
    core.echoTestAction(`barajar el mazo`)
    mazo.randomize()
    core.expect(mazo.length, `el número de cartas en el mazo`, 52, `52`)
    core.echo("el mazo después de barajar:")
    core.echo(mazo.estado)
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
    // la primera carta sigue siendo el as de tréboles
    core.expect(mazo.firstItem?.esElRangoDePalo("as", "tréboles")!, `la primera carta del mazo es el as de tréboles`, true, `sí`)
    // la última carta debería ser el comodín negro
    core.expect(Comodín.esElComodínColor(mazo.lastItem!, "negro"), `la última carta del mazo es el comodín negro`, true, `sí`)
    core.expect(mazo.lastItem?.nombre!, `el nombre de la carta de abajo del mazo`, "comodín negro", `"comodín negro"`)
  })
}
// -----------
core.heading("Una pila de cartas, p. ej. el mazo de reserva de un juego o sus descartes")
///////////////////////////////////////////////////////////////////////////////
// ## Una pila de cartas, p. ej. el mazo de reserva de un juego o sus descartes
///////////////////////////////////////////////////////////////////////////////
export type Disposición = (typeof Pila.Disposiciones)[number]

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

  /**
   * cómo están sus cartas:  una sobre otra, hacia abajo en una columna, a lo largo de una fila,
   * o en abanico, como se sostiene una mano -- styles.css
   */
  // su "disposición" es una de apilada, vertical, horizontal o abanico
  static Disposiciones = ["apilada", "vertical", "horizontal", "abanico"] as const
  @prop({ oneOf: () => Pila.Disposiciones })
  accessor disposición!: Disposición

  /** el color y el valor de su última carta:  sobre qué va la siguiente carta */
  get color() {
    if (this.isEmpty) return "ninguno"
    return this.lastItem!.color
  }

  get valor() {
    if (this.isEmpty) return 0
    return this.lastItem!.valor
  }

  /** estado de la pila, para depurar */
  @derived get estado() {
    let estado = `${this.name || "pila"}:`
    this.forEach((carta) => (estado = `${estado} ${carta.estado}`))
    return estado
  }

  static canBeDroppedOn = true

  static exclusive = true
}
export interface Pila {
  canTake(carta: Carta): boolean
  canGiveUp(carta: Carta): boolean
  drawItsPlaceholder(): any /* spell: type unknown */
}

/**
 * `<test-project-pila>`:  a pila, drawn in its own element, e.g. by `draw the pila`.
 * - The page defines its tag with this class:  `core.useElement()`, below.
 * - Its attributes are its pila's properties;  its methods call its pila's.
 * - What every drawable thing's element does, e.g. drawing its pila, is `SpellElement`'s.
 */
export class PilaElement extends SpellElement<Pila> {
  @E.proto static vocabulary = SpellElement.vocabularyFor("test-project-pila", "pila", [
    { name: "name", kind: "string", description: "Its name." },
    { name: "disposición", kind: "string", description: "Its disposición." }
  ])
}
core.useElement(Pila, PilaElement)
// en la página, se le puede soltar una carta encima:  brilla cuando la tomaría, según sus propias reglas

/** una carta está en una sola pila a la vez:  ponerla en otra pila la quita de esta */

core.heading("Pruebas")
/** Pruebas */
export function testLasPilas() {
  return core.test("test las pilas", function testLasPilas() {
    core.echoTestAction(`poner la reserva a una nueva pila con nombre = "reserva"`)
    const reserva = new Pila({ name: "reserva" })
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
    core.echo(reserva.estado)
    core.expect(reserva.color, `el color de la reserva`, "rojo", `rojo`)
    core.expect(reserva.valor, `el valor de la reserva`, 7, `7`)
    core.expect(reserva.estado, `el estado de la reserva`, "reserva: D♠↑ 7♥↓", `"reserva: D♠↑ 7♥↓"`)

    /** una carta solo puede estar en una pila a la vez */
    const descartes = new Pila({ name: "descartes" })

    core.echoTestAction(`obtener la última carta de la reserva`)
    const it = reserva.lastItem
    core.echoTestAction(`agregar eso a los descartes`)
    descartes.append(it!)
    core.expect(it?.pila === descartes, `su pila es los descartes`, true, `sí`)

    core.expect(reserva.length, `el número de cartas en la reserva`, 1, `1`)
    core.expect(descartes.length, `el número de cartas en los descartes`, 1, `1`)
    core.expect(descartes.estado, `el estado de los descartes`, "descartes: 7♥↓", `"descartes: 7♥↓"`)
  })
}
// -----------
core.heading("Solitario Klondike")
////////////////////////
// ## Solitario Klondike
////////////////////////
//-- Mira la [wikipedia](https://en.wikipedia.org/wiki/Klondike_(solitaire)) para sus reglas, y cómo se llama cada pila.
// Las cartas, el mazo y las pilas son los de este proyecto:  Carta, Mazo y Pila.
// Este archivo agrega el juego, sus tipos de pilas, qué puede tomar o soltar cada una, y cómo están sus cartas.
// Qué hay dónde, de arriba abajo:
//   el solitario:  sus pilas, sus movimientos, el juego solo y su dibujo
//   jugar una carta:  qué hace un clic o un arrastre
//   inicio
//   las pilas:  cada tipo, qué puede tomar o soltar, y cómo están sus cartas
//   pruebas

core.heading("El solitario:  sus pilas, sus movimientos, el juego solo y su dibujo")
/** la reserva:  las cartas aún sin jugar, boca abajo;  un clic voltea la siguiente */
export class PilaDeReserva extends Pila {
  static elementTag = core.defineElement(this, "test-project")

  get disposición(): Disposición {
    return "apilada"
  }

  /** un clic voltea su carta:  no se le puede quitar ninguna, así que ninguna se arrastra */
  canTake(carta: Carta) {
    return false
  }

  canGiveUp(carta: Carta) {
    return false
  }

  // vacía:  una carta gris claro, boca abajo -- un clic vuelve a voltear los descartes
  drawItsPlaceholder() {
    return (
      <div part="marcador" onClick={() => solitario.robarDeLaReserva()} style="cursor:pointer;user-select:none">
        🂠
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

  drawItsPlaceholder() {
    return this.currentThing?.drawItsPlaceholder()
  }
}
core.useElement(PilaDeReserva, PilaDeReservaElement)

/** los descartes:  adonde van las cartas de la reserva al voltearse */
export class PilaDeDescartes extends Pila {
  static elementTag = core.defineElement(this, "test-project")

  get disposición(): Disposición {
    return "apilada"
  }

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
export class Fundación extends Pila {
  static elementTag = core.defineElement(this, "test-project")

  get disposición(): Disposición {
    return "apilada"
  }

  // su "palo" es un palo de carta
  @prop({ oneOf: () => Carta.Palos })
  accessor palo!: Palo

  canGiveUp(carta: Carta) {
    return false
  }

  /** una carta a la vez:  la última de su pila */
  canTake(carta: Carta) {
    if (carta !== carta.pila.lastItem) return false
    return this.palo === carta.palo && this.valor + 1 === carta.valor
  }

  // vacía:  un as gris claro de su palo, boca arriba
  drawItsPlaceholder() {
    return (
      <div part="marcador">
        {(new Carta({
          rango: "as",
          palo: this.palo,
          dirección: "arriba"
        })).imagen}
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

  drawItsPlaceholder() {
    return this.currentThing?.drawItsPlaceholder()
  }
}
core.useElement(Fundación, FundaciónElement)

/** una columna:  se arma hacia abajo, del rey al as, rojo y negro alternados */
export class Columna extends Pila {
  static elementTag = core.defineElement(this, "test-project")

  get disposición(): Disposición {
    return "vertical"
  }

  canGiveUp(carta: Carta) {
    return carta.estáBocaDirección("arriba")
  }

  canTake(carta: Carta) {
    if (this.isEmpty) return carta.esUnRango("rey")
    return this.color !== carta.color && this.valor === carta.valor + 1
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

  /** imprime las cartas de cada pila, p. ej. "reserva: D♠↓ 7♥↓" */
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
    const pilasRestantes = core.filter(core.everyThing(Columna), (pila: Columna) => !pila.isEmpty && pila.firstItem?.estáBocaDirección("abajo"))
    if (core.isEmpty(pilasRestantes)) return
    const pila = core.randomItemOf<Columna>(pilasRestantes)
    const cartasOcultas = pila?.filter((carta) => carta.estáBocaDirección("abajo"))
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
      const fundación = core.filter(core.everyThing(Fundación), (pila: Fundación) => pila.palo === candidata.palo).firstItem
      if (core.canTake(fundación!, candidata)) {
        huboCambios = true
        await candidata.jugar()
        await core.pauseFor(100, "msec")
      }
    })

    // las cartas boca arriba de cada columna, todas juntas, a otra columna
    await core.forEachSequential(core.everyThing(Columna), async (pila: Columna) => {
      const cartasVisibles = pila.filter((carta) => carta.estáBocaDirección("arriba"))
      if (cartasVisibles.isEmpty) return
      const candidata = cartasVisibles.firstItem!
      if (candidata.esUnRango("rey") && candidata === pila.firstItem) return
      if (await candidata.jugar()) {
        huboCambios = true
        await core.pauseFor(500, "msec")
      }
    })

    if (huboCambios) await this.jugarSolo()
  }

  // su menú, luego sus pilas:  siete por línea, cada una en su propia celda, la tercera vacía
  // - sus botones son iconos, cada uno con su ayuda:  la ventana emergente justo después de su icono se muestra
  //   al dejar el puntero sobre él
  @drawn draw() {
    return (
      <es-contenedor>
        <es-menu>
          <es-elemento tipo="encabezado">Solitario Klondike</es-elemento>
          <es-elemento>{`Puntos: ${this.puntuación}`}</es-elemento>
          <es-menu posicion="derecha">
            <es-elemento aria-label="Jugar solo" onClick={() => this.jugarSolo()} style="cursor:pointer;user-select:none">
              <es-icono name="fast forward" />
              <es-emergente contenido="Jugar solo" invertido={true} tamano="pequeño" />
            </es-elemento>
            <es-elemento aria-label="Trampa" onClick={() => this.hacerTrampa()} style="cursor:pointer;user-select:none">
              <es-icono name="eye" />
              <es-emergente contenido="Trampa" invertido={true} tamano="pequeño" />
            </es-elemento>
            <es-elemento aria-label="Reiniciar" onClick={() => this.empezarElJuego()} style="cursor:pointer;user-select:none">
              <es-icono name="redo" />
              <es-emergente contenido="Reiniciar" invertido={true} tamano="pequeño" />
            </es-elemento>
          </es-menu>
        </es-menu>
        <es-cuadricula class="Board" columnas="7">
          {core.drawThing(this.reserva)}
          {core.drawThing(this.descartes)}
          <div />
          {core.drawThing(this.tréboles)}
          {core.drawThing(this.diamantes)}
          {core.drawThing(this.corazones)}
          {core.drawThing(this.espadas)}
          {core.drawThing(this.C1)}
          {core.drawThing(this.C2)}
          {core.drawThing(this.C3)}
          {core.drawThing(this.C4)}
          {core.drawThing(this.C5)}
          {core.drawThing(this.C6)}
          {core.drawThing(this.C7)}
        </es-cuadricula>
      </es-contenedor>
    )
  }
}
export const solitario = new Solitario()

core.heading("Jugar una carta:  qué hace un clic o un arrastre")
/** un clic juega la carta;  un arrastre la pone donde se suelta */
on<{ carta: Carta }>("clic-carta", ({ carta }) => carta.jugar())

on<{ carta: Carta; pila: Pila }>("soltar-carta", ({ carta, pila }) => carta.ponerEnPila(pila))

core.heading("Inicio")
//## Inicio
core.console.log(solitario)
solitario.empezarElJuego()
if (!core.isCarryingOver) solitario.start()

core.heading("Las pilas:  cada tipo, qué puede tomar o soltar, y cómo están sus cartas")
//////////////////////////////////////////////////////////////////////////////
// ## Las pilas:  cada tipo, qué puede tomar o soltar, y cómo están sus cartas
//////////////////////////////////////////////////////////////////////////////
// Cada pila es una lista dibujable:  un elemento propio, p. ej. `<solitario-columna>`, alrededor de los elementos de sus cartas.
// Cómo están sus cartas es su disposición:  styles.css dibuja cada una.
// Mientras está vacía, muestra su marcador, si tiene uno.

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
    core.expect(columna.estado, `el estado de la columna`, "C1: R♠↑ D♥↑", `"C1: R♠↑ D♥↑"`)
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
core.installStyles(undefined, `/* File styles.css:  how the board looks -- each card, and how each pile lays its cards out (its disposición).¬   - Every pile and card is an element of its own on the board, so these rules reach them all:¬     - a pile by its disposición, e.g. <solitario-columna disposición="vertical">¬     - each card in it by its place, --index from 0, and how many there are, --count:  the pile numbers them¬     - an empty pile's placeholder, its marcador, which it draws itself, by its part:  ::part(marcador)¬   - A card is one letter of unicode's Playing Cards, at its pile's width:¬     so a card is as wide as its column, whatever the window's width. */¬¬/* A card's picture, in ems of its own letter (measured in Chrome on a Mac):¬   0.604em wide, 0.805em tall, its left edge 0.049em into the letter;  its outline reaches a little past that, so a¬   card keeps 0.008em to spare above and below. */¬:root,¬:host {¬  /* how wide a card is, for each em of its letter */¬  --card-width: 0.604;¬  /* how tall it is, for each of its widths:  (0.805 + 2 x 0.008) / 0.604 */¬  --card-height: 1.359;¬  /* down a column, how much of each card shows under the next:  a fifth of it, its rank and suit */¬  --card-step-down: 0.2;¬  /* along a row, how much of each card the next one covers:  a tenth of it */¬  --card-overlap: 0.1;¬  /* fanned, how far each card turns from the one before */¬  --card-turn: 8deg;¬}¬¬/****************¬ * The board:  below the game's menu, its piles seven to a line¬ ****************/¬¬.Board {¬  /* gutters that shrink with a narrow window, so the cards keep most of its width */¬  --ui-grid-gutter: min(2rem, 2.5vw);¬  --ui-grid-row-spacing: min(2rem, 4vw);¬  /* 1.5rem below the menu:  the grid pulls itself up by half a row's spacing */¬  margin-top: calc(1.5rem + var(--ui-grid-row-spacing) / 2);¬}¬¬/* A narrow window, a phone's:  the menu loses its title, so the score and buttons fit on one line */¬@media (width < 36rem) {¬  es-elemento[tipo="encabezado"] {¬    display: none;¬  }¬}¬¬/****************¬ * A pile:  as wide as its cell of the board, and as tall as its cards¬ ****************/¬¬[disposición] {¬  display: block;¬  position: relative;¬  /* its cards size themselves by its width */¬  container-type: inline-size;¬}¬/* its height:  a card's, by default -- a percentage of padding is one of its width */¬[disposición]::before {¬  content: "";¬  display: block;¬  padding-top: calc(100% * var(--card-height));¬}¬¬/* Each card, and the placeholder:  a card's letter as wide as the pile, cut to the card it draws */¬[disposición] > *,¬[disposición]::part(marcador) {¬  position: absolute;¬  top: 0;¬  /* where its pile's content starts, inside the cell's gutters */¬  left: auto;¬  font-size: calc(100cqi / var(--card-width));¬  width: calc(var(--card-width) * 1em);¬  height: calc(var(--card-width) * var(--card-height) * 1em);¬  overflow: hidden;¬  /* its letter's ink starts 0.224em below a line's top at a line height of 1:  a line of 0.568 starts it 0.008em down */¬  line-height: 0.568;¬  --ui-text-line-height: 0.568;¬  text-indent: -0.049em;¬  user-select: none;¬}¬/* a card's letter is only its ink:  a white face, its corners rounded as the letter's are, hides the cards below */¬[disposición] > * {¬  background: #fff;¬  border-radius: 0.035em;¬}¬¬/* An empty pile's placeholder:  a light grey card */¬[disposición]::part(marcador) {¬  color: #000;¬  opacity: 0.15;¬}¬[disposición]::part(marcador):hover {¬  opacity: 0.25;¬}¬¬/****************¬ * The layouts:  apilada (stacked) puts every card on top of the one before¬ ****************/¬¬/* vertical:  each card a step below the one before */¬[disposición="vertical"]::before {¬  padding-top: calc(100% * var(--card-height) * (1 + (max(var(--count, 1), 1) - 1) * var(--card-step-down)));¬}¬[disposición="vertical"] > * {¬  top: calc(var(--index) * var(--card-width) * var(--card-height) * 1em * var(--card-step-down));¬}¬¬/* horizontal:  side by side, each covering the edge of the one before;  smaller as there are more, to fit the pile */¬[disposición="horizontal"] {¬  --spread: calc(1 + (max(var(--count, 1), 1) - 1) * (1 - var(--card-overlap)));¬}¬[disposición="horizontal"]::before {¬  padding-top: calc(100% * var(--card-height) / var(--spread));¬}¬[disposición="horizontal"] > * {¬  font-size: calc(100cqi / var(--card-width) / var(--spread));¬  margin-left: calc(var(--index) * var(--card-width) * 1em * (1 - var(--card-overlap)));¬}¬¬/* abanico (fanned):  as a hand of cards is held, each turned a little from the one before, around a point below them */¬[disposición="abanico"] > * {¬  font-size: calc(60cqi / var(--card-width));¬  left: calc(50% - var(--card-width) * 0.5em);¬  top: 10%;¬  transform-origin: 50% 200%;¬  rotate: calc((var(--index) - (var(--count) - 1) / 2) * var(--card-turn));¬}¬`)
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
