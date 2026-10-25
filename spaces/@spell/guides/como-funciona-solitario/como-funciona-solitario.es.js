/*! SPELL: WORDS como-funciona-solitario es */
export const words = {
  lang: "es",
  types: {
    Carta: {
      rango: "rango",
      palo: "palo",
      valor: "valor",
      color: "color",
      nombre: "nombre",
      jugar: "jugar una carta",
      pila: "pila"
    },
    Mesa: {
      columna: "columna",
      mano: "mano",
      mensaje: "mensaje"
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
