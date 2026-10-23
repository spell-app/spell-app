import { core, Thing, List, App, Drawable, DrawableList, h } from "@spell/core"

core.heading("Una tarea:  algo por hacer -- en el estilo de esquema:  su nombre, luego lo que es cierto de ella")
///////////////////////////////////////////////////////////////////////////////////////////////////////
// ## Una tarea:  algo por hacer -- en el estilo de esquema:  su nombre, luego lo que es cierto de ella
///////////////////////////////////////////////////////////////////////////////////////////////////////
/** Una cosa dibujable:  cada tarea es un elemento propio en la página, `<lista-de-tareas-tarea>`. */
export class Tarea extends Drawable {
  static elementTag = core.defineElement(this, "test-project")

  // su "título" es texto
  static { this.declareProp("título", { type: "text" }) }
  get título() { return this.getProp("título") }
  set título(value) { this.setProp("título", value) }

  // su "nota" es texto
  static { this.declareProp("nota", { type: "text" }) }
  get nota() { return this.getProp("nota") }
  set nota(value) { this.setProp("nota", value) }

  // su "prioridad" es una de baja, normal o alta
  static Prioridades = ["baja", "normal", "alta"]
  static { this.declareProp("prioridad", { oneOf: Tarea.Prioridades }) }
  get prioridad() { return this.getProp("prioridad") }
  set prioridad(value) { this.setProp("prioridad", value) }

  // su "hecha" es sí o no
  static { this.declareProp("hecha", { type: "choice" }) }
  get hecha() { return this.getProp("hecha") }
  set hecha(value) { this.setProp("hecha", value) }

  /** "la tarea está hecha" */
  get estáHecha() {
    return this.hecha
  }

  /** "la tarea está pendiente" */
  get estáPendiente() {
    return !this.hecha
  }

  /** el color de la etiqueta de su prioridad:  rojo cuando es alta */
  get colorDePrioridad() {
    if (this.prioridad == "alta") return "rojo"
    return "gris"
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  // ## dibujo:  una casilla, su título, y su prioridad -- styles.css la muestra solo cuando no es normal
  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  // un formulario propio, unido a ella:  marcar la casilla, o escribir un título, cambia la tarea
  // - su fila y su título son partes:  styles.css los coloca
  draw() {
    return h("es-formulario", { value: this },
      h("div", { part: "row" },
        h("es-casilla", { name: "hecha", "aria-label": "Hecha" }),
        h("es-entrada", { part: "title", name: "título", "aria-label": "Tarea", transparente: true }),
        h("es-etiqueta", { part: "priority", tamano: "diminuto", color: () => this.colorDePrioridad },
          () => this.prioridad
        )
      )
    )
  }

  static canBeSelected = true

  get agenda() {
    return Agenda.ownerOf(this)
  }
}

// en la página, un clic la selecciona;  mayúsculas y comando (ctrl) seleccionan más,
// así el editor de propiedades junto a la lista las cambia todas a la vez

core.heading("Pruebas")
/** Pruebas */
export function testLasTareas() {
  return core.test("test las tareas", function testLasTareas() {
    core.echoTestAction(`poner la tarea a una nueva tarea con título = "Escribir las pruebas"`)
    const tarea = new Tarea({ título: "Escribir las pruebas" })
    core.expect(tarea.estáPendiente, `la tarea está pendiente`, true, `sí`)
    core.echoTestAction(`poner la hecha de la tarea a sí`)
    tarea.hecha = true
    core.expect(tarea.estáHecha, `la tarea está hecha`, true, `sí`)
  })
}
// -----------
core.heading("Lista de tareas")
/////////////////////
// ## Lista de tareas
/////////////////////
// Las tareas son de este proyecto:  Tarea.
// Este archivo agrega su lista, y la aplicación:  agregar una tarea, filtrar la lista, y editar lo seleccionado.
// Qué hay, de arriba abajo:
//   la agenda:  las tareas, mostradas según el filtro
//   la aplicación:  su menú, el campo de la nueva tarea, la lista y el editor de propiedades
//   inicio
//   pruebas

core.heading("La agenda:  las tareas, cada una un elemento propio dentro de ella")
////////////////////////////////////////////////////////////////////////
// ## La agenda:  las tareas, cada una un elemento propio dentro de ella
////////////////////////////////////////////////////////////////////////
/** una lista dibujable:  `<lista-de-tareas-agenda>`, alrededor de las `<lista-de-tareas-tarea>` de sus tareas */
export class Agenda extends DrawableList {
  static instanceType = Tarea
  static elementTag = core.defineElement(this, "test-project")

  /** lo que muestra:  todas las tareas, las pendientes, o las hechas */
  // su "mostrando" es una de todas, pendientes o hechas
  static Mostrandos = ["todas", "pendientes", "hechas"]
  static { this.declareProp("mostrando", { oneOf: Agenda.Mostrandos }) }
  get mostrando() { return this.getProp("mostrando") }
  set mostrando(value) { this.setProp("mostrando", value) }

  // cada tarea, salvo que el filtro la oculte
  drawEachItem(item) {
    if (this.mostrando == "pendientes" && item.estáHecha) return undefined
    if (this.mostrando == "hechas" && item.estáPendiente) return undefined
    return core.drawThing(item)
  }

  // vacía:  lo dice
  drawItsPlaceholder() {
    return h("div", { part: "placeholder" }, "Nada por hacer")
  }

  static exclusive = true
}

/** una tarea está en una sola agenda a la vez */

core.heading("La aplicación:  su menú, el campo de la nueva tarea, la lista, y el editor de propiedades")
/** La aplicación:  su menú, el campo de la nueva tarea, la lista, y el editor de propiedades */
export class ListaDeTareas extends App {
  // sus "tareas" es una nueva agenda
  static { this.declareProp("tareas", { init: () => new Agenda(), early: true }) }
  get tareas() { return this.getProp("tareas") }
  set tareas(value) { this.setProp("tareas", value) }

  /** lo que tiene el campo de la nueva tarea:  el título de la siguiente */
  // su "borrador" es texto
  static { this.declareProp("borrador", { type: "text" }) }
  get borrador() { return this.getProp("borrador") }
  set borrador(value) { this.setProp("borrador", value) }

  get cuentaPendiente() {
    return this.tareas.filter((tarea) => tarea.estáPendiente).length
  }

  /** el borrador, como una nueva tarea al final de la lista;  el campo se vacía */
  agregarElBorrador() {
    if (this.borrador === "") return
    this.tareas.append(new Tarea({ título: this.borrador, prioridad: "normal" }))
    this.borrador = ""
  }

  quitarLasTareasHechas() {
    this.tareas.removeWhere((tarea) => tarea.estáHecha)
  }

  // su menú, el campo de la nueva tarea, luego la lista junto al editor de propiedades
  // - los botones del menú son iconos, cada uno con su ayuda
  // - el editor de propiedades edita todas las tareas seleccionadas a la vez:  una propiedad en la que no
  //   coinciden muestra "Varios"
  draw() {
    return h("es-contenedor", { class: "TaskList" },
      h("es-menu",
        h("es-elemento", { tipo: "encabezado" }, "Lista de tareas"),
        h("es-elemento", () => `${this.cuentaPendiente} pendientes`),
        h("es-menu", { posicion: "derecha" },
          h("es-elemento", {
            "aria-label": "Todas",
            seleccionado: () => this.tareas.mostrando == "todas",
            onClick: () => (this.tareas.mostrando = "todas"),
            style: "cursor:pointer;user-select:none"
          },
            h("es-icono", { name: "list" }),
            h("es-emergente", { contenido: "Todas", invertido: true, tamano: "pequeño" })
          ),
          h("es-elemento", {
            "aria-label": "Pendientes",
            seleccionado: () => this.tareas.mostrando == "pendientes",
            onClick: () => (this.tareas.mostrando = "pendientes"),
            style: "cursor:pointer;user-select:none"
          },
            h("es-icono", { name: "square outline" }),
            h("es-emergente", { contenido: "Pendientes", invertido: true, tamano: "pequeño" })
          ),
          h("es-elemento", {
            "aria-label": "Hechas",
            seleccionado: () => this.tareas.mostrando == "hechas",
            onClick: () => (this.tareas.mostrando = "hechas"),
            style: "cursor:pointer;user-select:none"
          },
            h("es-icono", { name: "check square outline" }),
            h("es-emergente", { contenido: "Hechas", invertido: true, tamano: "pequeño" })
          ),
          h("es-elemento", {
            "aria-label": "Quitar las hechas",
            onClick: () => this.quitarLasTareasHechas(),
            style: "cursor:pointer;user-select:none"
          },
            h("es-icono", { name: "trash alternate outline" }),
            h("es-emergente", { contenido: "Quitar las tareas hechas", invertido: true, tamano: "pequeño" })
          )
        )
      ),
      h("es-formulario", { value: this },
        h("div", { class: "NewTask" },
          h("es-entrada", { name: "borrador", marcador: "Algo por hacer", "aria-label": "Nueva tarea", fluido: true }),
          h("es-boton", {
            primario: true,
            disabled: () => this.borrador === "",
            onClick: () => this.agregarElBorrador(),
            style: "cursor:pointer;user-select:none"
          }, "Agregar")
        )
      ),
      h("es-cuadricula", { columnas: "2", apilable: true },
        () => core.drawThing(this.tareas),
        h("es-editor-propiedades", {
          etiqueta: "Tareas seleccionadas",
          esquema: "lista-de-tareas-tarea",
          "prop:value": () => this.tareas.selection
        },
          h("es-propiedad", { name: "título" }),
          h("es-propiedad", { name: "prioridad" }),
          h("es-propiedad", { name: "hecha" }),
          h("es-propiedad", { name: "nota" })
        )
      )
    )
  }
}
export const listaDeTareas = new ListaDeTareas()

core.heading("Inicio")
//## Inicio
listaDeTareas.tareas.mostrando = "todas"
listaDeTareas.tareas.append(new Tarea({
  título: "Escribir el ejemplo Lista de tareas",
  prioridad: "alta",
  hecha: true
}))
listaDeTareas.tareas.append(new Tarea({ título: "Enseñarle a dibujar", prioridad: "normal" }))
listaDeTareas.tareas.append(new Tarea({ título: "Seleccionar unas tareas, y editarlas juntas", prioridad: "normal" }))
listaDeTareas.tareas.append(new Tarea({ título: "Arrastrar tareas para reordenarlas", prioridad: "baja" }))
if (!core.isCarryingOver) listaDeTareas.start()

core.heading("Pruebas")
/** Pruebas */
export function testElFiltro() {
  return core.test("test el filtro", function testElFiltro() {
    core.echoTestAction(`poner la lista a una nueva agenda`)
    const lista = new Agenda()
    core.echoTestAction(`agregar (una nueva tarea con título = "a", hecha = sí) a la lista`)
    lista.append(new Tarea({ título: "a", hecha: true }))
    core.echoTestAction(`agregar (una nueva tarea con título = "b") a la lista`)
    lista.append(new Tarea({ título: "b" }))
    core.expect(lista.filter((tarea) => tarea.estáPendiente).length, `el largo de (tareas en la lista donde está pendiente)`, 1, `1`)
  })
}
// -----------
core.installStyles(undefined, `/* File styles.css:  how the task list looks.¬   - The list and each task are elements of their own, so these rules reach them all:¬     - the list, <lista-de-tareas-agenda>, and its tasks inside it, each a <lista-de-tareas-tarea>¬     - inside a task, by its parts:  its row, ::part(row);  its title, ::part(title);  its priority label, ::part(priority)¬     - an empty list's placeholder, which it draws itself, by its part:  ::part(placeholder) */¬¬/****************¬ * The app:  its menu, the new task's field, then the list beside the property editor¬ ****************/¬¬.TaskList {¬  padding-block: 1em;¬}¬¬/* the field and its button on one line */¬.NewTask {¬  display: flex;¬  gap: 0.5em;¬  margin-block: 1em;¬}¬¬.NewTask > es-entrada {¬  flex: 1;¬}¬¬/****************¬ * The list:  one task a line¬ ****************/¬¬lista-de-tareas-agenda {¬  display: flex;¬  flex-direction: column;¬  gap: 0.25em;¬}¬¬lista-de-tareas-agenda::part(placeholder) {¬  padding: 1em;¬  color: grey;¬  text-align: center;¬}¬¬/****************¬ * A task:  its checkbox, its title, and its priority -- shown only when it isn't normal¬ ****************/¬¬lista-de-tareas-tarea {¬  display: block;¬  padding: 0.25em 0.5em;¬  border-radius: 0.3em;¬}¬¬/* its checkbox, its title filling the line, then its priority */¬lista-de-tareas-tarea::part(row) {¬  display: flex;¬  align-items: center;¬  gap: 0.5em;¬}¬¬lista-de-tareas-tarea::part(title) {¬  flex: 1;¬}¬¬lista-de-tareas-tarea::part(priority) {¬  flex: none;¬}¬¬lista-de-tareas-tarea[prioridad="normal"]::part(priority),¬lista-de-tareas-tarea:not([prioridad])::part(priority) {¬  display: none;¬}¬¬/* selected:  a soft purple band, in place of the outline every selected thing has */¬lista-de-tareas-tarea:state(selected) {¬  --spell-selected-outline: none;¬  background: rgb(150 80 255 / 0.12);¬}¬¬/* done:  its title fades */¬lista-de-tareas-tarea[hecha] {¬  opacity: 0.6;¬}¬`)
// -----------
if (!core.isCarryingOver) testLasTareas()
if (!core.isCarryingOver) testElFiltro()
