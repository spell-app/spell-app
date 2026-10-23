import { core, Thing, List, App, Drawable, DrawableList, h, positionOf, spellPosition, position, trigger, on } from "@spell/core"

core.heading("Una carta de la baraja -- en el estilo de esquema:  su nombre, luego lo que es cierto de ella")
///////////////////////////////////////////////////////////////////////////////////////////////////
// ## Una carta de la baraja -- en el estilo de esquema:  su nombre, luego lo que es cierto de ella
///////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * La carta dice cuáles son sus palos, rangos y colores:  un mazo, una pila o un juego solo los leen.
 * Una cosa dibujable:  cada carta es un elemento propio en la página, p. ej. `<solitario-carta>`.
 */
export class Carta extends Drawable {
  static elementTag = core.defineElement(this, "test-project")

  /** rango de la carta */
  // su "rango" es uno de as, 2 ... 10, jota, dama, rey
  static Rangos = ["as", 2, 3, 4, 5, 6, 7, 8, 9, 10, "jota", "dama", "rey"]
  static { this.declareProp("rango", { oneOf: Carta.Rangos }) }
  get rango() { return this.getProp("rango") }
  set rango(value) { this.setProp("rango", value) }

  /** as = 1 ... rey = 13 */
  get valor() {
    return spellPosition(positionOf(Carta.Rangos, this.rango))
  }

  /** "la carta es un rey" */
  esUnRango(rango) {
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
  static Palos = ["tréboles", "diamantes", "corazones", "espadas"]
  static { this.declareProp("palo", { oneOf: Carta.Palos }) }
  get palo() { return this.getProp("palo") }
  set palo(value) { this.setProp("palo", value) }

  /** "la carta es un diamante" */
  esUnPalo(palo) {
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
  esElRangoDePalo(rango, palo) {
    return this.rango === rango && this.palo === palo
  }

  /** su dirección:  boca arriba o boca abajo */
  // su "dirección" es arriba o abajo
  static Direcciones = ["arriba", "abajo"]
  static { this.declareProp("dirección", { oneOf: Carta.Direcciones }) }
  get dirección() { return this.getProp("dirección") }
  set dirección(value) { this.setProp("dirección", value) }

  /** la carta está boca arriba */
  estáBocaDirección(dirección) {
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
  draw() {
    return h("es-texto", {
      part: "imagen",
      color: () => this.estáBocaDirección("arriba") ? this.color : "azul",
      onClick: () => trigger("clic-carta", { carta: this }),
      style: "cursor:pointer;user-select:none"
    }, () => this.imagen)
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

    const pilaFinal = core.filter(core.everyThing(Pila), (pila) => core.canTake(pila, this)).firstItem
    if (pilaFinal === undefined) return false
    return this.ponerEnPila(pilaFinal)
  }

  /**
   * la carta, y cada carta sobre ella, a la pila, si las reglas de las pilas la dejan ir y tomarla;  dice si se movió
   * - la pila que dejó voltea su nueva última carta, y el movimiento suma puntos
   */
  async ponerEnPila(pila) {
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
    return Pila.ownerOf(this)
  }
}

///////////////////////////////////////////////////////////////////////////////////////////
// ## dibujarla:  su imagen boca arriba, boca abajo el dorso que comparten todas las cartas
///////////////////////////////////////////////////////////////////////////////////////////
// en la página, una carta se puede arrastrar a otra pila:  las reglas de su pila dicen cuáles suelta

core.heading("Pruebas")
/** Un comodín:  una carta salvaje sin rango ni palo -- hay uno rojo y uno negro */
export class Comodín extends Carta {
  static elementTag = core.defineElement(this, "test-project")

  // su "color" es uno de rojo o negro
  static Colores = ["rojo", "negro"]
  static { this.declareProp("color", { oneOf: Comodín.Colores }) }
  get color() { return this.getProp("color") }
  set color(value) { this.setProp("color", value) }

  /** "la carta es el comodín rojo" */
  static esElComodínColor(carta, color) {
    return carta instanceof Comodín && carta.color === color
  }

  get valor() {
    if (Comodín.esElComodínColor(this, "rojo")) return 53
    return 54
  }

  get imagen() {
    return "🃟"
  }

  get nombre() {
    return `comodín ${this.color}`
  }

  get estado() {
    const color = `${core.getItemAt(this.color, 0) ?? ""}`.toLocaleUpperCase()
    const dirección = this.estáBocaDirección("arriba") ? "↑" : "↓"
    return `*${color}${dirección}`
  }
}

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
export class Mazo extends List {
  static instanceType = Carta

  /** sin comodines, a menos que se haga `con comodines` */
  // su "comodines" es sí o no
  static { this.declareProp("comodines", { type: "choice" }) }
  get comodines() { return this.getProp("comodines") }
  set comodines(value) { this.setProp("comodines", value) }

  /** un mazo nuevo tiene una carta de cada, el as de tréboles primero, luego sus dos comodines, el rojo y luego el negro */
  create() {
    Carta.Rangos.forEach((rango) => Carta.Palos.forEach((palo) => this.append(new Carta({ rango: rango, palo: palo }))))
    if (this.comodines) {
      this.append(new Comodín({ color: "rojo" }))
      this.append(new Comodín({ color: "negro" }))
    }
    this.forEach((carta) => carta.voltearBocaAbajo())
  }

  /** muestra los nombres cortos de sus cartas, de arriba abajo */
  get estado() {
    const nombres = new List({ instanceType: "text" })
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
    core.expect(mazo.firstItem?.nombre, `el nombre de la carta de arriba del mazo`, "as de tréboles", `"as de tréboles"`)
    core.expect(mazo.firstItem?.estado, `el estado de la carta de arriba del mazo`, "A♣↓", `"A♣↓"`)
    core.expect(mazo.firstItem?.dirección, `la dirección de la carta de arriba del mazo`, "abajo", `abajo`)
    core.expect(mazo.firstItem?.esElRangoDePalo("as", "tréboles"), `la primera carta del mazo es el as de tréboles`, true, `sí`)

    core.expect(mazo.lastItem?.nombre, `el nombre de la carta de abajo del mazo`, "rey de espadas", `"rey de espadas"`)
    // ¡sin comodines!
    core.expect(mazo.randomItem() instanceof Comodín, `una carta al azar del mazo es un comodín`, false, `no`)
    core.expect(Comodín.esElComodínColor(mazo.randomItem(), "rojo"), `una carta al azar del mazo es el comodín rojo`, false, `no`)

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
    core.expect(mazo.firstItem?.esElRangoDePalo("as", "tréboles"), `la primera carta del mazo es el as de tréboles`, true, `sí`)
    // la última carta debería ser el comodín negro
    core.expect(Comodín.esElComodínColor(mazo.lastItem, "negro"), `la última carta del mazo es el comodín negro`, true, `sí`)
    core.expect(mazo.lastItem?.nombre, `el nombre de la carta de abajo del mazo`, "comodín negro", `"comodín negro"`)
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
export class Pila extends DrawableList {
  static instanceType = Carta
  static elementTag = core.defineElement(this, "test-project")

  /** cómo la llama el juego, p. ej. "reserva" */
  // su "nombre" es texto
  static { this.declareProp("name", { type: "text" }) }
  get name() { return this.getProp("name") }
  set name(value) { this.setProp("name", value) }

  /**
   * cómo están sus cartas:  una sobre otra, hacia abajo en una columna, a lo largo de una fila,
   * o en abanico, como se sostiene una mano -- styles.css
   */
  // su "disposición" es una de apilada, vertical, horizontal o abanico
  static Disposiciones = ["apilada", "vertical", "horizontal", "abanico"]
  static { this.declareProp("disposición", { oneOf: Pila.Disposiciones }) }
  get disposición() { return this.getProp("disposición") }
  set disposición(value) { this.setProp("disposición", value) }

  /** el color y el valor de su última carta:  sobre qué va la siguiente carta */
  get color() {
    if (this.isEmpty) return "ninguno"
    return this.lastItem.color
  }

  get valor() {
    if (this.isEmpty) return 0
    return this.lastItem.valor
  }

  /** estado de la pila, para depurar */
  get estado() {
    let estado = `${this.name || "pila"}:`
    this.forEach((carta) => (estado = `${estado} ${carta.estado}`))
    return estado
  }

  static canBeDroppedOn = true

  static exclusive = true
}
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
    descartes.append(it)
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

  get disposición() {
    return "apilada"
  }

  /** un clic voltea su carta:  no se le puede quitar ninguna, así que ninguna se arrastra */
  canTake(carta) {
    return false
  }

  canGiveUp(carta) {
    return false
  }

  // vacía:  una carta gris claro, boca abajo -- un clic vuelve a voltear los descartes
  drawItsPlaceholder() {
    return h("div", {
      part: "marcador",
      onClick: () => solitario.robarDeLaReserva(),
      style: "cursor:pointer;user-select:none"
    }, "🂠")
  }
}

/** los descartes:  adonde van las cartas de la reserva al voltearse */
export class PilaDeDescartes extends Pila {
  static elementTag = core.defineElement(this, "test-project")

  get disposición() {
    return "apilada"
  }

  canTake(carta) {
    return false
  }

  canGiveUp(carta) {
    return carta === this.lastItem
  }
}

/** una fundación:  donde se arma un palo, del as al rey */
export class Fundación extends Pila {
  static elementTag = core.defineElement(this, "test-project")

  get disposición() {
    return "apilada"
  }

  // su "palo" es un palo de carta
  static { this.declareProp("palo", { oneOf: () => Carta.Palos }) }
  get palo() { return this.getProp("palo") }
  set palo(value) { this.setProp("palo", value) }

  canGiveUp(carta) {
    return false
  }

  /** una carta a la vez:  la última de su pila */
  canTake(carta) {
    if (carta !== carta.pila.lastItem) return false
    return this.palo === carta.palo && this.valor + 1 === carta.valor
  }

  // vacía:  un as gris claro de su palo, boca arriba
  drawItsPlaceholder() {
    return h("div", { part: "marcador" },
      () => (new Carta({
        rango: "as",
        palo: this.palo,
        dirección: "arriba"
      })).imagen
    )
  }
}

/** una columna:  se arma hacia abajo, del rey al as, rojo y negro alternados */
export class Columna extends Pila {
  static elementTag = core.defineElement(this, "test-project")

  get disposición() {
    return "vertical"
  }

  canGiveUp(carta) {
    return carta.estáBocaDirección("arriba")
  }

  canTake(carta) {
    if (this.isEmpty) return carta.esUnRango("rey")
    return this.color !== carta.color && this.valor === carta.valor + 1
  }
}

/** El solitario:  sus pilas, sus movimientos, el juego solo y su dibujo */
export class Solitario extends App {
  // su "puntuación" es un número
  static { this.declareProp("puntuación", { type: "number" }) }
  get puntuación() { return this.getProp("puntuación") }
  set puntuación(value) { this.setProp("puntuación", value) }

  // su "mazo" es un nuevo mazo
  static { this.declareProp("mazo", { init: () => new Mazo(), early: true }) }
  get mazo() { return this.getProp("mazo") }
  set mazo(value) { this.setProp("mazo", value) }

  /** una de cada pila, hecha con el solitario */
  // su "reserva" es una nueva pila de reserva con nombre = "reserva"
  static { this.declareProp("reserva", { init: () => new PilaDeReserva({ name: "reserva" }), early: true }) }
  get reserva() { return this.getProp("reserva") }
  set reserva(value) { this.setProp("reserva", value) }

  // sus "descartes" es una nueva pila de descartes con nombre = "descartes"
  static { this.declareProp("descartes", { init: () => new PilaDeDescartes({ name: "descartes" }), early: true }) }
  get descartes() { return this.getProp("descartes") }
  set descartes(value) { this.setProp("descartes", value) }

  // sus "tréboles" es una nueva fundación con nombre = "tréboles", palo = tréboles
  static { this.declareProp("tréboles", { init: () => new Fundación({ name: "tréboles", palo: "tréboles" }), early: true }) }
  get tréboles() { return this.getProp("tréboles") }
  set tréboles(value) { this.setProp("tréboles", value) }

  // sus "diamantes" es una nueva fundación con nombre = "diamantes", palo = diamantes
  static { this.declareProp("diamantes", { init: () => new Fundación({ name: "diamantes", palo: "diamantes" }), early: true }) }
  get diamantes() { return this.getProp("diamantes") }
  set diamantes(value) { this.setProp("diamantes", value) }

  // sus "corazones" es una nueva fundación con nombre = "corazones", palo = corazones
  static { this.declareProp("corazones", { init: () => new Fundación({ name: "corazones", palo: "corazones" }), early: true }) }
  get corazones() { return this.getProp("corazones") }
  set corazones(value) { this.setProp("corazones", value) }

  // sus "espadas" es una nueva fundación con nombre = "espadas", palo = espadas
  static { this.declareProp("espadas", { init: () => new Fundación({ name: "espadas", palo: "espadas" }), early: true }) }
  get espadas() { return this.getProp("espadas") }
  set espadas(value) { this.setProp("espadas", value) }

  // su "C1" es una nueva columna con nombre = "C1"
  static { this.declareProp("C1", { init: () => new Columna({ name: "C1" }), early: true }) }
  get C1() { return this.getProp("C1") }
  set C1(value) { this.setProp("C1", value) }

  // su "C2" es una nueva columna con nombre = "C2"
  static { this.declareProp("C2", { init: () => new Columna({ name: "C2" }), early: true }) }
  get C2() { return this.getProp("C2") }
  set C2(value) { this.setProp("C2", value) }

  // su "C3" es una nueva columna con nombre = "C3"
  static { this.declareProp("C3", { init: () => new Columna({ name: "C3" }), early: true }) }
  get C3() { return this.getProp("C3") }
  set C3(value) { this.setProp("C3", value) }

  // su "C4" es una nueva columna con nombre = "C4"
  static { this.declareProp("C4", { init: () => new Columna({ name: "C4" }), early: true }) }
  get C4() { return this.getProp("C4") }
  set C4(value) { this.setProp("C4", value) }

  // su "C5" es una nueva columna con nombre = "C5"
  static { this.declareProp("C5", { init: () => new Columna({ name: "C5" }), early: true }) }
  get C5() { return this.getProp("C5") }
  set C5(value) { this.setProp("C5", value) }

  // su "C6" es una nueva columna con nombre = "C6"
  static { this.declareProp("C6", { init: () => new Columna({ name: "C6" }), early: true }) }
  get C6() { return this.getProp("C6") }
  set C6(value) { this.setProp("C6", value) }

  // su "C7" es una nueva columna con nombre = "C7"
  static { this.declareProp("C7", { init: () => new Columna({ name: "C7" }), early: true }) }
  get C7() { return this.getProp("C7") }
  set C7(value) { this.setProp("C7", value) }

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
    core.map(core.everyThing(Pila), (pila) => core.console.log(pila.estado))
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
      this.descartes.append(it)
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
          core.getItemAt(core.everyThing(Columna), position(lugar))?.append(this.reserva.lastItem)
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
    const pilasRestantes = core.filter(core.everyThing(Columna), (pila) => !pila.isEmpty && pila.firstItem?.estáBocaDirección("abajo"))
    if (core.isEmpty(pilasRestantes)) return
    const pila = core.randomItemOf(pilasRestantes)
    const cartasOcultas = pila?.filter((carta) => carta.estáBocaDirección("abajo"))
    const carta = cartasOcultas?.randomItem()
    carta?.voltearBocaArriba()
    await core.pauseFor(30, "ticks")
    this.descartes.append(carta)
  }

  /** juega cada carta que puede ir a algún lado, hasta que ninguna pueda */
  async jugarSolo() {
    let huboCambios = false
    if (!this.descartes.isEmpty) {
      const candidata = this.descartes.lastItem
      if (await candidata?.jugar()) {
        huboCambios = true
        await core.pauseFor(500, "msec")
      }
    }

    // la última carta de cada columna a su fundación
    await core.forEachSequential(core.everyThing(Columna), async (pila) => {
      if (pila.isEmpty) return
      const candidata = pila.lastItem
      const fundación = core.filter(core.everyThing(Fundación), (pila) => pila.palo === candidata.palo).firstItem
      if (core.canTake(fundación, candidata)) {
        huboCambios = true
        await candidata.jugar()
        await core.pauseFor(100, "msec")
      }
    })

    // las cartas boca arriba de cada columna, todas juntas, a otra columna
    await core.forEachSequential(core.everyThing(Columna), async (pila) => {
      const cartasVisibles = pila.filter((carta) => carta.estáBocaDirección("arriba"))
      if (cartasVisibles.isEmpty) return
      const candidata = cartasVisibles.firstItem
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
  draw() {
    return h("es-contenedor",
      h("es-menu",
        h("es-elemento", { tipo: "encabezado" }, "Solitario Klondike"),
        h("es-elemento", () => `Puntos: ${this.puntuación}`),
        h("es-menu", { posicion: "derecha" },
          h("es-elemento", {
            "aria-label": "Jugar solo",
            onClick: () => this.jugarSolo(),
            style: "cursor:pointer;user-select:none"
          },
            h("es-icono", { name: "fast forward" }),
            h("es-emergente", { contenido: "Jugar solo", invertido: true, tamano: "pequeño" })
          ),
          h("es-elemento", { "aria-label": "Trampa", onClick: () => this.hacerTrampa(), style: "cursor:pointer;user-select:none" },
            h("es-icono", { name: "eye" }),
            h("es-emergente", { contenido: "Trampa", invertido: true, tamano: "pequeño" })
          ),
          h("es-elemento", {
            "aria-label": "Reiniciar",
            onClick: () => this.empezarElJuego(),
            style: "cursor:pointer;user-select:none"
          },
            h("es-icono", { name: "redo" }),
            h("es-emergente", { contenido: "Reiniciar", invertido: true, tamano: "pequeño" })
          )
        )
      ),
      h("es-cuadricula", { class: "Board", columnas: "7" },
        () => core.drawThing(this.reserva),
        () => core.drawThing(this.descartes),
        h("div"),
        () => core.drawThing(this.tréboles),
        () => core.drawThing(this.diamantes),
        () => core.drawThing(this.corazones),
        () => core.drawThing(this.espadas),
        () => core.drawThing(this.C1),
        () => core.drawThing(this.C2),
        () => core.drawThing(this.C3),
        () => core.drawThing(this.C4),
        () => core.drawThing(this.C5),
        () => core.drawThing(this.C6),
        () => core.drawThing(this.C7)
      )
    )
  }
}
export const solitario = new Solitario()

core.heading("Jugar una carta:  qué hace un clic o un arrastre")
/** un clic juega la carta;  un arrastre la pone donde se suelta */
on("clic-carta", (event) => {
  const { carta } = event
  carta.jugar()
})

on("soltar-carta", (event) => {
  const { carta, pila } = event
  carta.ponerEnPila(pila)
})

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
core.installStyles(undefined, `/* File styles.css:  how the board looks -- each card, and how each pile lays its cards out (its disposición).¬   - Every pile and card is an element of its own on the board, so these rules reach them all:¬     - a pile by its disposición, e.g. <solitario-columna disposición="vertical">¬     - each card in it by its place, --index from 0, and how many there are, --count:  the pile numbers them¬     - an empty pile's placeholder, its marcador, which it draws itself, by its part:  ::part(marcador)¬   - A card is one letter of unicode's Playing Cards, at its pile's width:¬     so a card is as wide as its column, whatever the window's width. */¬¬/* A card's picture, in ems of its own letter (measured in Chrome on a Mac):¬   0.604em wide, 0.805em tall, its left edge 0.049em into the letter. */¬:root,¬:host {¬  /* how wide a card is, for each em of its letter */¬  --card-width: 0.604;¬  /* how tall it is, for each of its widths:  0.805 / 0.604 */¬  --card-height: 1.333;¬  /* down a column, how much of each card shows under the next:  a fifth of it, its rank and suit */¬  --card-step-down: 0.2;¬  /* along a row, how much of each card the next one covers:  a tenth of it */¬  --card-overlap: 0.1;¬  /* fanned, how far each card turns from the one before */¬  --card-turn: 8deg;¬}¬¬/****************¬ * The board:  below the game's menu, its piles seven to a line¬ ****************/¬¬.Board {¬  /* gutters that shrink with a narrow window, so the cards keep most of its width */¬  --ui-grid-gutter: min(2rem, 2.5vw);¬  --ui-grid-row-spacing: min(2rem, 4vw);¬  /* 1.5rem below the menu:  the grid pulls itself up by half a row's spacing */¬  margin-top: calc(1.5rem + var(--ui-grid-row-spacing) / 2);¬}¬¬/* A narrow window, a phone's:  the menu loses its title, so the score and buttons fit on one line */¬@media (width < 36rem) {¬  es-elemento[tipo="encabezado"] {¬    display: none;¬  }¬}¬¬/****************¬ * A pile:  as wide as its cell of the board, and as tall as its cards¬ ****************/¬¬[disposición] {¬  display: block;¬  position: relative;¬  /* its cards size themselves by its width */¬  container-type: inline-size;¬}¬/* its height:  a card's, by default -- a percentage of padding is one of its width */¬[disposición]::before {¬  content: "";¬  display: block;¬  padding-top: calc(100% * var(--card-height));¬}¬¬/* Each card, and the placeholder:  a card's letter as wide as the pile, cut to the card it draws */¬[disposición] > *,¬[disposición]::part(marcador) {¬  position: absolute;¬  top: 0;¬  /* where its pile's content starts, inside the cell's gutters */¬  left: auto;¬  font-size: calc(100cqi / var(--card-width));¬  width: calc(var(--card-width) * 1em);¬  height: calc(var(--card-width) * var(--card-height) * 1em);¬  overflow: hidden;¬  /* its letter's ink starts 0.224em below a line's top at a line height of 1:  a line of 0.552 starts it at the top */¬  line-height: 0.552;¬  --ui-text-line-height: 0.552;¬  text-indent: -0.049em;¬  user-select: none;¬}¬/* a card's letter is only its ink:  a white face, its corners rounded as the letter's are, hides the cards below */¬[disposición] > * {¬  background: #fff;¬  border-radius: 0.035em;¬}¬¬/* An empty pile's placeholder:  a light grey card */¬[disposición]::part(marcador) {¬  color: #000;¬  opacity: 0.15;¬}¬[disposición]::part(marcador):hover {¬  opacity: 0.25;¬}¬¬/****************¬ * The layouts:  apilada (stacked) puts every card on top of the one before¬ ****************/¬¬/* vertical:  each card a step below the one before */¬[disposición="vertical"]::before {¬  padding-top: calc(100% * var(--card-height) * (1 + (max(var(--count, 1), 1) - 1) * var(--card-step-down)));¬}¬[disposición="vertical"] > * {¬  top: calc(var(--index) * var(--card-width) * var(--card-height) * 1em * var(--card-step-down));¬}¬¬/* horizontal:  side by side, each covering the edge of the one before;  smaller as there are more, to fit the pile */¬[disposición="horizontal"] {¬  --spread: calc(1 + (max(var(--count, 1), 1) - 1) * (1 - var(--card-overlap)));¬}¬[disposición="horizontal"]::before {¬  padding-top: calc(100% * var(--card-height) / var(--spread));¬}¬[disposición="horizontal"] > * {¬  font-size: calc(100cqi / var(--card-width) / var(--spread));¬  margin-left: calc(var(--index) * var(--card-width) * 1em * (1 - var(--card-overlap)));¬}¬¬/* abanico (fanned):  as a hand of cards is held, each turned a little from the one before, around a point below them */¬[disposición="abanico"] > * {¬  font-size: calc(60cqi / var(--card-width));¬  left: calc(50% - var(--card-width) * 0.5em);¬  top: 10%;¬  transform-origin: 50% 200%;¬  rotate: calc((var(--index) - (var(--count) - 1) / 2) * var(--card-turn));¬}¬`)
// -----------
if (!core.isCarryingOver) testLaPreparaciónDeLaCarta()
if (!core.isCarryingOver) testLosComodines()
if (!core.isCarryingOver) testLaCreaciónDelMazo()
if (!core.isCarryingOver) testElMazoConComodines()
if (!core.isCarryingOver) testLasPilas()
if (!core.isCarryingOver) testLosMovimientos()
