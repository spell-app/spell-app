import { core, Thing, List, App, View, Page, TwoSidedView, ViewableList, h } from "@spell/core"

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
export class Tarea extends View {
  static elementTag = core.defineElement(this, "test-project")

  // su "título" es texto
  static { this.declareProp("título", { type: "text" }) }
  get título() { return this.getProp("título") }
  set título(value) { this.setProp("título", value) }

  // su "hecha" es sí o no
  static { this.declareProp("hecha", { type: "choice" }) }
  get hecha() { return this.getProp("hecha") }
  set hecha(value) { this.setProp("hecha", value) }

  get estáHecha() {
    return this.hecha
  }

  get estáPendiente() {
    return !this.hecha
  }

  // un formulario propio, unido a la tarea:  marcar la casilla cambia su "hecha"
  draw() {
    return h("es-formulario", { value: this },
      h("div", { part: "row" },
        h("es-casilla", { name: "hecha", "aria-label": "Hecha" }),
        h("span", { part: "title" }, () => this.título)
      )
    )
  }

  get agenda() {
    return Agenda.ownerOf(this)
  }
}

core.heading("La agenda:  las tareas, mostradas según su filtro")
/** La agenda:  las tareas, mostradas según su filtro */
export class Agenda extends ViewableList {
  static instanceType = Tarea
  static elementTag = core.defineElement(this, "test-project")

  /** lo que muestra:  todas las tareas, las pendientes, o las hechas */
  // su "mostrando" es una de todas, pendientes o hechas
  static Mostrandos = ["todas", "pendientes", "hechas"]
  static { this.declareProp("mostrando", { oneOf: Agenda.Mostrandos }) }
  get mostrando() { return this.getProp("mostrando") }
  set mostrando(value) { this.setProp("mostrando", value) }

  // cada tarea, salvo que el filtro la oculte:  "devolver nada" no dibuja nada
  drawEachItem(item) {
    if (this.mostrando === "pendientes" && item.estáHecha) return undefined
    if (this.mostrando === "hechas" && item.estáPendiente) return undefined
    return core.drawThing(item)
  }

  static exclusive = true
}


core.heading("La aplicación")
/** La aplicación */
export class ListaDeTareas extends App {
  // sus "tareas" es una nueva agenda
  static { this.declareProp("tareas", { init: () => new Agenda(), early: true }) }
  get tareas() { return this.getProp("tareas") }
  set tareas(value) { this.setProp("tareas", value) }

  /** cuántas quedan:  las tareas elegidas con "donde", contadas */
  get cuentaPendiente() {
    return this.tareas.filter((tarea) => tarea.estáPendiente).length
  }

  draw() {
    return h("es-contenedor", { class: "ListaDeTareas" },
      h("es-menu", { secundario: true },
        h("es-elemento", { tipo: "encabezado" }, () => `${this.cuentaPendiente} pendientes`),
        h("es-elemento", {
          seleccionado: () => this.tareas.mostrando === "todas",
          onClick: () => (this.tareas.mostrando = "todas"),
          style: "cursor:pointer;user-select:none"
        }, "Todas"),
        h("es-elemento", {
          seleccionado: () => this.tareas.mostrando === "pendientes",
          onClick: () => (this.tareas.mostrando = "pendientes"),
          style: "cursor:pointer;user-select:none"
        }, "Pendientes"),
        h("es-elemento", {
          seleccionado: () => this.tareas.mostrando === "hechas",
          onClick: () => (this.tareas.mostrando = "hechas"),
          style: "cursor:pointer;user-select:none"
        }, "Hechas")
      ),
      () => core.drawThing(this.tareas)
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
