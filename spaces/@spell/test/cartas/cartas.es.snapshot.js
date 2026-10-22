/*! SPELL: WORDS cartas es */
export const words = {
  lang: "es",
  types: {
    Carta: {
      rango: "rango",
      palo: "palo",
      color: "color",
      valor: "valor",
      dirección: "dirección",
      estáBocaArriba: "está boca arriba",
      estáBocaAbajo: "está boca abajo",
      esUnaFigura: "es una figura",
      esUnPalo: "es un (palo)",
      esUnRango: "es un (rango)",
      esElRangoDePalos: "es el (rango) de (palos)",
      nombre: "nombre",
      paloCorto: "palo corto",
      rangoCorto: "rango corto",
      direcciónCorta: "dirección corta",
      nombreCorto: "nombre corto",
      estado: "estado",
      voltearBocaArriba: "voltear una carta boca arriba",
      voltearBocaAbajo: "voltear una carta boca abajo",
      darLaVueltaACarta: "dar la vuelta a una carta",
      dibujar: "dibujar una carta",
      pila: "pila"
    },
    Mazo: {
      preparar: "preparar un mazo",
      mostrar: "mostrar un mazo",
      estáPreparado: "está-preparado"
    },
    Pila: {
      color: "color",
      valor: "valor",
      estado: "estado"
    }
  },
  messages: {
    "expect-passed": "Como se esperaba, {what} es {expected}",
    "expect-failed": "Inesperado: {what} debería ser {expected} pero en realidad es {actual}",
    "expect-truthy": "verdadero",
    "test-step": "▶️ Ejecutando   {step}",
    "test-threw": "Error en la prueba {test}:",
    "cant-draw": "⚠ {type} no se puede dibujar",
    "confirm-default": "{question} (sí)"
  }
}
