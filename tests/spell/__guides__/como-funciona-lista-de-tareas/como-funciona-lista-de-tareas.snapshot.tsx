import { core, Thing, List, App, Drawable, DrawableList, prop, derived, drawn } from "@spell/core"
import { E, SpellElement } from "@spell/elements"

core.heading("Cómo funciona Lista de tareas")
///////////////////////////////////
// ## Cómo funciona Lista de tareas
///////////////////////////////////
// El ejemplo Lista de tareas es una lista de cosas por hacer:  escribe una tarea, márcala cuando esté hecha,
// y elige si ver todas, solo las pendientes, o solo las hechas.
// Está escrito en español:  cada línea de código también.
// Tres ideas hacen el trabajo:
// - cada tarea es una COSA propia, que se dibuja como una fila con una casilla
// - la lista elige tareas con "donde":  "tareas en sus tareas donde está pendiente"
// - la lista dibuja cada tarea, o la salta, según dice su filtro
//
// Esta guía tiene esas tres, sin arrastrar, seleccionar ni el editor de propiedades.
// Abre Lista de tareas, en los Ejemplos, para verlo todo.  Task List es la misma lista, en inglés.

core.heading("Una tarea")
/** Una tarea */
export class Tarea extends Drawable {
  static elementTag = core.defineElement(this, "test-project")

  // su "título" es texto
  @prop({ type: "text" })
  accessor título!: string

  // su "hecha" es sí o no
  @prop({ type: "choice" })
  accessor hecha!: boolean

  get estáHecha() {
    return this.hecha
  }

  get estáPendiente() {
    return !this.hecha
  }

  // un formulario propio, unido a la tarea:  marcar la casilla cambia su "hecha"
  @drawn draw() {
    return (
      <es-formulario value={this}>
        <div part="row">
          <es-casilla name="hecha" aria-label="Hecha" />
          <span part="title">{this.título}</span>
        </div>
      </es-formulario>
    )
  }

  get agenda() {
    return Agenda.ownerOf(this)!
  }
}

/**
 * `<test-project-tarea>`:  a tarea, drawn in its own element, e.g. by `draw the tarea`.
 * - The page defines its tag with this class:  `core.useElement()`, below.
 * - Its attributes are its tarea's properties;  its methods call its tarea's.
 * - What every drawable thing's element does, e.g. drawing its tarea, is `SpellElement`'s.
 */
export class TareaElement extends SpellElement<Tarea> {
  @E.proto static vocabulary = SpellElement.vocabularyFor("test-project-tarea", "tarea", [
    { name: "título", kind: "string", description: "Its título." },
    { name: "hecha", kind: "boolean", description: "Its hecha." }
  ])
}
core.useElement(Tarea, TareaElement)

core.heading("La agenda:  las tareas, mostradas según su filtro")
export type Mostrando = (typeof Agenda.Mostrandos)[number]

/** La agenda:  las tareas, mostradas según su filtro */
export class Agenda extends DrawableList<Tarea> {
  static instanceType = Tarea
  static elementTag = core.defineElement(this, "test-project")

  /** lo que muestra:  todas las tareas, las pendientes, o las hechas */
  // su "mostrando" es una de todas, pendientes o hechas
  static Mostrandos = ["todas", "pendientes", "hechas"] as const
  @prop({ oneOf: () => Agenda.Mostrandos })
  accessor mostrando!: Mostrando

  // cada tarea, salvo que el filtro la oculte:  "devolver nada" no dibuja nada
  drawEachItem(item: Tarea) {
    if (this.mostrando === "pendientes" && item.estáHecha) return undefined
    if (this.mostrando === "hechas" && item.estáPendiente) return undefined
    return core.drawThing(item)
  }

  static exclusive = true
}

/**
 * `<test-project-agenda>`:  an agenda, drawn in its own element, e.g. by `draw the agenda`.
 * - The page defines its tag with this class:  `core.useElement()`, below.
 * - Its attributes are its agenda's properties;  its methods call its agenda's.
 * - What every drawable thing's element does, e.g. drawing its agenda, is `SpellElement`'s.
 */
export class AgendaElement extends SpellElement<Agenda> {
  @E.proto static vocabulary = SpellElement.vocabularyFor("test-project-agenda", "agenda", [
    { name: "mostrando", kind: "string", description: "Its mostrando." }
  ])

  drawEachItem(item: Tarea) {
    return this.currentThing?.drawEachItem(item)
  }
}
core.useElement(Agenda, AgendaElement)


core.heading("La aplicación")
/** La aplicación */
export class ListaDeTareas extends App {
  // sus "tareas" es una nueva agenda
  @prop({ init: () => new Agenda(), early: true })
  accessor tareas!: Agenda

  /** cuántas quedan:  las tareas elegidas con "donde", contadas */
  @derived get cuentaPendiente() {
    return this.tareas.filter((tarea) => tarea.estáPendiente).length
  }

  @drawn draw() {
    return (
      <es-contenedor class="ListaDeTareas">
        <es-menu secundario={true}>
          <es-elemento tipo="encabezado">{`${this.cuentaPendiente} pendientes`}</es-elemento>
          <es-elemento seleccionado={this.tareas.mostrando === "todas"} onClick={() => (this.tareas.mostrando = "todas")} style="cursor:pointer;user-select:none">
            Todas
          </es-elemento>
          <es-elemento seleccionado={this.tareas.mostrando === "pendientes"} onClick={() => (this.tareas.mostrando = "pendientes")} style="cursor:pointer;user-select:none">
            Pendientes
          </es-elemento>
          <es-elemento seleccionado={this.tareas.mostrando === "hechas"} onClick={() => (this.tareas.mostrando = "hechas")} style="cursor:pointer;user-select:none">
            Hechas
          </es-elemento>
        </es-menu>
        {core.drawThing(this.tareas)}
      </es-contenedor>
    )
  }
}
export const listaDeTareas = new ListaDeTareas()

core.heading("Inicio:  tres tareas, una de ellas hecha")
//## Inicio:  tres tareas, una de ellas hecha
listaDeTareas.tareas.mostrando = "todas"
listaDeTareas.tareas.append(new Tarea({ título: "Leer esta guía", hecha: true }))
listaDeTareas.tareas.append(new Tarea({ título: "Marcar una casilla a la derecha" }))
listaDeTareas.tareas.append(new Tarea({ título: "Probar el filtro Pendientes" }))
if (!core.isCarryingOver) listaDeTareas.start()

core.heading("Una prueba")
/** Una prueba */
export function testLaCuentaPendiente() {
  return core.test("test la cuenta pendiente", function testLaCuentaPendiente() {
    core.echoTestAction(`poner la lista a una nueva agenda`)
    const lista = new Agenda()
    core.echoTestAction(`agregar (una nueva tarea con título = "a", hecha = sí) a la lista`)
    lista.append(new Tarea({ título: "a", hecha: true }))
    core.echoTestAction(`agregar (una nueva tarea con título = "b") a la lista`)
    lista.append(new Tarea({ título: "b" }))
    core.expect(lista.filter((tarea) => tarea.estáPendiente).length, `el largo de (tareas en la lista donde está pendiente)`, 1, `1`)
  })
}

core.heading("Pruébalo")
//////////////
// ## Pruébalo
//////////////
// - Marca "Marcar una casilla a la derecha":  la cuenta del menú baja a 1.
// - Haz clic en "Pendientes", luego en "Hechas":  la lista muestra solo las tareas que encajan.
// - Agrega una tarea:  copia una de las líneas "agregar" del Inicio, y cambia su título.
//
// Y después:  Lista de tareas, en los Ejemplos, donde escribes tareas nuevas, las arrastras para ordenarlas,
// y seleccionas varias para cambiarlas todas a la vez.
// -----------
core.installStyles(undefined, `/* File styles.css:  how the list looks -- a menu over the tasks, each a row:  its checkbox, then its title. */¬¬.ListaDeTareas {¬  max-width: 30em;¬  padding-block: 1.5em;¬}¬¬como-funciona-lista-de-tareas-tarea::part(row) {¬  display: flex;¬  align-items: center;¬  gap: 0.75em;¬  padding-block: 0.4em;¬}¬`)
// -----------
if (!core.isCarryingOver) testLaCuentaPendiente()

// each drawable type's tag, for the JSX
declare module "@solidjs/web/types/jsx.js" {
  namespace JSX {
    interface IntrinsicElements {
      /** `TareaElement` */
      "test-project-tarea": HTMLAttributes<HTMLElement> & { [attribute: string]: unknown }
      /** `AgendaElement` */
      "test-project-agenda": HTMLAttributes<HTMLElement> & { [attribute: string]: unknown }
    }
  }
}
