import { core, Thing, List, App, Drawable, DrawableList, prop, derived, positionOf, spellPosition, trigger } from "@spell/core"

core.heading("definición de una Carta con alias en español para trabajar con ella")
export type Rango = (typeof Carta.Rangos)[number]
export type Palo = (typeof Carta.Palos)[number]
export type Dirección = (typeof Carta.Direcciones)[number]

/** definición de una Carta con alias en español para trabajar con ella */
export class Carta extends Thing {
  ///////////////////////////////
  // ## propiedades de las cartas
  ///////////////////////////////
  /** rangos de cartas */
  // las cartas tienen un rango como uno de as, 2, 3, 4, 5, 6, 7, 8, 9, 10, jota, reina o rey
  static Rangos = ["as", 2, 3, 4, 5, 6, 7, 8, 9, 10, "jota", "reina", "rey"] as const
  @prop({ oneOf: () => Carta.Rangos })
  accessor rango!: Rango

  /** palos de cartas */
  // las cartas tienen un palo como uno de tréboles, diamantes, corazones o espadas
  static Palos = ["tréboles", "diamantes", "corazones", "espadas"] as const
  @prop({ oneOf: () => Carta.Palos })
  accessor palo!: Palo

  /** color como derivación del palo */
  get color() {
    if (core.includes(["diamantes", "corazones"], this.palo)) return "rojo"
    return "negro"
  }

  /** valor como derivación del rango */
  get valor() {
    return spellPosition(positionOf(Carta.Rangos, this.rango))
  }

  /** dirección de la carta:  arriba o abajo */
  // una carta tiene una dirección como o bien arriba o abajo
  static Direcciones = ["arriba", "abajo"] as const
  @prop({ oneOf: () => Carta.Direcciones })
  accessor dirección!: Dirección

  ///////////
  // ## alias
  ///////////
  /** "la carta está boca arriba / abajo" */
  get estáBocaArriba() {
    return this.dirección == "arriba"
  }

  get estáBocaAbajo() {
    return this.dirección == "abajo"
  }

  /** "la carta es una figura" */
  get esUnaFigura() {
    return core.includes(["jota", "reina", "rey"], this.rango)
  }

  /** "la carta es una espada", "... es un trébol" ... */
  esUnPalo(palo: Palo) {
    return this.palo === palo
  }

  /** "la carta es una reina", "... es un as" ... */
  esUnRango(rango: Rango) {
    return this.rango === rango
  }

  /** "la carta es la reina de espadas" ... */
  esElRangoDePalos(rango: Rango, palo: Palo) {
    return this.rango === rango && this.palo === palo
  }

  /** nombre como derivación de rango y palo */
  get nombre() {
    return `${this.rango}-de-${this.palo}`
  }

  get paloCorto() {
    if (this.esUnPalo("tréboles")) return "♣️"
    if (this.esUnPalo("diamantes")) return "♦️"
    if (this.esUnPalo("corazones")) return "♥️"
    if (this.esUnPalo("espadas")) return "♠️"
    return "?"
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

  //## acciones

  /**
   * Voltear la carta boca arriba o boca abajo
   * Se anima si haces `esperar a voltear la carta boca arriba`
   */
  async voltearBocaArriba() {
    this.dirección = "arriba"
    await core.pauseFor(50, "msec")
  }

  async voltearBocaAbajo() {
    this.dirección = "abajo"
    await core.pauseFor(50, "msec")
  }

  /** Darle la vuelta a la carta */
  async darLaVueltaACarta() {
    if (this.dirección == "arriba") this.voltearBocaAbajo()
    else this.voltearBocaArriba()
    await core.pauseFor(50, "msec")
  }

  dibujar() {
    const className = `Card face-${this.dirección} ${this.rango} ${this.palo} ui button compact fluid `
    if (this.estáBocaAbajo) {
      return (
        <div class={className} onClick={() => trigger("card-click", { card: this })}>
          <i class="fitted bicycle icon" />
        </div>
      )
    }
    return (
      <div class={className + this.color} onClick={() => trigger("card-click", { card: this })}>
        {`${this.rangoCorto} `}
        <span class="suit">{this.paloCorto}</span>
      </div>
    )
  }

  get pila() {
    return Pila.ownerOf(this)!
  }
}

core.heading("una carta con sus propiedades")
/** una carta con sus propiedades */
export function testLaCarta() {
  return core.test("test la carta", function testLaCarta() {
    core.echoTestAction(`la carta es una nueva carta cuyo rango es reina, palo es espadas y dirección es arriba`)
    const carta = new Carta({
      rango: "reina",
      palo: "espadas",
      dirección: "arriba"
    })
    core.echo(carta)
    core.expect(carta.rango, `el rango de la carta`, "reina", `reina`)
    core.expect(carta.palo, `el palo de la carta`, "espadas", `espadas`)
    core.expect(carta.nombre, `el nombre de la carta`, "reina-de-espadas", `"reina-de-espadas"`)
    core.expect(carta.color, `el color de la carta`, "negro", `negro`)
    core.expect(carta.valor, `el valor de la carta`, 12, `12`)
    core.expect(carta.paloCorto, `el palo corto de la carta`, "♠️", `"♠️"`)
    core.expect(carta.rangoCorto, `el rango corto de la carta`, "R", `"R"`)
    core.expect(carta.nombreCorto, `el nombre corto de la carta`, "R♠️", `"R♠️"`)

    core.expect(carta.estáBocaArriba, `la carta está boca arriba`, true, `sí`)
    core.expect(carta.estáBocaAbajo, `la carta está boca abajo`, false, `no`)

    core.expect(carta.esUnaFigura, `la carta es una figura`, true, `sí`)
    core.expect(!carta.esUnaFigura, `la carta no es una figura`, false, `falso`)

    core.expect(carta.esUnPalo("espadas"), `la carta es una espada`, true, `verdadero`)
    core.expect(carta.esUnPalo("tréboles"), `la carta es un trébol`, false, `falso`)

    core.expect(carta.esUnRango("reina"), `la carta es una reina`, true, `verdadero`)
    core.expect(carta.esUnRango("as"), `la carta es un as`, false, `falso`)
    core.expect(carta.esUnRango(2), `la carta es un 2`, false, `falso`)

    core.expect(carta.esElRangoDePalos("reina", "espadas"), `la carta es la reina de espadas`, true, `verdadero`)
    core.expect(carta.esElRangoDePalos("reina", "tréboles"), `la carta es la reina de tréboles`, false, `falso`)
    core.expect(!carta.esElRangoDePalos(2, "diamantes"), `la carta no es el 2 de diamantes`, true, `verdadero`)

    core.echoTestAction(`voltear la carta boca abajo`)
    carta.voltearBocaAbajo()
    core.expect(carta.dirección, `la dirección de la carta`, "abajo", `abajo`)

    core.echoTestAction(`dar la vuelta a la carta`)
    carta.darLaVueltaACarta()
    core.expect(carta.estáBocaArriba, `la carta está boca arriba`, true, `verdadero`)
  })
}
if (!core.isCarryingOver) testLaCarta()
// -----------
core.heading("Mazo:   baraja estándar de EE. UU. (por ahora sin comodines)")
//## Mazo:   baraja estándar de EE. UU. (por ahora sin comodines)

export class Mazo extends List<Carta> {
  static instanceType = Carta

  preparar() {
    if (this.estáPreparado) return
    Carta.Rangos.forEach((rango) => Carta.Palos.forEach((palo) => {
      const carta = new Carta({ rango: rango, palo: palo })
      this.append(carta)
    }))
    this.estáPreparado = true
  }

  mostrar() {
    const nombresDeCartas = new List()
    this.forEach((carta) => nombresDeCartas.append(carta.nombreCorto))
    core.echo(`mazo: ${nombresDeCartas}`)
  }

  // poner el está-preparado del mazo a sí
  @prop({ type: "choice" })
  accessor estáPreparado!: boolean
}

export function testLaCreaciónDelMazo() {
  return core.test("test la creación del mazo", function testLaCreaciónDelMazo() {
    core.echoTestAction(`el mazo es un nuevo mazo`)
    const mazo = new Mazo()
    core.echoTestAction(`preparar el mazo`)
    mazo.preparar()
    core.expect(mazo.length, `el número de cartas en el mazo`, 52, `52`)
    core.echoTestAction(`preparar el mazo`)
    mazo.preparar()
    core.expect(mazo.length, `el número de cartas en el mazo`, 52, `52`)
    core.echoTestAction(`poner las reinas a las cartas en el mazo donde el rango de la carta es "reina"`)
    const reinas = mazo.filter((carta) => carta.rango == "reina")
    core.expect(reinas.length, `el número de cartas en las reinas`, 4, `4`)
    core.expect(mazo.lastItem?.nombre!, `el nombre de la carta de abajo del mazo`, "rey-de-espadas", `"rey-de-espadas"`)
    core.expect(mazo.firstItem?.nombreCorto!, `el nombre corto de la carta de arriba del mazo`, "A♣️", `"A♣️"`)

    core.echo("el mazo antes de barajar:")
    core.echoTestAction(`mostrar el mazo`)
    mazo.mostrar()
    core.expect(mazo.firstItem?.esElRangoDePalos("as", "tréboles")!, `la primera carta del mazo es el as de tréboles`, true, `sí`)
  })
}
if (!core.isCarryingOver) testLaCreaciónDelMazo()
// -----------
core.heading("Pila de cartas")
/** Pila de cartas */
export class Pila extends List<Carta> {
  static instanceType = Carta

  get color() {
    if (this.isEmpty) return "ninguno"
    return this.lastItem!.color
  }

  get valor() {
    if (this.isEmpty) return 0
    return this.lastItem!.valor
  }

  @derived get estado() {
    let estado = `${this.name || "pila"}:`
    this.forEach((carta) => (estado = `${estado} ${carta.estado}`))
    return estado
  }

  static exclusive = true
}
/** una carta está en una sola pila a la vez:  ponerla en otra pila la quita de esta */
