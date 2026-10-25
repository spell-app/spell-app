/*! SPELL: WORDS como-funciona-lista-de-tareas es */
export const words = {
  lang: "es",
  types: {
    Tarea: {
      título: "título",
      hecha: "hecha",
      estáHecha: "está hecha",
      estáPendiente: "está pendiente",
      agenda: "agenda"
    },
    Agenda: {
      mostrando: "mostrando"
    },
    ListaDeTareas: {
      tareas: "tareas",
      cuentaPendiente: "cuenta pendiente"
    }
  },
  messages: {
    "expect-passed": "Como se esperaba, {what} es {expected}",
    "expect-failed": "Inesperado: {what} debería ser {expected} pero en realidad es {actual}",
    "expect-truthy": "verdadero",
    "test-step": "▶️ Ejecutando   {step}",
    "test-threw": "Error en la prueba {test}:",
    "cant-draw": "⚠ {type} no se puede dibujar",
    "confirm-default": "{question} (sí)",
    "drop-event": "soltar-{thing}",
    undo: "Deshacer",
    "undo-step": "Deshacer {step}",
    redo: "Rehacer",
    "redo-step": "Rehacer {step}"
  }
}
